import axios from "axios";

const getMpesaEnvironment = () => {
  const environment = (process.env.MPESA_ENV || "sandbox").trim().toLowerCase();

  if (!['sandbox', 'production'].includes(environment)) {
    throw new Error('MPESA_ENV must be either "sandbox" or "production"');
  }

  return environment;
};

const getMpesaBaseUrl = () =>
  getMpesaEnvironment() === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const getRequiredEnv = (name) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required M-Pesa configuration: ${name}`);
  }
  return value;
};

const getTimestamp = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const dateParts = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return (
    dateParts.year +
    dateParts.month +
    dateParts.day +
    dateParts.hour +
    dateParts.minute +
    dateParts.second
  );
};

const createStkPassword = (shortcode, passkey, timestamp) =>
  Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

export const getMpesaAccessToken = async () => {
  const consumerKey = getRequiredEnv("MPESA_CONSUMER_KEY");
  const consumerSecret = getRequiredEnv("MPESA_CONSUMER_SECRET");

  try {
    const response = await axios.get(
      `${getMpesaBaseUrl()}/oauth/v1/generate`,
      {
        params: { grant_type: "client_credentials" },
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
        timeout: 15000,
      },
    );

    if (!response.data?.access_token) {
      throw new Error("Daraja OAuth response did not contain an access token");
    }

    console.log("M-Pesa token generated successfully");
    return response.data.access_token;
  } catch (error) {
    console.error("M-Pesa access token request failed:", {
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const initiateStkPush = async ({
  phoneNumber,
  amount,
  accountReference,
  transactionDescription,
  callbackUrl,
}) => {
  const shortcode = getRequiredEnv("MPESA_SHORTCODE");
  const passkey = getRequiredEnv("MPESA_PASSKEY");

  if (!/^254\d{9}$/.test(String(phoneNumber))) {
    throw new Error("Phone number must be a valid Kenyan number beginning with 254");
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 1) {
    throw new Error("M-Pesa amount must be at least KSh 1");
  }

  let parsedCallbackUrl;
  try {
    parsedCallbackUrl = new URL(callbackUrl);
  } catch {
    throw new Error("MPESA_CALLBACK_URL must be a valid HTTPS URL");
  }

  if (parsedCallbackUrl.protocol !== "https:") {
    throw new Error("MPESA_CALLBACK_URL must use HTTPS");
  }

  const timestamp = getTimestamp();
  const password = createStkPassword(shortcode, passkey, timestamp);
  const accessToken = await getMpesaAccessToken();

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(numericAmount),
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: callbackUrl,
    AccountReference: String(accountReference).slice(0, 32),
    TransactionDesc: String(transactionDescription || "E-commerce order").slice(0, 100),
  };

  try {
    // Never log the full payload: Password is derived from the shortcode and passkey.
    console.log("Initiating STK Push:", {
      BusinessShortCode: shortcode,
      Amount: payload.Amount,
      AccountReference: payload.AccountReference,
      callbackHost: parsedCallbackUrl.host,
      environment: getMpesaEnvironment(),
    });

    const response = await axios.post(
      `${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      },
    );

    console.log("STK Push response:", {
      ResponseCode: response.data?.ResponseCode,
      ResponseDescription: response.data?.ResponseDescription,
      MerchantRequestID: response.data?.MerchantRequestID,
      CheckoutRequestID: response.data?.CheckoutRequestID,
    });

    return response.data;
  } catch (error) {
    console.error("M-Pesa STK Push request failed:", {
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const queryStkPushStatus = async (checkoutRequestId) => {
  if (!checkoutRequestId || typeof checkoutRequestId !== "string") {
    throw new Error("A valid CheckoutRequestID is required for STK Query");
  }

  const shortcode = getRequiredEnv("MPESA_SHORTCODE");
  const passkey = getRequiredEnv("MPESA_PASSKEY");
  const timestamp = getTimestamp();
  const password = createStkPassword(shortcode, passkey, timestamp);
  const accessToken = await getMpesaAccessToken();

  try {
    const response = await axios.post(
      `${getMpesaBaseUrl()}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    // Do not treat ResponseCode=0 by itself as proof of payment. The route
    // must also inspect the returned ResultCode and match it to the callback.
    return response.data;
  } catch (error) {
    console.error("M-Pesa STK Query failed:", {
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};
