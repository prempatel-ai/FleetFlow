<div align="center">
  <img src="fleetflow-next/public/logo.svg" width="80" alt="FleetFlow" />

  <h1>FleetFlow</h1>
  <p><strong>Fleet & Logistics Management — built for the people actually running the routes.</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)

</div>

---

Most fleet software either costs a fortune or looks like it was built in 2008. FleetFlow is neither. It's a full-stack web application that gives a logistics team everything they need in one place — dispatch, vehicle health, driver compliance, route visualization, and financial reporting — without spreadsheets, WhatsApp chains, or clipboards.

---

## What it actually does

### Dispatching trips that make sense

You pick a vehicle, you pick a driver. But before the trip goes through, the system checks three things silently in the background:

- Is the vehicle available? (Not on another trip, not in the shop)
- Is the driver's license valid?
- Does the cargo weight fit inside the vehicle's rated capacity?

If any of those fail, the trip doesn't dispatch. No override, no workaround. This is enforced at the API level, not just the UI.

Once dispatched, the vehicle and driver are both locked out of new assignments automatically. When the trip completes, the driver marks it done, the odometer updates, and everything flips back to available.

### A map that shows real routes

The trips page shows a live map of all currently active (dispatched) trips. Not pins. Actual road routes — the kind that follow highways and city streets.

The system geocodes location names like "Nagpur Warehouse" or "Surat Textile Hub" using the OpenStreetMap Nominatim API, fetches the road path from OSRM, and draws it as a polyline on a Leaflet map. No Google Maps. No API keys. No billing.

One edge case worth mentioning: user-typed location names like "Pune Industrial Area" don't always exist in OpenStreetMap. So there's a fallback — the system strips generic suffixes (Hub, Warehouse, Depot, Port, Zone, etc.) and retries with just the city name. It works surprisingly well.

Routes appear one by one as they resolve rather than waiting for everything. So large fleets don't produce a loading spinner that never ends.

### Maintenance pulls vehicles off the road automatically

When a manager logs a maintenance event against a vehicle, that vehicle's status immediately flips to "In Shop." It disappears from the dispatcher's vehicle dropdown. No flag to set, no extra step. The data and the state stay consistent.

When maintenance is done and the vehicle is cleared, it comes back into the pool.

### Alerts that come from the data

The System Alerts panel on the dashboard is not a config file or a hardcoded list. Every time the page loads, the system scans:

- All vehicles where `odometer > 15,000 km` and status is not already "In Shop" → maintenance overdue
- All drivers where `licenseExpiry < today + 30 days` → compliance risk

Severity is calculated automatically. Past-due dates are Critical. Near-future dates are Warning. The count badge reflects the real number.

### Financial tracking tied to actual trips

Fuel logs and maintenance records are linked to specific vehicle IDs. The analytics engine uses those relationships to compute:

- **Fuel efficiency** (km per litre, per vehicle, over time)
- **Vehicle ROI** = `(Revenue − Fuel − Maintenance) / Acquisition Cost`
- **Monthly financial summary** — revenue, costs, net profit per month
- **Top 5 costliest vehicles** — useful for depreciation decisions

Everything's filterable by date range (7 / 30 / 90 days, all time) and exportable to CSV with one click.

---

## Tech choices and why

| Layer | What | Why |
|---|---|---|
| Frontend | Next.js 15 + TypeScript | App Router, dynamic imports for Leaflet (SSR incompatible), strong typing |
| Styling | Tailwind CSS + Framer Motion | Fast iteration on layout, smooth transitions without a component library |
| Maps | Leaflet + React-Leaflet | Open source, lightweight, works perfectly with SSR disabled |
| Geocoding | Nominatim (OpenStreetMap) | Free, no key, good coverage for Indian cities |
| Routing | OSRM public API | Free road-route engine, returns actual GPS coordinates |
| Charts | Chart.js + react-chartjs-2 | Simple API, handles the line + bar charts needed |
| Backend | Node.js + Express | Straightforward REST API, fast to build and easy to extend |
| Database | MongoDB + Mongoose | Flexible schema, references between trips/vehicles/drivers/logs work cleanly |
| Auth | JWT + bcryptjs | Stateless, no session management overhead |

One specific CSS decision worth noting: the sidebar uses `position: fixed` rather than `position: sticky`. There's a browser bug where an ancestor element with `overflow: hidden` silently breaks sticky positioning — the sidebar would scroll away on long pages. Fixed positioning avoids this entirely; the main content just gets a `margin-left` equal to the sidebar width.

---

## Project layout

```
FleetFlow/
├── fleetflow-next/              # Frontend
│   └── src/
│       ├── app/
│       │   ├── dashboard/       # KPI cards, live log, alerts, route map
│       │   ├── trips/           # Dispatch workflow, trip list, Leaflet map
│       │   ├── vehicles/        # Registry, status management
│       │   ├── drivers/         # Profiles, compliance, safety scores
│       │   ├── maintenance/     # Fuel fill-ups and service logs
│       │   ├── financials/      # Per-vehicle cost breakdown
│       │   ├── analytics/       # Charts, ROI table, CSV export
│       │   └── login/
│       ├── components/
│       │   ├── TripMap.tsx      # Geocoding + OSRM routing + Leaflet render
│       │   ├── Sidebar.tsx      # Always-visible nav (fixed position)
│       │   ├── Layout.tsx       # Sidebar + header shell
│       │   └── StatusPill.tsx   # Reusable status badge
│       └── utils/api.ts         # Axios client with base URL
│
└── fleetflow-backend/           # Backend
    └── src/
        ├── controllers/
        │   ├── tripController.js        # Dispatch logic + cargo validation
        │   ├── vehicleController.js     # Status sync on dispatch/complete
        │   ├── driverController.js      # License checks
        │   ├── logController.js         # Auto sets vehicle to In Shop
        │   └── analyticsController.js  # ROI, fuel efficiency, monthly data
        ├── models/                      # Trip, Vehicle, Driver, Log, User
        ├── routes/
        └── seed.js                      # Populates demo data in one command
```

---

## Running it locally

You need Node.js v18+ and MongoDB (local or Atlas).

**Backend**

```bash
cd fleetflow-backend
npm install
```

Create `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fleetflow
JWT_SECRET=pick_anything_here
```

```bash
npm run dev
```

**Seed demo data** (optional but recommended — gives you 6 months of trips, fuel logs, and maintenance records immediately):

```bash
node src/seed.js
```

**Frontend**

```bash
cd fleetflow-next
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open `http://localhost:3000`, register an account, and log in.

---

## API surface

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/vehicles
POST   /api/vehicles
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id

GET    /api/drivers
POST   /api/drivers
PUT    /api/drivers/:id

GET    /api/trips
POST   /api/trips                  # validates cargo vs capacity
PUT    /api/trips/:id/dispatch     # locks vehicle + driver
PUT    /api/trips/:id/complete     # releases + updates odometer

GET    /api/logs
POST   /api/logs                   # maintenance type auto-sets vehicle In Shop

GET    /api/analytics/dashboard
GET    /api/analytics/overall?range=30
```

---

 

<div align="center">
  <sub>Built from scratch. Every validation, every status transition, every route on that map — it all runs against a live database.</sub>
</div>
