# **Group C Anti-Forgery Transcript Verification API**
This project aims to make it easier for employers and other authorized users to verify academic transcripts issued by Mbarara University of Science and Technology (MUST). It helps identify fake or altered transcripts by checking the information provided against official academic records.

## Project Overview
The Transcript Verification API is a system designed to help confirm whether academic transcripts are genuine. It aims to reduce the use of forged or changed academic documents by allowing authorized users to verify student academic records.

## Current Project Development
The project currently includes:
- A frontend verification page built with HTML, CSS and JavaScript.
- A backend API developed using Node.js and Express.
- Basic security features and environment configuration.
- A documentation folder containing project files.

 ## Project Objectives
The main objectives of this project are to:
- Verify the authenticity of academic transcripts.
- Reduce the use of fake or altered academic records.
- Allow employers and authorized users to check student academic information.
- Develop an API for issuing and verifying transcripts.
- Provide a simple and secure way to confirm academic records.

 ## Main Features
The system is being developed with the following features:
- A transcript verification form.
- Registration number and verification code fields.
- A staff access page.
- An API health check endpoint (`/api/health`).
- Backend support for issuing transcripts.
- Backend support for verifying transcripts.
- Backend support for retrieving transcript information.
- Basic security features to protect the application.

 ## Technologies Used
### Frontend
- HTML
- CSS
- JavaScript
### Backend
- Node.js
- Express.js
### Database
- MongoDB
### Other Tools and Libraries
- JWT for authentication support.
- bcryptjs for password hashing.
- dotenv for managing environment variables.
- Helmet for security headers.
- CORS for handling cross-origin requests.
- Morgan for request logging.

 ## Project Structure
The project is organized into the following folders:
- `frontend/` – Contains the website files.
- `backend/` – Contains the server and API files.
- `docs/` – Contains project documentation.

 ## System Requirements
To run the project, you need:
- Node.js installed on your computer.
- npm (Node Package Manager).
- A modern web browser.
- MongoDB, either locally or through MongoDB Atlas.
- A properly configured `.env` file.

 ## Installation and Setup
Follow these steps to set up the project:
1. Clone the repository from GitHub.
2. Open the project folder in your terminal.
3. Navigate to the backend folder:

 `cd backend`

4. Install the required dependencies:

   `npm install`

5. Configure the environment variables in your `.env` file.
6. Start the server using the start command provided in `package.json`.

## Postman verification tests

The Postman collection for invalid transcript verification requests and instructions for importing and running it are in [`docs/postman/README.md`](docs/postman/README.md). The collection currently documents the proposed `POST /api/verify` contract; the backend endpoint must be implemented and aligned with that contract before the tests can pass.
