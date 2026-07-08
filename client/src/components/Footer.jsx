import React from 'react';
import './Footer.css';

const Footer = ({ onAuthClick, user, setCurrentPage }) => {
  const handleLinkClick = (action, e) => {
    e.preventDefault();
    if (action === 'browse') {
      if (setCurrentPage) setCurrentPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Short timeout to let the home screen render before focusing
      setTimeout(() => {
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) searchInput.focus();
      }, 100);
    } else if (action === 'account') {
      if (user) {
        if (setCurrentPage) setCurrentPage('account');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        onAuthClick('login');
      }
    } else {
      if (setCurrentPage) {
        setCurrentPage(action);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer-premium">
      <div className="footer-content">
        <div className="logo-small">Cine<span>Stream</span></div>
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="#" onClick={(e) => handleLinkClick('browse', e)}>Browse Movies</a>
            <a href="#" onClick={(e) => handleLinkClick('tv', e)}>TV Shows</a>
            <a href="#" onClick={(e) => handleLinkClick('live', e)}>Live TV</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#" onClick={(e) => handleLinkClick('faq', e)}>FAQ & Help</a>
            <a href="#" onClick={(e) => handleLinkClick('account', e)}>Account</a>
            <a href="#" onClick={(e) => handleLinkClick('contact', e)}>Contact Us</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#" onClick={(e) => handleLinkClick('privacy', e)}>Privacy Policy</a>
            <a href="#" onClick={(e) => handleLinkClick('terms', e)}>Terms of Use</a>
            <a href="#" onClick={(e) => handleLinkClick('cookies', e)}>Cookie Policy</a>
          </div>
        </div>
        <p className="copyright">© 2026 CineStream Entertainment Inc. Built with passion.</p>
      </div>
    </footer>
  );
};

export default Footer;
