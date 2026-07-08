const axios = require('axios');

async function test() {
  try {
    // First register a new user
    const email = 'login_test_' + Date.now() + '@example.com';
    const password = 'password123';
    await axios.post('http://localhost:5000/api/auth/register', {
      username: 'login_user_' + Date.now(),
      email,
      password
    });
    console.log('Registered successfully');

    // Now try to login
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    console.log('Login Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

test();
