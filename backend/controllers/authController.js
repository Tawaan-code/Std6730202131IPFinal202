// POST /api/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (username === 'admin' && password === 'password123') {
      return res.status(200).json({
        success: true,
        token: 'mock-jwt-token',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid username or password',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  login,
};
