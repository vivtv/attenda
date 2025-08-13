const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'marshmelloX_X55',
    database: process.env.DB_NAME || 'university_attendance',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Log connection configuration (without password)
console.log('Database configuration:');
console.log(`- Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`- User: ${process.env.DB_USER || 'root'}`);
console.log(`- Database: ${process.env.DB_NAME || 'university_attendance'}`);
console.log(`- Password: ${process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]'}`);

// Create promise-based wrapper
const db = pool.promise();

// Test connection
async function testConnection() {
    try {
        const connection = await db.getConnection();
        console.log('✓ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        console.error('Please ensure MySQL is running and .env file has correct credentials');
        console.error('Expected environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
        return false;
    }
}

// Initialize connection test (non-blocking for demo)
testConnection();

module.exports = db;
