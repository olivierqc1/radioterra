import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../hooks/useTheme';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();
  const { theme } = useTheme();

  if (notifications.length === 0) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxWidth: '300px',
  };

  const getNotificationStyle = (type: 'success' | 'error' | 'info'): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '15px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      animation: 'slideIn 0.3s ease',
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, background: '#48c774' };
      case 'error':
        return { ...baseStyle, background: '#ff3860' };
      default:
        return { ...baseStyle, background: '#3298dc' };
    }
  };

  return (
    <div style={containerStyle}>
      {notifications.map(notification => (
        <div 
          key={notification.id}
          style={getNotificationStyle(notification.type)}
          onClick={() => removeNotification(notification.id)}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
