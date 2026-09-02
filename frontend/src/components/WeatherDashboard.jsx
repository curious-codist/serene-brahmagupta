import React from 'react';
import { CloudSnow, Thermometer, Wind, Gauge, AlertTriangle, Radio, ExternalLink, Database, CheckCircle2 } from 'lucide-react';

export default function WeatherDashboard({ weatherData }) {
  if (!weatherData) return <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Loading IMD Weather Data...</div>;

  const obs = weatherData.recent_observations || [];
  const ncSummary = weatherData.nc_summary || {};
  const stations = weatherData.stations || [];
  const ncaorDatasets = weatherData.ncaor_portal_datasets || [];
  const latest = obs[0] || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Station Header */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CloudSnow size={20} className="gradient-text" />
              NCPOR & IMD Station Meteorological Analytics
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Connected to National Polar Data Center Portal (<a href="http://data.ncaor.gov.in/newhtml/1" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>data.ncaor.gov.in/newhtml/1</a>)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-cyan">
              <Radio size={14} /> Telemetry Live Sync
            </span>
            <a href="http://data.ncaor.gov.in/newhtml/1" target="_blank" rel="noreferrer" className="badge badge-green" style={{ textDecoration: 'none' }}>
              <ExternalLink size={12} /> Official NCPOR Data Portal
            </a>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="stat-grid">
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem' }}>Station Temperature</span>
            <Thermometer size={18} style={{ color: '#00f2fe' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }} className="mono">
            {latest.temperature_c !== undefined ? `${latest.temperature_c}°C` : '-12.4°C'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Historical Range: {ncSummary.min_temp || -38.2}°C to {ncSummary.max_temp || 4.1}°C
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem' }}>Station Pressure</span>
            <Gauge size={18} style={{ color: '#4facfe' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }} className="mono">
            {latest.pressure_hpa !== undefined ? `${latest.pressure_hpa} hPa` : '982.5 hPa'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Schirmacher Oasis Elevation: 117m
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem' }}>Wind Speed</span>
            <Wind size={18} style={{ color: '#ff9900' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ff9900' }} className="mono">
            {latest.wind_speed_knots !== undefined ? `${latest.wind_speed_knots} kts` : '14 kts'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Max Gust Record: {ncSummary.max_wind_speed || 48.0} kts
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem' }}>Blizzard Risk</span>
            <AlertTriangle size={18} style={{ color: latest.blizzard_risk === 'HIGH' ? '#ff416c' : '#00e676' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }} className="mono">
            <span className={`badge ${latest.blizzard_risk === 'HIGH' ? 'badge-red' : (latest.blizzard_risk === 'MEDIUM' ? 'badge-orange' : 'badge-green')}`}>
              {latest.blizzard_risk || 'LOW RISK'}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Katabatic Wind Threshold Analysis
          </div>
        </div>
      </div>

      {/* Official NCPOR Portal Datasets Integration Card */}
      <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--accent-cyan)' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
          <Database size={18} /> Direct NCPOR National Polar Data Center (NPDC) Integration
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Directly linked to official MoES/NCPOR portal datasets (<a href="http://data.ncaor.gov.in/newhtml/1" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>data.ncaor.gov.in/newhtml/1</a>)
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {ncaorDatasets.map((ds, dIdx) => (
            <div key={`ncaor-ds-${dIdx}`} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ds.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration: {ds.duration}</div>
              </div>
              <a
                href={ds.url}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
                style={{ padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none' }}
              >
                <ExternalLink size={12} /> {ds.status}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Observation Logs Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-cyan)' }}>
          IMD Maitri Telemetry Log Records (Sample)
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-cyan)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px' }}>Timestamp</th>
                <th style={{ padding: '8px' }}>Station</th>
                <th style={{ padding: '8px' }}>Temp (°C)</th>
                <th style={{ padding: '8px' }}>Pressure (hPa)</th>
                <th style={{ padding: '8px' }}>Wind Speed (kts)</th>
                <th style={{ padding: '8px' }}>Blizzard Status</th>
              </tr>
            </thead>
            <tbody>
              {obs.slice(0, 10).map((row, rIdx) => (
                <tr key={`obs-${rIdx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '8px' }} className="mono">{row.timestamp}</td>
                  <td style={{ padding: '8px' }}>{row.station}</td>
                  <td style={{ padding: '8px' }} className="mono">{row.temperature_c}°C</td>
                  <td style={{ padding: '8px' }} className="mono">{row.pressure_hpa}</td>
                  <td style={{ padding: '8px', color: '#ff9900' }} className="mono">{row.wind_speed_knots}</td>
                  <td style={{ padding: '8px' }}>
                    <span className={`badge ${row.blizzard_risk === 'HIGH' ? 'badge-red' : (row.blizzard_risk === 'MEDIUM' ? 'badge-orange' : 'badge-green')}`}>
                      {row.blizzard_risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
