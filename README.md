# Smart Med Tracker

A modern, real-time hospital bed and oxygen cylinder availability tracking system built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Firebase**.

## 🏥 Features

### Core Features
- **Real-time Availability Tracking**: View current bed and oxygen cylinder availability across multiple hospitals
- **Role-based Access**: Different interfaces for patients (view-only) and administrators (can update data)
- **User Profile Management**: Advanced profile editing with personal data management
  - Edit personal information (name, age, gender, phone number, address)
  - Role-specific fields (hospital name for admins)
  - Avatar upload with Firebase Storage
  - Real-time profile updates with validation
  - Secure profile data handling

### 🆕 New Features
- **📍 PIN Code Disease Analysis**: Revolutionary geographic disease risk assessment
  - Enter any Indian PIN code to analyze local disease risk
  - Weather-based disease prediction (Dengue, Malaria, Influenza, etc.)
  - Specialty-specific doctor staffing recommendations
  - Quick risk check mode for rapid assessment
  - Full analysis mode with detailed reports
  - Risk level indicators: High 🔴 / Medium 🟡 / Low 🟢 / None ⚪
  - Real-time weather data integration (temperature, humidity, rainfall)
  - Human-readable summaries and actionable recommendations
  
- **🌤️ Weather & Disease Prediction**: Intelligent health forecasting
  - Real-time weather data for 20+ major Indian cities
  - Disease outbreak predictions based on weather patterns
  - Doctor availability recommendations by specialty
  - Historical trend analysis
  - Interactive dashboard with live updates

### Design & Experience
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Mobile-First Design**: Fully responsive with working mobile navigation
- **Dark Mode Support**: Toggle between light and dark themes with system preference detection
- **Type Safety**: Full TypeScript implementation
- **Server-Side Rendering**: Fast loading with Next.js App Router
- **Authentication System**: Secure login/signup with Firebase Auth

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Firebase account (free tier available)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Set up Firebase** (see Firebase documentation):
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Set up Storage for avatars
   - Configure Firestore indexes (4 required - see console for links)

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## 📁 Project Structure

```
Smart Med Tracker/
├── app/                    # Next.js 15+ App Router
│   ├── about/              # About page
│   ├── api/                # API routes
│   │   ├── analyzePinCode/ # PIN code disease analysis API
│   │   └── fetchWeatherData/ # Weather data fetching API
│   ├── auth/               # Authentication page
│   ├── contact/            # Contact page
│   ├── dashboard/          # Dashboard with analytics
│   ├── profile/            # User profile management
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable React components
│   ├── AuthGuard.tsx       # Authentication protection
│   ├── DashboardDoctorInsights.tsx # Doctor & disease insights
│   ├── PinCodeDiseaseRisk.tsx # PIN code analysis UI
│   ├── ThemeProvider.tsx   # Dark/light theme provider
│   └── ThemeToggle.tsx     # Theme toggle component
├── lib/                    # Utility functions and configs
│   ├── firebase.ts         # Firebase configuration
│   ├── useAuthFixed.ts     # Firebase authentication hook
│   ├── useTheme.ts         # Theme management
│   ├── fetchWeatherData.ts # Weather API integration
│   ├── predictDisease.ts   # Disease prediction algorithm
│   └── pinCodeDiseaseAnalysis.ts # PIN code analysis system
├── docs/                   # Documentation
│   ├── PINCODE_DISEASE_ANALYSIS.md # Technical documentation
│   ├── PINCODE_QUICK_START.md # User guide
│   ├── PINCODE_IMPLEMENTATION_SUMMARY.md # Implementation details
│   └── CLEANUP_SUMMARY.md  # Migration notes
├── public/                 # Static assets
├── .env.local.example      # Environment variables template
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🛠 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 3
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **External APIs**: 
  - India Post PIN Code API (location lookup)
  - Open-Meteo Weather API (weather data)
- **Deployment**: Vercel (ready)

## 🎯 Current Status

**✅ Phase 1: Project Foundation & Firebase Setup**
- Modern Next.js 15 setup with TypeScript
- Firebase integration configured
- Development environment ready

**✅ Phase 2: Frontend Development**
- Clean, modern UI with Tailwind CSS
- Responsive design for all devices
- Dark mode support
- Type-safe React components

**✅ Phase 3: Backend Integration**
- Firebase authentication implemented
- Firestore database queries
- Real-time data listeners
- Role-based access control
- Firebase Storage integration

**✅ Phase 4: Advanced Features**
- PIN code disease analysis system
- Weather-based disease prediction
- Doctor staffing recommendations
- Geographic risk assessment

**✅ Phase 5: Production Ready**
- Production build successful
- Zero compilation errors
- Comprehensive documentation
- Ready for deployment

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 👥 User Roles

- **Patient**: Can view hospital availability, locations, check disease risks by PIN code, and manage personal profile
- **Hospital Admin**: Can update hospital bed and oxygen availability, manage hospital information, analyze local disease risks, and update profile
- **Super Admin**: Full system access, can manage all hospitals and resources

## 🗄 Database Structure

The system uses Firebase Firestore with the following collections:

### Collections
- **hospitals**: Hospital information and locations
  - Fields: name, address, phone, latitude, longitude, id
  
- **availability**: Real-time bed and oxygen availability
  - Fields: hospital_id, available_beds, available_oxygen, updated_at, updated_by
  
- **profiles**: User role management and personal information
  - Fields: name, age, sex, phone_number, hospital_name, address, avatar_url, role, hospital_id
  
- **weather_data**: Historical weather information
  - Fields: city, temperature, humidity, rainfall, generated_at
  
- **doctor_requirements**: Disease predictions and staffing needs
  - Fields: city, disease_name, risk_level, required_doctors, specialty, generated_at

### Firestore Indexes Required
The system requires 4 composite indexes (auto-created on first use):
1. weather_data: city + generated_at
2. doctor_requirements: city + generated_at
3. doctor_requirements: city + generated_at + risk_level
4. availability: hospital_id + updated_at

## 🎨 UI Features

- Clean, modern Next.js interface
- Advanced profile management system
- **PIN Code Disease Analysis dashboard**
  - Real-time disease risk assessment
  - Weather-based predictions
  - Visual risk indicators
  - Doctor requirement charts
- Tailwind CSS styling system
- Color-coded availability indicators
- Real-time data updates with Firebase listeners
- Mobile-responsive design with working navigation
- Dark/Light theme support with smooth transitions
- Smooth animations and transitions
- TypeScript for better development experience

## 🔒 Security

- Firebase Authentication with secure token management
- Firestore Security Rules for data protection
- Role-based access control (RBAC)
- Secure file uploads to Firebase Storage
- Environment variables for sensitive data
- Input validation on all forms
- HTTPS-only in production

## 📊 API Documentation

### PIN Code Disease Analysis API

**Endpoint:** `POST /api/analyzePinCode`

**Request:**
```json
{
  "pincode": "560001",
  "type": "quick" // or "full"
}
```

**Response (Quick Mode):**
```json
{
  "success": true,
  "data": {
    "hasRisk": true,
    "riskLevel": "high",
    "diseases": ["Dengue", "Malaria"],
    "doctorsNeeded": 8,
    "recommendation": "Immediate staffing increase recommended..."
  }
}
```

**Response (Full Mode):**
```json
{
  "success": true,
  "data": {
    "location": { "city": "Bangalore", "state": "Karnataka" },
    "weather": { "temperature": 28.5, "humidity": 75, "rainfall": 15.2 },
    "diseases": [{ "name": "Dengue", "probability": 78, "severity": "High" }],
    "doctorRequirements": [{ "specialty": "Infectious Disease", "count": 3 }],
    "totalDoctorsRequired": 8,
    "summary": "High disease risk detected..."
  }
}
```

### Weather Data API

**Endpoint:** `POST /api/fetchWeatherData`

Fetches and stores weather data for multiple cities. Automatically triggered by the system.

## 📚 Documentation

Comprehensive documentation available in `/docs`:

- **PINCODE_DISEASE_ANALYSIS.md** - Complete technical documentation
- **PINCODE_QUICK_START.md** - User-friendly getting started guide
- **PINCODE_IMPLEMENTATION_SUMMARY.md** - Implementation details and metrics
- **CLEANUP_SUMMARY.md** - Migration notes from Supabase to Firebase

## 🧪 Testing PIN Code Analysis

Try these PIN codes for testing:
- **560001** (Bangalore) - High disease risk during monsoon
- **400001** (Mumbai) - Medium risk, coastal city
- **110001** (Delhi) - Variable risk based on season
- **600001** (Chennai) - High humidity-related diseases
- **700001** (Kolkata) - Monsoon disease patterns

## 📱 Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge

## 🐛 Troubleshooting

### Common Issues

1. **Environment variables not working**: 
   - Ensure `.env.local` file exists in root directory
   - Contains all 6 Firebase configuration variables
   - Restart development server after changes

2. **Build errors**: 
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript errors with `npm run build`
   - Clear `.next` folder: `rm -rf .next`

3. **Authentication issues**: 
   - Verify Firebase project settings
   - Check Authentication is enabled in Firebase Console
   - Ensure Email/Password provider is activated

4. **Firestore index errors**:
   - Click the index creation link in the console
   - Wait 2-5 minutes for index to build
   - Indexes are auto-created on first query

5. **PIN code not found**:
   - Verify PIN code is valid (6 digits)
   - Check India Post API is accessible
   - Ensure city is in coordinate mapping

6. **Weather data unavailable**:
   - City might not be in `INDIAN_CITY_COORDINATES`
   - Add new cities to `lib/pinCodeDiseaseAnalysis.ts`
   - Check Open-Meteo API rate limits

## 🎓 Learning Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React 19 Documentation](https://react.dev/)

## 📈 Performance

- **Build Size**: ~248 KB First Load JS
- **API Routes**: Server-side rendering for optimal performance
- **Firestore**: Real-time listeners for instant updates
- **Images**: Optimized with Next.js Image component
- **Code Splitting**: Automatic with Next.js App Router

## 🌟 Features in Detail

### PIN Code Disease Analysis
Enter any Indian PIN code to get:
- ✅ Location identification (city, district, state)
- ✅ Real-time weather conditions
- ✅ Disease outbreak predictions
- ✅ Risk level assessment (High/Medium/Low)
- ✅ Specialty-specific doctor requirements
- ✅ Actionable recommendations
- ✅ Historical trend analysis (coming soon)

### Weather-Based Predictions
Supported diseases:
- Dengue (temperature + rainfall + humidity)
- Malaria (rainfall patterns)
- Influenza (temperature drops)
- Heatstroke (high temperatures)
- Respiratory infections (pollution + weather)
- And more...

### Doctor Recommendations
Calculates requirements for:
- Pulmonologist (respiratory diseases)
- General Physician (common conditions)
- Infectious Disease Specialist (vector-borne)
- Cardiologist (heart conditions)

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Environment Variables on Vercel**:
   Add all Firebase variables from `.env.local`

4. **Firestore Indexes**:
   Indexes will auto-create on first production query

### Manual Deployment

```bash
npm run build
npm start
```

The app is optimized for production with:
- Server-side rendering
- Static page generation
- Image optimization
- Code splitting
- Minification

## 🔄 Updates & Changelog

### Version 2.0 (Current)
- ✅ Complete Firebase migration from Supabase
- ✅ PIN code disease analysis system
- ✅ Weather-based disease prediction
- ✅ Doctor staffing recommendations
- ✅ Dark mode support
- ✅ Profile avatar uploads
- ✅ Real-time data updates

### Version 1.0 (Legacy)
- Basic hospital tracking
- Supabase integration
- Simple dashboard

## 🤝 Contributing

This is an educational project showcasing:
- Modern Next.js 15 development
- Firebase integration
- TypeScript best practices
- Real-world healthcare application
- API integration patterns

## 📄 License

ISC License - see package.json for details.

## 🙏 Acknowledgments

- **India Post** for free PIN code API
- **Open-Meteo** for free weather data API
- **Firebase** for excellent backend services
- **Next.js** for the powerful framework
- **Vercel** for hosting platform

## 📞 Support

For questions or issues:
1. Check documentation in `/docs` folder
2. Review troubleshooting section above
3. Check Firebase console for errors
4. Review browser console for client errors

---

**Built with ❤️ using Next.js 15, Firebase, and TypeScript**
