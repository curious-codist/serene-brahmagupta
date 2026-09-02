import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Sun, Moon, Map as MapIcon } from 'lucide-react';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// CARTO API Key provided by user
const CARTO_API_KEY = "cb1_2t4n_1_f1be97f09447caafd40291e8";

// Formal Pin Icons
const createStationIcon = (color, symbol) => {
  return L.divIcon({
    className: 'formal-map-pin',
    html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #ffffff; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${symbol}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

const createIcebergIcon = () => {
  return L.divIcon({
    className: 'iceberg-pin',
    html: `<div style="background-color: #d97706; width: 22px; height: 22px; border-radius: 4px; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 10px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.25);">▲</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

export default function MapDeck({ seaIceData, icebergs, routesData, activeRouteMode }) {
  const [mapTheme, setMapTheme] = useState('VOYAGER'); // VOYAGER (Light) or DARK
  const centerLat = -66.5;
  const centerLon = 30.0;

  const stationList = [
    { name: "Maitri Station (India)", lat: -70.7667, lon: 11.7333, color: "#1e40af", symbol: "M" },
    { name: "Bharati Station (India)", lat: -69.4100, lon: 76.1900, color: "#0f2b5c", symbol: "B" },
    { name: "Dakshin Gangotri (Historical)", lat: -70.0833, lon: 12.0000, color: "#475569", symbol: "DG" },
    { name: "Cape Town (Departure Port)", lat: -33.9249, lon: 18.4241, color: "#15803d", symbol: "CT" }
  ];

  const getRouteColor = (mode) => {
    if (mode === 'shortest') return '#dc2626';      // Crimson Red
    if (mode === 'safety') return '#15803d';        // Emerald Green
    if (mode === 'fuel_efficient') return '#1d4ed8';// Royal Blue
    return '#0f172a';
  };

  // Licensed CARTO Basemap URLs with API Key parameter
  const tileUrls = {
    VOYAGER: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`,
    DARK: `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`
  };

  return (
    <div className="formal-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--royal-navy)' }}>
            Southern Ocean Maritime Command Deck
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Geospatial Sea-Ice Concentration, Tracked Iceberg Hazards, & Vessel Route Optimization
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Map Tile Style Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px', border: '1px solid #cbd5e1' }}>
            <button
              onClick={() => setMapTheme('VOYAGER')}
              style={{
                background: mapTheme === 'VOYAGER' ? '#ffffff' : 'transparent',
                color: mapTheme === 'VOYAGER' ? 'var(--royal-blue)' : 'var(--text-secondary)',
                border: mapTheme === 'VOYAGER' ? '1px solid #cbd5e1' : 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sun size={12} /> CARTO Voyager Light
            </button>
            <button
              onClick={() => setMapTheme('DARK')}
              style={{
                background: mapTheme === 'DARK' ? '#ffffff' : 'transparent',
                color: mapTheme === 'DARK' ? 'var(--royal-blue)' : 'var(--text-secondary)',
                border: mapTheme === 'DARK' ? '1px solid #cbd5e1' : 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Moon size={12} /> CARTO Dark Matter
            </button>
          </div>
          <span className="badge badge-green">CARTO Key Authenticated</span>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer center={[centerLat, centerLon]} zoom={3} scrollWheelZoom={true}>
          {/* CARTO Basemap Layer with Pranav's API Key */}
          <TileLayer
            key={mapTheme}
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={tileUrls[mapTheme]}
          />

          {/* 1. Sea Ice Concentration (SIC) Heatmap Points */}
          {seaIceData && seaIceData.heatmap_points && seaIceData.heatmap_points.map((pt, idx) => {
            if (idx % 2 !== 0) return null;
            const sic = pt.sic;
            let fillColor = "#3b82f6"; // Blue open ice
            let opacity = 0.25;
            if (sic > 75) { fillColor = "#dc2626"; opacity = 0.55; }
            else if (sic > 40) { fillColor = "#f59e0b"; opacity = 0.4; }

            return (
              <CircleMarker
                key={`sic-${idx}`}
                center={[pt.lat, pt.lon]}
                radius={7}
                pathOptions={{ fillColor: fillColor, color: 'transparent', fillOpacity: opacity }}
              >
                <Popup>
                  <div style={{ fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--royal-navy)' }}>Sea Ice Concentration</strong><br />
                    Coordinates: {pt.lat}°, {pt.lon}°<br />
                    SIC: <strong>{pt.sic}%</strong> ({pt.category})
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* 2. Research Stations */}
          {stationList.map((st, i) => (
            <Marker key={`st-${i}`} position={[st.lat, st.lon]} icon={createStationIcon(st.color, st.symbol)}>
              <Popup>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--royal-navy)' }}>{st.name}</strong><br />
                  Coordinates: {st.lat}°, {st.lon}°
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 3. Icebergs & Predicted Trajectories */}
          {icebergs && icebergs.map((berg, bIdx) => {
            const pathCoords = berg.trajectory_points ? berg.trajectory_points.map(p => [p.lat, p.lon]) : [];
            return (
              <React.Fragment key={`berg-${bIdx}`}>
                {/* 72-Hour Trajectory Line */}
                {pathCoords.length > 1 && (
                  <Polyline
                    positions={pathCoords}
                    pathOptions={{ color: '#d97706', weight: 2, dashArray: '4, 6' }}
                  />
                )}

                {/* Iceberg Marker & Uncertainty Ring */}
                <Marker
                  position={[berg.current_pos.lat, berg.current_pos.lon]}
                  icon={createIcebergIcon()}
                >
                  <Popup>
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong style={{ color: '#b45309' }}>{berg.name}</strong><br />
                      Dimensions: {berg.length_m}m length x {berg.draft_m}m draft<br />
                      Drift Speed: <strong>{berg.drift_speed_kts} kts</strong><br />
                      72h Predicted Pos: {berg.predicted_72h_pos.lat}°, {berg.predicted_72h_pos.lon}°<br />
                      Hazard Radius: <strong>{berg.hazard_radius_nm} NM</strong>
                    </div>
                  </Popup>
                </Marker>

                <Circle
                  center={[berg.current_pos.lat, berg.current_pos.lon]}
                  radius={berg.hazard_radius_nm * 1852}
                  pathOptions={{ color: '#d97706', fillColor: '#fef3c7', fillOpacity: 0.2, weight: 1 }}
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
                  pathOptions={{ color: routeColor, weight: mode === activeRouteMode ? 4 : 3, opacity: 0.9 }}
                />
                {rObj.waypoints.map((wp, wIdx) => (
                  <CircleMarker
                    key={`wp-${mode}-${wIdx}`}
                    center={[wp.lat, wp.lon]}
                    radius={mode === activeRouteMode ? 4 : 3}
                    pathOptions={{ fillColor: routeColor, color: '#ffffff', weight: 1, fillOpacity: 1 }}
                  >
                    <Popup>
                      <div style={{ fontSize: '0.8rem' }}>
                        <strong style={{ color: 'var(--royal-navy)' }}>Waypoint #{wp.step} ({mode.toUpperCase()})</strong><br />
                        Coordinates: {wp.lat}°, {wp.lon}°<br />
                        Sea Ice Concentration: <strong>{wp.sea_ice_concentration}%</strong><br />
                        Speed: {wp.speed_kts} kts
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Floating Formal Legend */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          padding: '12px 16px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          fontSize: '0.75rem',
          color: 'var(--text-primary)'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--royal-navy)' }}>MAP NAVIGATION LAYERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: '#dc2626', borderRadius: '50%', display: 'inline-block' }}></span>
              Shortest Route (Geodesic)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: '#15803d', borderRadius: '50%', display: 'inline-block' }}></span>
              Maximum Safety Route
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: '#1d4ed8', borderRadius: '50%', display: 'inline-block' }}></span>
              Optimal Fuel Route
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: '#d97706', borderRadius: '2px', display: 'inline-block' }}></span>
              Tracked Icebergs & 72h Drift
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
