# Postman collections

This folder contains Postman collections for testing the Transcript Verification API.

## Collections

| File | Purpose |
| --- | --- |
| `Academic-Record-Verifier.postman_collection.json` | Successful (happy-path) requests |
| `transcript-verification.postman_collection.json` | Invalid / negative test cases |

## Import and run

1. Start the backend from `backend/`:
   ```bash
   npm install
   cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET
   npm run dev
   ```
2. (Optional) Seed sample data:
   ```bash
   npm run seed
   ```
3. In Postman, choose **Import** and select one or both collection files.
4. If the API is not at `http://localhost:5000`, edit the collection variable `baseUrl`.
5. For protected routes (issue / revoke), first call **Login** and copy the returned JWT into the `token` collection variable (or Authorization header).

## API contract

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/health` | GET | Public | Health check |
| `/api/auth/login` | POST | Public | Staff login → JWT |
| `/api/transcripts/verify` | POST | Public | Verify registration number + hash |
| `/api/transcripts/issue` | POST | Bearer JWT | Issue a new transcript |
| `/api/transcripts/revoke/:id` | PATCH | Bearer JWT | Revoke a transcript |
| `/api/transcripts/:id` | GET | Public | Get transcript by ID |

### Verify body

```json
{
  "registrationNumber": "2021/BSE/001/PS",
  "verificationHash": "ABC123..."
}
```

(`verificationCode` is also accepted as an alias for `verificationHash`.)

### Expected status codes

| Case | Status |
| --- | --- |
| Missing / blank / wrong-type fields | `400` |
| Valid credentials, unmatched record | `404` |
| Authentic transcript | `200` + `status: "AUTHENTIC"` |
| Revoked transcript | `400` + `status: "REVOKED"` |
| Unauthorized staff action | `401` |
