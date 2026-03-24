import React from 'react'
import api from '../utils/api'

export default function LocationList({ locations = [], onDeleted, onEdit, loading, onLocationClick, selectedLocation }) {
  async function handleDelete(id, name) {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.delete(`/locations/${id}`)
        onDeleted()
      } catch (err) {
        alert('Failed to delete location')
      }
    }
  }

  function handleEdit(loc) {
    onEdit({
      _id: loc._id,
      name: loc.name,
      address: loc.address,
      lat: loc.location.coordinates[1],
      lng: loc.location.coordinates[0],
      description: loc.description
    })
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p>No locations found</p>
        <small>Add your first location above</small>
      </div>
    )
  }
  return (
    <div>
      <div className="location-list-header">
        <h3>📍 All Locations</h3>
        <span className="location-count">{locations.length}</span>
      </div>
      <div className="location-list">
        {locations.map(loc => (
          <div 
            key={loc._id} 
            className={`loc-item ${selectedLocation?._id === loc._id ? 'editing' : ''}`}
            onClick={() => onLocationClick(loc)}
          >
            <div className="loc-item-header">
              <div style={{ flex: 1 }}>
                <div className="loc-item-title">{loc.name}</div>
                {loc.address && <div className="loc-item-address">📍 {loc.address}</div>}
                {loc.description && (
                  <div className="loc-item-description">{loc.description}</div>
                )}
                <div className="loc-item-coords">
                  Lat: {loc.location.coordinates[1].toFixed(4)}, 
                  Lng: {loc.location.coordinates[0].toFixed(4)}
                </div>
              </div>
              <div className="loc-item-actions">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEdit(loc); }} 
                  className="btn btn-edit"
                  title="Edit location"
                >
                  ✏️
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(loc._id, loc.name); }} 
                  className="btn btn-danger"
                  title="Delete location"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
