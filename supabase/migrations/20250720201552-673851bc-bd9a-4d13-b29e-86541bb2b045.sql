
-- Create magic_links table for SHA-256 token management
CREATE TABLE public.magic_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  approved_user_id UUID REFERENCES public.approved_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage magic links
CREATE POLICY "Admins can manage magic links" 
  ON public.magic_links 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Policy for public token validation (needed for GitHub app to validate tokens)
CREATE POLICY "Public can validate tokens" 
  ON public.magic_links 
  FOR SELECT 
  USING (token_hash IS NOT NULL AND NOT used AND expires_at > now());

-- Add index for faster token lookups
CREATE INDEX idx_magic_links_token_hash ON public.magic_links(token_hash);
CREATE INDEX idx_magic_links_expires_at ON public.magic_links(expires_at);
