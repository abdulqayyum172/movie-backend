import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Download, X, Search, Star, AlertCircle,
  LogOut, User as UserIcon, Menu, Home, Tv, Radio,
  HelpCircle, Phone, FileText
} from 'lucide-react';
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

const NAV_ITEMS = [
  { label: 'Home',    page: 'home',    icon: <Home size={18} /> },
  { label: 'TV Shows',page: 'tv',      icon: <Tv size={18} /> },
  { label: 'Live TV', page: 'live',    icon: <Radio size={18} /> },
  { label: 'FAQ',     page: 'faq',     icon: <HelpCircle size={18} /> },
  { label: 'Contact', page: 'contact', icon: <Phone size={18} /> },
];

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage]     = useState('home');
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]         = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeTab, setActiveTab]         = useState('trailer');
  const [selectedServer, setSelectedServer] = useState('autoembed');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode]           = useState('login');
  const [authEmail, setAuthEmail]         = useState('');
  const [navBackground, setNavBackground] = useState(false);
  const [imgError, setImgError]           = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileSearchRef = useRef(null);

  /* ---- scroll handler ---- */
  useEffect(() => {
    const onScroll = () => setNavBackground(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---- PWA install ---- */
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setShowInstallBtn(false);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Install prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  /* ---- search ---- */
  useEffect(() => {
    if (searchQuery) {
      setCurrentPage('home');
      const t = setTimeout(async () => {
        try {
          setSearching(true);
          const res = await axios.get(`/api/movies?search=${searchQuery}`);
          setSearchResults(res.data);
        } catch { /* silent */ }
        finally { setSearching(false); }
      }, 500);
      return () => clearTimeout(t);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  /* ---- movie click ---- */
  const handleMovieClick = async (movie, defaultTab = 'trailer') => {
    const selected = {
      ...movie,
      type: movie.type || (movie.title?.includes('Series') || movie.name ? 'tv' : 'movie'),
    };
    setSelectedMovie(selected);
    setActiveTab(defaultTab);
    setSelectedServer('autoembed');
    setMobileMenuOpen(false);
    try {
      const res = await axios.get(`/api/movies/${selected.id}?type=${selected.type}`);
      setSelectedMovie({ ...res.data, type: selected.type });
    } catch { /* silent */ }
  };

  /* ---- server URL ---- */
  const getServerUrl = () => {
    if (!selectedMovie) return '';
    const isTV = selectedMovie.type === 'tv';
    const id   = selectedMovie.id;
    switch (selectedServer) {
      case 'autoembed': return isTV ? `https://autoembed.co/tv/tmdb/${id}` : `https://autoembed.co/movie/tmdb/${id}`;
      case 'embed_su':  return isTV ? `https://embed.su/embed/tv/${id}` : `https://embed.su/embed/movie/${id}`;
      case 'vidsrc_to': return isTV ? `https://vidsrc.to/embed/tv/${id}` : `https://vidsrc.to/embed/movie/${id}`;
      case 'vidsrc_me': return isTV ? `https://vidsrc.me/embed/tv?tmdb=${id}` : `https://vidsrc.me/embed/movie?tmdb=${id}`;
      default:          return isTV ? `https://autoembed.co/tv/tmdb/${id}` : `https://autoembed.co/movie/tmdb/${id}`;
    }
  };

  const openAuth = (mode, email = '') => {
    setAuthMode(mode);
    setAuthEmail(email);
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setSearchQuery('');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) return <div className="app-loader">Cine<span>Stream</span></div>;

  /* ---- page renderer ---- */
  const renderContent = () => {
    if (currentPage === 'tv')      return <TVShows onShowClick={handleMovieClick} />;
    if (currentPage === 'live')    return <LiveTV />;
    if (currentPage === 'faq')     return <FAQPage />;
    if (currentPage === 'account') return <AccountPage user={user} onLogout={logout} />;
    if (currentPage === 'contact') return <ContactPage />;
    if (['privacy','terms','cookies'].includes(currentPage)) return <LegalPage type={currentPage} />;

    if (!user) {
      return (
        <Landing
          onGetStarted={(mode, email) => { setAuthEmail(email || ''); openAuth(mode); }}
          setCurrentPage={setCurrentPage}
        />
      );
    }

    return searchQuery ? (
      <main className="container search-results-view">
        <h2 className="search-title">Results for "{searchQuery}"</h2>
        {searching ? (
          <div className="movie-grid">{[...Array(8)].map((_,i) => <Skeleton key={i} type="card" />)}</div>
        ) : searchResults.length > 0 ? (
          <div className="movie-grid">
            {searchResults.map(m => <MovieCard key={m.id} movie={m} onClick={handleMovieClick} />)}
          </div>
        ) : (
          <div className="no-results">
            <h2>No results found</h2>
            <p>Try a different title, actor, or genre.</p>
          </div>
        )}
      </main>
    ) : (
      <>
        <FeaturedHero
          onPlay={(m) => handleMovieClick(m, 'movie')}
          onInfo={(m) => handleMovieClick(m, 'trailer')}
        />
        <div className="rows-container">
          {/* ── GLOBAL & TRENDING ─────────────────────────────── */}
          <MovieRow title="🌍 Trending Worldwide"          fetchUrl="/api/movies"                          onMovieClick={handleMovieClick} />
          <MovieRow title="⭐ Top Rated All Time"           fetchUrl="/api/movies/top-rated"                onMovieClick={handleMovieClick} />
          <MovieRow title="🎬 Coming Soon"                 fetchUrl="/api/movies/upcoming"                 onMovieClick={handleMovieClick} />

          {/* ── AFRICA ────────────────────────────────────────── */}
          <MovieRow title="🇳🇬 Nollywood — Nigeria & Ghana"  fetchUrl="/api/movies?region=NG,GH"             onMovieClick={handleMovieClick} />
          <MovieRow title="🇿🇦 South African Cinema"         fetchUrl="/api/movies?region=ZA"                onMovieClick={handleMovieClick} />
          <MovieRow title="🌍 French-African Cinema"         fetchUrl="/api/movies?region=CI,SN,CM,ML,BF"    onMovieClick={handleMovieClick} />
          <MovieRow title="🌍 East & North Africa"           fetchUrl="/api/movies?region=EG,ET,KE,TZ,MA,DZ" onMovieClick={handleMovieClick} />

          {/* ── ASIA ─────────────────────────────────────────── */}
          <MovieRow title="🇰🇷 Korean Hits & K-Dramas"       fetchUrl="/api/movies?language=ko"              onMovieClick={handleMovieClick} />
          <MovieRow title="🇯🇵 Japanese Anime & Cinema"      fetchUrl="/api/movies?language=ja"              onMovieClick={handleMovieClick} />
          <MovieRow title="🇨🇳 Chinese Cinema"               fetchUrl="/api/movies?region=CN,HK,TW"          onMovieClick={handleMovieClick} />
          <MovieRow title="🇮🇳 Bollywood & Indian Cinema"    fetchUrl="/api/movies?language=hi"              onMovieClick={handleMovieClick} />
          <MovieRow title="🇮🇳 Tamil & South Indian"         fetchUrl="/api/movies?language=ta"              onMovieClick={handleMovieClick} />
          <MovieRow title="🇹🇭 Thai Cinema"                  fetchUrl="/api/movies?region=TH"                onMovieClick={handleMovieClick} />
          <MovieRow title="🇵🇭 Filipino Movies"              fetchUrl="/api/movies?region=PH"                onMovieClick={handleMovieClick} />
          <MovieRow title="🇮🇩 Indonesian Cinema"            fetchUrl="/api/movies?region=ID"                onMovieClick={handleMovieClick} />

          {/* ── MIDDLE EAST ──────────────────────────────────── */}
          <MovieRow title="🌙 Arabic Cinema"                 fetchUrl="/api/movies?language=ar"              onMovieClick={handleMovieClick} />
          <MovieRow title="🇮🇷 Persian & Iranian Cinema"     fetchUrl="/api/movies?language=fa"              onMovieClick={handleMovieClick} />
          <MovieRow title="🇹🇷 Turkish Drama & Films"        fetchUrl="/api/movies?language=tr"              onMovieClick={handleMovieClick} />

          {/* ── EUROPE ───────────────────────────────────────── */}
          <MovieRow title="🇫🇷 French Cinema"                fetchUrl="/api/movies?language=fr"              onMovieClick={handleMovieClick} />
          <MovieRow title="🇪🇸 Spanish Cinema"               fetchUrl="/api/movies?language=es"              onMovieClick={handleMovieClick} />
          <MovieRow title="🇩🇪 German Cinema"                fetchUrl="/api/movies?language=de"              onMovieClick={handleMovieClick} />
          <MovieRow title="🇮🇹 Italian Cinema"               fetchUrl="/api/movies?language=it"              onMovieClick={handleMovieClick} />
          <MovieRow title="🇷🇺 Russian Cinema"               fetchUrl="/api/movies?language=ru"              onMovieClick={handleMovieClick} />
          <MovieRow title="🇸🇪 Scandinavian Cinema"          fetchUrl="/api/movies?region=SE,NO,DK,FI"       onMovieClick={handleMovieClick} />

          {/* ── LATIN AMERICA ────────────────────────────────── */}
          <MovieRow title="🇧🇷 Brazilian Cinema"             fetchUrl="/api/movies?region=BR"                onMovieClick={handleMovieClick} />
          <MovieRow title="🇲🇽 Mexican Cinema"               fetchUrl="/api/movies?region=MX"                onMovieClick={handleMovieClick} />
          <MovieRow title="🌎 Latin American Films"           fetchUrl="/api/movies?region=CO,AR,CL,PE,VE"   onMovieClick={handleMovieClick} />

          {/* ── GENRES ───────────────────────────────────────── */}
          <MovieRow title="💥 Action & Adventure"            fetchUrl="/api/movies?genre=28"                 onMovieClick={handleMovieClick} />
          <MovieRow title="😂 Comedy Hits"                   fetchUrl="/api/movies?genre=35"                 onMovieClick={handleMovieClick} />
          <MovieRow title="🎭 Drama"                         fetchUrl="/api/movies?genre=18"                 onMovieClick={handleMovieClick} />
          <MovieRow title="🚀 Sci-Fi & Fantasy"              fetchUrl="/api/movies?genre=878"                onMovieClick={handleMovieClick} />
          <MovieRow title="😱 Horror & Thriller"             fetchUrl="/api/movies?genre=27"                 onMovieClick={handleMovieClick} />
          <MovieRow title="❤️ Romance"                       fetchUrl="/api/movies?genre=10749"              onMovieClick={handleMovieClick} />
          <MovieRow title="🎶 Music & Musicals"              fetchUrl="/api/movies?genre=10402"              onMovieClick={handleMovieClick} />
          <MovieRow title="🔍 Mystery & Crime"               fetchUrl="/api/movies?genre=9648"               onMovieClick={handleMovieClick} />
          <MovieRow title="📜 History & War"                 fetchUrl="/api/movies?genre=36"                 onMovieClick={handleMovieClick} />
          <MovieRow title="🎥 Documentary"                   fetchUrl="/api/movies?genre=99"                 onMovieClick={handleMovieClick} />
          <MovieRow title="🧸 Animation & Family"            fetchUrl="/api/movies?genre=16"                 onMovieClick={handleMovieClick} />
        </div>
      </>
    );
  };

  const showNavbar = user || currentPage !== 'home';

  return (
    <div className="app">
      {/* ===== NAVBAR ===== */}
      {showNavbar && (
        <nav className={`navbar ${navBackground || currentPage !== 'home' || searchQuery ? 'solid' : ''}`}>
          {/* Logo */}
          <div className="logo" onClick={() => navigateTo('home')}>
            Cine<span>Stream</span>
          </div>

          {/* Desktop search */}
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Titles, people, genres"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Desktop nav actions */}
          <div className="nav-actions">
            {showInstallBtn && (
              <button className="btn-install" onClick={handleInstallClick} title="Install App">
                <Download size={16} /><span>Install App</span>
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
                    <UserIcon size={18} />
                  )}
                  <span className="username">{user.username}</span>
                </div>
                <button className="btn-icon" onClick={logout} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="auth-btns">
                <button className="btn-text" onClick={() => openAuth('login')}>Sign In</button>
                <button className="btn-primary" onClick={() => openAuth('register')}>Sign Up</button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </nav>
      )}

      {/* ===== MOBILE MENU DRAWER ===== */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
        {/* backdrop closes menu */}
        <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} />

        <div className="mobile-menu-panel">
          {/* Search inside drawer */}
          <div className="mobile-search">
            <Search size={18} />
            <input
              ref={mobileSearchRef}
              type="text"
              placeholder="Titles, people, genres…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setMobileMenuOpen(false); }}
            />
          </div>

          {/* Navigation items */}
          <span className="mobile-menu-label">Browse</span>
          {NAV_ITEMS.map(item => (
            <button
              key={item.page}
              className={`mobile-menu-item ${currentPage === item.page ? 'active' : ''}`}
              onClick={() => navigateTo(item.page)}
            >
              {item.icon} {item.label}
            </button>
          ))}

          {/* User section */}
          {user ? (
            <>
              <span className="mobile-menu-label" style={{ marginTop: '1rem' }}>Account</span>
              <div className="mobile-user-card">
                {(user.photo_url || user.photoURL) && !imgError ? (
                  <img
                    src={user.photo_url || user.photoURL}
                    alt={user.username}
                    className="user-avatar"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <UserIcon size={20} color="#fff" />
                  </div>
                )}
                <div>
                  <div className="user-name">{user.username}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              <button
                className="mobile-menu-item"
                onClick={() => { logout(); setMobileMenuOpen(false); }}
              >
                <LogOut size={18} /> Sign Out
              </button>
            </>
          ) : (
            <div className="mobile-auth-btns">
              <button className="btn-secondary" onClick={() => openAuth('login')}>Sign In</button>
              <button className="btn-primary"   onClick={() => openAuth('register')}>Create Account</button>
            </div>
          )}

          {/* Install button */}
          {showInstallBtn && (
            <button
              className="btn-install"
              onClick={() => { handleInstallClick(); setMobileMenuOpen(false); }}
              style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}
            >
              <Download size={16} /> Install App
            </button>
          )}
        </div>
      </div>

      {/* ===== PAGE CONTENT ===== */}
      {renderContent()}

      {/* ===== MOVIE DETAIL MODAL ===== */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div
            className={`modal-content ${activeTab === 'movie' ? 'theater-mode' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <button className="close-btn" aria-label="Close" onClick={() => setSelectedMovie(null)}>
              <X size={20} />
            </button>

            <div className="modal-body">
              <div className="video-player-container">
                <div className="player-tabs">
                  <div className="tabs-group">
                    <button
                      className={`player-tab ${activeTab === 'trailer' ? 'active' : ''}`}
                      onClick={() => setActiveTab('trailer')}
                    >Trailer</button>
                    <button
                      className={`player-tab ${activeTab === 'movie' ? 'active' : ''}`}
                      onClick={() => setActiveTab('movie')}
                    >Full Movie</button>
                  </div>

                  {activeTab === 'movie' && (
                    <div className="server-selector">
                      <select
                        value={selectedServer}
                        onChange={e => setSelectedServer(e.target.value)}
                        className="server-select"
                      >
                        <option value="autoembed">Server 1 (AutoEmbed)</option>
                        <option value="embed_su">Server 2 (Embed.su)</option>
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
                      src={getServerUrl()}
                      title="Full Movie Player"
                      frameBorder="0"
                      sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : selectedMovie.videoUrl ? (
                    <iframe
                      key={selectedMovie.videoUrl}
                      src={selectedMovie.videoUrl}
                      title="Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="no-video"><Play size={48} /><p>Trailer not available</p></div>
                  )}
                </div>

                {activeTab === 'movie' && (
                  <div className="player-notice">
                    <AlertCircle size={15} />
                    <span>If the stream fails, try switching <strong>Servers</strong> above.</span>
                  </div>
                )}
              </div>

              <div className="details">
                <h2>{selectedMovie.title}</h2>
                <div className="meta">
                  <span className="badge">{selectedMovie.year}</span>
                  <span className="rating"><Star size={14} fill="currentColor" /> {(selectedMovie.rating || 0).toFixed(1)}</span>
                </div>
                <p className="description">{selectedMovie.description}</p>
                <div className="actions">
                  <button className="btn-primary" onClick={() => setActiveTab('movie')}>
                    <Play size={18} fill="currentColor" /> Watch
                  </button>
                  <button className="btn-secondary" onClick={() => alert('Download coming soon!')}>
                    <Download size={18} /> Download
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
