import React from 'react';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Chargement...' 
}) => {
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    color: 'white',
  };

  const messageStyle: React.CSSProperties = {
    marginTop: '20px',
    fontSize: '18px',
  };

  const spinnerStyle: React.CSSProperties = {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s ease-in-out infinite',
  };

  return (
    <div style={overlayStyle}>
      <div style={spinnerStyle}></div>
      <p style={messageStyle}>{message}</p>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingOverlay;
