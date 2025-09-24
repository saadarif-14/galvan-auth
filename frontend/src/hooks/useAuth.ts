import { useState, useEffect } from 'react';
import { authManager } from '@/lib/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(authManager.isAuthenticated());
  const [user, setUser] = useState(authManager.getUser());
  const [isAdmin, setIsAdmin] = useState(authManager.isAdmin());
  const [isUser, setIsUser] = useState(authManager.isUser());

  useEffect(() => {
    // Set initial state
    setIsAuthenticated(authManager.isAuthenticated());
    setUser(authManager.getUser());
    setIsAdmin(authManager.isAdmin());
    setIsUser(authManager.isUser());

    // Listen for auth state changes
    const unsubscribe = authManager.addAuthListener(() => {
      setIsAuthenticated(authManager.isAuthenticated());
      setUser(authManager.getUser());
      setIsAdmin(authManager.isAdmin());
      setIsUser(authManager.isUser());
    });

    return unsubscribe;
  }, []);

  return {
    isAuthenticated,
    user,
    isAdmin,
    isUser,
    login: authManager.login.bind(authManager),
    logout: authManager.logout.bind(authManager),
    ensureValidToken: authManager.ensureValidToken.bind(authManager),
    checkSession: authManager.checkSession.bind(authManager),
  };
}
