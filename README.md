# Crisis Supply Navigator

A backend-connected crisis response dashboard for tracking relief supplies, shelter capacity, deliveries, and map locations.

## Features

- Live dashboard summary from REST APIs
- Supply inventory creation and updates
- Shelter registration and capacity tracking
- Delivery scheduling with status views
- Interactive map backed by live data
- Calmer 2-3 color visual system with less decorative UI noise

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5.3
- Chart.js
- Leaflet.js

### Backend
- Node.js HTTP server with file-based JSON persistence
- REST-style endpoints under `/api/*`

## Run Locally

1. Install Node.js 18 or newer.
2. From the project root, run `npm start`.
3. Open [http://localhost:8000](http://localhost:8000).

## API Endpoints

- `GET /api/dashboard`
- `GET /api/summary`
- `GET /api/supplies`
- `POST /api/supplies`
- `PUT /api/supplies/:id`
- `GET /api/shelters`
- `POST /api/shelters`
- `GET /api/deliveries`
- `POST /api/deliveries`
- `GET /api/map`
- `GET /api/admin`
