import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, X, Monitor, Smartphone, Globe, Shield, Zap } from 'lucide-react';
import axios from 'axios';
import './Landing.css';

const Landing = ({ onGetStarted }) => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [previewMovies, setPreviewMovies] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await axios.get('/api/movies');
        setPreviewMovies(response.data.slice(0, 12));
      } catch (err) {
        console.error('Failed to fetch preview movies');
      }
    };
    fetchPreview();
  }, []);

  const handleGetStarted = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    onGetStarted('register', email);
  };

  const faqs = [
    {
      q: "What is CineStream?",
      a: "CineStream is a premium streaming service that offers a vast library of award-winning movies, TV shows, and original content on demand."
    },
    {
      q: "Where can I watch?",
      a: "Watch anywhere, anytime. Sign in with your CineStream account to watch instantly on the web or on any internet-connected device."
    },
    {
      q: "How do I cancel?",
      a: "CineStream is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks."
    },
    {
      q: "What can I watch on CineStream?",
      a: "CineStream has an extensive library of feature films, documentaries, TV shows, anime, and more. Watch as much as you want, anytime you want."
    }
  ];

  return (
    <div className="landing-premium">
      {/* Background Layer */}
      <div className="landing-bg-overlay"></div>

      {/* Navigation */}
      <nav className="p-nav">
        <div className="logo large">Cine<span>Stream</span></div>
        <button className="btn-glass" onClick={() => onGetStarted('login')}>Sign In</button>
      </nav>

      {/* Hero Section */}
      <header className="p-hero">
        <div className="p-hero-content">
          <div className="badge-pill">NEW RELEASES EVERY WEEK</div>
          <h1>Unlimited movies, TV shows, and more.</h1>
          <p className="p-subtitle">Experience cinema-quality streaming at home or on the go.</p>
          
          <div className="p-cta-box">
            <p>Ready to watch? Join the CineStream community today.</p>
            <form className="p-email-row" onSubmit={handleGetStarted}>
              <input 
                type="email" 
                placeholder="Email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-premium-cta">
                Get Started <ChevronRight size={24} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content Preview Strip */}
      <section className="p-preview-section">
        <div className="p-scroll-track">
          <div className="p-scroll-content">
            {previewMovies.map(movie => (
              <img key={movie.id} src={movie.posterUrl} alt={movie.title} className="p-preview-poster" />
            ))}
            {/* Duplicate for infinite loop feel */}
            {previewMovies.map(movie => (
              <img key={`dup-${movie.id}`} src={movie.posterUrl} alt={movie.title} className="p-preview-poster" />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="p-features">
        <div className="p-feature-card">
          <div className="p-icon-box"><Zap size={32} /></div>
          <h3>Ultra HD Streaming</h3>
          <p>Watch in stunning 4K resolution with HDR10+ and Dolby Atmos support.</p>
        </div>
        <div className="p-feature-card">
          <div className="p-icon-box"><Monitor size={32} /></div>
          <h3>Cross-Platform</h3>
          <p>Switch seamlessly between your TV, laptop, phone, and tablet.</p>
        </div>
        <div className="p-feature-card">
          <div className="p-icon-box"><Shield size={32} /></div>
          <h3>Offline Viewing</h3>
          <p>Download your favorites and watch them on the plane or on the train.</p>
        </div>
        <div className="p-feature-card">
          <div className="p-icon-box"><Globe size={32} /></div>
          <h3>Global Library</h3>
          <p>Access exclusive titles from around the world, localized for your region.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="p-faq">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="p-faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className="p-faq-item">
              <button className="p-faq-q" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                {faq.q}
                {activeFaq === i ? <X size={28} /> : <Plus size={28} />}
              </button>
              <div className={`p-faq-a ${activeFaq === i ? 'open' : ''}`}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="p-bottom-cta">
        <h2>Start your cinematic journey now.</h2>
        <button className="btn-premium-cta large" onClick={handleGetStarted}>
          Join CineStream <ChevronRight size={28} />
        </button>
      </section>

    </div>
  );
};

export default Landing;
