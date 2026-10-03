# Daily Task Tracker

Daily Task Tracker is a full-stack task planning and focus-time app. It combines a mobile-first Progressive Web App (PWA) for everyday use with a separate web administration panel, backed by one Express API.

## Apps

- **Phone app (`/`)** — responsive daily task dashboard, calendar, priorities, subtasks, focus timer, reminders, productivity reports, offline task cache, and data export. Install it from a mobile browser using **Add to Home Screen**.
- **Admin panel (`/admin`)** — user and task oversight, activity metrics, system settings, and audit history. Admin access is protected by server-configured email/password credentials and is separate from user accounts.

Both experiences are included in this repository and served by the same application. The API rejects unauthenticated user and admin requests; account passwords are stored as scrypt hashes, and sessions expire. User registration does not currently verify email ownership.

## Technology

- React 19, TypeScript, Tailwind CSS, Vite, and `vite-plugin-pwa`
- Node.js and Express REST API
- JSON file-backed database at `data/db.json`
- Android wrapper build helper in `scripts/`

## Run locally

Requirements: Node.js 20.19+ and npm.

```sh
npm install
```

Create a local `.env` from `.env.example` and set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 16 characters. Never commit `.env` or `data/db.json`.

```sh
npm run dev
```

Open `http://localhost:3000/` for the phone app or `http://localhost:3000/admin` for the admin panel. Create a user account from the phone app; use the configured admin credentials for `/admin`.

## Deploy to Render

This repo includes a `render.yaml` Blueprint for a free Node web service. Connect the GitHub repository in Render, create the Blueprint service, and provide `ADMIN_EMAIL` and `ADMIN_PASSWORD` as private environment variables when prompted.

After deployment, use:

- Phone app: `https://<your-render-service>.onrender.com/`
- Admin panel: `https://<your-render-service>.onrender.com/admin`

The free Render service uses an ephemeral filesystem. The JSON database and in-memory sessions can be lost when the service restarts or redeploys; users may need to sign in again. Use a persistent database and durable storage before relying on this service for important task data.

## Build and checks

```sh
npm run build
npm run lint
npx tsx tests/taskTracker.test.ts
```

## Android

The PWA can be installed directly from a supported mobile browser. To create a native Android package, build the web bundle and use the Android wrapper workflow documented in [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md). Android Studio and the Android SDK are required.

## Repository safety

Environment files, generated builds, and the local JSON database are excluded from Git. Do not add credentials, real user data, or deployment secrets to the repository.
