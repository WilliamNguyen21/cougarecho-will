import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/api.js'; // Import other routes if you have them

import path, { dirname } from 'path';
import { getConnectionPool } from './database.js';
import corsOptions from './config/corsOptions.js';


dotenv.config(); // Load environment variables
const port = process.env.PORT || 8080; // The port for the server
const local_bool = process.env.ISLOCAL || false;
const app = express();
if (!local_bool) {
    app.enable('trust proxy');
} else {
    app.use(cors(corsOptions)); // Enable CORS
}
app.use(express.json()); // Middleware to parse incoming JSON requests

app.use('/api', apiRoutes);
if (!local_bool) {
    // Deployment settings
    app.use(express.static(path.join('client/dist')));

    app.get('/', function (req, res) {
        res.sendFile(path.join('client', 'dist', 'index.html'));
    });
    app.all(/.*/, function (req, res) {
        res.redirect('/');
        //})
        /*app.get('*', (req, res) => {
            res.sendFile(path.join)
        })*/
    });
}
// Connect to the database
getConnectionPool().catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1); // Exit if the database connection fails
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});