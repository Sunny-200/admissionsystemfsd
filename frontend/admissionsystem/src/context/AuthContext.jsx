import { useState } from "react";
import API from "../api/axios";
import { AuthContext } from "./authContext";

// provider
export const AuthProvider = ({ children }) => {
  // Initialize from localStorage once (no effect needed)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Stores JWT + user profile from API response
  const login = ({ token: authToken, user: userData }) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  // Calls signup endpoint with expected fields
  const signup = (payload) => {
    return API.post("/auth/signup", payload);
  };

  // Clears auth state and storage
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{ user, role, isAuthenticated, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

