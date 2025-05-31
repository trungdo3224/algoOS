-- Add status column to problems table
ALTER TABLE public.problems 
ADD COLUMN IF NOT EXISTS status TEXT CHECK(status IN ('Giải với hint', 'Đã tự giải', 'Giải từ solution', 'Cần ôn tập sớm', 'Đã ôn tập'));

-- Update existing rows to have a default status if needed
UPDATE public.problems 
SET status = 'Cần ôn tập sớm'
WHERE status IS NULL;