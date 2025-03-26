import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Simuler ou implémenter les fonctions d'authentification
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Appel à Firebase Auth serait ici
      const mockUser = {
        id: `user_${Date.now()}`,
        username: email.split('@')[0],
        email,
        profilePicture: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`
      };
      setUser(mockUser);
      localStorage.setItem("musicExplorerUser", JSON.stringify(mockUser));
    } catch (error) {
      console.error('Erreur de connexion :', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      // Appel à Firebase Auth serait ici
      const mockUser = {
        id: `user_${Date.now()}`,
        username,
        email,
        profilePicture: `https://ui-avatars.com/api/?name=${username}&background=random`
      };
      setUser(mockUser);
      localStorage.setItem("musicExplorerUser", JSON.stringify(mockUser));
    } catch (error) {
      console.error('Erreur d\'inscription :', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Appel à Firebase Auth serait ici
      setUser(null);
      localStorage.removeItem("musicExplorerUser");
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const savedUser = localStorage.getItem("musicExplorerUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
