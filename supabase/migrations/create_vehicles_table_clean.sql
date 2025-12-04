-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS public.vehicles CASCADE;

-- Create vehicles table to store multiple vehicles per user with individual license plates
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    license_plate TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint (allowing NULL license plates for same user/model combo)
CREATE UNIQUE INDEX unique_user_model_plate 
ON public.vehicles (user_id, model, license_plate) 
WHERE license_plate IS NOT NULL;

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
CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);

-- Migrate existing car_models data to vehicles table
INSERT INTO public.vehicles (user_id, model, license_plate)
SELECT 
    p.id as user_id,
    TRIM(unnest(p.car_models)) as model,
    p.license_plate
FROM public.profiles p
WHERE p.car_models IS NOT NULL 
  AND array_length(p.car_models, 1) > 0
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.vehicles IS 'Stores individual vehicles owned by users with their respective license plates';
