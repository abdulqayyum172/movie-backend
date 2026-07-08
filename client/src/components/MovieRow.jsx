import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard';
import Skeleton from './Skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './MovieRow.css';

const MovieRow = ({ title, fetchUrl, onMovieClick }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const rowRef = React.useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(fetchUrl);
        setMovies(response.data);
      } catch (err) {
        console.error(`Failed to fetch ${title}`);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [fetchUrl]);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="movie-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-container">
        <button className="scroll-btn left" onClick={() => scroll('left')} aria-label="Scroll left">
          <ChevronLeft size={32} />
        </button>
        
        <div className="row-posters" ref={rowRef}>
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="row-skeleton"><Skeleton type="card" /></div>)
          ) : (
            movies.map(movie => (
              <div key={movie.id} className="row-movie">
                <MovieCard movie={movie} onClick={onMovieClick} />
              </div>
            ))
          )}
        </div>

        <button className="scroll-btn right" onClick={() => scroll('right')} aria-label="Scroll right">
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default MovieRow;
