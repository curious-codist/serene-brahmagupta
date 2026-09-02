import React, { useState } from 'react';
import { ShieldAlert, Compass, Activity, Eye, Layers } from 'lucide-react';

export default function IcebergRadar({ icebergs }) {
  const [selectedBerg, setSelectedBerg] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} className="gradient-text" />
              Physics-Informed Iceberg Radar & Trajectory Forecaster
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time hydrodynamic drag, aerodynamic wind shear & Coriolis drift forecasting (72h Horizon)
            </p>
          </div>
          <span className="badge badge-orange">
            <ShieldAlert size={14} /> 5 Active Giant Icebergs Tracked
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {icebergs && icebergs.map((berg, idx) => (
          <div key={`berg-card-${idx}`} className="glass-panel" style={{ padding: '18px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: '6px' }}>ID: {berg.iceberg_id}</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{berg.name}</h4>
              </div>
              <button
                className="btn-outline"
                onClick={() => setSelectedBerg(selectedBerg?.iceberg_id === berg.iceberg_id ? null : berg)}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <Eye size={14} /> {selectedBerg?.iceberg_id === berg.iceberg_id ? 'Hide Path' : 'Inspect Trajectory'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
              <div className="stat-card">
                <div style={{ color: 'var(--text-muted)' }}>Dimensions</div>
                <div style={{ fontWeight: 700 }} className="mono">{berg.length_m}m L x {berg.draft_m}m Draft</div>
              </div>
              <div className="stat-card">
                <div style={{ color: 'var(--text-muted)' }}>Drift Velocity</div>
                <div style={{ fontWeight: 700, color: '#ff9900' }} className="mono">{berg.drift_speed_kts} kts</div>
              </div>
              <div className="stat-card">
                <div style={{ color: 'var(--text-muted)' }}>Current Pos</div>
                <div style={{ fontWeight: 700 }} className="mono">{berg.current_pos.lat}°, {berg.current_pos.lon}°</div>
              </div>
              <div className="stat-card">
                <div style={{ color: 'var(--text-muted)' }}>72h Forecast Pos</div>
                <div style={{ fontWeight: 700, color: '#00f2fe' }} className="mono">{berg.predicted_72h_pos.lat}°, {berg.predicted_72h_pos.lon}°</div>
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Hazard Buffer: <strong style={{ color: '#ff416c' }}>{berg.hazard_radius_nm} NM</strong>
              </span>
              <span className="badge badge-green">Physics + ML Model</span>
            </div>

            {/* Trajectory Table Inspector Drawer */}
            {selectedBerg?.iceberg_id === berg.iceberg_id && (
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-cyan)',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--accent-cyan)' }}>
                  72-Hour Forecast Waypoints (Physics Integration)
                </h5>
                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '4px' }}>Hour</th>
                      <th style={{ padding: '4px' }}>Latitude</th>
                      <th style={{ padding: '4px' }}>Longitude</th>
                      <th style={{ padding: '4px' }}>Speed (kts)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {berg.trajectory_points.map((pt, pIdx) => (
                      <tr key={`pt-${pIdx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '4px' }} className="mono">T+{pt.hour}h</td>
                        <td style={{ padding: '4px' }} className="mono">{pt.lat}°</td>
                        <td style={{ padding: '4px' }} className="mono">{pt.lon}°</td>
                        <td style={{ padding: '4px', color: '#ff9900' }} className="mono">{pt.speed_kts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
