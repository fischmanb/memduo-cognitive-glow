-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view other admins" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view all waitlist submissions" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Admins can update waitlist submissions" ON public.waitlist_submissions;

-- Create a security definer function to check admin status (prevents recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate admin_users policies using the security definer function
CREATE POLICY "Admins can view other admins" 
ON public.admin_users 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

-- Recreate waitlist_submissions policies using the security definer function  
CREATE POLICY "Admins can view all waitlist submissions" 
ON public.waitlist_submissions 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update waitlist submissions" 
ON public.waitlist_submissions 
FOR UPDATE 
USING (public.is_admin(auth.uid()));