// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { tokenStorage } from '../services/storage/tokenStorage.js';
import { authApi } from '../services/api/authApi.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: if a token is stored, verify it against the server. There is
  // no fallback/demo account — an invalid or missing token simply means
  // the user is signed out and sees the real login screen.
  useEffect(() => {
    async function restoreSession() {
      const storedToken = tokenStorage.getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        setUser(res.data);
        tokenStorage.setUser(res.data);
      } catch {
        // Token is invalid/expired/revoked — clear it and require a real login.
        tokenStorage.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { user: authedUser, token: authToken } = response.data;
      setUser(authedUser);
      tokenStorage.setUser(authedUser);
      tokenStorage.setToken(authToken);
      return { success: true, user: authedUser };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails, still clear the local session.
    } finally {
      setUser(null);
      tokenStorage.clear();
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
