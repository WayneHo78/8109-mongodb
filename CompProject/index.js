// index.js
const express = require('express');
const cors = require("cors");
require('dotenv').config();
const { connect } = require('./db'); // Import the database connection
const CRUD = require('./CRUD'); // Import the CRUD module
const auth = require('./auth'); // Import the auth module
const { generateSearchParams } = require('./gemini'); // Import the function from gemini.js
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

        // in index.js, after CRUD(app, db) and auth(app, db)
const { generateCompanyFromText } = require('./gemini');
const { ObjectId } = require('mongodb');

// Create company from free text
app.post('/ai/company/create', async (req, res) => {
  const { text, allowedCategoryCodes = [], allowedTags = [] } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  try {
    const company = await generateCompanyFromText(text, allowedCategoryCodes, allowedTags);

    // Basic server-side validation / normalization
    const doc = {
      name: company.name || '',
      homepage_url: company.homepage_url || '',
      description: company.description || '',
      category_code: company.category_code || '',
      tag_list: Array.isArray(company.tag_list) ? company.tag_list.map(t => String(t).trim()) : []
    };

    const result = await db.collection('companies').insertOne(doc);
    res.status(201).json({ message: 'Company created', companyId: result.insertedId, company: doc });
  } catch (err) {
    console.error('AI create company error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update existing company by id with parsed text
app.post('/ai/company/update/:id', async (req, res) => {
  const { id } = req.params;
  const { text, allowedCategoryCodes = [], allowedTags = [] } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const company = await generateCompanyFromText(text, allowedCategoryCodes, allowedTags);

    const updateDoc = {
      name: company.name || '',
      homepage_url: company.homepage_url || '',
      description: company.description || '',
      category_code: company.category_code || '',
      tag_list: Array.isArray(company.tag_list) ? company.tag_list.map(t => String(t).trim()) : []
    };

    const result = await db.collection('companies').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Company not found' });
    res.json({ message: 'Company updated', updated: updateDoc });
  } catch (err) {
    console.error('AI update company error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


        // Start server
        app.listen(3000, function(){
            console.log("Server has started smoothly on port 3000");
        });
    } catch (err) {
        console.error("Critical Failure: App could not start:", err);
        process.exit(1);
    }
}

// AI Search Endpoint
app.get('/ai/search', async (req, res) => {
    const userQuery = req.query.q; // Assume the query is passed as a query parameter
    const tagList = ["crm", "workflow", "cloud", "b2b", "predictive", "deep-learning"]; // Example tags
    const categoryCodes = ["software_as_a_service", "artificial_intelligence", "fintech", "e_commerce", "cloud_computing"];
    const descriptions = ["A platform tracking data pipelines for developers.", "A platform delivering real-time tracking for global e-commerce.", "A platform building automated workflows for startups.", "A platform managing user privacy for healthcare providers.", "A platform optimizing smart analytics for modern businesses."]; // Example descriptions

    try {
        const searchParams = await generateSearchParams(userQuery, tagList, categoryCodes, descriptions);

        // Use the searchParams object to query the database as needed
        res.json({ searchParams });
    } catch (error) {
        console.error('Error in AI search:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fire the application setup
main();
