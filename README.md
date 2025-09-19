# Student Attendance Tracker

A full-stack web application built with Node.js, Express, SQLite, and vanilla JavaScript for managing student attendance.

## Features

- **User Authentication:** Secure teacher registration and login system with password hashing.
- **Student Management:** Add and manage student details (name, roll number, class).
- **Attendance Tracking:** Mark daily attendance (Present/Absent) for all students.
- **View Records:** View attendance by date or by individual student.
- **Responsive UI:** Clean and user-friendly interface.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **Authentication:** bcryptjs
- **Package Manager:** npm

## Installation & Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/Jayasri123-ja/student-attendance-tracker.git
    cd student-attendance-tracker
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Initialize the database:
    ```bash
    node database.js
    ```

4.  Start the server:
    ```bash
    node server.js
    ```

5.  Open your browser and go to `http://localhost:3000`

## Default Login

A default teacher account is created automatically:
- **Username:** `teacher`
- **Password:** `password123`

## Project Structure
attendance-tracker/
├── public/
│ ├── css/
│ │ └── style.css
│ ├── js/
│ │ └── script.js
│ ├── index.html
│ ├── dashboard.html
│ ├── add_student.html
│ ├── mark_attendance.html
│ └── view_attendance.html
├── database.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md

## API Endpoints

- `POST /login` - User authentication
- `POST /register` - New user registration
- `GET /students` - Get all students
- `POST /add-student` - Add a new student
- `POST /save-attendance` - Mark attendance
- `GET /attendance/by-date/:date` - Get attendance by date
- `GET /attendance/by-student/:studentId` - Get attendance by student