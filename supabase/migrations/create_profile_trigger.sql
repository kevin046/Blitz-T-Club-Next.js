-- Create a trigger to automatically create/update profile when user signs up
-- This ensures profile data from registration is properly stored

-- First, create the function that will handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile if it doesn't exist
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username,
    phone,
    date_of_birth,
    car_models,
    street,
    city,
    province,
    postal_code,
    membership_status,
    membership_type,
    member_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'date_of_birth', NULL),
    COALESCE((NEW.raw_user_meta_data->>'car_models')::jsonb, '[]'::jsonb),
    COALESCE(NEW.raw_user_meta_data->>'street', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'province', ''),
    COALESCE(NEW.raw_user_meta_data->>'postal_code', ''),
    COALESCE(NEW.raw_user_meta_data->>'membership_status', 'pending'),
    COALESCE(NEW.raw_user_meta_data->>'membership_type', 'regular'),
    COALESCE(NEW.raw_user_meta_data->>'member_id', '')
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, public.profiles.date_of_birth),
    car_models = COALESCE(EXCLUDED.car_models, public.profiles.car_models),
    street = COALESCE(EXCLUDED.street, public.profiles.street),
    city = COALESCE(EXCLUDED.city, public.profiles.city),
    province = COALESCE(EXCLUDED.province, public.profiles.province),
    postal_code = COALESCE(EXCLUDED.postal_code, public.profiles.postal_code),
    membership_status = COALESCE(EXCLUDED.membership_status, public.profiles.membership_status),
    membership_type = COALESCE(EXCLUDED.membership_type, public.profiles.membership_type),
    member_id = COALESCE(EXCLUDED.member_id, public.profiles.member_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger that fires when a new user is created or updated
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
