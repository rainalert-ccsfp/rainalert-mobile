import React, { createContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginUser,
  registerUser,
  forgotPasswordAPI,
  resetPasswordAPI,
} from "../services/api";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  login_method: string;
  status: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (full_name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  register: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  logout: () => {},
  loading: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const authStatus = await AsyncStorage.getItem("isAuthenticated");
      
      if (userData && authStatus === "true") {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Basic validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      const res = await loginUser({ email, password });
      
      if (res.status === 200 && res.data.user) {
        const userData = res.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store authentication data
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        await AsyncStorage.setItem("isAuthenticated", "true");
      } else {
        throw new Error(res.data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle specific error types
      if (error.message.includes("Network error")) {
        throw new Error("Unable to connect to server. Please check your internet connection.");
      } else if (error.message.includes("timeout")) {
        throw new Error("Request timed out. Please try again.");
      } else if (error.response?.status === 401) {
        throw new Error("Invalid email or password");
      } else if (error.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(error.response?.data?.message || error.message || "Login failed. Please try again.");
      }
    }
  };

  const register = async (full_name: string, email: string, password: string) => {
    try {
      // Basic validation
      if (!full_name || !email || !password) {
        throw new Error("All fields are required");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Password validation
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const userData = {
        full_name,
        email,
        password,
      };
      
      const res = await registerUser(userData);
      
      if (res.status !== 200) {
        throw new Error(res.data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle specific error types
      if (error.message.includes("Network error")) {
        throw new Error("Unable to connect to server. Please check your internet connection.");
      } else if (error.message.includes("timeout")) {
        throw new Error("Request timed out. Please try again.");
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes("already exists")) {
        throw new Error("An account with this email already exists");
      } else if (error.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(error.response?.data?.message || error.message || "Failed to create account. Please try again.");
      }
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await forgotPasswordAPI({ email });
      
      if (res.status !== 200) {
        throw new Error(res.data.message || "Failed to process request");
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      throw new Error(error.response?.data?.message || "Failed to process request");
    }
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      const res = await resetPasswordAPI({ email, newPassword });
      
      if (res.status !== 200) {
        throw new Error(res.data.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw new Error(error.response?.data?.message || "Failed to reset password");
    }
  };

  const logout = async () => {
    try {
      // Clear user state first
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear stored authentication data
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("isAuthenticated");
      
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if AsyncStorage fails, we should still clear the state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
