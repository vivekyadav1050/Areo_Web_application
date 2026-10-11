# AP-20 Patient Monitoring Dashboard

A responsive React + Vite dashboard for authorized monitor users to review patient assignments, current AP-20 readings, device freshness, and available history. The Android tablet remains responsible for Bluetooth scanning/pairing and uploading readings.

## Important backend compatibility note

This frontend implements the suggested monitor API contract from the supplied specification:

- `POST /api/auth/login` — `{ username, password }` → `{ success, token, user: { id, username, role } }`
- `GET /api/monitor/patients` — array of authorized patient records
- `GET /api/monitor/patients/:patientId` — patient details plus latest reading
- `GET /api/monitor/patients/:patientId/history?range=1h` — array of historical readings

The existing backend source code was not included with this frontend package, so the three monitor endpoints and response schemas have **not** been verified against your running backend. The frontend deliberately shows API errors rather than fake patient data. Check your actual Express routes and adjust `src/api/patientApi.js` if paths or response shapes differ. Never rely on frontend checks for patient authorization; enforce access on the server.

The AP-20 backend discussed previously has also used routes such as `/api/monitoring` and `/api/measurements/history/:deviceId`. Those are not automatically interchangeable with patient-oriented monitor routes. Map them in `patientApi.js` only after verifying the current backend schemas and authorization logic.

## Requirements

- Node.js 20 or newer
- The AP-20 backend running and reachable from the browser
- A monitor/admin/operator account explicitly authorized by your backend

## Install and run

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, if `cp` is unavailable:

```powershell
Copy-Item .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_READING_FRESHNESS_SECONDS=90
VITE_POLL_INTERVAL_MS=7000
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

## Features

- Login through the real backend; no hardcoded credentials or fake login.
- Session-scoped token storage in `sessionStorage` and automatic handling of HTTP 401.
- Protected dashboard routes and logout state clearing.
- Dashboard counts, patient search, status filters, sorting, responsive patient cards/table.
- Patient detail page with current SpO₂, pulse rate, optional PI, and real history charts.
- Polling every 7 seconds by default, skipped while the browser tab is hidden; refresh when it becomes visible.
- Loading, empty, network error, retry, and no-data states.
- Online status uses a backend status when provided, otherwise the configured reading freshness threshold. Active assignment alone does not mean online.

## Expected patient response shape

The adapter tolerates several common field names, but your API should ideally return data like:

```json
{
  "patients": [
    {
      "patientId": "PAT-001",
      "name": "Patient name",
      "age": 45,
      "sex": "Female",
      "tabletId": "TAB-001",
      "active": true,
      "status": "online",
      "lastReadingAt": "2026-10-10T08:30:00.000Z",
      "latestReading": {
        "spo2": 98,
        "pulseRate": 76,
        "pi": 4.2,
        "timestamp": "2026-10-10T08:30:00.000Z"
      }
    }
  ]
}
```

This is a **contract example only**, not seeded or displayed mock data. Use actual patient records from your database.

## Security notes

- The browser never uploads monitoring data; the tablet app should continue to post measurements to the backend.
- The dashboard does not log credentials or JWTs.
- `sessionStorage` is used to avoid persisting the session across browser restarts, but any JavaScript-accessible token storage can be exposed by an XSS vulnerability. Use a strong Content Security Policy, avoid unsafe HTML, and consider an HttpOnly secure cookie architecture if the backend supports it.
- Patient authorization must be checked on every monitor endpoint. A browser-supplied patient ID must not grant access by itself.
- Do not use this interface as a diagnostic device or replace clinical judgment.

## Build verification

```bash
npm run build
```

A successful frontend build does not prove backend compatibility. Test login, permissions, patient-list/detail/history endpoints, expired sessions, and live readings against the actual backend before deployment.
