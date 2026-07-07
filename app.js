const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '9700892', // change if needed
    database: 'c237_studentlistapp'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }

    console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// Home page
app.get('/', (req, res) => {

    const sql = 'SELECT * FROM student';

    connection.query(sql, (error, results) => {

        if (error) {
            console.error(error);
            return res.send('Error retrieving students');
        }

        res.render('index', {
            students: results
        });

    });

});

// Student Details
app.get('/student/:id', (req, res) => {

    const studentId = req.params.id;

    const sql = 'SELECT * FROM student WHERE studentId = ?';

    connection.query(sql, [studentId], (error, results) => {

        if (error) {
            console.error(error);
            return res.send('Error retrieving student');
        }

        if (results.length > 0) {

            res.render('student', {
                student: results[0]
            });

        } else {

            res.send('Student not found');

        }

    });

});

// Display Add Student page
app.get('/addStudent', (req, res) => {

    res.render('addStudent');

});

// Add Student
app.post('/addStudent', upload.single('image'), (req, res) => {

    const { name, dob, contact } = req.body;
    const image = req.file.filename;

    const sql = `
        INSERT INTO student (name, dob, contact, image)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(sql,
        [name, dob, contact, image],
        (error) => {

            if (error) {
                console.error(error);
                return res.send('Error adding student');
            }

            res.redirect('/');

        });

});

// Display Edit Student page
app.get('/editStudent/:id', (req, res) => {

    const studentId = req.params.id;

    const sql = 'SELECT * FROM student WHERE studentId = ?';

    connection.query(sql, [studentId], (error, results) => {

        if (error) {
            console.error(error);
            return res.send('Error retrieving student');
        }

        if (results.length > 0) {

            res.render('editStudent', {
                student: results[0]
            });

        } else {

            res.send('Student not found');

        }

    });

});

// Handle Edit Student form submission
app.post('/editStudent/:id', upload.single('image'), (req, res) => {

    const studentId = req.params.id;

    const { name, dob, contact } = req.body;

    let image;

    if (req.file) {
        image = req.file.filename;
    } else {
        image = req.body.currentImage;
    }

    const sql = `
        UPDATE student
        SET name = ?, dob = ?, contact = ?, image = ?
        WHERE studentId = ?
    `;

    connection.query(
        sql,
        [name, dob, contact, image, studentId],
        (error) => {

            if (error) {
                console.error(error);
                return res.send('Error updating student');
            }

            res.redirect('/');

        }
    );

});

// Delete Student
app.get('/deleteStudent/:id', (req, res) => {

    const studentId = req.params.id;

    const sql = 'DELETE FROM student WHERE studentId = ?';

    connection.query(sql, [studentId], (error) => {

        if (error) {
            console.error(error);
            return res.send('Error deleting student');
        }

        res.redirect('/');

    });

});
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});