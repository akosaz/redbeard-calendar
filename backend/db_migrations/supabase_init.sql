-- Supabase Database Initialization Script
-- Copy and paste this into Supabase SQL Editor to initialize your database

-- Create day_status table
CREATE TABLE IF NOT EXISTS day_status (
  date DATE PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('available', 'limited', 'finished')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_day_status_date ON day_status(date);

-- Enable Row Level Security (RLS)
ALTER TABLE day_status ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for frontend calendar view)
CREATE POLICY "Allow public read access" ON day_status
  FOR SELECT
  USING (true);

-- Policy: Allow all operations for authenticated users
-- Note: Your backend uses API key authentication, not Supabase auth
-- So this policy allows all operations through the API
CREATE POLICY "Allow all operations" ON day_status
  FOR ALL
  USING (true);

-- Optional: Add a sample row to test
-- INSERT INTO day_status (date, status) VALUES ('2025-01-01', 'available');

-- Verify table was created
SELECT * FROM day_status LIMIT 1;
