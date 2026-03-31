import { createContext, useContext } from "react";

// Shared auth context for the entire app
export const AuthContext = createContext(null);

// Hook helper for consuming auth state
export const useAuth = () => useContext(AuthContext);
