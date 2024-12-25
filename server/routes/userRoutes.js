const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cookieParser = require('cookie-parser');

router.use(cookieParser()); // Enable cookie parsing

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '1d'; // Token expiration time

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password, confirmpassword } = req.body;

    try {
        if (!username || !email || !password || !confirmpassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userWithEmail = await User.findOne({ email });
        const userWithUsername = await User.findOne({ username });

        if (userWithEmail || userWithUsername) {
            return res.status(400).json({ message: "User already exists" });
        }


        if (password != confirmpassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        const token = generateToken(newUser);
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.status(201).json({ message: "User registered successfully", user: { id: newUser._id, email: newUser.email } });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        const token = generateToken(user);
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.status(200).json({ message: "Login successful", user: { id: user._id, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
});

// Logout User
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logged out successfully" });
});



module.exports = router;
