# Environment Setup Guide

## Setting Up Your MySQL Database

### Step 1: Create Database in MySQL Workbench
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Open and execute the `setup.sql` file (found in project root)
4. This will create:
   - Database: `university_attendance`
   - All required tables with relationships
   - Sample instructor: bobby@prof.edu / password123 (hashed)
   - 3 courses: CS101, MATH201, ENG150
   - 10 students enrolled in each course

### Step 2: Set Environment Variables in Replit

In your Replit environment, set these secrets/environment variables:

**Required Variables:**
- `DB_HOST` = `localhost` (or your MySQL server IP)
- `DB_USER` = your MySQL username (usually `root`)
- `DB_PASSWORD` = your MySQL password
- `DB_NAME` = `university_attendance`
- `SESSION_SECRET` = any secure random string (e.g., `uni-attendance-secret-2025`)

**Optional Variables:**
- `PORT` = `5000` (default)
- `NODE_ENV` = `development`

### Step 3: Test the Connection

After setting up the database and environment variables:

1. The application will automatically attempt to connect
2. Check the console logs for connection status:
   - ✓ Success: "Database connected successfully"
   - ✗ Failure: Shows specific error (credentials, database not found, etc.)

### Step 4: Login and Test

1. Navigate to the application URL
2. Use credentials: `bobby@prof.edu` / `password123`
3. Should redirect to Dashboard after successful login
4. From Dashboard → Courses → Select Course → Take Attendance

## Troubleshooting

### Connection Refused Error
- Ensure MySQL server is running
- Check if port 3306 is accessible
- Verify DB_HOST is correct

### Access Denied Error
- Check DB_USER and DB_PASSWORD are correct
- Ensure user has permissions for the database

### Database Not Found Error
- Run the setup.sql script in MySQL Workbench
- Verify DB_NAME matches the created database

### Login Issues
- Database must be connected for authentication
- Check that setup.sql created the instructor record
- Password is hashed with bcrypt in the database

## Application Flow After Setup

1. **Login** → Dashboard (overview with stats)
2. **Dashboard** → Courses (select course to manage)
3. **Courses** → Attendance (mark students present/absent)
4. **Attendance** → Reports (generate and download)
5. **Navigation** → Dashboard, Courses, Reports, Logout

All CRUD operations require active database connection.