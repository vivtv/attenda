const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const router = express.Router();

// Test route to verify bcrypt and database
router.get('/test-auth', async (req, res) => {
    try {
        console.log('Testing authentication system...');
        
        // Test bcrypt
        const testPassword = 'password123';
        const testHash = '$2b$10$phzPqfbslshzu9HhSncBSegc0ufOfIxWnR7m1xwphvvqGqPXqXmIW';
        const bcryptTest = await bcrypt.compare(testPassword, testHash);
        console.log(`Bcrypt test - password123 vs hash: ${bcryptTest}`);

        // Test database connection
        const [rows] = await db.execute('SELECT * FROM instructors WHERE email = ?', ['bobby@prof.edu']);
        console.log(`Database test - found ${rows.length} instructors`);
        
        if (rows.length > 0) {
            const instructor = rows[0];
            console.log(`Instructor found: ${instructor.name}`);
            console.log(`Stored hash: ${instructor.password}`);
            
            const passwordMatch = await bcrypt.compare(testPassword, instructor.password);
            console.log(`Password match with DB hash: ${passwordMatch}`);
        }

        res.json({
            bcryptTest,
            dbRecords: rows.length,
            instructor: rows[0] ? { name: rows[0].name, email: rows[0].email } : null
        });
    } catch (error) {
        console.error('Test auth error:', error);
        res.status(500).json({ error: error.message });
    }
});

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

        // Input validation
        if (!email || !password) {
            req.session.error = 'Please provide both email and password';
            return res.redirect('/auth/login');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            req.session.error = 'Please enter a valid email address';
            return res.redirect('/auth/login');
        }

        console.log(`Login attempt for email: ${email}`);

        // Find instructor by email
        const [rows] = await db.execute(
            'SELECT id, email, password, name FROM instructors WHERE email = ?',
            [email.toLowerCase().trim()]
        );

        console.log(`Database query returned ${rows.length} rows`);

        if (rows.length === 0) {
            console.log('No instructor found with that email');
            req.session.error = 'Invalid email or password';
            return res.redirect('/auth/login');
        }

        const instructor = rows[0];
        console.log(`Found instructor: ${instructor.name} (ID: ${instructor.id})`);

        // Verify password using bcrypt
        console.log('Comparing password...');
        const isValidPassword = await bcrypt.compare(password, instructor.password);
        console.log(`Password validation result: ${isValidPassword}`);

        if (!isValidPassword) {
            console.log('Password validation failed');
            req.session.error = 'Invalid email or password';
            return res.redirect('/auth/login');
        }

        // Set session data
        req.session.instructorId = instructor.id;
        req.session.instructorName = instructor.name;
        req.session.instructorEmail = instructor.email;

        console.log(`Login successful for ${instructor.name}, redirecting to dashboard`);

        // Redirect to dashboard
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific database connection errors
        if (error.code === 'ECONNREFUSED') {
            req.session.error = 'Database connection failed. Please ensure MySQL is running and environment variables are set correctly.';
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            req.session.error = 'Database access denied. Please check your database credentials in environment variables.';
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            req.session.error = 'Database not found. Please run the setup.sql script to create the database.';
        } else if (error.code === 'ENOTFOUND') {
            req.session.error = 'Database host not found. Please check your DB_HOST environment variable.';
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
