'use client'

import { useState, useEffect, Suspense } from 'react'
import { auth, db } from '@/lib/firebase'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, User, Building2, Heart } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

function AuthForm() {
  // Common fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Role selection
  const [userType, setUserType] = useState('') // 'patient' or 'hospital_admin'
  
  // Google Auth state
  const [isGoogleAuth, setIsGoogleAuth] = useState(false)
  const [googleUserId, setGoogleUserId] = useState('')
  
  // Patient fields
  const [patientName, setPatientName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('')
  
  // Hospital Admin fields
  const [adminName, setAdminName] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [area, setArea] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [country] = useState('India') // Default country
  const [phoneNumber, setPhoneNumber] = useState('')
  const [fetchingPinCode, setFetchingPinCode] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'signup') {
      setIsSignUp(true)
    }
  }, [searchParams])

  const validatePatientForm = () => {
    if (!patientName.trim()) throw new Error('Name is required')
    if (!age || parseInt(age) <= 0 || parseInt(age) > 150) {
      throw new Error('Please enter a valid age between 1 and 150')
    }
    if (!sex) throw new Error('Please select your sex')
  }

  const validateHospitalAdminForm = () => {
    if (!adminName.trim()) throw new Error('Admin name is required')
    if (!hospitalName.trim()) throw new Error('Hospital name is required')
    if (!addressLine1.trim()) throw new Error('Address Line 1 is required')
    if (!area.trim()) throw new Error('Area is required')
    if (!city.trim()) throw new Error('City is required')
    if (!state.trim()) throw new Error('State is required')
    if (!pinCode.trim()) throw new Error('PIN Code is required')
    if (!/^\d{6}$/.test(pinCode)) throw new Error('PIN Code must be 6 digits')
    if (!phoneNumber.trim()) throw new Error('Phone number is required')
  }

  // Fetch city and state based on PIN code using India Post API
  const handlePinCodeChange = async (pin: string) => {
    setPinCode(pin)
    
    // Only fetch if PIN code is 6 digits
    if (pin.length === 6 && /^\d{6}$/.test(pin)) {
      setFetchingPinCode(true)
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
        const data = await response.json()
        
        if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0]
          setCity(postOffice.District || '')
          setState(postOffice.State || '')
          setArea(postOffice.Name || '') // Post office name as area suggestion
        } else {
          // Clear fields if invalid PIN
          setCity('')
          setState('')
        }
      } catch (error) {
        console.error('Error fetching PIN code data:', error)
      } finally {
        setFetchingPinCode(false)
      }
    } else if (pin.length < 6) {
      // Clear city and state if PIN is incomplete
      setCity('')
      setState('')
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        if (!userType) throw new Error('Please select user type')
        
        // Validate based on user type
        if (userType === 'patient') {
          validatePatientForm()
        } else if (userType === 'hospital_admin') {
          validateHospitalAdminForm()
        }

        // For Google Auth users, skip creating auth user (already authenticated)
        let userId = googleUserId
        
        if (!isGoogleAuth) {
          // Create Firebase auth user only for email/password signup
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          userId = userCredential.user.uid
        }
        
        console.log('User Type Selected:', userType)
        console.log('User ID:', userId)
        
        if (userType === 'patient') {
          // Handle patient registration
          const profileData = {
            id: userId,
            email: email,
            name: patientName.trim(),
            age: parseInt(age),
            sex: sex,
            role: 'patient',
            authProvider: isGoogleAuth ? 'google' : 'email',
            created_at: serverTimestamp()
          }

          console.log('Profile Data to Insert:', profileData)

          // Create profile document in Firestore
          await setDoc(doc(db, 'profiles', userId), profileData)
          
          console.log('Patient profile created successfully')
          
        } else if (userType === 'hospital_admin') {
          // Handle hospital admin registration
          try {
            // Combine address fields into full address
            const fullAddress = [
              addressLine1.trim(),
              addressLine2.trim(),
              area.trim(),
              `${city.trim()}, ${state.trim()} - ${pinCode.trim()}`,
              country
            ].filter(Boolean).join(', ')

            // Create hospital document with auto-generated ID
            const hospitalRef = doc(db, 'hospitals', userId + '_hospital')
            await setDoc(hospitalRef, {
              id: hospitalRef.id,
              name: hospitalName.trim(),
              address: fullAddress,
              phone: phoneNumber.trim(),
              admin_id: userId,
              created_at: serverTimestamp()
            })

            // Create admin profile with hospital reference
            await setDoc(doc(db, 'profiles', userId), {
              id: userId,
              email: email,
              name: adminName.trim(),
              age: 0,
              sex: 'other',
              role: 'hospital_admin',
              hospital_id: hospitalRef.id,
              hospital_name: hospitalName.trim(),
              phone_number: phoneNumber.trim(),
              authProvider: isGoogleAuth ? 'google' : 'email',
              created_at: serverTimestamp()
            })

            console.log('Hospital created successfully with ID:', hospitalRef.id)
            
          } catch (error: unknown) {
            console.error('Hospital admin registration error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            alert('Failed to complete hospital admin registration: ' + errorMessage)
            return
          }
        }
        
        alert(`${userType === 'patient' ? 'Patient' : 'Hospital Admin'} account created! ${isGoogleAuth ? 'Redirecting to dashboard...' : 'You can now log in.'}`)
        
        if (isGoogleAuth) {
          router.push('/dashboard') // Google auth users are already signed in
        } else {
          setIsSignUp(false) // Switch to login mode for email/password users
        }
      } else {
        // Sign in with Firebase
        await signInWithEmailAndPassword(auth, email, password)
        router.push('/')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      console.log('Google Sign-In successful:', user.uid)
      
      // Check if user already has a profile in Firestore
      const userDoc = await getDoc(doc(db, 'profiles', user.uid))
      
      if (userDoc.exists()) {
        // Existing user - redirect to dashboard
        console.log('Existing user found, redirecting to dashboard')
        router.push('/dashboard')
      } else {
        // New user - show registration form with pre-filled data
        console.log('New Google user, showing registration form')
        
        // Extract name from Google profile
        const displayName = user.displayName || ''
        
        // Pre-fill the form
        setEmail(user.email || '')
        setPatientName(displayName)
        setAdminName(displayName)
        setGoogleUserId(user.uid)
        setIsGoogleAuth(true)
        setIsSignUp(true)
        
        // Don't set userType yet - let user choose
        alert('Welcome! Please complete your profile to continue.')
      }
    } catch (error: unknown) {
      console.error('Google Sign-In error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setUserType('')
    setPatientName('')
    setAge('')
    setSex('')
    setAdminName('')
    setHospitalName('')
    setAddressLine1('')
    setAddressLine2('')
    setArea('')
    setCity('')
    setState('')
    setPinCode('')
    setPhoneNumber('')
    setIsGoogleAuth(false)
    setGoogleUserId('')
  }

  return (
    <>
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
            
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Dashboard
              </Link>
              <Link href="/about" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                About
              </Link>
              <Link href="/contact" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Contact
              </Link>
              
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>
              
              <ThemeToggle />
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
            </div>
          </div>
        )}
      </nav>

      {/* Auth Form */}
      <div className="flex items-center justify-center min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isSignUp 
                ? 'Join SmartMed to access real-time healthcare data' 
                : 'Sign in to access your dashboard'
              }
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            {/* Google Sign-In Button - Only show when not in signup mode or when choosing user type */}
            {(!isSignUp || (isSignUp && !userType)) && !isGoogleAuth && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {loading ? 'Connecting...' : 'Continue with Google'}
                </button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">OR</span>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleAuth}>
              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* User Type Selection for Signup */}
              {isSignUp && !userType && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-6">
                    Select Account Type
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      type="button"
                      onClick={() => setUserType('patient')}
                      className="flex items-center p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mr-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">Patient</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Find and track hospital resources</div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setUserType('hospital_admin')}
                      className="flex items-center p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mr-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50">
                        <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">Hospital Admin</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Manage hospital data and availability</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Show form based on user type or for sign in */}
              {(!isSignUp || userType) && (
                <>
                  {/* Common Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email address {isGoogleAuth && <span className="text-xs text-blue-600 dark:text-blue-400">(from Google)</span>}
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      disabled={isGoogleAuth}
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors ${isGoogleAuth ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''}`}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Patient Registration Fields */}
                  {isSignUp && userType === 'patient' && (
                    <>
                      <div>
                        <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name * {isGoogleAuth && <span className="text-xs text-blue-600 dark:text-blue-400">(from Google)</span>}
                        </label>
                        <input
                          id="patientName"
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          placeholder="Enter your full name"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                        />
                        {isGoogleAuth && patientName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">✓ Auto-filled from your Google account</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Age *
                          </label>
                          <input
                            id="age"
                            type="number"
                            required
                            min="1"
                            max="150"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            placeholder="Age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                          />
                        </div>

                        <div>
                          <label htmlFor="sex" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sex *
                          </label>
                          <select
                            id="sex"
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                          >
                            <option value="">Select...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Hospital Admin Registration Fields */}
                  {isSignUp && userType === 'hospital_admin' && (
                    <>
                      <div>
                        <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Admin Name * {isGoogleAuth && <span className="text-xs text-blue-600 dark:text-blue-400">(from Google)</span>}
                        </label>
                        <input
                          id="adminName"
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          placeholder="Enter admin name"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                        />
                        {isGoogleAuth && adminName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">✓ Auto-filled from your Google account</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hospital Name *
                        </label>
                        <input
                          id="hospitalName"
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          placeholder="Enter hospital name"
                          value={hospitalName}
                          onChange={(e) => setHospitalName(e.target.value)}
                        />
                      </div>

                      {/* Address Line 1 */}
                      <div>
                        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address Line 1 *
                        </label>
                        <input
                          id="addressLine1"
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          placeholder="Building/House No., Street Name"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                        />
                      </div>

                      {/* Address Line 2 */}
                      <div>
                        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          id="addressLine2"
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          placeholder="Landmark, Colony, etc."
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                        />
                      </div>

                      {/* PIN Code - First so it can auto-fill city/state */}
                      <div>
                        <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          PIN Code *
                        </label>
                        <input
                          id="pinCode"
                          type="text"
                          required
                          maxLength={6}
                          pattern="[0-9]{6}"
                          inputMode="numeric"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          placeholder="Enter 6-digit PIN code"
                          value={pinCode}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, '')
                            handlePinCodeChange(numericValue)
                          }}
                        />
                        {fetchingPinCode && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            Fetching location details...
                          </p>
                        )}
                      </div>

                      {/* Area */}
                      <div>
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Area/Locality *
                        </label>
                        <input
                          id="area"
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          placeholder="Area/Locality"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                        />
                      </div>

                      {/* City and State - Two columns */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            City *
                          </label>
                          <input
                            id="city"
                            type="text"
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>

                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            State *
                          </label>
                          <input
                            id="state"
                            type="text"
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            placeholder="State"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Country - Read only */}
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Country
                        </label>
                        <input
                          id="country"
                          type="text"
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-lg cursor-not-allowed"
                          value={country}
                        />
                      </div>

                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number *
                        </label>
                        <input
                          id="phoneNumber"
                          type="tel"
                          required
                          pattern="[0-9]*"
                          inputMode="numeric"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          placeholder="Enter phone number (numbers only)"
                          value={phoneNumber}
                          onChange={(e) => {
                            // Only allow numeric characters
                            const numericValue = e.target.value.replace(/[^0-9]/g, '')
                            setPhoneNumber(numericValue)
                          }}
                          onKeyPress={(e) => {
                            // Prevent non-numeric characters from being typed
                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                              e.preventDefault()
                            }
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* Password Field - Hide for Google Auth */}
                  {!isGoogleAuth && (
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {loading ? 'Loading...' : (
                      isSignUp 
                        ? (isGoogleAuth ? 'Complete Registration' : 'Create Account')
                        : 'Sign In'
                    )}
                  </button>

                  {/* Google Auth Info */}
                  {isGoogleAuth && isSignUp && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        🎉 You&apos;re signing in with Google! Complete your profile to get started.
                      </p>
                    </div>
                  )}

                  {/* Back button for signup */}
                  {isSignUp && userType && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                    >
                      ← Back to account type selection
                    </button>
                  )}
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  resetForm()
                }}
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : 'Need an account? Sign up'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  )
}
