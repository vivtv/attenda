const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const router = express.Router();

// Dashboard route
router.get('/dashboard', async (req, res) => {
    try {
        // Try to get courses for the dashboard
        let courses = [];
        try {
            const [courseRows] = await db.execute(
                'SELECT id, course_code, course_name FROM courses ORDER BY course_code'
            );
            courses = courseRows;
        } catch (dbError) {
            console.log('Database not connected, showing dashboard without course data');
        }

        res.render('dashboard', {
            title: 'Dashboard',
            courses,
            instructorName: req.session.instructorName
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).render('error', {
            message: 'Error loading dashboard',
            error: {}
        });
    }
});

// Courses selection page
router.get('/courses', async (req, res) => {
    try {
        const [courses] = await db.execute(
            'SELECT id, course_code, course_name FROM courses ORDER BY course_code'
        );

        res.render('courses', {
            title: 'Select Course',
            courses,
            instructorName: req.session.instructorName
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).render('error', {
            message: 'Error loading courses',
            error: {}
        });
    }
});

// Attendance page for specific course
router.get('/attendance/:courseId', async (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId);
        const date = req.query.date || new Date().toISOString().split('T')[0];

        // Get course info
        const [courseRows] = await db.execute(
            'SELECT id, course_code, course_name FROM courses WHERE id = ?',
            [courseId]
        );

        if (courseRows.length === 0) {
            return res.status(404).render('error', {
                message: 'Course not found',
                error: {}
            });
        }

        const course = courseRows[0];

        // Get enrolled students with their attendance status for the date
        const [students] = await db.execute(`
            SELECT 
                s.id, 
                s.student_id, 
                s.first_name, 
                s.last_name,
                s.email,
                a.status
            FROM students s
            JOIN course_enrollments ce ON s.id = ce.student_id
            LEFT JOIN attendance a ON s.id = a.student_id 
                AND a.course_id = ? 
                AND a.attendance_date = ?
            WHERE ce.course_id = ?
            ORDER BY s.last_name, s.first_name
        `, [courseId, date, courseId]);

        res.render('attendance', {
            title: `Attendance - ${course.course_name}`,
            course,
            students,
            date,
            instructorName: req.session.instructorName,
            success: req.session.success,
            error: req.session.error
        });

        delete req.session.success;
        delete req.session.error;
    } catch (error) {
        console.error('Error loading attendance page:', error);
        res.status(500).render('error', {
            message: 'Error loading attendance page',
            error: {}
        });
    }
});

// Submit attendance
router.post('/attendance/:courseId', async (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId);
        const { date, attendance } = req.body;
        const instructorId = req.session.instructorId;

        console.log('Attendance submission:', { 
            courseId, 
            date, 
            attendance: attendance ? Object.keys(attendance).length + ' students' : 'none', 
            instructorId,
            formData: req.body 
        });

        if (!attendance || Object.keys(attendance).length === 0) {
            console.log('No attendance data received');
            req.session.error = 'Please mark attendance for at least one student';
            return res.redirect(`/attendance/${courseId}?date=${date}`);
        }

        if (!date) {
            req.session.error = 'Date is required';
            return res.redirect(`/attendance/${courseId}`);
        }

        // Get a connection for transaction
        const connection = await db.getConnection();
        
        try {
            // Begin transaction
            await connection.execute('START TRANSACTION');

            // Delete existing attendance for this date and course
            await connection.execute(
                'DELETE FROM attendance WHERE course_id = ? AND attendance_date = ?',
                [courseId, date]
            );

            // Insert new attendance records
            let recordCount = 0;
            for (const [studentId, status] of Object.entries(attendance)) {
                if (status === 'present' || status === 'absent') {
                    console.log(`Inserting attendance: courseId=${courseId}, studentId=${studentId}, date=${date}, status=${status}, instructorId=${instructorId}`);
                    await connection.execute(
                        'INSERT INTO attendance (course_id, student_id, attendance_date, status, recorded_by) VALUES (?, ?, ?, ?, ?)',
                        [courseId, parseInt(studentId), date, status, instructorId]
                    );
                    recordCount++;
                }
            }

            // Commit transaction
            await connection.execute('COMMIT');
            connection.release();

            req.session.success = `Attendance recorded successfully for ${recordCount} students`;
            res.redirect(`/attendance/${courseId}?date=${date}`);
        } catch (error) {
            // Rollback transaction on error
            try {
                await connection.execute('ROLLBACK');
            } catch (rollbackError) {
                console.error('Rollback error:', rollbackError);
            }
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Error submitting attendance:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sql: error.sql
        });
        req.session.error = `Error recording attendance: ${error.message}`;
        res.redirect(`/attendance/${req.params.courseId}?date=${req.body.date || new Date().toISOString().split('T')[0]}`);
    }
});

// Generate report
router.post('/generate-report/:courseId', async (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId);
        const { date } = req.body;

        // Get course info and attendance data
        const [courseRows] = await db.execute(
            'SELECT course_code, course_name FROM courses WHERE id = ?',
            [courseId]
        );

        const [attendanceRows] = await db.execute(`
            SELECT 
                s.student_id,
                s.first_name,
                s.last_name,
                a.status,
                a.created_at
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.course_id = ? AND a.attendance_date = ?
            ORDER BY s.last_name, s.first_name
        `, [courseId, date]);

        if (courseRows.length === 0) {
            req.session.error = 'Course not found';
            return res.redirect(`/attendance/${courseId}?date=${date}`);
        }

        const course = courseRows[0];
        const reportContent = generateReportContent(course, attendanceRows, date);
        
        // Save report to file
        const reportsDir = path.join(__dirname, '../reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        const fileName = `attendance_${course.course_code}_${date}.txt`;
        const filePath = path.join(reportsDir, fileName);
        
        fs.writeFileSync(filePath, reportContent);

        req.session.success = `Report generated successfully: ${fileName}`;
        res.redirect(`/attendance/${courseId}?date=${date}`);
    } catch (error) {
        console.error('Error generating report:', error);
        req.session.error = 'Error generating report. Please try again.';
        res.redirect(`/attendance/${req.params.courseId}?date=${req.body.date}`);
    }
});

// Reports page
router.get('/reports', async (req, res) => {
    try {
        const reportsDir = path.join(__dirname, '../reports');
        let reports = [];

        if (fs.existsSync(reportsDir)) {
            const files = fs.readdirSync(reportsDir);
            reports = files
                .filter(file => file.endsWith('.txt'))
                .map(file => {
                    const stats = fs.statSync(path.join(reportsDir, file));
                    return {
                        filename: file,
                        created: stats.mtime,
                        size: stats.size
                    };
                })
                .sort((a, b) => b.created - a.created);
        }

        res.render('reports', {
            title: 'Generated Reports',
            reports,
            instructorName: req.session.instructorName
        });
    } catch (error) {
        console.error('Error loading reports:', error);
        res.status(500).render('error', {
            message: 'Error loading reports',
            error: {}
        });
    }
});

// Download report
router.get('/download-report/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../reports', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).render('error', {
                message: 'Report not found',
                error: {}
            });
        }

        res.download(filePath, filename);
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).render('error', {
            message: 'Error downloading report',
            error: {}
        });
    }
});

// Delete attendance record
router.delete('/attendance/:id', async (req, res) => {
    try {
        const attendanceId = parseInt(req.params.id);

        const [result] = await db.execute(
            'DELETE FROM attendance WHERE id = ?',
            [attendanceId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Attendance record not found' });
        }

        res.json({ success: true, message: 'Attendance record deleted successfully' });
    } catch (error) {
        console.error('Error deleting attendance:', error);
        res.status(500).json({ success: false, message: 'Error deleting attendance record' });
    }
});

// Helper function to generate report content
function generateReportContent(course, attendance, date) {
    const header = `
UNIVERSITY ATTENDANCE REPORT
============================

Course: ${course.course_code} - ${course.course_name}
Date: ${date}
Generated: ${new Date().toLocaleString()}

ATTENDANCE SUMMARY
==================
`;

    let content = header;
    let presentCount = 0;
    let absentCount = 0;

    content += '\nSTUDENT ATTENDANCE:\n';
    content += '-'.repeat(50) + '\n';

    attendance.forEach(record => {
        const status = record.status.toUpperCase();
        content += `${record.student_id.padEnd(10)} | ${(record.last_name + ', ' + record.first_name).padEnd(25)} | ${status}\n`;
        
        if (record.status === 'present') {
            presentCount++;
        } else {
            absentCount++;
        }
    });

    content += '-'.repeat(50) + '\n';
    content += `TOTAL STUDENTS: ${attendance.length}\n`;
    content += `PRESENT: ${presentCount}\n`;
    content += `ABSENT: ${absentCount}\n`;
    content += `ATTENDANCE RATE: ${attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : 0}%\n`;

    return content;
}

module.exports = router;
