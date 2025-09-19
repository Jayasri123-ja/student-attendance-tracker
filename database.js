// database.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Connect to the SQLite database
const db = new sqlite3.Database('./attendance.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to the SQLite database.');

        // Create the 'users' table for teachers
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
            } else {
                console.log('Users table is ready.');

                // Create a default teacher user (username: teacher, password: password123)
                const defaultPassword = 'password123';
                bcrypt.hash(defaultPassword, 10, (err, hash) => {
                    if (err) {
                        console.error('Error hashing password:', err);
                        return;
                    }
                    // Insert the default user, ignoring if they already exist (due to UNIQUE constraint)
                    db.run(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, ['teacher', hash], function(err) {
                        if (err) {
                            console.error('Error inserting default user:', err);
                        } else {
                            if (this.changes > 0) {
                                console.log('Default teacher user created. Username: teacher, Password: password123');
                            } else {
                                console.log('Default teacher user already exists.');
                            }
                        }
                    });
                });
            }
        });

        // Create the 'students' table
        db.run(`CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            roll_number TEXT UNIQUE NOT NULL,
            class TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating students table:', err);
            } else {
                console.log('Students table is ready.');
            }
        });

        // Create the 'attendance' table
        db.run(`CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students (id)
        )`, (err) => {
            if (err) {
                console.error('Error creating attendance table:', err);
            } else {
                console.log('Attendance table is ready.');
            }
        });
    }
});

// Function to get the database instance for use in other files
function getDb() {
    return db;
}

// Export the function to access the database
module.exports = getDb;