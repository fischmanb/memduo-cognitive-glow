import { apiClient } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

export async function deleteBackendUserAndCleanup(email: string) {
  try {
    // 1. Search for the user in the backend
    console.log(`🔍 Searching for user: ${email}`);
    const searchResults = await apiClient.searchUsers(email);
    console.log('Search results:', searchResults);
    
    if (searchResults && searchResults.length > 0) {
      const user = searchResults.find((u: any) => u.email === email);
      if (user) {
        console.log(`🗑️ Deleting backend user: ${user.id}`);
        await apiClient.deleteUser(user.id);
        console.log('✅ Backend user deleted successfully');
      }
    } else {
      console.log('ℹ️ No backend user found with that email');
    }

    // 2. Clean up approved_users table entries
    console.log('🧹 Cleaning up approved_users entries...');
    const { error: deleteApprovedError } = await supabase
      .from('approved_users')
      .delete()
      .eq('waitlist_submission_id', (
        await supabase
          .from('waitlist_submissions')
          .select('id')
          .eq('email', email)
          .single()
      ).data?.id);

    if (deleteApprovedError) {
      console.error('Error deleting approved_users:', deleteApprovedError);
    } else {
      console.log('✅ Approved users entries cleaned up');
    }

    // 3. Reset waitlist status back to pending
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
      console.error('Error resetting status:', statusError);
    } else {
      console.log('✅ Waitlist status reset to pending');
    }

    return { success: true, message: 'User cleanup completed successfully' };
  } catch (error) {
    console.error('❌ Error during user cleanup:', error);
    return { success: false, error };
  }
}

// Function to call from console
(window as any).deleteUserCleanup = deleteBackendUserAndCleanup;