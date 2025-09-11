## AI Ticketing System

A full‑stack ticket management system with AI‑assisted triage. The backend (Node.js/Express + MongoDB) exposes REST APIs and background jobs via Inngest; the frontend is a React app (Vite + Tailwind CSS + DaisyUI).

### Project Structure

```
IT-Ticket/
  ai-ticket-assistant/      # Backend (Express, MongoDB, Inngest)
  ai-ticket-frontend/       # Frontend (React + Vite + Tailwind)
```

### Requirements

- Node.js 18+ and npm
- A MongoDB connection string
- Mailtrap (or SMTP) credentials for email
- Google Gemini API key for AI triage (via Inngest Agent Kit)

### Backend Setup (ai-ticket-assistant)

1) Install dependencies

```bash
cd ai-ticket-assistant
npm install
```

2) Create a `.env` file

```bash
# Server
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-strong-secret

# AI (Gemini)
GEMINI_API_KEY=your-gemini-api-key

# Mail (Mailtrap or SMTP)
MAILTRAP_SMTP_HOST=smtp.mailtrap.io
MAILTRAP_SMTP_PORT=2525
MAILTRAP_SMTP_USER=your-user
MAILTRAP_SMTP_PASS=your-pass
```

3) Run the server

```bash
npm run dev      # with nodemon
# or
npm start        # node index.js
```

The API will be available at `http://localhost:5000` by default.

Key routes:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/users` (requires Bearer token)
- `POST /api/auth/update-user` (requires Bearer token)
- `CRUD /api/tickets/*`

Background functions are exposed for Inngest at `POST /api/inngest`.

### Frontend Setup (ai-ticket-frontend)

1) Install dependencies

```bash
cd ai-ticket-frontend
npm install
```

2) Start the dev server

```bash
npm run dev
```

By default Vite runs on `http://localhost:5173`.

### Scripts

- Backend
  - `npm run dev` — start Express with nodemon
  - `npm start` — start Express with Node
  - `npm run inngest-dev` — run Inngest local dev server
- Frontend
  - `npm run dev` — start Vite dev server
  - `npm run build` — production build
  - `npm run preview` — preview production build

### Environment Variables Reference

- `PORT`: Backend HTTP port (default 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for signing auth tokens
- `GEMINI_API_KEY`: Google Gemini API key used by AI triage
- `MAILTRAP_SMTP_HOST`, `MAILTRAP_SMTP_PORT`, `MAILTRAP_SMTP_USER`, `MAILTRAP_SMTP_PASS`: SMTP configuration for email

### Development Workflow

Run both apps in two terminals:

```bash
# Terminal 1
cd ai-ticket-assistant && npm run dev

# Terminal 2
cd ai-ticket-frontend && npm run dev
```

Login/Signup via the frontend will call the backend APIs. Tickets created in the frontend will be analyzed by the AI triage helper and stored in MongoDB.

### Notes

- Ensure the backend is running before the frontend to avoid CORS/connection issues.
- If using a different SMTP provider, update the SMTP env vars accordingly.
- For Inngest local development, you can run `npm run inngest-dev` in `ai-ticket-assistant`.

### License

ISC


