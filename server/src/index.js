const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const db = require('./db');
const auth = require('./auth');
const tmdb = require('./tmdb');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', auth.register);
app.post('/api/auth/verify-register', auth.verifyRegister);
app.post('/api/auth/login', auth.login);
app.post('/api/auth/google', auth.googleLogin);
app.get('/api/auth/me', auth.authenticateToken, auth.getMe);

// TMDB Movie Routes
app.get('/api/movies', async (req, res) => {
  try {
    const { search, genre, language } = req.query;
    let movies;
    if (search) {
      movies = await tmdb.searchMovies(search);
    } else if (genre) {
      movies = await tmdb.getMoviesByGenre(genre);
    } else if (language) {
      movies = await tmdb.getMoviesByLanguage(language);
    } else {
      movies = await tmdb.getTrendingMovies();
    }
    res.json(movies);
  } catch (error) {
    console.error('TMDB Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch movies from TMDB' });
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
    const movie = await tmdb.getMovieDetails(req.params.id);
    res.json(movie);
  } catch (error) {
    res.status(404).json({ message: 'Movie not found on TMDB' });
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
