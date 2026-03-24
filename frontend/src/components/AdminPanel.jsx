import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function AdminPanel({ onBack }) {
  const [viewMode, setViewMode] = useState('table') // 'table' or 'map'

  // Maharashtra coordinates for bus locations
  const [fleetData] = useState([
    {
      busNumber: 'MH-12-AB-1234',
      route: 'Route 101',
      status: 'Running',
      passengers: '23/50',
      location: '28.631, 77.217',
      lat: 18.5204, // Pune
      lng: 73.8567,
      eta: '5 mins'
    },
    {
      busNumber: 'MH-02-CD-5678',
      route: 'Route 201',
      status: 'At Stop',
      passengers: '15/45',
      location: '28.613, 77.230',
      lat: 17.6599, // Aurangabad
      lng: 75.3003,
      eta: '12 mins'
    },
    {
      busNumber: 'MH-01-EF-9012',
      route: 'Route 301',
      status: 'Running',
      passengers: '31/50',
      location: '28.614, 77.209',
      lat: 19.0760, // Mumbai
      lng: 72.8777,
      eta: '8 mins'
    },
    {
      busNumber: 'MH-13-GH-3456',
      route: 'Route 101',
      status: 'Running',
      passengers: '38/50',
      location: '28.652, 77.191',
      lat: 17.3850, // Solapur
      lng: 75.9115,
      eta: '15 mins'
    },
    {
      busNumber: 'MH-14-IJ-7890',
      route: 'Route 401',
      status: 'Delayed',
      passengers: '42/55',
      location: '28.651, 77.233',
      lat: 18.1924, // Satara
      lng: 73.9974,
      eta: '22 mins'
    },
    {
      busNumber: 'MH-16-KL-2345',
      route: 'Route 501',
      status: 'Running',
      passengers: '27/48',
      location: '28.567, 77.210',
      lat: 16.7050, // Sangli
      lng: 74.5635,
      eta: '18 mins'
    }
  ])

  // Create custom bus icons based on status
  const createBusIcon = (status) => {
    let color = '#10b981' // green for Running
    if (status === 'At Stop') color = '#ef4444' // red
    if (status === 'Delayed') color = '#f97316' // orange

    return L.divIcon({
      html: `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
          <text x="16" y="21" text-anchor="middle" font-size="16" fill="white">🚌</text>
        </svg>
      `,
      className: 'custom-bus-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    })
  }

  const stats = {
    totalTrips: 156,
    averageDelay: '3.2 mins',
    activeBuses: 12,
    totalPassengers: 1247
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Running':
        return 'bg-green-100 text-green-700'
      case 'At Stop':
        return 'bg-red-100 text-red-700'
      case 'Delayed':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🚌</div>
                <span className="text-xl font-bold">TrackMyBus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                  📊 Admin
                </span>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium border border-red-500/30">
                  Low Data
                </span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                🏠
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                ← Back to Home
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                📶
              </button>
              {/* <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                🌙
              </button> */}
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-xl text-slate-300">
            Monitor and manage the entire fleet system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Trips Today */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🚌</span>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Trips Today</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalTrips}</p>
              </div>
            </div>
          </div>

          {/* Average Delay */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div>
                <p className="text-sm text-slate-600">Average Delay</p>
                <p className="text-3xl font-bold text-slate-900">{stats.averageDelay}</p>
              </div>
            </div>
          </div>

          {/* Active Buses */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">🚍</span>
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Buses</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeBuses}</p>
              </div>
            </div>
          </div>

          {/* Total Passengers */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Passengers</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalPassengers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setViewMode('table')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            Map View
          </button>
        </div>

        {/* Fleet Status Table */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fleet Status</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-4 px-4 text-slate-500 font-semibold text-sm uppercase">
                      Bus Number
                    </th>
                    <th className="text-left py-4 px-4 text-slate-500 font-semibold text-sm uppercase">
                      Route
                    </th>
                    <th className="text-left py-4 px-4 text-slate-500 font-semibold text-sm uppercase">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-slate-500 font-semibold text-sm uppercase">
                      Passengers
                    </th>
                    <th className="text-left py-4 px-4 text-slate-500 font-semibold text-sm uppercase">
                      Location
                    </th>
                    <th className="text-left py-4 px-4 text-slate-500 font-semibold text-sm uppercase">
                      ETA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fleetData.map((bus, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-slate-900 font-medium">
                        {bus.busNumber}
                      </td>
                      <td className="py-4 px-4 text-slate-900">
                        {bus.route}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bus.status)}`}>
                          {bus.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-900">
                        {bus.passengers}
                      </td>
                      <td className="py-4 px-4 text-slate-900">
                        {bus.location}
                      </td>
                      <td className="py-4 px-4 text-slate-900">
                        {bus.eta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Map View Placeholder */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fleet Map</h2>
            <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
              <MapContainer
                center={[18.5204, 73.8567]} // Pune, Maharashtra
                zoom={7}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Bus Markers */}
                {fleetData.map((bus, index) => (
                  <Marker
                    key={index}
                    position={[bus.lat, bus.lng]}
                    icon={createBusIcon(bus.status)}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2">
                        <h3 className="font-bold text-lg mb-2 text-slate-900">{bus.busNumber}</h3>
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-700">
                            <span className="font-semibold">Route:</span> {bus.route}
                          </p>
                          <p className="text-slate-700">
                            <span className="font-semibold">Status:</span>{' '}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              bus.status === 'Running' ? 'bg-green-100 text-green-700' :
                              bus.status === 'At Stop' ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {bus.status}
                            </span>
                          </p>
                          <p className="text-slate-700">
                            <span className="font-semibold">Passengers:</span> {bus.passengers}
                          </p>
                          <p className="text-slate-700">
                            <span className="font-semibold">ETA:</span> {bus.eta}
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            
            {/* Map Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-slate-700">Running</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-slate-700">At Stop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-slate-700">Delayed</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
