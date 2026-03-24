import React, { useState, useEffect } from 'react'

export default function DriverDashboard({ onBack }) {
  const [tripActive, setTripActive] = useState(false)
  const [locationSharing, setLocationSharing] = useState(false)
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lng: -74.0060 })
  const [busData, setBusData] = useState({
    busNumber: 'BUS-101-A',
    route: 'Route 101',
    passengers: 23,
    maxPassengers: 50
  })

  const [tripHistory] = useState([
    { date: '2024-01-15', route: 'Route 101', duration: '2h 15m', passengers: 156 },
    { date: '2024-01-14', route: 'Route 101', duration: '2h 8m', passengers: 142 }
  ])

  useEffect(() => {
    // Simulate location updates
    if (tripActive && locationSharing) {
      const interval = setInterval(() => {
        setCurrentLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [tripActive, locationSharing])

  useEffect(() => {
    // Auto-enable location sharing when trip starts
    if (tripActive) {
      setLocationSharing(true)
    }
  }, [tripActive])

  const handleStartTrip = () => {
    setTripActive(true)
    setLocationSharing(true)
  }

  const handleUpdateLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        alert('Location updated successfully!')
      },
      (error) => {
        alert('Could not get location. Using simulated location.')
        setCurrentLocation({
          lat: 40.7128 + Math.random() * 0.01,
          lng: -74.0060 + Math.random() * 0.01
        })
      }
    )
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
                  🚌 Driver
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
          <div className="text-6xl mb-4">🚌</div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Driver Dashboard
          </h1>
          <p className="text-xl text-slate-300">
            Manage your trips and share location with passengers
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trip Control Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Trip Control</h2>
            
            <div className="flex flex-col items-center mb-8">
              <button
                onClick={() => setTripActive(!tripActive)}
                className={`w-32 h-32 rounded-full font-bold text-white text-lg shadow-lg transition-all transform hover:scale-105 ${
                  tripActive
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {tripActive ? 'STOP TRIP' : 'START TRIP'}
              </button>
              
              <div className="mt-6">
                <span className={`px-6 py-2 rounded-full font-medium ${
                  tripActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {tripActive ? 'Trip Active' : 'Trip Inactive'}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="locationSharing"
                  checked={locationSharing}
                  onChange={(e) => setLocationSharing(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-300"
                />
                <div className="flex-1">
                  <label htmlFor="locationSharing" className="text-lg font-semibold text-slate-900 cursor-pointer">
                    Location Sharing
                  </label>
                  <p className="text-sm text-slate-600 mt-1">
                    Share your location with passengers for real-time tracking
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Current Status</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Bus Number:</span>
                <span className="font-bold text-slate-900">{busData.busNumber}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Route:</span>
                <span className="font-bold text-slate-900">{busData.route}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Current Location:</span>
                <span className="font-bold text-slate-900">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Passengers:</span>
                <span className="font-bold text-slate-900">
                  {busData.passengers}/{busData.maxPassengers}
                </span>
              </div>
            </div>

            <button
              onClick={handleUpdateLocation}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Update Location
            </button>
          </div>
        </div>

        {/* Trip History Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Trip History</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Route</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Passengers</th>
                </tr>
              </thead>
              <tbody>
                {tripHistory.map((trip, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 text-slate-900">{trip.date}</td>
                    <td className="py-4 px-4 text-slate-900">{trip.route}</td>
                    <td className="py-4 px-4 text-slate-900">{trip.duration}</td>
                    <td className="py-4 px-4 text-slate-900">{trip.passengers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
