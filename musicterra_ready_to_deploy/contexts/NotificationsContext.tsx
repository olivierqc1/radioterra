import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Notification } from '../types/notification';

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  removeNotification: (id: string) => void;
}

export const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' = 'info', 
    duration: number = 3000
  ) => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      message,
      type,
      duration
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-suppression après la durée spécifiée
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};