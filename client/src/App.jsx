import React, { useState, useEffect } from 'react';
import { Play, Download, X, Search, Star, AlertCircle, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import MovieRow from './components/MovieRow';
import Skeleton from './components/Skeleton';
import AuthModal from './components/AuthModal';
import Landing from './components/Landing';
import FeaturedHero from './components/FeaturedHero';
import MovieCard from './components/MovieCard';
import Footer from './components/Footer';
import TVShows from './pages/TVShows';
import LiveTV from './pages/LiveTV';
import FAQPage from './pages/FAQPage';
import AccountPage from './pages/AccountPage';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';
import axios from 'axios';
import './App.css';

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeTab, setActiveTab] = useState('trailer');
  const [selectedServer, setSelectedServer] = useState('autoembed');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [navBackground, setNavBackground] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  const handleMovieClick = async (movie, defaultTab = 'trailer') => {
    // Determine type (tv or movie) based on show structure
    const selected = { ...movie, type: movie.type || (movie.title?.includes('Series') || movie.name ? 'tv' : 'movie') };
    setSelectedMovie(selected);
    setActiveTab(defaultTab);
    setSelectedServer('autoembed');
    try {
      const response = await axios.get(`/api/movies/${selected.id}?type=${selected.type}`);
      setSelectedMovie({ ...response.data, type: selected.type });
    } catch (err) {
      console.error('Failed to fetch details');
    }
  };

  const getServerUrl = () => {
    if (!selectedMovie) return '';
    const isTV = selectedMovie.type === 'tv';
    switch (selectedServer) {
      case 'autoembed':
        return isTV 
          ? `https://autoembed.co/tv/tmdb/${selectedMovie.id}`
          : `https://autoembed.co/movie/tmdb/${selectedMovie.id}`;
      case 'embed_su':
        return isTV
          ? `https://embed.su/embed/tv/${selectedMovie.id}`
          : `https://embed.su/embed/movie/${selectedMovie.id}`;
      case 'vidsrc_to':
        return isTV
          ? `https://vidsrc.to/embed/tv/${selectedMovie.id}`
          : `https://vidsrc.to/embed/movie/${selectedMovie.id}`;
      case 'vidsrc_me':
        return isTV
          ? `https://vidsrc.me/embed/tv?tmdb=${selectedMovie.id}`
          : `https://vidsrc.me/embed/movie?tmdb=${selectedMovie.id}`;
      default:
        return isTV
          ? `https://autoembed.co/tv/tmdb/${selectedMovie.id}`
          : `https://autoembed.co/movie/tmdb/${selectedMovie.id}`;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setNavBackground(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already running in standalone mode (installed app), hide the install button
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  useEffect(() => {
    if (searchQuery) {
      setCurrentPage('home');
      const delaySearch = setTimeout(async () => {
        try {
          setSearching(true);
          const response = await axios.get(`/api/movies?search=${searchQuery}`);
          setSearchResults(response.data);
        } catch (err) {
          console.error('Search failed');
        } finally {
          setSearching(false);
        }
      }, 500);
      return () => clearTimeout(delaySearch);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const openAuth = (mode, email = '') => {
    setAuthMode(mode);
    setAuthEmail(email);
    setIsAuthModalOpen(true);
  };

  if (authLoading) return <div className="app-loader">Cine<span>Stream</span></div>;

  const renderContent = () => {
    if (currentPage === 'tv') {
      return <TVShows onShowClick={handleMovieClick} />;
    }
    if (currentPage === 'live') {
      return <LiveTV />;
    }
    if (currentPage === 'faq') {
      return <FAQPage />;
    }
    if (currentPage === 'account') {
      return <AccountPage user={user} onLogout={logout} />;
    }
    if (currentPage === 'contact') {
      return <ContactPage />;
    }
    if (['privacy', 'terms', 'cookies'].includes(currentPage)) {
      return <LegalPage type={currentPage} />;
    }

    if (!user) {
      return (
        <Landing 
          onGetStarted={(mode, email) => {
            setAuthEmail(email || '');
            openAuth(mode);
          }} 
          setCurrentPage={setCurrentPage}
        />
      );
    }

    return searchQuery ? (
      <main className="container search-results-view">
        <h2 className="search-title">Search Results for "{searchQuery}"</h2>
        {searching ? (
          <div className="movie-grid">
            {[...Array(8)].map((_, i) => <Skeleton key={i} type="card" />)}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="movie-grid">
            {searchResults.map(movie => (
              <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h2>No results found</h2>
            <p>Try searching for a different title, actor, or genre.</p>
          </div>
        )}
      </main>
    ) : (
      <>
        <FeaturedHero 
          onPlay={(movie) => handleMovieClick(movie, 'movie')} 
          onInfo={(movie) => handleMovieClick(movie, 'trailer')} 
        />
        <div className="rows-container">
          <MovieRow title="Trending Now" fetchUrl="/api/movies" onMovieClick={handleMovieClick} />
          <MovieRow title="Korean Hits (K-Drama & K-Movies)" fetchUrl="/api/movies?language=ko" onMovieClick={handleMovieClick} />
          <MovieRow title="Japanese Anime & Cinema" fetchUrl="/api/movies?language=ja" onMovieClick={handleMovieClick} />
          <MovieRow title="Bollywood & Indian Cinema" fetchUrl="/api/movies?language=hi" onMovieClick={handleMovieClick} />
          <MovieRow title="Action & Adventure" fetchUrl="/api/movies?genre=28" onMovieClick={handleMovieClick} />
          <MovieRow title="Comedy Hits" fetchUrl="/api/movies?genre=35" onMovieClick={handleMovieClick} />
          <MovieRow title="Top Rated Classics" fetchUrl="/api/movies?genre=18" onMovieClick={handleMovieClick} />
          <MovieRow title="Sci-Fi & Fantasy" fetchUrl="/api/movies?genre=878" onMovieClick={handleMovieClick} />
          <MovieRow title="Horror & Thriller" fetchUrl="/api/movies?genre=27" onMovieClick={handleMovieClick} />
          <MovieRow title="Romantic Stories" fetchUrl="/api/movies?genre=10749" onMovieClick={handleMovieClick} />
        </div>
      </>
    );
  };

  return (
    <div className="app">
      {(user || currentPage !== 'home') && (
        <nav className={`navbar ${navBackground || currentPage !== 'home' || searchQuery ? 'solid' : ''}`}>
        <div className="logo" onClick={() => {
          setCurrentPage('home');
          window.scrollTo({top: 0, behavior: 'smooth'});
          setSearchQuery('');
          const searchInput = document.querySelector('.search-bar input');
          if (searchInput) searchInput.value = '';
        }}>
          Cine<span>Stream</span>
        </div>
        
        <div className="search-bar">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Titles, people, genres" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="nav-actions">
          {showInstallBtn && (
            <button className="btn-install" onClick={handleInstallClick} title="Download CineStream App">
              <Download size={18} />
              <span>Install App</span>
            </button>
          )}
          {user ? (
            <div className="user-profile">
              <div className="user-info">
                {(user.photo_url || user.photoURL) && !imgError ? (
                  <img 
                    src={user.photo_url || user.photoURL} 
                    alt={user.username} 
                    className="user-avatar" 
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <UserIcon size={20} />
                )}
                <span className="username">{user.username}</span>
              </div>
              <button className="btn-icon" onClick={logout} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <button className="btn-text" onClick={() => openAuth('login')}>Sign In</button>
              <button className="btn-primary btn-sm" onClick={() => openAuth('register')}>Sign Up</button>
            </div>
          )}
        </div>
      </nav>
      )}

      {renderContent()}

      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className={`modal-content ${activeTab === 'movie' ? 'theater-mode' : ''}`} onClick={e => e.stopPropagation()}>
            <button className="close-btn" aria-label="Close modal" onClick={() => setSelectedMovie(null)}>
              <X size={24} />
            </button>
            
            <div className="modal-body">
              <div className="video-player-container">
                <div className="player-tabs">
                  <div className="tabs-group">
                    <button 
                      className={`player-tab ${activeTab === 'trailer' ? 'active' : ''}`}
                      onClick={() => setActiveTab('trailer')}
                    >
                      Trailer
                    </button>
                    <button 
                      className={`player-tab ${activeTab === 'movie' ? 'active' : ''}`}
                      onClick={() => setActiveTab('movie')}
                    >
                      Full Movie
                    </button>
                  </div>
                  
                  {activeTab === 'movie' && (
                    <div className="server-selector">
                      <select 
                        value={selectedServer} 
                        onChange={(e) => setSelectedServer(e.target.value)}
                        className="server-select"
                      >
                        <option value="autoembed">Server 1 (AutoEmbed - Clean)</option>
                        <option value="embed_su">Server 2 (Embed.su - Fast)</option>
                        <option value="vidsrc_to">Server 3 (VidSrc.to)</option>
                        <option value="vidsrc_me">Server 4 (VidSrc.me)</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="video-player">
                  {activeTab === 'movie' ? (
                    <iframe
                      key={selectedServer}
                      width="100%"
                      height="100%"
                      src={getServerUrl()}
                      title="Full Movie Player"
                      frameBorder="0"
                      sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  ) : selectedMovie.videoUrl ? (
                    <iframe
                      key={selectedMovie.videoUrl}
                      width="100%"
                      height="100%"
                      src={selectedMovie.videoUrl}
                      title="Movie Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="no-video">
                      <Play size={64} />
                      <p>Trailer not available</p>
                    </div>
                  )}
                </div>

                {activeTab === 'movie' && (
                  <div className="player-notice">
                    <AlertCircle size={16} />
                    <span>If the stream fails, try switching <strong>Servers</strong> at the top right. Note: Brand new theater releases may not be streaming yet.</span>
                  </div>
                )}
              </div>
              
              <div className="details">
                <h2>{selectedMovie.title}</h2>
                <div className="meta">
                  <span className="badge">{selectedMovie.year}</span>
                  <span className="rating"><Star size={16} fill="currentColor" /> {(selectedMovie.rating || 0).toFixed(1)}</span>
                </div>
                <p className="description">{selectedMovie.description}</p>
                <div className="actions">
                  <button className="btn-primary" onClick={() => setActiveTab('movie')}>
                    <Play size={20} fill="currentColor" /> Watch Now
                  </button>
                  <button className="btn-secondary" onClick={() => alert('Download coming soon!')}>
                    <Download size={20} /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer onAuthClick={openAuth} user={user} setCurrentPage={setCurrentPage} />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode}
        initialEmail={authEmail}
      />
    </div>
  );
}

export default App;
