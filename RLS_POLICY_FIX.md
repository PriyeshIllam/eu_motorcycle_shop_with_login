# Fixing Row-Level Security Policy Error

## Problem
You're seeing: `Error: new row violates row-level security policy`

This happens when the RLS policies for the `service_documents` table aren't properly configured in Supabase.

## Solution

### Option 1: Run the Fix Script (Recommended)

Copy and paste this entire script into your Supabase SQL Editor:

```sql
-- Fix RLS policies for service_documents

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own service documents" ON public.service_documents;
DROP POLICY IF EXISTS "Users can insert their own service documents" ON public.service_documents;
DROP POLICY IF EXISTS "Users can update their own service documents" ON public.service_documents;
DROP POLICY IF EXISTS "Users can delete their own service documents" ON public.service_documents;

-- Recreate policies with correct syntax
CREATE POLICY "Users can view their own service documents"
ON public.service_documents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service documents"
ON public.service_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service documents"
ON public.service_documents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service documents"
ON public.service_documents
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE public.service_documents ENABLE ROW LEVEL SECURITY;
```

### Option 2: Verify via Dashboard

1. Go to Supabase Dashboard → Authentication → Policies
2. Find the `service_documents` table
3. Verify these 4 policies exist:
   - "Users can view their own service documents" (SELECT)
   - "Users can insert their own service documents" (INSERT)
   - "Users can update their own service documents" (UPDATE)
   - "Users can delete their own service documents" (DELETE)

4. Each policy should have:
   - **Target roles**: `authenticated`
   - **USING expression**: `auth.uid() = user_id`
   - **WITH CHECK expression** (for INSERT/UPDATE): `auth.uid() = user_id`

### Option 3: Check Your Setup

Make sure you've completed these steps:

1. ✅ Run `supabase_service_documents_schema.sql` in SQL Editor
2. ✅ Create storage bucket named `service-documents` (Private)
3. ✅ Add storage policies (see below)

### Storage Bucket Setup

If you haven't created the storage bucket yet:

1. Go to **Storage** in Supabase Dashboard
2. Click **Create a new bucket**
3. Name: `service-documents`
4. Public: **OFF** (keep it private)
5. Click **Create bucket**

Then add these 4 policies to the bucket:

**Policy 1: INSERT (Upload)**
- Name: `Users can upload service documents`
- Allowed operation: INSERT
- Policy definition:
```sql
(bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])
```

**Policy 2: SELECT (View/Download)**
- Name: `Users can view their own service documents`
- Allowed operation: SELECT
- Policy definition:
```sql
(bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])
```

**Policy 3: UPDATE**
- Name: `Users can update their own service documents`
- Allowed operation: UPDATE
- Policy definition:
```sql
(bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])
```

**Policy 4: DELETE**
- Name: `Users can delete their own service documents`
- Allowed operation: DELETE
- Policy definition:
```sql
(bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])
```

## Verification

After applying the fix, run this query to verify policies exist:

```sql
SELECT
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'service_documents';
```

You should see 4 rows (SELECT, INSERT, UPDATE, DELETE).

## Still Having Issues?

If you still get the error after running the fix:

1. **Check if you're logged in**: Make sure you're authenticated in the app
2. **Clear browser cache**: Sometimes stale auth tokens cause issues
3. **Check Supabase logs**: Go to Logs in Supabase Dashboard to see detailed error messages
4. **Verify user_id**: The `user_id` in the insert must match the authenticated user's ID

## Test the Fix

After applying the fix:
1. Log in to your app
2. Go to "My Motorcycle Garage"
3. Click "📋 Service History" on any motorcycle
4. Try uploading a document
5. It should work now! ✅
