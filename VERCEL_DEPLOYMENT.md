# Deploying to Vercel

This guide will help you deploy your EU Motorcycle Shop login application to Vercel.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Your GitHub repository connected to Vercel
- Your Supabase anon key ready

## Step-by-Step Deployment

### Step 1: Connect Repository to Vercel

If you haven't already:

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `eu_motorcycle_shop_with_login` repository
5. Click **"Import"**

### Step 2: Configure Build Settings

On the project configuration screen:

1. **Framework Preset**: Select **"Other"** (or leave as detected)
2. **Build Command**:
   ```
   npm run build
   ```
3. **Output Directory**:
   ```
   public
   ```
4. **Install Command**: Leave as default (`npm install`)

### Step 3: Add Environment Variables ⚠️ CRITICAL

This is the most important step! Without these, you'll get an empty page.

1. Scroll down to **"Environment Variables"** section
2. Add the following variables:

   **Variable 1:**
   - **Name**: `SUPABASE_URL`
   - **Value**: `https://mpizntvbwkktnzmnjtep.supabase.co`
   - **Environment**: Select all (Production, Preview, Development)

   **Variable 2:**
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: `your_actual_supabase_anon_key_here` (get from Supabase dashboard)
   - **Environment**: Select all (Production, Preview, Development)

3. Click **"Add"** for each variable

### Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 1-2 minutes)
3. Once deployed, click on the deployment URL to view your site

## Getting Your Supabase Anon Key

If you don't have your Supabase anon key:

1. Go to https://app.supabase.com/project/mpizntvbwkktnzmnjtep
2. Click **Settings** (⚙️) → **API**
3. Find **"Project API keys"** section
4. Copy the **anon/public** key (NOT the service_role key)

## Verifying Deployment

After deployment:

1. Open your Vercel deployment URL
2. Press **F12** to open browser console
3. Look for:
   - ✅ `Application initialized successfully` = Working!
   - ❌ `Missing or invalid Supabase environment variables` = Environment variables not set

## Updating Environment Variables

If you need to update environment variables after deployment:

1. Go to your project on Vercel dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in the sidebar
4. Edit or add your variables
5. Click **"Save"**
6. Go to **"Deployments"** tab
7. Click **"..."** on the latest deployment → **"Redeploy"**

## Troubleshooting Vercel Deployment

### Issue: Empty Page with Gradient Background

**Cause**: Environment variables not set in Vercel

**Solution**:
1. Check Settings → Environment Variables
2. Make sure both `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
3. Verify the values are correct (not placeholders)
4. Redeploy the project

### Issue: Build Fails

**Check the build logs:**
1. Go to your project on Vercel
2. Click on the failed deployment
3. Click **"View Build Logs"**
4. Look for error messages

**Common fixes:**
- Make sure `package.json` is in the repository
- Verify all dependencies are in `package.json`
- Check that `build.js` is committed to git

### Issue: 404 Not Found

**Cause**: Output directory misconfigured

**Solution**:
1. Go to Settings → General
2. Scroll to **"Build & Development Settings"**
3. Set **Output Directory** to `public`
4. Save and redeploy

### Issue: Environment Variables Not Working

**Check if variables are loaded:**
1. View deployment logs
2. Look for build output
3. Variables should be injected during build

**Solution**:
- Make sure variables are added to the correct environment (Production)
- Redeploy after adding variables (existing deployments don't auto-update)
- Variable names must be exact: `SUPABASE_URL` and `SUPABASE_ANON_KEY`

## Automatic Deployments

Vercel automatically deploys when you push to your repository:

- **Production**: Pushes to `main` branch deploy to production
- **Preview**: Pushes to other branches create preview deployments

## Custom Domain (Optional)

To add a custom domain:

1. Go to Settings → Domains
2. Add your domain name
3. Update your DNS records as instructed
4. Wait for DNS propagation (can take up to 48 hours)

## Environment-Specific Configurations

If you want different settings for production vs. preview:

1. Settings → Environment Variables
2. When adding a variable, select specific environments:
   - **Production**: Live site
   - **Preview**: Branch deployments
   - **Development**: Local development (not usually needed)

## Monitoring Your Deployment

### Check Deployment Status
- Go to your project dashboard
- Recent deployments show status: Ready, Building, or Error

### View Analytics
- Click **"Analytics"** tab
- See visitor stats, performance metrics

### View Logs
- Click on a deployment
- View **"Logs"** to see runtime logs
- Check **"Build Logs"** for build-time issues

## Best Practices

1. **Never commit `.env` file** - It's gitignored for security
2. **Set environment variables in Vercel** - Each deployment environment needs them
3. **Test in preview** - Push to a branch first to test in preview environment
4. **Use the same keys locally and on Vercel** - Or use different Supabase projects for dev/prod
5. **Check build logs** - If deployment fails, logs show why

## Quick Checklist

Before deploying:
- [ ] Repository is on GitHub
- [ ] `package.json` includes all dependencies
- [ ] `build.js` is committed to repository
- [ ] `.env` is in `.gitignore` (should already be)
- [ ] You have your Supabase anon key ready

In Vercel:
- [ ] Repository connected
- [ ] Build command set to `npm run build`
- [ ] Output directory set to `public`
- [ ] `SUPABASE_URL` environment variable added
- [ ] `SUPABASE_ANON_KEY` environment variable added
- [ ] Both variables set for Production environment
- [ ] Deployment successful
- [ ] Site opens and shows login form (not empty page)

## Need Help?

1. Check Vercel build logs for errors
2. Open browser console (F12) on deployed site
3. See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
4. Verify environment variables are set correctly in Vercel settings
