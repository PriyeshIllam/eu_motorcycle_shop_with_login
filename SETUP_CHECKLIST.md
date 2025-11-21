# Service Documents Setup Checklist

Follow these steps in order to fix the RLS policy error:

## ✅ Step 1: Run the Main Schema (if not done yet)

In Supabase SQL Editor, run: `supabase_service_documents_schema.sql`

## ✅ Step 2: Fix RLS Policies (REQUIRED)

Copy and paste this into Supabase SQL Editor and run it:

```sql
-- Drop and recreate RLS policies
DROP POLICY IF EXISTS "Users can view their own service documents" ON public.service_documents;
DROP POLICY IF EXISTS "Users can insert their own service documents" ON public.service_documents;
DROP POLICY IF EXISTS "Users can update their own service documents" ON public.service_documents;
DROP POLICY IF EXISTS "Users can delete their own service documents" ON public.service_documents;

-- Create SELECT policy
CREATE POLICY "Users can view their own service documents"
ON public.service_documents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create INSERT policy
CREATE POLICY "Users can insert their own service documents"
ON public.service_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy
CREATE POLICY "Users can update their own service documents"
ON public.service_documents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create DELETE policy
CREATE POLICY "Users can delete their own service documents"
ON public.service_documents
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Make sure RLS is enabled
ALTER TABLE public.service_documents ENABLE ROW LEVEL SECURITY;
```

## ✅ Step 3: Verify Policies Were Created

Run this to check:

```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'service_documents';
```

You should see 4 rows:
- Users can view their own service documents | SELECT
- Users can insert their own service documents | INSERT
- Users can update their own service documents | UPDATE
- Users can delete their own service documents | DELETE

## ✅ Step 4: Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **"Create a new bucket"**
3. Bucket name: `service-documents`
4. **Public**: Toggle OFF (keep it private!)
5. Click **Create bucket**

## ✅ Step 5: Add Storage Policies

In the `service-documents` bucket, create 4 policies:

### Policy 1: Upload (INSERT)
Click "New Policy" → "For full customization"
- Policy name: `Users can upload service documents`
- Allowed operations: **INSERT** ✓
- Target roles: `authenticated`
- USING expression:
```sql
(bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])
```
- WITH CHECK expression:
```sql
(bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])
```

### Policy 2: Download (SELECT)
- Policy name: `Users can view their own service documents`
- Allowed operations: **SELECT** ✓
- Target roles: `authenticated`
- USING expression:
```sql
(bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])
```

### Policy 3: Update (UPDATE)
- Policy name: `Users can update their own service documents`
- Allowed operations: **UPDATE** ✓
- Target roles: `authenticated`
- USING expression:
```sql
(bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])
```

### Policy 4: Delete (DELETE)
- Policy name: `Users can delete their own service documents`
- Allowed operations: **DELETE** ✓
- Target roles: `authenticated`
- USING expression:
```sql
(bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])
```

## ✅ Step 6: Test

1. Make sure you're **logged in** to your app
2. Go to "My Motorcycle Garage"
3. Click "📋 Service History" on a motorcycle
4. Try uploading a test image
5. Should work now! ✅

## Troubleshooting

### Still getting "new row violates row-level security policy"?

**Check 1: Are you logged in?**
- Make sure you're authenticated in the app
- Try logging out and logging back in

**Check 2: Verify policies exist**
```sql
-- Check table policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'service_documents';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'service_documents';
```

**Check 3: Test with a simple query**
Try this in SQL Editor (while logged in):
```sql
-- This should return your user ID
SELECT auth.uid();

-- This should work if policies are correct
INSERT INTO service_documents (
    user_id,
    motorcycle_id,
    document_type,
    title,
    file_path,
    file_name
) VALUES (
    auth.uid(),
    (SELECT id FROM biker_motorcycles WHERE user_id = auth.uid() LIMIT 1),
    'photo',
    'Test Document',
    'test/path.jpg',
    'test.jpg'
);
```

**Check 4: Clear browser cache**
- Clear cookies and cache
- Try in incognito/private mode

### Storage bucket error?

Make sure:
- Bucket name is exactly `service-documents` (with hyphen, not underscore)
- Bucket is set to PRIVATE (not public)
- All 4 storage policies are created
- Policy definitions match exactly (including the `::text` cast)

## Need More Help?

See `RLS_POLICY_FIX.md` for detailed troubleshooting steps.
