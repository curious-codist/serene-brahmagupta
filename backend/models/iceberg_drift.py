import os
import math
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class IcebergDriftEngine:
    """
    Physics-based iceberg trajectory predictor.
    Computes iceberg drift using Lagrangian particle tracking with:
    - Aerodynamic drag (wind shear on above-water sail area)
    - Hydrodynamic drag (ocean current on below-water keel area)
    - Coriolis acceleration
    Forward Euler integration with velocity clamping for numerical stability.

    NOTE: Not an ML model. Uses constant forcing fields (single wind/current vector).
    TODO: Integrate spatially varying ERA5 wind and CMEMS ocean current fields,
    and validate trajectories against BYU/NIC observed iceberg positions.
    """
    def __init__(self):
        # Default physical constants for Southern Ocean
        self.rho_air = 1.25     # kg/m^3
        self.rho_water = 1027.0 # kg/m^3 (sea water)
        self.C_a = 0.7          # Air drag coefficient
        self.C_w = 0.9          # Water drag coefficient
        self.omega = 7.2921e-5  # Earth rotation rate (rad/s)

    def predict_trajectory(self, iceberg_id, name, start_lat, start_lon, length_m=1200, draft_m=150, hours_ahead=72, wind_speed_kts=20, wind_deg=310, current_speed_ms=0.4, current_deg=60):
        """
        Computes hourly predicted GPS coordinates for the iceberg up to hours_ahead,
        returning waypoint path, velocity vectors, collision buffer radius, and risk level.
        """
        lat = float(start_lat)
        lon = float(start_lon)
        
        # Iceberg mass estimation (tabular geometry approximation)
        width_m = length_m * 0.6
        height_above_water = draft_m / 7.0 # Iceberg buoyancy ratio (~1/7 above water)
        volume_m3 = length_m * width_m * (draft_m + height_above_water)
        mass_kg = volume_m3 * 900.0 # Ice density 900 kg/m^3
        
        sail_area = length_m * height_above_water # Area exposed to wind
        keel_area = length_m * draft_m            # Area exposed to ocean current

        # Convert wind & current direction to components (u = East, v = North)
        wind_rad = math.radians((270 - wind_deg) % 360)
        wind_u = (wind_speed_kts * 0.514444) * math.cos(wind_rad)
        wind_v = (wind_speed_kts * 0.514444) * math.sin(wind_rad)
        
        curr_rad = math.radians((270 - current_deg) % 360)
        curr_u = current_speed_ms * math.cos(curr_rad)
        curr_v = current_speed_ms * math.sin(curr_rad)

        trajectory = []
        u_ice, v_ice = curr_u * 0.7 + wind_u * 0.02, curr_v * 0.7 + wind_v * 0.02
        
        dt = 3600.0 # 1 hour timestep

        for step in range(0, hours_ahead + 1):
            # 1. Aerodynamic drag force
            du_wind = wind_u - u_ice
            dv_wind = wind_v - v_ice
            mag_wind = math.hypot(du_wind, dv_wind)
            F_wind_x = 0.5 * self.rho_air * self.C_a * sail_area * mag_wind * du_wind
            F_wind_y = 0.5 * self.rho_air * self.C_a * sail_area * mag_wind * dv_wind

            # 2. Hydrodynamic drag force
            du_curr = curr_u - u_ice
            dv_curr = curr_v - v_ice
            mag_curr = math.hypot(du_curr, dv_curr)
            F_curr_x = 0.5 * self.rho_water * self.C_w * keel_area * mag_curr * du_curr
            F_curr_y = 0.5 * self.rho_water * self.C_w * keel_area * mag_curr * dv_curr

            # 3. Coriolis force
            f_coriolis = 2.0 * self.omega * math.sin(math.radians(max(-89.9, min(89.9, lat))))
            F_cor_x = mass_kg * f_coriolis * v_ice
            F_cor_y = -mass_kg * f_coriolis * u_ice

            # 4. Net acceleration
            a_x = (F_wind_x + F_curr_x + F_cor_x) / mass_kg
            a_y = (F_wind_y + F_curr_y + F_cor_y) / mass_kg

            u_ice += a_x * dt
            v_ice += a_y * dt

            # Placeholder perturbation simulating unresolved mesoscale eddy effects.
            # TODO: Replace with learned residual from observed vs predicted trajectory error,
            # or sample from ERA5/CMEMS mesoscale eddy kinetic energy fields.
            eddy_perturbation_u = 0.03 * math.sin(step * 0.2)
            eddy_perturbation_v = 0.03 * math.cos(step * 0.2)
            
            effective_u_ice = np.clip(u_ice + eddy_perturbation_u, -2.5, 2.5)
            effective_v_ice = np.clip(v_ice + eddy_perturbation_v, -2.5, 2.5)

            # Update coordinates
            dx_meters = effective_u_ice * dt
            dy_meters = effective_v_ice * dt
            
            dlat = dy_meters / 111000.0
            dlon = dx_meters / (111000.0 * math.cos(math.radians(lat)))

            lat = max(-89.9, min(-50.0, lat + dlat))
            lon = (lon + dlon + 180) % 360 - 180

            uncertainty_radius_nm = round(2.0 + 0.12 * step, 1)
            speed_kts = math.hypot(effective_u_ice, effective_v_ice) * 1.94384

            trajectory.append({
                "hour": step,
                "lat": round(lat, 4),
                "lon": round(lon, 4),
                "speed_kts": round(speed_kts, 2),
                "heading_deg": round((270 - math.degrees(math.atan2(effective_v_ice, effective_u_ice))) % 360, 1),
                "hazard_radius_nm": uncertainty_radius_nm
            })

        return {
            "iceberg_id": str(iceberg_id),
            "name": name,
            "length_m": int(length_m),
            "draft_m": int(draft_m),
            "current_pos": {"lat": round(float(start_lat), 4), "lon": round(float(start_lon), 4)},
            "predicted_72h_pos": {"lat": trajectory[-1]["lat"], "lon": trajectory[-1]["lon"]},
            "drift_speed_kts": trajectory[-1]["speed_kts"],
            "hazard_radius_nm": trajectory[-1]["hazard_radius_nm"],
            "trajectory_points": trajectory[::3]
        }

def get_active_icebergs_catalog():
    """
    Parses real downloaded NIC Iceberg dataset (AntarcticIcebergs_20260827.csv) if present,
    otherwise falls back to default giant iceberg catalog.
    """
    engine = IcebergDriftEngine()
    nic_csv_path = os.path.join(BASE_DIR, 'AntarcticIcebergs_20260827.csv')
    
    catalog_raw = []
    
    if os.path.exists(nic_csv_path):
        try:
            df = pd.read_csv(nic_csv_path)
            # Columns: 'Iceberg', 'Length (NM)', 'Width (NM)', 'Latitude', 'Longitude', 'Area (sqKM)'
            for _, row in df.iterrows():
                length_nm = float(row['Length (NM)'])
                length_m = int(length_nm * 1852)
                # Draft estimation formula based on length & width buoyancy: draft ~ 120m + 15 * sqrt(area)
                area_sqkm = float(row.get('Area (sqKM)', 100))
                draft_m = int(min(350, max(100, 120 + 8 * math.sqrt(area_sqkm))))
                
                catalog_raw.append({
                    "id": str(row['Iceberg']),
                    "name": f"Iceberg {row['Iceberg']} (NIC Tracked)",
                    "lat": float(row['Latitude']),
                    "lon": float(row['Longitude']),
                    "length": length_m,
                    "draft": draft_m
                })
        except Exception as e:
            print("Error loading AntarcticIcebergs_20260827.csv:", e)

    if not catalog_raw:
        catalog_raw = [
            {"id": "A-76A", "name": "Giant Iceberg A-76A (Prydz Bay Drift)", "lat": -64.2, "lon": 56.5, "length": 4300, "draft": 220},
            {"id": "A-68A-1", "name": "Iceberg A-68 Fragment", "lat": -68.8, "lon": 14.2, "length": 1800, "draft": 160},
            {"id": "B-15Y", "name": "Tabular Berg B-15Y (Maitri Approach)", "lat": -69.1, "lon": 10.8, "length": 2100, "draft": 190},
            {"id": "C-38B", "name": "Pinnacled Iceberg C-38B (Bharati Corridor)", "lat": -67.5, "lon": 74.0, "length": 1100, "draft": 140},
            {"id": "D-28", "name": "Calved Berg D-28 (Amery Ice Shelf)", "lat": -66.1, "lon": 71.5, "length": 3200, "draft": 210}
        ]
    
    icebergs = []
    for item in catalog_raw:
        pred = engine.predict_trajectory(
            iceberg_id=item["id"],
            name=item["name"],
            start_lat=item["lat"],
            start_lon=item["lon"],
            length_m=item["length"],
            draft_m=item["draft"]
        )
        icebergs.append(pred)
        
    return icebergs
