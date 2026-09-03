import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS

# Add root folder to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.weather_parser import get_maitri_weather_summary
from backend.models.sea_ice_forecaster import SeaIceForecaster
from backend.models.iceberg_drift import get_active_icebergs_catalog, IcebergDriftEngine
from backend.models.pathfinder import PolarShipPathfinder

app = Flask(__name__)
CORS(app)

forecaster = SeaIceForecaster()
pathfinder = PolarShipPathfinder(forecaster=forecaster)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ONLINE",
        "system": "NCPOR Antarctic Navigation & Decision Support System",
        "problem_statement_id": "SIH-26059",
        "version": "1.0.0",
        "organization": "National Centre for Polar and Ocean Research (NCPOR) / MoES"
    })

@app.route('/api/weather', methods=['GET'])
def get_weather():
    try:
        data = get_maitri_weather_summary()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/sea-ice/forecast', methods=['GET'])
def get_sea_ice_forecast():
    days = int(request.args.get('days', 7))
    scenario = request.args.get('scenario', 'NORMAL')
    try:
        result = forecaster.forecast_sic(days_ahead=days, scenario=scenario)
        return jsonify({"success": True, "forecast": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/icebergs', methods=['GET'])
def get_icebergs():
    try:
        icebergs = get_active_icebergs_catalog()
        return jsonify({"success": True, "count": len(icebergs), "icebergs": icebergs})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/route/compute', methods=['POST'])
def compute_route():
    body = request.json or {}
    origin = body.get('origin', {"lat": -55.0, "lon": 20.0})
    destination = body.get('destination', {"lat": -70.7667, "lon": 11.7333}) # Default Maitri
    vessel_key = body.get('vessel_key', 'ORV_SAGAR_NIDHI')
    
    try:
        icebergs = get_active_icebergs_catalog()
        routes_data = pathfinder.compute_routes(
            origin=origin,
            destination=destination,
            vessel_key=vessel_key,
            icebergs=icebergs
        )
        return jsonify({"success": True, "data": routes_data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/simulate', methods=['POST'])
def run_simulation():
    body = request.json or {}
    scenario_type = body.get('scenario', 'STORM_DRIFT') # RAPID_FREEZE, SUMMER_MELT, STORM_DRIFT, ICEBERG_CALVING
    days = int(body.get('days', 5))
    
    try:
        sic_result = forecaster.forecast_sic(days_ahead=days, scenario=scenario_type)
        icebergs = get_active_icebergs_catalog()
        
        # Modify iceberg speeds in storm drift
        if scenario_type == 'STORM_DRIFT':
            for berg in icebergs:
                berg['drift_speed_kts'] = round(berg['drift_speed_kts'] * 2.1, 1)
                berg['hazard_radius_nm'] = round(berg['hazard_radius_nm'] * 1.8, 1)

        return jsonify({
            "success": True,
            "scenario": scenario_type,
            "days_projected": days,
            "sea_ice_summary": sic_result,
            "affected_icebergs": icebergs
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    icebergs = get_active_icebergs_catalog()
    sic_info = forecaster.forecast_sic(days_ahead=1)
    baseline = sic_info.get("baseline_comparison", {})
    return jsonify({
        "success": True,
        "metrics": {
            "satellite_grid_resolution_km": 12.5,
            "sic_extent_persistence_mae_sqkm": baseline.get("persistence_mae_million_sqkm"),
            "sic_extent_climatology_mae_sqkm": baseline.get("climatology_mae_million_sqkm"),
            "sic_forecaster_note": "Evaluated against 365 days of NSIDC G02135 daily extent observations",
            "iceberg_tracking_count": len(icebergs),
            "physics_drift_model_rmse_km": None,
            "drift_model_rmse_note": "Pending validation against BYU/NIC observed iceberg tracks",
            "fuel_savings_avg_pct": None,
            "fuel_savings_note": "Pending measurement — requires A* route vs great-circle baseline comparison",
            "vessels_supported": 3,
            "evaluation_status": "partially_evaluated"
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
