import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes';
import './App.css';


// Types
interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

interface Variant {
  name: string;
  period: string;
  description?: string;
  spotifyLink?: string;
  spotifyId?: string;
  subgenres?: any[];
  relatedGenres?: string[];
  artists?: Artist[];
}

interface Artist {
  id: string;
  name: string;
  image?: string;
  spotifyId?: string;
}

interface Genre {
  name: string;
  period: string;
  variants: Variant[];
  popularity?: number;
  tags?: string[];
  image?: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface UserPreferences {
  favoriteGenres: string[];
  favoriteCountries: string[];
  ratings: Record<string, number>;
  location: string | null;
  searchHistory?: string[];
  theme?: 'dark' | 'light';
  interactionHistory?: {
    timestamp: number;
    type: 'view' | 'like' | 'search';
    itemType: 'genre' | 'country';
    itemName: string;
  }[];
  spotifyConnected?: boolean;
}

// Clé API Spotify fictive - à remplacer par votre vraie clé
const SPOTIFY_API_KEY = "your_spotify_api_key";

// Configuration Firebase fictive - à remplacer par votre vraie configuration
const firebaseConfig = {
  apiKey: "your_firebase_api_key",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Données musicales temporaires avec des données enrichies
const genreData = {
  genres: [
    {
      name: "Rock",
      period: "1950s - aujourd'hui",
      popularity: 85,
      tags: ["guitare", "batterie", "énergie", "amplification"],
      image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=2070",
      variants: [
        {
          name: "Rock classique",
          period: "1960s-1970s",
          description: "Rock traditionnel avec guitare, basse et batterie",
          spotifyLink: "https://open.spotify.com/genre/rock-page",
          spotifyId: "rock",
          relatedGenres: ["Blues Rock", "Hard Rock", "Folk Rock"],
          artists: [
            { id: "1", name: "The Beatles", spotifyId: "3WrFJ7ztbogyGnTHbHJFl2" },
            { id: "2", name: "Led Zeppelin", spotifyId: "36QJpDe2go2KgaRleHCDTp" },
            { id: "3", name: "The Rolling Stones", spotifyId: "22bE4uQ6baNwSHPVcDxLCe" }
          ]
        },
        {
          name: "Hard Rock",
          period: "1970s-aujourd'hui",
          description: "Version plus lourde et agressive du rock",
          spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DWXNFSTtym834",
          spotifyId: "hard-rock",
          relatedGenres: ["Metal", "Punk Rock", "Grunge"],
          artists: [
            { id: "4", name: "AC/DC", spotifyId: "711MCceyCBcFnzjGY4Q7Un" },
            { id: "5", name: "Guns N' Roses", spotifyId: "3qm84nBOXUEQ2vnTfUTTFC" },
            { id: "6", name: "Aerosmith", spotifyId: "7Ey4PD4MYsKc5I2dolUwbH" }
          ]
        }
      ]
    },
    {
      name: "Jazz",
      period: "1920s - aujourd'hui",
      popularity: 70,
      tags: ["improvisation", "brass", "syncopation", "complex"],
      image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=2070",
      variants: [
        {
          name: "Bebop",
          period: "1940s",
          description: "Style rapide et technique avec improvisation complexe",
          spotifyLink: "https://open.spotify.com/genre/jazz-page",
          spotifyId: "bebop",
          relatedGenres: ["Hard Bop", "Cool Jazz", "Modal Jazz"],
          artists: [
            { id: "7", name: "Charlie Parker", spotifyId: "4Ww5mwS7BWYjoZTUIrMHfC" },
            { id: "8", name: "Dizzy Gillespie", spotifyId: "5RzjqfPS0Bu4bUMkyNNDpn" },
            { id: "9", name: "Thelonious Monk", spotifyId: "4PDpGtF16XpqvXxsrFwQnN" }
          ]
        }
      ]
    }
  ]
};

// Pays temporaires avec données enrichies
const countriesData: Record<string, any> = {
  "France": {
    related: ["Belgique", "Suisse", "Canada"],
    genres: ["Chanson", "Électronique", "Hip-Hop français"],
    popularArtists: ["Daft Punk", "Air", "Phoenix"],
    musicTraditions: ["Chanson française", "Musique provençale"],
    flag: "🇫🇷"
  },
  "États-Unis": {
    related: ["Canada", "Royaume-Uni", "Australie"],
    genres: ["Rock", "Hip-Hop", "Country", "Jazz", "Blues"],
    popularArtists: ["Taylor Swift", "Kendrick Lamar", "Billie Eilish"],
    musicTraditions: ["Blues du Delta", "Jazz de la Nouvelle-Orléans", "Country"],
    flag: "🇺🇸"
  },
  "Japon": {
    related: ["Corée du Sud", "Chine", "Taiwan"],
    genres: ["J-Pop", "City Pop", "Visual Kei"],
    popularArtists: ["BABYMETAL", "Perfume", "ONE OK ROCK"],
    musicTraditions: ["Musique traditionnelle japonaise", "Enka"],
    flag: "🇯🇵"
  }
};

function App() {
  // États pour gérer les préférences utilisateur
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favoriteGenres: [],
    favoriteCountries: [],
    ratings: {},
    location: null,
    searchHistory: [],
    theme: 'dark',
    spotifyConnected: false
  });
  
  const [lastSpinDate, setLastSpinDate] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<{name: string} | null>(null);
  const [wheelRotation, setWheelRotation] = useState({ genre: 0, country: 0 });
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{genres: Genre[], countries: string[]}>({
    genres: [],
    countries: []
  });
  
  const [recommendations, setRecommendations] = useState<{
    genres: Genre[],
    countries: string[],
    related: Genre[],
    artists: Artist[]
  }>({
    genres: [],
    countries: [],
    related: [],
    artists: []
  });
  
  // État pour les données de l'API Spotify
  const [spotifyData, setSpotifyData] = useState<{
    topTracks: any[],
    topArtists: any[],
    recommendations: any[]
  }>({
    topTracks: [],
    topArtists: [],
    recommendations: []
  });
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  // Vérification si l'écran est en mode mobile
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // Écouter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Détecter les clics à l'extérieur du menu mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Effet pour le thème
  useEffect(() => {
    if (userPreferences.theme) {
      setTheme(userPreferences.theme);
      document.body.classList.toggle('light-theme', userPreferences.theme === 'light');
    }
  }, [userPreferences.theme]);

  // Sauvegarde des préférences utilisateur
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      
      // Simuler l'initialisation de Firebase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier si un utilisateur est déjà connecté
      const savedUser = localStorage.getItem("musicExplorerUser");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        
        // Charger les préférences depuis Firestore (simulé)
        await loadUserPreferences(JSON.parse(savedUser).id);
      } else {
        // Charger les préférences depuis le localStorage
        const savedPreferences = localStorage.getItem("musicExplorerPreferences");
        if (savedPreferences) {
          setUserPreferences(JSON.parse(savedPreferences));
        }
      }
      
      setIsLoading(false);
    };
    
    initializeApp();
  }, []);

  // Effet pour sauvegarder les préférences
  useEffect(() => {
    if (user) {
      // Sauvegarder dans Firestore (simulé)
      saveUserPreferencesToCloud(user.id, userPreferences);
    } else {
      // Sauvegarder en local
      localStorage.setItem(
        "musicExplorerPreferences",
        JSON.stringify(userPreferences)
      );
    }
  }, [userPreferences, user]);
  
  // Générer des recommandations basées sur les préférences de l'utilisateur
  useEffect(() => {
    generateRecommendations();
  }, [userPreferences.favoriteGenres, userPreferences.favoriteCountries]);
  
  // Système de notifications
  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      message,
      type,
      duration
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-suppression après la durée spécifiée
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, duration);
  };
  
  // Simuler le chargement des préférences utilisateur depuis Firestore
  const loadUserPreferences = async (userId: string) => {
    // Simuler un délai de chargement
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Pour la démo, charger depuis localStorage mais en pratique, ce serait depuis Firestore
    const savedPreferences = localStorage.getItem(`musicExplorerPreferences_${userId}`);
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  };
  
  // Simuler la sauvegarde des préférences utilisateur dans Firestore
  const saveUserPreferencesToCloud = (userId: string, preferences: UserPreferences) => {
    // Sauvegarder dans localStorage avec un préfixe spécifique à l'utilisateur
    localStorage.setItem(
      `musicExplorerPreferences_${userId}`,
      JSON.stringify(preferences)
    );
  };
  
  // Simuler une connexion à Spotify
  const connectToSpotify = async () => {
    // Simuler un délai d'authentification
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simuler la récupération de données depuis l'API Spotify
    const mockSpotifyData = {
      topTracks: [
        { id: "t1", name: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", image: "https://via.placeholder.com/50" },
        { id: "t2", name: "Billie Jean", artist: "Michael Jackson", album: "Thriller", image: "https://via.placeholder.com/50" },
        { id: "t3", name: "Imagine", artist: "John Lennon", album: "Imagine", image: "https://via.placeholder.com/50" }
      ],
      topArtists: [
        { id: "a1", name: "Queen", genre: "Rock", image: "https://via.placeholder.com/50" },
        { id: "a2", name: "Michael Jackson", genre: "Pop", image: "https://via.placeholder.com/50" },
        { id: "a3", name: "The Beatles", genre: "Rock", image: "https://via.placeholder.com/50" }
      ],
      recommendations: [
        { id: "r1", name: "Stairway to Heaven", artist: "Led Zeppelin", album: "Led Zeppelin IV", image: "https://via.placeholder.com/50" },
        { id: "r2", name: "Hotel California", artist: "Eagles", album: "Hotel California", image: "https://via.placeholder.com/50" },
        { id: "r3", name: "November Rain", artist: "Guns N' Roses", album: "Use Your Illusion I", image: "https://via.placeholder.com/50" }
      ]
    };
    
    setSpotifyData(mockSpotifyData);
    
    // Mettre à jour les préférences de l'utilisateur
    setUserPreferences(prev => ({
      ...prev,
      spotifyConnected: true
    }));
    
    setIsLoading(false);
    addNotification("Connexion à Spotify réussie!", "success");
  };
  
  // Algorithme de recommandation complet
  const generateRecommendations = () => {
    // Recommandations de genres
    let recommendedGenres: Genre[] = [];
    let relatedGenres: Genre[] = [];
    let recommendedArtists: Artist[] = [];
    
    // Si l'utilisateur a des genres favoris
    if (userPreferences.favoriteGenres.length > 0) {
      // Obtenir les genres liés aux favoris
      const relatedGenreNames = new Set<string>();
      const artistsFromFavorites = new Set<Artist>();
      
      userPreferences.favoriteGenres.forEach(favGenre => {
        const genre = genreData.genres.find(g => g.name === favGenre);
        if (genre) {
          genre.variants.forEach(variant => {
            if (variant.relatedGenres) {
              variant.relatedGenres.forEach(rg => relatedGenreNames.add(rg));
            }
            
            // Collecter des artistes pour les recommandations
            if (variant.artists) {
              variant.artists.forEach(artist => artistsFromFavorites.add(artist));
            }
          });
        }
      });
      
      // Ajouter des genres recommandés qui ne sont pas déjà dans les favoris
      genreData.genres.forEach(genre => {
        if (!userPreferences.favoriteGenres.includes(genre.name)) {
          // Si ce genre est lié à un favori ou partage des tags avec des favoris
          const isRelated = Array.from(relatedGenreNames).some(rg => 
            genre.name.includes(rg) || 
            genre.variants.some(v => v.name.includes(rg))
          );
          
          if (isRelated) {
            relatedGenres.push(genre);
          } else if (genre.popularity && genre.popularity > 75) {
            // Sinon, suggérer des genres populaires
            recommendedGenres.push(genre);
          }
        }
      });
      
      // Limiter les artistes recommandés à un maximum de 6
      recommendedArtists = Array.from(artistsFromFavorites).slice(0, 6);
    } else {
      // Si aucun favori, recommander les genres les plus populaires
      recommendedGenres = genreData.genres
        .filter(g => g.popularity && g.popularity > 70)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 3);
        
      // Recommander quelques artistes populaires
      genreData.genres.forEach(genre => {
        genre.variants.forEach(variant => {
          if (variant.artists) {
            recommendedArtists = [...recommendedArtists, ...variant.artists].slice(0, 6);
          }
        });
      });
    }
    
    // Recommandations de pays
    let recommendedCountries: string[] = [];
    
    // Si l'utilisateur a des pays favoris
    if (userPreferences.favoriteCountries.length > 0) {
      const countrySuggestions = new Set<string>();
      
      userPreferences.favoriteCountries.forEach(favCountry => {
        if (countriesData[favCountry] && countriesData[favCountry].related) {
          countriesData[favCountry].related.forEach((country: string) => {
            if (!userPreferences.favoriteCountries.includes(country)) {
              countrySuggestions.add(country);
            }
          });
        }
      });
      
      recommendedCountries = Array.from(countrySuggestions).slice(0, 3);
    } else {
      // Si aucun pays favori, suggérer quelques pays avec des scènes musicales diverses
      recommendedCountries = Object.keys(countriesData).slice(0, 3);
    }
    
    // Mélanger légèrement les recommandations pour plus de variété
    recommendedGenres = shuffleArray(recommendedGenres).slice(0, 3);
    relatedGenres = shuffleArray(relatedGenres).slice(0, 3);
    
    setRecommendations({
      genres: recommendedGenres,
      countries: recommendedCountries,
      related: relatedGenres,
      artists: recommendedArtists
    });
  };
  
  // Fonction pour mélanger un tableau
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Changer le thème
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.classList.toggle('light-theme', newTheme === 'light');
    
    setUserPreferences(prev => ({
      ...prev,
      theme: newTheme
    }));
    
    addNotification(`Thème ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`, "info");
  };
  
  // Noter un genre ou un pays
  const rateItem = (itemType: 'genre' | 'country', itemName: string, rating: number) => {
    setUserPreferences(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [`${itemType}:${itemName}`]: rating
      },
      interactionHistory: [
        ...(prev.interactionHistory || []),
        {
          timestamp: Date.now(),
          type: rating >= 4 ? 'like' : 'view',
          itemType,
          itemName
        }
      ]
    }));
    
    addNotification(`${itemType === 'genre' ? 'Genre' : 'Pays'} noté ${rating}/5`, "success");
  };
  
  // Partager sur les réseaux sociaux
  const shareItem = (itemType: 'genre' | 'country', itemName: string) => {
    // Dans une vraie application, vous utiliseriez les API des médias sociaux
    const shareText = `Je viens de découvrir ${itemType === 'genre' ? 'le genre' : 'la musique de'} ${itemName} sur Music Explorer!`;
    const shareUrl = `https://musicexplorer.example.com/share/${itemType}/${encodeURIComponent(itemName)}`;
    
    // Simuler le partage
    console.log("Partage:", shareText, shareUrl);
    
    // Dans une vraie application:
    // window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    
    addNotification("Lien de partage copié!", "success");
  };
  
  // Simuler l'inscription d'un utilisateur
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    const { email, password, username } = formData;
    
    // Validation simple
    if (!email || !password || !username) {
      setAuthError("Tous les champs sont requis");
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setAuthError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Créer un faux utilisateur
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      email,
      profilePicture: `https://ui-avatars.com/api/?name=${username}&background=random`
    };
    
    // Enregistrer l'utilisateur
    localStorage.setItem("musicExplorerUser", JSON.stringify(newUser));
    setUser(newUser);
    
    // Fermer le modal
    setIsAuthModalOpen(false);
    setIsLoading(false);
    
    // Notification
    addNotification("Inscription réussie! Bienvenue!", "success");
  };
  
  // Simuler la connexion d'un utilisateur
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    const { email, password } = formData;
    
    // Pour démonstration, accepter n'importe quelle combinaison
    if (!email || !password) {
      setAuthError("L'email et le mot de passe sont requis");
      setIsLoading(false);
      return;
    }
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Créer un faux utilisateur pour la démonstration
    const loggedInUser = {
      id: `user_${Date.now()}`,
      username: email.split('@')[0],
      email,
      profilePicture: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`
    };
    
    // Enregistrer l'utilisateur
    localStorage.setItem("musicExplorerUser", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    
    // Fermer le modal
    setIsAuthModalOpen(false);
    setIsLoading(false);
    
    // Notification
    addNotification("Connexion réussie!", "success");
    
    // Charger les préférences
    await loadUserPreferences(loggedInUser.id);
  };
  
  // Déconnexion de l'utilisateur
  const handleLogout = () => {
    localStorage.removeItem("musicExplorerUser");
    setUser(null);
    setIsMobileMenuOpen(false);
    
    // Réinitialiser les préférences à celles en local
    const savedPreferences = localStorage.getItem("musicExplorerPreferences");
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    } else {
      setUserPreferences({
        favoriteGenres: [],
        favoriteCountries: [],
        ratings: {},
        location: null,
        searchHistory: [],
        theme: theme,
        spotifyConnected: false
      });
    }
    
    addNotification("Vous avez été déconnecté", "info");
  };

  // Gérer la rotation de la roue
  const handleSpin = (type: 'genre' | 'country') => {
    const today = new Date().toDateString();
    if (lastSpinDate === today) {
      addNotification(translations[language].dailyLimit, "info");
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
      setTimeout(() => {
        setSelectedGenre(selection);
        addNotification(`${selection.name} sélectionné!`, "success");
      }, 4000);
    } else {
      setWheelRotation((prev) => ({
        ...prev,
        country: prev.country + newRotation,
      }));
      const countries = Object.keys(countriesData);
      const selection = {
        name: countries[Math.floor(Math.random() * countries.length)],
      };
      setTimeout(() => {
        setSelectedCountry(selection);
        addNotification(`${selection.name} sélectionné!`, "success");
      }, 4000);
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
  
  // Fonction de recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Sauvegarder dans l'historique de recherche
    setUserPreferences(prev => ({
      ...prev,
      searchHistory: [...new Set([searchTerm, ...(prev.searchHistory || [])])].slice(0, 10)
    }));
    
    // Rechercher dans les genres
    const foundGenres = genreData.genres.filter(genre => 
      genre.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      genre.variants.some(variant => 
        variant.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    // Rechercher dans les pays
    const foundCountries = Object.keys(countriesData).filter(country =>
      country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setSearchResults({
      genres: foundGenres,
      countries: foundCountries
    });
    
    // Ajouter une interaction
    setUserPreferences(prev => ({
      ...prev,
      interactionHistory: [
        ...(prev.interactionHistory || []),
        {
          timestamp: Date.now(),
          type: 'search',
          itemType: 'genre',
          itemName: searchTerm
        }
      ]
    }));
    
    if (foundGenres.length === 0 && foundCountries.length === 0) {
      addNotification(`Aucun résultat pour "${searchTerm}"`, "info");
    } else {
      addNotification(`${foundGenres.length + foundCountries.length} résultats trouvés`, "success");
    }
  };
  
  // Gérer les changements de champs de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Sélectionner un terme de recherche depuis l'historique
  const selectSearchHistoryTerm = (term: string) => {
    setSearchTerm(term);
    setTimeout(() => {
      const event = { preventDefault: () => {} } as React.FormEvent;
      handleSearch(event);
    }, 0);
  };

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
      search: "Rechercher",
      searchPlaceholder: "Genres, pays, artistes...",
      searchResults: "Résultats de recherche",
      noResults: "Aucun résultat trouvé",
      recentSearches: "Recherches récentes",
      clearSearch: "Effacer",
      genres: "Genres",
      countries: "Pays",
      recommendedGenres: "Genres recommandés",
      recommendedCountries: "Pays recommandés",
      relatedGenres: "Genres connexes que vous pourriez aimer",
      popularTrends: "Tendances populaires",
      basedOnPreferences: "Basé sur vos préférences",
      rateThis: "Évaluez",
      artistsToDiscover: "Artistes à découvrir",
      seeMore: "Voir plus",
      connectSpotify: "Connecter Spotify",
      musicianCorner: "Coin des musiciens",
      login: "Connexion",
      signup: "Inscription",
      email: "Email",
      password: "Mot de passe",
      username: "Nom d'utilisateur",
      logout: "Déconnexion",
      welcome: "Bienvenue",
      loginTitle: "Connexion à votre compte",
      signupTitle: "Créer un compte",
      orSignup: "Ou inscrivez-vous",
      orLogin: "Ou connectez-vous",
      spotifyTracks: "Vos titres Spotify",
      spotifyArtists: "Vos artistes Spotify",
      spotifyRecommendations: "Recommandations Spotify",
      loading: "Chargement...",
      menu: "Menu",
      close: "Fermer",
      changeLanguage: "Changer de langue",
      myProfile: "Mon profil",
      myPreferences: "Mes préférences",
      spotifyData: "Données Spotify",
      shareProfile: "Partager mon profil",
      darkMode: "Mode sombre",
      lightMode: "Mode clair",
      switchTheme: "Changer de thème",
      share: "Partager",
      relatedCountries: "Pays avec des liens culturels",
      popularArtists: "Artistes populaires",
      traditionalMusic: "Musique traditionnelle",
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
      search: "Search",
      searchPlaceholder: "Genres, countries, artists...",
      searchResults: "Search Results",
      noResults: "No results found",
      recentSearches: "Recent searches",
      clearSearch: "Clear",
      genres: "Genres",
      countries: "Countries",
      recommendedGenres: "Recommended Genres",
      recommendedCountries: "Recommended Countries",
      relatedGenres: "Related Genres You Might Like",
      popularTrends: "Popular Trends",
      basedOnPreferences: "Based on your preferences",
      rateThis: "Rate this",
      artistsToDiscover: "Artists to Discover",
      seeMore: "See more",
      connectSpotify: "Connect Spotify",
      musicianCorner: "Musician's Corner",
      login: "Login",
      signup: "Sign Up",
      email: "Email",
      password: "Password",
      username: "Username",
      logout: "Logout",
      welcome: "Welcome",
      loginTitle: "Login to your account",
      signupTitle: "Create an account",
      orSignup: "Or sign up",
      orLogin: "Or login",
      spotifyTracks: "Your Spotify Tracks",
      spotifyArtists: "Your Spotify Artists",
      spotifyRecommendations: "Spotify Recommendations",
      loading: "Loading...",
      menu: "Menu",
      close: "Close",
      changeLanguage: "Change language",
      myProfile: "My profile",
      myPreferences: "My preferences",
      spotifyData: "Spotify data",
      shareProfile: "Share my profile",
      darkMode: "Dark mode",
      lightMode: "Light mode",
      switchTheme: "Switch theme",
      share: "Share",
      relatedCountries: "Countries with cultural ties",
      popularArtists: "Popular artists",
      traditionalMusic: "Traditional music",
    },
  };

  const t = translations[language];

  // Styles CSS intégrés avec thème et support mobile
  const getStyles = () => {
    const baseStyles = {
      app: {
        minHeight: "100vh",
        background: theme === 'dark' ? "#121212" : "#f5f5f5",
        color: theme === 'dark' ? "#ffffff" : "#333333",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        transition: "background-color 0.3s, color 0.3s",
      },
      header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        background: theme === 'dark' ? "#1e1e1e" : "#ffffff",
        borderRadius: "10px",
        marginBottom: "30px",
        boxShadow: theme === 'dark' ? "none" : "0 2px 10px rgba(0,0,0,0.1)",
      },
      headerMobile: {
        flexDirection: "column" as const,
        alignItems: "flex-start",
        gap: "15px",
      },
      mobileMenuButton: {
        background: "transparent",
        border: "none",
        color: theme === 'dark' ? "white" : "#333",
        fontSize: "24px",
        cursor: "pointer",
      },
      mobileMenu: {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "80%",
        height: "100%",
        background: theme === 'dark' ? "#1e1e1e" : "#ffffff",
        zIndex: 1000,
        padding: "20px",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.5)",
        transform: "translateX(0)",
        transition: "transform 0.3s ease",
        color: theme === 'dark' ? "#ffffff" : "#333333",
      },
      mobileMenuClosed: {
        transform: "translateX(-100%)",
      },
      mobileMenuHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      },
      mobileMenuItem: {
        padding: "15px 0",
        borderBottom: theme === 'dark' ? "1px solid #333" : "1px solid #eee",
        cursor: "pointer",
      },
      menuOverlay: {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        zIndex: 999,
      },
      searchContainer: {
        display: "flex",
        margin: "20px 0",
        position: "relative",
      },
      searchInput: {
        flex: 1,
        padding: "12px 20px",
        fontSize: "16px",
        borderRadius: "25px",
        border: theme === 'dark' ? "none" : "1px solid #ddd",
        background: theme === 'dark' ? "#2a2a2a" : "#ffffff",
        color: theme === 'dark' ? "#ffffff" : "#333333",
        outline: "none",
      },
      searchButton: {
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        padding: "8px 15px",
        background: "#6200ee",
        color: "white",
        border: "none",
        borderRadius: "20px",
        cursor: "pointer",
      },
      searchResultsContainer: {
        background: theme === 'dark' ? "#1e1e1e" : "#ffffff",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "30px",
        boxShadow: theme === 'dark' ? "none" : "0 2px 10px rgba(0,0,0,0.1)",
      },
      searchResultsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "15px",
        marginTop: "15px",
      },
      searchResultsItem: {
        background: theme === 'dark' 
          ? "linear-gradient(45deg, rgba(98, 0, 238, 0.2), rgba(3, 218, 198, 0.2))"
          : "linear-gradient(45deg, rgba(98, 0, 238, 0.1), rgba(3, 218, 198, 0.1))",
        padding: "15px",
        borderRadius: "8px",
        transition: "all 0.3s ease",
        cursor: "pointer",
      },
      searchHistoryTag: {
        display: "inline-block",
        margin: "5px",
        padding: "5px 10px",
        borderRadius: "15px",
        background: theme === 'dark' ? "#333" : "#eee",
        color: theme === 'dark' ? "#fff" : "#333",
        fontSize: "14px",
        cursor: "pointer",
      },
      wheelsSection: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "30px",
        marginBottom: "40px",
      },
      wheelsSectionMobile: {
        gridTemplateColumns: "1fr",
      },
      wheelContainer: {
        position: "relative",
        width: "300px",
        height: "300px",
        margin: "0 auto",
      },
      wheelContainerMobile: {
        width: "260px",
        height: "260px",
      },
      wheel: {
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: theme === 'dark' ? "#1e1e1e" : "#f0f0f0",
        overflow: "hidden",
        transition: "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)",
        boxShadow: theme === 'dark' ? "none" : "0 4px 10px rgba(0,0,0,0.1)",
      },
      preferencesSection: {
        background: theme === 'dark' ? "#1e1e1e" : "#ffffff",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "30px",
        boxShadow: theme === 'dark' ? "none" : "0 2px 10px rgba(0,0,0,0.1)",
      },
      recommendationList: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "15px",
      },
      recommendationListMobile: {
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      },
      recommendationItem: {
        background: theme === 'dark'
          ? "linear-gradient(45deg, rgba(98, 0, 238, 0.3), rgba(3, 218, 198, 0.3))"
          : "linear-gradient(45deg, rgba(98, 0, 238, 0.1), rgba(3, 218, 198, 0.1))",
        padding: "15px",
        borderRadius: "8px",
        textAlign: "center",
        transition: "all 0.3s ease",
      },
      recommendationCard: {
        background: theme === 'dark' ? "#2a2a2a" : "#f9f9f9",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "15px",
        boxShadow: theme === 'dark' ? "0 4px 8px rgba(0, 0, 0, 0.2)" : "0 4px 8px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.3s ease",
      },
      recommendationGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
        marginTop: "20px",
      },
      recommendationGridMobile: {
        gridTemplateColumns: "1fr",
      },
      recommendationHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
      },
      starRating: {
        display: "flex",
        justifyContent: "center",
        margin: "10px 0",
      },
      star: {
        cursor: "pointer",
        fontSize: "24px",
        margin: "0 2px",
      },
      tag: {
        display: "inline-block",
        padding: "4px 8px",
        margin: "3px",
        borderRadius: "12px",
        background: theme === 'dark' ? "#444" : "#eee",
        color: theme === 'dark' ? "#fff" : "#333",
        fontSize: "12px",
      },
      sectionTitle: {
        borderBottom: "2px solid #6200ee",
        paddingBottom: "8px",
        margin: "30px 0 20px 0",
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
      buttonSmall: {
        padding: "8px 15px",
        fontSize: "14px",
      },
      modalOverlay: {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      },
      modal: {
        background: theme === 'dark' ? "#2a2a2a" : "#ffffff",
        padding: "30px",
        borderRadius: "15px",
        width: "90%",
        maxWidth: "500px",
        color: theme === 'dark' ? "#ffffff" : "#333333",
      },
      modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      },
      closeButton: {
        background: "transparent",
        border: "none",
        color: theme === 'dark' ? "white" : "#333",
        fontSize: "24px",
        cursor: "pointer",
      },
      formGroup: {
        marginBottom: "15px",
      },
      input: {
        width: "100%",
        padding: "12px",
        background: theme === 'dark' ? "#333" : "#f5f5f5",
        border: theme === 'dark' ? "none" : "1px solid #ddd",
        borderRadius: "5px",
        color: theme === 'dark' ? "white" : "#333",
        fontSize: "16px",
      },
      label: {
        display: "block",
        marginBottom: "5px",
        fontSize: "14px",
        color: theme === 'dark' ? "#ccc" : "#666",
      },
      submitButton: {
        width: "100%",
        padding: "12px",
        marginTop: "15px",
        background: "#6200ee",
        color: "white",
        border: "none",
        borderRadius: "20px",
        fontSize: "16px",
        cursor: "pointer",
      },
      switchContainer: {
        display: "flex",
        justifyContent: "center",
        marginTop: "15px",
      },
      switchText: {
        color: theme === 'dark' ? "#ccc" : "#666",
        cursor: "pointer",
      },
      errorMessage: {
        color: "#ff3860",
        fontSize: "14px",
        marginTop: "5px",
      },
      notificationsContainer: {
        position: "fixed" as const,
        bottom: "20px",
        right: "20px",
        zIndex: 1001,
        display: "flex",
        flexDirection: "column" as const,
        gap: "10px",
        maxWidth: "300px",
      },
      notification: {
        padding: "15px",
        borderRadius: "8px",
        color: "white",
        fontSize: "14px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        animation: "slideIn 0.3s ease",
      },
      notificationSuccess: {
        background: "#48c774",
      },
      notificationError: {
        background: "#ff3860",
      },
      notificationInfo: {
        background: "#3298dc",
      },
      shareButton: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "8px 12px",
        background: "#3b5998",
        color: "white",
        border: "none",
        borderRadius: "20px",
        fontSize: "14px",
        cursor: "pointer",
        marginTop: "10px",
      },
      spotifyCard: {
        background: theme === 'dark' ? "#1e1e1e" : "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "20px",
        boxShadow: theme === 'dark' ? "none" : "0 2px 10px rgba(0,0,0,0.1)",
      },
      spotifyTrackList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
      },
      spotifyTrackItem: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 0",
        borderBottom: theme === 'dark' ? "1px solid #333" : "1px solid #eee",
      },
      spotifyTrackImage: {
        width: "40px",
        height: "40px",
        borderRadius: "4px",
      },
      spotifyTrackInfo: {
        flex: 1,
      },
      spotifyTrackName: {
        margin: 0,
        fontSize: "16px",
        fontWeight: "bold" as const,
      },
      spotifyTrackArtist: {
        margin: "4px 0 0 0",
        fontSize: "14px",
        color: theme === 'dark' ? "#aaa" : "#666",
      },
      themeToggle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: theme === 'dark' ? "#333" : "#ddd",
        cursor: "pointer",
        fontSize: "20px",
        marginLeft: "10px",
      },
      title: {
        margin: 0,
        background: "linear-gradient(45deg, #6200ee, #03dac6)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      },
    };
    
    // Fusionner les styles selon le thème
    return baseStyles;
  };
  
  const styles = getStyles();

  // Composant pour la roue
  const Wheel = ({ type, items }: { type: 'genre' | 'country', items: any[] }) => (
    <div style={{
      ...styles.wheelContainer,
      ...(isMobile && styles.wheelContainerMobile)
    }}>
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
      >
        {t.spin}
      </button>
    </div>
  );

  // Rendu des détails du genre sélectionné
  const renderGenreDetails = () => {
    if (!selectedGenre) return null;
    
    // Rechercher si l'utilisateur a déjà noté ce genre
    const ratingKey = `genre:${selectedGenre.name}`;
    const currentRating = userPreferences.ratings[ratingKey] || 0;
    
    return (
      <div style={styles.preferencesSection}>
        <div style={styles.recommendationHeader}>
          <h2>Détails du Genre</h2>
          <button 
            style={{...styles.button, ...styles.buttonSmall}}
            onClick={() => shareItem('genre', selectedGenre.name)}
          >
            {t.share}
          </button>
        </div>
        <div style={{
          ...styles.recommendationGrid,
          ...(isMobile && styles.recommendationGridMobile)
        }}>
          <div style={styles.recommendationCard}>
            {selectedGenre.image && (
              <div style={{ marginBottom: "15px", textAlign: "center" }}>
                <img 
                  src={selectedGenre.image} 
                  alt={selectedGenre.name} 
                  style={{ 
                    width: "100%", 
                    maxHeight: "200px", 
                    objectFit: "cover", 
                    borderRadius: "8px" 
                  }} 
                />
              </div>
            )}
            <h3>{selectedGenre.name}</h3>
            <p>
              <strong>Période :</strong> {selectedGenre.period}
            </p>
            {selectedGenre.tags && (
              <div style={{ marginTop: "10px" }}>
                {selectedGenre.tags.map((tag, idx) => (
                  <span key={idx} style={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
            <div style={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  style={{
                    ...styles.star,
                    color: star <= currentRating ? "#FFD700" : "#aaa"
                  }}
                  onClick={() => rateItem('genre', selectedGenre.name, star)}
                >
                  ★
                </span>
              ))}
            </div>
            <div>
              <strong>Variantes :</strong>
              <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
                {selectedGenre.variants && selectedGenre.variants.map((variant, index) => (
                  <li key={index}>
                    <strong>{variant.name}</strong> ({variant.period})
                    <p style={{ margin: "5px 0", fontSize: "14px" }}>{variant.description}</p>
                    {variant.spotifyLink && (
                      <a
                        href={variant.spotifyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1DB954",
                          textDecoration: "none",
                          fontWeight: "bold",
                          display: "inline-block",
                          marginTop: "5px"
                        }}
                      >
                        🎵 Écouter sur Spotify
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendu des connections du pays sélectionné
  const renderCountryConnections = () => {
    if (!selectedCountry) return null;
    
    const countryDetails = countriesData[selectedCountry.name];
    const ratingKey = `country:${selectedCountry.name}`;
    const currentRating = userPreferences.ratings[ratingKey] || 0;
    
    if (!countryDetails) return null;
    
    return (
      <div style={styles.preferencesSection}>
        <div style={styles.recommendationHeader}>
          <h2>Connexions Musicales</h2>
          <button 
            style={{...styles.button, ...styles.buttonSmall}}
            onClick={() => shareItem('country', selectedCountry.name)}
          >
            {t.share}
          </button>
        </div>
        <div style={{
          ...styles.recommendationGrid,
          ...(isMobile && styles.recommendationGridMobile)
        }}>
          <div style={styles.recommendationCard}>
            <h3>
              {countryDetails.flag} {selectedCountry.name}
            </h3>
            
            <div style={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  style={{
                    ...styles.star,
                    color: star <= currentRating ? "#FFD700" : "#aaa"
                  }}
                  onClick={() => rateItem('country', selectedCountry.name, star)}
                >
                  ★
                </span>
              ))}
            </div>
            
            <div style={{ marginTop: "15px" }}>
              <h4>{t.relatedCountries}</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {countryDetails.related.map((country: string, idx: number) => (
                  <span 
                    key={idx} 
                    style={{
                      ...styles.tag,
                      cursor: "pointer",
                      padding: "5px 10px"
                    }}
                    onClick={() => setSelectedCountry({ name: country })}
                  >
                    {country}
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: "15px" }}>
              <h4>{t.genres}</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {countryDetails.genres.map((genre: string, idx: number) => (
                  <span key={idx} style={styles.tag}>
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: "15px" }}>
              <h4>{t.popularArtists}</h4>
              <ul style={{ paddingLeft: "20px" }}>
                {countryDetails.popularArtists.map((artist: string, idx: number) => (
                  <li key={idx}>{artist}</li>
                ))}
              </ul>
            </div>
            
            <div style={{ marginTop: "15px" }}>
              <h4>{t.traditionalMusic}</h4>
              <ul style={{ paddingLeft: "20px" }}>
                {countryDetails.musicTraditions.map((tradition: string, idx: number) => (
                  <li key={idx}>{tradition}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendu des résultats de recherche
  const renderSearchResults = () => {
    const hasResults = searchResults.genres.length > 0 || searchResults.countries.length > 0;
    
    if (!searchTerm) return null;
    
    return (
      <div style={styles.searchResultsContainer}>
        <h2>{t.searchResults}</h2>
        
        {!hasResults && <p>{t.noResults}</p>}
        
        {searchResults.genres.length > 0 && (
          <>
            <h3>{t.genres}</h3>
            <div style={styles.searchResultsGrid}>
              {searchResults.genres.map((genre, index) => (
                <div 
                  key={`genre-result-${index}`} 
                  style={styles.searchResultsItem}
                  onClick={() => setSelectedGenre(genre)}
                >
                  <h4>{genre.name}</h4>
                  <p>{genre.period}</p>
                  {genre.tags && (
                    <div style={{ marginTop: "10px" }}>
                      {genre.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} style={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        
        {searchResults.countries.length > 0 && (
          <>
            <h3>{t.countries}</h3>
            <div style={styles.searchResultsGrid}>
              {searchResults.countries.map((country, index) => (
                <div 
                  key={`country-result-${index}`} 
                  style={styles.searchResultsItem}
                  onClick={() => setSelectedCountry({ name: country })}
                >
                  <h4>{countriesData[country]?.flag || ''} {country}</h4>
                  {countriesData[country]?.genres && (
                    <div style={{ marginTop: "10px" }}>
                      {countriesData[country].genres.slice(0, 3).map((genre: string, idx: number) => (
                        <span key={idx} style={styles.tag}>{genre}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };
  
  // Rendu de l'historique de recherche
  const renderSearchHistory = () => {
    if (!userPreferences.searchHistory?.length) return null;
    
    return (
      <div style={{ marginTop: '10px' }}>
        <h3>{t.recentSearches}</h3>
        <div>
          {userPreferences.searchHistory.map((term, index) => (
            <span 
              key={`history-${index}`} 
              style={styles.searchHistoryTag}
              onClick={() => selectSearchHistoryTerm(term)}
            >
              {term}
            </span>
          ))}
        </div>
      </div>
    );
  };
  
  // Rendu des recommandations
  const renderRecommendations = () => {
    if (recommendations.genres.length === 0 && recommendations.countries.length === 0) return null;
    
    return (
      <div style={styles.preferencesSection}>
        <h2 style={styles.sectionTitle}>{t.recommended}</h2>
        
        {recommendations.genres.length > 0 && (
          <>
            <h3>{t.recommendedGenres}</h3>
            <div style={{
              ...styles.recommendationList,
              ...(isMobile && styles.recommendationListMobile)
            }}>
              {recommendations.genres.map((genre, index) => (
                <div 
                  key={`rec-genre-${index}`} 
                  style={styles.recommendationItem}
                  onClick={() => setSelectedGenre(genre)}
                >
                  <h4>{genre.name}</h4>
                  <p>{genre.period}</p>
                  {genre.tags && (
                    <div style={{ marginTop: "5px" }}>
                      {genre.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} style={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        
        {recommendations.related.length > 0 && (
          <>
            <h3 style={{ marginTop: "20px" }}>{t.relatedGenres}</h3>
            <div style={{
              ...styles.recommendationList,
              ...(isMobile && styles.recommendationListMobile)
            }}>
              {recommendations.related.map((genre, index) => (
                <div 
                  key={`related-genre-${index}`} 
                  style={styles.recommendationItem}
                  onClick={() => setSelectedGenre(genre)}
                >
                  <h4>{genre.name}</h4>
                  <p>{genre.period}</p>
                  {genre.tags && (
                    <div style={{ marginTop: "5px" }}>
                      {genre.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} style={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        
        {recommendations.countries.length > 0 && (
          <>
            <h3 style={{ marginTop: "20px" }}>{t.recommendedCountries}</h3>
            <div style={{
              ...styles.recommendationList,
              ...(isMobile && styles.recommendationListMobile)
            }}>
              {recommendations.countries.map((country, index) => (
                <div 
                  key={`rec-country-${index}`} 
                  style={styles.recommendationItem}
                  onClick={() => setSelectedCountry({ name: country })}
                >
                  <h4>{countriesData[country]?.flag || ''} {country}</h4>
                  {countriesData[country]?.genres && (
                    <div style={{ marginTop: "5px" }}>
                      {countriesData[country].genres.slice(0, 2).map((genre: string, idx: number) => (
                        <span key={idx} style={styles.tag}>{genre}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        
        {recommendations.artists.length > 0 && (
          <>
            <h3 style={{ marginTop: "20px" }}>{t.artistsToDiscover}</h3>
            <div style={{
              ...styles.recommendationList,
              ...(isMobile && styles.recommendationListMobile)
            }}>
              {recommendations.artists.map((artist, index) => (
                <div 
                  key={`rec-artist-${index}`} 
                  style={styles.recommendationItem}
                >
                  <h4>{artist.name}</h4>
                  {artist.spotifyId && (
                    <a
                      href={`https://open.spotify.com/artist/${artist.spotifyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1DB954",
                        textDecoration: "none",
                        fontWeight: "bold",
                        display: "inline-block",
                        marginTop: "10px"
                      }}
                    >
                      🎵 Écouter sur Spotify
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };
  
  // Rendu des données Spotify
  const renderSpotifyData = () => {
    if (!userPreferences.spotifyConnected) {
      return (
        <div style={styles.preferencesSection}>
          <h2 style={styles.sectionTitle}>Spotify</h2>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p>Connectez-vous à Spotify pour accéder à vos données musicales</p>
            <button 
              onClick={connectToSpotify} 
              style={{
                ...styles.button,
                background: "#1DB954",
                marginTop: "15px"
              }}
            >
              {t.connectSpotify}
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div style={styles.preferencesSection}>
        <h2 style={styles.sectionTitle}>Spotify</h2>
        
        <div style={styles.spotifyCard}>
          <h3>{t.spotifyTracks}</h3>
          <ul style={styles.spotifyTrackList}>
            {spotifyData.topTracks.map((track) => (
              <li key={track.id} style={styles.spotifyTrackItem}>
                <img src={track.image} alt={track.name} style={styles.spotifyTrackImage} />
                <div style={styles.spotifyTrackInfo}>
                  <h4 style={styles.spotifyTrackName}>{track.name}</h4>
                  <p style={styles.spotifyTrackArtist}>{track.artist}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div style={styles.spotifyCard}>
          <h3>{t.spotifyArtists}</h3>
          <ul style={styles.spotifyTrackList}>
            {spotifyData.topArtists.map((artist) => (
              <li key={artist.id} style={styles.spotifyTrackItem}>
                <img src={artist.image} alt={artist.name} style={styles.spotifyTrackImage} />
                <div style={styles.spotifyTrackInfo}>
                  <h4 style={styles.spotifyTrackName}>{artist.name}</h4>
                  <p style={styles.spotifyTrackArtist}>{artist.genre}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div style={styles.spotifyCard}>
          <h3>{t.spotifyRecommendations}</h3>
          <ul style={styles.spotifyTrackList}>
            {spotifyData.recommendations.map((track) => (
              <li key={track.id} style={styles.spotifyTrackItem}>
                <img src={track.image} alt={track.name} style={styles.spotifyTrackImage} />
                <div style={styles.spotifyTrackInfo}>
                  <h4 style={styles.spotifyTrackName}>{track.name}</h4>
                  <p style={styles.spotifyTrackArtist}>{track.artist} - {track.album}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  
  // Rendu du modal d'authentification
  const renderAuthModal = () => {
    if (!isAuthModalOpen) return null;
    
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <h2>{isLoginMode ? t.loginTitle : t.signupTitle}</h2>
            <button 
              style={styles.closeButton}
              onClick={() => setIsAuthModalOpen(false)}
            >
              ×
            </button>
          </div>
          
          <form onSubmit={isLoginMode ? handleLogin : handleSignUp}>
            {!isLoginMode && (
              <div style={styles.formGroup}>
                <label style={styles.label}>{t.username}</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
            )}
            
            <div style={styles.formGroup}>
              <label style={styles.label}>{t.email}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>{t.password}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            
            {authError && <p style={styles.errorMessage}>{authError}</p>}
            
            <button 
              type="submit"
              style={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? t.loading : isLoginMode ? t.login : t.signup}
            </button>
          </form>
          
          <div style={styles.switchContainer}>
            <p 
              style={styles.switchText}
              onClick={() => setIsLoginMode(!isLoginMode)}
            >
              {isLoginMode ? t.orSignup : t.orLogin}
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  // Rendu du menu mobile
  const renderMobileMenu = () => {
    if (!isMobile) return null;
    
    return (
      <>
        {isMobileMenuOpen && <div style={styles.menuOverlay} />}
        <div 
          ref={mobileMenuRef}
          style={{
            ...styles.mobileMenu,
            ...(isMobileMenuOpen ? {} : styles.mobileMenuClosed)
          }}
        >
          <div style={styles.mobileMenuHeader}>
            <h2>{t.menu}</h2>
            <button 
              style={styles.closeButton}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ×
            </button>
          </div>
          
          <div>
            <div 
              style={styles.mobileMenuItem}
              onClick={() => {
                setLanguage(language === 'fr' ? 'en' : 'fr');
                setIsMobileMenuOpen(false);
              }}
            >
              {t.changeLanguage}
            </div>
            
            <div 
              style={styles.mobileMenuItem}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? t.lightMode : t.darkMode}
            </div>
            
            {user ? (
              <>
                <div style={styles.mobileMenuItem}>
                  {t.welcome}, {user.username}
                </div>
                <div 
                  style={styles.mobileMenuItem}
                  onClick={handleLogout}
                >
                  {t.logout}
                </div>
              </>
            ) : (
              <>
                <div 
                  style={styles.mobileMenuItem}
                  onClick={() => {
                    setIsLoginMode(true);
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {t.login}
                </div>
                <div 
                  style={styles.mobileMenuItem}
                  onClick={() => {
                    setIsLoginMode(false);
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {t.signup}
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  };
  
  // Rendu des notifications
  const renderNotifications = () => {
    return (
      <div style={styles.notificationsContainer}>
        {notifications.map(notification => (
          <div 
            key={notification.id}
            style={{
              ...styles.notification,
              ...(notification.type === 'success' ? styles.notificationSuccess : 
                notification.type === 'error' ? styles.notificationError : 
                styles.notificationInfo)
            }}
          >
            {notification.message}
          </div>
        ))}
      </div>
    );
  };

  // Rendu principal de l'application
  return (
    <ThemeProvider>
      <div style={styles.app}>
        {isLoading && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            color: "white",
            fontSize: "20px"
          }}>
            {t.loading}
          </div>
        )}
        
        <header style={{
          ...styles.header,
          ...(isMobile && styles.headerMobile)
        }}>
          {isMobile ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <button 
                  style={styles.mobileMenuButton}
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  ☰
                </button>
                <h1 style={styles.title}>{t.title}</h1>
                <div style={styles.themeToggle} onClick={toggleTheme}>
                  {theme === 'dark' ? '☀️' : '🌙'}
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 style={styles.title}>{t.title}</h1>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={styles.themeToggle} onClick={toggleTheme}>
                  {theme === 'dark' ? '☀️' : '🌙'}
                </div>
                <button
                  style={styles.button}
                  onClick={() => setLanguage((l) => (l === "fr" ? "en" : "fr"))}
                >
                  {language === "fr" ? "EN" : "FR"}
                </button>
                {user ? (
                  <div style={{ display: "flex", alignItems: "center", marginLeft: "15px" }}>
                    <img 
                      src={user.profilePicture}
                      alt={user.username}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        marginRight: "10px"
                      }}
                    />
                    <span style={{ marginRight: "15px" }}>{user.username}</span>
                    <button
                      style={{...styles.button, ...styles.buttonSmall}}
                      onClick={handleLogout}
                    >
                      {t.logout}
                    </button>
                  </div>
                ) : (
                  <div style={{ marginLeft: "15px" }}>
                    <button
                      style={{...styles.button, ...styles.buttonSmall, marginRight: "10px"}}
                      onClick={() => {
                        setIsLoginMode(true);
                        setIsAuthModalOpen(true);
                      }}
                    >
                      {t.login}
                    </button>
                    <button
                      style={{...styles.button, ...styles.buttonSmall}}
                      onClick={() => {
                        setIsLoginMode(false);
                        setIsAuthModalOpen(true);
                      }}
                    >
                      {t.signup}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </header>
        
        {/* Barre de recherche */}
        <form style={styles.searchContainer} onSubmit={handleSearch}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>
            {t.search}
          </button>
        </form>
        
        {renderSearchHistory()}
        {renderSearchResults()}

        <div style={{
          ...styles.wheelsSection,
          ...(isMobile && styles.wheelsSectionMobile)
        }}>
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
        {renderRecommendations()}
        {renderSpotifyData()}
        {renderAuthModal()}
        {renderMobileMenu()}
        {renderNotifications()}
      </div>
    </ThemeProvider>
  );
}

export default App;


