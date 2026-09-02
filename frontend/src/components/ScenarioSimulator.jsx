import React, { useState } from 'react';
import { Play, Flame, Snowflake, Wind, Zap, RefreshCw } from 'lucide-react';

export default function ScenarioSimulator({ onRunSimulation, simulationResult, loading }) {
  const [selectedScenario, setSelectedScenario] = useState('STORM_DRIFT');
  const [forecastDays, setForecastDays] = useState(5);

  const scenarios = [
    {
      id: 'STORM_DRIFT',
      title: '50-Knot Katabatic Gale & Storm Drift',
      icon: Wind,
      color: '#ff9900',
      description: 'Simulates intense polar depression with 50kt winds accelerating iceberg drift vectors by +110% and expanding collision hazard radii.'
    },
    {
      id: 'RAPID_FREEZE',
      title: 'Rapid Winter Freeze & Fast-Ice Accretion',
      icon: Snowflake,
      color: '#00f2fe',
      description: 'Simulates sudden atmospheric temperature drop causing sea-ice concentration to expand rapidly by 1.8% per day.'
    },
    {
      id: 'SUMMER_MELT',
      title: 'Summer Ice Pack Breakup & Polynya Melt',
      icon: Flame,
      color: '#00e676',
      description: 'Simulates solar irradiance seasonal warming causing fast-ice pack disintegration, opening navigable channels to Maitri and Bharati.'
    },
    {
      id: 'ICEBERG_CALVING',
      title: 'Major Shelf Calving Event (Amery/Ross)',
      icon: Zap,
      color: '#ff416c',
      description: 'Simulates massive 4,000-meter iceberg calving from Amery Ice Shelf into the primary research vessel navigation channel.'
    }
  ];

  const handleSimulate = () => {
    onRunSimulation({ scenario: selectedScenario, days: forecastDays });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={20} className="gradient-text" />
              NCPOR Interactive Scenario Stress-Test Simulator
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Test decision support resilience under extreme Southern Ocean meteorological & ice pack events
            </p>
          </div>
          <span className="badge badge-cyan">Real-Time Re-Routing Engine</span>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {scenarios.map((sc) => {
          const IconComponent = sc.icon;
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              className="glass-panel"
              onClick={() => setSelectedScenario(sc.id)}
              style={{
                padding: '20px',
                cursor: 'pointer',
                borderLeft: `4px solid ${sc.color}`,
                borderColor: isSelected ? sc.color : 'var(--border-cyan)',
                background: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <IconComponent size={24} style={{ color: sc.color }} />
                {isSelected && <span className="badge badge-cyan">ACTIVE SELECTION</span>}
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: isSelected ? sc.color : 'var(--text-main)' }}>
                {sc.title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sc.description}</p>
            </div>
          );
        })}
      </div>

      {/* Simulator Execution Bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Forecast Horizon (Days):</label>
          <input
            type="range"
            min="1"
            max="14"
            value={forecastDays}
            onChange={(e) => setForecastDays(parseInt(e.target.value))}
            style={{ accentColor: 'var(--accent-cyan)' }}
          />
          <span className="mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{forecastDays} Days</span>
        </div>

        <button className="btn-primary" onClick={handleSimulate} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Simulating Event...' : 'Execute Scenario Simulation'}
        </button>
      </div>

      {/* Simulation Result Output */}
      {simulationResult && (
        <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--accent-cyan)' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-cyan)' }}>
            Simulation Output Summary ({simulationResult.scenario})
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="stat-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mean Sea Ice Concentration</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }} className="mono">
                {simulationResult.sea_ice_summary?.mean_sic}%
              </div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open Water Navigable %</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#00e676' }} className="mono">
                {simulationResult.sea_ice_summary?.open_water_percentage}%
              </div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Ice Risk Grid Count</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ff416c' }} className="mono">
                {simulationResult.sea_ice_summary?.high_risk_count} Cells
              </div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tracked Berg Velocity Shift</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ff9900' }} className="mono">
                {simulationResult.affected_icebergs?.[0]?.drift_speed_kts} kts
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
