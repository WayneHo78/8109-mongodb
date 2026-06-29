// index.js
const express = require('express');
const cors = require("cors");
require('dotenv').config();
const { connect } = require('./db'); // Import the database connection
const CRUD = require('./CRUD'); // Import the CRUD module
const auth = require('./auth'); // Import the auth module
const { ObjectId } = require('mongodb'); // Import ObjectId

const mongoUri = process.env.MONGO_URI;
const dbname = "sample_training";

let app = express();
app.use(express.json()); // Enable parsing of JSON bodies

// Open CORS configurations
app.use(cors({
    origin: true,
    credentials: true
}));

async function main() {
    try {
        const db = await connect(mongoUri, dbname); // Connect to MongoDB
        console.log('Successfully connected to MongoDB');

        CRUD(app, db); // Initialize CRUD routes
        auth(app, db); // Initialize auth routes

        // Start server
        app.listen(3000, function(){
            console.log("Server has started smoothly on port 3000");
        });
    } catch (err) {
        console.error("Critical Failure: App could not start:", err);
        process.exit(1);
    }
}

// Fire the application setup
main();
