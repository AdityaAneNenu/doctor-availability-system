'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuthFixed';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, User, TrendingUp, Calendar, Activity, Brain, BarChart3, Database, Inbox } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { getAdmissionModel, type TrainingDataPoint, type AdmissionPrediction } from '@/lib/admissionMLModel';
import EmptyState from '@/components/EmptyState';
import { SkeletonTable, SkeletonStat } from '@/components/Skeleton';
import PageTransition from '@/components/PageTransition';

export default function AdmissionPredictionPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // States
  const [activeTab, setActiveTab] = useState<'collect' | 'train' | 'predict' | 'history'>('collect');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data collection states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalAdmissions, setTotalAdmissions] = useState('');
  const [emergencyAdmissions, setEmergencyAdmissions] = useState('');
  const [opdAdmissions, setOpdAdmissions] = useState('');
  const [scheduledAdmissions, setScheduledAdmissions] = useState('');
  const [isHoliday, setIsHoliday] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Stats
  const [stats, setStats] = useState<{
    total_days: number;
    avg_admissions: number;
    max_admissions: number;
    min_admissions: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Training states
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<{
    loss?: number;
    mae?: number;
    val_mae?: number;
  } | null>(null);
  const [modelTrained, setModelTrained] = useState(false);
  const [autoTrainEnabled, setAutoTrainEnabled] = useState(true);
  const [lastTrainedDate, setLastTrainedDate] = useState<string | null>(null);
  
  // Prediction states
  const [predictions, setPredictions] = useState<AdmissionPrediction[]>([]);
  const [predicting, setPredicting] = useState(false);
  const [daysAhead, setDaysAhead] = useState(7);

  // Historical data states
  const [historicalData, setHistoricalData] = useState<Array<{
    date: string;
    total_admissions: number;
    emergency_admissions: number;
    opd_admissions: number;
    scheduled_admissions: number;
    is_holiday?: boolean;
    notes?: string;
  }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Load stats on mount
  useEffect(() => {
    loadStats();
    checkModelStatus();
    loadAutoTrainSettings();
    loadHistoricalData();
  }, []);

  // Auto-train check - runs when stats change
  useEffect(() => {
    if (autoTrainEnabled && stats && stats.total_days >= 30 && !isTraining) {
      checkAndAutoTrain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, autoTrainEnabled]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if model is trained
  const checkModelStatus = async () => {
    const model = getAdmissionModel();
    const loaded = await model.loadModel();
    setModelTrained(loaded || model.isTrained());
  };

  // Load auto-train settings from localStorage
  const loadAutoTrainSettings = () => {
    try {
      const savedSettings = localStorage.getItem('admissionAutoTrainSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setAutoTrainEnabled(settings.enabled !== false); // Default to true
        setLastTrainedDate(settings.lastTrainedDate || null);
      }
    } catch (error) {
      console.error('Error loading auto-train settings:', error);
    }
  };

  // Save auto-train settings
  const saveAutoTrainSettings = (enabled: boolean, lastDate?: string) => {
    try {
      const settings = {
        enabled,
        lastTrainedDate: lastDate || lastTrainedDate,
      };
      localStorage.setItem('admissionAutoTrainSettings', JSON.stringify(settings));
      setAutoTrainEnabled(enabled);
      if (lastDate) setLastTrainedDate(lastDate);
    } catch (error) {
      console.error('Error saving auto-train settings:', error);
    }
  };

  // Check if auto-training should run
  const checkAndAutoTrain = async () => {
    if (!autoTrainEnabled || isTraining) return;

    const shouldTrain = await shouldAutoTrain();
    if (shouldTrain) {
      console.log('Auto-training triggered...');
      await handleTrainModel(true); // Pass true to indicate auto-training
    }
  };

  // Determine if auto-training should occur
  const shouldAutoTrain = async (): Promise<boolean> => {
    // Check if we have enough data
    if (!stats || stats.total_days < 30) {
      return false;
    }

    // If never trained before, train now
    if (!modelTrained && !lastTrainedDate) {
      return true;
    }

    // If last trained date exists, check if it's been 7 days
    if (lastTrainedDate) {
      const lastTrained = new Date(lastTrainedDate);
      const daysSinceLastTrain = Math.floor((Date.now() - lastTrained.getTime()) / (1000 * 60 * 60 * 24));
      
      // Retrain every 7 days or when we have 10+ new data points
      if (daysSinceLastTrain >= 7) {
        return true;
      }
    }

    return false;
  };

  // Load statistics
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch('/api/admissionData?action=stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load historical data
  const loadHistoricalData = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch('/api/admissionData?days=90');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Sort by date descending (most recent first)
        const sortedData = result.data.sort((a: { date: string }, b: { date: string }) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setHistoricalData(sortedData);
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Save admission data
  const handleSaveData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!totalAdmissions || Number(totalAdmissions) < 0) {
      alert('Please enter valid total admissions');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admissionData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          total_admissions: Number(totalAdmissions),
          emergency_admissions: Number(emergencyAdmissions || 0),
          opd_admissions: Number(opdAdmissions || 0),
          scheduled_admissions: Number(scheduledAdmissions || 0),
          is_holiday: isHoliday,
          notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Admission data saved successfully!');
        
        // Reset form
        setDate(new Date().toISOString().split('T')[0]);
        setTotalAdmissions('');
        setEmergencyAdmissions('');
        setOpdAdmissions('');
        setScheduledAdmissions('');
        setIsHoliday(false);
        setNotes('');
        
        // Reload stats
        loadStats();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('❌ Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  // Train model - now accepts isAutoTrain parameter
  const handleTrainModel = async (isAutoTrain: boolean = false) => {
    if (stats && stats.total_days < 30) {
      if (!isAutoTrain) {
        alert(`❌ Need at least 30 days of data to train. You have ${stats.total_days} days.\n\nKeep collecting data for ${30 - stats.total_days} more days.`);
      }
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingLogs(null);

    try {
      // Fetch training data
      const response = await fetch('/api/trainAdmissionModel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epochs: 100 }),
      });

      const result = await response.json();

      if (!result.success) {
        alert('❌ Error: ' + result.error);
        setIsTraining(false);
        return;
      }

      const trainingData: TrainingDataPoint[] = result.training_data;

      // Train model in browser
      const model = getAdmissionModel();
      
      const trainingResult = await model.train(trainingData, {
        epochs: 100,
        batchSize: 16,
        validationSplit: 0.2,
        onProgress: (progress, logs) => {
          setTrainingProgress(progress);
          if (logs) {
            setTrainingLogs(logs);
          }
        },
      });

      if (trainingResult.success) {
        // Save model
        await model.saveModel();
        setModelTrained(true);
        
        // Update last trained date
        const now = new Date().toISOString();
        saveAutoTrainSettings(autoTrainEnabled, now);
        
        if (!isAutoTrain) {
          alert(`✅ Model trained successfully!\n\nTraining Time: ${trainingResult.metrics?.training_time.toFixed(2)}s\nMAE: ${trainingResult.metrics?.mae.toFixed(2)}\nValidation MAE: ${trainingResult.metrics?.val_mae?.toFixed(2)}`);
        } else {
          console.log('✅ Auto-training completed successfully', trainingResult.metrics);
        }
      } else {
        if (!isAutoTrain) {
          alert('❌ Training failed: ' + trainingResult.error);
        }
        console.error('Training failed:', trainingResult.error);
      }

    } catch (error) {
      console.error('Error training model:', error);
      alert('❌ Training failed: ' + (error as Error).message);
    } finally {
      setIsTraining(false);
    }
  };

  // Generate predictions
  const handlePredict = async () => {
    if (!modelTrained) {
      alert('❌ Please train the model first');
      return;
    }

    setPredicting(true);
    setPredictions([]);

    try {
      // Get features for prediction
      const response = await fetch('/api/predictAdmissions');
      const result = await response.json();

      if (!result.success) {
        alert('❌ Error: ' + result.error);
        setPredicting(false);
        return;
      }

      const features = result.features;
      
      // Generate predictions using ML model
      const model = getAdmissionModel();
      const predictionResults = await model.predictMultipleDays(features, daysAhead);
      
      setPredictions(predictionResults);

    } catch (error) {
      console.error('Error predicting:', error);
      alert('❌ Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header - Matching Dashboard */}
        <header 
          className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 z-50"
          role="banner"
        >
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
              <Link href="/admission" className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg">
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/admission"
                className="block text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 py-2.5 px-3 rounded-lg"
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
                    handleLogout();
                    setIsMobileMenuOpen(false);
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
          <div className="mb-8 bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm animate-fadeInDown">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Admission Prediction</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Use Machine Learning to predict future patient admissions and optimize hospital resource planning.
            </p>
          </div>

          {/* Statistics Card */}
          {loadingStats ? (
            <SkeletonStat />
          ) : stats ? (
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white shadow-xl animate-fadeInUp">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="h-7 w-7" />
                Data Collection Status
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/15 rounded-xl p-5 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
                  <div className="text-4xl font-bold mb-1">{stats.total_days}</div>
                  <div className="text-sm opacity-90 font-medium">Days Collected</div>
                  <div className="mt-2 h-1 bg-white/30 rounded-full">
                    <div className="h-full bg-white rounded-full" style={{width: `${Math.min((stats.total_days / 30) * 100, 100)}%`}}></div>
                  </div>
                </div>
                <div className="bg-white/15 rounded-xl p-5 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
                  <div className="text-4xl font-bold mb-1">{stats.avg_admissions}</div>
                  <div className="text-sm opacity-90 font-medium">Avg per Day</div>
                  <div className="text-xs opacity-75 mt-1">Daily Average</div>
                </div>
                <div className="bg-white/15 rounded-xl p-5 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
                  <div className="text-4xl font-bold mb-1">{stats.max_admissions}</div>
                  <div className="text-sm opacity-90 font-medium">Peak Day</div>
                  <div className="text-xs opacity-75 mt-1">Highest Record</div>
                </div>
                <div className="bg-white/15 rounded-xl p-5 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
                  <div className="text-4xl font-bold mb-1">
                    {stats.total_days >= 30 ? '✅' : `${30 - stats.total_days}`}
                  </div>
                  <div className="text-sm opacity-90 font-medium">
                    {stats.total_days >= 30 ? 'Ready!' : 'Days Left'}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {stats.total_days >= 30 ? 'Can Train Model' : 'Until Training'}
                  </div>
                </div>
              </div>
              
              {stats.total_days < 30 ? (
                <div className="mt-6 bg-white/20 rounded-xl p-5 backdrop-blur-sm border border-white/30 animate-pulse">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="font-semibold text-base mb-1">Keep collecting data!</p>
                      <p className="text-sm opacity-90">
                        You need <strong className="text-yellow-200">{30 - stats.total_days} more days</strong> of admission data before you can train the ML model. Keep entering daily records!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 bg-emerald-500/30 rounded-xl p-5 backdrop-blur-sm border border-emerald-400/50">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <p className="font-semibold text-base mb-1">Excellent! Ready to train!</p>
                      <p className="text-sm opacity-90">
                        You have collected enough data. Head to the <strong>&quot;Train Model&quot;</strong> tab to start training your ML model.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Tabs */}
          <div className="mb-6" role="tablist" aria-label="Admission AI sections">
            <div className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex gap-2 -mb-px">
                <button
                  onClick={() => setActiveTab('collect')}
                  role="tab"
                  aria-selected={activeTab === 'collect'}
                  aria-controls="collect-panel"
                  className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 rounded-t-lg ${
                    activeTab === 'collect'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 transform scale-105'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Collect Data</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('train')}
                  role="tab"
                  aria-selected={activeTab === 'train'}
                  aria-controls="train-panel"
                  className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 rounded-t-lg ${
                    activeTab === 'train'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 transform scale-105'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>Train Model</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('predict')}
                  role="tab"
                  aria-selected={activeTab === 'predict'}
                  aria-controls="predict-panel"
                  className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 rounded-t-lg ${
                    activeTab === 'predict'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 transform scale-105'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Predict</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  role="tab"
                  aria-selected={activeTab === 'history'}
                  aria-controls="history-panel"
                  className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 rounded-t-lg ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 transform scale-105'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>View Data</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'collect' && (
            <div 
              id="collect-panel"
              role="tabpanel"
              aria-labelledby="collect-tab"
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm animate-fadeInUp"
            >
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Enter Daily Admission Data</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter the number of patients admitted each day. This data will be used to train the ML prediction model.
              </p>

              <form onSubmit={handleSaveData} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <label htmlFor="admission-date" className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-300">
                      📅 Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="admission-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-medium"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      Admission Counts
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <label htmlFor="total-admissions" className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-300">
                          📊 Total Admissions <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="total-admissions"
                          type="number"
                          value={totalAdmissions}
                          onChange={(e) => setTotalAdmissions(e.target.value)}
                          min="0"
                          placeholder="e.g., 145"
                          className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all text-lg font-bold"
                          required
                          aria-required="true"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <label htmlFor="emergency-admissions" className="block text-sm font-semibold mb-2 text-red-900 dark:text-red-300">
                          🚨 Emergency Admissions
                        </label>
                        <input
                          id="emergency-admissions"
                          type="number"
                          value={emergencyAdmissions}
                          onChange={(e) => setEmergencyAdmissions(e.target.value)}
                          min="0"
                          placeholder="e.g., 45"
                          className="w-full px-4 py-3 border-2 border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-all font-semibold"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <label htmlFor="opd-admissions" className="block text-sm font-semibold mb-2 text-green-900 dark:text-green-300">
                          🏥 OPD Admissions
                        </label>
                        <input
                          id="opd-admissions"
                          type="number"
                          value={opdAdmissions}
                          onChange={(e) => setOpdAdmissions(e.target.value)}
                          min="0"
                          placeholder="e.g., 85"
                          className="w-full px-4 py-3 border-2 border-green-300 dark:border-green-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 transition-all font-semibold"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                        <label htmlFor="scheduled-admissions" className="block text-sm font-semibold mb-2 text-purple-900 dark:text-purple-300">
                          📋 Scheduled Admissions
                        </label>
                        <input
                          id="scheduled-admissions"
                          type="number"
                          value={scheduledAdmissions}
                          onChange={(e) => setScheduledAdmissions(e.target.value)}
                          min="0"
                          placeholder="e.g., 15"
                          className="w-full px-4 py-3 border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                  <input
                    type="checkbox"
                    id="holiday"
                    checked={isHoliday}
                    onChange={(e) => setIsHoliday(e.target.checked)}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="holiday" className="text-sm font-semibold text-amber-900 dark:text-amber-300 cursor-pointer flex items-center gap-2">
                    🎉 This date is a public holiday
                  </label>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                    📝 Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Festival day, unusual weather, special event, etc."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Save admission data"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                      Saving...
                    </span>
                  ) : (
                    '💾 Save Admission Data'
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'train' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Train ML Model</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Train a neural network to predict future admissions based on collected data.
              </p>

              {/* Auto-Training Toggle */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Automatic Training
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Auto-train when 30+ days collected & every 7 days
                    </p>
                    {lastTrainedDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Last trained: {new Date(lastTrainedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => saveAutoTrainSettings(!autoTrainEnabled)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      autoTrainEnabled
                        ? 'bg-green-600 dark:bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        autoTrainEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {modelTrained && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                  <p className="text-green-800 dark:text-green-300 font-semibold flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    ✅ Model is trained and ready for predictions!
                  </p>
                </div>
              )}

              {stats && stats.total_days < 30 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                  <p className="text-amber-800 dark:text-amber-300 font-semibold">
                    ⚠️ Need at least 30 days of data to train. You have {stats.total_days} days.
                  </p>
                  <p className="text-sm mt-2 text-amber-700 dark:text-amber-400">Keep collecting data for {30 - stats.total_days} more days.</p>
                </div>
              )}

              {isTraining && (
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">Training Progress</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{trainingProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>

                  {trainingLogs && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Loss:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">{trainingLogs.loss?.toFixed(4)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">MAE:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">{trainingLogs.mae?.toFixed(2)} patients</span>
                        </div>
                        {trainingLogs.val_mae && (
                          <div className="col-span-2">
                            <span className="text-gray-600 dark:text-gray-400">Validation MAE:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">{trainingLogs.val_mae?.toFixed(2)} patients</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => handleTrainModel(false)}
                disabled={isTraining || (stats !== null && stats.total_days < 30)}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm mb-6"
              >
                {isTraining ? '🔄 Training...' : 'Train ML Model (Manual)'}
              </button>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  About the Model
                </h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <div><strong>Type:</strong> Neural Network (Deep Learning)</div>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <div><strong>Architecture:</strong> 10 → 64 → 128 → 64 → 32 → 4 neurons</div>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <div><strong>Features:</strong> Day of week, month, historical patterns, trends</div>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <div><strong>Outputs:</strong> Total, Emergency, OPD, Scheduled admissions</div>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <div><strong>Training:</strong> 100 epochs with validation split</div>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <div><strong>NOT Rule-Based:</strong> Uses actual gradient descent learning!</div>
                  </div>
                </div>
              </div>
            </div>
          )}

      {activeTab === 'predict' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Generate Predictions</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Use the trained ML model to predict patient admissions for upcoming days.
          </p>

          {!modelTrained && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-red-800 dark:text-red-300 font-semibold">
                ❌ Model not trained yet. Please train the model first.
              </p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="days-ahead" className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Prediction Timeframe
            </label>
            <select
              id="days-ahead"
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
              className="w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-medium text-base cursor-pointer hover:border-blue-400 dark:hover:border-blue-600"
            >
              <option value={1}>📅 1 Day Ahead</option>
              <option value={3}>📅 3 Days Ahead</option>
              <option value={7}>📅 7 Days (1 Week)</option>
              <option value={14}>📅 14 Days (2 Weeks)</option>
              <option value={30}>📅 30 Days (1 Month)</option>
            </select>
          </div>

          <button
            onClick={handlePredict}
            disabled={!modelTrained || predicting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none mb-6"
            aria-label="Generate predictions"
          >
            {predicting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                Predicting...
              </span>
            ) : (
              '🔮 Generate Predictions'
            )}
          </button>

          {/* Predictions Display */}
          {predictions.length > 0 && (
            <div className="space-y-5">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-emerald-500" />
                📊 Prediction Results
              </h3>
              
              {predictions.map((pred, index) => (
                <div key={index} className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h4 className="text-2xl font-bold mb-1">
                        {new Date(pred.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <p className="text-xs font-semibold">Confidence: {(pred.confidence * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="text-5xl font-black mb-1">{pred.predicted_total}</div>
                      <div className="text-xs opacity-90 font-medium">Total Predicted</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-red-500/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-3xl font-bold mb-1">{pred.predicted_emergency}</div>
                      <div className="text-xs opacity-90 font-medium">🚨 Emergency</div>
                    </div>
                    <div className="bg-green-500/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-3xl font-bold mb-1">{pred.predicted_opd}</div>
                      <div className="text-xs opacity-90 font-medium">🏥 OPD</div>
                    </div>
                    <div className="bg-purple-500/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-3xl font-bold mb-1">{pred.predicted_scheduled}</div>
                      <div className="text-xs opacity-90 font-medium">📋 Scheduled</div>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="text-sm font-medium">
                      <strong>Confidence Interval:</strong> {pred.confidence_interval.min} - {pred.confidence_interval.max} patients
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div 
          id="history-panel"
          role="tabpanel"
          aria-labelledby="history-tab"
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm animate-fadeInUp"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-500" />
              Historical Admission Data
            </h2>
            <button
              onClick={loadHistoricalData}
              disabled={loadingHistory}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Refresh historical data"
            >
              {loadingHistory ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>

          {loadingHistory ? (
            <SkeletonTable />
          ) : historicalData.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No data collected yet"
              description="Start by entering daily admission data in the 'Collect Data' tab. You'll need at least 30 days of data to train the prediction model."
              action={{
                label: "Collect Data Now",
                onClick: () => setActiveTab('collect')
              }}
              secondaryAction={{
                label: "Try Loading Again",
                onClick: loadHistoricalData
              }}
            />
          ) : (
            <div className="overflow-x-auto -mx-8 px-8">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 rounded-xl">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                          Date
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          <div className="flex flex-col items-center">
                            <span>Total</span>
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Admissions</span>
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          <div className="flex flex-col items-center">
                            <span>Emergency</span>
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Count</span>
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          <div className="flex flex-col items-center">
                            <span>OPD</span>
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Count</span>
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          <div className="flex flex-col items-center">
                            <span>Scheduled</span>
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Count</span>
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          Holiday
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                      {historicalData.map((record, index) => (
                        <tr 
                          key={index} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              {record.total_admissions}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                              {record.emergency_admissions}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                              {record.opd_admissions}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                              {record.scheduled_admissions}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center">
                            {record.is_holiday ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                                🎉 Holiday
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {record.notes || <span className="text-gray-400 dark:text-gray-600">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Records: <strong className="text-gray-900 dark:text-white text-lg">{historicalData.length}</strong>
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Showing last 90 days of data</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
