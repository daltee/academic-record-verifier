# Academic Record Verifier

Anti-forgery transcript verification API for academic institutions.

Staff can issue digitally protected transcripts with a unique verification hash. Anyone can then verify whether a transcript is **Authentic**, **Invalid**, or **Revoked**.

---

## Features

- Staff authentication with JWT
- Issue transcripts with a unique HMAC verification hash
- Public verification endpoint
- Revoke transcripts (staff only)
- Input validation and clear error responses
- Live MongoDB Atlas database
- Simple web frontend for verification and staff access
- Postman collections for testing

---

## Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Backend  | Node.js, Express.js     |
| Database | MongoDB Atlas           |
| Auth     | JSON Web Tokens (JWT)   |
| Frontend | HTML, CSS, JavaScript   |
| Testing  | Postman                 |

---

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- A MongoDB Atlas account (or local MongoDB)

### Installation

```bash
git clone https://github.com/daltee/academic-record-verifier.git
cd academic-record-verifier/backend
npm install
cp .env.example .env
```

Edit `.env` and set:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
SIGNATURE_SECRET=another_secret_key
```

### Run the server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

Open `frontend/index.html` in a browser for the verification UI.

---

## Demo Staff Login

| Field    | Value                   |
| -------- | ----------------------- |
| Email    | `registrar@must.ac.ug`  |
| Password | `staff123`              |

---

## API Endpoints

| Method | Endpoint                        | Auth   | Description              |
| ------ | ------------------------------- | ------ | ------------------------ |
| GET    | `/api/health`                   | Public | Health check             |
| POST   | `/api/auth/login`               | Public | Staff login (returns JWT)|
| POST   | `/api/transcripts/verify`       | Public | Verify a transcript      |
| POST   | `/api/transcripts/issue`        | JWT    | Issue a new transcript   |
| PATCH  | `/api/transcripts/revoke/:id`   | JWT    | Revoke a transcript      |
| GET    | `/api/transcripts/:id`          | Public | Get transcript by ID     |

More request examples and negative test cases are in [`docs/postman/`](docs/postman/).

---

## Project Structure

```
academic-record-verifier/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js
│       ├── config/db.js
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/
├── frontend/
│   ├── index.html
│   ├── signup.html
│   ├── script.js
│   └── style.css
├── docs/postman/
├── .gitignore
└── README.md
```

---

## License

This project is for educational purposes.
