# Google Auth Setup for Vercel Deployment

## 🚨 Current Issue
Google Authentication is not working in Vercel deployment because the domain is not authorized in Firebase.

## ✅ Solution Steps

### 1. Get Your Vercel Domain
After deploying to Vercel, you'll get a domain like:
- `your-app.vercel.app` (production)
- `your-app-git-main-username.vercel.app` (preview)

### 2. Firebase Console Setup

#### A. Add Authorized Domains
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `doctor-availability-syst-81c1c`
3. Navigate to: **Authentication > Settings > Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel domains:
   ```
   your-app.vercel.app
   your-app-git-main-username.vercel.app
   ```

#### B. Update Google OAuth Settings
1. Go to **Authentication > Sign-in method**
2. Click on **Google** provider
3. Verify these settings:
   - ✅ **Enable** is turned ON
   - ✅ **Web SDK configuration** is enabled
   - ✅ **Project support email** is set

### 3. Google Cloud Console (if needed)

If you still have issues, check Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `doctor-availability-syst-81c1c`
3. Navigate to: **APIs & Services > Credentials**
4. Find your **OAuth 2.0 Client ID**
5. Under **Authorized JavaScript origins**, add:
   ```
   https://your-app.vercel.app
   https://your-app-git-main-username.vercel.app
   ```
6. Under **Authorized redirect URIs**, add:
   ```
   https://your-app.vercel.app/__/auth/handler
   https://your-app-git-main-username.vercel.app/__/auth/handler
   ```

### 4. Environment Variables in Vercel

Make sure all Firebase environment variables are set in Vercel:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings > Environment Variables**
4. Add these variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCtlcT0KcRliIv2OjLzBx8Z0w3rv6foTyU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=doctor-availability-syst-81c1c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=doctor-availability-syst-81c1c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=doctor-availability-syst-81c1c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=551721988361
NEXT_PUBLIC_FIREBASE_APP_ID=1:551721988361:web:61ff150c3942789fd323d8
```

### 5. Testing Steps

1. Deploy to Vercel
2. Get your deployment URL
3. Add the domain to Firebase (step 2A)
4. Test Google sign-in on your deployed app
5. Check browser console for any remaining errors

### 6. Common Error Messages & Solutions

| Error | Solution |
|-------|----------|
| `auth/unauthorized-domain` | Add your Vercel domain to Firebase authorized domains |
| `auth/operation-not-allowed` | Enable Google provider in Firebase Authentication |
| `popup-blocked` | User needs to allow popups for your site |
| `network-request-failed` | Check internet connection and Firebase config |

### 7. Debug Information

The app now includes better error handling that will show specific error messages for Google Auth failures. Check the browser console and the error message displayed to the user.

## 📝 Quick Checklist

- [ ] Vercel domain added to Firebase authorized domains
- [ ] Google provider enabled in Firebase Authentication  
- [ ] Environment variables set in Vercel
- [ ] OAuth client configured in Google Cloud Console (if needed)
- [ ] Test Google sign-in on deployed app

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Firebase Auth Domain Setup](https://firebase.google.com/docs/auth/web/auth-domain)