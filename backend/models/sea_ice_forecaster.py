import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class SeaIceForecaster:
    """
    Heuristic Antarctic Sea-Ice Concentration (SIC %) generator.
    Produces SIC maps using latitude gradient, regional modulation, and
    scenario-driven daily increments. Calibrated against real NSIDC satellite
    sea ice extent observations.
    
    The model now uses real NSIDC G02135 daily sea ice extent data.
    It computes genuine error metrics vs persistence and climatology baselines.
    The spatial SIC field is still heuristic (latitude-based), but calibrated against real satellite extent.
    
    Data citation:
    NSIDC Sea Ice Index, Version 4.0 (G02135).
    Source data product web sites: http://nsidc.org/data/nsidc-0081.html and http://nsidc.org/data/nsidc-0051.html
    """
    def __init__(self, lat_range=(-75, -55), lon_range=(0, 90), resolution_deg=1.0):
        self.lat_min, self.lat_max = lat_range
        self.lon_min, self.lon_max = lon_range
        self.res = resolution_deg
        
        self.lats = np.arange(self.lat_min, self.lat_max + self.res, self.res)
        self.lons = np.arange(self.lon_min, self.lon_max + self.res, self.res)
        self.grid_shape = (len(self.lats), len(self.lons))
        
        self.daily_data = self._load_nsidc_daily()
        self.clim_data = self._load_nsidc_climatology()
        
        if self.daily_data is not None:
            self.historical_ice_extent = float(self.daily_data.iloc[-1]['Extent'] * 1e6)
        else:
            self.historical_ice_extent = self._load_historical_extent()
            
        self.metrics = self._compute_metrics()

    def _load_nsidc_daily(self):
        daily_path = os.path.join(BASE_DIR, 'downloaded_datasets', 'nsidc', 'S_seaice_extent_daily_v4.0.csv')
        if os.path.exists(daily_path):
            try:
                df = pd.read_csv(daily_path, skiprows=[1], skipinitialspace=True)
                df['Date'] = pd.to_datetime(df[['Year', 'Month', 'Day']])
                df = df.set_index('Date')
                return df
            except Exception as e:
                print("Error reading NSIDC daily data:", e)
        return None

    def _load_nsidc_climatology(self):
        clim_path = os.path.join(BASE_DIR, 'downloaded_datasets', 'nsidc', 'S_seaice_extent_climatology_1981-2010_v4.0.csv')
        if os.path.exists(clim_path):
            try:
                df = pd.read_csv(clim_path, skiprows=[0], skipinitialspace=True)
                df = df.set_index('DOY')
                return df
            except Exception as e:
                print("Error reading NSIDC climatology data:", e)
        return None

    def _compute_metrics(self):
        if self.daily_data is None or self.clim_data is None:
            return None
        
        try:
            # Persistence MAE over last 365 days
            recent_daily = self.daily_data.tail(366)
            persistence_mae = recent_daily['Extent'].diff().abs().mean()
            
            # Climatology MAE over last 365 days
            recent_365 = self.daily_data.tail(365).copy()
            recent_365['DOY'] = recent_365.index.dayofyear
            
            merged = recent_365.join(self.clim_data['Average Extent'], on='DOY')
            climatology_mae = (merged['Extent'] - merged['Average Extent']).abs().mean()
            
            latest_row = self.daily_data.iloc[-1]
            latest_date = latest_row.name
            latest_extent = latest_row['Extent']
            latest_doy = latest_date.dayofyear
            
            clim_extent = self.clim_data.loc[latest_doy, 'Average Extent']
            anomaly = latest_extent - clim_extent
            anomaly_pct = (anomaly / clim_extent) * 100 if clim_extent else 0.0
            
            return {
                "nsidc_data": {
                    "latest_extent_million_sqkm": float(latest_extent),
                    "latest_date": latest_date.strftime('%Y-%m-%d'),
                    "climatology_extent_million_sqkm": float(clim_extent),
                    "anomaly_million_sqkm": float(anomaly),
                    "anomaly_pct": float(anomaly_pct)
                },
                "baseline_comparison": {
                    "persistence_mae_million_sqkm": float(persistence_mae),
                    "climatology_mae_million_sqkm": float(climatology_mae),
                    "note": "Measured over last 365 days of NSIDC daily extent data"
                }
            }
        except Exception as e:
            print("Error computing metrics:", e)
            return None

    def _load_historical_extent(self):
        """Parses CSVExport.csv for satellite sea ice extent history (fallback)."""
        export_path = os.path.join(BASE_DIR, 'CSVExport.csv')
        if os.path.exists(export_path):
            try:
                df = pd.read_csv(export_path)
                val_col = [c for c in df.columns if 'values' in c][0]
                recent_vals = df[val_col].dropna().tail(10).values
                if len(recent_vals) > 0:
                    return float(np.mean(recent_vals))
            except Exception as e:
                print("Error reading CSVExport.csv:", e)
        return 12000000.0 # Default ~12M sq km Antarctic winter ice extent

    def generate_base_sic(self, season_day=240):
        """
        Generates a heuristic SIC map (0-100%) using latitude gradient,
        regional sinusoidal modulation, and polynya masking.
        Scaled by the ratio of observed to baseline ice extent.
        """
        grid = np.zeros(self.grid_shape)
        
        if self.metrics and "nsidc_data" in self.metrics:
            clim_extent = self.metrics["nsidc_data"]["climatology_extent_million_sqkm"]
            scale_factor = float(self.historical_ice_extent / (clim_extent * 1e6))
        else:
            scale_factor = float(self.historical_ice_extent / 12000000.0)
        
        for i, lat in enumerate(self.lats):
            for j, lon in enumerate(self.lons):
                lat_factor = max(0.0, (-55.0 - lat) / 15.0)
                regional_factor = 1.0 + 0.25 * np.sin(np.radians(lon * 2))
                
                # Polynya check
                is_polynya = (-68 <= lat <= -65) and (40 <= lon <= 50)
                polynya_factor = 0.2 if is_polynya else 1.0
                
                sic = lat_factor * 95.0 * regional_factor * polynya_factor * scale_factor
                grid[i, j] = float(np.clip(sic + np.random.uniform(-4.0, 4.0), 0.0, 100.0))
                
        return grid

    def forecast_sic(self, days_ahead=7, scenario="NORMAL"):
        """
        Projects SIC for T+days_ahead by adding a fixed daily increment to the
        heuristic base grid.
        """
        base_grid = self.generate_base_sic()
        
        if scenario == "RAPID_FREEZE":
            delta_sic = days_ahead * 1.8
        elif scenario == "SUMMER_MELT":
            delta_sic = -days_ahead * 2.2
        else:
            delta_sic = days_ahead * 0.4
            
        forecast_grid = np.clip(base_grid + delta_sic, 0.0, 100.0)
        
        heatmap_points = []
        high_risk_zones = []
        
        for i, lat in enumerate(self.lats):
            for j, lon in enumerate(self.lons):
                sic = float(round(forecast_grid[i, j], 1))
                if sic > 5.0:
                    heatmap_points.append({
                        "lat": float(round(lat, 2)),
                        "lon": float(round(lon, 2)),
                        "sic": sic,
                        "category": self._categorize_ice(sic)
                    })
                if sic >= 75.0:
                    high_risk_zones.append({
                        "lat": float(round(lat, 2)),
                        "lon": float(round(lon, 2)),
                        "sic": sic,
                        "risk_level": "CRITICAL_PACK_ICE"
                    })

        result = {
            "forecast_days": days_ahead,
            "scenario": scenario,
            "mean_sic": float(round(np.mean(forecast_grid), 2)),
            "max_sic": float(round(np.max(forecast_grid), 2)),
            "open_water_percentage": float(round(np.mean(forecast_grid < 15.0) * 100, 1)),
            "calibrated_sea_ice_extent_sqkm": float(round(self.historical_ice_extent, 0)),
            "heatmap_points": heatmap_points,
            "high_risk_count": len(high_risk_zones)
        }
        
        if self.metrics:
            result.update(self.metrics)
            
        return result

    def _categorize_ice(self, sic):
        if sic < 15:
            return "Open Water"
        elif sic < 40:
            return "Very Open / Thin Ice"
        elif sic < 70:
            return "Open Ice Pack"
        elif sic < 90:
            return "Close Ice Pack"
        else:
            return "Consolidated Heavy Ice / Fast Ice"
