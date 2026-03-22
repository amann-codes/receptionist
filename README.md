# Receptionist — AI Call Dashboard

A production-ready dashboard for your Vapi AI receptionist. Logs inbound calls, classifies intent, and lets you manage messages and follow-ups.

---

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend  | FastAPI + Motor (async MongoDB) |
| Database | MongoDB Atlas (or local) |
| Voice AI | [Vapi.ai](https://vapi.ai) |
| Auth     | JWT (HS256), single-user |

---

## Project Structure

```
receptionist/
├── backend/
│   ├── main.py          # FastAPI app — webhook + REST API
│   ├── auth.py          # JWT login + require_auth dependency
│   ├── database.py      # Motor/MongoDB connection
│   ├── models.py        # Pydantic models
│   ├── requirements.txt
│   └── .env.example
└── src/                 # React frontend (Vite)
    ├── App.jsx
    ├── api.js           # Fetch wrapper with JWT + 401 handling
    ├── data.js          # Demo data + intent/status meta
    ├── utils.js
    ├── ToastContext.jsx  # Global toast notifications
    └── components/
        ├── LoginScreen.jsx
        ├── Sidebar.jsx
        ├── APIBar.jsx
        ├── StatCard.jsx
        ├── CallCard.jsx
        ├── DetailPanel.jsx
        ├── IntentBadge.jsx
        └── Skeletons.jsx
```

---

## Backend Setup

### 1. Install dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=voiceagent
COLLECTION_NAME=calls

# Generate: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET=your-long-random-secret

DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=your-secure-password
```

### 3. Run

```bash
uvicorn main:app --reload --port 8000
```

---

## Frontend Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173 — sign in with the credentials from your `.env`.

---

## Vapi Setup

In your Vapi assistant, add a **Custom Tool** called `record_call_details` with these parameters:

| Field         | Type   | Description |
|---------------|--------|-------------|
| `caller_name` | string | Name of the caller |
| `intent`      | string | `work` \| `personal` \| `urgent` \| `spam` \| `other` |
| `message`     | string | Full message left by the caller |
| `summary`     | string | One-line AI summary |

Set the **Server URL** to: `https://your-domain.com/webhook`

The webhook endpoint is public (no auth) but rate-limited to **30 requests/minute**. All other API endpoints require a valid JWT.

---

## API Reference

All `/api/*` routes require `Authorization: Bearer <token>`.

```
POST   /auth/login                 → { access_token }
GET    /auth/me                    → { username }

GET    /api/stats                  → counts by intent/status
GET    /api/calls                  → paginated list (filter: intent, status, search)
GET    /api/calls/:id              → single call
PATCH  /api/calls/:id/status       → { status: "unread"|"read"|"actioned" }
PATCH  /api/calls/:id/notes        → { notes: "..." }
DELETE /api/calls/:id

POST   /webhook                    → Vapi webhook receiver (public, rate-limited)
GET    /health                     → { status: "ok" }
```

---

## Deployment Notes

- Set `allow_origins` in `main.py` to your frontend domain instead of `"*"`
- Use a reverse proxy (nginx/Caddy) to terminate TLS
- Run with `uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2`
- MongoDB Atlas free tier works fine for low volume
