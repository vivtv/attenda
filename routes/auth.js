const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
    if (req.session.instructorId) {
        return res.redirect('/dashboard');
    }
    res.render('login', { 
        title: 'Instructor Login',
        error: req.session.error 
    });
    delete req.session.error;
});

// Login POST
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.session.error = 'Please provide both email and password';
            return res.redirect('/auth/login');
        }

        // Find instructor by email
        const [rows] = await db.execute(
            'SELECT id, email, password, name FROM instructors WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            req.session.error = 'Invalid email or password';
            return res.redirect('/auth/login');
        }

        const instructor = rows[0];

        // Verify password using bcrypt
        const isValidPassword = await bcrypt.compare(password, instructor.password);
        if (!isValidPassword) {
            req.session.error = 'Invalid email or password';
            return res.redirect('/auth/login');
        }

        // Set session data
        req.session.instructorId = instructor.id;
        req.session.instructorName = instructor.name;
        req.session.instructorEmail = instructor.email;

        // Redirect to dashboard
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific database connection errors
        if (error.code === 'ECONNREFUSED') {
            req.session.error = 'Database connection failed. Please ensure MySQL is running and properly configured.';
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            req.session.error = 'Database access denied. Please check your database credentials.';
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            req.session.error = 'Database not found. Please run the setup.sql script to create the database.';
        } else {
            req.session.error = 'Login failed. Please try again later.';
        }
        
        res.redirect('/auth/login');
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;
