-- Enable RLS on vehicles table
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own vehicles
CREATE POLICY "Users can view their own vehicles" 
ON vehicles FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own vehicles
CREATE POLICY "Users can insert their own vehicles" 
ON vehicles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own vehicles
CREATE POLICY "Users can update their own vehicles" 
ON vehicles FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own vehicles
CREATE POLICY "Users can delete their own vehicles" 
ON vehicles FOR DELETE 
USING (auth.uid() = user_id);

-- Allow service role (admin) to do everything
CREATE POLICY "Service role can do everything on vehicles" 
ON vehicles FOR ALL 
USING (true) 
WITH CHECK (true);
