/*
  # Remove video feedback feature

  1. Changes
    - Drop video_feedback table and related indexes
    - Remove video feedback references from other tables

  2. Security
    - Remove RLS policies for video_feedback table
*/

-- Drop the video_feedback table and all its dependencies
DROP TABLE IF EXISTS public.video_feedback CASCADE;

-- Note: Indexes and policies are automatically dropped with the table