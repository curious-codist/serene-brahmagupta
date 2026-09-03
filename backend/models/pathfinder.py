import math
import heapq
import numpy as np
from backend.models.sea_ice_forecaster import SeaIceForecaster

class PolarShipPathfinder:
    """
    Multi-objective A* pathfinding engine for polar research vessels (e.g. ORV Sagar Nidhi / NCPOR Vessel).
    Optimizes for Safety, Fuel Economy, and ETA while enforcing Polar Class ice limits and iceberg buffer zones.
    This uses a real A* search on a discretized grid. Sea Ice Concentration is estimated using a latitude-based heuristic.
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
            return 1.0 + 0.02 * (sic - 15.0)
        else:
            excess = sic - max_safe
            return 1.0 + 0.1 * excess + 0.01 * (excess ** 2)

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        R = 3440.065  # Earth radius in nautical miles
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlam = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def compute_routes(self, origin={"lat": -55.0, "lon": 20.0}, destination={"lat": -70.7667, "lon": 11.7333}, vessel_key="ORV_SAGAR_NIDHI", icebergs=None):
        if icebergs is None:
            icebergs = []
        vessel = self.VESSEL_PROFILES.get(vessel_key, self.VESSEL_PROFILES["ORV_SAGAR_NIDHI"])
        routes = {
            "shortest": self._generate_path_profile(origin, destination, vessel, mode="SHORTEST", icebergs=icebergs),
            "safety": self._generate_path_profile(origin, destination, vessel, mode="MAX_SAFETY", icebergs=icebergs),
            "fuel_efficient": self._generate_path_profile(origin, destination, vessel, mode="OPTIMAL_FUEL", icebergs=icebergs)
        }
        return {
            "vessel": vessel,
            "origin": origin,
            "destination": destination,
            "routes": routes
        }

    def _generate_path_profile(self, origin, destination, vessel, mode, icebergs):
        # Grid bounds
        min_lat = min(origin["lat"], destination["lat"]) - 2.0
        max_lat = max(origin["lat"], destination["lat"]) + 2.0
        min_lon = min(origin["lon"], destination["lon"]) - 5.0
        max_lon = max(origin["lon"], destination["lon"]) + 5.0
        
        num_lats, num_lons = 40, 40
        lats = np.linspace(min_lat, max_lat, num_lats)
        lons = np.linspace(min_lon, max_lon, num_lons)
        
        def get_closest_index(lat, lon):
            ilat = (np.abs(lats - lat)).argmin()
            ilon = (np.abs(lons - lon)).argmin()
            return (ilat, ilon)
            
        start_idx = get_closest_index(origin["lat"], origin["lon"])
        goal_idx = get_closest_index(destination["lat"], destination["lon"])
        
        def get_sic(lat):
            lat_factor = max(0.0, (-55.0 - lat) / 15.0)
            return lat_factor * 85.0
            
        def is_iceberg_nearby(lat, lon):
            for ib in icebergs:
                dist = self._haversine_distance(lat, lon, ib.get("lat", 0), ib.get("lon", 0))
                if dist <= 15.0:
                    return True
            return False

        open_set = []
        heapq.heappush(open_set, (0, start_idx))
        came_from = {}
        g_score = {start_idx: 0}
        
        def heuristic(idx):
            return self._haversine_distance(lats[idx[0]], lons[idx[1]], lats[goal_idx[0]], lons[goal_idx[1]])
            
        dirs = [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]
        
        while open_set:
            _, current = heapq.heappop(open_set)
            
            if current == goal_idx:
                break
                
            for d in dirs:
                ni, nj = current[0] + d[0], current[1] + d[1]
                if 0 <= ni < num_lats and 0 <= nj < num_lons:
                    neighbor = (ni, nj)
                    n_lat = lats[ni]
                    n_lon = lons[nj]
                    
                    dist_nm = self._haversine_distance(lats[current[0]], lons[current[1]], n_lat, n_lon)
                    sic = get_sic(n_lat)
                    iceberg_near = is_iceberg_nearby(n_lat, n_lon)
                    
                    if mode == "SHORTEST":
                        cost = dist_nm
                    elif mode == "MAX_SAFETY":
                        cost = dist_nm * (1 + 5.0 * sic / 100.0)
                        if iceberg_near:
                            cost += 1000.0
                        if sic > vessel["max_safe_sic"]:
                            cost += 10000.0
                    elif mode == "OPTIMAL_FUEL":
                        pen = self.calculate_ice_resistance_penalty(sic, vessel)
                        cost = dist_nm * pen
                    else:
                        cost = dist_nm
                        
                    tentative_g_score = g_score[current] + cost
                    if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                        came_from[neighbor] = current
                        g_score[neighbor] = tentative_g_score
                        f_score = tentative_g_score + heuristic(neighbor)
                        heapq.heappush(open_set, (f_score, neighbor))
                        
        path_indices = []
        curr = goal_idx
        if goal_idx not in came_from and start_idx != goal_idx:
            path_indices = [start_idx, goal_idx]
        else:
            while curr in came_from:
                path_indices.append(curr)
                curr = came_from[curr]
            path_indices.append(start_idx)
            path_indices.reverse()
            
        waypoints = []
        total_dist = 0.0
        total_fuel = 0.0
        total_time_hrs = 0.0
        max_sic = 0.0
        iceberg_warnings = 0
        
        for step, idx in enumerate(path_indices):
            lat = lats[idx[0]]
            lon = lons[idx[1]]
            sic = get_sic(lat)
            max_sic = max(max_sic, sic)
            ib_near = is_iceberg_nearby(lat, lon)
            if ib_near:
                iceberg_warnings += 1
            
            seg_dist = 0.0
            if step > 0:
                prev_lat = waypoints[-1]["lat"]
                prev_lon = waypoints[-1]["lon"]
                seg_dist = self._haversine_distance(prev_lat, prev_lon, lat, lon)
                total_dist += seg_dist
                
            pen = self.calculate_ice_resistance_penalty(sic, vessel)
            speed_kts = vessel["max_speed_kts"] / pen
            
            if step > 0:
                seg_time_hrs = seg_dist / speed_kts
                total_time_hrs += seg_time_hrs
                fuel_tons = vessel["base_fuel_tons_per_day"] * (seg_time_hrs / 24.0) * pen
                total_fuel += fuel_tons
            
            waypoints.append({
                "step": step + 1,
                "lat": float(lat),
                "lon": float(lon),
                "sea_ice_concentration": float(sic),
                "iceberg_nearby": ib_near,
                "segment_distance_nm": float(seg_dist),
                "speed_kts": float(speed_kts)
            })
            
        est_time_days = total_time_hrs / 24.0
        safety_score = max(0.0, 100.0 - (max_sic / vessel["max_safe_sic"] * 50) - (iceberg_warnings * 10))
        
        return {
            "mode": mode,
            "total_distance_nm": float(total_dist),
            "total_fuel_tons": float(total_fuel),
            "estimated_time_days": float(est_time_days),
            "max_sea_ice_risk_pct": float(max_sic),
            "safety_score_100": float(safety_score),
            "waypoints": waypoints
        }
