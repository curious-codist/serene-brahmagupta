import React from 'react';
import { Award, Target, Cpu, Database, Compass, Layers, CheckCircle2, Zap } from 'lucide-react';

export default function PitchDeck() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div className="formal-card" style={{ padding: '28px', background: 'linear-gradient(135deg, #0b1e3d 0%, #0f2b5c 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge badge-royal" style={{ marginBottom: '10px', background: '#dbeafe', color: '#1e40af' }}>
              <Award size={14} /> SMART INDIA HACKATHON (SIH) PROPOSAL
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory & Navigation Decision Support System
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginTop: '8px', maxWidth: '850px' }}>
              Developed for the <strong>National Centre for Polar and Ocean Research (NCPOR)</strong> & <strong>Ministry of Earth Sciences (MoES)</strong>.
              Problem Statement ID: <strong>26059</strong> | Theme: <strong>Transportation & Logistics</strong>.
            </p>
          </div>
          <div className="stat-card" style={{ padding: '16px 24px', textAlign: 'center', background: '#ffffff', color: '#0f172a' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PS Category</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--royal-blue)' }}>Software</div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '4px', fontWeight: 600 }}>Ministry of Earth Sciences</div>
          </div>
        </div>
      </div>

      {/* Core Solution Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="formal-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Cpu size={24} style={{ color: 'var(--royal-blue)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--royal-navy)' }}>Sea-Ice Concentration Forecaster</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Heuristic sea-ice concentration forecaster calibrated against NSIDC satellite sea ice extent observations. Generates 7-day SIC maps using latitude gradient, regional modulation, and scenario-driven projections. Evaluation against persistence baseline pending.
          </p>
        </div>

        <div className="formal-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Compass size={24} style={{ color: '#d97706' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--royal-navy)' }}>Physics-Informed Iceberg Model</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Combines aerodynamic wind shear, hydrodynamic ocean current drag, and Coriolis forces to project 72-hour drift trajectories and collision hazard rings for NIC tracked icebergs. Uses Forward Euler integration with physics-based forcing.
          </p>
        </div>

        <div className="formal-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Zap size={24} style={{ color: '#15803d' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--royal-navy)' }}>Triple Route Pathfinder</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Hull ice-resistance pathfinder for Polar Class vessels (PC1-PC7, <em>ORV Sagar Nidhi</em>). Calculates <strong>Shortest</strong>, <strong>Maximum Safety</strong>, and <strong>Optimal Fuel-Efficient</strong> routes.
          </p>
        </div>
      </div>

      {/* Dataset Integration Matrix */}
      <div className="formal-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: 'var(--royal-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} style={{ color: 'var(--royal-blue)' }} />
          Multi-Source Dataset Integration Architecture
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: 'var(--royal-navy)' }}>IMD Maitri & Bharati Weather</strong>
              <span className="badge badge-green">LOCAL DATASET</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              `imd_maitri.csv`, `imd_bharati_fixed_hour.csv` & NetCDF4 files: Air temperature, station pressure, wind speed/direction, and blizzard risk.
            </p>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: 'var(--royal-navy)' }}>NIC 33 Real Tracked Icebergs</strong>
              <span className="badge badge-green">LOCAL DATASET</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              `AntarcticIcebergs_20260827.csv`: Live GPS positions, dimensions, area, and keel draft specs for giant icebergs (A76C, A81, B09B, B22A, etc.).
            </p>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: 'var(--royal-navy)' }}>Satellite Sea Ice Index (NSIDC)</strong>
              <span className="badge badge-royal">SATELLITE GRIDS</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              `CSVExport.csv`: Daily Antarctic sea ice extent history (11.38 Million $km^2$ baseline calibration).
            </p>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: 'var(--royal-navy)' }}>Copernicus CMEMS & ERA5</strong>
              <span className="badge badge-royal">MET-OCEAN VECTORS</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              10m surface winds, ocean circulation velocity ($U_o, V_o$), wave heights ($H_s$), and sea surface temperatures.
            </p>
          </div>
        </div>
      </div>

      {/* Competitive Winning Matrix */}
      <div className="formal-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: 'var(--royal-navy)' }}>
          Why This Solution Wins SIH Problem Statement 26059
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CheckCircle2 size={18} style={{ color: '#15803d', flexShrink: 0 }} />
            <div>
              <strong>Complete Operational Decision Support Deck</strong>
              <p style={{ color: 'var(--text-muted)' }}>Interactive map, vessel pathfinder, iceberg radar, and station telemetry in one unified platform.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <CheckCircle2 size={18} style={{ color: '#15803d', flexShrink: 0 }} />
            <div>
              <strong>Physics-Based Drift Engine</strong>
              <p style={{ color: 'var(--text-muted)' }}>Incorporates hydrodynamic drag equations, aerodynamic wind shear, and Coriolis dynamics for iceberg trajectory prediction.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <CheckCircle2 size={18} style={{ color: '#15803d', flexShrink: 0 }} />
            <div>
              <strong>NCPOR Polar Vessel Specification</strong>
              <p style={{ color: 'var(--text-muted)' }}>Polar Class (PC1-PC7) hull resistance profiling for <em>ORV Sagar Nidhi</em> and Antarctic supply vessels.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <CheckCircle2 size={18} style={{ color: '#15803d', flexShrink: 0 }} />
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
