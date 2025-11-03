# 🚀 Doctor Module - Quick Reference Card

## 📁 Files Created

```
✅ supabase/migrations/doctor_module.sql      - Database schema
✅ lib/types/doctor-module.ts                 - TypeScript interfaces  
✅ lib/fetchWeatherData.ts                    - Weather API utility
✅ lib/predictDisease.ts                      - Disease prediction logic
✅ app/api/fetchWeatherData/route.ts          - API endpoint
✅ components/DashboardDoctorInsights.tsx     - UI component
✅ app/dashboard/page.tsx                     - Updated (integrated component)
✅ DOCTOR_MODULE_README.md                    - Full documentation
✅ scripts/test-doctor-module.ts              - Test script
```

## ⚡ Quick Setup (5 minutes)

### 1. Database Setup
```bash
# Open Supabase SQL Editor and run:
supabase/migrations/doctor_module.sql
```

### 2. Environment Check
```bash
# Ensure .env.local has:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Test Manually
```bash
# Start server
npm run dev

# Test API (new terminal)
curl http://localhost:3000/api/fetchWeatherData

# View dashboard
# Open: http://localhost:3000/dashboard
```

### 4. Setup Automation
Choose one:
- **Supabase Cron** (recommended) - See README
- **cron-job.org** (easiest) - Create job pointing to `/api/fetchWeatherData`
- **GitHub Actions** - Use provided workflow

## 🎯 Key Features

### Diseases Tracked (6 total)
1. 🦟 **Dengue Fever** - Tropical/humid conditions
2. 🤧 **Influenza** - Cold weather
3. ☀️ **Heat Stroke** - Extreme heat
4. 🫁 **Respiratory Infections** - Cold/damp
5. 🤧 **Allergic Rhinitis** - Spring/fall
6. 💧 **Dehydration** - Hot/dry conditions

### Weather Metrics
- 🌡️ Temperature (°C)
- 💧 Humidity (%)
- 🌧️ Rainfall (mm)

### Doctor Specialties
- Infectious Disease
- General Medicine
- Emergency Medicine
- Pulmonology
- Allergy & Immunology

## 🔧 Common Commands

```bash
# Fetch weather for all cities
curl http://localhost:3000/api/fetchWeatherData

# Fetch for specific city
curl -X POST http://localhost:3000/api/fetchWeatherData \
  -H "Content-Type: application/json" \
  -d '{"city":"New York"}'

# Check Supabase tables
# Go to: Supabase Dashboard > Table Editor
# View: weather_data, doctor_requirements

# Test predictions locally
npx ts-node scripts/test-doctor-module.ts
```

## 🎨 UI Components Location

Dashboard: **Top section before Hospital List**
- Weather cards (temp, humidity, rainfall)
- Summary stats (total doctors, risk counts)
- Disease predictions with progress bars
- Specialty breakdown

## 📊 Database Tables

### `weather_data`
```sql
id, city, temperature, humidity, rainfall, recorded_at
```

### `doctor_requirements`
```sql
id, city, predicted_disease, risk_level, required_doctors, 
specialty, generated_at
```

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| No data showing | Run API endpoint manually |
| API errors | Check SUPABASE_SERVICE_ROLE_KEY |
| Component not visible | Clear browser cache, reload |
| Real-time not working | Enable Realtime in Supabase |
| Migration errors | Check table doesn't already exist |

## 🔗 Important URLs

- **Open-Meteo API**: https://open-meteo.com/
- **Supabase Dashboard**: https://app.supabase.com/
- **Cron-job.org**: https://cron-job.org/
- **Local Dashboard**: http://localhost:3000/dashboard

## 📝 Customization Quick Guide

### Add City
```typescript
// lib/fetchWeatherData.ts
{ name: 'City', latitude: XX.XX, longitude: -XX.XX }
```

### Add Disease
```typescript
// lib/predictDisease.ts
{
  name: 'Disease',
  specialty: 'Specialty',
  doctors_required: N,
  risk_calculator: (weather) => { /* logic */ }
}
```

### Change Update Frequency
```bash
# Cron format: minute hour day month weekday
0 */6 * * *   # Every 6 hours
0 */3 * * *   # Every 3 hours  
0 8 * * *     # Daily at 8 AM
```

## 🎉 Success Checklist

- [ ] Database tables created
- [ ] API endpoint responds (200 OK)
- [ ] Dashboard shows Doctor Insights section
- [ ] Weather data displays correctly
- [ ] Disease predictions appear
- [ ] Risk levels calculated
- [ ] Real-time updates work
- [ ] Automation scheduled

## 📞 Need Help?

1. Check **DOCTOR_MODULE_README.md** for detailed docs
2. Review error messages in browser console
3. Check Supabase logs
4. Verify all environment variables
5. Test API endpoint directly

---

**Built with ❤️ using Next.js 14, Supabase & Open-Meteo API**
