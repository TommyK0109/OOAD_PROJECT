// Authentication service for backend API calls
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

class AuthService {
  private tokenKey = 'watchparty_token';
  private userKey = 'watchparty_user';

  // Helper function to handle API responses
  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse(response);

      // Store token and user data
      this.setToken(result.token);
      this.setUser(result.user);

      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Login existing user
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse(response);

      // Store token and user data
      this.setToken(result.token);
      this.setUser(result.user);

      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local logout even if request fails
    } finally {
      // Always clear local storage
      this.clearAuth();
    }
  }

  // Get user profile
  async getProfile(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  }

  // Token management
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // User data management
  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Clear all authentication data
  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Get authorization header for API requests
  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Export singleton instance
export const authService = new AuthService();
