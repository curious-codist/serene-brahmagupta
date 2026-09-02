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
      color: '#d97706',
      description: 'Simulates intense polar depression with 50kt winds accelerating iceberg drift vectors by +110% and expanding collision hazard radii.'
    },
    {
      id: 'RAPID_FREEZE',
      title: 'Rapid Winter Freeze & Fast-Ice Accretion',
      icon: Snowflake,
      color: '#1d4ed8',
      description: 'Simulates sudden atmospheric temperature drop causing sea-ice concentration to expand rapidly by 1.8% per day.'
    },
    {
      id: 'SUMMER_MELT',
      title: 'Summer Ice Pack Breakup & Polynya Melt',
      icon: Flame,
      color: '#15803d',
      description: 'Simulates solar irradiance seasonal warming causing fast-ice pack disintegration, opening navigable channels to Maitri and Bharati.'
    },
    {
      id: 'ICEBERG_CALVING',
      title: 'Major Shelf Calving Event (Amery/Ross)',
      icon: Zap,
      color: '#dc2626',
      description: 'Simulates massive 4,000-meter iceberg calving from Amery Ice Shelf into the primary research vessel navigation channel.'
    }
  ];

  const handleSimulate = () => {
    onRunSimulation({ scenario: selectedScenario, days: forecastDays });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="formal-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--royal-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={20} style={{ color: 'var(--royal-blue)' }} />
              NCPOR Operational Scenario Stress-Test Simulator
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Test decision support system resilience under extreme Southern Ocean meteorological & ice pack events
            </p>
          </div>
          <span className="badge badge-royal">Re-Routing Engine Active</span>
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
              className="formal-card"
              onClick={() => setSelectedScenario(sc.id)}
              style={{
                padding: '20px',
                cursor: 'pointer',
                borderLeft: `4px solid ${sc.color}`,
                borderColor: isSelected ? sc.color : '#e2e8f0',
                background: isSelected ? '#eff6ff' : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <IconComponent size={24} style={{ color: sc.color }} />
                {isSelected && <span className="badge badge-royal">SELECTED</span>}
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: isSelected ? sc.color : 'var(--royal-navy)' }}>
                {sc.title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sc.description}</p>
            </div>
          );
        })}
      </div>

      {/* Execution Bar */}
      <div className="formal-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--royal-navy)' }}>Forecast Horizon (Days):</label>
          <input
            type="range"
            min="1"
            max="14"
            value={forecastDays}
            onChange={(e) => setForecastDays(parseInt(e.target.value))}
            style={{ accentColor: 'var(--royal-blue)' }}
          />
          <span className="mono" style={{ fontWeight: 700, color: 'var(--royal-blue)' }}>{forecastDays} Days</span>
        </div>

        <button className="btn-primary" onClick={handleSimulate} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Simulating Event...' : 'Execute Scenario Simulation'}
        </button>
      </div>

      {/* Simulation Result Output */}
      {simulationResult && (
        <div className="formal-card" style={{ padding: '20px', borderTop: '4px solid var(--royal-blue)' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: 'var(--royal-navy)' }}>
            Simulation Output Summary ({simulationResult.scenario})
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="stat-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mean Sea Ice Concentration</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--royal-navy)' }} className="mono">
                {simulationResult.sea_ice_summary?.mean_sic}%
              </div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open Water Navigable %</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#15803d' }} className="mono">
                {simulationResult.sea_ice_summary?.open_water_percentage}%
              </div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Ice Risk Grid Count</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#dc2626' }} className="mono">
                {simulationResult.sea_ice_summary?.high_risk_count} Cells
              </div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tracked Berg Velocity Shift</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#b45309' }} className="mono">
                {simulationResult.affected_icebergs?.[0]?.drift_speed_kts} kts
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
