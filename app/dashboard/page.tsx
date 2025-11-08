'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, setDoc, getDoc, orderBy, limit, Timestamp } from 'firebase/firestore'
import { User as FirebaseUser } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Bed, MapPin, Phone, Clock, RefreshCw, Heart, User, Building, Droplets } from 'lucide-react'
import { useAuth } from '@/lib/useAuthFixed'
import ThemeToggle from '@/components/ThemeToggle'
import DashboardDoctorInsights from '@/components/DashboardDoctorInsights'

interface Profile {
  id: string
  name: string
  age: number
  sex: string
  role: string
  hospital_name?: string
  address?: string
  phone_number?: string
  avatar_url?: string
  hospital_id?: string
}

interface Hospital {
  id: number | string  // Allow both number and string IDs
  name: string
  address: string
  phone_number?: string
  latitude: number
  longitude: number
  pincode?: string
  availability?: {
    available_beds: number
    available_oxygen: number
    last_updated: string
  }[]
}

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!user) {
    return null
  }

  return <DashboardContent user={user} profile={profile} signOut={signOut} />
}

function DashboardContent({ user, profile, signOut }: { 
  user: FirebaseUser | null, 
  profile: Profile | null, 
  signOut: () => Promise<void> 
}) {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [userHospital, setUserHospital] = useState<Hospital | null>(null)
  const [error, setError] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // State for PIN code analysis
  const [selectedPinCode, setSelectedPinCode] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  
  // Admin form state - ADD THESE BACK
  const [selectedHospital, setSelectedHospital] = useState('')
  const [beds, setBeds] = useState('')
  const [oxygen, setOxygen] = useState('')

  // Handler for PIN code analysis
  const handlePinCodeAnalyzed = (pinCode: string, cityName: string) => {
    setSelectedPinCode(pinCode)
    setSelectedCity(cityName)
    console.log('PIN Code analyzed:', pinCode, 'City:', cityName)
    
    // Filter hospitals by PIN code
    if (pinCode) {
      const filtered = hospitals.filter(hospital => 
        hospital.pincode === pinCode || 
        hospital.address.includes(pinCode)
      )
      setFilteredHospitals(filtered)
      console.log(`Found ${filtered.length} hospitals in PIN code ${pinCode}`)
    } else {
      setFilteredHospitals(hospitals)
    }
  }

  // Debug logging (only when needed)
  console.log('Dashboard - User ID:', user?.uid)
  console.log('Dashboard - Profile:', { 
    id: profile?.id, 
    role: profile?.role, 
    hospital_id: profile?.hospital_id,
    name: profile?.name 
  })

  const loadUserHospital = useCallback(async () => {
    if (!profile?.hospital_id) {
      console.log('No hospital_id in profile')
      return
    }

    console.log('Loading hospital for admin, hospital_id:', profile.hospital_id)

    try {
      // Get hospital document from Firestore
      const hospitalRef = doc(db, 'hospitals', profile.hospital_id)
      const hospitalSnap = await getDoc(hospitalRef)

      if (!hospitalSnap.exists()) {
        console.error('Hospital document not found:', profile.hospital_id)
        throw new Error('Hospital not found')
      }

      const hospitalData = hospitalSnap.data()
      console.log('Hospital data loaded:', hospitalData)

      // Extract the actual hospital ID from the document
      let actualHospitalId = hospitalData.id || profile.hospital_id
      
      console.log('Actual hospital ID:', actualHospitalId, 'Type:', typeof actualHospitalId)

      // Get availability data for this hospital - use string comparison
      const hospitalIdKey = String(actualHospitalId)
      
      const availabilityQuery = query(
        collection(db, 'availability'),
        where('hospital_id', '==', actualHospitalId),  // Use original ID type
        orderBy('updated_at', 'desc'),
        limit(1)
      )
      const availabilitySnap = await getDocs(availabilityQuery)

      console.log('Availability records found:', availabilitySnap.size)

      const hospital: Hospital = {
        id: actualHospitalId,  // Keep as string if it's a string
        name: hospitalData.name,
        address: hospitalData.address,
        phone_number: hospitalData.phone,
        latitude: hospitalData.latitude || 0,
        longitude: hospitalData.longitude || 0,
        availability: availabilitySnap.empty ? [] : [{
          available_beds: availabilitySnap.docs[0].data().available_beds || 0,
          available_oxygen: availabilitySnap.docs[0].data().available_oxygen || 0,
          last_updated: availabilitySnap.docs[0].data().updated_at?.toDate?.()?.toLocaleString() || ''
        }]
      }

      console.log('User hospital loaded:', hospital)

      setUserHospital(hospital)
      setSelectedHospital(hospital.id.toString())
      
      // Pre-populate form if availability exists
      if (hospital.availability && hospital.availability.length > 0) {
        setBeds(hospital.availability[0].available_beds.toString())
        setOxygen(hospital.availability[0].available_oxygen.toString())
      }
    } catch (error: unknown) {
      console.error('Error loading user hospital:', error)
      setError('Failed to load your hospital data')
    }
  }, [profile?.hospital_id])

  const loadHospitals = useCallback(async () => {
    console.log('=== LOADING HOSPITALS ===')
    try {
      // Get all hospitals from Firestore
      const hospitalsQuery = query(
        collection(db, 'hospitals'),
        orderBy('name')
      )
      
      const hospitalsSnap = await getDocs(hospitalsQuery)
      console.log('Hospitals found:', hospitalsSnap.size)
      
      // Get all availability data
      const availabilitySnap = await getDocs(collection(db, 'availability'))
      console.log('Total availability records:', availabilitySnap.size)
      
      const availabilityMap = new Map()
      
      availabilitySnap.docs.forEach(doc => {
        const data = doc.data()
        let hospitalId = data.hospital_id
        
        console.log('Availability record:', {
          docId: doc.id,
          hospitalId: hospitalId,
          hospitalIdType: typeof hospitalId,
          beds: data.available_beds,
          oxygen: data.available_oxygen,
          updated: data.updated_at?.toDate?.()?.toLocaleString()
        })
        
        // Keep hospital ID as-is, don't convert to number
        // Skip only if undefined or null
        if (hospitalId === null || hospitalId === undefined) {
          console.warn('Skipping invalid hospital ID:', hospitalId)
          return
        }
        
        // Convert to string for consistent comparison
        const hospitalIdKey = String(hospitalId)
        
        // Keep only the most recent record for each hospital
        if (!availabilityMap.has(hospitalIdKey) || 
            data.updated_at > availabilityMap.get(hospitalIdKey).updated_at) {
          availabilityMap.set(hospitalIdKey, data)
        }
      })
      
      console.log('Availability map size:', availabilityMap.size)
      console.log('Availability map entries:', Array.from(availabilityMap.entries()))
      
      // Combine hospitals with availability
      const hospitals: Hospital[] = hospitalsSnap.docs.map(doc => {
        const data = doc.data()
        let hospitalId = data.id || doc.id
        
        // Keep hospital ID as string or number, don't force conversion
        const hospitalIdKey = String(hospitalId)
        
        const availData = availabilityMap.get(hospitalIdKey)
        
        const hospital = {
          id: hospitalId,  // Keep original type
          name: data.name,
          address: data.address,
          phone_number: data.phone,
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          pincode: data.pincode || '',
          availability: availData ? [{
            available_beds: availData.available_beds || 0,
            available_oxygen: availData.available_oxygen || 0,
            last_updated: availData.updated_at?.toDate?.()?.toLocaleString() || ''
          }] : []
        }
        
        console.log('Hospital processed:', {
          id: hospital.id,
          idType: typeof hospital.id,
          name: hospital.name,
          beds: hospital.availability[0]?.available_beds || 0,
          oxygen: hospital.availability[0]?.available_oxygen || 0,
          hasAvailability: !!availData
        })
        
        return hospital
      })

      console.log('Total hospitals loaded:', hospitals.length)
      console.log('Total beds across all hospitals:', hospitals.reduce((sum, h) => sum + (h.availability?.[0]?.available_beds || 0), 0))
      console.log('Total oxygen across all hospitals:', hospitals.reduce((sum, h) => sum + (h.availability?.[0]?.available_oxygen || 0), 0))

      setHospitals(hospitals)
      setFilteredHospitals(hospitals) // Initialize with all hospitals
    } catch (error: unknown) {
      console.error('Error loading hospitals:', error)
      setError('Failed to load hospital data')
    } finally {
      setLoading(false)
    }
  }, [])

  // UPDATE AVAILABILITY FUNCTION
  const updateAvailability = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedHospital || !beds || !oxygen) {
      setError('Please fill all fields')
      return
    }

    setUpdateLoading(true)
    setError('')

    try {
      // Keep hospital ID as-is (don't force number conversion)
      const hospitalId = selectedHospital
      
      console.log('=== UPDATING AVAILABILITY ===')
      console.log('Hospital ID:', hospitalId, 'Type:', typeof hospitalId)
      console.log('Beds:', beds)
      console.log('Oxygen:', oxygen)
      
      // Verify the hospital exists
      const hospitalRef = doc(db, 'hospitals', profile?.hospital_id || selectedHospital)
      const hospitalSnap = await getDoc(hospitalRef)
      
      if (hospitalSnap.exists()) {
        console.log('Hospital exists:', hospitalSnap.data().name)
      } else {
        console.warn('Hospital document not found!')
      }
      
      // Create or update availability document
      const availabilityDocId = `${hospitalId}_${Date.now()}`
      const availabilityRef = doc(db, 'availability', availabilityDocId)
      
      const availabilityData = {
        hospital_id: hospitalId,  // Use original ID (string or number)
        available_beds: parseInt(beds),
        available_oxygen: parseInt(oxygen),
        updated_at: Timestamp.now()
      }
      
      console.log('Creating availability document:', availabilityDocId)
      console.log('Availability data:', availabilityData)
      
      await setDoc(availabilityRef, availabilityData)
      
      console.log('✅ Availability document created successfully!')
      
      // Verify the document was created
      const verifySnap = await getDoc(availabilityRef)
      if (verifySnap.exists()) {
        console.log('✅ Verified: Document exists in Firestore')
        console.log('Document data:', verifySnap.data())
      } else {
        console.error('❌ Document creation failed!')
      }
      
      // Force reload data with a small delay to ensure Firestore has synced
      console.log('Waiting for Firestore sync...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Reloading hospitals data...')
      setLoading(true)
      await loadHospitals()
      
      if (profile?.role === 'hospital_admin') {
        console.log('Reloading user hospital...')
        await loadUserHospital()
      }
      
      setLoading(false)
      console.log('=== UPDATE COMPLETE ===')

      alert('✅ Availability updated successfully! Check the dashboard for updated numbers.')
    } catch (error: unknown) {
      console.error('❌ Error updating availability:', error)
      setError('Failed to update availability. Please try again.')
      alert('❌ Failed to update availability: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUpdateLoading(false)
    }
  }

  // Force refresh function
  const forceRefresh = async () => {
    setLoading(true)
    setError('')
    
    try {
      await loadHospitals()
      if (profile?.role === 'hospital_admin' && profile?.hospital_id) {
        await loadUserHospital()
      }
    } catch (error) {
      console.error('Force refresh failed:', error)
      setError('Failed to refresh data')
    }
  }

  // useEffect hooks after function definitions
  useEffect(() => {
    loadHospitals()
  }, [loadHospitals])

  useEffect(() => {
    if (profile?.role === 'hospital_admin' && profile?.hospital_id) {
      loadUserHospital()
    }
  }, [profile?.role, profile?.hospital_id, loadUserHospital])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Helper function to get status color
  const getStatusColor = (available: number): string => {
    if (available === 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    if (available < 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }

  // Helper function to get status text
  const getStatusText = (available: number): string => {
    if (available === 0) return 'Full'
    if (available < 5) return 'Limited'
    return 'Available'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
              <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg">
                Dashboard
              </Link>
              <Link href="/admission" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Admission AI
              </Link>
              <Link href="/about" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">About</Link>
              <Link href="/contact" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">Contact</Link>
              
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>
              
              <ThemeToggle />
              
              <div className="flex items-center space-x-2 ml-2">
                <div className="text-right mr-2 hidden lg:block">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{profile?.name || 'User'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{profile?.role === 'hospital_admin' ? 'Admin' : profile?.role || 'Patient'}</div>
                </div>
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
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                >
                  Sign Out
                </button>
              </div>
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/dashboard"
                className="block text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 py-2.5 px-3 rounded-lg"
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {profile?.name || 'User'}
                  </span>
                </Link>
                <button 
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full text-sm font-medium text-rose-600 dark:text-rose-400 py-2.5 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Message */}
          {profile && (
            <div className="mb-8 bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {profile.name}! 👋</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {profile.role === 'hospital_admin' 
                ? 'Monitor and manage your hospital\'s real-time bed and oxygen availability.'
                : 'Access real-time hospital bed availability across our network.'
              }
            </p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Total Hospitals */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{filteredHospitals.length}</div>
            </div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
              {selectedPinCode ? `Hospitals in ${selectedPinCode}` : 'Partner Hospitals'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedPinCode ? `Healthcare facilities in ${selectedCity}` : 'Healthcare facilities in network'}
            </p>
          </div>

          {/* Available Beds */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center">
                <Bed className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {filteredHospitals.reduce((total, hospital) => {
                  const avail = hospital.availability?.[0]
                  return total + (avail?.available_beds || 0)
                }, 0)}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Available Beds</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedPinCode ? `In ${selectedCity} area` : 'Total beds across network'}
            </p>
          </div>

          {/* Oxygen Cylinders */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center">
                <Droplets className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {filteredHospitals.reduce((total, hospital) => {
                  const avail = hospital.availability?.[0]
                  return total + (avail?.available_oxygen || 0)
                }, 0)}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Oxygen Cylinders</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedPinCode ? `In ${selectedCity} area` : 'Available oxygen supply units'}
            </p>
          </div>
        </div>

        {/* Hospital Admin Management */}
        {profile?.role === 'hospital_admin' && userHospital && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Manage Your Hospital</h2>
            
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 mb-6 border border-blue-100 dark:border-blue-900">
              <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                <MapPin className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                {userHospital?.name}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {userHospital?.availability?.[0]?.available_beds || 0}
                  </div>
                  <div className="text-sm font-medium flex items-center justify-center mt-2 text-gray-700 dark:text-gray-300">
                    <Bed className="h-4 w-4 mr-1" />
                    Available Beds
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {userHospital?.availability?.[0]?.available_oxygen || 0}
                  </div>
                  <div className="text-sm font-medium flex items-center justify-center mt-2 text-gray-700 dark:text-gray-300">
                    <Droplets className="h-4 w-4 mr-1" />
                    Oxygen Cylinders
                  </div>
                </div>
              </div>
            </div>

            {/* Update Form */}
            <form onSubmit={updateAvailability} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Available Beds</label>
                  <input
                    type="number"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    placeholder="Enter available beds"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Oxygen Cylinders</label>
                  <input
                    type="number"
                    value={oxygen}
                    onChange={(e) => setOxygen(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    placeholder="Enter oxygen cylinders"
                    required
                    min="0"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={updateLoading}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-all shadow-sm"
              >
                {updateLoading ? 'Updating...' : 'Update Availability'}
              </button>
            </form>
          </div>
        )}

        {/* Super Admin Management */}
        {profile?.role === 'super_admin' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Super Admin: Update Any Hospital</h2>
            
            <form onSubmit={updateAvailability} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Hospital</label>
                <select
                  value={selectedHospital}
                  onChange={(e) => {
                    setSelectedHospital(e.target.value)
                    const hospital = hospitals.find(h => h.id.toString() === e.target.value)
                    if (hospital?.availability?.[0]) {
                      setBeds(hospital.availability[0].available_beds.toString())
                      setOxygen(hospital.availability[0].available_oxygen.toString())
                    } else {
                      setBeds('')
                      setOxygen('')
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  required
                >
                  <option value="">Choose a hospital</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Available Beds</label>
                  <input
                    type="number"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    placeholder="Enter available beds"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Oxygen Cylinders</label>
                  <input
                    type="number"
                    value={oxygen}
                    onChange={(e) => setOxygen(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    placeholder="Enter oxygen cylinders"
                    required
                    min="0"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={updateLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              >
                {updateLoading ? 'Updating...' : 'Update Hospital Availability'}
              </button>
            </form>
          </div>
        )}

        {/* Disease Prediction & Doctor Insights Component */}
        <DashboardDoctorInsights onPinCodeAnalyzed={handlePinCodeAnalyzed} />

        {/* Hospital Cards */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedPinCode ? `Hospitals in ${selectedCity} (${selectedPinCode})` : 'All Hospitals'}
            </h2>
            <div className="flex items-center space-x-3">
              {selectedPinCode && (
                <button
                  onClick={() => {
                    setSelectedPinCode('')
                    setSelectedCity('')
                    setFilteredHospitals(hospitals)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <span>Clear Filter</span>
                </button>
              )}
              <button
                onClick={forceRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-all shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {filteredHospitals.length === 0 && selectedPinCode ? (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center">
              <div className="text-amber-600 dark:text-amber-400 text-lg font-semibold mb-2">
                No hospitals found in PIN code {selectedPinCode}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try a different PIN code or view all hospitals
              </p>
              <button
                onClick={() => {
                  setSelectedPinCode('')
                  setSelectedCity('')
                  setFilteredHospitals(hospitals)
                }}
                className="px-6 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
              >
                View All Hospitals
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.map((hospital, index) => {
                const avail = hospital.availability?.[0]
                const beds = avail?.available_beds || 0
                const oxygen = avail?.available_oxygen || 0
                
                // Generate a truly unique key using index, ID, and sanitized name
                const sanitizedName = hospital.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
                const hospitalKey = `hospital-${String(hospital.id)}-${index}-${sanitizedName}`

                return (
                <div key={hospitalKey} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{hospital.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(beds)}`}>
                      {getStatusText(beds)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
                      <span>{hospital.address}</span>
                    </div>
                    {hospital.phone_number && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{hospital.phone_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{beds}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center mt-1">
                        <Bed className="h-3 w-3 mr-1" />
                        Beds
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{oxygen}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center mt-1">
                        <Droplets className="h-3 w-3 mr-1" />
                        Oxygen
                      </div>
                    </div>
                  </div>

                  {avail?.last_updated && (
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Updated: {avail.last_updated}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
