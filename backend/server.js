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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
