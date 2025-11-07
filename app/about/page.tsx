'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, Heart, Users, Award, X, User } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuth } from '@/lib/useAuthFixed'

export default function AboutPage() {
  const { profile, signOut, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 z-50">
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
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Dashboard
              </Link>
              <Link href="/admission" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Admission AI
              </Link>
              <Link href="/about" className="text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Contact
              </Link>
              
              <ThemeToggle />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{profile?.name || 'User'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{profile?.role === 'hospital_admin' ? 'Hospital Admin' : profile?.role || 'Patient'}</div>
                  </div>
                  <Link
                    href="/profile"
                    className="relative flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors group"
                    title="View Profile"
                  >
                    {profile?.avatar_url ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    )}
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  href="/auth" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium ml-2"
                >
                  Get Started
                </Link>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="relative flex w-full max-w-xs flex-col bg-white dark:bg-gray-900 pb-12 shadow-xl">
                <div className="flex px-4 pb-2 pt-5">
                  <button
                    type="button"
                    className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 px-4 py-6">
                  <div className="flow-root">
                    <Link
                      href="/dashboard"
                      className="-m-2 block p-2 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </div>
                  <div className="flow-root">
                    <Link
                      href="/admission"
                      className="-m-2 block p-2 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admission AI
                    </Link>
                  </div>
                  <div className="flow-root">
                    <Link
                      href="/about"
                      className="-m-2 block p-2 font-medium text-blue-600 dark:text-blue-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                  </div>
                  <div className="flow-root">
                    <Link
                      href="/contact"
                      className="-m-2 block p-2 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-6">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Link
                          href="/profile"
                          className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {profile?.avatar_url ? (
                            <Image 
                              src={profile.avatar_url} 
                              alt="Profile" 
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          )}
                        </Link>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {profile?.name || 'User'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {profile?.role === 'hospital_admin' ? 'Hospital Admin' : profile?.role || 'Patient'}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          handleSignOut()
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link 
                      href="/auth" 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-center block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-gray-100 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6">
            About SmartMed
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Revolutionizing healthcare management with AI-powered admission predictions and real-time hospital bed tracking.
          </p>
        </div>
      </section>

      {/* AI-Powered Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400 font-semibold text-sm mb-4">
              Powered by Artificial Intelligence
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Smart Admission Predictions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our cutting-edge machine learning model analyzes historical admission patterns to predict future patient volumes with remarkable accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Neural Network Technology
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our 5-layer deep learning neural network processes 10 different features including:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Day of week patterns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Historical 7-day and 30-day averages</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Weekend and holiday indicators</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Seasonal trends and patterns</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Auto-Training System
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our intelligent auto-training system keeps predictions accurate by:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Automatic model training with 30+ days of data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Weekly re-training for optimal accuracy</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Real-time browser-based predictions (no server needed)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Persistent model storage for instant predictions</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📊</div>
              <div>
                <h3 className="text-2xl font-bold mb-3">Comprehensive Predictions</h3>
                <p className="text-emerald-50 text-lg">
                  Get detailed forecasts for total admissions, emergency cases, OPD patients, and scheduled procedures - 
                  helping hospitals optimize staff allocation and resource management up to 30 days in advance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Every second counts in healthcare emergencies. SmartMed was born from the need to bridge the gap between patients seeking urgent care and hospitals with available resources.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                By combining real-time bed availability tracking with AI-powered admission predictions, we help hospitals prepare for patient influx before it happens, ensuring optimal resource allocation and patient care.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                We believe that no one should suffer due to lack of information about hospital availability. Our platform ensures that critical healthcare information is accessible to everyone, when they need it most.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
              <Heart className="h-16 w-16 text-red-500 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Saving Lives Through AI & Technology
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our real-time tracking system combined with predictive AI has helped hundreds of patients find the care they need quickly and efficiently across our network of 30+ partner hospitals.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mt-6">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">300+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Beds Monitored</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={<Activity className="h-12 w-12 text-blue-600 dark:text-blue-400" />}
              title="AI-Powered Intelligence"
              description="Our machine learning models continuously learn from admission patterns to provide accurate predictions and insights."
            />
            <ValueCard
              icon={<Users className="h-12 w-12 text-green-600 dark:text-green-400" />}
              title="Accessibility"
              description="We design our platform to be accessible to everyone, regardless of technical expertise or physical abilities."
            />
            <ValueCard
              icon={<Award className="h-12 w-12 text-purple-600 dark:text-purple-400" />}
              title="Data-Driven Excellence"
              description="We use advanced analytics and predictive models to help hospitals optimize operations and improve patient care."
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Making a real difference in healthcare management
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <StatCard
              number="15,000+"
              label="Patients Helped"
              description="People who found hospital beds through our platform"
            />
            <StatCard
              number="30+"
              label="Partner Hospitals"
              description="Healthcare facilities using our tracking system"
            />
            <StatCard
              number="95%+"
              label="ML Accuracy"
              description="Admission prediction accuracy with our AI model"
            />
            <StatCard
              number="30 Days"
              label="Future Insights"
              description="Advance predictions for optimal planning"
            />
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Predictive Analytics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Our neural network analyzes patterns to forecast admission volumes with high accuracy
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Real-Time Updates</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Instant bed availability tracking ensures hospitals always have current information
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="text-3xl mb-3">🔄</div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Auto-Training</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Models automatically retrain weekly to adapt to changing admission patterns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Experience AI-Powered Healthcare Management
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
            Join hospitals using our ML-powered platform to predict admissions, optimize resources, and improve patient care across 300+ monitored beds
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/admission" 
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              Try Admission AI
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              View Dashboard
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 font-semibold text-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
              <span className="text-xl font-bold">SmartMed</span>
            </div>
            <p className="text-gray-400 mb-2">
              AI-powered healthcare management for better patient outcomes.
            </p>
            <p className="text-gray-500 text-sm">
              Combining real-time bed tracking with predictive analytics.
            </p>
            <div className="mt-8 flex justify-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/admission" className="text-gray-400 hover:text-white transition-colors">Admission AI</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>
            <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-gray-400">
              <p>&copy; 2025 SmartMed. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="flex justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  )
}

function StatCard({ number, label, description }: { number: string, label: string, description: string }) {
  return (
    <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{number}</div>
      <div className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{label}</div>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}
