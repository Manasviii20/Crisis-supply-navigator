const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./database/config');
const { initializeDatabase } = require('./database/schema');

// Import routes
const authRoutes = require('./routes/auth');
const supplyRoutes = require('./routes/supplies');
const shelterRoutes = require('./routes/shelters');
const deliveryRoutes = require('./routes/deliveries');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/supplies', supplyRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Crisis Supply Navigator API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dashboard.html'));
});

app.get('/supplies', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'supplies.html'));
});

app.get('/shelters', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'shelters.html'));
});

app.get('/deliveries', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'deliveries.html'));
});

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'map.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your MySQL configuration.');
      console.log('Server will start but database features will not work.');
    } else {
      // Initialize database schema
      await initializeDatabase();
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`Crisis Supply Navigator Backend`);
      console.log(`========================================`);
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
      console.log(`Frontend: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`========================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

// Export for Vercel serverless
module.exports = app;
