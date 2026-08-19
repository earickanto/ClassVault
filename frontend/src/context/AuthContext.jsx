import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { setAuthToken } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('classvault_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('classvault_token') || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(username, password);
      if (res.success && res.data) {
        const { accessToken, refreshToken, ...userData } = res.data;
        setToken(accessToken);
        setAuthToken(accessToken);
        setUser(userData);
        localStorage.setItem('classvault_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('classvault_refresh_token', refreshToken);
        }
        localStorage.setItem('classvault_user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, message: res.message || 'Access Denied' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Access Denied: Invalid credentials or unknown account';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async ({ oldPassword, newPassword }) => {
    setLoading(true);
    try {
      const res = await authApi.changePassword({ oldPassword, newPassword });
      if (res.success) {
        const updatedUser = user ? { ...user, firstLogin: false } : null;
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem('classvault_user', JSON.stringify(updatedUser));
        }
        return { success: true };
      } else {
        return { success: false, message: res.message || 'Password change failed' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to change password';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const activateAccount = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.activateAccount(data);
      if (res.success && res.data) {
        const { accessToken, refreshToken, ...userData } = res.data;
        setToken(accessToken);
        setAuthToken(accessToken);
        setUser(userData);
        localStorage.setItem('classvault_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('classvault_refresh_token', refreshToken);
        }
        localStorage.setItem('classvault_user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, message: res.message || 'Activation failed' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Access Denied: Account activation rejected';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('classvault_token');
    localStorage.removeItem('classvault_refresh_token');
    localStorage.removeItem('classvault_user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        changePassword,
        activateAccount,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
