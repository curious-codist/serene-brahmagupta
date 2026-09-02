import React, { useState } from 'react';
import { Navigation, ShieldAlert, Fuel, Clock, ArrowRight, Download, Anchor } from 'lucide-react';

export default function RoutePlanner({ routesData, activeRouteMode, setActiveRouteMode, onRecomputeRoute, loading }) {
  const [selectedVessel, setSelectedVessel] = useState('ORV_SAGAR_NIDHI');
  const [destination, setDestination] = useState('MAITRI');

  const vessels = [
    { key: 'ORV_SAGAR_NIDHI', name: 'ORV Sagar Nidhi (NCPOR)', class: 'PC6 Ice Class' },
    { key: 'POLAR_ICEBREAKER', name: 'NCPOR Heavy Icebreaker', class: 'PC2 Polar Class' },
    { key: 'POLAR_SUPPLY_VESSEL', name: 'Antarctic Supply Vessel', class: 'PC7 Summer Class' }
  ];

  const handleCompute = () => {
    const destCoords = destination === 'MAITRI' ? { lat: -70.7667, lon: 11.7333 } : { lat: -69.4100, lon: 76.1900 };
    onRecomputeRoute({ vessel_key: selectedVessel, destination: destCoords });
  };

  const handleExport = (routeObj, modeName) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(routeObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NCPOR_Antarctic_Route_${modeName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const rData = routesData ? routesData.routes : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Route Control Header */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={20} className="gradient-text" />
              Multi-Objective Polar Pathfinder Controller
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Computes ice-resistance adjusted multi-objective routes for research vessels
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Vessel Profile</label>
              <select
                value={selectedVessel}
                onChange={(e) => setSelectedVessel(e.target.value)}
                style={{
                  background: 'rgba(7, 13, 24, 0.9)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-cyan)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontFamily: 'inherit'
                }}
              >
                {vessels.map(v => <option key={v.key} value={v.key}>{v.name} ({v.class})</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Destination Base</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                style={{
                  background: 'rgba(7, 13, 24, 0.9)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-cyan)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="MAITRI">Maitri Station (Queen Maud Land)</option>
                <option value="BHARATI">Bharati Station (Prydz Bay)</option>
              </select>
            </div>

            <button className="btn-primary" onClick={handleCompute} disabled={loading} style={{ marginTop: '16px' }}>
              <Anchor size={16} />
              {loading ? 'Computing Routes...' : 'Calculate Optimal Routes'}
            </button>
          </div>
        </div>
      </div>

      {/* Route Mode Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {[
          { key: 'ALL', label: 'View All Routes', color: 'var(--accent-cyan)' },
          { key: 'fuel_efficient', label: 'Optimal Fuel Route', color: '#00f2fe' },
          { key: 'safety', label: 'Maximum Safety Route', color: '#00e676' },
          { key: 'shortest', label: 'Shortest Route', color: '#ff416c' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveRouteMode(tab.key)}
            className="btn-outline"
            style={{
              borderColor: activeRouteMode === tab.key ? tab.color : 'var(--border-cyan)',
              color: activeRouteMode === tab.key ? tab.color : 'var(--text-main)',
              background: activeRouteMode === tab.key ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
              fontWeight: activeRouteMode === tab.key ? 700 : 400
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Triple Route Comparison Cards Grid */}
      {rData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {/* 1. Optimal Fuel Route Card */}
          <div className="glass-panel" style={{
            padding: '20px',
            borderLeft: '4px solid #00f2fe',
            opacity: (activeRouteMode === 'ALL' || activeRouteMode === 'fuel_efficient') ? 1 : 0.5
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.8rem' }}>RECOMMENDED FOR NCPOR</span>
              <button
                className="btn-outline"
                onClick={() => handleExport(rData.fuel_efficient, 'OptimalFuel')}
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                <Download size={12} /> GPX/JSON
              </button>
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00f2fe' }}>Optimal Fuel Route</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Balances wave drag, sea-ice resistance & tailwinds to minimize MGO fuel consumption.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Fuel Burn</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="mono">{rData.fuel_efficient.total_fuel_tons} Tons</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Voyage ETA</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="mono">{rData.fuel_efficient.estimated_time_days} Days</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="mono">{rData.fuel_efficient.total_distance_nm} NM</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Ice Risk</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#00e676' }} className="mono">{rData.fuel_efficient.max_sea_ice_risk_pct}%</div>
              </div>
            </div>
          </div>

          {/* 2. Maximum Safety Route Card */}
          <div className="glass-panel" style={{
            padding: '20px',
            borderLeft: '4px solid #00e676',
            opacity: (activeRouteMode === 'ALL' || activeRouteMode === 'safety') ? 1 : 0.5
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-green" style={{ fontSize: '0.8rem' }}>ZERO ICE HAZARD</span>
              <button
                className="btn-outline"
                onClick={() => handleExport(rData.safety, 'MaxSafety')}
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                <Download size={12} /> GPX/JSON
              </button>
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00e676' }}>Maximum Safety Route</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Maintains &gt;15nm buffer from giant icebergs and routes strictly through open water / thin ice.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Fuel Burn</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="mono">{rData.safety.total_fuel_tons} Tons</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Voyage ETA</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="mono">{rData.safety.estimated_time_days} Days</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="mono">{rData.safety.total_distance_nm} NM</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Safety Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#00e676' }} className="mono">{rData.safety.safety_score_100} / 100</div>
              </div>
            </div>
          </div>

          {/* 3. Shortest Route Card */}
          <div className="glass-panel" style={{
            padding: '20px',
            borderLeft: '4px solid #ff416c',
            opacity: (activeRouteMode === 'ALL' || activeRouteMode === 'shortest') ? 1 : 0.5
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-red" style={{ fontSize: '0.8rem' }}>HIGH ICE RESISTANCE</span>
              <button
                className="btn-outline"
                onClick={() => handleExport(rData.shortest, 'Shortest')}
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                <Download size={12} /> GPX/JSON
              </button>
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ff416c' }}>Shortest Geodesic Route</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Direct line path. Crosses heavy consolidated pack ice requiring icebreaking operations.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Fuel Burn</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ff416c' }} className="mono">{rData.shortest.total_fuel_tons} Tons</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Voyage ETA</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="mono">{rData.shortest.estimated_time_days} Days</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="mono">{rData.shortest.total_distance_nm} NM</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Ice Risk</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ff416c' }} className="mono">{rData.shortest.max_sea_ice_risk_pct}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
