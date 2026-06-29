//CRUD.js
const { ObjectId } = require('mongodb');

module.exports = (app, db) => {
    // 1. Create a new company
    app.post('/companies', async (req, res) => {
        const { name, homepage_url, description, category_code, tag_list } = req.body;

        // Basic validation
        if (!name || !homepage_url || !description || !category_code || !tag_list) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Prevent crashes if tag_list is already sent as an array
        let processedTags = [];
        if (typeof tag_list === 'string') {
            processedTags = tag_list.split(',').map(tag => tag.trim());
        } else if (Array.isArray(tag_list)) {
            processedTags = tag_list.map(tag => String(tag).trim());
        }

        const newCompany = {
            name,
            homepage_url,
            description,
            category_code,
            tag_list: processedTags
        };

        try {
            const result = await db.collection('companies').insertOne(newCompany);
            res.status(201).json({ message: 'Company created successfully', companyId: result.insertedId });
        } catch (error) {
            console.error('Error creating company:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // 2. Read all companies
    app.get('/companies', async (req, res) => {
        try {
            const companies = await db.collection('companies').find({}).toArray();
            res.json({ companies });
        } catch (error) {
            console.error("Error fetching companies:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // 3. Read a company by name (Keep search routes logically separated or above wildcards)
    app.get('/companies/search', async (req, res) => {
        const { name } = req.query;

        try {
            let query = {};
            if (name) {
                query.name = { $regex: new RegExp(name, 'i') }; 
            }

            const companies = await db.collection('companies').find(query).toArray();
            res.json({ companies }); // Better practice: return empty array if none found, not a 404
        } catch (error) {
            console.error("Error fetching company by name:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // 4. Update an existing company
    app.put('/companies/:id', async (req, res) => {
        const companyId = req.params.id;
        const updatedData = req.body;

        // Safely validate ObjectId format to prevent app crashes
        if (!ObjectId.isValid(companyId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        try {
            const result = await db.collection('companies').updateOne(
                { _id: new ObjectId(companyId) },
                { $set: updatedData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Company not found' });
            }

            res.json({ message: 'Company updated successfully' });
        } catch (error) {
            console.error('Error updating company:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // 5. Delete a company
    app.delete('/companies/:id', async (req, res) => {
        const companyId = req.params.id;

        // Safely validate ObjectId format to prevent app crashes
        if (!ObjectId.isValid(companyId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        try {
            const result = await db.collection('companies').deleteOne({ _id: new ObjectId(companyId) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Company not found' });
            }

            res.json({ message: 'Company deleted successfully' });
        } catch (error) {
            console.error('Error deleting company:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};
