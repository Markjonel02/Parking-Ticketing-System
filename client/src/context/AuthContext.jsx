// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { tokenStorage } from '../services/storage/tokenStorage.js';
import { authApi } from '../services/api/authApi.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStorage.getUser());
  const [token, setToken] = useState(() => tokenStorage.getToken());
  const [isLoading, setIsLoading] = useState(true);

  // Load active session
  useEffect(() => {
    async function initAuth() {
      const storedToken = tokenStorage.getToken();
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res?.data) {
            setUser(res.data);
            tokenStorage.setUser(res.data);
          }
        } catch (err) {
          console.warn('Session verification fallback to demo admin profile', err);
          // If network failed or unauthenticated, provide demo admin session
          if (!user) {
            const fallbackUser = {
              id: 'usr-admin-01',
              name: 'Marcus Vance',
              email: 'admin@parkguard.gov',
              role: 'ADMIN',
              badgeNumber: 'AD-9001',
              department: 'Metropolitan Parking Authority',
              status: 'ACTIVE'
            };
            setUser(fallbackUser);
            tokenStorage.setUser(fallbackUser);
            tokenStorage.setToken('usr-admin-01');
          }
        }
      } else {
        // Provide convenient initial login session for live applet exploration
        const defaultUser = {
          id: 'usr-admin-01',
          name: 'Marcus Vance',
          email: 'admin@parkguard.gov',
          role: 'ADMIN',
          badgeNumber: 'AD-9001',
          department: 'Metropolitan Parking Authority',
          status: 'ACTIVE'
        };
        setUser(defaultUser);
        tokenStorage.setUser(defaultUser);
        tokenStorage.setToken('usr-admin-01');
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { user: authedUser, token: authToken } = response.data;
      setUser(authedUser);
      setToken(authToken);
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
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      tokenStorage.clear();
    }
  }, []);

  const switchDemoRole = useCallback((role) => {
    const roleProfiles = {
      ADMIN: {
        id: 'usr-admin-01',
        name: 'Marcus Vance',
        email: 'admin@parkguard.gov',
        role: 'ADMIN',
        badgeNumber: 'AD-9001',
        department: 'Metropolitan Parking Authority',
        status: 'ACTIVE'
      },
      OFFICER: {
        id: 'usr-officer-01',
        name: 'Elena Rostova',
        email: 'elena.rostova@parkguard.gov',
        role: 'OFFICER',
        badgeNumber: 'EO-4421',
        department: 'Downtown Enforcement Patrol',
        status: 'ACTIVE'
      },
      SUPERVISOR: {
        id: 'usr-supervisor-01',
        name: 'Sarah Sterling',
        email: 'sarah.sterling@parkguard.gov',
        role: 'SUPERVISOR',
        badgeNumber: 'SV-1020',
        department: 'Citations & Adjudication Board',
        status: 'ACTIVE'
      },
      CASHIER: {
        id: 'usr-cashier-01',
        name: 'Julian Perez',
        email: 'julian.perez@parkguard.gov',
        role: 'CASHIER',
        badgeNumber: 'CS-8890',
        department: 'Treasury & Counter Services',
        status: 'ACTIVE'
      },
      CITIZEN: {
        id: 'usr-citizen-demo',
        name: 'Citizen Public Portal',
        email: 'citizen@example.com',
        role: 'CITIZEN',
        badgeNumber: 'CIT-01',
        department: 'Public Citizen',
        status: 'ACTIVE'
      }
    };

    const target = roleProfiles[role] || roleProfiles.ADMIN;
    setUser(target);
    setToken(target.id);
    tokenStorage.setUser(target);
    tokenStorage.setToken(target.id);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    switchDemoRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
