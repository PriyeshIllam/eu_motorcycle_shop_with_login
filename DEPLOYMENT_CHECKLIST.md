# Vercel Deployment Checklist

Use this checklist to ensure your deployment is configured correctly.

## Pre-Deployment

- [ ] Code is working locally (`npm start` shows login form)
- [ ] All changes are committed to git
- [ ] Changes are pushed to GitHub
- [ ] You have your Supabase anon key ready

## In Vercel Dashboard

### Project Setup
- [ ] Repository connected to Vercel
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `public`
- [ ] Install Command: `npm install` (default)

### Environment Variables ⚠️ CRITICAL
- [ ] `SUPABASE_URL` = `https://mpizntvbwkktnzmnjtep.supabase.co`
- [ ] `SUPABASE_ANON_KEY` = Your actual Supabase anon key
- [ ] Both variables set for **Production** environment
- [ ] Both variables set for **Preview** environment (optional)

## Post-Deployment

- [ ] Deployment status shows "Ready" (green checkmark)
- [ ] Deployment URL opens successfully
- [ ] Login form is visible (not empty page)
- [ ] Browser console (F12) shows: `✅ Application initialized successfully`
- [ ] No console errors about missing environment variables
- [ ] CSS styles are loading correctly (gradient background)

## Testing Functionality

- [ ] Can switch between Login and Register forms
- [ ] Form inputs are working
- [ ] Validation messages appear correctly
- [ ] "Remember me" checkbox works
- [ ] No 404 errors in Network tab (F12)

## If Something Goes Wrong

1. ❌ Empty page → Check environment variables in Vercel Settings
2. ❌ Build failed → Check build logs in Vercel
3. ❌ 404 errors → Verify Output Directory is set to `public`
4. ❌ Console errors → Check browser console for specific error messages

## Quick Fix: Redeploy

If you updated environment variables:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for new deployment to complete

---

**Need detailed instructions?** See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
