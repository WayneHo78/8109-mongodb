// 1. SETUP EXPRESS AND MIDDLEWARE
const express = require('express');
const cors = require("cors");
const path = require('path');

// Load environment variables cleanly
require('dotenv').config();

// Imports from your db module
const { connect } = require('./db');

// Variables declaration
const mongoUri = process.env.MONGO_URI;
const dbname = "sample_training";

let app = express();

app.use(express.json());

// Open CORS configurations explicitly for GitHub Codespaces development
app.use(cors({
    origin: true,
    credentials: true
}));

// 2. DEFINE THE BOOTSTRAP LOGIC
async function main() {
  try {
    // Check what value Node is actually extracting from your environment files
    console.log("=== DEBUG CONSOLE ===");
    console.log("Attempting to connect with URI:", mongoUri); 
    console.log("Target Database Name:", dbname);
    console.log("=====================");

    // Await the database link first
    const db = await connect(mongoUri, dbname);
    console.log('Successfully connected to MongoDB Cluster');

    // Register routes safely AFTER db is active
    app.get('/companies', async (req, res) => {
        try {
            const sample_training = await db.collection("companies").find().project({
                name: 1,
                number_of_employees: 1,
                overview: 1,
            }).toArray();
            
            res.json({ companies: sample_training });
        } catch (error) {
            console.error("Error fetching companies collection:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // Landing check endpoint
    app.get('/', (req, res) => {
        res.json({ message: "Server is online, database is bound." });
    });

    // 3. START SERVER ONLY WHEN CONFIGURATION IS READY
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
