/*
  # Add INSERT policy for problems table

  1. Security Changes
    - Add policy to allow authenticated users to insert new problems
    - This allows users to create problems through the ProblemCreator interface
    - Policy ensures only authenticated users can create problems
*/

CREATE POLICY "Authenticated users can create problems"
ON public.problems
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);