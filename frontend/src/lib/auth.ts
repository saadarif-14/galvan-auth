'use client';

interface AuthUser {
  id: string;
  role: string;
  type: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  type: string;
}

class AuthManager {
  private static instance: AuthManager;
  private user: AuthUser | null = null;
  private refreshPromise: Promise<AuthResponse> | null = null;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    // Initialize from server-side if available
    if (typeof window !== 'undefined') {
      this.loadUserFromStorage();
      this.setupStorageListener();
    }
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        this.user = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
      this.clearAuth();
    }
  }

  private setupStorageListener(): void {
    // Listen for storage changes (cross-tab synchronization)
    window.addEventListener('storage', (e) => {
      if (e.key === 'auth_user') {
        if (e.newValue === null) {
          // User logged out in another tab
          this.user = null;
          this.notifyListeners();
        } else if (e.newValue) {
          // User logged in in another tab
          try {
            this.user = JSON.parse(e.newValue);
            this.notifyListeners();
          } catch (error) {
            console.error('Failed to parse auth data from storage:', error);
          }
        }
      }
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Add listener for auth state changes
  addAuthListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private saveUserToStorage(user: AuthUser): void {
    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  }

  private clearAuth(): void {
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
    }
    this.notifyListeners();
  }

  async login(email: string, password: string, userType: 'admin' | 'user'): Promise<AuthResponse> {
    const endpoint = userType === 'admin' ? '/auth/admin-login' : '/auth/user-login';
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api'}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    // Store user info (not tokens - they're in HTTP-only cookies)
    this.user = {
      id: data.role, // Using role as ID for now
      role: data.role,
      type: data.type,
    };
    
    this.saveUserToStorage(this.user);
    this.notifyListeners();
    return data;
  }

  async refreshToken(): Promise<AuthResponse> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<AuthResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api'}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      this.clearAuth();
      throw new Error('Token refresh failed');
    }

    const data: AuthResponse = await response.json();
    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  isAdmin(): boolean {
    return this.user?.type === 'admin';
  }

  isUser(): boolean {
    return this.user?.type === 'user';
  }

  getRole(): string | null {
    return this.user?.role || null;
  }

  // Auto-refresh token when it's about to expire
  async ensureValidToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      // Try to refresh the token
      await this.refreshToken();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuth();
      return false;
    }
  }

  // Check if user has valid session without trying to refresh
  async checkSession(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api'}/auth/check`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        this.clearAuth();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Session check failed:', error);
      this.clearAuth();
      return false;
    }
  }
}

export const authManager = AuthManager.getInstance();
export type { AuthUser, AuthResponse };
