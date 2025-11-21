# Supabase Setup Guide

## Getting Your Supabase API Key

1. Go to your Supabase project dashboard: https://app.supabase.com/project/mpizntvbwkktnzmnjtep

2. Click on the **Settings** icon (⚙️) in the left sidebar

3. Click on **API** in the settings menu

4. Find the **Project API keys** section

5. Copy the **anon/public** key (not the service_role key)

## Configuring the Application

1. Open the file: `src/lib/supabase.ts`

2. Replace `YOUR_SUPABASE_ANON_KEY` with your actual anon key:

```typescript
const SUPABASE_ANON_KEY = 'your-actual-anon-key-here';
```

3. Save the file

4. Rebuild the application:

```bash
npm run build
```

## Supabase Authentication Setup

Make sure your Supabase project has authentication enabled:

1. Go to **Authentication** → **Providers** in your Supabase dashboard

2. Enable **Email** provider

3. Configure email templates if needed (optional)

4. Set up **Site URL** and **Redirect URLs** in Authentication settings:
   - Site URL: `http://localhost:8080`
   - Redirect URLs: `http://localhost:8080/dashboard.html`

## Database Setup (Optional)

If you want to store additional user data, you can create a profiles table:

```sql
-- Create a profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create a policy that allows users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

## Testing

After configuration, test the authentication:

1. Start the development server: `npm start`
2. Open http://localhost:8080
3. Try registering a new account
4. Check your email for the confirmation link
5. Confirm your email and try logging in

## Troubleshooting

- **Error: Invalid API key**: Make sure you copied the anon key correctly
- **Error: Email not sent**: Check your Supabase email settings
- **Error: User already exists**: Try using a different email address
- **Error: Invalid credentials**: Make sure you confirmed your email first
