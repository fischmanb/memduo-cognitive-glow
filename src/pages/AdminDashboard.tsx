import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  LogOut, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  MessageSquare,
  Database,
  Mail 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WaitlistSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  interest: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
  reviewed_at: string;
  reviewed_by: string;
}

interface FastAPIUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  roles?: string[];
}

const AdminDashboard: React.FC = () => {
  const { logout, user } = useAdminAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<WaitlistSubmission[]>([]);
  const [users, setUsers] = useState<FastAPIUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<WaitlistSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        toast({
          title: "Error",
          description: "Failed to load waitlist submissions",
          variant: "destructive",
        });
        return;
      }

      setSubmissions((data || []) as WaitlistSubmission[]);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load waitlist submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('🔄 Users endpoint not yet implemented - skipping for now');
      // TODO: Uncomment when backend users endpoint is ready
      // const usersData = await apiClient.getUsers();
      // console.log('✅ FastAPI users loaded successfully:', usersData);
      // setUsers(usersData || []);
      setUsers([]); // Empty array until endpoint is implemented
    } catch (error) {
      console.error('❌ Error fetching users from FastAPI:', error);
      console.warn('⚠️ Continuing without FastAPI users - admin dashboard will still work');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchUsers();
  }, []);

  const updateSubmissionStatus = async (
    submissionId: string, 
    status: 'approved' | 'rejected',
    notes: string
  ) => {
    setUpdating(true);
    try {
      // Update submission status
      const { error: updateError } = await supabase
        .from('waitlist_submissions')
        .update({
          status,
          admin_notes: notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (updateError) {
        throw updateError;
      }

      // If approved, send approval email
      if (status === 'approved') {
        const submission = submissions.find(s => s.id === submissionId);
        if (submission) {
          try {
            const { error: emailError } = await supabase.functions.invoke('send-approval-email', {
              body: {
                waitlistSubmissionId: submissionId,
                firstName: submission.first_name,
                lastName: submission.last_name,
                email: submission.email,
              },
            });

            if (emailError) {
              console.error('Error sending approval email:', emailError);
              toast({
                title: "Warning",
                description: `Application approved, but failed to send email: ${emailError.message}`,
                variant: "destructive",
              });
            } else {
              toast({
                title: "Success",
                description: `Application approved and setup email sent to ${submission.email}`,
              });
            }
          } catch (emailError) {
            console.error('Error sending approval email:', emailError);
            toast({
              title: "Warning",
              description: "Application approved, but failed to send email",
              variant: "destructive",
            });
          }
        }
      } else {
        toast({
          title: "Success",
          description: `Application ${status} successfully`,
        });
      }

      // Refresh submissions
      await fetchSubmissions();
      setSelectedSubmission(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const resendApprovalEmail = async (submission: any) => {
    setUpdating(true);
    try {
      const { error: emailError } = await supabase.functions.invoke('send-approval-email', {
        body: {
          waitlistSubmissionId: submission.id,
          firstName: submission.first_name,
          lastName: submission.last_name,
          email: submission.email,
        },
      });

      if (emailError) {
        console.error('Error resending approval email:', emailError);
        toast({
          title: "Error",
          description: `Failed to resend email: ${emailError.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Setup email resent to ${submission.email}`,
        });
      }
    } catch (error) {
      console.error('Error resending approval email:', error);
      toast({
        title: "Error",
        description: "Failed to resend email",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Backend Users</CardTitle>
              <Database className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="waitlist" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="waitlist" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Waitlist Applications
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              FastAPI Users
            </TabsTrigger>
          </TabsList>

          {/* Waitlist Tab */}
          <TabsContent value="waitlist">
            <Card>
              <CardHeader>
                <CardTitle>Waitlist Applications</CardTitle>
                <CardDescription>
                  Review and manage all waitlist submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">
                            {submission.first_name} {submission.last_name}
                          </TableCell>
                          <TableCell>{submission.email}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {submission.interest || 'No interest specified'}
                          </TableCell>
                          <TableCell>{getStatusBadge(submission.status)}</TableCell>
                          <TableCell>
                            {new Date(submission.created_at).toLocaleDateString()}
                          </TableCell>
                           <TableCell>
                             <div className="flex space-x-2">
                               <Dialog>
                                 <DialogTrigger asChild>
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => {
                                       setSelectedSubmission(submission);
                                       setAdminNotes(submission.admin_notes || '');
                                     }}
                                   >
                                     <Eye className="h-4 w-4 mr-1" />
                                     Review
                                   </Button>
                                 </DialogTrigger>
                                 <DialogContent className="max-w-2xl">
                                   <DialogHeader>
                                     <DialogTitle>Review Application</DialogTitle>
                                     <DialogDescription>
                                       Review and update the status of this waitlist application
                                     </DialogDescription>
                                   </DialogHeader>
                                   
                                   {selectedSubmission && (
                                     <div className="space-y-4">
                                       <div className="grid grid-cols-2 gap-4">
                                         <div>
                                           <label className="text-sm font-medium">Name</label>
                                           <p className="text-sm text-muted-foreground">
                                             {selectedSubmission.first_name} {selectedSubmission.last_name}
                                           </p>
                                         </div>
                                         <div>
                                           <label className="text-sm font-medium">Email</label>
                                           <p className="text-sm text-muted-foreground">
                                             {selectedSubmission.email}
                                           </p>
                                         </div>
                                       </div>

                                       <div>
                                         <label className="text-sm font-medium">Interest/Message</label>
                                         <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                                           {selectedSubmission.interest || 'No message provided'}
                                         </p>
                                       </div>

                                       <div>
                                         <label className="text-sm font-medium">Current Status</label>
                                         <div className="mt-1">
                                           {getStatusBadge(selectedSubmission.status)}
                                         </div>
                                       </div>

                                       <div>
                                         <label className="text-sm font-medium">Admin Notes</label>
                                         <Textarea
                                           placeholder="Add notes about this application..."
                                           value={adminNotes}
                                           onChange={(e) => setAdminNotes(e.target.value)}
                                           className="mt-1"
                                           rows={3}
                                         />
                                       </div>

                                       <div className="flex space-x-2 pt-4">
                                         <Button
                                           onClick={() => updateSubmissionStatus(
                                             selectedSubmission.id,
                                             'approved',
                                             adminNotes
                                           )}
                                           disabled={updating}
                                           className="bg-green-600 hover:bg-green-700"
                                         >
                                           <CheckCircle className="h-4 w-4 mr-1" />
                                           Approve
                                         </Button>
                                         <Button
                                           onClick={() => updateSubmissionStatus(
                                             selectedSubmission.id,
                                             'rejected',
                                             adminNotes
                                           )}
                                           disabled={updating}
                                           variant="destructive"
                                         >
                                           <XCircle className="h-4 w-4 mr-1" />
                                           Reject
                                         </Button>
                                         {selectedSubmission.status === 'approved' && (
                                           <Button
                                             onClick={() => resendApprovalEmail(selectedSubmission)}
                                             disabled={updating}
                                             variant="outline"
                                             className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                           >
                                             <Mail className="h-4 w-4 mr-1" />
                                             Resend Email
                                           </Button>
                                         )}
                                       </div>
                                     </div>
                                   )}
                                 </DialogContent>
                               </Dialog>
                               
                               {submission.status === 'approved' && (
                                 <Button
                                   onClick={() => resendApprovalEmail(submission)}
                                   disabled={updating}
                                   variant="outline"
                                   size="sm"
                                   className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                 >
                                   <Mail className="h-4 w-4 mr-1" />
                                   Resend
                                 </Button>
                               )}
                             </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {submissions.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No submissions yet</h3>
                    <p className="text-muted-foreground">
                      Waitlist applications will appear here when users submit them.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FastAPI Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>FastAPI Backend Users</CardTitle>
                <CardDescription>
                  View all registered users from your FastAPI backend
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading users...</span>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-mono text-xs">
                                {user.id.slice(0, 8)}...
                              </TableCell>
                              <TableCell className="font-medium">
                                {user.first_name && user.last_name 
                                  ? `${user.first_name} ${user.last_name}`
                                  : 'N/A'
                                }
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {user.roles && user.roles.length > 0 ? (
                                  <div className="flex gap-1">
                                    {user.roles.map((role, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {role}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">No roles</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {users.length === 0 && (
                      <div className="text-center py-12">
                        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
                        <p className="text-muted-foreground">
                          No users were loaded from the FastAPI backend.
                        </p>
                        <Button
                          onClick={fetchUsers}
                          variant="outline"
                          className="mt-4"
                        >
                          Retry Loading Users
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;