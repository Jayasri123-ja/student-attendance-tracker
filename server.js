// server.js
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const getDb = require('./database.js'); // Import the function to get the database

const app = express();
const port = 3000;
const db = getDb(); // Get the database instance

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' folder (HTML, CSS, JS)
app.use(express.static('public'));

// Basic route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// REGISTER API ROUTE (POST)
app.post('/register', (req, res) => {
    const { username, password, confirmPassword } = req.body;

    // 1. Check if passwords match
    if (password !== confirmPassword) {
        return res.json({ success: false, message: 'Passwords do not match.' });
    }

    // 2. Check if username already exists
    const checkUserSql = `SELECT * FROM users WHERE username = ?`;
    db.get(checkUserSql, [username], (err, existingUser) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
        }

        if (existingUser) {
            return res.json({ success: false, message: 'Username already exists. Please choose another.' });
        }

        // 3. Hash the password and create new user
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
            }

            const insertSql = `INSERT INTO users (username, password) VALUES (?, ?)`;
            db.run(insertSql, [username, hash], function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Failed to create account. Please try again.' });
                }
                res.json({ success: true, message: 'Registration successful! You can now login.' });
            });
        });
    });
});

// LOGIN API ROUTE (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 1. Check if user exists in the database
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
        }

        if (!user) {
            // User not found
            return res.json({ success: false, message: 'Invalid username or password.' });
        }

        // 2. User exists, now check the password
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error('Password comparison error:', err);
                return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
            }

            if (result) {
                // Password is correct! Login successful.
                res.json({ success: true, message: 'Login successful!' });
            } else {
                // Password is incorrect
                res.json({ success: false, message: 'Invalid username or password.' });
            }
        });
    });
});

// GET STUDENTS API ROUTE (to fetch the list of students)
app.get('/students', (req, res) => {
    const sql = `SELECT id, name, roll_number, class FROM students ORDER BY name`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch students.' });
        }
        res.json({ success: true, students: rows });
    });
});

// GET ATTENDANCE BY DATE API ROUTE
app.get('/attendance/by-date/:date', (req, res) => {
    const date = req.params.date;
    const sql = `
        SELECT s.name, s.roll_number, s.class, a.status 
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.date = ?
        ORDER BY s.name
    `;
    db.all(sql, [date], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch attendance.' });
        }
        res.json({ success: true, attendance: rows, date: date });
    });
});

// GET ATTENDANCE BY STUDENT API ROUTE
app.get('/attendance/by-student/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    const sql = `
        SELECT a.date, a.status, s.name, s.roll_number
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.student_id = ?
        ORDER BY a.date DESC
    `;
    db.all(sql, [studentId], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch attendance.' });
        }
        res.json({ success: true, records: rows });
    });
});

// SAVE ATTENDANCE API ROUTE (POST)
app.post('/save-attendance', (req, res) => {
    const { date, attendance } = req.body; // attendance is an array of objects: { student_id: 1, status: "Present" }

    // Start a database transaction to ensure all records are saved correctly
    db.serialize(() => {
        // First, prepare the INSERT statement
        const insertSql = `INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)`;

        // Use a prepared statement for efficiency
        const stmt = db.prepare(insertSql);

        // Loop through the attendance array and insert each record
        attendance.forEach(record => {
            stmt.run([record.student_id, date, record.status], (err) => {
                if (err) {
                    console.error('Error inserting attendance record:', err);
                }
            });
        });

        // Finalize the statement and send response
        stmt.finalize((err) => {
            if (err) {
                console.error('Error finalizing statement:', err);
                return res.json({ success: false, message: 'Error saving attendance.' });
            }
            res.json({ success: true, message: 'Attendance saved successfully!' });
        });
    });
});

// ADD STUDENT API ROUTE (POST)
app.post('/add-student', (req, res) => {
    const { name, roll_number, class: studentClass } = req.body; // 'class' is a reserved word, so we use studentClass

    // SQL to insert the new student into the database
    const sql = `INSERT INTO students (name, roll_number, class) VALUES (?, ?, ?)`;
    db.run(sql, [name, roll_number, studentClass], function(err) {
        if (err) {
            console.error('Database error:', err);
            // Check if error is because of duplicate roll number
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.json({ success: false, message: 'A student with this roll number already exists.' });
            }
            return res.status(500).json({ success: false, message: 'Failed to add student. Please try again.' });
        }
        // If successful, send a success response
        res.json({ success: true, message: `Student '${name}' added successfully!` });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});