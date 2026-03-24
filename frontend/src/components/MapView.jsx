import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icon path when using bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

// Custom icon for selected location
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    }
  })
  return null
}

function FlyToLocation({ location }) {
  const map = useMap()
  
  useEffect(() => {
    if (location && location.location) {
      const lat = location.location.coordinates[1]
      const lng = location.location.coordinates[0]
      map.flyTo([lat, lng], 13, { duration: 1.5 })
    }
  }, [location, map])
  
  return null
}

export default function MapView({ locations, selectedLocation, onMapClick }) {
  const center = locations.length 
    ? [locations[0].location.coordinates[1], locations[0].location.coordinates[0]] 
    : [40.7128, -74.006]

  return (
    <MapContainer 
      center={center} 
      zoom={3} 
      style={{ height: '100vh', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapClickHandler onMapClick={onMapClick} />
      <FlyToLocation location={selectedLocation} />
      
      {locations.map(loc => {
        const isSelected = selectedLocation && selectedLocation._id === loc._id
        return (
          <Marker 
            key={loc._id} 
            position={[loc.location.coordinates[1], loc.location.coordinates[0]]}
            icon={isSelected ? selectedIcon : undefined}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                  {loc.name}
                </h3>
                {loc.address && (
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                    📍 {loc.address}
                  </p>
                )}
                {loc.description && (
                  <p style={{ margin: '8px 0', fontSize: '13px', color: '#333' }}>
                    {loc.description}
                  </p>
                )}
                <div style={{ 
                  marginTop: '8px', 
                  paddingTop: '8px', 
                  borderTop: '1px solid #eee',
                  fontSize: '11px',
                  color: '#999',
                  fontFamily: 'monospace'
                }}>
                  {loc.location.coordinates[1].toFixed(4)}, {loc.location.coordinates[0].toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
