// auth.js
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (app, db) => {
    // User Registration
    app.post('/users', async (req, res) => {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        try {
            const result = await db.collection('users').insertOne({
                email,
                password: hashedPassword
            });

            res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // User Login
    app.post('/login', async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        try {
            const user = await db.collection('users').findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            const accessToken = jwt.sign({ user_id: user._id, email: user.email }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
            res.json({ accessToken });
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Middleware for protecting routes
    const verifyToken = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.sendStatus(403); // Forbidden

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403); // Forbidden
            req.user = user; // Attach user info to the request
            next();
        });
    };

    // Protected route example
    app.get('/profile', verifyToken, (req, res) => {
        res.json({ message: 'This is a protected route', user: req.user });
    });
};
