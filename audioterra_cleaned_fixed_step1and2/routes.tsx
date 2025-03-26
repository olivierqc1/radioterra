import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import SpotifyDashboard from './pages/SpotifyDashboard';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/spotify" element={<SpotifyDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
