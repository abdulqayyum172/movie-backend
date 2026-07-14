import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Download, X, Search, Star, AlertCircle,
  LogOut, User as UserIcon, Menu, Home, Tv, Radio,
  HelpCircle, Phone, FileText, Maximize, RotateCw
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
  const [selectedDlServer, setSelectedDlServer] = useState('vidlink');
  const [selectedServer, setSelectedServer] = useState('vidsrc_me');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
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
    setSelectedSeason(1);
    setSelectedEpisode(1);
    setMobileMenuOpen(false);
    try {
      const res = await axios.get(`/api/movies/${selected.id}?type=${selected.type}`);
      setSelectedMovie({ ...res.data, type: selected.type });
    } catch { /* silent */ }
  };

  /* ---- watch config ---- */
  const WATCH_SERVERS = [
    {
      id: 'vidsrc_me',
      label: 'Server 1 (VidSrc.me)',
      getUrl: (id, isTV, s, e) => isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
        : `https://vidsrc.me/embed/movie?tmdb=${id}`,
    },
    {
      id: 'vidsrc_xyz',
      label: 'Server 2 (VidSrc.xyz)',
      getUrl: (id, isTV, s, e) => isTV
        ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
        : `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    },
    {
      id: 'vidlink',
      label: 'Server 3 (VidLink.pro)',
      getUrl: (id, isTV, s, e) => isTV
        ? `https://vidlink.pro/tv/${id}/${s}/${e}`
        : `https://vidlink.pro/movie/${id}`,
    },
    {
      id: 'multiembed',
      label: 'Server 4 (MultiEmbed)',
      getUrl: (id, isTV, s, e) => isTV
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&tv=1&s=${s}&e=${e}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    },
  ];

  /* ---- stream server URL ---- */
  const getServerUrl = () => {
    if (!selectedMovie) return '';
    const isTV = selectedMovie.type === 'tv';
    const server = WATCH_SERVERS.find(s => s.id === selectedServer) || WATCH_SERVERS[0];
    return server.getUrl(selectedMovie.id, isTV, selectedSeason, selectedEpisode);
  };

  /* ---- download config ---- */
  const DOWNLOAD_SERVERS = [
    {
      id: 'vidlink',
      label: 'Server 1 (VidLink - Recommended)',
      getUrl: (id, isTV, imdbId, s, e) => isTV
        ? `https://vidlink.pro/download/tv/${id}/${s}/${e}`
        : `https://vidlink.pro/download/movie/${id}`,
    },
    {
      id: 'dl_vidsrc',
      label: 'Server 2 (VidSrc VIP)',
      getUrl: (id, isTV, imdbId, s, e) => isTV
        ? `https://dl.vidsrc.vip/tv/${imdbId || id}/${s}/${e}`
        : `https://dl.vidsrc.vip/movie/${imdbId || id}`,
    },
    {
      id: 'vidsrc_xyz',
      label: 'Server 3 (VidSrc.xyz)',
      getUrl: (id, isTV, imdbId, s, e) => isTV
        ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
        : `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    },
    {
      id: 'moviesapi',
      label: 'Server 4 (MoviesAPI)',
      getUrl: (id, isTV, imdbId, s, e) => isTV
        ? `https://moviesapi.club/tv/${id}-${s}-${e}`
        : `https://moviesapi.club/movie/${id}`,
    },
    {
      id: 'multiembed',
      label: 'Server 5 (MultiEmbed)',
      getUrl: (id, isTV, imdbId, s, e) => isTV
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&tv=1&s=${s}&e=${e}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    },
  ];

  const QUALITY_OPTIONS = [
    { label: '360p',  tag: 'SD',  color: '#6b7280' },
    { label: '480p',  tag: 'SD+', color: '#8b5cf6' },
    { label: '720p',  tag: 'HD',  color: '#3b82f6' },
    { label: '1080p', tag: 'FHD', color: '#10b981' },
    { label: '4K',    tag: 'UHD', color: '#f59e0b' },
  ];

  const getDownloadUrl = () => {
    if (!selectedMovie) return '#';
    const isTV = selectedMovie.type === 'tv';
    const server = DOWNLOAD_SERVERS.find(s => s.id === selectedDlServer) || DOWNLOAD_SERVERS[0];
    return server.getUrl(selectedMovie.id, isTV, selectedMovie.imdb_id, selectedSeason, selectedEpisode);
  };

  /* ---- Fullscreen & Orientation Lock ---- */
  const handleFullscreenAndRotate = async () => {
    const container = document.querySelector('.video-player-container');
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          await container.webkitRequestFullscreen();
        }
        
        if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock('landscape').catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
      }
    } catch (err) {
      console.warn("Fullscreen/orientation lock failed:", err);
    }
  };

  const lastTapRef = useRef(0);
  const handlePlayerDoubleTap = async (e) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      await handleFullscreenAndRotate();
    }
    lastTapRef.current = now;
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
          onGetStarted={(mode, email) => openAuth(mode, email || '')}
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
    <div className="app animate-fade-in">
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
                    <button
                      className={`player-tab download-tab ${activeTab === 'download' ? 'active' : ''}`}
                      onClick={() => setActiveTab('download')}
                    ><Download size={14} style={{marginRight:'4px'}} /> Download</button>
                  </div>

                    <div className="server-selector" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {selectedMovie.type === 'tv' && (activeTab === 'movie' || activeTab === 'download') && (
                        <div className="tv-selectors" style={{ display: 'flex', gap: '0.4rem' }}>
                          <select
                            className="server-select"
                            value={selectedSeason}
                            onChange={e => {
                              setSelectedSeason(Number(e.target.value));
                              setSelectedEpisode(1);
                            }}
                          >
                            {Array.from({ length: selectedMovie.number_of_seasons || 1 }, (_, i) => i + 1).map(s => (
                              <option key={s} value={s}>S{s}</option>
                            ))}
                          </select>
                          <select
                            className="server-select"
                            value={selectedEpisode}
                            onChange={e => setSelectedEpisode(Number(e.target.value))}
                          >
                            {(() => {
                              const s = selectedMovie.seasons?.find(season => season.season_number === Number(selectedSeason));
                              const count = s ? s.episode_count : 24;
                              return Array.from({ length: count }, (_, i) => i + 1).map(ep => (
                                <option key={ep} value={ep}>Ep {ep}</option>
                              ));
                            })()}
                          </select>
                        </div>
                      )}

                      {activeTab === 'movie' && (
                        <select
                          className="server-select"
                          value={selectedServer}
                          onChange={e => setSelectedServer(e.target.value)}
                        >
                          {WATCH_SERVERS.map(srv => (
                            <option key={srv.id} value={srv.id}>{srv.label}</option>
                          ))}
                        </select>
                      )}

                      {activeTab === 'movie' && (
                        <button
                          className="server-select"
                          onClick={handleFullscreenAndRotate}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.6rem' }}
                          title="Rotate / Fullscreen"
                        >
                          <Maximize size={12} />
                          <RotateCw size={12} />
                        </button>
                      )}
                    </div>
                </div>

                  <div 
                    className={`video-player ${activeTab === 'download' ? 'download-mode' : ''}`}
                    onTouchStart={handlePlayerDoubleTap}
                  >
                    {activeTab === 'download' ? (
                      <div className="download-panel">
                        <div className="dl-header">
                          <Download size={32} className="dl-header-icon" />
                          <div>
                            <h3>{selectedMovie.title}</h3>
                            <p>Pick a server, then click your preferred quality to download.</p>
                          </div>
                        </div>

                        <div className="dl-server-row">
                          <span className="dl-server-label">Download Server:</span>
                          <div className="server-selector">
                            <select
                              className="server-select"
                              value={selectedDlServer}
                              onChange={e => setSelectedDlServer(e.target.value)}
                            >
                              {DOWNLOAD_SERVERS.map(srv => (
                                <option key={srv.id} value={srv.id}>{srv.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <p className="dl-quality-label">Select Quality:</p>
                        <div className="dl-quality-grid">
                          {QUALITY_OPTIONS.map(q => (
                            <a
                              key={q.label}
                              href={getDownloadUrl()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="dl-quality-btn"
                            >
                              <span className="dl-quality-tag" style={{ background: q.color }}>{q.tag}</span>
                              <span className="dl-quality-res">{q.label}</span>
                              <Download size={15} />
                            </a>
                          ))}
                        </div>

                        <div className="dl-notice">
                          <AlertCircle size={14} />
                          <span>If a server doesn't work, switch servers above and retry.</span>
                        </div>
                      </div>
                    ) : activeTab === 'movie' ? (
                      <iframe
                        key="vidsrc"
                        src={getServerUrl()}
                        title="Full Movie Player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock"
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
                    <span>Using the most reliable unified server. Please be patient while it loads.</span>
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
                  <button className="btn-secondary" onClick={() => setActiveTab('download')}>
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
