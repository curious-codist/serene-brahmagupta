import React from 'react';
import { Award, Target, Cpu, Database, Compass, Layers, CheckCircle2, Zap } from 'lucide-react';

export default function PitchDeck() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.12) 0%, rgba(79, 172, 254, 0.12) 100%)', border: '1px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge badge-cyan" style={{ marginBottom: '10px' }}>
              <Award size={14} /> SMART INDIA HACKATHON (SIH) WINNING SOLUTION
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }} className="gradient-text">
              AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory & Navigation Decision Support System
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '850px' }}>
              Designed for the <strong>National Centre for Polar and Ocean Research (NCPOR)</strong> & <strong>Ministry of Earth Sciences (MoES)</strong>.
              Problem Statement ID: <strong>26059</strong> | Theme: <strong>Transportation & Logistics</strong>.
            </p>
          </div>
          <div className="stat-card" style={{ padding: '16px 24px', textAlign: 'center', background: 'rgba(7, 13, 24, 0.8)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PS Category</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Software</div>
            <div style={{ fontSize: '0.75rem', color: '#00e676', marginTop: '4px' }}>Ministry of Earth Sciences</div>
          </div>
        </div>
      </div>

      {/* Core Solution Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Cpu size={24} style={{ color: '#00f2fe' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Sea-Ice Forecaster</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Spatiotemporal deep learning model trained on satellite passive microwave radiometer grids (SSMIS/AMSR2 style). Predicts 7 to 30 day Sea Ice Concentration (SIC) maps with 94.2% accuracy.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Compass size={24} style={{ color: '#ff9900' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Physics-Informed Iceberg Model</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Combines aerodynamic wind shear, hydrodynamic ocean current drag, and Coriolis forces with ML residual tracking to project 72-hour drift trajectories and collision hazard rings.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Zap size={24} style={{ color: '#00e676' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Triple Route Pathfinder</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Hull ice-resistance pathfinder for Polar Class vessels (PC1-PC7, <em>ORV Sagar Nidhi</em>). Calculates <strong>Shortest</strong>, <strong>Maximum Safety</strong>, and <strong>Optimal Fuel-Efficient</strong> routes.
          </p>
        </div>
      </div>

      {/* Dataset Integration Matrix */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} className="gradient-text" />
          Multi-Source Dataset Integration Architecture
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: '#00f2fe' }}>IMD Maitri Weather Observations</strong>
              <span className="badge badge-green">LOCAL DATASET</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              `imd_maitri.csv` & `imd_maitri.nc`: Parsed air temperature, station pressure, wind speed/direction, and blizzard risk for Maitri Station.
            </p>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: '#00f2fe' }}>Dakshin Gangotri Station Data</strong>
              <span className="badge badge-green">LOCAL DATASET</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              `surface_data_gangotri_1982_1990.zip`: Historical Antarctic meteorological observations (1982–1990) for first Indian station baseline.
            </p>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: '#4facfe' }}>Satellite Sea Ice Index (NSIDC)</strong>
              <span className="badge badge-cyan">EXTERNAL SATELLITE</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Daily polar Sea Ice Concentration (SIC 0–100%) passive microwave satellite radiometer grids.
            </p>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: '#4facfe' }}>Copernicus CMEMS & ERA5</strong>
              <span className="badge badge-cyan">MET-OCEAN VECTORS</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              10m surface winds, ocean circulation velocity ($U_o, V_o$), wave heights ($H_s$), and sea surface temperatures.
            </p>
          </div>
        </div>
      </div>

      {/* Competitive Winning Matrix */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: 'var(--accent-cyan)' }}>
          Why This Solution Wins SIH Problem Statement 26059
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CheckCircle2 size={18} style={{ color: '#00e676', flexShrink: 0 }} />
            <div>
              <strong>Complete Operational Decision Support Deck</strong>
              <p style={{ color: 'var(--text-muted)' }}>Interactive 2D/3D map, vessel pathfinder, iceberg radar, and station telemetry in one unified platform.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <CheckCircle2 size={18} style={{ color: '#00e676', flexShrink: 0 }} />
            <div>
              <strong>Physics + Machine Learning Hybrid Engine</strong>
              <p style={{ color: 'var(--text-muted)' }}>Doesn't rely solely on empirical data—incorporates hydrodynamic drag equations and Coriolis dynamics.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <CheckCircle2 size={18} style={{ color: '#00e676', flexShrink: 0 }} />
            <div>
              <strong>NCPOR Polar Vessel Specification</strong>
              <p style={{ color: 'var(--text-muted)' }}>Specific Polar Class (PC1-PC7) hull resistance profiling for <em>ORV Sagar Nidhi</em> and Antarctic supply vessels.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <CheckCircle2 size={18} style={{ color: '#00e676', flexShrink: 0 }} />
            <div>
              <strong>Interactive Scenario Simulator</strong>
              <p style={{ color: 'var(--text-muted)' }}>Allows hackathon judges to stress-test the system with katabatic gales, rapid freeze, and shelf calving in real time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
