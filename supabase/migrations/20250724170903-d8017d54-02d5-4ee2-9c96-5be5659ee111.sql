-- Add new status values and last login tracking to waitlist_submissions
ALTER TABLE public.waitlist_submissions 
ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;

-- Update the status check constraint to allow new values
-- First drop the existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.check_constraints 
               WHERE constraint_name = 'waitlist_submissions_status_check' 
               AND table_name = 'waitlist_submissions') THEN
        ALTER TABLE public.waitlist_submissions DROP CONSTRAINT waitlist_submissions_status_check;
    END IF;
END $$;

-- Add new constraint with all status values
ALTER TABLE public.waitlist_submissions 
ADD CONSTRAINT waitlist_submissions_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'registered', 'active'));

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_waitlist_submissions_status ON public.waitlist_submissions(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_submissions_last_login ON public.waitlist_submissions(last_login_at);