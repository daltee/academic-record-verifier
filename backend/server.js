//load environment variables

require('dotenv').config();
const connectDB = require('./src/config/db');   // adjust the path if needed

// Connect to MongoDB
connectDB();

//import the Express application
const app = require('./src/app');

//now he port for the server to listen to 
const PORT = process.env.PORT || 5000;

//start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});