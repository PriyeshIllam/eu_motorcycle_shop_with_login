# Supabase Setup Guide

## Getting Your Supabase API Key

1. Go to your Supabase project dashboard: https://app.supabase.com/project/mpizntvbwkktnzmnjtep

2. Click on the **Settings** icon (⚙️) in the left sidebar

3. Click on **API** in the settings menu

4. Find the **Project API keys** section

5. Copy the **anon/public** key (not the service_role key)

## Configuring the Application

The application uses environment variables to securely store your Supabase credentials.

1. **Copy the example environment file:**

```bash
cp .env.example .env
```

2. **Open the `.env` file** in your text editor

3. **Replace `YOUR_SUPABASE_ANON_KEY`** with your actual anon key from step 5 above:

```env
SUPABASE_URL=https://mpizntvbwkktnzmnjtep.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-here
```

4. **Save the file**

5. **Rebuild the application:**

```bash
npm run build
```

**Important Security Notes:**
- The `.env` file is excluded from git (via `.gitignore`)
- Never commit your `.env` file to version control
- Never share your Supabase keys publicly
- Use `.env.example` as a template for others

## Supabase Authentication Setup

Make sure your Supabase project has authentication enabled:

1. Go to **Authentication** → **Providers** in your Supabase dashboard

2. Enable **Email** provider

3. Configure email templates if needed (optional)

4. Set up **Site URL** and **Redirect URLs** in Authentication settings:
   - Site URL: `http://localhost:8080`
   - Redirect URLs: `http://localhost:8080/dashboard.html`

## Database Setup

### 1. Motorcycle Shops Table (Required for Homepage)

The homepage displays motorcycle repair shops from the `motorcycle_shops` table. Make sure this table exists:

```sql
-- Create motorcycle_shops table
CREATE TABLE motorcycle_shops (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  hours TEXT,
  rating DECIMAL(3,2),
  reviews_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (optional - allows public read access)
ALTER TABLE motorcycle_shops ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read shops
CREATE POLICY "Anyone can view motorcycle shops"
  ON motorcycle_shops FOR SELECT
  USING (true);
```

### 2. Required RPC Function

Create a Postgres function to get distinct countries efficiently:

```sql
-- Create function to get distinct countries
CREATE OR REPLACE FUNCTION get_distinct_countries()
RETURNS TABLE(country TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT motorcycle_shops.country
  FROM motorcycle_shops
  ORDER BY motorcycle_shops.country;
END;
$$ LANGUAGE plpgsql;
```

### 3. Profiles Table (Optional)

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

- **Error: Invalid API key**: Make sure you copied the anon key correctly in your `.env` file
- **Error: Missing Supabase environment variables**: Make sure your `.env` file exists and contains both `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- **Error: Email not sent**: Check your Supabase email settings
- **Error: User already exists**: Try using a different email address
- **Error: Invalid credentials**: Make sure you confirmed your email first
- **Build fails**: Run `npm run build` after updating your `.env` file
