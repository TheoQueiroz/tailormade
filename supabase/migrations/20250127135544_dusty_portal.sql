/*
  # Initial Schema for Fuzzr Project Management

  1. New Tables
    - `projects`: Main project information table
      - All core project fields
      - Timestamps for tracking
    - `history`: Project history/updates table
      - Links to projects
      - Tracks all changes and updates

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client text NOT NULL,
  fuzzr_number text NOT NULL,
  job text NOT NULL,
  start_date date NOT NULL,
  drive_link text,
  scope text,
  project_management text,
  coordinator text,
  music_producer text,
  last_status_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('Kickoff', 'PPM', 'Offline', 'Aguardando Retorno', 'Online', 'Stand-by', 'Finalizado')),
  current_owner text NOT NULL CHECK (current_owner IN ('Fuzzr', 'Cliente')),
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create history table
CREATE TABLE IF NOT EXISTS history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  date timestamptz NOT NULL DEFAULT now(),
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON projects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON projects
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON history
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();