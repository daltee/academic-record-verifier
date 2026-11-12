# Group C — Anti-Forgery Transcript Verification API

A secure Transcript Verification system for **Mbarara University of Science and Technology (MUST)**. Academic Registrar staff issue digitally protected transcripts with a unique verification hash. Employers and other institutions can instantly check whether a transcript is **Authentic**, **Invalid**, or **Revoked**.

**Course:** SWE2106 Internet Technologies and Web Design  
**Etivity 5:** Front-end and Backend Development leveraging JavaScript

---

## Features

- Staff login with JWT (demo credentials included)
- Issue transcript → unique HMAC verification hash generated
- Public verification endpoint (registration number + hash)
- Revoke transcripts (staff only)
- Input validation and clear API error responses
- Live MongoDB connection (Atlas or local)
- Simple web frontend for verification and staff issuance
- Documented Postman collections (valid + invalid cases)
- Seed script for sample data

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JSON Web Tokens (JWT) |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Testing | Postman |

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
│       ├── controllers/transcriptController.js
│       ├── middleware/auth.js
│       ├── middleware/validate.js
│       ├── models/Transcript.js
│       ├── routes/authRoutes.js
│       ├── routes/transcriptRoutes.js
│       ├── utils/signature.js
│       └── seed.js
├── frontend/
│   ├── index.html          # Public verification page
│   ├── signup.html         # Staff login + issue form
│   ├── script.js
│   ├── style.css
│   └── MUST Badge.jpeg
├── docs/postman/           # Postman collections + docs
├── .gitignore
└── README.md
```

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/daltee/academic-record-verifier.git
cd academic-record-verifier/backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

- `MONGODB_URI` — MongoDB Atlas connection string (or local)
- `JWT_SECRET` — any strong random string
- `SIGNATURE_SECRET` — secret used for hash generation

### 3. Seed sample data (optional)

```bash
npm run seed
```

This creates a few sample transcripts and prints their verification hashes so you can test immediately.

### 4. Start the API

```bash
npm run dev
```

Server runs at `http://localhost:5000`. Health check: `GET /api/health`.

### 5. Open the frontend

Open `frontend/index.html` in a browser (or serve the folder with any static server).

- **Verify page:** enter a registration number + hash
- **Staff Access:** login with demo credentials, then issue new transcripts

**Demo staff login**

- Email: `registrar@must.ac.ug`
- Password: `staff123`

---

## Main API Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/login` | Public | Staff login → JWT |
| POST | `/api/transcripts/verify` | Public | Verify transcript |
| POST | `/api/transcripts/issue` | JWT | Issue transcript |
| PATCH | `/api/transcripts/revoke/:id` | JWT | Revoke transcript |
| GET | `/api/transcripts/:id` | Public | Get by ID |

Full request/response details and negative tests are in [`docs/postman/`](docs/postman/).

---

## Team Roles (Group C)

| Member | Role |
| --- | --- |
| Mutebi Dalton | Team Lead, Repo & Frontend Integration |
| Mukisa Timothy | Backend Lead – Express & Routes |
| Ankunda Asaph Graham | Authentication, JWT & Roles |
| Ataho Aprinal | Issuing Transcripts & Signature |
| Ssekajigo Elvis Mark | Verification Endpoint |
| Abaho Paul | Database, Schema & Seed Data |
| Namukasa Fahiimah | Input Validation & Error Handling |
| Mugisha Fahadi | Postman – Valid Requests |
| Lusoke Atka Yursa | Postman – Invalid Requests & Docs |
| Batabaine Hillary Austin | Frontend – Verify Page & Staff UI |
| Ninsiima Caroline | Proposal, README & Presentation |

---

## License

Academic project for educational purposes — Group C, Faculty of Computing and Informatics, MUST.
