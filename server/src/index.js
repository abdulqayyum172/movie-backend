const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const db = require('./db');
const auth = require('./auth');
const tmdb = require('./tmdb');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,           // reflect the request origin (allows all)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options(/.*/, cors());   // handle pre-flight for all routes
app.use(express.json());

// Health check — keeps Render free-tier awake and lets client detect backend status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth Routes
app.post('/api/auth/register', auth.register);
app.post('/api/auth/login', auth.login);
app.post('/api/auth/google', auth.googleLogin);
app.get('/api/auth/me', auth.authenticateToken, auth.getMe);

// TMDB Movie Routes
app.get('/api/movies', async (req, res) => {
  try {
    const { search, genre, language, region } = req.query;
    let movies;
    if (search) {
      movies = await tmdb.searchMovies(search);
    } else if (genre) {
      movies = await tmdb.getMoviesByGenre(genre);
    } else if (language) {
      movies = await tmdb.getMoviesByLanguage(language);
    } else if (region) {
      movies = await tmdb.getMoviesByRegion(region);
    } else {
      movies = await tmdb.getTrendingMovies();
    }
    res.json(movies);
  } catch (error) {
    console.error('TMDB Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch movies from TMDB' });
  }
});

app.get('/api/movies/top-rated', async (req, res) => {
  try {
    const movies = await tmdb.getTopRatedMovies();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top-rated movies' });
  }
});

app.get('/api/movies/upcoming', async (req, res) => {
  try {
    const movies = await tmdb.getUpcomingMovies();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming movies' });
  }
});

app.get('/api/movies/genres', async (req, res) => {
  try {
    const genres = await tmdb.getGenres();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    const { type } = req.query;
    let movie;
    if (type === 'tv') {
      movie = await tmdb.getTVDetails(req.params.id);
    } else {
      movie = await tmdb.getMovieDetails(req.params.id);
    }
    res.json(movie);
  } catch (error) {
    res.status(404).json({ message: 'Movie or TV show not found on TMDB' });
  }
});

// TV Series Route
app.get('/api/tv', async (req, res) => {
  try {
    const tv = await tmdb.getTrendingTV();
    res.json(tv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TV shows' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
