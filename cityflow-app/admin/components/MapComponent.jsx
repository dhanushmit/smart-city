'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in Next.js
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

const STATUS_COLORS = {
  Submitted: 'filter drop-shadow-md hue-rotate-0 saturate-[200%] grayscale-0', // Default blue-ish
  Assigned: 'filter hue-rotate-180 saturate-200 drop-shadow-md',              // Orange/Yellow
  'In Progress': 'filter hue-rotate-[240deg] saturate-[300%] drop-shadow-md',  // Red
  Resolved: 'filter hue-rotate-90 saturate-200 drop-shadow-md',               // Green
  Closed: 'filter grayscale opacity-70 drop-shadow-sm',                       // Gray
};

export default function MapComponent({ mappedIssues }) {
  // Ichalkaranji default coords
  const center = [16.6918, 74.4605];

  return (
    <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0, borderRadius: '0.75rem' }}>
      
      {/* Base: Esri Satellite */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
      />
      
      {/* Overlay: CartoDB Light Labels for readability over satellite */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {mappedIssues.map((issue) => (
        <Marker 
          key={issue.id} 
          position={[issue.location_lat, issue.location_lng]}
        >
          <Popup className="rounded-xl overflow-hidden font-sans">
            <div className="p-1 min-w-[200px]">
               <div className="flex gap-2 items-start mb-2">
                  <span className="text-[10px] uppercase tracking-widest font-black text-white bg-blue-600 px-2 py-0.5 rounded-full shadow-sm">
                    {issue.display_id}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">{issue.status}</span>
               </div>
               <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1">{issue.title}</h4>
               <p className="text-xs text-gray-500 mb-2 truncate max-w-[200px]">{issue.description || 'No description provided'}</p>
               
               <div className="flex justify-between items-center bg-gray-50 -mx-1 -mb-1 px-3 py-2 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold">{issue.category}</span>
                  <span className="text-[10px] font-black uppercase text-blue-600">Geo-Tagged</span>
               </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
