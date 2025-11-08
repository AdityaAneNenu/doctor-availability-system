'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Activity, Users, MapPin, ArrowRight, Building2, User, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/useAuthFixed'
import ThemeToggle from '@/components/ThemeToggle'
import { useState } from 'react'

export default function Home() {
  const { profile, loading, signOut, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  // Debug logging for authentication state
  console.log('Home page - Auth state:', { isAuthenticated, profile: profile?.name, loading })

  // Simple, fast loading check
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="h-96 bg-gray-100"></div>
        </div>
      </div>
    )
  }

  // If user is authenticated and has a profile, show a dashboard redirect message for mobile
  // but don't force redirect to let them choose
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <Link href="/" className="group">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Smart<span className="text-rose-500">Med</span>
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">Health Intelligence</p>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Dashboard
              </Link>
              <Link href="/admission" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Admission AI
              </Link>
              <Link href="/about" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                About
              </Link>
              <Link href="/contact" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Contact
              </Link>
              
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>
              
              <ThemeToggle />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 ml-2">
                  <Link
                    href="/profile"
                    className="relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 hover:scale-105 transition-transform"
                    title="Profile"
                  >
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <Image 
                          src={profile.avatar_url} 
                          alt="Profile" 
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      )}
                    </div>
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/auth" className="ml-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all">
                  Get Started
                </Link>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button 
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="px-4 py-3 space-y-1">
              <Link 
                href="/dashboard" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/admission" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admission AI
              </Link>
              <Link 
                href="/about" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {isAuthenticated ? (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all mb-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {profile?.avatar_url ? (
                        <Image 
                          src={profile.avatar_url} 
                          alt="Profile" 
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {profile?.name || 'User'}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {profile?.role === 'hospital_admin' ? 'Hospital Admin' : 'Patient'}
                      </div>
                    </div>
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-sm font-medium text-rose-600 dark:text-rose-400 py-2.5 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                  <Link 
                    href="/auth" 
                    className="block text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 px-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm text-center transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-40 dark:opacity-20">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 mb-6">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Real-time Healthcare Intelligence</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Smart Healthcare
                <br />
                <span className="text-blue-600 dark:text-blue-400">Resource Tracking</span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl">
                AI-powered disease prediction combined with real-time hospital resource monitoring. Make informed healthcare decisions with data-driven insights.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link 
                  href="/auth"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  href="/about"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Learn More
                </Link>
              </div>
              
              <div className="flex items-center space-x-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">300+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Beds Tracked</div>
                </div>
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">12</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Disease Models</div>
                </div>
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monitoring</div>
                </div>
              </div>
            </div>
            
            {/* Right content - Feature cards */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Live Tracking</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monitor hospital resources in real-time</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow mt-8">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Prediction</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weather-based disease forecasting</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Location Based</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Find hospitals near you instantly</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow mt-8">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi-Role</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Patients, hospitals, and admins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Account Info Section - Show when user is logged in */}
      {isAuthenticated && profile && (
        <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mobile Logged-in Banner - Only visible on mobile */}
            <div className="md:hidden mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white text-center shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Account Active</span>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Welcome back, {profile.name}! 👋
                </h3>
                <p className="text-sm opacity-90 mb-3">You&apos;re signed in and ready to access your healthcare dashboard</p>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  Go to Dashboard →
                </Link>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-500">
              {/* Welcome Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium mb-4">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  Account Active
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  Welcome back, {profile.name}! 👋
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Your healthcare dashboard is ready</p>
              </div>

              {/* Enhanced Account Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Type Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      {profile.role === 'hospital_admin' ? (
                        <Building2 className="h-6 w-6 text-white" />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">Account Type</div>
                      <div className="font-semibold">
                        {profile.role === 'hospital_admin' ? '🏥 Hospital Admin' : '👤 Patient'}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="text-sm opacity-90">
                      {profile.role === 'hospital_admin' 
                        ? 'Manage hospital data and availability' 
                        : 'View hospital availability and book services'
                      }
                    </div>
                  </div>
                </div>

                {/* Hospital Info Card */}
                {profile.hospital_name && (
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-80">Hospital</div>
                        <div className="font-semibold text-sm">{profile.hospital_name}</div>
                      </div>
                    </div>
                    <div className="border-t border-white/20 pt-4">
                      <div className="text-sm opacity-90">Healthcare facility</div>
                    </div>
                  </div>
                )}

                {/* Quick Actions Card */}
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">Quick Access</div>
                      <div className="font-semibold">Dashboard</div>
                    </div>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <Link 
                      href="/dashboard" 
                      className="inline-flex items-center text-sm hover:underline"
                    >
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link 
                  href="/dashboard" 
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-center hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center"
                >
                  <Activity className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Access Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className="group bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 px-8 py-4 rounded-xl font-semibold text-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center"
                >
                  <User className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Manage Profile
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Why Choose SmartMed</span>
            </div>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Healthcare Solutions
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage healthcare resources efficiently in one platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Real-Time Monitoring Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <Activity className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Real-Time Tracking
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Monitor bed availability, oxygen levels, and patient capacity across facilities with instant updates.
              </p>
              <Link href="/dashboard" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:gap-2 transition-all">
                View Dashboard <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {/* Disease Prediction Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                <TrendingUp className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                AI Disease Prediction
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Weather-based disease forecasting using advanced AI models to predict health trends in your area.
              </p>
              <Link href="/about" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:gap-2 transition-all">
                Learn More <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {/* Location-Based Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-rose-500 dark:hover:border-rose-400 transition-colors group">
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 transition-colors">
                <MapPin className="h-7 w-7 text-rose-600 dark:text-rose-400" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Location-Based Search
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Find nearby hospitals with available resources using PIN code-based filtering and smart matching.
              </p>
              <Link href="/contact" className="inline-flex items-center text-rose-600 dark:text-rose-400 font-medium hover:gap-2 transition-all">
                Get Started <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">30+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Partner Hospitals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Live Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">300+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Beds Monitored</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Healthcare Management?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join healthcare professionals using SmartMed to make data-driven decisions and improve patient outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">SmartMed</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Intelligent healthcare resource management powered by AI
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} SmartMed. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
