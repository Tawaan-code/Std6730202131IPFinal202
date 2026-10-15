const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Route หลักสำหรับ API ทั้งหมด
app.use('/api', apiRoutes);

// Root / Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Employee Management API with MySQL is running' });
});

// Handle 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server',
  });
});

// Start Server บนพอร์ต 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
