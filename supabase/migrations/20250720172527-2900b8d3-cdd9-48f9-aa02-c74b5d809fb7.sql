-- Add status tracking and admin fields to waitlist_submissions
ALTER TABLE public.waitlist_submissions 
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN admin_notes TEXT,
ADD COLUMN reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;

-- Create admin_users table for separate admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Admins can view other admins" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Admins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Update waitlist_submissions policies to allow admin access
CREATE POLICY "Admins can view all waitlist submissions" 
ON public.waitlist_submissions 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Admins can update waitlist submissions" 
ON public.waitlist_submissions 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create approved_users table for tracking approved users who need to set up accounts
CREATE TABLE public.approved_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  waitlist_submission_id UUID NOT NULL REFERENCES public.waitlist_submissions(id),
  setup_token TEXT NOT NULL UNIQUE,
  account_created BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on approved_users
ALTER TABLE public.approved_users ENABLE ROW LEVEL SECURITY;

-- Create policies for approved_users
CREATE POLICY "Public can view by token" 
ON public.approved_users 
FOR SELECT 
USING (setup_token IS NOT NULL);

CREATE POLICY "Admins can manage approved users" 
ON public.approved_users 
FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));