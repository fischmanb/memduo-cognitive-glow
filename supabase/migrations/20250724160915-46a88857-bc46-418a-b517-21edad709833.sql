-- Mark all setup records for this user as used since account exists
UPDATE approved_users 
SET account_created = true 
WHERE waitlist_submission_id = '0c1d207f-0a56-4d31-ab6d-d5c57c569e86';

-- Confirm the existing user account since we disabled email confirmation
UPDATE auth.users 
SET email_confirmed_at = now(), confirmed_at = now() 
WHERE email = 'fischmanb@gmail.com';