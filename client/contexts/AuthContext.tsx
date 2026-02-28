import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

import { Platform } from "react-native";
import auth from "@react-native-firebase/auth"
import { User, Student, Driver, AuthState, LoginCredentials, LoginResponse } from "@/types";
import { getApiUrl } from "@/lib/query-client";
import * as SecureStore from 'expo-secure-store';
interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "busnaama_auth_token";
const USER_KEY = "busnaama_user";

const setSecureItem = async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
}

const getSecureItem = async (key: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(key);
}
const deleteSecureItem = async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
}

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        student: null,
        driver: null,
        token: null,
        isLoading: true,
        isAuthenticated: false,
    });

  const loadStoredAuth = useCallback(async () => {
    try {
      const token = await getSecureItem(TOKEN_KEY);
      const userJson = await getSecureItem(USER_KEY);

      if (token && userJson) {
        const userData = JSON.parse(userJson);
        setState({
          user: userData.user,
          student: userData.student || null,
          driver: userData.driver || null,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

useEffect(() => {
  const unsubscribe = auth().onAuthStateChanged(async user => {
    if (user === null) {
      const storedToken = await getSecureItem(TOKEN_KEY);

      if (storedToken) {
        await deleteSecureItem(TOKEN_KEY);
        await deleteSecureItem(USER_KEY);

        setState({
          user: null,
          student: null,
          driver: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    }
  });

  return unsubscribe;
}, []);
  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);


  const login = async (credentials: LoginCredentials) => {
    const baseUrl = getApiUrl();

    const response = await fetch(
      new URL("/api/auth/login/", baseUrl).href,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }
    );

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();

    // save token first
    await setSecureItem(TOKEN_KEY, data.token);
    await auth().signInWithCustomToken(data.firebase_token);
    
    setState({
      user: null,
      student: null,
      driver: null,
      token: data.token,
      isAuthenticated: true,
      isLoading: false,
    });

    // pass token directly
    await refreshUser(data.token);

  };

    const logout = async () => {
        try {
            if (state.token) {
                const baseUrl = getApiUrl();
                await fetch(new URL("/api/auth/logout/", baseUrl).href, {
                    method: "POST",
                    headers: {
                        Authorization: `Token ${state.token}`,
                    },
                }).catch(() => { });
            }
            await auth().signOut();
            await deleteSecureItem(TOKEN_KEY);
            await deleteSecureItem(USER_KEY);

            setState({
                user: null,
                student: null,
                driver: null,
                token: null,
                isLoading: false,
                isAuthenticated: false,
            });
        } catch (error) {
            console.error("Logout error:", error);
            setState({
                user: null,
                student: null,
                driver: null,
                token: null,
                isLoading: false,
                isAuthenticated: false,
            });
        }
    };



    const refreshUser = async (tokenParam?: string) => {
        const token = tokenParam || state.token;
        if (!token) return;

        const baseUrl = getApiUrl();
        const response = await fetch(new URL("/api/auth/me/", baseUrl).href, {
            headers: { Authorization: `Token ${token}` },
        });

        if (!response.ok) return;

        const data = await response.json();

        const user = data;
        const student = data.student || null;
        const driver = data.driver || null;
        
        await setSecureItem(USER_KEY, JSON.stringify({ user, student, driver }));

        setState((prev) => ({ ...prev, user, student, driver }));
    };
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used strictly within an <AuthProvider> boundary.");
  }
  return context; 
};
export {AuthProvider, useAuth};