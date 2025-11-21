-- ============================================================================
-- BOOKING REQUESTS TABLE SCHEMA
-- ============================================================================
-- This table stores service/repair booking requests from users
--
-- SETUP INSTRUCTIONS:
-- 1. Copy this entire SQL script
-- 2. Go to your Supabase project dashboard
-- 3. Navigate to SQL Editor (left sidebar)
-- 4. Create a new query
-- 5. Paste this script and click "RUN"
-- ============================================================================

-- Create the booking_requests table
CREATE TABLE IF NOT EXISTS public.booking_requests (
    -- Primary Key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    motorcycle_id UUID NOT NULL REFERENCES public.biker_motorcycles(id) ON DELETE CASCADE,

    -- Booking Details
    service_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,

    -- Contact Information
    contact_phone VARCHAR(20),
    contact_method VARCHAR(20) DEFAULT 'email' CHECK (contact_method IN ('email', 'phone', 'both')),

    -- Additional Details
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
    estimated_budget DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'EUR',

    -- Status Tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),

    -- Notes from shop (admin response)
    admin_notes TEXT,
    confirmed_date DATE,
    confirmed_time TIME,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- INDEXES for better query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_booking_requests_user_id
ON public.booking_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_booking_requests_motorcycle_id
ON public.booking_requests(motorcycle_id);

CREATE INDEX IF NOT EXISTS idx_booking_requests_status
ON public.booking_requests(status);

CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at
ON public.booking_requests(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own booking requests
CREATE POLICY "Users can view their own booking requests"
ON public.booking_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own booking requests
CREATE POLICY "Users can insert their own booking requests"
ON public.booking_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending/confirmed booking requests
CREATE POLICY "Users can update their own booking requests"
ON public.booking_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status IN ('pending', 'confirmed'))
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own pending booking requests
CREATE POLICY "Users can delete their own pending booking requests"
ON public.booking_requests
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- ============================================================================
-- TRIGGERS for automatic timestamp updates
-- ============================================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS set_booking_requests_updated_at ON public.booking_requests;
CREATE TRIGGER set_booking_requests_updated_at
    BEFORE UPDATE ON public.booking_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- View: Booking requests with motorcycle and user details
CREATE OR REPLACE VIEW public.booking_requests_with_details AS
SELECT
    br.id,
    br.user_id,
    br.motorcycle_id,
    br.service_type,
    br.description,
    br.preferred_date,
    br.preferred_time,
    br.contact_phone,
    br.contact_method,
    br.urgency,
    br.estimated_budget,
    br.currency,
    br.status,
    br.admin_notes,
    br.confirmed_date,
    br.confirmed_time,
    br.created_at,
    br.updated_at,
    -- Motorcycle details
    bm.brand,
    bm.model,
    bm.year,
    bm.license_plate,
    bm.mileage
FROM public.booking_requests br
LEFT JOIN public.biker_motorcycles bm ON br.motorcycle_id = bm.id;

-- Grant access to the view
GRANT SELECT ON public.booking_requests_with_details TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after setup to verify everything is working:
--
-- 1. Check if table exists:
--    SELECT * FROM public.booking_requests LIMIT 1;
--
-- 2. Check RLS policies:
--    SELECT * FROM pg_policies WHERE tablename = 'booking_requests';
--
-- 3. Check triggers:
--    SELECT * FROM pg_trigger WHERE tgname LIKE '%booking_requests%';
-- ============================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Booking Requests table created successfully!';
    RAISE NOTICE 'Table: public.booking_requests';
    RAISE NOTICE 'Policies: 4 RLS policies enabled';
    RAISE NOTICE 'Indexes: 4 indexes created';
    RAISE NOTICE 'View: booking_requests_with_details';
END $$;
