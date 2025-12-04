-- Create vehicles table to store multiple vehicles per user with individual license plates
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    license_plate TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, model, license_plate)
);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own vehicles
CREATE POLICY "Users can view own vehicles"
    ON public.vehicles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own vehicles
CREATE POLICY "Users can insert own vehicles"
    ON public.vehicles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own vehicles
CREATE POLICY "Users can update own vehicles"
    ON public.vehicles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own vehicles
CREATE POLICY "Users can delete own vehicles"
    ON public.vehicles
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);

-- Optional: Migrate existing car_models data to vehicles table
-- This will create vehicle records without license plates from existing profiles
INSERT INTO public.vehicles (user_id, model, license_plate)
SELECT 
    p.id as user_id,
    TRIM(unnest(p.car_models)) as model,
    p.license_plate
FROM public.profiles p
WHERE p.car_models IS NOT NULL 
  AND array_length(p.car_models, 1) > 0
ON CONFLICT (user_id, model, license_plate) DO NOTHING;

COMMENT ON TABLE public.vehicles IS 'Stores individual vehicles owned by users with their respective license plates';
