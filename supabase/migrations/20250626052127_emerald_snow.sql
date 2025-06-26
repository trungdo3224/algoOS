/*
  # Add additional columns to problems table

  1. Changes
    - Add `status` column to track problem solving status
    - Add `time_taken` column to track time spent on problems  
    - Add `attempts` column to track number of attempts
    - Add `note` column for user notes

  2. Security
    - No changes to RLS policies needed
*/

-- Add status column to problems table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'problems' AND column_name = 'status'
  ) THEN
    ALTER TABLE problems ADD COLUMN status text;
  END IF;
END $$;

-- Add check constraint for valid statuses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'problems_status_check'
  ) THEN
    ALTER TABLE problems ADD CONSTRAINT problems_status_check 
    CHECK (status IS NULL OR status = ANY (ARRAY[
      'Giải với hint'::text, 
      'Đã tự giải'::text, 
      'Giải từ solution'::text, 
      'Cần ôn tập sớm'::text, 
      'Đã ôn tập'::text
    ]));
  END IF;
END $$;

-- Add time_taken column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'problems' AND column_name = 'time_taken'
  ) THEN
    ALTER TABLE problems ADD COLUMN time_taken bigint;
  END IF;
END $$;

-- Add attempts column  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'problems' AND column_name = 'attemps'
  ) THEN
    ALTER TABLE problems ADD COLUMN attemps smallint;
  END IF;
END $$;

-- Add note column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'problems' AND column_name = 'note'
  ) THEN
    ALTER TABLE problems ADD COLUMN note text;
  END IF;
END $$;

-- Update existing rows to have a default status if needed
UPDATE problems 
SET status = 'Cần ôn tập sớm'
WHERE status IS NULL;