/*
  # Add missing RLS policies for problems table

  1. Security Changes
    - Add UPDATE policy for problems table
    - Add DELETE policy for problems table
    - These policies allow authenticated users to modify problems

  2. Notes
    - INSERT policy already exists from previous migration
    - SELECT policy already exists from initial migration
*/

-- Add UPDATE policy for problems
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'problems' AND policyname = 'authenticated users can update their problems'
  ) THEN
    CREATE POLICY "authenticated users can update their problems"
    ON problems
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Add DELETE policy for problems  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'problems' AND policyname = 'authenticated users can delete their problems'
  ) THEN
    CREATE POLICY "authenticated users can delete their problems"
    ON problems
    FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;