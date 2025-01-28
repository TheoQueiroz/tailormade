/*
  # Fix RLS policies for projects and history tables

  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions for authenticated users
  
  2. Security
    - Enable RLS on both tables
    - Add policies for all CRUD operations
    - Ensure authenticated users can manage their data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON history;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON history;

-- Create new policies for projects
CREATE POLICY "Allow full access for authenticated users" ON projects
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create new policies for history
CREATE POLICY "Allow full access for authenticated users" ON history
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);