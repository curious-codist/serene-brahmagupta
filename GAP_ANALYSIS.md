# Gap Analysis — Antarctic Sea-Ice, Iceberg & Navigation DSS

**SIH 2026 · Problem Statement 26059** — AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory, and Navigation Decision Support System
**Organization:** Ministry of Earth Sciences (MoES) / National Centre for Polar and Ocean Research (NCPOR)
**Repository reviewed:** `curious-codist/serene-brahmagupta` (branch `master`, 3 commits)
**Scope of review:** `download_ncpor_datasets.py`, `run_app.sh`, `backend/app.py`, `backend/models/{sea_ice_forecaster, iceberg_drift, pathfinder, weather_parser}.py`, `frontend/package.json`, repo tree.

---

## 1. Summary

The project already has a **working, integrated full-stack prototype** (Flask API + React/Vite/Leaflet frontend) and a **real data-collection pipeline** for NCPOR/IMD station data. That is significant — many teams never reach a running end-to-end system.

The core risk is that **three of the four problem-statement deliverables are currently simulated rather than real**: sea-ice forecasting, route optimization, and the reported performance metrics. Because judges from NCPOR/MoES are polar-science domain experts, these will not survive technical questioning in their current form. The remediation is very achievable: the skeleton and endpoints already exist, so each simulated core can be replaced with a real, validated one that slots into the API already wired up.

---

## 2. What is genuinely strong — keep and build on

- **Integrated full-stack system, wired end to end.** Flask API with coherent endpoints (`/api/health`, `/api/weather`, `/api/sea-ice/forecast`, `/api/icebergs`, `/api/route/compute`, `/api/simulate`, `/api/stats`), a React + Vite + Leaflet frontend, and `run_app.sh` orchestrating both.
- **Real mission data acquisition.** `download_ncpor_datasets.py` pulls authentic NCPOR/IMD datasets for Maitri, Bharati, and Dakshin Gangotri (surface, AWS, hydrographic).
- **The iceberg drift model is real physics, not a stub.** `iceberg_drift.py` computes aerodynamic drag, hydrodynamic drag, and Coriolis force, estimates mass from geometry, and integrates hourly. This is the correct physics baseline for the iceberg deliverable and is the strongest technical asset in the repo.
- **Naval-architecture framing is present.** Vessel profiles carry Polar Class and a `max_safe_sic` limit; `calculate_ice_resistance_penalty()` scales resistance with sea-ice concentration. This is the team's differentiator and should be emphasized.

---

## 3. Critical gaps (project-defining — fix before demo)

### 3.1 No sea-ice forecasting model
`SeaIceForecaster` does not learn or predict from data.
- `generate_base_sic()` is a hand-written analytic function: latitude factor × a sinusoidal regional factor × a hardcoded polynya patch × uniform random noise.
- `forecast_sic()` adds a fixed increment per day per scenario (`RAPID_FREEZE = +1.8/day`, `SUMMER_MELT = -2.2/day`, else `+0.4/day`).
- It never ingests the gridded satellite SIC data; it reads only a single scalar (mean of the last 10 values) from `CSVExport.csv`.
- No training, no validation, no baseline comparison.

**Impact:** the #1 deliverable ("forecast Antarctic sea-ice concentration") is generated, not forecast.

### 3.2 The route optimizer does not optimize
`pathfinder.py` imports `heapq` (for A*/Dijkstra) but never builds a graph or performs a search.
- `_generate_path_profile()` draws a straight line from origin to destination via `np.linspace`, then for the "safety" and "fuel" modes adds a fixed sine-wave offset to longitude (`2.5·sin` and `1.2·sin`).
- It flags `iceberg_nearby` but never reroutes around ice or icebergs.
- SIC along the path is re-synthesized with `lat_factor + random noise` instead of reading the forecast grid.

**Impact:** the three "routes" are cosmetic curves; the deliverable ("safe and fuel-efficient navigation routes") is decorative. `heapq` is imported but unused.

### 3.3 Fabricated performance metrics
`/api/stats` returns hardcoded values with no evaluation behind them:
- `sic_forecaster_accuracy_pct: 94.2`
- `physics_drift_model_rmse_km: 3.8`
- `fuel_savings_avg_pct: 18.5`
- `satellite_grid_resolution_km: 12.5`

There is no test set, held-out period, or baseline comparison anywhere in the code.

**Impact:** this is the highest-risk item. A single question ("94.2% against what test set?") exposes 3.1, 3.2, and 3.3 together. Honest, smaller numbers from a real evaluation are far safer than impressive invented ones.

### 3.4 Model docstrings overclaim
Code labelled "Spatiotemporal AI model", "Physics-Informed ML", and "mesoscale ML eddy residual" contains no machine learning — e.g. the "eddy residual" is `0.03·sin(step·0.2)`, a fixed deterministic wiggle. The honest framing (a physics drift model plus a heuristic ice map) is defensible on its own; the fake-ML labelling is what erodes credibility.

---

## 4. Data and reproducibility gaps

### 4.1 `venv/` is committed to version control
A virtual environment is machine- and OS-specific and large. It must be removed from Git and added to `.gitignore`. Committed, it breaks on every teammate's machine.

### 4.2 Large datasets committed to Git
Multiple `.zip`, `.xlsb`, `.nc`, and large `.csv` files are tracked. They bloat the repo and cause painful merges for a 6-person team. A download script already exists — data should be gitignored and regenerated from the script.

### 4.3 No `.gitignore`, no `requirements.txt`, no README
There is currently no way for a teammate or judge to recreate the Python environment or learn how to run the system. All three are prerequisites for team collaboration and for deployment.

### 4.4 `run_app.sh` is not cross-platform
It invokes `./venv/bin/python` (Linux/Mac layout). On the team's Windows machines the path is `venv\Scripts\python.exe`. Combined with the committed (wrong-OS) venv, the launcher is broken for the team.

### 4.5 Gridded ocean / ice / current data is not used
The spatial fields the navigation problem requires — gridded satellite SIC (NSIDC), ocean currents (CMEMS), 10 m winds (ERA5) over the corridor — are not ingested by any model. The IMD station data that was collected is coastal land-station weather: valuable for the weather panel and blizzard flags, but it cannot drive open-ocean sea-ice forecasting or currents along the route.

---

## 5. Model-specific issues (hardening the good iceberg engine)

### 5.1 Forcing is constant, not real fields
Every iceberg drifts under the same default wind (20 kt from 310°) and current (0.4 m/s toward 60°). A real predictor must sample ERA5 wind and CMEMS current at each iceberg's position and time.

### 5.2 The integration is numerically stiff
Forward Euler on the full momentum equation with a 1-hour timestep requires clipping velocity to ±2.5 m/s to remain stable — a band-aid. Iceberg drift is close to a force balance; either solve for the quasi-steady drift velocity or use a much smaller timestep.

### 5.3 No validation against observed tracks
The BYU / US National Ice Center data contains real past iceberg positions. Comparing predicted vs. observed position yields a genuine trajectory error, which is exactly how the fabricated 3.8 km RMSE (see 3.3) should be replaced.

---

## 6. Prioritized remediation plan

Do the cheap hygiene first (it unblocks the team), then make one core model real end-to-end before touching the others.

| # | Task | Why | Addresses |
|---|------|-----|-----------|
| 1 | **Repo hygiene:** remove `venv/` and large data from Git; add `.gitignore`, `requirements.txt`, README; fix the launcher for Windows | Stops teammates inheriting a broken repo; makes the project reproducible | 4.1–4.4 |
| 2 | **Make the sea-ice forecaster real:** train a simple model on gridded NSIDC SIC and report a genuine error beating a persistence baseline | Core deliverable; routing risk depends on it | 3.1, 4.5 |
| 3 | **Make the pathfinder a real A*/Dijkstra search** on a grid whose cell cost combines forecast SIC + iceberg exclusion zones + the existing ice-resistance function | Core deliverable; connects existing pieces (`heapq`, resistance model) into an actual search | 3.2 |
| 4 | **Feed real wind/current fields into the iceberg engine and validate against observed tracks** for a true position error | Turns the strongest asset into a defensible, measured predictor | 5.1–5.3 |
| 5 | **Replace `/api/stats` with real numbers** from steps 2–4 and rewrite overclaiming docstrings to describe what the code actually does | Removes the biggest integrity risk | 3.3, 3.4 |

**Reframe:** the hard, unglamorous part — a working integrated system with real data plumbing — is already built. What remains is converting three simulated cores into real, validated ones, and each fix drops straight into an endpoint that already exists.

---

*Prepared as a working checklist for the team. Update the "Addresses" column to `DONE` as each item is completed.*
