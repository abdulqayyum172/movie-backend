const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = (process.env.TMDB_API_KEY || '').trim();
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
});

// Add interceptor to always include api_key
tmdbApi.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    api_key: TMDB_API_KEY,
  };
  return config;
});

const getTrendingMovies = async () => {
  const response = await tmdbApi.get('/trending/movie/week');
  return (response.data.results || []).map(formatMovie);
};

const getTrendingTV = async () => {
  const response = await tmdbApi.get('/trending/tv/week');
  return (response.data.results || []).map(formatTV);
};

const searchMovies = async (query) => {
  if (!query) return [];
  const response = await tmdbApi.get('/search/multi', { params: { query } });
  return (response.data.results || [])
    .map(item => {
      if (item.media_type === 'movie') {
        return formatMovie(item);
      } else if (item.media_type === 'tv') {
        return formatTV(item);
      }
      return null;
    })
    .filter(Boolean);
};

const getMovieDetails = async (id) => {
  const response = await tmdbApi.get(`/movie/${id}`, {
    params: { append_to_response: 'videos' }
  });
  return formatMovie(response.data);
};

const getTVDetails = async (id) => {
  const response = await tmdbApi.get(`/tv/${id}`, {
    params: { append_to_response: 'videos' }
  });
  return formatTV(response.data);
};

const getMoviesByGenre = async (genreId) => {
  const response = await tmdbApi.get('/discover/movie', { params: { with_genres: genreId } });
  return (response.data.results || []).map(formatMovie);
};

const getGenres = async () => {
  const response = await tmdbApi.get('/genre/movie/list');
  return response.data.genres || [];
};

const formatMovie = (movie) => {
  if (!movie) return null;

  const videos = movie.videos?.results || [];
  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    || videos.find(v => v.type === 'Teaser' && v.site === 'YouTube')
    || videos.find(v => v.type === 'Clip' && v.site === 'YouTube')
    || videos.find(v => v.site === 'YouTube');
  
  return {
    id: movie.id,
    type: 'movie',
    title: movie.title || movie.name || 'Untitled',
    description: movie.overview || 'No description available.',
    posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster',
    backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
    rating: movie.vote_average || 0,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : (movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : 'N/A'),
    genre: movie.genre_ids || (movie.genres ? movie.genres.map(g => g.id) : []),
    videoUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1` : null,
    popularity: movie.popularity || 0
  };
};

const formatTV = (tv) => {
  if (!tv) return null;

  const videos = tv.videos?.results || [];
  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    || videos.find(v => v.type === 'Teaser' && v.site === 'YouTube')
    || videos.find(v => v.type === 'Clip' && v.site === 'YouTube')
    || videos.find(v => v.site === 'YouTube');

  return {
    id: tv.id,
    type: 'tv',
    title: tv.name || 'Untitled Series',
    description: tv.overview || 'No description available.',
    posterUrl: tv.poster_path ? `${IMAGE_BASE_URL}${tv.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster',
    backdropUrl: tv.backdrop_path ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}` : null,
    rating: tv.vote_average || 0,
    year: tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : 'N/A',
    genre: tv.genre_ids || (tv.genres ? tv.genres.map(g => g.id) : []),
    videoUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1` : null,
    popularity: tv.popularity || 0
  };
};

const getMoviesByLanguage = async (languageCode) => {
  try {
    const moviePromise = tmdbApi.get('/discover/movie', { 
      params: { 
        with_original_language: languageCode,
        sort_by: 'popularity.desc' 
      } 
    });
    
    const tvPromise = tmdbApi.get('/discover/tv', { 
      params: { 
        with_original_language: languageCode,
        sort_by: 'popularity.desc' 
      } 
    });

    const [movieRes, tvRes] = await Promise.all([moviePromise, tvPromise]);

    const movies = (movieRes.data.results || []).map(formatMovie);
    const tvs = (tvRes.data.results || []).map(formatTV);

    // Combine and sort by popularity descending
    return [...movies, ...tvs]
      .filter(Boolean)
      .sort((a, b) => b.popularity - a.popularity);
  } catch (err) {
    console.error(`Error in getMoviesByLanguage for ${languageCode}:`, err.message);
    return [];
  }
};

/**
 * Fetch movies by origin country code(s).
 * countryCodes: string like 'NG' or comma-separated 'NG,GH,ZA'
 */
const getMoviesByRegion = async (countryCodes) => {
  try {
    // TMDB supports pipe-separated list for OR matching
    const countryParam = countryCodes.split(',').join('|');

    const moviePromise = tmdbApi.get('/discover/movie', {
      params: {
        with_origin_country: countryParam,
        sort_by: 'popularity.desc',
        'vote_count.gte': 5,
      },
    });

    const tvPromise = tmdbApi.get('/discover/tv', {
      params: {
        with_origin_country: countryParam,
        sort_by: 'popularity.desc',
        'vote_count.gte': 5,
      },
    });

    const [movieRes, tvRes] = await Promise.all([moviePromise, tvPromise]);

    const movies = (movieRes.data.results || []).map(formatMovie);
    const tvs = (tvRes.data.results || []).map(formatTV);

    return [...movies, ...tvs]
      .filter(Boolean)
      .sort((a, b) => b.popularity - a.popularity);
  } catch (err) {
    console.error(`Error in getMoviesByRegion for ${countryCodes}:`, err.message);
    return [];
  }
};

const getTopRatedMovies = async () => {
  try {
    const response = await tmdbApi.get('/movie/top_rated');
    return (response.data.results || []).map(formatMovie);
  } catch (err) {
    console.error('Error in getTopRatedMovies:', err.message);
    return [];
  }
};

const getUpcomingMovies = async () => {
  try {
    const response = await tmdbApi.get('/movie/upcoming');
    return (response.data.results || []).map(formatMovie);
  } catch (err) {
    console.error('Error in getUpcomingMovies:', err.message);
    return [];
  }
};

module.exports = { 
  getTrendingMovies, 
  getTrendingTV, 
  searchMovies, 
  getMovieDetails, 
  getTVDetails,
  getMoviesByGenre, 
  getGenres,
  getMoviesByLanguage,
  getMoviesByRegion,
  getTopRatedMovies,
  getUpcomingMovies,
};
