import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Download
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

const KnowledgeBase = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      const response = await apiClient.getDocuments();
      setDocuments(Array.isArray(response) ? response : (response as any)?.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
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

    try {
      setUploading(true);
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      // Use apiClient to upload documents
      const uploadUrl = `https://api.memduo.com/api/v1/documents/upload`;
      const token = localStorage.getItem('memduo_token');
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded successfully`,
      });

      // Reload documents
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const indexDocument = async (documentId: number) => {
    try {
      const response = await fetch(`https://api.memduo.com/api/v1/rag/index-document/${documentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('memduo_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Indexing failed');
      }

      toast({
        title: "Indexing Started",
        description: "Document is being processed for search",
      });

      // Reload documents to update status
      await loadDocuments();
    } catch (error) {
      console.error('Error indexing document:', error);
      toast({
        title: "Indexing Failed",
        description: "Failed to index document",
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
      case 'processing':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Ready to Index</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>;
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
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-2 neural-glass rounded-lg">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        {doc.filename}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-400">
                          {formatFileSize(doc.file_size)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(doc.created_at)}
                        </span>
                        {doc.error_message && (
                          <span className="text-xs text-red-400" title={doc.error_message}>
                            Error occurred
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBase;