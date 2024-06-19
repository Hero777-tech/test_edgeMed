// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// User Schema and Model
const User = require('./models/User');

// Routes
// Serve index.html at root (/)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve register.html at /register
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Handle registration form submission
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();

        // Redirect to mk.html upon successful registration
        res.redirect('/mk.html');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Serve login.html at /login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Mock user data for demonstration
        const mockUser = {
            username: 'user1',
            password: '$2a$10$tkj9Ns53G4Sc7sM/vXAXqOSRg0SC9ubIWUblM9HCWuAVSLe4Xo68S', // hashed "password"
        };

        // Simulate database check - replace with actual database logic
        if (username !== mockUser.username) {
            return res.status(404).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, mockUser.password);
        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        // Redirect to mk.html upon successful login
        res.redirect('/mk.html');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
