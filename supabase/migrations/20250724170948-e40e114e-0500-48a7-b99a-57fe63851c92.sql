-- Add new status values and last login tracking to waitlist_submissions
ALTER TABLE public.waitlist_submissions 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_waitlist_submissions_status ON public.waitlist_submissions(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_submissions_last_login ON public.waitlist_submissions(last_login_at);