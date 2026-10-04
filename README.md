# OROC • Operational Refinery Operations Center

> **OROC** stands for **Operational Refinery Operations Center** *(or Oil Refinery Operations Control)*.
> A mission-control platform engineered for real-time crude processing, environmental compliance, asset health predictive maintenance, and multi-shift operator handovers.

---

## 🛠️ Technology Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend Service** | Node.js, Express.js REST API, Server-Sent Events (SSE) Live Stream |
| **Database & Cache** | MongoDB, Mongoose BSON Schemas, Redis Cache Middleware |
| **Containerization** | Docker, Docker Compose |
| **Version Control** | Git / GitHub |

---

## 🚀 Key Modules & System Features

### 1. 🔑 Account Authenticator & Saved Analysis History
- **Multi-Account Authentication**: Sign in or create an account using **Full Name**, **Email Address**, and **Password**.
- **1-Click Demo Login**: Instant login using pre-configured Chief Engineer profile (`operator@refinery.com` / `password123`).
- **Account-Specific Analysis Register**: Every account maintains its own archive of past saved analysis records, throughput peaks, unit states, and custom operational notes.

### 2. 📊 Operations Overview & Live Telemetry
- **24-Hour Throughput Trend**: SVG trend line tracking crude processing rates against the 380,000 bbl/d plant target.
- **Interactive Alarm Journal**: Real-time alarm stream with direct 1-click navigation to the alert location unit.
- **Environmental Emissions & Safety Flare Monitor**: Continuous tracking of $SO_2$ (ppm), $NO_x$ (ppm), daily $CO_2$ footprint (Tons), and **Flare Combustion Efficiency (99.4%)** with EPA compliance verification.

### 3. 🔀 Interactive P&ID Process Flow Diagram (Schematic)
- Visual industrial schematic mapping crude oil flow:
  `Crude Tank Farm ➔ CDU-05 (Distillation) ➔ VDU-05 (Vacuum) ➔ FCC-05 (Cracking) ➔ Spec Storage`.
- Dynamic flow lines and clickable unit inspector drawer for live hydraulic parameters.

### 4. ⚙️ Production Units Monitor
- Live unit grid tracking operating loads (%), temperatures (°C), processing rates (bbl/d), and column pressures (bar) across CDU-05, VDU-05, and FCC-05.
- Alert location highlighting when navigating directly from alarm events.

### 5. 🛠️ Predictive Maintenance & Health Scores (RUL)
- Asset health degradation scores (0–100%) for critical pumps, gas compressors, exchangers, and furnace heaters.
- Tracks **Vibration Telemetry (mm/s)**, **Bearing Temperature (°C)**, and **Remaining Useful Life (RUL in Days)** with automated overhaul recommendations.

### 6. 📖 Digital Shift Handover & Operator Logbook
- Digital logbook replacing paper shift logs for Shift A (00:00–08:00), Shift B (08:00–16:00), and Shift C (16:00–24:00).
- Allows operators to log unit bypasses, safety notes, maintenance tickets, and sign off shift handovers.

### 7. 📤 Department CSV Data Import Portal
- Multi-department CSV ingestion portal for **Production**, **Maintenance Work Orders**, **Safety Inspections**, and **KPI Metrics**.
- 1-Click sample data loader and system reset controls.

### 8. 📄 Official Certified Daily Audit Report Export
- In-app interactive audit certificate modal generating official compliance reports.
- Features 1-click **Download Report File** (`.txt`/`.csv`) and **Copy Text** buttons.

---

## 📡 REST API Specifications

```http
# Authentication Endpoints
POST /api/auth/register    # Register new operator account
POST /api/auth/login       # Authenticate email & password
POST /api/auth/logout      # End current session

# Telemetry & State Endpoints
GET  /api/state            # Retrieve complete refinery state
GET  /api/stream           # Server-Sent Events (SSE) live telemetry stream
POST /api/upload           # Ingest department CSV file
POST /api/load-samples     # Populate baseline sample dataset
POST /api/reset            # Reset state to blank baseline

# Operator Actions
POST /api/alarms/acknowledge # Acknowledge alarm by ID
POST /api/shift-logs        # Submit digital shift handover entry
POST /api/analysis/save     # Archive analysis snapshot to user account
```

---

## 📦 Local Setup & Docker Deployment

### Running Locally with Node.js
```bash
# 1. Install dependencies
npm install

# 2. Start dev server (Express REST API + Vite middleware)
npm run dev

# App will be accessible at http://localhost:3000
```

### Running with Docker
```bash
# Build Docker image
docker build -t oroc-refinery-app .

# Run Docker container
docker run -p 3000:3000 oroc-refinery-app
```

---

## 🛡️ License & Compliance
This application is designed in alignment with OSHA 1910.119 Process Safety Management (PSM) guidelines and EPA refinery sector emissions standards.
