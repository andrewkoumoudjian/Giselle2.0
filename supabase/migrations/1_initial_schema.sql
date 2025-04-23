-- Create the schema
CREATE SCHEMA IF NOT EXISTS giselle;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE giselle.application_status AS ENUM (
  'new', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected'
);

-- Create Jobs table
CREATE TABLE giselle.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create Candidates table
CREATE TABLE giselle.candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id), -- Link to Supabase Auth user
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  resume_url TEXT,
  resume_text TEXT,
  skills JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Applications table
CREATE TABLE giselle.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES giselle.candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES giselle.jobs(id) ON DELETE SET NULL,
  status giselle.application_status DEFAULT 'new',
  ai_score NUMERIC(5,2),
  ai_analysis JSONB,
  hr_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create HR Staff table (needed for RLS policies)
CREATE TABLE giselle.hr_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id), -- Link to Supabase Auth user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE giselle.hr_staff IS 'Stores references to auth.users who are HR staff members.';

-- Create functions to handle timestamps
CREATE OR REPLACE FUNCTION giselle.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_jobs
BEFORE UPDATE ON giselle.jobs
FOR EACH ROW EXECUTE FUNCTION giselle.handle_updated_at();

CREATE TRIGGER set_updated_at_candidates
BEFORE UPDATE ON giselle.candidates
FOR EACH ROW EXECUTE FUNCTION giselle.handle_updated_at();

CREATE TRIGGER set_updated_at_applications
BEFORE UPDATE ON giselle.applications
FOR EACH ROW EXECUTE FUNCTION giselle.handle_updated_at();

-- Security policies
ALTER TABLE giselle.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE giselle.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE giselle.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE giselle.hr_staff ENABLE ROW LEVEL SECURITY; -- Enable RLS for hr_staff table too

-- HR staff can manage everything in the giselle schema
CREATE POLICY "HR staff can manage jobs" ON giselle.jobs
  FOR ALL USING (auth.uid() IN (SELECT auth_id FROM giselle.hr_staff));

CREATE POLICY "HR staff can manage candidates" ON giselle.candidates
  FOR ALL USING (auth.uid() IN (SELECT auth_id FROM giselle.hr_staff));

CREATE POLICY "HR staff can manage applications" ON giselle.applications
  FOR ALL USING (auth.uid() IN (SELECT auth_id FROM giselle.hr_staff));

CREATE POLICY "HR staff can manage hr_staff" ON giselle.hr_staff
  FOR ALL USING (auth.uid() IN (SELECT auth_id FROM giselle.hr_staff)); -- HR can manage other HR staff records

-- Candidates can see active jobs
CREATE POLICY "Candidates can see active jobs" ON giselle.jobs
  FOR SELECT USING (is_active = TRUE);

-- Candidates can manage their own profile (assuming they are authenticated)
CREATE POLICY "Candidates can manage their own profile" ON giselle.candidates
  FOR ALL USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Candidates can create applications
CREATE POLICY "Candidates can create applications" ON giselle.applications
  FOR INSERT WITH CHECK (
    candidate_id IN (SELECT id FROM giselle.candidates WHERE auth_id = auth.uid())
  );

-- Candidates can view their own applications
CREATE POLICY "Candidates can view their own applications" ON giselle.applications
  FOR SELECT USING (
    candidate_id IN (SELECT id FROM giselle.candidates WHERE auth_id = auth.uid())
  );

-- Candidates cannot update/delete applications directly (handled by HR or system)
-- No UPDATE or DELETE policies for candidates on applications table.

-- Allow authenticated users to read hr_staff table (e.g., to check if current user is HR)
-- This might be too permissive depending on needs, adjust if necessary.
-- Alternatively, create a function `is_hr_staff()`
-- CREATE POLICY "Authenticated users can read hr_staff" ON giselle.hr_staff
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Allow read access for anon/public if needed (e.g., public job board)
-- CREATE POLICY "Public can see active jobs" ON giselle.jobs
--   FOR SELECT TO anon, authenticated USING (is_active = TRUE);

-- Ensure auth.users table exists and is accessible
-- This is usually handled by Supabase Auth setup.