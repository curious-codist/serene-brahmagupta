import React, { useState } from 'react';
import { ShieldAlert, Compass, Eye } from 'lucide-react';

export default function IcebergRadar({ icebergs }) {
  const [selectedBerg, setSelectedBerg] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="formal-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--royal-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} style={{ color: 'var(--royal-blue)' }} />
              National Ice Center (NIC) Iceberg Tracking & Trajectory Radar
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Hydrodynamic drag, aerodynamic wind shear & Coriolis drift forecasting (72h Forecast Horizon)
            </p>
          </div>
          <span className="badge badge-amber">
            <ShieldAlert size={14} /> {icebergs ? icebergs.length : 0} Tracked Icebergs
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {icebergs && icebergs.map((berg, idx) => (
          <div key={`berg-card-${idx}`} className="formal-card" style={{ padding: '18px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="badge badge-royal" style={{ marginBottom: '6px' }}>ID: {berg.iceberg_id}</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--royal-navy)' }}>{berg.name}</h4>
              </div>
              <button
                className="btn-outline"
                onClick={() => setSelectedBerg(selectedBerg?.iceberg_id === berg.iceberg_id ? null : berg)}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <Eye size={14} /> {selectedBerg?.iceberg_id === berg.iceberg_id ? 'Hide' : 'Inspect Trajectory'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
              <div className="stat-card">
                <div style={{ color: 'var(--text-muted)' }}>Dimensions</div>
                <div style={{ fontWeight: 700 }} className="mono">{berg.length_m}m L x {berg.draft_m}m Draft</div>
              </div>
              <div className="stat-card">
                <div style={{ color: 'var(--text-muted)' }}>Drift Velocity</div>
                <div style={{ fontWeight: 700, color: '#b45309' }} className="mono">{berg.drift_speed_kts} kts</div>
              </div>
              <div className="stat-card">
                <div style={{ color: 'var(--text-muted)' }}>Current Location</div>
                <div style={{ fontWeight: 700 }} className="mono">{berg.current_pos.lat}°, {berg.current_pos.lon}°</div>
              </div>
              <div className="stat-card">
                <div style={{ color: 'var(--text-muted)' }}>72h Forecast Pos</div>
                <div style={{ fontWeight: 700, color: 'var(--royal-blue)' }} className="mono">{berg.predicted_72h_pos.lat}°, {berg.predicted_72h_pos.lon}°</div>
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Hazard Radius: <strong style={{ color: '#dc2626' }}>{berg.hazard_radius_nm} NM</strong>
              </span>
              <span className="badge badge-navy">Physics + ML Drift</span>
            </div>

            {/* Trajectory Table Inspector Drawer */}
            {selectedBerg?.iceberg_id === berg.iceberg_id && (
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--royal-navy)' }}>
                  72-Hour Forecast Waypoints (Hydrodynamic Integration)
                </h5>
                <table>
                  <thead>
                    <tr>
                      <th>Hour</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>Speed (kts)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {berg.trajectory_points.map((pt, pIdx) => (
                      <tr key={`pt-${pIdx}`}>
                        <td className="mono">T+{pt.hour}h</td>
                        <td className="mono">{pt.lat}°</td>
                        <td className="mono">{pt.lon}°</td>
                        <td style={{ color: '#b45309' }} className="mono">{pt.speed_kts}</td>
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
