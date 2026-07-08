const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '../../data/movies.sqlite');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Ensure the parent directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    genre TEXT,
    year INTEGER,
    rating REAL,
    posterUrl TEXT,
    videoUrl TEXT,
    description TEXT
  );
`);

// Schema migrations
try {
  db.prepare('SELECT photo_url FROM users LIMIT 1').get();
} catch (e) {
  if (e.message.includes('no such column')) {
    db.exec('ALTER TABLE users ADD COLUMN photo_url TEXT');
    console.log('Database migrated: added photo_url to users table');
  }
}

module.exports = db;
