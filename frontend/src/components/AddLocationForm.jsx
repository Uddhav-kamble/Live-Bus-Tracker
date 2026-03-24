import React, { useState, useEffect } from 'react'
import api from '../utils/api'

export default function AddLocationForm({ onAdd, editingLocation, onCancelEdit }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (editingLocation) {
      setName(editingLocation.name || '')
      setAddress(editingLocation.address || '')
      setLat(editingLocation.lat?.toString() || '')
      setLng(editingLocation.lng?.toString() || '')
      setDescription(editingLocation.description || '')
    }
  }, [editingLocation])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      if (editingLocation && editingLocation._id) {
        // Update existing location
        await api.put(`/locations/${editingLocation._id}`, { 
          name, 
          address, 
          lat: parseFloat(lat), 
          lng: parseFloat(lng),
          description 
        })
        setMessage({ type: 'success', text: 'Location updated successfully!' })
      } else {
        // Create new location
        await api.post('/locations', { 
          name, 
          address, 
          lat: parseFloat(lat), 
          lng: parseFloat(lng),
          description 
        })
        setMessage({ type: 'success', text: 'Location added successfully!' })
      }
      
      // Clear form
      setName('')
      setAddress('')
      setLat('')
      setLng('')
      setDescription('')
      if (onCancelEdit) onCancelEdit()
      onAdd()
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save location' })
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setName('')
    setAddress('')
    setLat('')
    setLng('')
    setDescription('')
    if (onCancelEdit) onCancelEdit()
    setMessage(null)
  }

  function handleGetCurrentLocation() {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(6))
          setLng(position.coords.longitude.toFixed(6))
          setLoading(false)
          setMessage({ type: 'success', text: 'Got your current location!' })
          setTimeout(() => setMessage(null), 3000)
        },
        (error) => {
          setLoading(false)
          setMessage({ type: 'error', text: 'Could not get your location' })
        }
      )
    } else {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <h3>{editingLocation?._id ? '✏️ Edit Location' : '➕ Add New Location'}</h3>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-group">
        <label>Location Name *</label>
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="e.g., Central Park" 
          required 
        />
      </div>

      <div className="form-group">
        <label>Address</label>
        <input 
          value={address} 
          onChange={e => setAddress(e.target.value)} 
          placeholder="e.g., New York, NY" 
        />
      </div>

      <div className="coords-group">
        <div className="form-group">
          <label>Latitude *</label>
          <input 
            type="number"
            step="any"
            value={lat} 
            onChange={e => setLat(e.target.value)} 
            placeholder="40.7829" 
            required 
          />
        </div>
        <div className="form-group">
          <label>Longitude *</label>
          <input 
            type="number"
            step="any"
            value={lng} 
            onChange={e => setLng(e.target.value)} 
            placeholder="-73.9654" 
            required 
          />
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Add some details about this location..."
          rows="3"
        />
      </div>

      <button 
        type="button" 
        onClick={handleGetCurrentLocation} 
        className="btn btn-icon"
        disabled={loading}
        style={{ width: '100%', marginBottom: '12px' }}
      >
        📍 Use My Current Location
      </button>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : editingLocation?._id ? '💾 Update' : '➕ Add Location'}
        </button>
        {editingLocation && (
          <button type="button" onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
