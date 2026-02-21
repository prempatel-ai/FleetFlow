<div align="center">

<img src="fleetflow-next/public/logo.svg" alt="FleetFlow Logo" width="88" height="88" />

# FleetFlow

### Modular Fleet & Logistics Management System

> *Replacing manual logbooks with a centralized, rule-based digital hub that optimizes the delivery fleet lifecycle, monitors driver safety, and tracks financial performance.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Problem Statement Coverage

FleetFlow was built to fully satisfy the PS requirements. The table below maps every stated requirement to its implementation:

| PS Requirement | Status | Where |
|---|:---:|---|
| Secure login with role-based access | ✅ | `/login` — JWT auth, Manager/Dispatcher roles |
| Fleet KPI dashboard (Active, Maintenance, Utilization, Pending) | ✅ | `/dashboard` — live from DB |
| Vehicle CRUD with capacity & odometer | ✅ | `/vehicles` |
| Trip lifecycle: Draft → Dispatched → Completed → Cancelled | ✅ | `/trips` |
| Cargo weight validation against vehicle capacity | ✅ | Backend `tripController.js` |
| Driver assignment blocked if license expired | ✅ | Dispatch validation, backend check |
| Maintenance log auto-sets vehicle to "In Shop" | ✅ | `logController.js` + `vehicleController.js` |
| Fuel & expense logging per vehicle | ✅ | `/maintenance` |
| Total operational cost = Fuel + Maintenance per vehicle | ✅ | `/financials` + analytics engine |
| Driver performance: safety score, trip completion rate | ✅ | `/drivers` profile page |
| License expiry compliance alerts (auto-generated) | ✅ | Dashboard System Alerts, live from DB |
| Analytics: Fuel efficiency (km/L), Vehicle ROI formula | ✅ | `/analytics` |
| CSV export for monthly reports | ✅ | Export button on Analytics page |
| Real-time map with active trip routes | ✅ | `/trips` — Leaflet + OSRM road routes |
| Scannable data tables with status pills | ✅ | All list pages |
| Real-time vehicle/driver availability state management | ✅ | Status synced across trips, maintenance, dispatcher |

---

## Target Users

| Role | What FleetFlow gives them |
|---|---|
| **Fleet Manager** | Dashboard KPIs, system alerts, vehicle health overview, analytics |
| **Dispatcher** | Trip creation with capacity validation, live dispatch, route map |
| **Safety Officer** | License expiry alerts, driver compliance profiles |
| **Financial Analyst** | ROI report, fuel cost breakdown, CSV exports, monthly summaries |

---

## System Pages

### Page 1 — Login & Authentication

- Email + password authentication with JWT tokens
- Role-based access: **Manager** and **Dispatcher** roles
- Persistent sessions with protected route redirects
- Profile management with photo upload support

### Page 2 — Command Center (Dashboard)

Real-time fleet overview pulled fresh from the database on every load:

**KPI Cards**
- **Active Fleet** — count of vehicles currently "On Trip"
- **In Maintenance** — vehicles marked "In Shop"
- **Utilization Rate** — % of fleet assigned vs. total
- **Pending Cargo** — trips in Draft or Dispatched state

**Operational Log** — full trip timeline with status-color-coded entries

**System Alerts** — dynamically generated, not hardcoded:
- Vehicles with odometer > 15,000 km → Maintenance alert
- Drivers with license expiring within 30 days → Compliance alert
- Severity calculated automatically (Critical / Warning)

**Vehicle Filter Bar** — filter by Type (Truck, Van, Bike), Status (Ready, Busy), sort by newest/oldest

**Mission Schedule Drawer** — slide-over panel with complete trip timeline, count pills, and status-coded dots

### Page 3 — Vehicle Registry

Full CRUD management for the physical fleet:

- **Name, Model, License Plate** (unique identifier enforced at DB level)
- **Max Load Capacity** (kg) — used in cargo validation during dispatch
- **Odometer tracking** — updated on trip completion
- **Status management**: Available → On Trip → In Shop → Retired
- **Out of Service toggle** — manually retire a vehicle from the active pool
- Vehicle hidden from Dispatcher selection when status is "In Shop" or "Retired"

### Page 4 — Trip Dispatcher & Management

End-to-end trip workflow:

**Create Trip Form**
- Select from **Available vehicles only** (In Shop / On Trip vehicles filtered out)
- Select from **Available drivers only** (On Duty, valid license)
- Enter cargo weight, start point, end point, revenue

**Validation Rule (enforced on backend)**
```
if (cargoWeight > vehicle.maxCapacity) → reject with error
```

**Trip Lifecycle**
```
Draft → Dispatched → Completed
              ↓
           Cancelled
```
- On **Dispatch**: Vehicle status → On Trip, Driver status → On Duty
- On **Complete**: Vehicle status → Available, Driver status → Off Duty, odometer updated

**Live Route Map**
- Active (Dispatched) trips plotted as actual road-following routes
- Geocoding via Nominatim (free, no API key)
- Routing via OSRM (free, no API key)
- Smart fallback: "Surat Textile Hub" → strips location suffix → geocodes "Surat"
- Routes appear progressively as each trip resolves

**Search & Filter** — by Trip ID, vehicle name, driver name, status, date range

### Page 5 — Maintenance & Service Logs

Preventative and reactive health tracking:

- Log **Maintenance** events with description and cost → Vehicle auto-set to **"In Shop"**
- Vehicle immediately removed from Dispatcher's available pool
- View full maintenance history per vehicle
- Cost linked to Vehicle ID for Analytics ROI calculation

### Page 6 — Fuel & Expense Logging

Financial tracking per asset:

- Record **Liters, Cost per fill-up, and Date** against any vehicle
- Logs tied directly to Vehicle ID
- **Automated Total Operational Cost** = Σ Fuel + Σ Maintenance per vehicle
- Drives the cost side of the Vehicle ROI formula in Analytics

### Page 7 — Driver Performance & Safety Profiles

Human resource and compliance management:

**Compliance**
- License expiry date tracked per driver
- Driver **blocked from dispatch** if license is expired
- License expiry within 30 days → System Alert fires on dashboard

**Performance Metrics**
- Trip completion rate
- Total trips assigned
- Safety Score display

**Status Toggle**
- On Duty / Off Duty / Suspended
- Suspended drivers excluded from Dispatcher pool

### Page 8 — Operational Analytics & Financial Reports

Data-driven decision making:

**KPI Cards**
- Total Fuel Cost
- Fleet ROI
- Utilization Rate

**Charts**
- Fuel Efficiency trend (km/L over months) — line chart
- Top 5 Costliest Vehicles — bar chart

**Tables**
- Vehicle ROI Report: `ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost`
- Monthly Financial Summary: Revenue, Fuel, Maintenance, Net Profit per month

**Filters & Export**
- Date range filter: Last 7 / 30 / 90 Days, All Time
- One-click **CSV export** of financial summary (filename includes range + date)

---

## Business Logic & Workflow

```
1. VEHICLE INTAKE
   Add "Van-05" (500 kg capacity) → Status: Available

2. COMPLIANCE CHECK
   Add Driver "Alex" with license expiry date
   → System verifies validity before allowing dispatch assignment

3. DISPATCHING
   Assign Alex to Van-05 for 450 kg cargo
   → Backend check: 450 < 500 ✅ PASS
   → Vehicle: Available → On Trip
   → Driver: Off Duty → On Duty
   → Trip plotted on live route map

4. TRIP COMPLETION
   Driver marks trip "Done", enters final odometer
   → Vehicle: On Trip → Available
   → Driver: On Duty → Off Duty
   → Revenue, fuel cost recorded against vehicle

5. MAINTENANCE
   Manager logs "Oil Change" for Van-05
   → Auto-logic: Van-05 status → In Shop
   → Van-05 hidden from Dispatcher's vehicle dropdown

6. ANALYTICS
   System recalculates cost-per-km, ROI, and fuel efficiency
   from linked fuel logs and trip revenue records
```

---

## Tech Stack

### Frontend

| Technology | Role |
|---|---|
| Next.js 15 (App Router) | React framework, SSR, dynamic imports |
| TypeScript | Type-safe components and API data |
| Tailwind CSS | Utility-first responsive styling |
| Framer Motion | Animations, slide drawers, page transitions |
| Leaflet + React-Leaflet | Interactive map with polyline routes |
| Chart.js + react-chartjs-2 | Line chart & bar chart for analytics |
| Lucide React | Icon library |
| Nominatim API | Free geocoding — place names to coordinates |
| OSRM API | Free road routing — no API key required |

### Backend

| Technology | Role |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database with relational schema linking trips, vehicles, drivers, logs |
| JWT + bcryptjs | Authentication and password security |
| dotenv | Environment configuration |

---

## Architecture

```
FleetFlow/
├── fleetflow-next/              # Frontend (Next.js + TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/       # Command Center — KPIs, alerts, log, map
│   │   │   ├── trips/           # Trip dispatcher, lifecycle, route map
│   │   │   ├── vehicles/        # Vehicle registry CRUD
│   │   │   ├── drivers/         # Driver profiles & safety
│   │   │   ├── maintenance/     # Fuel & service logs
│   │   │   ├── financials/      # Per-vehicle cost breakdown
│   │   │   ├── analytics/       # Charts, KPIs, CSV export
│   │   │   └── login/           # Auth page
│   │   ├── components/
│   │   │   ├── Layout.tsx        # Fixed sidebar + header shell
│   │   │   ├── Sidebar.tsx       # Navigation with active state
│   │   │   ├── TripMap.tsx       # Leaflet map with OSRM routes
│   │   │   ├── StatusPill.tsx    # Reusable status badge
│   │   │   └── ProfileModal.tsx  # User profile editor
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Global auth state
│   │   └── utils/
│   │       └── api.ts            # Axios client
│   └── public/
│       └── logo.svg              # FleetFlow logo
│
└── fleetflow-backend/            # Backend (Node.js + Express)
    └── src/
        ├── controllers/
        │   ├── tripController.js       # Trip CRUD + dispatch/complete logic
        │   ├── vehicleController.js    # Vehicle CRUD + status management
        │   ├── driverController.js     # Driver CRUD + compliance checks
        │   ├── logController.js        # Fuel/maintenance logs + auto-status
        │   └── analyticsController.js  # KPIs, ROI, monthly financials
        ├── models/
        │   ├── Trip.js       # Revenue, fuel cost, net profit fields
        │   ├── Vehicle.js    # Capacity, odometer, status
        │   ├── Driver.js     # License expiry, safety score
        │   ├── Log.js        # Fuel (liters) or Maintenance (cost + desc)
        │   └── User.js       # Auth user record
        ├── routes/
        ├── config/db.js
        └── seed.js           # One-command demo data population
```

---

## Running Locally

### Prerequisites
- [Node.js](https://nodejs.org) v18+
- [MongoDB](https://mongodb.com) (local) or a free [Atlas](https://cloud.mongodb.com) cluster
- `npm`

---

### Step 1 — Backend

```bash
cd fleetflow-backend
npm install
```

Create `fleetflow-backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fleetflow
JWT_SECRET=your_secret_key_here
```

```bash
npm run dev
# API running at http://localhost:5000
```

---

### Step 2 — Seed Demo Data *(recommended)*

```bash
node src/seed.js
```

Populates realistic vehicles, drivers, 6 months of trips, fuel logs, and maintenance records so every chart and analytics feature works immediately.

---

### Step 3 — Frontend

```bash
cd fleetflow-next
npm install
```

Create `fleetflow-next/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev
# App running at http://localhost:3000
```

Open `http://localhost:3000` → Register → Login → Explore.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, receive JWT |
| GET | `/api/vehicles` | List all vehicles |
| POST | `/api/vehicles` | Add vehicle |
| PUT | `/api/vehicles/:id` | Update vehicle |
| DELETE | `/api/vehicles/:id` | Remove vehicle |
| GET | `/api/trips` | List all trips |
| POST | `/api/trips` | Create trip (validates cargo vs capacity) |
| PUT | `/api/trips/:id/dispatch` | Dispatch trip, update vehicle & driver status |
| PUT | `/api/trips/:id/complete` | Complete trip, update odometer |
| GET | `/api/drivers` | List all drivers |
| POST | `/api/drivers` | Add driver |
| PUT | `/api/drivers/:id` | Update driver |
| GET | `/api/logs` | List fuel & maintenance logs |
| POST | `/api/logs` | Add log (maintenance auto-sets vehicle to In Shop) |
| GET | `/api/analytics/dashboard` | Dashboard KPIs |
| GET | `/api/analytics/overall?range=30` | Full analytics with date range filter |

---

## Key Technical Decisions

**Zero paid APIs** — Nominatim (geocoding) and OSRM (routing) are both open-source public services requiring no API key. The map works fully without any external account or billing setup.

**Geocoding fallback chain** — User-typed place names like "Nagpur Warehouse" may not exist in OpenStreetMap. The geocoder strips domain-specific suffixes (Hub, Warehouse, Depot, Center, Port, Zone, etc.) and retries with the extracted city name, making route rendering resilient to real-world informal data entry.

**Progressive map rendering** — Routes appear one by one as each resolves, rather than waiting for all trips to complete. Makes large fleets usable without a long white screen.

**Availability pool enforcement** — Vehicle and driver dropdowns in the trip form are filtered server-side. An "In Shop" vehicle or an "On Duty" driver cannot be selected for a new trip, preventing double-booking at the data layer.

**Live alert generation** — System Alerts are generated fresh from database values on every page load. No hardcoded alert records. Odometer thresholds and date math run at request time.

**Fixed sidebar** — Uses CSS `position: fixed` instead of the conventional `sticky`, which avoids a browser-level bug where `overflow: hidden` on an ancestor silently breaks sticky positioning, causing the sidebar to scroll away on long pages.

---

## What's Next *(if extended)*

- [ ] Role-Based Access Control: dispatcher cannot access analytics, etc.
- [ ] Push notifications for critical alerts
- [ ] PDF export for audit reports
- [ ] Mobile-responsive dispatcher view
- [ ] Region/city filter for large multi-depot fleets
- [ ] Custom date range picker on analytics

---

<div align="center">

Built for the hackathon — every feature, validation rule, and calculation is functional and connected to a live database.

*Made with focus, strong chai ☕, and a genuine care for getting the details right.*

</div>
