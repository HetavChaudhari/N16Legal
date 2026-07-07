# N16Legal — Legal Consultancy Platform

A full-stack (MERN) web application for a law firm. Visitors can browse verified lawyers and book consultations with email/phone OTP verification. Clients, lawyers, and admins each get a role-based dashboard.

## Features

- Browse and search lawyers by name or specialization
- Book appointments as a guest or logged-in client (email + phone OTP verification)
- Client dashboard: track appointment status, leave reviews for completed consultations
- Lawyer dashboard: approve / reject / complete appointment requests (client gets an email)
- Admin dashboard: platform stats, add lawyers, verify lawyer accounts
- JWT authentication with role-based access control
- Security middleware: helmet, rate limiting, NoSQL-injection & XSS sanitization
- Light / dark theme toggle

## Tech Stack

| Layer    | Technology                                                          |
| -------- | ------------------------------------------------------------------- |
| Frontend | React 19, Vite, React Router 7, Axios, react-hot-toast              |
| Backend  | Node.js, Express 4                                                   |
| Database | MongoDB (Mongoose)                                                   |
| Auth     | JWT + bcryptjs                                                       |
| Email    | Nodemailer (SMTP; falls back to console logging if not configured)   |

## Project Structure

```
N16Legal/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # Navbar, Footer, ProtectedRoute
│       ├── context/        # AuthContext (JWT + user state)
│       ├── layouts/        # MainLayout
│       ├── pages/          # Home, About, Lawyers, Booking, Login, dashboards/
│       ├── services/       # Axios instance with JWT interceptor
│       └── CSS/            # Stylesheets
└── server/                 # Express backend
    ├── config/             # DB connection
    ├── controllers/        # Route handlers
    ├── middlewares/        # auth (protect / admin / lawyer)
    ├── models/             # User, Lawyer, Appointment, Review, OTP
    ├── routes/             # /auth /users /appointments /reviews /admin /otp
    └── utils/              # generateToken, sendEmail, asyncHandler
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local install or a free MongoDB Atlas cluster)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # then edit .env with your values
npm run dev            # starts on http://localhost:5000
```

Environment variables (see `server/.env.example`):

| Variable        | Description                                              |
| --------------- | -------------------------------------------------------- |
| `PORT`          | API port (default 5000)                                   |
| `MONGO_URI`     | MongoDB connection string                                 |
| `JWT_SECRET`    | Long random string used to sign JWTs                      |
| `SMTP_*`        | Optional. If unset, emails are printed to the console     |

### 2. Seed test accounts (optional)

```bash
cd server
node seed.js
```

| Role   | Email                | Password    |
| ------ | -------------------- | ----------- |
| Admin  | admin@n16legal.com   | password123 |
| Lawyer | lawyer@n16legal.com  | password123 |
| Client | client@n16legal.com  | password123 |

### 3. Frontend

```bash
cd client
npm install
npm run dev            # starts on http://localhost:5173
```

The frontend expects the API at `http://localhost:5000/api`. To change it, create `client/.env` with:

```
VITE_API_URL=http://your-api-host/api
```

## API Overview

| Method | Endpoint                        | Access        | Description                     |
| ------ | ------------------------------- | ------------- | ------------------------------- |
| POST   | `/api/auth/register`            | Public        | Register (client or lawyer)     |
| POST   | `/api/auth/login`               | Public        | Login, returns JWT              |
| GET    | `/api/users/profile`            | Private       | Current user profile            |
| GET    | `/api/users/lawyers`            | Public        | List verified lawyers (search)  |
| POST   | `/api/appointments`             | Public        | Book appointment                |
| GET    | `/api/appointments`             | Private       | List own/role-scoped appointments |
| PUT    | `/api/appointments/:id/status`  | Lawyer/Admin  | Approve / reject / complete     |
| POST   | `/api/reviews`                  | Private       | Review a lawyer                 |
| GET    | `/api/reviews/:lawyerId`        | Public        | Lawyer reviews                  |
| GET    | `/api/admin/stats`              | Admin         | Dashboard stats                 |
| POST   | `/api/admin/lawyers`            | Admin         | Create verified lawyer          |
| PUT    | `/api/admin/lawyers/:id/verify` | Admin         | Verify lawyer                   |
| POST   | `/api/otp/send` / `/verify`     | Public        | OTP for booking verification    |

## Notes

- **Phone OTP is mocked for development**: without an SMS provider, the OTP is returned in the API response and shown as a toast so the flow can be tested end-to-end.
- If SMTP is not configured, all emails (OTP, appointment updates) are logged to the server console instead.

## License

Academic project — built as a college submission.
