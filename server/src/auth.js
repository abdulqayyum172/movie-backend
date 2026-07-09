const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const register = async (req, res) => {
  const { username, password } = req.body;
  const email = req.body.email?.toLowerCase();

  // Basic validation
  if (!username || username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    console.log(`Registering: ${email}`);

    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'This username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db.prepare(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
    ).run(username, email, hashedPassword);

    const user = { id: result.lastInsertRowid, username, email, photo_url: null };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ message: 'Account created successfully', user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

const login = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email?.toLowerCase();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    console.log(`Login attempt: ${email}`);
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, photo_url: user.photo_url },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Logged in successfully',
      user: { id: user.id, username: user.username, email: user.email, photo_url: user.photo_url },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

const googleLogin = async (req, res) => {
  const { username, photoURL } = req.body;
  const email = req.body.email?.toLowerCase();

  if (!email) {
    return res.status(400).json({ error: 'Google email is required' });
  }

  try {
    let user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(email);

    if (!user) {
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      let baseUsername = (username || email.split('@')[0]).replace(/[^a-zA-Z0-9]/g, '');
      if (baseUsername.length < 3) baseUsername = 'user';

      let finalUsername = baseUsername;
      let counter = 1;
      while (db.prepare('SELECT id FROM users WHERE username = ?').get(finalUsername)) {
        finalUsername = `${baseUsername}${counter++}`;
      }

      const result = db.prepare(
        'INSERT INTO users (username, email, password, photo_url) VALUES (?, ?, ?, ?)'
      ).run(finalUsername, email, hashedPassword, photoURL || null);

      user = { id: result.lastInsertRowid, username: finalUsername, email, photo_url: photoURL || null };
    } else if (photoURL && photoURL !== user.photo_url) {
      db.prepare('UPDATE users SET photo_url = ? WHERE id = ?').run(photoURL, user.id);
      user.photo_url = photoURL;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, photo_url: user.photo_url },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Google login successful',
      user: { id: user.id, username: user.username, email: user.email, photo_url: user.photo_url },
      token
    });
  } catch (error) {
    console.error('Google login error — message:', error.message);
    console.error('Google login error — code:', error.code);
    console.error('Google login error — stack:', error.stack);
    res.status(500).json({ error: error.message || 'Internal server error during Google login' });
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired, please login again' });
      }
      return res.status(403).json({ error: 'Invalid or tampered token' });
    }
    req.user = user;
    next();
  });
};

const getMe = (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, email, photo_url FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User no longer exists' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error fetching profile' });
  }
};

module.exports = { register, login, googleLogin, authenticateToken, getMe };
