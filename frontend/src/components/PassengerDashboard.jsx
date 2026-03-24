import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import api from '../utils/api'

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

// Custom bus icon - improved with animation pulse
const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="25" cy="25" r="20" fill="#3b82f6" opacity="0.2">
        <animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="25" cy="25" r="16" fill="#3b82f6" stroke="white" stroke-width="3" filter="url(#shadow)"/>
      <path d="M 15 20 L 15 30 L 35 30 L 35 20 L 32 17 L 18 17 Z" fill="white"/>
      <rect x="17" y="22" width="6" height="5" fill="#3b82f6"/>
      <rect x="27" y="22" width="6" height="5" fill="#3b82f6"/>
      <circle cx="20" cy="32" r="1.5" fill="#334155"/>
      <circle cx="30" cy="32" r="1.5" fill="#334155"/>
    </svg>
  `),
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25]
})

// Custom user location icon - improved with pulse animation
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="25" cy="25" r="20" fill="#10b981" opacity="0.2">
        <animate attributeName="r" values="20;25;20" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.2;0;0.2" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="25" cy="25" r="15" fill="#10b981" stroke="white" stroke-width="3" filter="url(#glow)"/>
      <circle cx="25" cy="25" r="8" fill="white"/>
      <circle cx="25" cy="25" r="4" fill="#10b981"/>
    </svg>
  `),
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25]
})

// Custom bus stop icon
const busStopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="stop-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="14" fill="#f59e0b" stroke="white" stroke-width="3" filter="url(#stop-shadow)"/>
      <rect x="17" y="12" width="6" height="2" fill="white"/>
      <rect x="15" y="15" width="10" height="10" rx="1" fill="white"/>
      <circle cx="20" cy="28" r="1.5" fill="#f59e0b"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
})

function FlyToLocation({ center, zoom }) {
  const map = useMap()
  const [hasFlown, setHasFlown] = useState(false)
  
  useEffect(() => {
    // Only fly to location once when tracking starts
    if (center && !hasFlown) {
      map.flyTo(center, zoom || 13, { duration: 1.5 })
      setHasFlown(true)
    }
  }, [center, zoom, map, hasFlown])
  
  return null
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return (R * c).toFixed(2) // Distance in km
}

// Calculate ETA based on distance and speed
function calculateETA(distanceKm, speedKmh) {
  const distance = parseFloat(distanceKm)
  const speed = parseFloat(speedKmh)
  
  if (!speed || speed === 0) return 'N/A'
  
  const timeHours = distance / speed
  const hours = Math.floor(timeHours)
  const minutes = Math.round((timeHours - hours) * 60)
  
  if (hours === 0) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`
  } else if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`
  }
}

// Format ETA for display
function formatETAWithArrival(etaString) {
  if (!etaString || etaString === 'N/A') return 'N/A'
  
  // Calculate arrival time
  const now = new Date()
  let minutesToAdd = 0
  
  // Parse the ETA string
  const hoursMatch = etaString.match(/(\d+)\s*hr/)
  const minutesMatch = etaString.match(/(\d+)\s*min/)
  
  if (hoursMatch) minutesToAdd += parseInt(hoursMatch[1]) * 60
  if (minutesMatch) minutesToAdd += parseInt(minutesMatch[1])
  
  now.setMinutes(now.getMinutes() + minutesToAdd)
  
  const arrivalTime = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
  
  return `${etaString} (${arrivalTime})`
}

// Generate intermediate waypoints for route visualization
function generateWaypoints(start, end, numPoints = 3) {
  const waypoints = []
  for (let i = 1; i <= numPoints; i++) {
    const ratio = i / (numPoints + 1)
    const lat = start[0] + (end[0] - start[0]) * ratio
    const lng = start[1] + (end[1] - start[1]) * ratio
    waypoints.push([lat, lng])
  }
  return waypoints
}

export default function PassengerDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('plan')
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [trackingBus, setTrackingBus] = useState(null)
  const [busPosition, setBusPosition] = useState(null)
  const [userPosition, setUserPosition] = useState(null)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          // Fallback to Pune center if geolocation fails
          console.log('Geolocation error:', error)
          setUserPosition([18.5204, 73.8567]) // Pune, Maharashtra
        }
      )
    } else {
      // Fallback location (Pune, Maharashtra)
      setUserPosition([18.5204, 73.8567])
    }
  }, [])

  // Sample data
  const stats = {
    totalRoutes: 6,
    activeBuses: 6,
    busStops: 15
  }

  const routes = [
    {
      id: 'route-101',
      name: 'Route 101 - Pune to Tuljapur Express',
      color: '#ef4444',
      from: 'Pune',
      to: 'Tuljapur',
      distance: '250 km',
      fare: '₹450',
      frequency: 'Every 30 mins',
      duration: '5 hours',
      stops: [
        { name: 'Pune Station', location: [18.5204, 73.8567], order: 1, description: 'Starting Point' },
        { name: 'Solapur', location: [17.6599, 75.9064], order: 2, nextBusETA: '1.5 hours', description: 'Major Junction' },
        { name: 'Dharashiv (Osmanabad)', location: [18.1767, 76.0397], order: 3, nextBusETA: '3 hours', description: 'Historical City' },
        { name: 'Tuljapur', location: [18.0074, 76.0705], order: 4, nextBusETA: '5 hours', description: 'Pilgrimage Destination' }
      ]
    },
    {
      id: 'route-202',
      name: 'Route 202 - Pune to Satara Highway',
      color: '#3b82f6',
      from: 'Pune',
      to: 'Satara',
      distance: '110 km',
      fare: '₹200',
      frequency: 'Every 20 mins',
      duration: '2.5 hours',
      stops: [
        { name: 'Pune Swargate', location: [18.5018, 73.8636], order: 1, description: 'Main Bus Terminal' },
        { name: 'Katraj', location: [18.4484, 73.8617], order: 2, nextBusETA: '20 mins', description: 'City Outskirts' },
        { name: 'Satara', location: [17.6805, 74.0183], order: 3, nextBusETA: '2.5 hours', description: 'Hill Station Route' }
      ]
    },
    {
      id: 'route-303',
      name: 'Route 303 - Solapur to Latur Direct',
      color: '#10b981',
      from: 'Solapur',
      to: 'Latur',
      distance: '120 km',
      fare: '₹220',
      frequency: 'Every 25 mins',
      duration: '3 hours',
      stops: [
        { name: 'Solapur Central', location: [17.6599, 75.9064], order: 1, description: 'Main Bus Stand' },
        { name: 'Barshi', location: [18.2345, 75.6915], order: 2, nextBusETA: '1.5 hours', description: 'Mid-way Stop' },
        { name: 'Latur', location: [18.4009, 76.5604], order: 3, nextBusETA: '3 hours', description: 'District Headquarters' }
      ]
    },
    {
      id: 'route-404',
      name: 'Route 404 - Mumbai to Pune Expressway',
      color: '#f59e0b',
      from: 'Mumbai',
      to: 'Pune',
      distance: '150 km',
      fare: '₹350',
      frequency: 'Every 15 mins',
      duration: '3 hours',
      stops: [
        { name: 'Mumbai Dadar', location: [19.0176, 72.8562], order: 1, description: 'Central Mumbai' },
        { name: 'Panvel', location: [18.9894, 73.1175], order: 2, nextBusETA: '45 mins', description: 'Navi Mumbai' },
        { name: 'Lonavala', location: [18.7537, 73.4079], order: 3, nextBusETA: '1.5 hours', description: 'Hill Station' },
        { name: 'Pune', location: [18.5204, 73.8567], order: 4, nextBusETA: '3 hours', description: 'Final Destination' }
      ]
    },
    {
      id: 'route-505',
      name: 'Route 505 - Pune to Sangli via Satara',
      color: '#8b5cf6',
      from: 'Pune',
      to: 'Sangli',
      distance: '230 km',
      fare: '₹420',
      frequency: 'Every 40 mins',
      duration: '5 hours',
      stops: [
        { name: 'Pune', location: [18.5204, 73.8567], order: 1, description: 'Starting Point' },
        { name: 'Satara', location: [17.6805, 74.0183], order: 2, nextBusETA: '2.5 hours', description: 'Mid Route' },
        { name: 'Sangli', location: [16.8524, 74.5815], order: 3, nextBusETA: '5 hours', description: 'Southern Maharashtra' }
      ]
    },
    {
      id: 'route-606',
      name: 'Route 606 - Aurangabad to Nanded',
      color: '#ec4899',
      from: 'Aurangabad',
      to: 'Nanded',
      distance: '270 km',
      fare: '₹480',
      frequency: 'Every 45 mins',
      duration: '6 hours',
      stops: [
        { name: 'Aurangabad', location: [19.8762, 75.3433], order: 1, description: 'Historical City' },
        { name: 'Parbhani', location: [19.2608, 76.7806], order: 2, nextBusETA: '3 hours', description: 'Mid-way City' },
        { name: 'Nanded', location: [19.1383, 77.3210], order: 3, nextBusETA: '6 hours', description: 'Pilgrimage City' }
      ]
    }
  ]

  const buses = [
    {
      id: 'MH-12-AB-1234',
      driver: 'Rajesh Patil',
      speed: 60, // km/h
      speedDisplay: '60 km/h',
      nextStop: 'Solapur',
      position: '#1 in queue',
      occupancy: 46,
      totalSeats: 50,
      status: 'Running',
      location: [17.6599, 75.9064], // Solapur
      routeId: 'route-101'
    },
    {
      id: 'MH-12-CD-5678',
      driver: 'Suresh Deshmukh',
      speed: 55, // km/h
      speedDisplay: '55 km/h',
      nextStop: 'Satara',
      position: '#2 in queue',
      occupancy: 38,
      totalSeats: 50,
      status: 'Running',
      location: [18.4484, 73.8617], // Katraj
      routeId: 'route-202'
    },
    {
      id: 'MH-12-EF-9012',
      driver: 'Prakash Jadhav',
      speed: 58, // km/h
      speedDisplay: '58 km/h',
      nextStop: 'Latur',
      position: '#3 in queue',
      occupancy: 42,
      totalSeats: 50,
      status: 'Running',
      location: [18.2345, 75.6915], // Barshi
      routeId: 'route-303'
    },
    {
      id: 'MH-01-GH-3456',
      driver: 'Amit Kulkarni',
      speed: 65, // km/h
      speedDisplay: '65 km/h',
      nextStop: 'Pune',
      position: '#4 in queue',
      occupancy: 42,
      totalSeats: 55,
      status: 'Running',
      location: [18.7537, 73.4079], // Lonavala
      routeId: 'route-404'
    },
    {
      id: 'MH-12-IJ-7890',
      driver: 'Vijay Shinde',
      speed: 62, // km/h
      speedDisplay: '62 km/h',
      nextStop: 'Sangli',
      position: '#5 in queue',
      occupancy: 30,
      totalSeats: 48,
      status: 'Running',
      location: [17.6805, 74.0183], // Satara
      routeId: 'route-505'
    },
    {
      id: 'MH-19-KL-2345',
      driver: 'Santosh Pawar',
      speed: 60, // km/h
      speedDisplay: '60 km/h',
      nextStop: 'Nanded',
      position: '#6 in queue',
      occupancy: 25,
      totalSeats: 50,
      status: 'Running',
      location: [19.2608, 76.7806], // Parbhani
      routeId: 'route-606'
    }
  ]

  const handleSearchRoutes = () => {
    if (fromLocation && toLocation) {
      // Normalize the input
      const from = fromLocation.toLowerCase().trim()
      const to = toLocation.toLowerCase().trim()
      
      // Find route that matches the from and to locations
      const matchedRoute = routes.find(route => {
        const routeFrom = route.from.toLowerCase()
        const routeTo = route.to.toLowerCase()
        
        // Match exact city names or first word of city name
        const fromMatches = routeFrom === from || 
                           routeFrom.startsWith(from) || 
                           from.startsWith(routeFrom.split(' ')[0])
        
        const toMatches = routeTo === to || 
                         routeTo.startsWith(to) || 
                         to.startsWith(routeTo.split(' ')[0])
        
        return fromMatches && toMatches
      })
      
      if (matchedRoute) {
        setSelectedRoute(matchedRoute)
        setActiveTab('queue')
      } else {
        // If no exact match, show alert and go to find tab
        alert(`No direct route found from ${fromLocation.charAt(0).toUpperCase() + fromLocation.slice(1)} to ${toLocation.charAt(0).toUpperCase() + toLocation.slice(1)}.\n\nShowing all available routes. Please check "Popular Routes" section.`)
        setActiveTab('find')
      }
    }
  }

  // Get next stop location for a bus
  const getNextStopLocation = (bus) => {
    const route = routes.find(r => r.id === bus.routeId)
    if (!route || !route.stops) return null
    
    const nextStop = route.stops.find(stop => 
      stop.name.toLowerCase().includes(bus.nextStop.toLowerCase()) ||
      bus.nextStop.toLowerCase().includes(stop.name.toLowerCase().split(' ')[0])
    )
    
    return nextStop ? nextStop.location : null
  }

  // Calculate dynamic ETA for a bus to its next stop
  const getBusETA = (bus) => {
    const nextStopLocation = getNextStopLocation(bus)
    if (!nextStopLocation) return 'N/A'
    
    const distance = calculateDistance(
      bus.location[0], 
      bus.location[1], 
      nextStopLocation[0], 
      nextStopLocation[1]
    )
    
    return calculateETA(distance, bus.speed)
  }

  // Calculate ETA to user location
  const getBusETAToUser = (bus, userLocation) => {
    if (!userLocation) return 'N/A'
    
    const distance = calculateDistance(
      bus.location[0], 
      bus.location[1], 
      userLocation[0], 
      userLocation[1]
    )
    
    return calculateETA(distance, bus.speed)
  }

  const handleTrackBus = (bus) => {
    setTrackingBus(bus)
    setBusPosition(bus.location)
    // Find and set the correct route for this bus
    const busRoute = routes.find(route => route.id === bus.routeId)
    if (busRoute) {
      setSelectedRoute(busRoute)
    }
    setActiveTab('tracking')
  }

  const handleStopTracking = () => {
    setTrackingBus(null)
    setBusPosition(null)
    setActiveTab('queue')
  }

  // Simulate bus movement
  useEffect(() => {
    if (trackingBus && busPosition) {
      const interval = setInterval(() => {
        setBusPosition(prev => {
          if (!prev) return null
          return [prev[0] + (Math.random() - 0.5) * 0.001, prev[1] + (Math.random() - 0.5) * 0.001]
        })
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [trackingBus, busPosition])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-3xl">🚌</div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                TrackMyBus
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
              <span className="text-xl">👤</span>
              <span className="font-medium">Passenger</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                Low Data
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all duration-300 border border-white/20 flex items-center gap-2"
            >
              🏠 <span className="hidden md:inline">Back to Home</span>
            </button>
            {/* <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              ☀️
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              🌙
            </button> */}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-8 py-12 text-center">
          <div className="text-7xl mb-4 animate-bounce">🚌</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Bus Tracker
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Track your bus in real-time, just like food delivery!
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8 justify-center">
            <button 
              onClick={() => setActiveTab('plan')}
              className="group px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl font-semibold text-base flex items-center gap-2 shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/60 transition-all duration-300 hover:-translate-y-0.5"
            >
              🗺️ Route Planning
            </button>
            
            <button 
              onClick={() => {
                if (trackingBus) {
                  setActiveTab('tracking')
                } else {
                  alert('Please select a bus from "Bus Queue" tab first to start live tracking!')
                  setActiveTab('queue')
                }
              }}
              className={`group px-7 py-3.5 rounded-xl font-semibold text-base flex items-center gap-2 shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${
                trackingBus 
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-rose-500/40 hover:shadow-xl hover:shadow-rose-500/60 cursor-pointer' 
                  : 'bg-gradient-to-r from-slate-600 to-slate-700 shadow-slate-500/20 cursor-not-allowed opacity-70'
              }`}
            >
              {trackingBus && <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>}
              📍 Live Tracking
              {trackingBus && <span className="text-sm opacity-90">({trackingBus.id})</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Tracking Banner */}
      {trackingBus && (
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-green-500/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <strong className="text-lg font-bold text-green-400">Tracking: {trackingBus.id}</strong>
              <span className="text-sm text-slate-300">
                Route 101 - Red Line • ETA {trackingBus.eta} • Next: {trackingBus.nextStop}
              </span>
            </div>
            <button 
              onClick={handleStopTracking} 
              className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg font-semibold transition-all duration-300 border border-red-500/30 hover:border-red-500/50"
            >
              Stop Tracking
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="sticky top-[72px] z-40 backdrop-blur-md bg-slate-900/80 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button 
              className={`px-6 py-4 font-semibold transition-all duration-300 border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'plan' 
                  ? 'text-blue-400 border-blue-400 bg-blue-500/10' 
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setActiveTab('plan')}
              title="Plan Journey (Alt+1)"
            >
              🗺️ Plan Journey
            </button>
            <button 
              className={`px-6 py-4 font-semibold transition-all duration-300 border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'find' 
                  ? 'text-blue-400 border-blue-400 bg-blue-500/10' 
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setActiveTab('find')}
              title="Find Bus (Alt+2)"
            >
              🔍 Find Bus
            </button>
            <button 
              className={`px-6 py-4 font-semibold transition-all duration-300 border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'queue' 
                  ? 'text-blue-400 border-blue-400 bg-blue-500/10' 
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setActiveTab('queue')}
              title="Bus Queue (Alt+3)"
            >
              ⏱️ Bus Queue
            </button>
            <button 
              className={`px-6 py-4 font-semibold transition-all duration-300 border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'tracking' 
                  ? 'text-blue-400 border-blue-400 bg-blue-500/10' 
                  : trackingBus 
                    ? 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                    : 'text-slate-600 border-transparent cursor-not-allowed'
              }`}
              onClick={() => setActiveTab('tracking')}
              disabled={!trackingBus}
              title={trackingBus ? "Live Tracking (Alt+4)" : "Select a bus to enable live tracking"}
            >
              📍 Live Tracking
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* Plan Journey Tab */}
        {activeTab === 'plan' && (
          <>
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Plan Your Journey</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">From</label>
                      <select 
                        value={fromLocation} 
                        onChange={(e) => setFromLocation(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select starting point</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="pune">Pune</option>
                        <option value="solapur">Solapur</option>
                        <option value="satara">Satara</option>
                        <option value="sangli">Sangli</option>
                        <option value="aurangabad">Aurangabad</option>
                        <option value="panvel">Panvel</option>
                        <option value="lonavala">Lonavala</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">To</label>
                      <select 
                        value={toLocation} 
                        onChange={(e) => setToLocation(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select destination</option>
                        <option value="pune">Pune</option>
                        <option value="tuljapur">Tuljapur</option>
                        <option value="dharashiv">Dharashiv (Osmanabad)</option>
                        <option value="latur">Latur</option>
                        <option value="satara">Satara</option>
                        <option value="sangli">Sangli</option>
                        <option value="nanded">Nanded</option>
                        <option value="parbhani">Parbhani</option>
                        <option value="barshi">Barshi</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-0.5" 
                    onClick={handleSearchRoutes}
                  >
                    🔍 Search Routes
                  </button>
                  
                  {/* Available Routes Info */}
                  <div className="mt-5 p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                    <h4 className="text-base font-semibold mb-3 text-blue-400 flex items-center gap-2">
                      📍 Available Direct Routes:
                    </h4>
                    <ul className="text-sm leading-relaxed text-slate-300 space-y-1 pl-5 list-disc">
                      <li>Mumbai → Pune</li>
                      <li>Pune → Tuljapur (via Solapur)</li>
                      <li>Pune → Satara</li>
                      <li>Pune → Sangli (via Satara)</li>
                      <li>Solapur → Latur</li>
                      <li>Aurangabad → Nanded</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-800 rounded-2xl p-6 border border-white/10 shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-white">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <span className="text-slate-300">Total Routes:</span>
                    <strong className="text-2xl font-bold text-blue-400">{stats.totalRoutes}</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <span className="text-slate-300">Active Buses:</span>
                    <strong className="text-2xl font-bold text-green-400">{stats.activeBuses}</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <span className="text-slate-300">Bus Stops:</span>
                    <strong className="text-2xl font-bold text-purple-400">{stats.busStops}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-white/10 shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-white">Popular Routes</h3>
                <div className="space-y-3">
                {routes.map(route => {
                  const busesOnRoute = buses.filter(b => b.routeId === route.id).length
                  return (
                  <div 
                    key={route.id} 
                    className="p-4 bg-slate-700/30 rounded-xl border-l-4 hover:bg-slate-700/50 cursor-pointer transition-all duration-300 group"
                    style={{ borderLeftColor: route.color }}
                    onClick={() => {
                      setSelectedRoute(route)
                      setActiveTab('queue')
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-sm group-hover:text-white transition-colors" style={{ color: route.color }}>
                        {route.name}
                      </div>
                      {busesOnRoute > 0 && (
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-semibold text-white flex-shrink-0"
                          style={{ background: route.color }}
                        >
                          {busesOnRoute} {busesOnRoute === 1 ? 'bus' : 'buses'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{route.from} → {route.to}</div>
                  </div>
                )})}
                </div>
              
                {/* Quick Start Guide */}
                <div className="mt-6 p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                  <h4 className="text-base font-semibold mb-3 text-green-400 flex items-center gap-2">
                    🎯 Quick Start Guide
                  </h4>
                  <ol className="text-sm leading-relaxed text-slate-300 space-y-1 pl-5 list-decimal">
                    <li>Click any route above to view buses</li>
                    <li>Select a bus and click "Track Live"</li>
                    <li>View real-time location and ETA</li>
                    <li>Get notified when bus is nearby</li>
                  </ol>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Find Bus Tab */}
        {activeTab === 'find' && (
          <>
            <div className="lg:col-span-3">
              <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Find Your Bus</h2>
                <p className="text-slate-300 mb-6">Browse all available routes and buses in Maharashtra</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {routes.map((route) => {
                    const busesOnRoute = buses.filter(b => b.routeId === route.id)
                    return (
                      <div 
                        key={route.id}
                        className="bg-slate-700/30 rounded-xl p-5 border-l-4 hover:bg-slate-700/50 cursor-pointer transition-all duration-300 group"
                        style={{ borderLeftColor: route.color }}
                        onClick={() => {
                          setSelectedRoute(route)
                          setActiveTab('queue')
                        }}
                      >
                        <h3 
                          className="text-lg font-bold mb-2 group-hover:text-white transition-colors"
                          style={{ color: route.color }}
                        >
                          {route.name}
                        </h3>
                        <div className="space-y-2 text-sm text-slate-300">
                          <div className="flex justify-between">
                            <span>Route:</span>
                            <strong className="text-white">{route.from} → {route.to}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Distance:</span>
                            <strong className="text-white">{route.distance}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Fare:</span>
                            <strong className="text-green-400">{route.fare}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <strong className="text-white">{route.duration}</strong>
                          </div>
                          {busesOnRoute.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-600">
                              <span 
                                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                style={{ background: route.color }}
                              >
                                {busesOnRoute.length} {busesOnRoute.length === 1 ? 'bus' : 'buses'} available
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bus Queue Tab */}
        {activeTab === 'queue' && selectedRoute && (
          <>
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Bus Queue & Schedule</h2>
                <div className="space-y-2 mb-6">
                  <label className="block text-sm font-semibold text-slate-300">Select Route</label>
                  <select 
                    value={selectedRoute.id} 
                    onChange={(e) => {
                      const route = routes.find(r => r.id === e.target.value)
                      if (route) setSelectedRoute(route)
                    }}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>{route.name}</option>
                    ))}
                  </select>
                </div>

                <div className="route-details">
                  <h3 style={{ color: selectedRoute.color }}>{selectedRoute.name}</h3>
                  <div className="route-info-grid">
                    <div className="info-item">
                      <span>Route:</span>
                      <strong>{selectedRoute.from} → {selectedRoute.to}</strong>
                    </div>
                    <div className="info-item">
                      <span>Distance:</span>
                      <strong>{selectedRoute.distance}</strong>
                    </div>
                    <div className="info-item">
                      <span>Duration:</span>
                      <strong>{selectedRoute.duration}</strong>
                    </div>
                    <div className="info-item">
                      <span>Frequency:</span>
                      <strong>{selectedRoute.frequency}</strong>
                    </div>
                  </div>
                </div>

                <div className="bus-queue">
                  <h3 className="queue-title">
                    <span className="live-indicator"></span>
                    Next {buses.filter(b => b.routeId === selectedRoute.id).length} buses arriving
                  </h3>
                  {buses.filter(bus => bus.routeId === selectedRoute.id).length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#64748b',
                      fontSize: '1rem'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🚌</div>
                      <p>No buses currently available on this route</p>
                      <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Please check back later or select a different route</p>
                    </div>
                  ) : (
                    buses.filter(bus => bus.routeId === selectedRoute.id).map((bus, idx) => {
                      const busRoute = routes.find(route => route.id === bus.routeId)
                      const dynamicETA = getBusETA(bus)
                      const etaWithTime = formatETAWithArrival(dynamicETA)
                      return (
                      <div key={bus.id} className="bus-card">
                      <div className="bus-header">
                        <div>
                          <h4>{bus.id} 🚌</h4>
                          <p className="driver-name">Driver: {bus.driver}</p>
                          {busRoute && (
                            <p style={{ 
                              fontSize: '0.85rem', 
                              color: busRoute.color, 
                              fontWeight: '600',
                              marginTop: '4px'
                            }}>
                              {busRoute.name}
                            </p>
                          )}
                        </div>
                        <div className="eta-badge" title={`Arrives at ${etaWithTime.split('(')[1]?.replace(')', '')}`}>
                          {dynamicETA}
                        </div>
                        <span className={`status-badge ${bus.status.toLowerCase()}`}>{bus.status}</span>
                      </div>
                      <div className="bus-info-grid">
                        <div className="info-col">
                          <span>Speed:</span>
                          <strong>{bus.speedDisplay}</strong>
                        </div>
                        <div className="info-col">
                          <span>Next Stop:</span>
                          <strong>{bus.nextStop}</strong>
                        </div>
                        <div className="info-col">
                          <span>ETA to Stop:</span>
                          <strong style={{ color: '#3b82f6' }}>{dynamicETA}</strong>
                        </div>
                      </div>
                      <div className="occupancy-section">
                        <div className="occupancy-header">
                          <span>Occupancy</span>
                          <strong>{bus.occupancy}/{bus.totalSeats} ({Math.round(bus.occupancy/bus.totalSeats*100)}%)</strong>
                        </div>
                        <div className="occupancy-bar">
                          <div className="occupancy-fill" style={{ width: `${bus.occupancy/bus.totalSeats*100}%` }}></div>
                        </div>
                      </div>
                      <div className="bus-actions">
                        <span className="last-update">Last updated: {new Date().toLocaleTimeString()}</span>
                        <button 
                          className="btn-track" 
                          onClick={() => handleTrackBus(bus)}
                          style={{
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseOver={(e) => {
                            const ripple = document.createElement('span')
                            ripple.style.cssText = 'position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:rgba(255,255,255,0.5);transform:translate(-50%,-50%);animation:ripple 0.6s ease-out;'
                            e.target.appendChild(ripple)
                            setTimeout(() => ripple.remove(), 600)
                          }}
                        >
                          📍 Track Live →
                        </button>
                      </div>
                    </div>
                  )}))}
                </div>
              </div>
            </div>
            <div className="sidebar-section">
              <div className="route-info-card">
                <h3 style={{ color: selectedRoute.color }}>{selectedRoute.name}</h3>
                <div className="info-row">
                  <span>Route:</span>
                  <strong>{selectedRoute.from} → {selectedRoute.to}</strong>
                </div>
                <div className="info-row">
                  <span>Distance:</span>
                  <strong>{selectedRoute.distance}</strong>
                </div>
                <div className="info-row">
                  <span>Fare:</span>
                  <strong>{selectedRoute.fare}</strong>
                </div>
                <div className="info-row">
                  <span>Frequency:</span>
                  <strong>{selectedRoute.frequency}</strong>
                </div>
              </div>

              <div className="how-it-works-card">
                <h3>How it works</h3>
                <ul>
                  <li>Buses are shown in arrival order</li>
                  <li>Real-time ETA updates</li>
                  <li>Occupancy levels displayed</li>
                  <li>Click any bus to track live</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Live Tracking Tab */}
        {activeTab === 'tracking' && trackingBus && busPosition && (
          <>
            <div className="lg:col-span-3">
              <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Live Bus Tracking - {trackingBus.id}</h2>
                    {selectedRoute && (
                      <p className="text-base font-semibold mt-2" style={{ color: selectedRoute.color }}>
                        {selectedRoute.name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        const map = document.querySelector('.leaflet-container')
                        if (map && map._leaflet_map) {
                          // Fit bounds to show all stops
                          if (selectedRoute && selectedRoute.stops) {
                            const bounds = selectedRoute.stops.map(stop => stop.location)
                            map._leaflet_map.fitBounds(bounds, { padding: [50, 50] })
                          }
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      🗺️ View Full Route
                    </button>
                    <span className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold flex items-center gap-2 border border-red-500/30">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 rounded-xl overflow-hidden border border-white/10">
                  <MapContainer 
                    center={busPosition} 
                    zoom={10} 
                    style={{ height: '500px', width: '100%' }}
                    scrollWheelZoom={true}
                    doubleClickZoom={true}
                    dragging={true}
                  >
                    <TileLayer 
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://leafletjs.com/">Leaflet</a>'
                    />
                    <FlyToLocation center={busPosition} zoom={10} />
                    
                    {/* Bus route path connecting all stops */}
                    {selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0 && (
                      <>
                        {/* Route path outer glow - wider for visibility */}
                        <Polyline 
                          positions={selectedRoute.stops.map(stop => stop.location)} 
                          color={selectedRoute.color}
                          weight={14}
                          opacity={0.15}
                        />
                        {/* Route path middle layer */}
                        <Polyline 
                          positions={selectedRoute.stops.map(stop => stop.location)} 
                          color={selectedRoute.color}
                          weight={8}
                          opacity={0.4}
                        />
                        {/* Route path main dashed line - RED and prominent */}
                        <Polyline 
                          positions={selectedRoute.stops.map(stop => stop.location)} 
                          color="#ef4444"
                          weight={4}
                          opacity={0.9}
                          dashArray="15, 10"
                        />
                        {/* Animated dots on route */}
                        <Polyline 
                          positions={selectedRoute.stops.map(stop => stop.location)} 
                          color="#ffffff"
                          weight={2}
                          opacity={1}
                          dashArray="2, 20"
                          className="animated-route"
                        />
                      </>
                    )}
                    
                    {/* User location marker with popup */}
                    {userPosition && (
                      <Marker position={userPosition} icon={userIcon}>
                        <Popup>
                          <div style={{ textAlign: 'center', padding: '5px' }}>
                            <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>📍 Your Location</strong>
                            <p style={{ margin: '5px 0', color: '#64748b', fontSize: '0.9rem' }}>
                              Lat: {userPosition[0].toFixed(4)}<br/>
                              Lng: {userPosition[1].toFixed(4)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Bus marker with popup */}
                    <Marker position={busPosition} icon={busIcon}>
                      <Popup>
                        <div style={{ textAlign: 'center', padding: '8px', minWidth: '180px' }}>
                          <strong style={{ color: '#3b82f6', fontSize: '1.1rem' }}>🚌 {trackingBus.id}</strong>
                          <p style={{ margin: '8px 0', color: '#64748b', fontSize: '0.9rem' }}>
                            Driver: {trackingBus.driver}<br/>
                            Speed: {trackingBus.speedDisplay}<br/>
                            Next Stop: {trackingBus.nextStop}
                          </p>
                          <div style={{ 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            padding: '8px',
                            borderRadius: '6px',
                            margin: '8px 0'
                          }}>
                            <span style={{ color: '#3b82f6', fontSize: '0.85rem' }}>
                              ETA to Stop: <strong>{getBusETA(trackingBus)}</strong>
                            </span>
                          </div>
                          {userPosition && (
                            <>
                              <p style={{ margin: '5px 0', color: '#ef4444', fontWeight: 'bold', fontSize: '0.95rem' }}>
                                📏 {calculateDistance(userPosition[0], userPosition[1], busPosition[0], busPosition[1])} km away
                              </p>
                              <div style={{ 
                                background: 'rgba(16, 185, 129, 0.1)', 
                                padding: '6px',
                                borderRadius: '6px',
                                marginTop: '6px'
                              }}>
                                <span style={{ color: '#10b981', fontSize: '0.85rem' }}>
                                  ⏱️ ETA to You: <strong>{getBusETAToUser(trackingBus, userPosition)}</strong>
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* Bus stops along the route */}
                    {selectedRoute && selectedRoute.stops && selectedRoute.stops.map((stop, idx) => (
                      <Marker key={`stop-${idx}`} position={stop.location} icon={busStopIcon}>
                        <Popup>
                          <div style={{ textAlign: 'center', padding: '8px', minWidth: '150px' }}>
                            <strong style={{ color: '#f59e0b', fontSize: '1.1rem', display: 'block', marginBottom: '8px' }}>
                              🚏 {stop.name}
                            </strong>
                            <div style={{ 
                              background: '#fef3c7', 
                              padding: '6px', 
                              borderRadius: '6px',
                              marginBottom: '6px'
                            }}>
                              <span style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: '600' }}>
                                Stop #{stop.order}
                              </span>
                            </div>
                            {stop.nextBusETA && (
                              <div style={{ 
                                background: '#dbeafe', 
                                padding: '6px', 
                                borderRadius: '6px',
                                marginTop: '6px'
                              }}>
                                <span style={{ color: '#1e40af', fontSize: '0.85rem' }}>
                                  Next Bus: <strong>{stop.nextBusETA}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
                
                {/* Map Legend */}
                <div className="mt-4 p-4 bg-slate-700/30 rounded-xl border border-white/10 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-300">🚌 Bus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm text-slate-300">📍 You</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-slate-300">🚏 Bus Stop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-1 bg-gradient-to-r from-red-500 via-transparent to-red-500 rounded"></div>
                    <span className="text-sm text-slate-300">🛣️ Route Path</span>
                  </div>
                  {userPosition && busPosition && (
                    <>
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-lg">
                        <span className="text-xs font-medium text-slate-300">Distance:</span>
                        <strong className="text-sm font-bold text-blue-400">
                          {calculateDistance(userPosition[0], userPosition[1], busPosition[0], busPosition[1])} km
                        </strong>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-lg">
                        <span className="text-xs font-medium text-green-400">⏱️ ETA to You:</span>
                        <strong className="text-sm font-bold text-green-400">
                          {getBusETAToUser(trackingBus, userPosition)}
                        </strong>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-2xl p-6 border border-white/10 shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-white">Bus Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Bus Number:</span>
                    <strong className="text-white">{trackingBus.id}</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Driver:</span>
                    <strong className="text-white">{trackingBus.driver}</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <span className="text-slate-300">Status:</span>
                    <strong className="text-green-400">{trackingBus.status}</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Speed:</span>
                    <strong className="text-white">{trackingBus.speedDisplay}</strong>
                  </div>
                  {userPosition && busPosition && (
                    <>
                      <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <span className="text-slate-300">Distance to You:</span>
                        <strong className="text-red-400 font-bold">
                          {calculateDistance(userPosition[0], userPosition[1], busPosition[0], busPosition[1])} km
                        </strong>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <span className="text-slate-300">ETA to You:</span>
                        <strong className="text-green-400 font-bold text-lg">
                          {getBusETAToUser(trackingBus, userPosition)}
                        </strong>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Next Stop:</span>
                    <strong className="text-white">{trackingBus.nextStop}</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <span className="text-slate-300">ETA to Stop:</span>
                    <strong className="text-blue-400 font-bold">
                      {getBusETA(trackingBus)}
                    </strong>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-lg border border-blue-500/20 mt-2">
                    <span className="block text-xs text-slate-400 mb-1">Estimated Arrival:</span>
                    <strong className="text-blue-400 text-base">
                      {formatETAWithArrival(getBusETA(trackingBus)).split('(')[1]?.replace(')', '') || 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-white/10 shadow-2xl mt-6">
                <h3 className="text-xl font-bold mb-4 text-white">Occupancy</h3>
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border-4 border-blue-500/30">
                    <span className="text-3xl font-bold text-white">{Math.round(trackingBus.occupancy/trackingBus.totalSeats*100)}%</span>
                  </div>
                </div>
                <p className="text-center text-slate-300 mb-4">{trackingBus.occupancy} of {trackingBus.totalSeats} seats</p>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 rounded-full"
                    style={{ width: `${trackingBus.occupancy/trackingBus.totalSeats*100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Bus Stops Card */}
              {selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0 && (
                <div className="bg-slate-800 rounded-2xl p-6 border border-white/10 shadow-2xl mt-6">
                  <h3 className="text-xl font-bold mb-4 text-white">🚏 Route Stops</h3>
                  <div className="space-y-3">
                    {selectedRoute.stops.map((stop, idx) => (
                      <div key={idx} className="p-3 bg-slate-700/30 rounded-lg border-l-4 border-orange-500 hover:bg-slate-700/50 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                            {stop.order}
                          </div>
                          <div className="flex-grow">
                            <div className="font-semibold text-white text-sm">{stop.name}</div>
                            {stop.nextBusETA && (
                              <div className="text-xs text-blue-400 mt-1">Next: {stop.nextBusETA}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
      </div>
      </div>
      
      {/* Floating Action Button */}
      {!trackingBus && activeTab !== 'tracking' && (
        <div className="fixed bottom-8 right-8 z-[1000]">
          <button
            onClick={() => setActiveTab('queue')}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-2xl flex items-center justify-center shadow-2xl shadow-rose-500/50 hover:shadow-3xl hover:shadow-rose-500/70 hover:scale-110 transition-all duration-300 animate-[pulse-slow_2s_ease-in-out_infinite]"
            title="Start Live Tracking"
          >
            🚌
          </button>
        </div>
      )}
    </div>
  )
}
