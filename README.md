# Antarctic Sea-Ice, Iceberg & Navigation Decision Support System

**Smart India Hackathon (SIH) 2026 · Problem Statement 26059**  
**Organization:** Ministry of Earth Sciences (MoES) / National Centre for Polar and Ocean Research (NCPOR)

---

## Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Data Sources & Acquisition](#-data-sources--acquisition)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Scientific Modeling Approach & Integrity](#-scientific-modeling-approach--integrity)
- [Known Limitations & Roadmap](#-known-limitations--roadmap)
- [Setup & Installation](#-setup--installation)
- [How to Run](#-how-to-run)
- [Contributing](#-contributing)
- [Citations & Acknowledgements](#-citations--acknowledgements)
- [License](#-license)
- [Team Information](#-team-information)

---

## 🧭 Project Overview

The **Antarctic Sea-Ice, Iceberg & Navigation Decision Support System (DSS)** is an operational planning and maritime routing platform engineered to assist polar research vessels (such as *ORV Sagar Nidhi*, *Akademik Fedorov*, and *SC Agulhas II*) navigating the Southern Ocean en route to Indian Antarctic research stations (**Maitri** and **Bharati**).

Navigating Antarctic waters presents extreme operational hazards, including dynamic sea-ice concentration, mobile tabular icebergs, violent blizzards, and shifting katabatic winds. This system combines authentic meteorological observations from Indian Antarctic research stations, a deterministic hydrodynamic-aerodynamic iceberg drift simulation engine, ice-resistance vessel dynamics, and graph-based route search to evaluate safe, fuel-conscious polar transit corridors.

---

## ✨ Key Features

1. **Real IMD Antarctic Station Weather Integration**
   - Direct ingestion of meteorological station data collected at **Maitri** (70°45′57″S, 11°44′09″E) and **Bharati** (69°24′28″S, 76°11′14″E).
   - Real-time station telemetry parsing: air temperature, wind speed, gust velocities, atmospheric pressure, and automatic Blizzard Condition warnings.

2. **Physics-Based Iceberg Drift Engine**
   - Deterministic numerical integration of forces acting on iceberg geometries (mass, draft, surface area):
     $$\vec{F}_{\text{total}} = \vec{F}_{\text{aero}} + \vec{F}_{\text{hydro}} + \vec{F}_{\text{coriolis}} + \vec{F}_{\text{pressure}}$$
   - Accounts for wind drag, ocean current drag, and latitude-dependent Coriolis acceleration ($f = 2\Omega\sin\phi$).
   - Calculates dynamic hazard exclusion radii around active tabular icebergs.

3. **A\*-Based Route Optimization with Ice Resistance Penalties**
   - Naval-architecture-informed route calculation evaluating waypoint grids across the Southern Ocean corridor.
   - Evaluates vessel-specific **Polar Class** ratings (e.g., PC-2, PC-5, Open Water / Non-Ice-Classed) with maximum safe sea-ice concentration thresholds.
   - Computes ice-resistance penalties scaling with sea-ice concentration (SIC) to provide multiple routing options (Fastest, Safety-First, Fuel-Optimized).

4. **US National Ice Center (NIC) Iceberg Tracking Integration**
   - Ingests tabular iceberg coordinates, dimensions (length/width in nautical miles), and tracking identifiers directly from NIC and Antarctic iceberg tracking databases (e.g., A-23A, B-15 derivatives).

5. **NSIDC Data Integration**
   - Comprehensive integration with NSIDC G02135 daily sea ice extent data (1978-present).
   - Includes over 15,830 daily records and climatology baselines stored locally for high-performance analysis.

---

## 🏛️ System Architecture

The platform is designed with a decoupled, high-performance architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                    │
│      • Interactive Leaflet Map & Tactical Southern Ocean UI │
│      • Vessel profile selector & live route visualizer      │
│      • Weather & Blizzard Alert Telemetry Cards             │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                     Flask Backend Server                    │
│                     (Port 5000 / Python)                    │
│                                                             │
│  ┌────────────────────────┐     ┌────────────────────────┐  │
│  │   Weather Parser       │     │   Iceberg Drift Engine │  │
│  │  (Maitri/Bharati IMD)  │     │  (Physics/Force Balance)│  │
│  └────────────────────────┘     └────────────────────────┘  │
│  ┌────────────────────────┐     ┌────────────────────────┐  │
│  │   Polar Pathfinder     │     │   Sea-Ice Forecaster   │  │
│  │  (A* & Resistance Pen.)│     │  (Scenario Projections)│  │
│  └────────────────────────┘     └────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Data Pipeline & Feeds                    │
│  • IMD / NCPOR Antarctic station records (Maitri & Bharati) │
│  • US National Ice Center (NIC) Antarctic Iceberg Database  │
│  • NSIDC Sea Ice Index historical extents                   │
└─────────────────────────────────────────────────────────────┘
```

- **Backend**: Python 3 / Flask REST API providing analytical endpoints for weather parsing, route optimization, iceberg drift calculations, and sea-ice simulation scenarios.
- **Frontend**: React 18 with Vite, Tailwind-free modular CSS design, Lucide icons, and Leaflet (`react-leaflet`) for polar-projection navigation charting.

---

## 📁 Project Structure

```text
serene-brahmagupta/
├── backend/
│   ├── app.py                          # Flask REST API server
│   └── models/
│       ├── sea_ice_forecaster.py        # SIC forecaster (NSIDC-calibrated)
│       ├── iceberg_drift.py             # Physics-based drift engine
│       ├── pathfinder.py                # A* route optimizer
│       └── weather_parser.py            # IMD station data parser
├── frontend/
│   ├── src/
│   │   ├── App.jsx                     # Main application shell
│   │   ├── index.css                   # Design system
│   │   └── components/
│   │       ├── MapDeck.jsx             # Leaflet map with SIC/routes/icebergs
│   │       ├── RoutePlanner.jsx        # Route comparison dashboard
│   │       ├── IcebergRadar.jsx        # Iceberg tracking cards
│   │       ├── WeatherDashboard.jsx    # IMD station telemetry
│   │       ├── ScenarioSimulator.jsx   # Stress-test scenarios
│   │       └── PitchDeck.jsx           # SIH solution overview
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── downloaded_datasets/
│   └── nsidc/                          # NSIDC G02135 sea ice data
├── AntarcticIcebergs_20260827.csv       # NIC iceberg catalog
├── CSVExport.csv                        # NSIDC sea ice extent index
├── imd_maitri.csv                       # IMD Maitri station data
├── imd_bharati_fixed_hour.csv           # IMD Bharati station data
├── download_ncpor_datasets.py           # Dataset acquisition script
├── run_app.sh                           # Launch script
├── requirements.txt                     # Python dependencies
├── GAP_ANALYSIS.md                      # Technical gap analysis
└── .gitignore
```

---

## 📊 Data Sources & Acquisition

- **NCPOR / IMD Antarctic Station Datasets**: Surface meteorological records, AWS readings, and hydrographic survey data from Maitri, Bharati, and Dakshin Gangotri.
- **US National Ice Center (NIC) Iceberg Database**: Tabular iceberg positions, drift trajectories, and dimensional classifications.
- **National Snow and Ice Data Center (NSIDC)**: Antarctic sea-ice extent and concentration references. Downloaded NSIDC G02135 daily sea ice extent data (1978-present, ~15,830 daily records) and climatology baselines are stored in `downloaded_datasets/nsidc/`.
- **Automated Ingestion Script**: `download_ncpor_datasets.py` provides automated downloads and updates for official mission datasets.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check, problem statement metadata, and service status |
| `GET` | `/api/weather` | Real weather parameters, pressure trends, and blizzard status from Maitri IMD station |
| `GET` | `/api/sea-ice/forecast` | Sea-ice concentration (SIC) forecast grids for customizable projection windows and scenarios |
| `GET` | `/api/icebergs` | Active catalog of tracked Antarctic icebergs with coordinates, dimensions, and hazard zones |
| `POST` | `/api/route/compute` | Calculates navigation routes between origin and destination based on vessel polar class and safety constraints |
| `POST` | `/api/simulate` | Executes multi-day environmental scenarios (`STORM_DRIFT`, `RAPID_FREEZE`, `SUMMER_MELT`, `ICEBERG_CALVING`) |
| `GET` | `/api/stats` | System metrics, operational parameters, and navigation statistics |

---

## 🧪 Scientific Modeling Approach & Integrity

- **Physics-First Baseline**: The iceberg drift module operates on verified Newtonian mechanics and hydrodynamic drag formulations rather than opaque black-box regressions.
- **Polar Navigation Dynamics**: Route risk modeling integrates empirical ice-resistance coefficients derived from naval polar architecture guidelines.
- **Transparent Capabilities**: The system distinguishes between deterministic numerical physics calculations, empirical heuristic maps, and operational forecasting baselines, maintaining strict scientific rigor suitable for validation by polar researchers at NCPOR/MoES.

---

## 🚧 Known Limitations & Roadmap

In the interest of scientific integrity, the following limitations in the current prototype are documented:

- **Heuristic Sea-Ice Concentration (SIC)**: The current SIC spatial field is estimated using a heuristic latitude-based model rather than being derived from live, gridded satellite imagery.
- **Constant Environmental Forcing**: The iceberg drift forcing model utilizes constant wind and current vectors, lacking spatially and temporally varying fields.
- **Heuristic Route Optimization**: The A* route optimizer relies on the aforementioned heuristic SIC estimation rather than high-resolution satellite-derived grids.

**Roadmap for Future Releases**:
- Integrate NSIDC true gridded SIC data for accurate, real-world spatial fields.
- Incorporate ERA5 atmospheric and CMEMS oceanic forcing fields for dynamic, spatially varying iceberg trajectories.
- Conduct thorough trajectory validation against historical tracking data.

---

## ⚙️ Setup & Installation

### Prerequisites
- **Python**: Version 3.10+ (with `venv` and `pip`)
- **Node.js**: Version 18+ (with `npm`)

### 1. Clone the Repository
```bash
git clone https://github.com/curious-codist/serene-brahmagupta.git
cd serene-brahmagupta
```

### 2. Python Virtual Environment Setup
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux / macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

---

## 🚀 How to Run

### Option A: Automated Launch Script (Recommended)
Run the root launch script, which automatically checks your environment, installs frontend packages if missing, and launches both services:

```bash
bash run_app.sh
```

### Option B: Manual Execution

1. **Start the Flask Backend API:**
   ```bash
   # From the repository root with venv activated
   python backend/app.py
   ```
   *The Flask API will start on `http://localhost:5000`.*

2. **Start the Vite Frontend Application:**
   ```bash
   # In a separate terminal
   cd frontend
   npm run dev
   ```
   *The Web UI will be available at `http://localhost:3000`.*

---

## 🤝 Contributing

We welcome contributions from hackathon team members and future collaborators! Please follow these guidelines:

1. **Development Environment**: Ensure you have configured the virtual environment and Node packages as described in the Setup section.
2. **Code Style**:
   - **Python**: Follow PEP 8 guidelines for all backend code.
   - **JavaScript/React**: Adhere to ESLint defaults configured in the frontend project.
3. **Branch Workflow**: 
   - Never commit directly to `main`. 
   - Create a feature branch off `main` (e.g., `feature/iceberg-drift-update`).
   - Submit a pull request for review before merging.
4. **Adding New Models/Endpoints**:
   - Backend logic should be implemented in `backend/models/`.
   - Expose new functionality via blueprints or route definitions in `backend/app.py`.
5. **Adding New Datasets**:
   - Place raw data files in `downloaded_datasets/` or the repository root if small enough.
   - Update `download_ncpor_datasets.py` if the dataset requires automated downloading or pre-processing.

---

## 📚 Citations & Acknowledgements

**NSIDC Data Citation**:
> Fetterer, F., K. Knowles, W. N. Meier, M. Savoie, and A. K. Windnagel. 2017, updated daily.
> Sea Ice Index, Version 3. Boulder, Colorado USA. NSIDC: National Snow and Ice Data Center.
> doi: https://doi.org/10.7265/N5K072F8.

---

## 📄 License

*(License Placeholder: To be determined prior to final open-source release.)*

---

## 👥 Team Information

- **Institution / Team**: *[kuch_bhi / IIT Kharagpur]*
- **Smart India Hackathon 2026**: 
- **Members**:
  - Member 1 - Pranav Agrawal
  - Member 2 - Aryan Baheti
  - Member 3 - Rachana Balot
  - Member 4 - Rudra Pratap
  - Member 5 - Harsh Lamba
  - Member 6 - Saurav Raj
