import React, { useState, useEffect } from 'react';
import { Map, Navigation, Compass, CloudSnow, Play, Award, RefreshCw, ShieldAlert, Code2, Server } from 'lucide-react';
import MapDeck from './components/MapDeck';
import RoutePlanner from './components/RoutePlanner';
import IcebergRadar from './components/IcebergRadar';
import WeatherDashboard from './components/WeatherDashboard';
import ScenarioSimulator from './components/ScenarioSimulator';
import PitchDeck from './components/PitchDeck';

export default function App() {
  const [activeTab, setActiveTab] = useState('MAP');
  const [activeRouteMode, setActiveRouteMode] = useState('ALL');
  const [showApiInspector, setShowApiInspector] = useState(false);

  // Backend state
  const [weatherData, setWeatherData] = useState(null);
  const [seaIceData, setSeaIceData] = useState(null);
  const [icebergs, setIcebergs] = useState([]);
  const [routesData, setRoutesData] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on initial load
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Health API
      const hRes = await fetch('/api/health');
      const hJson = await hRes.json();
      setApiHealth(hJson);

      // 2. Weather API
      const wRes = await fetch('/api/weather');
      const wJson = await wRes.json();
      if (wJson.success) setWeatherData(wJson.data);

      // 3. Sea Ice Forecast API
      const sRes = await fetch('/api/sea-ice/forecast?days=7');
      const sJson = await sRes.json();
      if (sJson.success) setSeaIceData(sJson.forecast);

      // 4. Icebergs API
      const iRes = await fetch('/api/icebergs');
      const iJson = await iRes.json();
      if (iJson.success) setIcebergs(iJson.icebergs);

      // 5. Initial Route Calculation API
      const rRes = await fetch('/api/route/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vessel_key: 'ORV_SAGAR_NIDHI' })
      });
      const rJson = await rRes.json();
      if (rJson.success) setRoutesData(rJson.data);

    } catch (err) {
      console.error("API error:", err);
      setError("Failed to connect to NCPOR Python API backend. Ensure Flask process is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRecomputeRoute = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch('/api/route/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setRoutesData(json.data);
      }
    } catch (e) {
      console.error("Error recomputing route:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setSimulationResult(json);
        if (json.sea_ice_summary) setSeaIceData(json.sea_ice_summary);
        if (json.affected_icebergs) setIcebergs(json.affected_icebergs);
      }
    } catch (e) {
      console.error("Error simulating scenario:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <header className="glass-panel" style={{
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        padding: '14px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070d18',
              boxShadow: '0 0 16px rgba(0, 242, 254, 0.4)'
            }}>
              <Compass size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                NCPOR / MOES • SIH PROBLEM STATEMENT 26059
              </div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }} className="gradient-text">
                Antarctic Navigation & Sea-Ice Decision Support System
              </h1>
            </div>
          </div>

          {/* Top Indicators & API Explorer Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="badge badge-cyan"
              onClick={() => setShowApiInspector(!showApiInspector)}
              style={{ border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <Server size={14} /> NCPOR API: {apiHealth ? 'ONLINE' : 'CONNECTING...'}
            </button>
            <button className="btn-outline" onClick={fetchAllData} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Sync Data
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'MAP', label: 'Command Deck Map', icon: Map },
            { id: 'PATHFINDER', label: 'Route Pathfinder', icon: Navigation },
            { id: 'ICEBERGS', label: 'Iceberg Radar', icon: Compass },
            { id: 'WEATHER', label: 'IMD Station Weather', icon: CloudSnow },
            { id: 'SIMULATOR', label: 'Scenario Simulator', icon: Play },
            { id: 'PITCH', label: 'SIH Solution Roadmap', icon: Award }
          ].map(tab => {
            const IconComp = tab.icon;
            const isAct = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn-outline"
                style={{
                  border: isAct ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                  background: isAct ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: isAct ? 'var(--accent-cyan)' : 'var(--text-main)',
                  fontWeight: isAct ? 700 : 500,
                  fontSize: '0.825rem',
                  padding: '8px 14px'
                }}
              >
                <IconComp size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* NCPOR Live API Inspector Drawer Modal */}
      {showApiInspector && (
        <div style={{
          background: 'rgba(7, 13, 24, 0.95)',
          borderBottom: '1px solid var(--accent-cyan)',
          padding: '20px 24px',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} /> Live NCPOR Python REST API Endpoints Explorer
            </h3>
            <button className="btn-outline" onClick={() => setShowApiInspector(false)} style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
              ✕ Close
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            The NCPOR API runs on Python Flask (`backend/app.py`), serving real-time spatial sea-ice forecasts, physics iceberg trajectories, and polar ship pathfinding data to this frontend.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {[
              { path: '/api/health', method: 'GET', desc: 'System health & MoES/NCPOR Metadata', status: apiHealth ? '200 OK' : 'PENDING' },
              { path: '/api/weather', method: 'GET', desc: 'IMD Maitri & Bharati Telemetry Logs', status: weatherData ? '200 OK' : 'PENDING' },
              { path: '/api/sea-ice/forecast?days=7', method: 'GET', desc: 'Heuristic Sea-Ice Concentration Forecast Grids', status: seaIceData ? '200 OK' : 'PENDING' },
              { path: '/api/icebergs', method: 'GET', desc: 'NIC Tracked Icebergs & 72h Physics-Based Drift Cones', status: icebergs.length > 0 ? `200 OK (${icebergs.length} bergs)` : 'PENDING' },
              { path: '/api/route/compute', method: 'POST', desc: 'Multi-Objective Polar Pathfinder Engine', status: routesData ? '200 OK' : 'PENDING' }
            ].map((endpoint, eIdx) => (
              <div key={`ep-${eIdx}`} className="stat-card" style={{ fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{endpoint.method}</span>
                  <span style={{ color: '#00e676', fontWeight: 700 }} className="mono">{endpoint.status}</span>
                </div>
                <div style={{ fontWeight: 700, margin: '4px 0' }} className="mono">{endpoint.path}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{endpoint.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main App Workspace */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
        {error && (
          <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #ff416c', marginBottom: '16px', color: '#ff416c' }}>
            <ShieldAlert size={18} style={{ marginRight: '8px', display: 'inline' }} /> {error}
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'MAP' && (
          <MapDeck
            seaIceData={seaIceData}
            icebergs={icebergs}
            routesData={routesData}
            activeRouteMode={activeRouteMode}
          />
        )}

        {activeTab === 'PATHFINDER' && (
          <RoutePlanner
            routesData={routesData}
            activeRouteMode={activeRouteMode}
            setActiveRouteMode={setActiveRouteMode}
            onRecomputeRoute={handleRecomputeRoute}
            loading={loading}
          />
        )}

        {activeTab === 'ICEBERGS' && (
          <IcebergRadar icebergs={icebergs} />
        )}

        {activeTab === 'WEATHER' && (
          <WeatherDashboard weatherData={weatherData} />
        )}

        {activeTab === 'SIMULATOR' && (
          <ScenarioSimulator
            onRunSimulation={handleRunSimulation}
            simulationResult={simulationResult}
            loading={loading}
          />
        )}

        {activeTab === 'PITCH' && (
          <PitchDeck />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '16px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        National Centre for Polar and Ocean Research (NCPOR) • Ministry of Earth Sciences (MoES) • Smart India Hackathon PS 26059
      </footer>
    </div>
  );
}
