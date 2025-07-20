// API client for MemDuo FastAPI backend
const API_BASE_URL = 'https://3.144.130.186:8000/api/v1';

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
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ 
        detail: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<any> {
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
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ 
        detail: 'Upload failed' 
      }));
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
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

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();