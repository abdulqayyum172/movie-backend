import React from 'react';
import { Star, Play } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ movie, onClick }) => {
  return (
    <div className="movie-card" onClick={() => onClick(movie)}>
      <div className="poster-container">
        <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
        <div className="play-hover-btn">
          <Play size={24} fill="currentColor" />
        </div>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="movie-card-meta">
          <span className="movie-card-year">{movie.year}</span>
          <span className="movie-card-rating">
            <Star size={12} fill="currentColor" /> 
            {(movie.rating || 0).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
