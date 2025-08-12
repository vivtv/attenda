# University Attendance Management System

A complete university attendance tracking CRUD web application built with Node.js, Express, EJS, and MySQL.

## Features

- **Instructor Authentication**: Secure login system with bcrypt password hashing
- **Course Management**: Select from multiple courses to manage attendance
- **Student Enrollment**: View enrolled students for each course
- **Attendance Tracking**: Mark students as present/absent with date selection
- **CRUD Operations**: Create, read, update, and delete attendance records
- **Report Generation**: Generate and download attendance reports as text files
- **Responsive Design**: Modern white & blue theme that works on all devices

## Quick Start

### 1. Database Setup

1. Open MySQL Workbench
2. Run the provided `setup.sql` file to create the database and tables
3. This will create:
   - Database: `university_attendance`
   - Tables: instructors, courses, students, course_enrollments, attendance
   - Sample data: 1 instructor, 3 courses, 10 students

### 2. Environment Configuration

Set these environment variables in your Replit environment:
- `DB_HOST`: Your MySQL server host (usually `localhost`)
- `DB_USER`: Your MySQL username (usually `root`)
- `DB_PASSWORD`: Your MySQL password
- `DB_NAME`: Database name (`university_attendance`)
- `SESSION_SECRET`: A secure random string for session encryption

### 3. Start the Application

The application will automatically:
- Install required dependencies
- Start the server on port 5000
- Test the database connection

## Default Login Credentials

- **Email**: bobby@prof.edu
- **Password**: password123

## Application Flow

1. **Login**: Instructor logs in with email and password
2. **Course Selection**: Choose from available courses
3. **Attendance**: Mark students present/absent for selected date
4. **Report Generation**: Create downloadable attendance reports
5. **Reports Management**: View and download previously generated reports

## Technical Architecture

### Backend
- **Node.js + Express**: Web server and routing
- **MySQL2**: Database connectivity with connection pooling
- **bcrypt**: Password hashing and security
- **express-session**: Session-based authentication

### Frontend
- **EJS Templates**: Server-side rendering
- **Responsive CSS**: Mobile-first design with modern styling
- **Font Awesome**: Icons and visual elements

### Database Schema
- **instructors**: Store instructor login credentials
- **courses**: Course information and assignments
- **students**: Student personal information
- **course_enrollments**: Many-to-many relationship between courses and students
- **attendance**: Attendance records with date, status, and tracking

## File Structure

```
├── config/
│   └── database.js          # MySQL connection configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── public/css/
│   └── style.css            # Responsive styling
├── routes/
│   ├── auth.js              # Login/logout routes
│   └── attendance.js        # Main application routes
├── views/
│   ├── layout.ejs           # Base template
│   ├── login.ejs            # Login page
│   ├── courses.ejs          # Course selection
│   ├── attendance.ejs       # Attendance management
│   └── reports.ejs          # Reports listing
├── app.js                   # Main application entry point
└── setup.sql                # Database schema and sample data
```

## CRUD Operations

### Create
- New attendance records when marking attendance
- Report files when generating reports

### Read
- Display courses, students, and existing attendance
- View generated reports and download files

### Update
- Modify attendance records by resubmitting for the same date
- Session management for instructor authentication

### Delete
- Remove attendance records via API endpoints
- Clear old session data on logout

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- Session-based authentication with secure cookies
- SQL injection prevention with parameterized queries
- CSRF protection through session validation
- Input validation and sanitization

## Responsive Design

The application features a fully responsive design that works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones

Key responsive features:
- Flexible grid layouts
- Touch-friendly buttons and controls
- Optimized typography and spacing
- Mobile navigation patterns

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use HTTPS for secure sessions
3. Configure proper database backup procedures
4. Set up monitoring and logging
5. Use environment-specific database credentials

## Support

This is a complete attendance management system ready for production use in university environments. The system handles all CRUD operations efficiently and provides a clean, professional interface for instructors to manage student attendance.