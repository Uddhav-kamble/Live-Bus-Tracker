import React, { useState } from 'react'
import PassengerDashboard from './components/PassengerDashboard'
import DriverDashboard from './components/DriverDashboard'
import AdminPanel from './components/AdminPanel'

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [currentView, setCurrentView] = useState('landing')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [loginType, setLoginType] = useState('') // 'driver' or 'admin'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // const toggleTheme = () => {
  //   setTheme(theme === 'dark' ? 'light' : 'dark')
  // }

  const openLoginModal = (type) => {
    setLoginType(type)
    setShowLoginModal(true)
    setUsername('')
    setPassword('')
  }

  const closeLoginModal = () => {
    setShowLoginModal(false)
    setUsername('')
    setPassword('')
  }

  const handleLogin = (e) => {
    e.preventDefault()
    // Demo credentials check
    if (loginType === 'driver' && username === 'driver123' && password === 'driver123') {
      closeLoginModal()
      setCurrentView('driver')
    } else if (loginType === 'admin' && username === 'admin123' && password === 'admin123') {
      closeLoginModal()
      setCurrentView('admin')
    } else {
      alert('Invalid credentials! Use demo credentials shown below.')
    }
  }

  if (currentView === 'passenger') {
    return <PassengerDashboard onBack={() => setCurrentView('landing')} />
  }

  if (currentView === 'driver') {
    return <DriverDashboard onBack={() => setCurrentView('landing')} />
  }

  if (currentView === 'admin') {
    return <AdminPanel onBack={() => setCurrentView('landing')} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-white/10">
        <div className="container mx-auto px-8 md:px-16 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="text-4xl">🚌</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              TrackMyBus
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowAboutModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              <span>ℹ️</span>
              <span className="hidden md:inline">About</span>
            </button>
            <button 
              onClick={() => setShowContactModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              <span>📞</span>
              <span className="hidden md:inline">Contact</span>
            </button>
            {/* <button 
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button> */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-8 py-20 text-center">
        <div className="text-9xl mb-6 animate-bounce">🚌</div>
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-[gradient-shift_3s_ease_infinite] bg-[length:200%_200%]">
          TrackMyBus
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto">
          Never miss your bus again with <span className="text-green-400 font-semibold">real-time tracking</span> and smart notifications
        </p>
        <p className="text-lg text-slate-400">Smart • Reliable • Always On Time</p>
      </section>

      {/* Role Cards Section */}
      <section className="container mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Passenger Card */}
          <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 animate-[fadeInUp_0.6s_ease-out]">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">👤</div>
            <h2 className="text-3xl font-bold mb-4 text-white">I'm a Passenger</h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Manage trips and share location with passengers in real-time
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                Route Planning
              </span>
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                Live Tracking
              </span>
            </div>
            <button 
              onClick={() => setCurrentView('passenger')}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-1"
            >
              Start Tracking →
            </button>
          </div>

          {/* Driver Card */}
          <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 animate-[fadeInUp_0.6s_ease-out_0.1s]">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🚌</div>
            <h2 className="text-3xl font-bold mb-4 text-white">I'm a Driver</h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Manage trips and share location with passengers in real-time
            </p>
            <div className="flex flex-wrap gap-1 mb-8">
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                Trip Management
              </span>
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                Location Sharing
              </span>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => openLoginModal('driver')}
                className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 transform hover:-translate-y-1"
              >
                🔥 Login
              </button>
              <button className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all duration-300 border border-white/20">
                Dashboard →
              </button>
            </div>
          </div>

          {/* Admin Card */}
          <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 animate-[fadeInUp_0.6s_ease-out_0.2s]">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">📊</div>
            <h2 className="text-3xl font-bold mb-4 text-white">I'm an Admin</h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Monitor fleet operations and view comprehensive analytics
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium border border-purple-500/30">
                Fleet Monitoring
              </span>
              <span className="px-4 py-2 bg-pink-500/20 text-pink-400 rounded-full text-sm font-medium border border-pink-500/30">
                Analytics
              </span>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => openLoginModal('admin')}
                className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 transform hover:-translate-y-1"
              >
                🔥 Login
              </button>
              <button className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all duration-300 border border-white/20">
                Admin Panel →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl transform animate-[fadeInUp_0.4s_ease-out]">
            {/* Close Button */}
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">
                {loginType === 'driver' ? '🚌' : '📊'}
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {loginType === 'driver' ? 'Driver Login' : 'Admin Login'}
              </h2>
              <p className="text-slate-400">
                Access your {loginType === 'driver' ? 'driver dashboard' : 'admin panel'}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={loginType === 'driver' ? 'driver123' : 'admin123'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-1"
              >
                Login to Dashboard
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400 font-medium mb-2">Demo Credentials:</p>
              <p className="text-xs text-slate-300">
                Username: <span className="font-mono text-blue-400">{loginType}123</span>
              </p>
              <p className="text-xs text-slate-300">
                Password: <span className="font-mono text-blue-400">{loginType}123</span>
              </p>
            </div>

            {/* Back Link */}
            <button
              onClick={closeLoginModal}
              className="w-full mt-4 text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl transform animate-[fadeInUp_0.4s_ease-out]">
            {/* Close Button */}
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">ℹ️</div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                About TrackMyBus
              </h2>
            </div>

            {/* About Content */}
            <div className="space-y-4 text-slate-300">
              <p className="text-lg leading-relaxed">
                <span className="text-blue-400 font-semibold">TrackMyBus</span> is a comprehensive real-time bus tracking system designed to revolutionize public transportation in Maharashtra.
              </p>
              
              <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">🎯 Key Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong className="text-white">Real-time Tracking:</strong> Live location updates for all buses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong className="text-white">Smart ETA:</strong> Accurate arrival time predictions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong className="text-white">Route Planning:</strong> Plan your journey with multiple routes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong className="text-white">Fleet Management:</strong> Admin dashboard for complete oversight</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">👥 For Everyone</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <div className="text-2xl mb-1">👤</div>
                    <p className="font-medium text-white">Passengers</p>
                    <p className="text-xs text-slate-400">Track & Plan</p>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="text-2xl mb-1">🚌</div>
                    <p className="font-medium text-white">Drivers</p>
                    <p className="text-xs text-slate-400">Manage Trips</p>
                  </div>
                  <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <div className="text-2xl mb-1">📊</div>
                    <p className="font-medium text-white">Admins</p>
                    <p className="text-xs text-slate-400">Monitor Fleet</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-slate-400 pt-2">
                Making public transportation smarter, one bus at a time. 🚌
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-1"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl transform animate-[fadeInUp_0.4s_ease-out]">
            {/* Close Button */}
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">📞</div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Contact Us
              </h2>
              <p className="text-slate-400">We'd love to hear from you!</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 text-slate-300">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="font-medium text-white">support@trackmybus.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="text-sm text-slate-400">Phone</p>
                    <p className="font-medium text-white">+91 1800-123-4567</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-sm text-slate-400">Address</p>
                    <p className="font-medium text-white">Pune, Maharashtra, India</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="text-sm text-slate-400">Support Hours</p>
                    <p className="font-medium text-white">24/7 Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
