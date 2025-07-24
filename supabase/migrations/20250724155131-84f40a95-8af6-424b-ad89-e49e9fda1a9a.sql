-- Allow reading waitlist submissions when accessed through valid setup token
CREATE POLICY "Allow reading via valid setup token" 
ON public.waitlist_submissions 
FOR SELECT 
USING (
  id IN (
    SELECT au.waitlist_submission_id 
    FROM public.approved_users au 
    WHERE au.setup_token IS NOT NULL 
    AND au.account_created = false 
    AND au.expires_at > now()
  )
);