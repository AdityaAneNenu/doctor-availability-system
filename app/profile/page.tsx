'use client'

import { useState, useEffect, useCallback } from 'react'
import { db, storage } from '@/lib/firebase'
import { doc, updateDoc, query, collection, where, getDocs, limit } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Link from 'next/link'
import Image from 'next/image'
import { User, Heart, ArrowLeft, Edit, X, Check, Mail, Phone, MapPin, Building2, Calendar, Users, Camera, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/useAuthFixed'
import ThemeToggle from '@/components/ThemeToggle'
import { AuthGuard } from '@/components/AuthGuard'

interface ProfileData {
  name: string
  age: number
  sex: string
  phone_number: string
  hospital_name?: string
  address?: string
  avatar_url?: string
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}

function ProfileContent() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    age: 0,
    sex: '',
    phone_number: '',
    hospital_name: '',
    address: '',
    avatar_url: ''
  })

  const [originalData, setOriginalData] = useState<ProfileData>({
    name: '',
    age: 0,
    sex: '',
    phone_number: '',
    hospital_name: '',
    address: '',
    avatar_url: ''
  })

  const fetchHospitalName = useCallback(async (userId: string) => {
    try {
      // Try to get hospital name from hospitals collection where the admin is linked
      const hospitalsQuery = query(
        collection(db, 'hospitals'),
        where('admin_id', '==', userId),
        limit(1)
      )
      
      const hospitalsSnap = await getDocs(hospitalsQuery)

      if (!hospitalsSnap.empty) {
        const hospitalData = hospitalsSnap.docs[0].data()
        setFormData(prev => ({
          ...prev,
          hospital_name: hospitalData.name
        }))
        setOriginalData(prev => ({
          ...prev,
          hospital_name: hospitalData.name
        }))
        
        // Also update the profile in the database
        const profileRef = doc(db, 'profiles', userId)
        await updateDoc(profileRef, { hospital_name: hospitalData.name })
      }
    } catch (error) {
      console.error('Error fetching hospital name:', error)
    }
  }, [])

  useEffect(() => {
    if (profile) {
      const profileData = {
        name: profile.name || '',
        age: profile.age || 0,
        sex: profile.sex || '',
        phone_number: profile.phone_number || '',
        hospital_name: profile.hospital_name || '',
        address: profile.address || '',
        avatar_url: profile.avatar_url || ''
      }
      setFormData(profileData)
      setOriginalData(profileData)
      
      // If user is hospital admin and hospital_name is empty, fetch it from hospitals table
      if (profile.role === 'hospital_admin' && !profile.hospital_name && user) {
        fetchHospitalName(user.uid)
      }
    }
  }, [profile, user, fetchHospitalName])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    setError('')

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.uid}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Firebase Storage
      const storageRef = ref(storage, filePath)
      await uploadBytes(storageRef, file)

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef)

      // Update form data
      setFormData(prev => ({
        ...prev,
        avatar_url: downloadURL
      }))

      setSuccess('Profile picture uploaded successfully!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      setError(errorMessage)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveProfilePicture = async () => {
    try {
      setUploadingImage(true)
      setError('')

      // Remove from form data
      setFormData(prev => ({
        ...prev,
        avatar_url: ''
      }))

      setSuccess('Profile picture removed successfully!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove profile picture'
      setError(errorMessage)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Prepare update data - exclude hospital_name for hospital admins
      const updateData: Record<string, unknown> = {
        name: formData.name,
        age: formData.age,
        sex: formData.sex,
        phone_number: formData.phone_number,
        address: formData.address,
        avatar_url: formData.avatar_url
      }

      // Only include hospital_name if user is not a hospital admin
      if (profile.role !== 'hospital_admin') {
        updateData.hospital_name = formData.hospital_name
      }

      // Update profile in Firestore
      const profileRef = doc(db, 'profiles', user.uid)
      await updateDoc(profileRef, updateData)

      setOriginalData(formData)
      setIsEditing(false)
      setSuccess('Profile updated successfully!')
      
      // Refresh the page to get updated profile data
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
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
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Dashboard
              </Link>
              <Link href="/admission" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Admission AI
              </Link>
              <Link href="/profile" className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg">
                Profile
              </Link>
              <Link href="/about" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                About
              </Link>
              <Link href="/contact" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Contact
              </Link>
              
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>
              
              <ThemeToggle />
              
              <div className="flex items-center space-x-2 ml-2">
                <div className="text-right mr-2 hidden lg:block">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{profile?.name || 'User'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-sm font-medium text-sm"
                >
                  Sign Out
                </button>
              </div>
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button 
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="px-4 py-3 space-y-1">
              <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Dashboard
              </Link>
              <Link href="/admission" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Admission AI
              </Link>
              <Link href="/profile" className="block px-4 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg">
                Profile
              </Link>
              <Link href="/about" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                About
              </Link>
              <Link href="/contact" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Contact
              </Link>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 mt-2">
                <div className="px-4 py-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{profile?.name || 'User'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full mt-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 mb-6">
          {/* Enhanced Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 mb-8">
            {/* Enhanced Profile Picture Section */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-gray-100 dark:border-gray-800">
                {formData.avatar_url ? (
                  <Image 
                    src={formData.avatar_url} 
                    alt="Profile" 
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Enhanced Upload/Delete Buttons */}
              {isEditing && (
                <div className="absolute -bottom-1 -right-1 flex space-x-1">
                  {/* Upload Button */}
                  <label className="cursor-pointer bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 p-3 rounded-full shadow-sm transition-all duration-200 hover:scale-105">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white dark:border-gray-900 border-t-transparent" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </label>
                  
                  {/* Delete Button - only show if there's a profile picture */}
                  {formData.avatar_url && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      disabled={uploadingImage}
                      className="bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white p-3 rounded-full shadow-sm transition-all duration-200 hover:scale-105"
                      title="Remove profile picture"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
              
              {/* Upload Instruction */}
              {isEditing && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap">
                    {formData.avatar_url ? 'Upload new or remove current photo' : 'Click to upload photo'}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {profile?.name || 'User Profile'}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <p className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                  {profile?.role === 'hospital_admin' ? '🏥 Hospital Administrator' : '👤 Patient'}
                </p>
                {profile?.hospital_name && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    📍 {profile.hospital_name}
                  </p>
                )}
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-4 sm:max-w-md">
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile?.age || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Age</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {profile?.sex || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Gender</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 sm:space-y-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-sm font-medium"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 font-medium"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || loading}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 font-medium shadow-sm"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
              <p className="text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-emerald-600 dark:text-emerald-400">{success}</p>
            </div>
          )}

          {/* Profile Information */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile?.name || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-gray-900 dark:text-white">{user?.email}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed from this page
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter your age"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-gray-900 dark:text-white">{profile?.age || 'Not specified'} years old</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-gray-900 dark:text-white capitalize">{profile?.sex || 'Not specified'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact & Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                Contact Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-gray-900 dark:text-white">{profile?.phone_number || 'Not specified'}</p>
                  </div>
                )}
              </div>

              {profile?.role === 'hospital_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hospital Name
                  </label>
                  {/* Hospital name is not editable for admins */}
                  <div className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="flex-1">{profile?.hospital_name || 'Loading hospital information...'}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Cannot be edited</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Hospital name is managed by system administrators
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter your address"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-gray-900 dark:text-white">{profile?.address || 'Not specified'}</p>
                  </div>
                )}
              </div>

              {/* Role Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type
                </label>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile?.role === 'hospital_admin' 
                      ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  }`}>
                    {profile?.role === 'hospital_admin' ? 'Hospital Administrator' : 'Patient'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
