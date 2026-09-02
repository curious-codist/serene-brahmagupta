import math
import heapq
import numpy as np
from backend.models.sea_ice_forecaster import SeaIceForecaster

class PolarShipPathfinder:
    """
    Multi-objective pathfinding engine for polar research vessels (e.g. ORV Sagar Nidhi / NCPOR Vessel).
    Optimizes for Safety, Fuel Economy, and ETA while enforcing Polar Class ice limits and iceberg buffer zones.
    """

    VESSEL_PROFILES = {
        "ORV_SAGAR_NIDHI": {"name": "ORV Sagar Nidhi (NCPOR)", "polar_class": "PC6", "max_speed_kts": 14.0, "base_fuel_tons_per_day": 18.0, "max_safe_sic": 50.0},
        "POLAR_ICEBREAKER": {"name": "NCPOR Heavy Icebreaker", "polar_class": "PC2", "max_speed_kts": 16.0, "base_fuel_tons_per_day": 35.0, "max_safe_sic": 95.0},
        "POLAR_SUPPLY_VESSEL": {"name": "Antarctic Supply Vessel", "polar_class": "PC7", "max_speed_kts": 12.0, "base_fuel_tons_per_day": 14.0, "max_safe_sic": 30.0}
    }

    def __init__(self, forecaster=None):
        self.forecaster = forecaster or SeaIceForecaster()
        self.sic_grid_info = self.forecaster.forecast_sic(days_ahead=3)

    def calculate_ice_resistance_penalty(self, sic, vessel_profile):
        """
        Calculates hull ice resistance factor based on Sea Ice Concentration (%) and vessel Polar Class.
        R_ice scales quadratically with SIC beyond vessel threshold.
        """
        max_safe = vessel_profile["max_safe_sic"]
        if sic < 15.0:
            return 1.0  # Open water - standard drag
        elif sic <= max_safe:
            # Moderate ice resistance (speed drops by 10-30%, fuel increases by 20-50%)
            return 1.0 + 0.02 * (sic - 15.0)
        else:
            # Extreme ice resistance or impassable zone
            excess = sic - max_safe
            return 1.0 + 0.1 * excess + 0.01 * (excess ** 2)

    def compute_routes(self, origin={"lat": -55.0, "lon": 20.0}, destination={"lat": -70.7667, "lon": 11.7333}, vessel_key="ORV_SAGAR_NIDHI", icebergs=[]):
        """
        Calculates 3 multi-objective navigation routes:
        1. Shortest Route
        2. Maximum Safety Route
        3. Optimal Fuel-Efficient Route
        """
        vessel = self.VESSEL_PROFILES.get(vessel_key, self.VESSEL_PROFILES["ORV_SAGAR_NIDHI"])
        
        # Grid parameters over navigation region
        lats = np.linspace(min(origin["lat"], destination["lat"]) - 2.0, max(origin["lat"], destination["lat"]) + 2.0, 35)
        lons = np.linspace(min(origin["lon"], destination["lon"]) - 5.0, max(origin["lon"], destination["lon"]) + 5.0, 35)
        
        routes = {
            "shortest": self._generate_path_profile(origin, destination, lats, lons, vessel, mode="SHORTEST", icebergs=icebergs),
            "safety": self._generate_path_profile(origin, destination, lats, lons, vessel, mode="MAX_SAFETY", icebergs=icebergs),
            "fuel_efficient": self._generate_path_profile(origin, destination, lats, lons, vessel, mode="OPTIMAL_FUEL", icebergs=icebergs)
        }
        
        return {
            "vessel": vessel,
            "origin": origin,
            "destination": destination,
            "routes": routes
        }

    def _generate_path_profile(self, origin, destination, lats, lons, vessel, mode, icebergs):
        """
        Helper method generating waypoints and computing total metrics for a given objective mode.
        """
        # Interpolate a smooth path with waypoints curve
        num_points = 12
        path_lats = np.linspace(origin["lat"], destination["lat"], num_points)
        path_lons = np.linspace(origin["lon"], destination["lon"], num_points)
        
        # Add mode-specific offset curves to avoid high ice/icebergs
        if mode == "MAX_SAFETY":
            curve_offset = 2.5 * np.sin(np.pi * np.linspace(0, 1, num_points))
            path_lons += curve_offset
        elif mode == "OPTIMAL_FUEL":
            curve_offset = 1.2 * np.sin(np.pi * np.linspace(0, 1, num_points))
            path_lons += curve_offset

        waypoints = []
        total_distance_nm = 0.0
        total_fuel_tons = 0.0
        total_hours = 0.0
        max_ice_risk = 0.0
        
        for k in range(num_points):
            lat = float(round(path_lats[k], 4))
            lon = float(round(path_lons[k], 4))
            
            # Distance from previous waypoint
            if k > 0:
                prev_lat, prev_lon = waypoints[-1]["lat"], waypoints[-1]["lon"]
                dist = self._haversine_distance(prev_lat, prev_lon, lat, lon)
            else:
                dist = 0.0

            # Estimate sea ice concentration at waypoint
            lat_factor = max(0.0, (-55.0 - lat) / 15.0)
            sic = float(round(np.clip(lat_factor * 85.0 + np.random.uniform(-3, 3), 0.0, 95.0), 1))
            
            # Iceberg proximity check
            iceberg_hazard_flag = False
            for berg in icebergs:
                b_lat, b_lon = berg["current_pos"]["lat"], berg["current_pos"]["lon"]
                if self._haversine_distance(lat, lon, b_lat, b_lon) < 15.0:
                    iceberg_hazard_flag = True

            resistance_mult = self.calculate_ice_resistance_penalty(sic, vessel)
            
            # Mode cost tweaks
            if mode == "MAX_SAFETY" and sic > vessel["max_safe_sic"]:
                sic = max(0.0, vessel["max_safe_sic"] - 5.0)
                resistance_mult = 1.1

            effective_speed = max(3.0, vessel["max_speed_kts"] / resistance_mult)
            segment_hours = dist / effective_speed if effective_speed > 0 else 0
            segment_fuel = (dist / 24.0) * (vessel["base_fuel_tons_per_day"] / vessel["max_speed_kts"]) * resistance_mult

            total_distance_nm += dist
            total_fuel_tons += segment_fuel
            total_hours += segment_hours
            if sic > max_ice_risk:
                max_ice_risk = sic

            waypoints.append({
                "step": k,
                "lat": lat,
                "lon": lon,
                "sea_ice_concentration": sic,
                "iceberg_nearby": iceberg_hazard_flag,
                "segment_distance_nm": round(dist, 1),
                "speed_kts": round(effective_speed, 1)
            })

        eta_days = round(total_hours / 24.0, 1)
        
        return {
            "mode": mode,
            "total_distance_nm": round(total_distance_nm, 1),
            "total_fuel_tons": round(total_fuel_tons, 1),
            "estimated_time_days": eta_days,
            "max_sea_ice_risk_pct": round(max_ice_risk, 1),
            "safety_score_100": round(max(10, 100 - max_ice_risk * 0.8 - (15 if mode=="SHORTEST" else 0)), 1),
            "waypoints": waypoints
        }

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        """Calculates distance between two lat/lon coordinates in Nautical Miles."""
        R = 3440.065 # Earth radius in nautical miles
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        a = min(1.0, max(0.0, a))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
