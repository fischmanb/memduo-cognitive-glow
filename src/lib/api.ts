
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
  password: string;
  first_name?: string;
  last_name?: string;
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
        throw new Error('Network error: Unable to connect to the backend server. Please check your internet connection and try again.');
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred during the API request');
    }
  }

  // Health check - try a simple endpoint that should exist
  async healthCheck(): Promise<any> {
    console.log('🏥 Testing backend connectivity...');
    
    try {
      // Try the roles endpoint as it should exist and be accessible
      const response = await fetch(`${API_BASE_URL}/roles/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`📡 Health check response: ${response.status} ${response.statusText}`);
      
      if (response.ok || response.status === 401) {
        // 401 means endpoint exists but needs auth, which is expected
        console.log('✅ Backend is online and accessible');
        return { status: 'online' };
      } else {
        console.warn(`⚠️ Backend responded with status ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      console.error('🔍 This usually means:');
      console.error('   1. Backend server is not running');
      console.error('   2. CORS is blocking the request');
      console.error('   3. Network connectivity issues');
      return null;
    }
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

  // User info
  async getCurrentUser(): Promise<any> {
    return this.request('/auth/me');
  }

  // Get all users (admin only)
  async getUsers(): Promise<any[]> {
    return this.request('/users');
  }

  // Role endpoints
  async getRoles(): Promise<any[]> {
    return this.request('/roles/');
  }

  // Chat endpoints
  async getChatSessions(): Promise<any[]> {
    return this.request('/chat/sessions');
  }

  async sendChatMessage(sessionId: string, message: string): Promise<any> {
    return this.request(`/chat/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Document endpoints
  async getDocuments(): Promise<any[]> {
    return this.request('/documents/');
  }

  async uploadDocument(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('files', file);  // Changed from 'file' to 'files' to match backend

    const token = localStorage.getItem('memduo_token');
    const url = `${API_BASE_URL}/files/upload-files`;
    
    console.log(`🔄 Document upload: POST ${url}`);
    console.log('📁 Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData,
      });

      console.log(`📡 Upload response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.error(`❌ Upload failed with status: ${response.status}`);
        console.error(`❌ Response headers:`, Object.fromEntries(response.headers.entries()));
        
        let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.error('❌ Error response body:', errorData);
          // For 422 errors, look for validation details
          if (response.status === 422 && errorData.detail) {
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
          try {
            const responseText = await response.text();
            console.error('❌ Raw error response text:', responseText);
            errorDetail = responseText || errorDetail;
          } catch (textError) {
            console.error('❌ Could not read response as text:', textError);
          }
        }
        
        throw new Error(errorDetail);
      }

      const result = await response.json();
      console.log('✅ Document upload successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Document upload failed:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: number): Promise<any> {
    return this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Memory endpoints
  async getMemoryStats(): Promise<any> {
    // Use the graph stats endpoint to get node/relationship counts
    return this.request('/rag/graph/stats');
  }

  async getUserMemoryStats(userId: string): Promise<any> {
    // Get user-specific graph stats
    return this.request(`/rag/graph/stats/${userId}`);
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
      body: JSON.stringify({ query }),
    });
  }
}

export const apiClient = new ApiClient();
