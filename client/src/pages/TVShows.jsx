import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import Skeleton from '../components/Skeleton';
import './Pages.css';

const TVShows = ({ onShowClick }) => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTV = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/tv');
        setShows(response.data);
      } catch (err) {
        console.error('Failed to fetch TV shows');
      } finally {
        setLoading(false);
      }
    };
    fetchTV();
  }, []);

  return (
    <main className="container page-view">
      <div className="page-header">
        <h2 className="page-title">TV Series & Shows</h2>
        <p className="page-subtitle">Watch award-winning series, trending episodes, and seasonal classics.</p>
      </div>

      <div className="movie-grid">
        {loading ? (
          [...Array(12)].map((_, i) => <Skeleton key={i} type="card" />)
        ) : shows.length > 0 ? (
          shows.map(show => (
            <MovieCard key={show.id} movie={show} onClick={onShowClick} />
          ))
        ) : (
          <div className="no-results">
            <h2>No series found</h2>
            <p>Check back later for trending series.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default TVShows;
