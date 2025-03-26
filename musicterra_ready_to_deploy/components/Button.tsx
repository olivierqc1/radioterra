import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  fullWidth = false,
  style = {},
}) => {
  const { theme } = useTheme();
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '8px 16px',
          fontSize: '0.875rem',
        };
      case 'large':
        return {
          padding: '12px 24px',
          fontSize: '1.125rem',
        };
      default:
        return {
          padding: '10px 20px',
          fontSize: '1rem',
        };
    }
  };
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: theme === 'dark' ? '#333' : '#e0e0e0',
          color: theme === 'dark' ? '#fff' : '#333',
        };
      case 'outline':
        return {
          background: 'transparent',
          border: `1px solid ${theme === 'dark' ? '#fff' : '#333'}`,
          color: theme === 'dark' ? '#fff' : '#333',
        };
      default:
        return {
          background: '#6200ee',
          color: 'white',
        };
    }
  };
  
  const baseStyles = {
    borderRadius: '20px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    opacity: disabled ? 0.7 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };
  
  return (
    <button
      type={type}
      style={baseStyles}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
