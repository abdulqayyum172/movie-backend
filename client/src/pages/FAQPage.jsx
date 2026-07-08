import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import './FAQPage.css';

const FAQPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      q: "What is CineStream?",
      a: "CineStream is a premium streaming service that offers a vast library of award-winning movies, TV shows, and live TV channels on demand."
    },
    {
      q: "How do I watch full movies on the site?",
      a: "Click on any movie card on the home page or TV Series page, click the 'Watch Now' button (or switch to the 'Full Movie' tab) inside the player container, and hit play! If a stream fails to load, you can select a different host using the 'Server' dropdown in the top right."
    },
    {
      q: "Why are some stream servers showing a blank screen?",
      a: "If you are clicking on very new releases (e.g. from 2026), they are likely still playing in theaters or haven't been released on digital formats yet. Scraper servers can only stream movies once a digital source file exists. Try searching for an older classic movie (like Interstellar) to verify playback works!"
    },
    {
      q: "Is there a subscription fee?",
      a: "No! CineStream is currently 100% free and open for public testing. You do not need to enter any credit card information to watch videos."
    },
    {
      q: "How do I cancel my account?",
      a: "Since CineStream is free and requires no subscription, there are no contracts or cancellation fees. If you want to delete your registered profile, you can contact support."
    },
    {
      q: "Can I download movies to watch offline?",
      a: "Offline downloading is currently under active development and will be released in a future client update. Stay tuned!"
    }
  ];

  const filteredFaqs = faqs.filter(
    faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="container page-view faq-page-view">
      <div className="page-header">
        <h2 className="page-title">Help Center & FAQ</h2>
        <p className="page-subtitle">Got questions? Find instant answers about streaming, players, and accounts below.</p>
      </div>

      <div className="faq-search-wrapper">
        <div className="faq-search-bar">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search help topics, queries..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="p-faq-list">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, i) => (
            <div key={i} className="p-faq-item">
              <button className="p-faq-q" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                {faq.q}
                {activeFaq === i ? <X size={24} /> : <Plus size={24} />}
              </button>
              <div className={`p-faq-a ${activeFaq === i ? 'open' : ''}`}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <h2>No FAQ topics found</h2>
            <p>Try searching for different keywords, or contact support.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default FAQPage;
