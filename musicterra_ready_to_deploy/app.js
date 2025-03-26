import React, { useState, useEffect } from "react";
import "./styles.css"; // C'est le fichier CSS par défaut dans Stackblitz

// Importez vos données JSON
import genreData from "./data/genre.json";
import countriesData from "./data/countries.json";

function App() {
  // États pour gérer les préférences utilisateur
  const [language, setLanguage] = useState("fr");
  const [userPreferences, setUserPreferences] = useState(() => {
    const savedPreferences = localStorage.getItem("musicExplorerPreferences");
    return savedPreferences
      ? JSON.parse(savedPreferences)
      : {
          favoriteGenres: [],
          favoriteCountries: [],
          ratings: {},
          location: null,
        };
  });

  const [lastSpinDate, setLastSpinDate] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [wheelRotation, setWheelRotation] = useState({ genre: 0, country: 0 });

  // Sauvegarde des préférences utilisateur
  useEffect(() => {
    localStorage.setItem(
      "musicExplorerPreferences",
      JSON.stringify(userPreferences)
    );
  }, [userPreferences]);

  // Translations
  const translations = {
    fr: {
      title: "Explorateur Musical",
      spin: "Tourner la Roue",
      nextSpin: "Prochaine rotation disponible dans",
      preferences: "Préférences",
      recommended: "Recommandé pour vous",
      profile: "Profil",
      location: "Localisation",
      genreWheel: "Roue des Genres",
      countryWheel: "Roue des Pays",
      dailyLimit: "Revenez demain pour une nouvelle rotation !",
    },
    en: {
      title: "Music Explorer",
      spin: "Spin the Wheel",
      nextSpin: "Next spin available in",
      preferences: "Preferences",
      recommended: "Recommended for you",
      profile: "Profile",
      location: "Location",
      genreWheel: "Genre Wheel",
      countryWheel: "Country Wheel",
      dailyLimit: "Come back tomorrow for a new spin!",
    },
  };

  const t = translations[language];

  // Styles CSS intégrés
  const styles = {
    app: {
      minHeight: "100vh",
      background: "#121212",
      color: "#ffffff",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
      background: "#1e1e1e",
      borderRadius: "10px",
      marginBottom: "30px",
    },
    title: {
      margin: 0,
      background: "linear-gradient(45deg, #6200ee, #03dac6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    button: {
      padding: "10px 20px",
      background: "#6200ee",
      color: "white",
      border: "none",
      borderRadius: "20px",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    wheelsSection: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "30px",
      marginBottom: "40px",
    },
    wheelContainer: {
      position: "relative",
      width: "300px",
      height: "300px",
      margin: "0 auto",
    },
    wheel: {
      position: "relative",
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      background: "#1e1e1e",
      overflow: "hidden",
      transition: "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)",
    },
    preferencesSection: {
      background: "#1e1e1e",
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "30px",
    },
    recommendationList: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "15px",
    },
    recommendationItem: {
      background:
        "linear-gradient(45deg, rgba(98, 0, 238, 0.3), rgba(3, 218, 198, 0.3))",
      padding: "15px",
      borderRadius: "8px",
      textAlign: "center",
      transition: "all 0.3s ease",
    },
  };

  // Gérer la rotation de la roue
  const handleSpin = (type) => {
    const today = new Date().toDateString();
    if (lastSpinDate === today) {
      alert(t.dailyLimit);
      return;
    }

    const newRotation = Math.floor(Math.random() * 360) + 1440;

    if (type === "genre") {
      setWheelRotation((prev) => ({
        ...prev,
        genre: prev.genre + newRotation,
      }));
      const selection =
        genreData.genres[Math.floor(Math.random() * genreData.genres.length)];
      setTimeout(() => setSelectedGenre(selection), 4000);
    } else {
      setWheelRotation((prev) => ({
        ...prev,
        country: prev.country + newRotation,
      }));
      const countries = Object.keys(countriesData);
      const selection = {
        name: countries[Math.floor(Math.random() * countries.length)],
      };
      setTimeout(() => setSelectedCountry(selection), 4000);
    }

    setLastSpinDate(today);
    updatePreferences();
  };

  // Mettre à jour les préférences
  const updatePreferences = () => {
    if (selectedGenre) {
      setUserPreferences((prev) => ({
        ...prev,
        favoriteGenres: [
          ...new Set([...prev.favoriteGenres, selectedGenre.name]),
        ],
      }));
    }
    if (selectedCountry) {
      setUserPreferences((prev) => ({
        ...prev,
        favoriteCountries: [
          ...new Set([...prev.favoriteCountries, selectedCountry.name]),
        ],
      }));
    }
  };

  // Composant Roue
  const Wheel = ({ type, items }) => (
    <div style={styles.wheelContainer}>
      <h3 style={{ textAlign: "center" }}>
        {type === "genre" ? t.genreWheel : t.countryWheel}
      </h3>
      <div
        style={{
          ...styles.wheel,
          transform: `rotate(${wheelRotation[type]}deg)`,
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `rotate(${
                (360 / items.length) * index
              }deg) translateX(120px)`,
              transformOrigin: "0 0",
              background: `hsl(${(360 / items.length) * index}, 70%, 50%)`,
              padding: "10px",
              borderRadius: "5px",
              color: "white",
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
      <button
        style={styles.button}
        onClick={() => handleSpin(type)}
        disabled={lastSpinDate === new Date().toDateString()}
      >
        {t.spin}
      </button>
    </div>
  );

  const renderGenreDetails = () => {
    if (!selectedGenre) return null;
    return (
      <div style={styles.preferencesSection}>
        <h2>Détails du Genre</h2>
        <div style={styles.recommendationList}>
          <div style={styles.recommendationItem}>
            <h3>{selectedGenre.name}</h3>
            <p>
              <strong>Période :</strong> {selectedGenre.period}
            </p>
            <div>
              <strong>Variantes :</strong>
              <ul>
                {selectedGenre.variants && selectedGenre.variants.map((variant, index) => (
                  <li key={index}>
                    {variant.name} ({variant.period})
                  </li>
                ))}
              </ul>
            </div>
            {selectedGenre.variants && selectedGenre.variants[0]?.spotifyLink && (
              
                href={selectedGenre.variants[0].spotifyLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1DB954",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                🎵 Écouter sur Spotify
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCountryConnections = () => {
    if (!selectedCountry) return null;
    return (
      <div style={styles.preferencesSection}>
        <h2>Connexions Musicales</h2>
        <div style={styles.recommendationList}>
          <div style={styles.recommendationItem}>
            <h3>Pays Connectés</h3>
            <p>
              <strong>Relations Culturelles :</strong>
            </p>
            <ul>
              {countriesData[selectedCountry.name] ? (
                countriesData[selectedCountry.name].map(
                  (connectedCountry, index) => (
                    <li key={index}>{connectedCountry}</li>
                  )
                )
              ) : (
                <li>Aucune relation culturelle définie</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>{t.title}</h1>
        <button
          style={styles.button}
          onClick={() => setLanguage((l) => (l === "fr" ? "en" : "fr"))}
        >
          {language === "fr" ? "EN" : "FR"}
        </button>
      </header>

      <div style={styles.wheelsSection}>
        <Wheel 
          type="genre" 
          items={genreData.genres || []} 
        />
        <Wheel
          type="country"
          items={Object.keys(countriesData || {}).map((name) => ({ name }))}
        />
      </div>

      {renderGenreDetails()}
      {renderCountryConnections()}

      <div style={styles.preferencesSection}>
        <h2>{t.recommended}</h2>
        <div style={styles.recommendationList}>
          {userPreferences.favoriteGenres.map((genre, index) => (
            <div key={`genre-${index}`} style={styles.recommendationItem}>
              {genre}
            </div>
          ))}
          {userPreferences.favoriteCountries.map((country, index) => (
            <div key={`country-${index}`} style={styles.recommendationItem}>
              {country}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;