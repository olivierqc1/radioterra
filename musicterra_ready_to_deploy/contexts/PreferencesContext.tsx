import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { UserPreferences } from '../types/user';
import { useAuth } from '../hooks/useAuth';

interface PreferencesContextType {
  userPreferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  favoriteGenres: [],
  favoriteCountries: [],
  ratings: {},
  location: null,
  searchHistory: [],
  theme: 'dark',
  spotifyConnected: false
};

export const PreferencesContext = createContext<PreferencesContextType>({
  userPreferences: defaultPreferences,
  updatePreferences: () => {},
  resetPreferences: () => {},
});

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);

  // Charger les préférences au démarrage ou lors du changement d'utilisateur
  useEffect(() => {
    const loadPreferences = () => {
      if (user) {
        // Charger depuis un stockage spécifique à l'utilisateur
        const savedPreferences = localStorage.getItem(`musicExplorerPreferences_${user.id}`);
        if (savedPreferences) {
          setUserPreferences(JSON.parse(savedPreferences));
          return;
        }
      }
      
      // Fallback aux préférences locales si pas connecté
      const savedPreferences = localStorage.getItem("musicExplorerPreferences");
      if (savedPreferences) {
        setUserPreferences(JSON.parse(savedPreferences));
      }
    };
    
    loadPreferences();
  }, [user]);

  // Sauvegarder les préférences lorsqu'elles changent
  useEffect(() => {
    if (user) {
      localStorage.setItem(`musicExplorerPreferences_${user.id}`, JSON.stringify(userPreferences));
    } else {
      localStorage.setItem("musicExplorerPreferences", JSON.stringify(userPreferences));
    }
  }, [userPreferences, user]);

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    setUserPreferences(prev => ({
      ...prev,
      ...preferences
    }));
  };

  const resetPreferences = () => {
    setUserPreferences(defaultPreferences);
  };

  return (
    <PreferencesContext.Provider value={{ userPreferences, updatePreferences, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};
