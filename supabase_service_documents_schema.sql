-- SQL Schema for Service/Repair Documentation and Photos
-- Run this in your Supabase SQL Editor

-- Create the service_documents table
CREATE TABLE IF NOT EXISTS public.service_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    motorcycle_id UUID NOT NULL REFERENCES public.biker_motorcycles(id) ON DELETE CASCADE,

    -- Document details
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('photo', 'invoice', 'receipt', 'report', 'warranty', 'other')),
    title VARCHAR(200) NOT NULL,
    description TEXT,

    -- Service/Repair information
    service_type VARCHAR(50) CHECK (service_type IN (
        'oil_change', 'tire_replacement', 'brake_service', 'chain_maintenance',
        'engine_repair', 'electrical', 'bodywork', 'general_maintenance',
        'inspection', 'custom_modification', 'other'
    )),
    service_date DATE,
    service_mileage INTEGER CHECK (service_mileage >= 0),
    service_provider VARCHAR(200), -- Shop name or mechanic
    cost DECIMAL(10,2) CHECK (cost >= 0),
    currency VARCHAR(3) DEFAULT 'EUR',

    -- File storage information (Supabase Storage)
    file_path TEXT NOT NULL, -- Path in Supabase Storage bucket
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER, -- Size in bytes
    file_type VARCHAR(100), -- MIME type (image/jpeg, application/pdf, etc.)

    -- Metadata
    tags TEXT[], -- Array of tags for easier searching
    is_favorite BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_documents_user_id
ON public.service_documents(user_id);

CREATE INDEX IF NOT EXISTS idx_service_documents_motorcycle_id
ON public.service_documents(motorcycle_id);

CREATE INDEX IF NOT EXISTS idx_service_documents_service_date
ON public.service_documents(service_date DESC);

CREATE INDEX IF NOT EXISTS idx_service_documents_document_type
ON public.service_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_service_documents_service_type
ON public.service_documents(service_type);

-- Create GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_service_documents_tags
ON public.service_documents USING GIN(tags);

-- Enable Row Level Security (RLS)
ALTER TABLE public.service_documents ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own documents
CREATE POLICY "Users can view their own service documents"
ON public.service_documents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy: Users can insert their own documents
CREATE POLICY "Users can insert their own service documents"
ON public.service_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own documents
CREATE POLICY "Users can update their own service documents"
ON public.service_documents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own documents
CREATE POLICY "Users can delete their own service documents"
ON public.service_documents
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create or replace the function to update the updated_at timestamp
-- (Uses CREATE OR REPLACE in case it already exists from other tables)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_service_documents_updated_at
BEFORE UPDATE ON public.service_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a view for service history with motorcycle details
CREATE OR REPLACE VIEW public.service_history_view AS
SELECT
    sd.id,
    sd.user_id,
    sd.motorcycle_id,
    sd.document_type,
    sd.title,
    sd.description,
    sd.service_type,
    sd.service_date,
    sd.service_mileage,
    sd.service_provider,
    sd.cost,
    sd.currency,
    sd.file_path,
    sd.file_name,
    sd.file_type,
    sd.tags,
    sd.is_favorite,
    sd.created_at,
    -- Motorcycle details
    bm.brand,
    bm.model,
    bm.year,
    bm.license_plate
FROM public.service_documents sd
JOIN public.biker_motorcycles bm ON sd.motorcycle_id = bm.id;

-- Grant access to the view
GRANT SELECT ON public.service_history_view TO authenticated;

-- Create a view for service statistics per motorcycle
CREATE OR REPLACE VIEW public.motorcycle_service_stats AS
SELECT
    motorcycle_id,
    user_id,
    COUNT(*) as total_documents,
    COUNT(CASE WHEN document_type = 'photo' THEN 1 END) as total_photos,
    COUNT(CASE WHEN document_type IN ('invoice', 'receipt') THEN 1 END) as total_invoices,
    SUM(cost) as total_service_cost,
    MAX(service_date) as last_service_date,
    COUNT(DISTINCT service_type) as different_service_types,
    AVG(cost) as average_service_cost
FROM public.service_documents
WHERE service_date IS NOT NULL
GROUP BY motorcycle_id, user_id;

-- Grant access to the view
GRANT SELECT ON public.motorcycle_service_stats TO authenticated;

-- Create a function to get service reminders (services due soon)
CREATE OR REPLACE FUNCTION public.get_service_reminders(
    p_user_id UUID,
    p_months_threshold INTEGER DEFAULT 6
)
RETURNS TABLE(
    motorcycle_id UUID,
    brand VARCHAR,
    model VARCHAR,
    last_service_date DATE,
    months_since_service INTEGER,
    needs_attention BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bm.id,
        bm.brand,
        bm.model,
        mss.last_service_date,
        EXTRACT(MONTH FROM AGE(CURRENT_DATE, mss.last_service_date))::INTEGER as months_since,
        (EXTRACT(MONTH FROM AGE(CURRENT_DATE, mss.last_service_date)) >= p_months_threshold) as needs_attention
    FROM public.biker_motorcycles bm
    LEFT JOIN public.motorcycle_service_stats mss ON bm.id = mss.motorcycle_id
    WHERE bm.user_id = p_user_id
        AND bm.current_owner = true
    ORDER BY mss.last_service_date ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_service_reminders(UUID, INTEGER) TO authenticated;

-- ========================================
-- STORAGE BUCKET SETUP
-- ========================================
-- Note: Storage bucket and policies need to be created via Supabase Dashboard

-- Step 1: Create Storage Bucket
-- Go to Supabase Dashboard → Storage → Create a new bucket
-- Bucket name: 'service-documents'
-- Public: OFF (private bucket)

-- Step 2: Create Storage Policies
-- Go to Storage → service-documents bucket → Policies
-- Create the following policies:

-- Policy 1: Users can upload their own documents (INSERT)
-- Name: Users can upload service documents
-- Allowed operation: INSERT
-- Policy definition:
-- (bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])

-- Policy 2: Users can view their own documents (SELECT)
-- Name: Users can view their own service documents
-- Allowed operation: SELECT
-- Policy definition:
-- (bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])

-- Policy 3: Users can update their own documents (UPDATE)
-- Name: Users can update their own service documents
-- Allowed operation: UPDATE
-- Policy definition:
-- (bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])

-- Policy 4: Users can delete their own documents (DELETE)
-- Name: Users can delete their own service documents
-- Allowed operation: DELETE
-- Policy definition:
-- (bucket_id = 'service-documents') AND (auth.uid()::text = (storage.foldername(name))[1])

-- ========================================
-- USAGE NOTES
-- ========================================
-- File path structure in storage: {user_id}/{motorcycle_id}/{filename}
-- Example: '550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440001/oil_change_2024.jpg'
--
-- Supported file types:
-- - Images: image/jpeg, image/png, image/gif, image/webp
-- - Documents: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
-- - Other: text/plain
--
-- Example INSERT query:
-- INSERT INTO service_documents (user_id, motorcycle_id, document_type, title, service_type, service_date, file_path, file_name, file_type)
-- VALUES (
--   auth.uid(),
--   '660e8400-e29b-41d4-a716-446655440001',
--   'invoice',
--   'Annual Service 2024',
--   'general_maintenance',
--   '2024-03-15',
--   'user-id/motorcycle-id/service_invoice_2024.pdf',
--   'service_invoice_2024.pdf',
--   'application/pdf'
-- );
