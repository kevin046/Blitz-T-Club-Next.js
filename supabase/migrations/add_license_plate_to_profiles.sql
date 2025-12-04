-- Add license_plate column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS license_plate TEXT;

-- Update RLS policies if necessary (usually existing policies cover new columns if they select *)
-- But good to be safe, though standard policies are usually row-based.
