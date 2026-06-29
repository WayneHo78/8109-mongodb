// index.js
const express = require('express');
const cors = require("cors");
const path = require('path');
require('dotenv').config();
const { connect } = require('./db');
const CRUD = require('./CRUD'); // Import the CRUD module
const { ObjectId } = require('mongodb'); // Import ObjectId

const mongoUri = process.env.MONGO_URI;
const dbname = "sample_training";

let app = express();
app.use(express.json());

// Open CORS configurations
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

        // CONSOLIDATED ROUTE: Handles both global fetching AND filtered searches
        app.get('/companies', async (req, res) => {
            try {
                const { tag_list, category_code, description, name } = req.query;
                let query = {};

                // 1. tag_list search
                if (tag_list) {
                    const tags = tag_list.split(',').map(t => t.trim());
                    query.$or = tags.map(tag => ({ tag_list: { $regex: tag, $options: 'i' } }));
                }

                // 2. category_code search
                if (category_code) {
                    query.category_code = { $regex: category_code, $options: 'i' };
                }

                // 3. description search using clean MongoDB regex objects
                if (description) {
                    const searchTerms = description.split(',').map(i => i.trim());
                    query.$and = searchTerms.map(term => ({ description: { $regex: term, $options: 'i' } }));
                }

                // 4. name search
                if (name) {
                    query.name = { $regex: name, $options: 'i' };
                }

                // Determine projection dynamically: 
                const hasQueryParams = tag_list || category_code || description || name;         
                const projection = hasQueryParams 
                    ? { name: 1, tag_list: 1, category_code: 1, _id: 0 }
                    : { name: 1, number_of_employees: 1, overview: 1, _id: 0 };

                const companies = await db.collection("companies").find(query).project(projection).toArray();
                console.log("Fetched companies:", companies); // Debugging log
                res.json({ companies });
            } catch (error) {
                console.error("Error fetching or searching companies:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });

        // GET SINGLE COMPANY BY ID
        app.get("/companies/:id", async (req, res) => {
            try {
                const id = req.params.id;

                // Validate if the ID string is a valid MongoDB ObjectId format
                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ error: "Invalid ID format" });
                }

                const company = await db.collection("companies").findOne(
                    { _id: new ObjectId(id) },
                    { projection: { _id: 0 } }
                );

                if (!company) {
                    return res.status(404).json({ error: "Company not found" });
                }
        
                res.json(company);
            } catch (error) {
                console.error("Error fetching company by ID:", error);
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
