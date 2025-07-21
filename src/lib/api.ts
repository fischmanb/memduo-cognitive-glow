
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
      // Try the base API endpoint instead of /health since /health doesn't exist
      const result = await this.request('/');
      console.log('✅ Backend health check passed');
      return result;
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      // Don't fail completely if health check fails - just log it
      return null;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔐 Attempting backend login for:', credentials.email);
    
    // Since the login endpoint itself proves connectivity, skip health check for now

    try {
      const response = await this.request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      console.log('✅ Backend login successful for:', credentials.email);
      return response;
    } catch (error) {
      console.error('❌ Backend login failed for:', credentials.email, error);
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
    formData.append('file', file);

    const token = localStorage.getItem('memduo_token');
    const url = `${API_BASE_URL}/documents/upload`;
    
    console.log(`🔄 Document upload: POST ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      console.log(`📡 Upload response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({ 
          detail: 'Upload failed' 
        }));
        throw new Error(error.detail || 'Upload failed');
      }

      const result = await response.json();
      console.log('✅ Document upload successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Document upload failed:', error);
      throw error;
    }
  }

  // Memory endpoints
  async getMemories(): Promise<any[]> {
    return this.request('/memory/');
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
