# N16Legal — Legal Consultancy Platform

A full-stack (MERN) web application for a law firm. Visitors can browse verified lawyers and book consultations with email/phone OTP verification. Clients, receptionists, lawyers, and admins each get a role-based dashboard.

## Features

- Browse and search lawyers by name or specialization
- Book appointments as a guest or logged-in client (email + phone OTP verification)
- **Receptionist approval workflow**: every appointment request is reviewed by a receptionist, who approves/rejects it, assigns a lawyer, and can add internal notes, reschedule, or cancel; the assigned lawyer then confirms or declines
- Client dashboard: track appointment status, leave reviews for completed consultations
- Receptionist dashboard: pending-request queue, lawyer assignment, reschedule/cancel, internal notes, full status history, in-app notifications
- Lawyer dashboard: confirm / decline assigned appointments, mark them completed (client gets an email)
- Admin dashboard: platform stats, add lawyers, verify lawyer accounts
- In-app notifications (bell) for clients, lawyers, and receptionists
- JWT authentication with role-based access control
- Security middleware: helmet, rate limiting, NoSQL-injection & XSS sanitization
- Light / dark theme toggle

## Appointment Workflow

```
Client request → Pending
             → (receptionist) Receptionist Approved | Rejected | Cancelled
             → (receptionist assigns lawyer) Waiting Lawyer Confirmation
             → (lawyer) Confirmed | Rejected
             → (lawyer) Completed
```

Statuses: `Pending`, `Receptionist Approved`, `Waiting Lawyer Confirmation`, `Confirmed`, `Completed`, `Cancelled`, `Rejected`. Transitions are validated server-side (invalid jumps are rejected with 400) and every change is recorded in an audit trail (`statusHistory`).

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
    ├── app.js              # Express app (exported for tests)
    ├── server.js           # Bootstrap: env, DB, listen
    ├── config/             # DB connection
    ├── controllers/        # Route handlers
    ├── middlewares/        # auth (protect / authorize / admin / lawyer / receptionist)
    ├── models/             # User, Lawyer, Appointment, Review, OTP, Notification
    ├── routes/             # /auth /users /appointments /reviews /admin /otp /receptionist /notifications
    ├── tests/              # node:test + supertest suite (npm test)
    └── utils/              # generateToken, sendEmail, notify, asyncHandler
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
| `CLIENT_URL`    | Optional. Restrict CORS to the frontend origin in production |

### 2. Seed test accounts (optional)

```bash
cd server
node seed.js
```

| Role         | Email                      | Password    |
| ------------ | -------------------------- | ----------- |
| Admin        | admin@n16legal.com         | password123 |
| Lawyer       | lawyer@n16legal.com        | password123 |
| Receptionist | receptionist@n16legal.com  | password123 |
| Client       | client@n16legal.com        | password123 |

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
| PUT    | `/api/appointments/:id/status`  | Lawyer/Admin  | Confirm / decline / complete (transition-validated) |
| GET    | `/api/receptionist/appointments`| Receptionist  | List requests (filter by `?status=`) |
| GET    | `/api/receptionist/appointments/:id` | Receptionist | Full details, notes, status history |
| PUT    | `/api/receptionist/appointments/:id/approve` | Receptionist | Approve a pending request |
| PUT    | `/api/receptionist/appointments/:id/reject`  | Receptionist | Reject with a reason      |
| PUT    | `/api/receptionist/appointments/:id/assign-lawyer` | Receptionist | Assign lawyer → waits for confirmation |
| POST   | `/api/receptionist/appointments/:id/notes`   | Receptionist | Add internal note         |
| PUT    | `/api/receptionist/appointments/:id/reschedule` | Receptionist | Change date/time       |
| PUT    | `/api/receptionist/appointments/:id/cancel`  | Receptionist | Cancel appointment        |
| GET    | `/api/receptionist/lawyers`     | Receptionist  | Verified lawyers for assignment |
| GET    | `/api/notifications`            | Private       | Current user's notifications    |
| PUT    | `/api/notifications/:id/read`   | Private       | Mark one notification read      |
| PUT    | `/api/notifications/read-all`   | Private       | Mark all notifications read     |
| POST   | `/api/reviews`                  | Private       | Review a lawyer                 |
| GET    | `/api/reviews/:lawyerId`        | Public        | Lawyer reviews                  |
| GET    | `/api/admin/stats`              | Admin         | Dashboard stats                 |
| POST   | `/api/admin/lawyers`            | Admin         | Create verified lawyer          |
| PUT    | `/api/admin/lawyers/:id/verify` | Admin         | Verify lawyer                   |
| POST   | `/api/otp/send` / `/verify`     | Public        | OTP for booking verification    |

Receptionist routes also accept admins. Receptionist accounts cannot self-register — create them via the seed script or database.

## Testing

```bash
cd server
npm test        # node:test + supertest (workflow state machine, auth, validation)
```

```bash
cd client
npx eslint src  # lint
npm run build   # production build
```

## Notes

- **Phone OTP is mocked for development**: without an SMS provider, the OTP is returned in the API response and shown as a toast so the flow can be tested end-to-end.
- If SMTP is not configured, all emails (OTP, appointment updates) are logged to the server console instead.

## License

Academic project — built as a college submission.
