import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Download,
  RotateCcw,
  X
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

interface Document {
  id: number;
  filename: string;
  content_type: string;
  file_size: number;
  status: string;
  created_at: string;
  processed_at?: string;
  error_message?: string;
  is_indexed: boolean;
}

interface UploadProgress {
  file: File;
  progress: number;
  id: string;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const KnowledgeBase = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isBackendAuth } = useAuth();

  // Load documents on component mount
  React.useEffect(() => {
    if (isBackendAuth) {
      loadDocuments();
    }
  }, [isBackendAuth]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading documents...');
      const response = await apiClient.getDocuments();
      console.log('📋 Raw response:', response);
      
      const docs = Array.isArray(response) ? response : (response as any)?.documents || [];
      console.log(`📋 Processed documents: ${docs.length} items`);
      console.log('📋 Document list:', docs.map(d => ({ id: d.id, filename: d.filename, status: d.status })));
      
      setDocuments(docs);
    } catch (error) {
      console.error('❌ Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem('memduo_token');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in again to upload documents",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      console.log(`📤 Uploading ${files.length} file(s)...`);
      
      // Initialize upload progress for each file
      const initialProgress: UploadProgress[] = Array.from(files).map((file) => ({
        file,
        progress: 0,
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'uploading' as const
      }));
      
      setUploadProgress(initialProgress);
      
      // Upload files with progress tracking
      const uploadPromises = initialProgress.map(async (progressItem) => {
        try {
          console.log(`📄 Uploading: "${progressItem.file.name}" (${progressItem.file.size} bytes)`);
          
          const result = await apiClient.uploadDocument(
            progressItem.file,
            (progress) => {
              setUploadProgress(prev => 
                prev.map(item => 
                  item.id === progressItem.id 
                    ? { ...item, progress }
                    : item
                )
              );
            }
          );
          
          console.log(`✅ Upload result for "${progressItem.file.name}":`, result);
          
          // Mark as completed
          setUploadProgress(prev => 
            prev.map(item => 
              item.id === progressItem.id 
                ? { ...item, status: 'completed' as const, progress: 100 }
                : item
            )
          );
          
          return { file: progressItem.file, result };
        } catch (error) {
          console.error(`❌ Upload failed for "${progressItem.file.name}":`, error);
          
          // Mark as error
          setUploadProgress(prev => 
            prev.map(item => 
              item.id === progressItem.id 
                ? { 
                    ...item, 
                    status: 'error' as const, 
                    error: error instanceof Error ? error.message : 'Upload failed' 
                  }
                : item
            )
          );
          
          throw error;
        }
      });
      
      const results = await Promise.allSettled(uploadPromises);
      console.log('📤 All uploads completed:', results);
      
      // Process successful uploads
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<{file: File, result: any}> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
      
      // Add uploaded documents directly to UI state
      const newDocuments = successfulResults.map(({ file, result }) => ({
        id: result.id || Date.now() + Math.random(), // Fallback ID
        filename: file.name,
        file_size: file.size,
        content_type: file.type,
        status: 'pending',
        is_indexed: false,
        created_at: new Date().toISOString(),
        ...result // Override with actual backend response
      }));
      
      // Update UI immediately with new documents
      setDocuments(prev => [...newDocuments, ...prev]);
      
      // Show success message
      const successCount = successfulResults.length;
      const failCount = files.length - successCount;
      
      if (successCount > 0) {
        toast({
          title: "Upload Successful",
          description: `${successCount} file(s) uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        });
      }
      
      if (failCount > 0) {
        toast({
          title: "Some uploads failed",
          description: `${failCount} file(s) failed to upload. Check the upload progress for details.`,
          variant: "destructive"
        });
      }
      
      // Clear upload progress after a delay
      setTimeout(() => {
        setUploadProgress([]);
      }, 3000);

      // Smart background sync that preserves optimistic updates
      setTimeout(async () => {
        try {
          const backendDocs = await apiClient.getDocuments();
          const backendArray = Array.isArray(backendDocs) ? backendDocs : (backendDocs as any)?.documents || [];
          
          // Merge: keep optimistic docs that aren't in backend yet, update ones that are
          setDocuments(prev => {
            const optimisticIds = newDocuments.map(d => d.filename);
            const backendDocsWithSameNames = backendArray.filter(bd => 
              optimisticIds.includes(bd.filename)
            );
            
            // If backend has our uploaded docs, replace optimistic with real data
            if (backendDocsWithSameNames.length > 0) {
              const updatedDocs = prev.map(doc => {
                const backendMatch = backendArray.find(bd => bd.filename === doc.filename);
                return backendMatch || doc;
              });
              // Add any backend docs we don't have
              const newBackendDocs = backendArray.filter(bd => 
                !prev.find(pd => pd.filename === bd.filename)
              );
              return [...updatedDocs, ...newBackendDocs];
            }
            
            // Backend doesn't have our docs yet, keep optimistic updates
            return prev;
          });
        } catch (error) {
          console.error('Background sync failed:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error during upload:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive"
      });
      
      // Clear upload progress on error
      setUploadProgress([]);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const cancelUpload = (uploadId: string) => {
    setUploadProgress(prev => prev.filter(item => item.id !== uploadId));
  };

  const deleteDocument = async (documentId: number) => {
    try {
      await apiClient.deleteDocument(documentId);

      toast({
        title: "Document Deleted",
        description: "Document removed successfully",
      });

      await loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const retryProcessing = async (documentId: number) => {
    try {
      await apiClient.retryIndexing(documentId);
      
      toast({
        title: "Retry Initiated",
        description: "Document indexing has been restarted",
      });
      
      await loadDocuments();
    } catch (error) {
      console.error('Error retrying document processing:', error);
      toast({
        title: "Retry Failed",
        description: error instanceof Error ? error.message : "Failed to retry document processing",
        variant: "destructive"
      });
    }
  };

  const indexDocument = async (documentId: number) => {
    try {
      const result = await apiClient.indexDocument(documentId);
      console.log('Document indexed:', result);

      toast({
        title: "Indexing Started",
        description: "Document indexing has been initiated",
      });

      // Refresh the documents list to update status
      await loadDocuments();
    } catch (error) {
      console.error('🚨 Error indexing document:', error);
      
      let errorMessage = "Failed to index document";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more helpful error messages
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = "You don't have permission to index this document.";
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = "Document not found or indexing endpoint unavailable.";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error occurred while indexing. Please try again later.";
        } else if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
      }
      
      toast({
        title: "Indexing Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, isIndexed: boolean) => {
    if (status === 'completed' && isIndexed) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Indexed</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'uploaded':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Uploaded</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Ready to Index</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">{status || 'Unknown'}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function to determine if a document can be safely deleted
  const canDeleteDocument = (status: string, isIndexed: boolean) => {
    // Only allow deletion for failed documents or documents that haven't been processed yet
    return status === 'failed' || status === 'pending' || status === 'uploaded';
  };

  const getDeleteTooltipMessage = (status: string, isIndexed: boolean) => {
    if (status === 'processing') {
      return "Cannot delete document while processing";
    }
    if (status === 'completed' || isIndexed) {
      return "Cannot delete indexed documents - this would break graph connections";
    }
    if (status === 'uploaded') {
      return "Delete this uploaded document";
    }
    return "Delete this document";
  };

  if (!isBackendAuth) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Backend Access Required</h2>
          <p className="text-gray-400">Knowledge Base requires full backend access to manage documents.</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Knowledge Base
              </h1>
              <p className="text-muted-foreground">
                Upload and manage documents for your GraphRAG system
              </p>
            </div>
            
            {/* Upload Button */}
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.md,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="neural-glass-premium"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {uploading ? 'Uploading...' : 'Upload Documents'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="neural-glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Documents</p>
                    <p className="text-2xl font-bold text-white">{documents.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="neural-glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Indexed</p>
                    <p className="text-2xl font-bold text-white">
                      {documents.filter(d => d.is_indexed).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="neural-glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Processing</p>
                    <p className="text-2xl font-bold text-white">
                      {documents.filter(d => d.status === 'processing').length}
                    </p>
                  </div>
                  <Loader2 className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="neural-glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Failed</p>
                    <p className="text-2xl font-bold text-white">
                      {documents.filter(d => d.status === 'failed').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 neural-glass"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="neural-glass px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <Card className="neural-glass border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Upload className="mr-2 h-5 w-5 text-blue-400" />
                Upload Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {uploadProgress.map((upload) => (
                <div key={upload.id} className="neural-glass rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {upload.file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(upload.file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {upload.status === 'uploading' && (
                        <>
                          <span className="text-sm text-blue-400 font-medium">
                            {upload.progress}%
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelUpload(upload.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {upload.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                      {upload.status === 'error' && (
                        <Tooltip>
                          <TooltipTrigger>
                            <XCircle className="h-4 w-4 text-red-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{upload.error}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress 
                      value={upload.progress} 
                      className={`h-2 ${
                        upload.status === 'completed' ? 'bg-green-500/20' :
                        upload.status === 'error' ? 'bg-red-500/20' :
                        'bg-blue-500/20'
                      }`}
                    />
                    {upload.status === 'error' && upload.error && (
                      <p className="text-xs text-red-400 mt-1">{upload.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Documents List */}
        <Card className="neural-glass-premium">
          <CardHeader>
            <CardTitle className="text-white">Documents</CardTitle>
            <CardDescription>
              Manage your uploaded documents and their processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400 mr-2" />
                <span className="text-gray-400">Loading documents...</span>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Upload your first document to get started'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="neural-glass-hover"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 neural-glass rounded-lg">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="p-2 neural-glass rounded-lg flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3 className="text-sm font-medium text-white truncate cursor-help">
                              {doc.filename}
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-md">
                            <p className="text-sm break-words">{doc.filename}</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">
                            {formatFileSize(doc.file_size)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(doc.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        {getStatusBadge(doc.status, doc.is_indexed)}
                        
                        {doc.status === 'completed' && !doc.is_indexed && (
                          <Button
                            size="sm"
                            onClick={() => indexDocument(doc.id)}
                            className="neural-glass-hover"
                          >
                            Index for Search
                          </Button>
                        )}
                        
                        {doc.status === 'failed' && (
                          <Button
                            size="sm"
                            onClick={() => retryProcessing(doc.id)}
                            className="neural-glass-hover"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}
                        
                        {canDeleteDocument(doc.status, doc.is_indexed) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteDocument(doc.id)}
                                className="neural-glass-hover"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getDeleteTooltipMessage(doc.status, doc.is_indexed)}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default KnowledgeBase;
