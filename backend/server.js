//load environment variables
require( 'dotenv').config();

//import the Express application
const app = require('./src/app');

//now he port for the server to listen to 
const PORT = process.env.PORT || 5000;

//start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});