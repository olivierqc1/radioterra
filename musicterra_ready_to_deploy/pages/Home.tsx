import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const Home: React.FC = () => {
  const { theme } = useTheme();
  
  const styles = {
    container: {
      minHeight: "100vh",
      background: theme === 'dark' ? "#121212" : "#f5f5f5",
      color: theme === 'dark' ? "#ffffff" : "#333333",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    },
    title: {
      fontSize: "3rem",
      marginBottom: "2rem",
      background: "linear-gradient(45deg, #6200ee, #03dac6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    subtitle: {
      fontSize: "1.5rem",
      marginBottom: "2rem",
      textAlign: "center" as const,
    },
    buttonsContainer: {
      display: "flex",
      gap: "1rem",
      flexWrap: "wrap" as const,
      justifyContent: "center",
    },
    button: {
      padding: "12px 24px",
      background: "#6200ee",
      color: "white",
      border: "none",
      borderRadius: "24px",
      fontSize: "1rem",
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-block",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Explorateur Musical</h1>
      <p style={styles.subtitle}>
        Découvrez de nouveaux genres musicaux et explorez les connexions culturelles
        entre différents pays à travers leur musique.
      </p>
      
      <div style={styles.buttonsContainer}>
        <Link to="/explore" style={styles.button}>
          Commencer l'exploration
        </Link>
        <Link to="/profile" style={styles.button}>
          Mon profil
        </Link>
        <Link to="/spotify" style={styles.button}>
          Connexion Spotify
        </Link>
      </div>
    </div>
  );
};

export default Home;
