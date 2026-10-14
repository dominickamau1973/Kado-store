# Deployment update status

Prepared from the archived E-commerce project and the newer M-Pesa callback code discussed in the conversation.

## Changes applied

- Replaced `backend/routes/mpesaRoutes.js` with the newer STK Push and callback flow.
- Removed the public `GET /api/mpesa/token` endpoint so it no longer returns a bearer token to any caller.
- Added phone normalization/validation, order ownership checks, duplicate pending-request protection, Daraja request-ID checks, callback/query result comparison, amount/phone/receipt/date validation, and an atomic conditional update that avoids duplicate paid updates.
- Added `queryStkPushStatus()` to `backend/services/mpesaService.js`; it queries Daraja independently before a real callback can mark an order paid.
- Added `MPESA_ENV=sandbox|production` endpoint selection. Sandbox remains the default; production requires real production credentials and passkey.
- Removed logging of the full STK Push payload because its `Password` field is derived from the shortcode/passkey. Callback logging was reduced to avoid dumping all metadata and phone details.
- Added development-only mock callback support, protected by `MPESA_MOCK_SECRET`, and blocked STK initiation while mock mode is on. Mock mode is disabled by default and rejected unless `NODE_ENV=development`.
- Added `mpesaPhoneNumber` to the Order schema. Without this field Mongoose would discard the phone number that the callback must validate.
- Fixed product creation to validate fields and return HTTP 201 with the created product instead of saving and leaving the request open.
- Added stricter order input validation, whole-number quantities, duplicate product-line aggregation, server-derived prices, and a basic stock-availability check.
- Changed frontend API configuration to use `VITE_API_BASE_URL`; the authentication service now reuses the shared Axios client.
- Hardened basic server configuration: explicit CORS allowlist, request body limit, security headers, database-before-listen startup, `/healthz` readiness endpoint, required MongoDB/JWT configuration, and removal of the process-wide DNS override.
- Added `.env.example` files, a root `.gitignore`, setup instructions and a deployment checklist. No real `.env` file or credentials were included.
- Removed the unrelated first YAML document from the backend lockfile, leaving one valid YAML document for the backend dependency lock.

## Checks run in this environment

| Check | Result |
|---|---|
| `node --check` for all 16 backend JavaScript files | PASS |
| Parse all 21 frontend JavaScript/JSX files with the installed TypeScript parser | PASS; zero syntax diagnostics |
| Resolve 38 relative frontend import paths | PASS; zero missing targets |
| Parse backend `pnpm-lock.yaml` | PASS; one YAML document remains |
| Match M-Pesa route imports to service exports | PASS by source inspection; `queryStkPushStatus` is exported |
| Inspect project for a checked-in `.env` or obvious embedded API/database credential | No `.env` is included; examples contain placeholders only |
| Frontend production build and ESLint | NOT RUN; dependencies were not complete in the archive and this environment could not reach the package registry |
| API/MongoDB integration tests | NOT RUN; no runtime `.env` or connected MongoDB/Daraja environment was available |
| Successful sandbox Daraja transaction | NOT CONFIRMED; earlier callbacks returned 1032/1037. The successful callback test was a local mock only |

## Remaining issues before public deployment

1. **Frontend Vite lock resolution:** `frontend/pnpm-lock.yaml` currently resolves Vite 8.3.0. The published Vite advisory GHSA-rq7h-c2jc-7f22 lists 8.3.0–8.3.2 as affected and 8.3.3 as patched. The package registry was unreachable in this environment, so the frontend lockfile could not be safely regenerated. On a machine with registry access, run `cd frontend && pnpm up vite@8.3.4 && pnpm install`, then commit the updated manifest/lockfile and run lint/build. Do not deploy using the current Vite 8.3.0 lock resolution.
2. **Stock consistency:** Order creation now validates quantities and checks current stock, but it does not reserve/decrement stock atomically. Concurrent orders can still oversell and stock is not automatically decremented after payment. Implement a reservation/fulfilment policy before live sales.
3. **Upload validation/storage:** The current upload middleware checks the claimed MIME type, not the binary signature. Verify image signatures and use persistent storage on hosts with ephemeral disks.
4. **Operational protections:** Add rate limiting for login/registration, test the application with a clean dependency install, run a full dependency audit, configure production `CORS_ORIGINS`, `MONGO_URI`, and a strong `JWT_SECRET`, and add a reconciliation process for successful payments with missed/failed callbacks.
5. **Actual payment status:** A Postman mock callback only demonstrates the local order-state transition. It is not proof of a successful Safaricom payment. Keep `MPESA_MOCK_MODE=false` except for an intentional local Postman test. The current sandbox result `1037` still means Daraja did not complete/reach the test transaction; it does not demonstrate a successful payment.
6. **Previously created orders:** Orders created before `mpesaPhoneNumber` was added may not have the saved expected phone number. Use a fresh development order when testing the updated route.

## Before starting the next test

1. Copy `backend/.env.example` to `backend/.env` and fill in your own private values.
2. Keep `MPESA_ENV=sandbox` and `MPESA_MOCK_MODE=false` for normal Daraja testing.
3. Use `MPESA_MOCK_MODE=true` only for the local Postman mock callback path. Restart the backend after changing environment variables, and then turn mock mode off again.
4. After the dependencies can be installed, run `pnpm check` in the backend, and `pnpm lint` plus `pnpm build` in the frontend.
