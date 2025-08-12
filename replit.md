# University Attendance Management System

## Overview

This is a web-based university attendance management system built for instructors to track student attendance across different courses. The application provides a session-based authentication system where instructors can log in, select courses, and manage student attendance records. The system features a clean, responsive interface and generates attendance reports for administrative purposes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: EJS (Embedded JavaScript) for server-side rendering
- **Styling**: Custom CSS with responsive design principles
- **UI Framework**: Bootstrap-style components with modern CSS Grid and Flexbox layouts
- **Static Assets**: Served via Express.js static middleware from the `public` directory

### Backend Architecture
- **Framework**: Express.js with Node.js runtime
- **Architecture Pattern**: MVC (Model-View-Controller) with route-based organization
- **Session Management**: Express-session with in-memory storage for instructor authentication
- **Password Security**: bcrypt for password hashing and verification
- **Middleware Stack**: 
  - Authentication middleware for route protection
  - Body parsing for form data and JSON
  - Static file serving
  - Error handling middleware

### Data Storage
- **Database**: MySQL with connection pooling via mysql2 library
- **Connection Management**: Database connection pool with 10 concurrent connections
- **Schema**: Relational database with tables for instructors, courses, students, and attendance records
- **Environment Configuration**: Database credentials managed through environment variables

### Authentication & Authorization
- **Session-Based Authentication**: Server-side sessions with configurable secret keys
- **Route Protection**: Middleware-based authentication checks for protected routes
- **Password Security**: bcrypt hashing with salt rounds for secure password storage
- **Session Lifecycle**: 24-hour session timeout with automatic cleanup

### File System Integration
- **Report Generation**: Automatic creation of reports directory for attendance exports
- **Static Asset Management**: Public directory structure for CSS, JavaScript, and image assets
- **Environment Configuration**: dotenv for managing configuration variables

## External Dependencies

### Core Dependencies
- **Express.js**: Web application framework for Node.js
- **mysql2**: MySQL database driver with Promise support
- **bcrypt**: Password hashing library for security
- **express-session**: Session middleware for user authentication
- **ejs**: Template engine for dynamic HTML generation
- **dotenv**: Environment variable management

### Development Tools
- **Node.js**: JavaScript runtime environment
- **npm**: Package manager for dependency management

### Database Requirements
- **MySQL Server**: Relational database system for data persistence
- **Database Schema**: Requires pre-configured tables for instructors, courses, students, enrollments, and attendance records

### Environment Variables
- `DB_HOST`: Database server hostname
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Target database name
- `SESSION_SECRET`: Secret key for session encryption
- `PORT`: Application port (defaults to 5000)