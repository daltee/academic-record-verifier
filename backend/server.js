/**
 * server.js
 * Entry point – loads env, connects to MongoDB, starts the server
 */

require('dotenv').config();
const connectDB = require('./src/config/db');
const app = require('./src/app');

// Connect to MongoDB first
connectDB();

const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 so cloud hosts (Render, Railway, etc.) can route traffic
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server is running on port ' + PORT);
  console.log('Health check: GET /api/health');
});
