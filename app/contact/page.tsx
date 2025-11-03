'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, Mail, Phone, MapPin, Send, X, User, Heart } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuth } from '@/lib/useAuthFixed'

export default function ContactPage() {
  const { profile, signOut, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setLoading(false)
    setSubmitted(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                About
              </Link>
              <Link href="/contact" className="text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg">
                Contact
              </Link>
              
              <ThemeToggle />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
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
                    className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium ml-2"
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
                      className="-m-2 block p-2 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                  </div>
                  <div className="flow-root">
                    <Link
                      href="/contact"
                      className="-m-2 block p-2 font-medium text-blue-600 dark:text-blue-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-6">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Link
                          href="/profile"
                          className="relative flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors group"
                          title="View Profile"
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
                            <User className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                          )}
                        </Link>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Welcome, {profile?.name || 'User'}!
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
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
            We&apos;re here to help. Get in touch with our team for support, partnerships, or any questions about SmartMed.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <ContactInfo
                    icon={<Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                    title="Email"
                    info="support@medtracker.com"
                    description="For general inquiries and support"
                  />
                  <ContactInfo
                    icon={<Phone className="h-6 w-6 text-green-600 dark:text-green-400" />}
                    title="Phone"
                    info="+1 (555) 123-4567"
                    description="24/7 emergency support hotline"
                  />
                  <ContactInfo
                    icon={<MapPin className="h-6 w-6 text-red-600 dark:text-red-400" />}
                    title="Address"
                    info="123 Healthcare Ave, Medical District, NY 10001"
                    description="Our headquarters"
                  />
                </div>

                <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Emergency Support</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    For critical system issues affecting patient care, call our 24/7 emergency line immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
                
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="feedback">Feedback</option>
                        <option value="emergency">Emergency Support</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            <FAQItem
              question="How often is the hospital data updated?"
              answer="Hospital bed and oxygen availability data is updated in real-time as hospitals input new information. Most facilities update their status every 15-30 minutes."
            />
            <FAQItem
              question="Is MedTracker free to use for patients?"
              answer="Yes, MedTracker is completely free for patients and families seeking hospital information. We believe healthcare information should be accessible to everyone."
            />
            <FAQItem
              question="How can hospitals join the platform?"
              answer="Hospitals can join by contacting our partnership team. We provide training and integration support to ensure seamless data sharing."
            />
            <FAQItem
              question="What should I do in a medical emergency?"
              answer="In life-threatening emergencies, always call 911 first. MedTracker can help you find available facilities for non-emergency urgent care needs."
            />
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
            <p className="text-gray-400">
              Connecting patients with healthcare facilities through real-time bed availability tracking.
            </p>
            <div className="mt-8 flex justify-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <Link href="/auth" className="text-gray-400 hover:text-white transition-colors">Sign In</Link>
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

function ContactInfo({ icon, title, info, description }: { 
  icon: React.ReactNode, 
  title: string, 
  info: string, 
  description: string 
}) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-900 dark:text-white font-medium">{info}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <span className="text-gray-500 dark:text-gray-400">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-600 dark:text-gray-300">{answer}</p>
        </div>
      )}
    </div>
  )
}
