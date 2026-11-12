# Postman verification tests

This folder contains a Postman collection for negative tests of the transcript verification API.

## Import and run

The backend server and verification route are currently empty, so the collection cannot yet be run against this repository. Once `POST /api/verify` is implemented:

1. Configure the backend environment and database as required by its implementation.
2. Start the backend from `backend/` with `npm start`.
3. In Postman, choose **Import** and select `transcript-verification.postman_collection.json`.
4. If the API is not running at `http://localhost:5000`, edit the collection's `baseUrl` variable.
5. Run **Academic Record Verifier - Invalid Requests**.

The collection contains requests for missing fields, blank values, wrong field types, malformed JSON, and a well-formed request that does not match a record. Its test scripts check the expected HTTP status codes.

## API contract used by this collection

The verification form identifies the inputs as a registration number and a verification code/hash, and its frontend placeholder points to `POST /api/verify`. The collection therefore sends JSON in this shape:

```json
{
  "registrationNumber": "2021/BSE/001",
  "verificationCode": "code-or-hash-from-transcript"
}
```

The expected responses are:

| Case | Expected status |
| --- | --- |
| Missing, blank, wrong-type fields, or malformed JSON | `400 Bad Request` |
| Well-formed values that do not match a record | `404 Not Found` |

The invalid-record response should not include transcript data. These requests describe a proposed contract, not verified backend behavior. Align the route, field names, and status codes with the backend before treating a failing test as a regression.
