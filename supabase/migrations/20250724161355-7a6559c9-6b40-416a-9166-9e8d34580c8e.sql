-- Reset the user state so the proper flow can be tested
DELETE FROM auth.users WHERE email = 'fischmanb@gmail.com';

-- Reset all the approved_users records to unused state  
UPDATE approved_users 
SET account_created = false 
WHERE waitlist_submission_id = '0c1d207f-0a56-4d31-ab6d-d5c57c569e86';