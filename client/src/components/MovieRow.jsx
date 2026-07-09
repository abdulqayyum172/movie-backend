import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard';
import Skeleton from './Skeleton';
import { ChevronLeft, ChevronRight, RefreshCw, WifiOff } from 'lucide-react';
import './MovieRow.css';

const MovieRow = ({ title, fetchUrl, onMovieClick }) => {
  const [movies, setMovies]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const rowRef = React.useRef(null);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await axios.get(fetchUrl);
      setMovies(response.data || []);
    } catch (err) {
      console.error(`Failed to fetch "${title}":`, err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl, title]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Hide the row entirely if it loaded successfully but returned 0 results
  if (!loading && !error && movies.length === 0) return null;

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth
        : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="movie-row">
      <h2 className="row-title">{title}</h2>

      {error ? (
        <div className="row-error">
          <WifiOff size={20} />
          <span>Could not load this section</span>
          <button className="row-retry-btn" onClick={fetchMovies}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : (
        <div className="row-container">
          <button className="scroll-btn left" onClick={() => scroll('left')} aria-label="Scroll left">
            <ChevronLeft size={32} />
          </button>

          <div className="row-posters" ref={rowRef}>
            {loading
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="row-skeleton">
                    <Skeleton type="card" />
                  </div>
                ))
              : movies.map(movie => (
                  <div key={movie.id} className="row-movie">
                    <MovieCard movie={movie} onClick={onMovieClick} />
                  </div>
                ))}
          </div>

          <button className="scroll-btn right" onClick={() => scroll('right')} aria-label="Scroll right">
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieRow;
