# MERN E-commerce Project

React + Vite frontend with a Node.js/Express/Mongoose backend and Safaricom Daraja STK Push integration.

## 1. Requirements

- Node.js supported by the selected frontend toolchain
- pnpm
- A MongoDB connection string (MongoDB Atlas is suitable)
- Daraja sandbox credentials for M-Pesa development

## 2. Backend setup

```bash
cd E-commerce/backend
cp .env.example .env
pnpm install
pnpm dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if needed. Fill in `.env` with your actual MongoDB URI, JWT secret, and Daraja sandbox credentials. Do not commit `.env`.

The backend runs on port `5000` by default. `/healthz` reports API/database readiness.

## 3. Frontend setup

Open a second terminal:

```bash
cd E-commerce/frontend
cp .env.example .env
pnpm install
pnpm dev
```

The local frontend is normally served at `http://localhost:5173`. The frontend reads the backend base URL from `VITE_API_BASE_URL`; for deployment, set it to the backend's HTTPS URL ending in `/api`.

## 4. M-Pesa workflow

1. The authenticated customer creates an order.
2. The customer submits a Kenyan phone number in `254XXXXXXXXX` format.
3. The backend confirms order ownership, calls Daraja STK Push, validates the acceptance response, and stores `MerchantRequestID`, `CheckoutRequestID`, and the phone number.
4. Daraja calls `POST /api/mpesa/callback`.
5. The backend matches both request IDs. Failed/cancelled callbacks remain unpaid. A successful callback is independently queried through Daraja, and the amount, phone, receipt number, and transaction date are validated before the order is marked paid.
6. STK Push initiation alone never marks an order paid.

Keep `MPESA_ENV=sandbox` for school-project testing. A successful simulated callback verifies your application's state transition only; it is not evidence of an actual Safaricom payment.

## 5. Local-only mock callback test

The mock mode is disabled by default. For a temporary local Postman test only:

1. Set `NODE_ENV=development`, `MPESA_MOCK_MODE=true`, and a private `MPESA_MOCK_SECRET` in backend `.env`.
2. Restart the backend.
3. POST a valid simulated callback to `http://localhost:5000/api/mpesa/callback` with the header `x-mock-callback-secret` set to the exact secret, and ensure the request IDs, amount and phone correspond to the test order.
4. Verify the order fields in MongoDB.
5. Immediately set `MPESA_MOCK_MODE=false` and restart the backend.

Mock mode is rejected unless `NODE_ENV=development`, and callbacks require the secret while mock mode is enabled. Do not enable it on a public deployment: while enabled, genuine callbacks without the secret will be rejected.

## 6. Important deployment settings

- Set `NODE_ENV=production`, a strong private `JWT_SECRET`, `MONGO_URI`, and `CORS_ORIGINS` to the exact frontend origin(s).
- Use the backend HTTPS URL as the public callback endpoint, not a temporary ngrok URL.
- Do not expose an endpoint that returns the OAuth bearer token.
- Keep Daraja consumer credentials and passkey out of source control and logs.
- Use `MPESA_ENV=production` only after Safaricom has issued production credentials and the business shortcode/passkey required for live payments. Never use the sandbox shortcode/passkey with production endpoints.
- Uploaded images currently use local disk storage. Choose persistent storage before deploying to a host with an ephemeral filesystem.
- Review stock handling and concurrency, rate limiting, actual-image signature validation, and pending-payment reconciliation before taking live payments.

## 7. Dependency update required before deployment

The saved frontend lockfile currently resolves Vite `8.3.0`. The published Vite security advisory GHSA-rq7h-c2jc-7f22 lists `8.3.0` through `8.3.2` as affected and `8.3.3` as patched. The environment used to prepare this archive could not reach the package registry, so its lockfile could not be regenerated safely. Before deployment, from `E-commerce/frontend`, run:

```bash
pnpm up vite@8.3.4
pnpm install
pnpm lint
pnpm build
```

Commit the updated `package.json` and `pnpm-lock.yaml` together. Do not rely on a stale lockfile or deploy the Vite `8.3.0` resolution. Advisory: https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22

## 8. Checks

From `E-commerce/frontend`:

```bash
pnpm lint
pnpm build
```

From `E-commerce/backend`, syntax-check the route/service/server with:

```bash
node --check server.js
node --check routes/mpesaRoutes.js
node --check services/mpesaService.js
```

Also perform the manual registration/login, order ownership, admin authorization, product create/update/delete, insufficient-stock, invalid-phone, duplicate pending STK, failed callback, mismatched callback metadata, and successful payment reconciliation tests before deployment.
