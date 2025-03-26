import { Genre } from '../types/genre';

export const genreData: { genres: Genre[] } = {
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

export default genreData;
