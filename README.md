# Nimbus AI – Bulk WhatsApp Messaging Platform

A scalable full-stack bulk messaging platform that enables users to create contacts, compose WhatsApp messages, and dispatch them asynchronously using BullMQ workers. The application is built with a production-style architecture using Next.js, Express.js, PostgreSQL, Redis, and Twilio.

---

## Features

- Create and manage users
- Compose and send bulk WhatsApp messages
- Asynchronous message processing using BullMQ
- Redis-backed job queue
- PostgreSQL database for persistent storage
- Background worker for message delivery
- Real-time message status updates (Pending, Sent, Failed)
- Responsive modern UI
- Production-ready deployment

---

## Tech Stack

### Frontend
- React
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL
- node-postgres (pg)

### Queue & Worker
- Redis Cloud
- BullMQ
- ioredis

### Messaging
- Twilio WhatsApp Sandbox API

### Deployment
- Vercel (Frontend)
- Render (Backend)
- Render Background Worker
- Neon PostgreSQL
- Redis Cloud

---

## Architecture

```text
                React.js Frontend
                       │
                       ▼
               Express REST API
               (Render Web Service)
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
 PostgreSQL (Neon)             Redis Cloud
                                      │
                                      ▼
                           BullMQ Background Worker
                                      │
                                      ▼
                              Twilio WhatsApp API
```

## Environment Variables

### Backend / Worker

```env
DATABASE_URL=

REDIS_URL=

TWILIO_ACCOUNT_SID=

TWILIO_AUTH_TOKEN=

TWILIO_CONTENT_SID

TWILIO_FROM=whatsapp:+14155238886

TWILIO_CONTENT_VARIABLES
```

### Frontend

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

---

## Installation

### Clone Repository

1 --> Fork the repo

```bash
git clone https://github.com/yourusername.git
```

### Install Frontend

```bash
cd client
npm install
npm run dev
```

### Install Backend

```bash
cd server
npm install
npm run dev
```

### Start Worker

```bash
npm run worker
```

---

## Deployment

### Frontend

Deploy using **Vercel**

### Backend

Deploy using **Render Web Service**

### Worker

Deploy as a separate **Render Background Worker**

---

## Message Flow

1. User creates contacts.
2. User composes a WhatsApp message.
3. Backend stores message in PostgreSQL.
4. Backend pushes a BullMQ job into Redis.
5. Worker consumes the job.
6. Worker sends WhatsApp message using Twilio.
7. Database status updates to **Sent** or **Failed**.

---

## Screenshots

### Number List

<img width="720" height="1600" alt="WhatsApp Image 2026-07-12 at 01 25 20" src="https://github.com/user-attachments/assets/34da90e2-85a1-40ef-b779-a96f04c510f1" />

### Compose Message
<img width="720" height="1600" alt="WhatsApp Image 2026-07-12 at 01 25 19 (1)" src="https://github.com/user-attachments/assets/8bc45c31-7cf1-48cc-973b-869aff7ffd79" />

### Message History

<img width="720" height="1600" alt="WhatsApp Image 2026-07-12 at 01 25 19 (2)" src="https://github.com/user-attachments/assets/e79c37d5-bb75-4d8b-884c-e68c7bb36fd4" />

### Worker Logs

<img width="720" height="1600" alt="WhatsApp Image 2026-07-12 at 01 25 21" src="https://github.com/user-attachments/assets/35822347-75f5-4cb5-bcae-0518ce4e72ab" />

### WhatsApp Delivery

<img width="720" height="1600" alt="WhatsApp Image 2026-07-12 at 01 19 44" src="https://github.com/user-attachments/assets/d172c6b6-35b1-4d7f-8fdc-ae7dd32122f5" />

---

## Twilio Sandbox Notice

This project currently uses the **Twilio WhatsApp Sandbox** for testing.

To receive WhatsApp messages, recipient phone numbers must first join the Twilio Sandbox using the provided join code.

This limitation exists only in the testing environment. A production deployment using a Twilio WhatsApp Business Account would not require recipients to join the sandbox.

---

## Future Improvements

- JWT Authentication
- Role-Based Access Control
- Retry & Exponential Backoff
- Scheduled Messages
- CSV Contact Upload
- WebSocket Live Status Updates
- Bull Board Dashboard
- Docker Compose
- Kubernetes Deployment

---

## Author

**Jayesh Sharma**

GitHub: https://github.com/Jayesh-git10
