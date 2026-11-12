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
- **Live MongoDB Atlas** database
- **Public API** (deployable on Render)
- Simple web frontend for verification and staff issuance
- Documented Postman collections (valid + invalid cases)
- Seed script for sample data

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (live) |
| Auth | JSON Web Tokens (JWT) |
| Frontend | HTML, CSS, Vanilla JavaScript (Vercel) |
| Hosting | Render (API) + Vercel (frontend) |
| Testing | Postman |

---

## Public deployment (live API + live DB)

Anyone on the internet can use the system once the backend is deployed and the frontend points to it.

### 1. MongoDB Atlas (live database)

You already have an Atlas cluster. Confirm:

1. **Network Access** → allow `0.0.0.0/0` (or at least Render’s outbound IPs) so the cloud API can connect.
2. **Database User** credentials match the URI in `.env`.
3. Connection string looks like:
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/transcript-verifier?retryWrites=true&w=majority`

### 2. Deploy the API on Render (free)

1. Go to [https://render.com](https://render.com) and sign in with GitHub.
2. **New → Blueprint** (or Web Service) and connect `daltee/academic-record-verifier`.
3. If using the included `render.yaml`:
   - Root directory is already set to `backend`
   - Build: `npm install`
   - Start: `npm start`
4. Set **Environment Variables** in the Render dashboard (do not commit these):

   | Key | Value |
   | --- | --- |
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | any long random string |
   | `JWT_EXPIRES_IN` | `1d` |
   | `SIGNATURE_SECRET` | another random string |
   | `NODE_ENV` | `production` |

5. Deploy. When it is live you get a URL like:
   `https://academic-record-verifier.onrender.com`
6. Test: open `https://YOUR-SERVICE.onrender.com/api/health` — you should see JSON with `"success": true`.

**Note:** Free Render services sleep after ~15 minutes of inactivity. The first request after sleep can take 30–60 seconds.

### 3. Point the frontend at the public API

Edit `frontend/config.js`:

```js
PRODUCTION_API_BASE: 'https://YOUR-SERVICE.onrender.com/api',
```

Commit, push, and redeploy the Vercel frontend (or let Vercel auto-deploy from `main`).

Local development still uses `http://localhost:5000/api` automatically.

### 4. Seed data against the live database

From your machine (with the same `MONGODB_URI` in `backend/.env`):

```bash
cd backend
npm run seed
```

This writes sample transcripts into Atlas. Use the printed registration numbers + hashes on the live site.

---

## Local Quick Start

```bash
git clone https://github.com/daltee/academic-record-verifier.git
cd academic-record-verifier/backend
npm install
cp .env.example .env   # fill MONGODB_URI, JWT_SECRET, SIGNATURE_SECRET
npm run seed           # optional sample data
npm run dev            # http://localhost:5000
```

Open `frontend/index.html` in a browser.

**Demo staff login**

- Email: `registrar@must.ac.ug`
- Password: `staff123`

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
│   ├── config.js           # API base URL (local vs production)
│   ├── script.js
│   ├── style.css
│   └── MUST Badge.jpeg
├── docs/postman/
├── render.yaml             # Render Blueprint for public API
├── .gitignore
└── README.md
```

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
