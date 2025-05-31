/*
  # Add users table insert policy

  1. Security Changes
    - Add RLS policy to allow users to insert their own data during signup
    - Policy ensures users can only insert a row with their own user_id

  Note: The existing SELECT policy is already in place, this migration only adds the INSERT policy
*/

CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);