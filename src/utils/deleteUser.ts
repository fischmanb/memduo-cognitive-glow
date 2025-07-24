import { apiClient } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

export async function deleteBackendUserAndCleanup(email: string) {
  try {
    console.log(`🔍 Starting cleanup for user: ${email}`);
    
    // 1. Try to search and delete backend user (don't fail if this doesn't work)
    try {
      console.log(`🔍 Searching for backend user: ${email}`);
      const searchResults = await apiClient.searchUsers(email);
      console.log('Search results:', searchResults);
      
      if (searchResults && searchResults.length > 0) {
        const user = searchResults.find((u: any) => u.email === email);
        if (user) {
          console.log(`🗑️ Deleting backend user: ${user.id}`);
          await apiClient.deleteUser(user.id);
          console.log('✅ Backend user deleted successfully');
        } else {
          console.log('ℹ️ User found in search but email does not match exactly');
        }
      } else {
        console.log('ℹ️ No backend user found with that email');
      }
    } catch (backendError) {
      console.warn('⚠️ Backend user deletion failed (continuing anyway):', backendError);
      // Don't fail the whole process - continue with Supabase cleanup
    }

    // 2. Get waitlist submission ID first
    console.log('🔍 Getting waitlist submission ID...');
    const { data: waitlistData, error: waitlistQueryError } = await supabase
      .from('waitlist_submissions')
      .select('id')
      .eq('email', email)
      .single();

    if (waitlistQueryError || !waitlistData) {
      throw new Error(`Failed to find waitlist submission: ${waitlistQueryError?.message}`);
    }

    const waitlistId = waitlistData.id;
    console.log('✅ Found waitlist submission ID:', waitlistId);

    // 3. Clean up approved_users table entries
    console.log('🧹 Cleaning up approved_users entries...');
    const { error: deleteApprovedError } = await supabase
      .from('approved_users')
      .delete()
      .eq('waitlist_submission_id', waitlistId);

    if (deleteApprovedError) {
      console.error('Error deleting approved_users:', deleteApprovedError);
      // Don't fail - this might just mean no entries exist
    } else {
      console.log('✅ Approved users entries cleaned up');
    }

    // 4. Reset waitlist status back to pending
    console.log('🔄 Resetting waitlist status to pending...');
    const { error: statusError } = await supabase
      .from('waitlist_submissions')
      .update({ 
        status: 'pending',
        reviewed_at: null,
        reviewed_by: null,
        admin_notes: null,
        last_login_at: null
      })
      .eq('email', email);

    if (statusError) {
      throw new Error(`Failed to reset status: ${statusError.message}`);
    }

    console.log('✅ Waitlist status reset to pending');
    return { success: true, message: 'User cleanup completed successfully' };
    
  } catch (error: any) {
    console.error('❌ Error during user cleanup:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred',
      details: error
    };
  }
}

// Function to call from console
(window as any).deleteUserCleanup = deleteBackendUserAndCleanup;