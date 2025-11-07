# 🚀 Vercel Deployment Checklist for Hospital Bed System

## ✅ Pre-Deployment Checklist

### 1. **Environment Variables** 
Set these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCtlcT0KcRliIv2OjLzBx8Z0w3rv6foTyU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=doctor-availability-syst-81c1c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=doctor-availability-syst-81c1c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=doctor-availability-syst-81c1c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=551721988361
NEXT_PUBLIC_FIREBASE_APP_ID=1:551721988361:web:61ff150c3942789fd323d8
```

### 2. **Build Configuration**
Verify `vercel.json` is properly configured:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install --legacy-peer-deps --ignore-scripts || true"
}
```

### 3. **Dependencies**
Ensure all packages are in `package.json` and working locally:
```bash
npm run build  # Test build locally first
```

## 🔥 Firebase Configuration (CRITICAL for Google Auth)

### Step 1: Get Your Vercel Domain
After deploying, note your Vercel domains:
- Production: `hospital-bed-system.vercel.app` (or your custom domain)
- Preview: `hospital-bed-system-git-main-username.vercel.app`

### Step 2: Firebase Console Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select Project**: `doctor-availability-syst-81c1c`
3. **Add Authorized Domains**:
   - Navigate: `Authentication > Settings > Authorized domains`
   - Click "Add domain"
   - Add: `hospital-bed-system.vercel.app`
   - Add: `hospital-bed-system-git-main-username.vercel.app`

### Step 3: Google OAuth Configuration

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select Project**: `doctor-availability-syst-81c1c`
3. **Navigate to**: `APIs & Services > Credentials`
4. **Edit OAuth 2.0 Client ID**:
   - **Authorized JavaScript origins**: Add your Vercel URLs
   - **Authorized redirect URIs**: Add:
     ```
     https://hospital-bed-system.vercel.app/__/auth/handler
     https://hospital-bed-system-git-main-username.vercel.app/__/auth/handler
     ```

## 🧪 Testing Checklist

### After Deployment:

1. **✅ Basic Loading**
   - [ ] Home page loads
   - [ ] Navigation works
   - [ ] Dark/light theme toggle works

2. **✅ Authentication**
   - [ ] Email/password login works
   - [ ] Email/password registration works
   - [ ] Google Sign-In works (main test!)
   - [ ] Profile page accessible after login
   - [ ] Sign out works

3. **✅ Core Features**
   - [ ] Dashboard loads with user data
   - [ ] Hospital data displays
   - [ ] Admission AI page works
   - [ ] Data collection forms work

4. **✅ Error Handling**
   - [ ] Clear error messages for auth failures
   - [ ] Network error handling
   - [ ] Unauthorized domain warnings

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Google Sign-In says "unauthorized domain"** | Add Vercel domain to Firebase authorized domains |
| **Google Sign-In popup blocked** | User needs to allow popups |
| **Environment variables missing** | Double-check they're set in Vercel dashboard |
| **Build fails** | Check `npm run build` works locally |
| **Firebase connection fails** | Verify all environment variables are correct |

## 🚨 Emergency Fixes

### If Google Auth completely fails:

1. **Check Firebase Config**: Ensure environment variables are set in Vercel
2. **Verify Domains**: Confirm Vercel domain is in Firebase authorized domains
3. **Check Console**: Browser console will show specific Firebase error codes
4. **Test Locally**: Confirm it works on localhost first

### Quick Debug Commands:

```bash
# Test build locally
npm run build

# Check environment variables (in browser console)
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
})
```

## 📱 Mobile Testing

After desktop testing works:
- [ ] Test on mobile browsers
- [ ] Check responsive design
- [ ] Verify touch interactions work
- [ ] Test mobile navigation menu

## 🔗 Important Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com/
- **Google Cloud Console**: https://console.cloud.google.com/
- **Firebase Auth Docs**: https://firebase.google.com/docs/auth/web/google-signin

---

## ⚡ Quick Deploy Command

```bash
# Deploy to Vercel (if using CLI)
npm run build  # Test first
vercel --prod   # Deploy to production
```

Remember: **Google Auth will not work until you add your Vercel domain to Firebase!**