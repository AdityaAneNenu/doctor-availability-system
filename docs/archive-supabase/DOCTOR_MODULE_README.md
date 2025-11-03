# 🩺 Doctor Availability & Seasonal Disease Prediction Module

## 📋 Overview

This module enhances Smart Med Tracker with real-time weather monitoring and AI-powered disease prediction capabilities. It uses **free Open-Meteo API** for weather data and implements intelligent rule-based disease risk assessment to predict doctor requirements by specialty.

---

## ✨ Features

### 🌤️ **Weather Monitoring**
- Real-time weather data from Open-Meteo API (100% free, no API key required)
- Tracks temperature, humidity, and rainfall for multiple cities
- Automatic data refresh every 6 hours
- 30-day historical data retention

### 🦠 **Disease Prediction**
- Rule-based prediction system for 6 seasonal diseases:
  - **Dengue Fever** - Mosquito-borne tropical disease
  - **Influenza (Flu)** - Cold weather respiratory infection
  - **Heat Stroke** - High temperature related emergency
  - **Respiratory Infections** - Cold/damp weather conditions
  - **Allergic Rhinitis** - Seasonal allergy reactions
  - **Dehydration & Heat Exhaustion** - Extreme heat conditions

### 👨‍⚕️ **Doctor Requirements**
- Calculates required doctors by specialty based on disease risk
- Groups requirements by medical specialty
- Provides risk-level categorization (Low, Medium, High, Critical)
- Real-time updates via Supabase subscriptions

### 📊 **Dashboard Integration**
- Beautiful glassmorphism UI matching existing design
- Real-time data visualization
- Risk level progress bars
- Weather condition cards
- Specialty breakdown
- Health advisories

---

## 🗂️ Project Structure

```
d:\Hospital Bed\
├── supabase/migrations/
│   └── doctor_module.sql              # Database schema for weather & predictions
├── lib/
│   ├── types/
│   │   └── doctor-module.ts           # TypeScript interfaces
│   ├── fetchWeatherData.ts            # Weather API utility
│   └── predictDisease.ts              # Disease prediction logic
├── app/api/
│   └── fetchWeatherData/
│       └── route.ts                   # API endpoint for weather updates
└── components/
    └── DashboardDoctorInsights.tsx    # Dashboard visualization component
```

---

## 🚀 Setup Instructions

### 1. **Database Migration**

Run the SQL migration in your Supabase dashboard:

```bash
# Copy and execute in Supabase SQL Editor
d:\Hospital Bed\supabase\migrations\doctor_module.sql
```

This creates:
- `weather_data` table
- `doctor_requirements` table
- Helper functions for data retrieval
- Row Level Security policies

### 2. **Environment Variables**

Ensure you have these in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For API routes
```

> **Note**: The `SUPABASE_SERVICE_ROLE_KEY` is needed for server-side data insertion.

### 3. **Install Dependencies** (if needed)

All required dependencies are already in `package.json`. If you need to reinstall:

```bash
npm install
# or
yarn install
```

### 4. **Test the API Endpoint**

Start your development server:

```bash
npm run dev
```

Test the weather fetch endpoint:

```bash
# Fetch weather for all cities
curl http://localhost:3000/api/fetchWeatherData

# Fetch weather for specific city
curl -X POST http://localhost:3000/api/fetchWeatherData \
  -H "Content-Type: application/json" \
  -d '{"city":"New York"}'
```

### 5. **View Dashboard**

Navigate to: `http://localhost:3000/dashboard`

The **Doctor Availability Insights** section will appear above the hospital list.

---

## ⏰ Automation Setup

### Option 1: Supabase Edge Functions with Cron (Recommended)

Create a Supabase Edge Function:

```typescript
// supabase/functions/fetch-weather/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const response = await fetch('https://your-domain.com/api/fetchWeatherData', {
      method: 'GET',
    })
    
    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
})
```

Then set up a cron trigger in Supabase:
```sql
SELECT cron.schedule(
  'fetch-weather-data',
  '0 */6 * * *',  -- Every 6 hours
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/fetch-weather',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

### Option 2: External Cron Service (cron-job.org)

1. Go to [cron-job.org](https://cron-job.org) (free account)
2. Create a new cron job:
   - **URL**: `https://your-domain.com/api/fetchWeatherData`
   - **Schedule**: Every 6 hours
   - **Method**: GET
3. Save and activate

### Option 3: GitHub Actions (For deployed apps)

```yaml
# .github/workflows/fetch-weather.yml
name: Fetch Weather Data

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Call Weather API
        run: |
          curl -X GET https://your-domain.com/api/fetchWeatherData
```

---

## 🎨 Disease Prediction Logic

### How It Works

Each disease has a **risk calculator function** that analyzes weather conditions:

```typescript
{
  name: 'Dengue Fever',
  risk_calculator: (weather: WeatherData): number => {
    let risk = 0
    
    // High humidity increases risk
    if (weather.humidity > 70) risk += 0.4
    
    // Rainfall creates breeding grounds
    if (weather.rainfall > 5) risk += 0.3
    
    // Optimal temperature for mosquitos
    if (weather.temperature >= 20 && weather.temperature <= 35) {
      risk += 0.3
    }
    
    return Math.min(risk, 1.0)  // Cap at 100%
  }
}
```

### Risk Categories

- **Critical** (≥80%): Immediate action required
- **High** (60-79%): Significant risk, prepare resources
- **Medium** (40-59%): Monitor situation
- **Low** (<40%): Normal conditions

---

## 🔧 Customization

### Add New Cities

Edit `lib/fetchWeatherData.ts`:

```typescript
export const CITY_COORDINATES: CityCoordinates[] = [
  // Add your city
  { name: 'Miami', latitude: 25.7617, longitude: -80.1918, country: 'USA', state: 'FL' },
  // ... existing cities
]
```

### Add New Diseases

Edit `lib/predictDisease.ts`:

```typescript
export const DISEASE_DEFINITIONS: DiseaseDefinition[] = [
  {
    name: 'Your Disease Name',
    specialty: 'Medical Specialty',
    doctors_required: 3,
    thresholds: {
      temperature_min: 20,
      humidity_max: 60,
    },
    description: 'Disease description',
    symptoms: ['Symptom 1', 'Symptom 2'],
    prevention: ['Prevention 1', 'Prevention 2'],
    risk_calculator: (weather: WeatherData): number => {
      // Your custom logic
      let risk = 0
      if (weather.temperature > 30) risk += 0.5
      return Math.min(risk, 1.0)
    }
  },
  // ... existing diseases
]
```

### Modify Update Frequency

Change the cron schedule in your automation setup:
- Every 3 hours: `0 */3 * * *`
- Every 12 hours: `0 */12 * * *`
- Daily at 8 AM: `0 8 * * *`

---

## 📊 API Endpoints

### GET `/api/fetchWeatherData`

Fetches weather for all configured cities and generates predictions.

**Response:**
```json
{
  "success": true,
  "data": {
    "weather_count": 10,
    "prediction_count": 25,
    "cities": ["New York", "Los Angeles", ...]
  },
  "message": "Successfully processed weather data..."
}
```

### POST `/api/fetchWeatherData`

Fetches weather for a specific city.

**Request:**
```json
{
  "city": "New York"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "weather": {
      "city": "New York",
      "temperature": 22.5,
      "humidity": 65,
      "rainfall": 2.3
    },
    "predictions": [
      {
        "disease": "Influenza",
        "risk_level": 0.7,
        "required_doctors": 3,
        "specialty": "General Medicine"
      }
    ]
  }
}
```

---

## 🐛 Troubleshooting

### Weather Data Not Appearing

1. Check Supabase migration ran successfully
2. Verify environment variables are set
3. Test API endpoint manually: `curl http://localhost:3000/api/fetchWeatherData`
4. Check browser console for errors
5. Verify Row Level Security policies allow reading data

### Real-time Updates Not Working

1. Ensure Supabase Realtime is enabled for tables
2. Check browser network tab for websocket connections
3. Verify RLS policies allow authenticated users to read

### API Errors

1. Check Supabase service role key is correct
2. Verify Open-Meteo API is accessible (no firewall blocking)
3. Check console logs for detailed error messages
4. Ensure database tables exist

---

## 🎯 Performance Considerations

- **Weather data** is cached in database (not fetched on every page load)
- **Predictions** are pre-calculated and stored
- **Real-time subscriptions** only update when data changes
- **Old data cleanup** runs automatically (keeps last 30 days)
- **API calls** are rate-limited by design (6-hour intervals)

---

## 📈 Future Enhancements

- [ ] Add more cities (international support)
- [ ] Integrate with hospital emergency preparedness systems
- [ ] Add email/SMS alerts for high-risk predictions
- [ ] Machine learning model for more accurate predictions
- [ ] Historical trend analysis and charts
- [ ] Export reports in PDF format
- [ ] Integration with local health departments
- [ ] Mobile push notifications

---

## 📝 License

This module is part of Smart Med Tracker and follows the same license as the main project.

---

## 🙏 Credits

- **Weather Data**: [Open-Meteo API](https://open-meteo.com/) - Free weather forecast API
- **Database**: [Supabase](https://supabase.com/) - Open source Firebase alternative
- **Framework**: [Next.js 14](https://nextjs.org/) - React framework
- **UI Components**: [Lucide React](https://lucide.dev/) - Icon library

---

## 📞 Support

For issues or questions, please open an issue in the GitHub repository or contact the development team.

**Happy Healthcare Management! 🏥**
