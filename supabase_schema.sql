-- ====================================================================
-- SUPABASE DATABASE SCHEMA SETUP
-- Target: Copy-paste directly into Supabase SQL Editor
-- ====================================================================

-- 1. Create the public users table linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'PASSENGER', -- MASTER_ADMIN, ADMIN, OPERATIONS, CONDUCTOR, DRIVER, PASSENGER
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    scope TEXT NOT NULL DEFAULT 'Global',  -- Global, or custom scopes (e.g., local admin districts)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create index structures for optimized lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users (role);

-- 3. Setup Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table updates
CREATE OR REPLACE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();

-- 4. Enable Row Level Security (RLS) on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for users table
-- View Policy: Allow authenticated users to view profiles
CREATE POLICY "Allow authenticated users to view profiles" 
    ON public.users 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Insert Policy: Allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile" 
    ON public.users 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = id);

-- Update Policy: Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile" 
    ON public.users 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Delete Policy: Allow admins/masters to delete users
CREATE POLICY "Allow admins to delete users" 
    ON public.users 
    FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = auth.uid() 
            AND (public.users.role = 'ADMIN' OR public.users.role = 'MASTER_ADMIN')
        )
    );

-- 6. Setup automatic signup trigger to sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone, role, status, scope)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'mobile'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'PASSENGER'),
    'ACTIVE',
    COALESCE(NEW.raw_user_meta_data->>'scope', 'Global')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    scope = EXCLUDED.scope;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for sync auth.users updates
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
