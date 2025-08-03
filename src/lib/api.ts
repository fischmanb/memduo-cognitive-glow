
// API client for MemDuo FastAPI backend
const API_BASE_URL = 'https://api.memduo.com/api/v1';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  machine_name: string;
  contradiction_tolerance: number;
  belief_sensitivity: string;
}

export interface ApiError {
  detail: string;
}

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('memduo_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
    console.log('📦 Request options:', {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          'Referer': window.location.href,
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.error('❌ API Error response:', errorData);
          errorDetail = errorData.detail || errorData.message || errorDetail;
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          console.error('❌ Raw response text:', await response.text().catch(() => 'Could not read response'));
        }
        
        throw new Error(errorDetail);
      }

      const data = await response.json();
      console.log('✅ API Success response:', data);
      return data;
    } catch (error) {
      console.error('🚨 API Request failed:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // Check if this might be a mixed content issue (HTTPS → HTTP)
        if (window.location.protocol === 'https:' && API_BASE_URL.startsWith('http:')) {
          throw new Error('Mixed content error: Cannot make HTTP requests from HTTPS site. Please use HTTPS backend or test on HTTP site.');
        }
        throw new Error('Network error: Unable to connect to the backend server. Please check your internet connection and try again.');
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred during the API request');
    }
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/healthcheck');
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔐 Attempting backend login for:', credentials.email);
    
    // Since the login endpoint itself proves connectivity, skip health check for now

    try {
      const requestBody = JSON.stringify(credentials);
      console.log('📤 Login request details:');
      console.log('🌐 Origin:', window.location.origin);
      console.log('📧 Email:', credentials.email);
      console.log('🔑 Password length:', credentials.password.length);
      console.log('📦 Request body:', requestBody);
      console.log('🔗 Full URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await this.request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: requestBody,
      });
      
      console.log('✅ Backend login successful for:', credentials.email);
      return response;
    } catch (error) {
      console.error('❌ Backend login failed for:', credentials.email);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Full error object:', error);
      
      // Check specific error types
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          console.error('🚫 CORS ERROR: Backend is blocking requests from this domain');
        }
        if (error.message.includes('Incorrect email or password')) {
          console.error('🔐 CREDENTIALS REJECTED: Backend database might not have this user or password changed');
        }
      }
      
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<any> {
    console.log('📝 Attempting backend registration for:', userData.email);
    
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User info - Note: No /users/me endpoint in API docs, using /users/ with auth
  async getCurrentUser(): Promise<any> {
    // The API doesn't have a /users/me endpoint, so we'll need to get user info from token
    // For now, return null and rely on token-based auth
    return null;
  }

  // Get all users (admin only)
  async getUsers(): Promise<any[]> {
    return this.request('/users/');
  }

  // Role endpoints
  // Note: No dedicated roles endpoint in API docs - roles would be part of user data
  async getRoles(): Promise<any[]> {
    // Fallback: return empty array since there's no roles endpoint
    return [];
  }

  // Chat endpoints
  async getChatSessions(): Promise<any[]> {
    return this.request('/chat/sessions');
  }

  async createNewChat(title?: string): Promise<any> {
    return this.request('/chat/new', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Chat' }),
    });
  }

  async getChatSession(sessionId: string): Promise<any> {
    return this.request(`/chat/session/${sessionId}`);
  }

  async deleteChatSession(sessionId: string): Promise<any> {
    return this.request(`/chat/session/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async sendChatMessage(sessionId: string, message: string): Promise<any> {
    return this.request(`/chat/session/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ content: message }),
    });
  }

  async askChatQuestion(sessionId: string, question: string): Promise<any> {
    return this.request(`/chat/session/${sessionId}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  // Document endpoints
  async getDocuments(): Promise<any[]> {
    console.log('📋 API: Getting documents...');
    const result = await this.request<any>('/documents/');
    console.log('📋 API: Documents response:', result);
    // Ensure we always return an array
    return Array.isArray(result) ? result : (result?.documents || []);
  }

  async getDocumentsCount(): Promise<any> {
    return this.request('/documents/count');
  }

  async getDocument(documentId: number): Promise<any> {
    return this.request(`/documents/${documentId}`);
  }

  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('files', file);  // Changed from 'file' to 'files' to match backend

    const token = localStorage.getItem('memduo_token');
    const url = `${API_BASE_URL}/documents/upload`;
    
    console.log(`🔄 Document upload: POST ${url}`);
    console.log('📁 Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });
      
      xhr.addEventListener('load', () => {
        console.log(`📡 Upload response: ${xhr.status} ${xhr.statusText}`);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            console.log('✅ Document upload successful:', result);
            resolve(result);
          } catch (parseError) {
            console.error('❌ Failed to parse response:', parseError);
            reject(new Error('Invalid response format'));
          }
        } else {
          console.error(`❌ Upload failed with status: ${xhr.status}`);
          
          let errorDetail = `HTTP ${xhr.status}: ${xhr.statusText}`;
          
          try {
            const errorData = JSON.parse(xhr.responseText);
            console.error('❌ Error response body:', errorData);
            
            if (xhr.status === 422 && errorData.detail) {
              if (Array.isArray(errorData.detail)) {
                errorDetail = errorData.detail.map((err: any) => 
                  `${err.loc?.join('.') || 'field'}: ${err.msg}`
                ).join(', ');
              } else if (typeof errorData.detail === 'string') {
                errorDetail = errorData.detail;
              } else {
                errorDetail = JSON.stringify(errorData.detail);
              }
            } else {
              errorDetail = errorData.detail || errorData.message || errorData.error || errorDetail;
            }
          } catch (parseError) {
            console.error('❌ Failed to parse error response:', parseError);
            errorDetail = xhr.responseText || errorDetail;
          }
          
          reject(new Error(errorDetail));
        }
      });
      
      xhr.addEventListener('error', () => {
        console.error('❌ Network error during upload');
        reject(new Error('Network error during upload'));
      });
      
      xhr.addEventListener('timeout', () => {
        console.error('❌ Upload timeout');
        reject(new Error('Upload timeout'));
      });
      
      xhr.open('POST', url);
      
      // Set headers
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      // Start upload
      xhr.send(formData);
    });
  }

  async deleteDocument(documentId: number): Promise<any> {
    return this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async retryIndexing(documentId: number): Promise<any> {
    console.log('🔄 Retrying document indexing for ID:', documentId);
    
    return this.request(`/documents/${documentId}/process`, {
      method: 'POST',
    });
  }

  async processPendingDocuments(): Promise<any> {
    return this.request('/documents/process-pending', {
      method: 'POST',
    });
  }

  // Memory endpoints
  async getMemoryStats(): Promise<any> {
    // Use the graph stats endpoint to get node/relationship counts
    return this.request('/rag/graph/stats');
  }

  async getUserMemoryStats(userId: string): Promise<any> {
    // No user-specific stats endpoint in API docs, using general stats
    return this.request('/rag/graph/stats');
  }

  async searchMemory(userId: string, query: string): Promise<any> {
    return this.request(`/memory/search/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getTopConnections(userId: string, limit: number = 10): Promise<any> {
    return this.request(`/memory/top-connections/${userId}?limit=${limit}`);
  }

  // RAG endpoints
  async queryRAG(query: string): Promise<any> {
    return this.request('/rag/query', {
      method: 'POST',
      body: JSON.stringify({ 
        query,
        use_graph_rag: true,
        include_reasoning: true
      }),
    });
  }

  // RAG Document indexing and processing endpoints
  async indexDocument(documentId: number): Promise<any> {
    return this.request(`/rag/index-document/${documentId}`, {
      method: 'POST'
    });
  }

  async processRagPendingDocuments(): Promise<any> {
    return this.request('/rag/process-pending', {
      method: 'POST',
    });
  }

  async deleteDocumentFromIndex(documentId: number): Promise<any> {
    return this.request(`/rag/document/${documentId}`, {
      method: 'DELETE',
    });
  }

  async processAllDocumentsGraph(): Promise<any> {
    return this.request('/rag/graph/process-documents', {
      method: 'POST',
    });
  }

  async getSimilarNodes(query: string): Promise<any> {
    return this.request('/rag/graph/similar/', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async askGraphQuestion(question: string): Promise<any> {
    return this.request('/rag/graph/ask/', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  async getGraphRelationships(): Promise<any> {
    return this.request('/rag/graph/relationships');
  }

  async getProcessingStatus(): Promise<any> {
    return this.request('/rag/graph/process-documents/status');
  }

  async combinedQuery(query: string): Promise<any> {
    return this.request('/rag/combined/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getRagInfo(): Promise<any> {
    return this.request('/rag/');
  }

  // User management endpoints
  async getUser(userId: string): Promise<any> {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<any> {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async activateUser(userId: string): Promise<any> {
    return this.request(`/users/${userId}/activate`, {
      method: 'PATCH',
    });
  }

  async deactivateUser(userId: string): Promise<any> {
    return this.request(`/users/${userId}/deactivate`, {
      method: 'PATCH',
    });
  }

  async searchUsers(query: string): Promise<any> {
    return this.request(`/users/search?q=${encodeURIComponent(query)}`);
  }

  // Memory endpoints  
  async addMessage(userId: string, message: any): Promise<any> {
    return this.request(`/memory/messages/${userId}`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async addMessages(userId: string, messages: any[]): Promise<any> {
    return this.request(`/memory/messages/batch/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  async addText(userId: string, text: string): Promise<any> {
    return this.request(`/memory/text/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async addDocument(userId: string, document: any): Promise<any> {
    return this.request(`/memory/document/${userId}`, {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async addCognitiveObject(userId: string, cognitiveObject: any): Promise<any> {
    return this.request(`/memory/cognitive-objects/${userId}`, {
      method: 'POST',
      body: JSON.stringify(cognitiveObject),
    });
  }

  async getCognitiveObject(userId: string, objectId: string): Promise<any> {
    return this.request(`/memory/cognitive-objects/${userId}/${objectId}`);
  }

  async deleteUserMemory(userId: string): Promise<any> {
    return this.request(`/memory/user/${userId}`, {
      method: 'DELETE',
    });
  }

  async processDocuments(): Promise<any> {
    return this.request('/memory/process-documents', {
      method: 'POST',
    });
  }

  async clearNeo4jData(): Promise<any> {
    return this.request('/memory/clear-neo4j', {
      method: 'POST',
    });
  }

  // Files endpoints (separate from documents)
  async uploadFiles(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const token = localStorage.getItem('memduo_token');
    const url = `${API_BASE_URL}/files/upload-files`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  }

  async processPdfsToMarkdown(): Promise<any> {
    return this.request('/files/process-pdfs-to-markdown', {
      method: 'POST',
    });
  }

  async listFiles(): Promise<any> {
    return this.request('/files/files');
  }

  async deleteFile(filename: string): Promise<any> {
    return this.request(`/files/file/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
  }

  async getFile(filename: string): Promise<any> {
    return this.request(`/files/file/${encodeURIComponent(filename)}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
