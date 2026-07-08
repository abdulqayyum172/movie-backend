import React, { useState, useEffect } from 'react';
import { Play, Info, Star } from 'lucide-react';
import axios from 'axios';
import './FeaturedHero.css';

const FeaturedHero = ({ onPlay, onInfo }) => {
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get('/api/movies');
        if (response.data.length > 0) {
          // Get a random movie from the first 10 trending movies
          const randomIndex = Math.floor(Math.random() * Math.min(response.data.length, 10));
          const movie = response.data[randomIndex];
          const details = await axios.get(`/api/movies/${movie.id}`);
          setFeatured(details.data);
        }
      } catch (err) {
        console.error('Failed to fetch featured movie');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading || !featured) return <div className="hero-skeleton"></div>;

  return (
    <div className="featured-hero">
      <div className="video-background">
        {featured.videoUrl ? (
          <iframe
            src={`${featured.videoUrl}&controls=0&mute=1&loop=1&playlist=${featured.videoUrl.split('/').pop().split('?')[0]}`}
            title="Featured Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        ) : (
          <img src={featured.backdropUrl} alt={featured.title} />
        )}
      </div>
      
      <div className="hero-overlay">
        <div className="hero-info">
          <h2 className="title">{featured.title}</h2>
          <div className="meta">
            <span className="rating">
              <Star size={18} fill="currentColor" /> 
              {(featured.rating || 0).toFixed(1)}
            </span>
            <span className="year-badge">{featured.year}</span>
          </div>
          <p className="description">{featured.description}</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => onPlay(featured)}>
              <Play size={20} fill="currentColor" /> Play Now
            </button>
            <button className="btn-secondary" onClick={() => onInfo(featured)}>
              <Info size={20} /> More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedHero;
