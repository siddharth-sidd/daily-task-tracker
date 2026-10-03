# Developer Guide

## Architecture

- **Client:** React 19, TypeScript, Vite, Tailwind CSS, and a PWA service worker.
- **Mobile experience:** `src/screens/mobile/` and `src/components/mobile/`.
- **Admin experience:** `src/admin/`, opened at `/admin`.
- **API:** Express routers in `server/routes/`, mounted at `/api/*`.
- **Persistence:** the JSON-backed store in `server/db.ts`, written to `data/db.json`.

The phone app and admin panel are separate interfaces in the same deployment and use the same API. The admin panel is protected by credentials configured in `ADMIN_EMAIL` and `ADMIN_PASSWORD`; user account roles do not grant admin API access.

## Authentication and data

- Users register with an email and a password of at least 12 characters. Passwords are hashed with Node's scrypt implementation.
- User API routes require a short-lived bearer session. The server derives the user ID from that session rather than trusting an ID supplied by the browser.
- Admin API routes require a separate bearer session, created by the configured administrator credentials. Admin sessions last up to 8 hours; user sessions last up to 24 hours.
- Sessions are stored in process memory. A server restart or sleep/wake cycle ends active sessions.
- Registration does not verify email ownership. Use an email-verification provider before treating account email addresses as verified identities.
- The JSON database and local `.env` file are private runtime data and must not be committed.

## Local development

Requirements: Node.js 20.19+.

```sh
npm install
```

Copy `.env.example` to `.env`, then provide an admin email and a unique password of at least 16 characters. Do not share secrets in source control.

```sh
npm run dev
```

Vite and Express are served together at `http://localhost:3000`. Visit `/` for the phone app and `/admin` for the admin panel. A fresh database starts empty except for built-in task categories.

## Production build

```sh
npm run build
npm start
```

The Express server serves the generated `dist/` bundle and the REST API from the same origin.

## Render deployment

`render.yaml` defines a free Node web service with `npm install`, `npm run build`, and `npm start`. Connect the repository in Render and set `ADMIN_EMAIL` and `ADMIN_PASSWORD` as private environment variables.

The free service has an ephemeral filesystem: `data/db.json` and in-memory sessions may be lost on restart or redeployment. Use a durable database and persistent storage before storing important user data. Once deployed, the phone app URL is the service root and the admin URL is the same origin followed by `/admin`.

## API authentication examples

Create an account:

```http
POST /api/auth/login
Content-Type: application/json

{"email":"person@example.com","name":"Example Person","password":"a-long-unique-password","register":true}
```

The response contains a bearer token. Send it as `Authorization: Bearer <token>` for user APIs. Sign-in uses the same endpoint with `register: false`. Admin sign-in is `POST /api/auth/admin-login`; admin API requests also require a bearer token, but user and admin tokens are not interchangeable.

Unauthenticated health check: `GET /api/health`.

## Android installation

The PWA can be installed from a supported mobile browser using **Add to Home Screen**. A native APK requires Android Studio and the Android SDK. The project contains an APK helper script; configure the Capacitor Android project separately before invoking a native build.
