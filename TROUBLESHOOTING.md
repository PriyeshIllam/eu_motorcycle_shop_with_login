# Troubleshooting Guide

## Issue: "process is not defined" Error

If you see this error in the browser console:
```
Uncaught ReferenceError: process is not defined
```

**This means the application was not rebuilt after setting up environment variables.**

**Solution:**
1. Make sure your `.env` file exists with real Supabase credentials (not placeholders)
2. **Rebuild the application**:
   ```bash
   npm run build
   ```
3. **Restart the server**:
   ```bash
   npm start
   ```
4. Hard refresh your browser: `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)

The build process injects environment variables into the bundle. If you update `.env`, you **must rebuild**.

---

## Issue: Empty Page with Background

If you see only the background gradient with no login form, follow these debugging steps:

### 1. Open Browser Developer Console

**Chrome/Edge/Brave:**
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (Mac)

**Firefox:**
- Press `F12` or `Ctrl+Shift+K` (Windows/Linux)
- Press `Cmd+Option+K` (Mac)

**Safari:**
- Enable developer menu: Preferences → Advanced → Show Develop menu
- Press `Cmd+Option+C`

### 2. Check for Console Errors

Look for red error messages in the console. Common errors:

#### Error: "Missing or invalid Supabase environment variables"

**Solution:**
1. Make sure you have created the `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Get your actual Supabase anon key:
   - Go to https://app.supabase.com/project/mpizntvbwkktnzmnjtep
   - Click **Settings** → **API**
   - Copy the **anon/public** key

3. Update `.env` file with your real key:
   ```env
   SUPABASE_URL=https://mpizntvbwkktnzmnjtep.supabase.co
   SUPABASE_ANON_KEY=your_actual_key_here
   ```

4. Rebuild the application:
   ```bash
   npm run build
   ```

5. Restart the server:
   ```bash
   npm start
   ```

#### Error: "Failed to load resource: net::ERR_FILE_NOT_FOUND"

**Possible causes:**
- Bundle.js not found
- CSS file not found
- Wrong file paths

**Solution:**
1. Verify files exist:
   ```bash
   ls -la public/js/bundle.js
   ls -la public/css/login.css
   ```

2. If files are missing, rebuild:
   ```bash
   npm run build
   ```

3. Make sure you're serving from the `public` directory

#### Error: "Uncaught ReferenceError: process is not defined"

**Solution:**
This means the environment variables weren't injected properly.

1. Verify your `.env` file exists
2. Rebuild with:
   ```bash
   npm run build
   ```

### 3. Verify File Structure

Make sure your files are organized correctly:

```
public/
├── index.html          ✓ Should exist
├── css/
│   └── login.css       ✓ Should exist (5KB+)
└── js/
    └── bundle.js       ✓ Should exist (1.5MB+)
```

Check with:
```bash
ls -lh public/js/bundle.js
ls -lh public/css/login.css
```

### 4. Check Network Tab

In the browser developer tools:
1. Go to the **Network** tab
2. Reload the page
3. Look for failed requests (shown in red)
4. Make sure these files load successfully:
   - `index.html` (200 OK)
   - `css/login.css` (200 OK)
   - `js/bundle.js` (200 OK)

### 5. Clear Browser Cache

Sometimes old cached files cause issues:

**Chrome/Edge/Brave:**
- `Ctrl+Shift+Delete` → Clear cached images and files

**Firefox:**
- `Ctrl+Shift+Delete` → Cached Web Content

**Or use hard refresh:**
- `Ctrl+F5` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

### 6. Verify Server is Running

Make sure the development server is running:

```bash
npm start
```

You should see:
```
Starting up http-server, serving public
Available on:
  http://127.0.0.1:8080
```

### 7. Test in Different Browser

Try opening the app in a different browser or incognito/private window to rule out browser-specific issues.

### 8. Check Build Output

Make sure the build completes successfully:

```bash
npm run build
```

You should see no errors. Output should look like:
```
> npm run build:css && npm run build:js
  public/js/bundle.js      1.5mb
  public/js/bundle.js.map  2.4mb
⚡ Done
```

### 9. Verify Environment Variables Are Injected

Check if your Supabase URL is in the bundle:

```bash
grep -o "mpizntvbwkktnzmnjtep.supabase.co" public/js/bundle.js
```

Should output: `mpizntvbwkktnzmnjtep.supabase.co`

### 10. Check Console for Success Message

After fixing issues, you should see in the console:
```
✅ Application initialized successfully
```

If you see the Supabase warning, that's okay - the app will still render:
```
❌ Missing or invalid Supabase environment variables.
📝 Please update your .env file with your actual Supabase credentials.
💡 See SUPABASE_SETUP.md for instructions.
```

## Still Having Issues?

1. Make sure Node.js version is 14+ : `node --version`
2. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Delete generated files and rebuild:
   ```bash
   rm -rf public/js/bundle.js public/css/login.css
   npm run build
   ```

## Quick Test Checklist

- [ ] `.env` file exists with actual Supabase key
- [ ] Ran `npm install`
- [ ] Ran `npm run build` successfully
- [ ] `public/js/bundle.js` exists and is ~1.5MB
- [ ] `public/css/login.css` exists and is ~5KB
- [ ] Server is running on port 8080
- [ ] Browser console shows no errors
- [ ] Network tab shows all files loading (200 OK)
