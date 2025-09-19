// script.js

// Function to switch between Login and Register forms
function switchAuthForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const messageElement = document.getElementById('message');

    // Clear any previous messages
    messageElement.textContent = '';

    if (formType === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginLink.classList.add('active');
        registerLink.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        loginLink.classList.remove('active');
        registerLink.classList.add('active');
    }
}

// Function to handle Login Form
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        const messageElement = document.getElementById('message');
        messageElement.textContent = data.message;

        if (data.success) {
            messageElement.style.color = 'green';
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            messageElement.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('message').textContent = 'An error occurred. Please try again.';
    });
}

// Function to handle Registration Form
function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, confirmPassword })
    })
    .then(response => response.json())
    .then(data => {
        const messageElement = document.getElementById('message');
        messageElement.textContent = data.message;
        messageElement.style.color = data.success ? 'green' : 'red';

        // If registration is successful, clear the form and switch to login
        if (data.success) {
            document.getElementById('registerForm').reset();
            setTimeout(() => {
                switchAuthForm('login');
            }, 2000);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('message').textContent = 'An error occurred. Please try again.';
    });
}

// Function to handle Add Student Form
function handleAddStudent(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const roll_number = document.getElementById('roll_number').value;
    const studentClass = document.getElementById('class').value;

    fetch('/add-student', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, roll_number, class: studentClass })
    })
    .then(response => response.json())
    .then(data => {
        const messageElement = document.getElementById('message');
        messageElement.textContent = data.message;
        messageElement.style.color = data.success ? 'green' : 'red';

        if (data.success) {
            document.getElementById('addStudentForm').reset();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('message').textContent = 'An error occurred. Please try again.';
    });
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Auth form switching
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    
    if (loginLink && registerLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('login');
        });
        
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('register');
        });
    }

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', handleAddStudent);
    }
});

// Mark Attendance Page Functionality
if (document.getElementById('attendanceDate')) {
    const today = new Date();
    const dateString = today.toLocaleDateString();
    document.getElementById('attendanceDate').textContent = `Date: ${dateString}`;

    fetch('/students')
        .then(response => response.json())
        .then(data => {
            const studentListDiv = document.getElementById('studentList');
            const submitButton = document.getElementById('submitAttendance');

            if (data.success && data.students.length > 0) {
                studentListDiv.innerHTML = '';

                data.students.forEach(student => {
                    const studentDiv = document.createElement('div');
                    studentDiv.className = 'input-group';
                    studentDiv.innerHTML = `
                        <label>${student.name} (Roll: ${student.roll_number}, Class: ${student.class})</label>
                        <div>
                            <input type="radio" name="attendance-${student.id}" id="present-${student.id}" value="Present" checked>
                            <label for="present-${student.id}">Present</label>
                            <input type="radio" name="attendance-${student.id}" id="absent-${student.id}" value="Absent">
                            <label for="absent-${student.id}">Absent</label>
                        </div>
                    `;
                    studentListDiv.appendChild(studentDiv);
                });

                submitButton.style.display = 'block';
            } else {
                studentListDiv.innerHTML = '<p>No students found. Please add students first.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching students:', error);
            document.getElementById('studentList').innerHTML = '<p>Error loading students.</p>';
        });

    document.getElementById('submitAttendance').addEventListener('click', function() {
        const attendanceData = [];
        const studentRadios = document.querySelectorAll('input[type="radio"]:checked');

        studentRadios.forEach(radio => {
            const studentId = radio.name.split('-')[1];
            attendanceData.push({
                student_id: studentId,
                status: radio.value
            });
        });

        fetch('/save-attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: new Date().toISOString().split('T')[0],
                attendance: attendanceData
            })
        })
        .then(response => response.json())
        .then(data => {
            const messageElement = document.getElementById('message');
            messageElement.textContent = data.message;
            messageElement.style.color = data.success ? 'green' : 'red';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('message').textContent = 'An error occurred. Please try again.';
        });
    });
}

// View Attendance Page Functionality
if (document.getElementById('viewBy')) {
    const viewBySelect = document.getElementById('viewBy');
    const dateFilter = document.getElementById('dateFilter');
    const studentFilter = document.getElementById('studentFilter');
    const resultsDiv = document.getElementById('attendanceResults');

    document.getElementById('selectedDate').valueAsDate = new Date();

    fetch('/students')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const studentSelect = document.getElementById('selectedStudent');
                studentSelect.innerHTML = '<option value="">Select a student</option>';
                data.students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.name} (Roll: ${student.roll_number})`;
                    studentSelect.appendChild(option);
                });
            }
        });

    viewBySelect.addEventListener('change', function() {
        if (this.value === 'date') {
            dateFilter.style.display = 'block';
            studentFilter.style.display = 'none';
        } else {
            dateFilter.style.display = 'none';
            studentFilter.style.display = 'block';
        }
        resultsDiv.innerHTML = '';
    });

    document.getElementById('fetchByDate').addEventListener('click', function() {
        const date = document.getElementById('selectedDate').value;
        if (!date) {
            alert('Please select a date.');
            return;
        }

        fetch(`/attendance/by-date/${date}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.attendance.length > 0) {
                        let html = `<h3>Attendance for ${data.date}</h3>`;
                        html += `<table><tr><th>Name</th><th>Roll Number</th><th>Class</th><th>Status</th></tr>`;
                        data.attendance.forEach(record => {
                            html += `<tr>
                                <td>${record.name}</td>
                                <td>${record.roll_number}</td>
                                <td>${record.class}</td>
                                <td>${record.status}</td>
                            </tr>`;
                        });
                        html += `</table>`;
                        resultsDiv.innerHTML = html;
                    } else {
                        resultsDiv.innerHTML = `<p>No attendance records found for ${data.date}.</p>`;
                    }
                } else {
                    resultsDiv.innerHTML = `<p>Error: ${data.message}</p>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                resultsDiv.innerHTML = '<p>An error occurred while fetching attendance.</p>';
            });
    });

    document.getElementById('fetchByStudent').addEventListener('click', function() {
        const studentId = document.getElementById('selectedStudent').value;
        if (!studentId) {
            alert('Please select a student.');
            return;
        }

        fetch(`/attendance/by-student/${studentId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.records.length > 0) {
                        const studentName = data.records[0].name;
                        let html = `<h3>Attendance for ${studentName}</h3>`;
                        html += `<table><tr><th>Date</th><th>Status</th></tr>`;
                        data.records.forEach(record => {
                            html += `<tr>
                                <td>${record.date}</td>
                                <td>${record.status}</td>
                            </tr>`;
                        });
                        html += `</table>`;
                        resultsDiv.innerHTML = html;
                    } else {
                        resultsDiv.innerHTML = `<p>No attendance records found for this student.</p>`;
                    }
                } else {
                    resultsDiv.innerHTML = `<p>Error: ${data.message}</p>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                resultsDiv.innerHTML = '<p>An error occurred while fetching attendance.</p>';
            });
    });
}