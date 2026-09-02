import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Station Icon
const createCustomIcon = (color, symbol) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; color: black; box-shadow: 0 0 10px ${color};">${symbol}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export default function MapDeck({ seaIceData, icebergs, routesData, activeRouteMode }) {
  // Center of Southern Ocean / Antarctica
  const centerLat = -66.5;
  const centerLon = 30.0;

  const stationList = [
    { name: "Maitri Station (India)", lat: -70.7667, lon: 11.7333, color: "#00f2fe", symbol: "M" },
    { name: "Bharati Station (India)", lat: -69.4100, lon: 76.1900, color: "#4facfe", symbol: "B" },
    { name: "Dakshin Gangotri (Historical)", lat: -70.0833, lon: 12.0000, color: "#ff9900", symbol: "DG" },
    { name: "Cape Town (Port of Departure)", lat: -33.9249, lon: 18.4241, color: "#00e676", symbol: "CT" }
  ];

  // Route colors based on objective
  const getRouteColor = (mode) => {
    if (mode === 'shortest') return '#ff416c';      // Red
    if (mode === 'safety') return '#00e676';        // Green
    if (mode === 'fuel_efficient') return '#00f2fe';// Cyan
    return '#ffffff';
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="gradient-text">
            Southern Ocean Geospatial Command Deck
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Real-time Sea-Ice Concentration, Physics Drift Icebergs, & Multi-Objective Vessel Routes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-cyan">Satellite Grid: 12.5km</span>
          <span className="badge badge-green">Live Physics Engine</span>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer center={[centerLat, centerLon]} zoom={3} scrollWheelZoom={true}>
          {/* Dark Polar Map Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a> Dark Matter'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* 1. Sea Ice Concentration (SIC) Heatmap Points */}
          {seaIceData && seaIceData.heatmap_points && seaIceData.heatmap_points.map((pt, idx) => {
            if (idx % 2 !== 0) return null; // Subsample for fast rendering
            const sic = pt.sic;
            let fillColor = "#00f2fe"; // Light blue low ice
            let opacity = 0.2;
            if (sic > 75) { fillColor = "#ff416c"; opacity = 0.6; }
            else if (sic > 40) { fillColor = "#ff9900"; opacity = 0.4; }

            return (
              <CircleMarker
                key={`sic-${idx}`}
                center={[pt.lat, pt.lon]}
                radius={8}
                pathOptions={{ fillColor: fillColor, color: 'transparent', fillOpacity: opacity }}
              >
                <Popup>
                  <div style={{ color: '#000' }}>
                    <strong>Sea Ice Concentration</strong><br />
                    Lat: {pt.lat}°, Lon: {pt.lon}°<br />
                    SIC: <strong>{pt.sic}%</strong> ({pt.category})
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* 2. Stations */}
          {stationList.map((st, i) => (
            <Marker key={`st-${i}`} position={[st.lat, st.lon]} icon={createCustomIcon(st.color, st.symbol)}>
              <Popup>
                <div style={{ color: '#000' }}>
                  <strong>{st.name}</strong><br />
                  Coordinates: {st.lat}°, {st.lon}°
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 3. Icebergs & Trajectories */}
          {icebergs && icebergs.map((berg, bIdx) => {
            const pathCoords = berg.trajectory_points ? berg.trajectory_points.map(p => [p.lat, p.lon]) : [];
            return (
              <React.Fragment key={`berg-${bIdx}`}>
                {/* 72-Hour Forecast Trajectory Line */}
                {pathCoords.length > 1 && (
                  <Polyline
                    positions={pathCoords}
                    pathOptions={{ color: '#ff9900', weight: 3, dashArray: '5, 8' }}
                  />
                )}

                {/* Iceberg Marker & Uncertainty Zone */}
                <Marker
                  position={[berg.current_pos.lat, berg.current_pos.lon]}
                  icon={createCustomIcon('#ff9900', '▲')}
                >
                  <Popup>
                    <div style={{ color: '#000' }}>
                      <strong style={{ color: '#d32f2f' }}>{berg.name}</strong><br />
                      Dimensions: {berg.length_m}m length x {berg.draft_m}m draft<br />
                      Drift Speed: <strong>{berg.drift_speed_kts} kts</strong><br />
                      72h Predicted Pos: {berg.predicted_72h_pos.lat}°, {berg.predicted_72h_pos.lon}°<br />
                      Hazard Radius: <strong>{berg.hazard_radius_nm} nm</strong>
                    </div>
                  </Popup>
                </Marker>

                <Circle
                  center={[berg.current_pos.lat, berg.current_pos.lon]}
                  radius={berg.hazard_radius_nm * 1852} // Convert nautical miles to meters
                  pathOptions={{ color: '#ff9900', fillColor: '#ff9900', fillOpacity: 0.15, weight: 1 }}
                />
              </React.Fragment>
            );
          })}

          {/* 4. Vessel Routes */}
          {routesData && routesData.routes && Object.entries(routesData.routes).map(([mode, rObj]) => {
            const isSelected = activeRouteMode === mode || activeRouteMode === 'ALL';
            if (!isSelected) return null;

            const waypoints = rObj.waypoints.map(w => [w.lat, w.lon]);
            const routeColor = getRouteColor(mode);

            return (
              <React.Fragment key={`route-${mode}`}>
                <Polyline
                  positions={waypoints}
                  pathOptions={{ color: routeColor, weight: mode === activeRouteMode ? 5 : 3, opacity: 0.9 }}
                />
                {rObj.waypoints.map((wp, wIdx) => (
                  <CircleMarker
                    key={`wp-${mode}-${wIdx}`}
                    center={[wp.lat, wp.lon]}
                    radius={mode === activeRouteMode ? 5 : 3}
                    pathOptions={{ fillColor: routeColor, color: '#ffffff', weight: 1, fillOpacity: 1 }}
                  >
                    <Popup>
                      <div style={{ color: '#000' }}>
                        <strong>Waypoint #{wp.step} ({mode.toUpperCase()})</strong><br />
                        Lat: {wp.lat}°, Lon: {wp.lon}°<br />
                        Sea Ice Concentration: <strong>{wp.sea_ice_concentration}%</strong><br />
                        Speed: {wp.speed_kts} kts | Iceberg Nearby: {wp.iceberg_nearby ? 'YES ⚠️' : 'NO'}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 1000,
          background: 'rgba(7, 13, 24, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid var(--border-cyan)',
          fontSize: '0.75rem'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--accent-cyan)' }}>MAP LAYERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: '#ff416c', borderRadius: '50%', display: 'inline-block' }}></span>
              Shortest Route
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: '#00e676', borderRadius: '50%', display: 'inline-block' }}></span>
              Max Safety Route
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: '#00f2fe', borderRadius: '50%', display: 'inline-block' }}></span>
              Optimal Fuel Route
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: '#ff9900', borderRadius: '50%', display: 'inline-block' }}></span>
              Tracked Icebergs & 72h Path
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
