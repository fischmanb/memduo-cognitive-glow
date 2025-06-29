
-- Create a table to store waitlist submissions
CREATE TABLE public.waitlist_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  interest TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add an index on email for faster queries and to prevent duplicates
CREATE UNIQUE INDEX idx_waitlist_email ON public.waitlist_submissions(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert (since this is a public waitlist)
CREATE POLICY "Anyone can submit to waitlist" 
  ON public.waitlist_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Create a policy that prevents public reading (only admins should see submissions)
-- You can modify this later if you need different access patterns
CREATE POLICY "No public read access" 
  ON public.waitlist_submissions 
  FOR SELECT 
  USING (false);
