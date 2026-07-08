const db = require('./db');

const movies = [
  {
    title: "The Shawshank Redemption",
    genre: "Drama",
    year: 1994,
    rating: 9.3,
    posterUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsYVBHSJV9H6qT7M6pYh.jpg",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
  },
  {
    title: "The Godfather",
    genre: "Crime, Drama",
    year: 1972,
    rating: 9.2,
    posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrjYp8XFcR0Z0PbdqSTvC2te.jpg",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
  },
  {
    title: "The Dark Knight",
    genre: "Action, Crime, Drama",
    year: 2008,
    rating: 9.0,
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDr9aqmUjk9CfsbiXFR.jpg",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
  },
  {
    title: "Pulp Fiction",
    genre: "Crime, Drama",
    year: 1994,
    rating: 8.9,
    posterUrl: "https://image.tmdb.org/t/p/w500/d5iIl9h9FvS6P9Iq7obPTOW91qi.jpg",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
  },
  {
    title: "Inception",
    genre: "Action, Adventure, Sci-Fi",
    year: 2010,
    rating: 8.8,
    posterUrl: "https://image.tmdb.org/t/p/w500/edv5CZvj0VeB97oVvYtdrGu4XzM.jpg",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
  }
];

const insert = db.prepare(`
  INSERT INTO movies (title, genre, year, rating, posterUrl, videoUrl, description)
  VALUES (@title, @genre, @year, @rating, @posterUrl, @videoUrl, @description)
`);

db.transaction(() => {
  // Clear existing movies to avoid duplicates on re-seed
  db.prepare('DELETE FROM movies').run();
  for (const movie of movies) {
    insert.run(movie);
  }
})();

console.log('Database seeded successfully!');
process.exit(0);
