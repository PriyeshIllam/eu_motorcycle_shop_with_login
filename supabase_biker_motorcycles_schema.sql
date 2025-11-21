-- SQL Schema for Biker Motorcycles Profile
-- Run this in your Supabase SQL Editor

-- Create the biker_motorcycles table
CREATE TABLE IF NOT EXISTS public.biker_motorcycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Motorcycle details
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
    mileage INTEGER CHECK (mileage >= 0),
    mileage_unit VARCHAR(10) DEFAULT 'km' CHECK (mileage_unit IN ('km', 'miles')),

    -- Additional details
    engine_size INTEGER CHECK (engine_size > 0), -- in cc
    color VARCHAR(50),
    license_plate VARCHAR(50),
    vin VARCHAR(17), -- Vehicle Identification Number

    -- Ownership and status
    purchase_date DATE,
    current_owner BOOLEAN DEFAULT true,
    condition VARCHAR(20) CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),

    -- Notes and custom fields
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_biker_motorcycles_user_id
ON public.biker_motorcycles(user_id);

-- Create index on brand and model for searching
CREATE INDEX IF NOT EXISTS idx_biker_motorcycles_brand_model
ON public.biker_motorcycles(brand, model);

-- Enable Row Level Security (RLS)
ALTER TABLE public.biker_motorcycles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own motorcycles
CREATE POLICY "Users can view their own motorcycles"
ON public.biker_motorcycles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy: Users can insert their own motorcycles
CREATE POLICY "Users can insert their own motorcycles"
ON public.biker_motorcycles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own motorcycles
CREATE POLICY "Users can update their own motorcycles"
ON public.biker_motorcycles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own motorcycles
CREATE POLICY "Users can delete their own motorcycles"
ON public.biker_motorcycles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_biker_motorcycles_updated_at
BEFORE UPDATE ON public.biker_motorcycles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Optional: Create a view for motorcycle statistics per user
CREATE OR REPLACE VIEW public.user_motorcycle_stats AS
SELECT
    user_id,
    COUNT(*) as total_motorcycles,
    COUNT(CASE WHEN current_owner = true THEN 1 END) as current_motorcycles,
    AVG(mileage) as average_mileage,
    MIN(year) as oldest_bike_year,
    MAX(year) as newest_bike_year
FROM public.biker_motorcycles
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON public.user_motorcycle_stats TO authenticated;
