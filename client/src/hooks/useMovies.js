import { useState, useEffect } from 'react';
import axios from 'axios';

export const useMovies = (searchQuery, selectedGenre) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/movies', {
          params: { 
            search: searchQuery,
            genre: selectedGenre
          }
        });
        setMovies(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch movies');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchMovies();
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedGenre]);

  return { movies, loading, error };
};
