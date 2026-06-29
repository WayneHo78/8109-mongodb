// CRUD.js
const { ObjectId } = require('mongodb');

module.exports = (app, db) => {
    // Create company
    app.post('/companies', async (req, res) => {
        try {
            const { name, category_code, homepage_url, description, tag_list } = req.body;

            // Basic validation
            if (!name || !category_code || !homepage_url || !description || !tag_list) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Fetch the category_code document
            const category_codeDoc = await db.collection('category_code').findOne({ name: category_code });
            if (!category_codeDoc) {
                return res.status(400).json({ error: 'Invalid category_code' });
            }

            // Fetch the tag documents
            const tagDocs = await db.collection('tags').find({ name: { $in: tag_list.split(',').map(tag => tag.trim()) } }).toArray();
            if (tagDocs.length !== tag_list.length) {
                return res.status(400).json({ error: 'One or more invalid tags in tag_list' });
            }

            // Create the new companies object
            const newCompany = {
                name,
                category_code: category_codeDoc.name,
                homepage_url,
                description,
                tag_list: tagDocs.map(tag => tag.name), 
                created_at: new Date(),
                updated_at: new Date(),
            };

            // Insert the new company into the database
            const result = await db.collection('companies').insertOne(newCompany);

            // Send back the created company
            res.status(201).json({
                message: 'Company created successfully',
                companyId: result.insertedId
            });
        } catch (error) {
            console.error('Error creating company:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Include any additional CRUD operations like GET, PUT, DELETE as needed
};
