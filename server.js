const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const app = express();
const csp = require('helmet-csp');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const bcrypt = require('bcrypt');
const saltRounds = 10;

require('dotenv').config({ path: './key.env' });
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

app.use(csp({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'self'"],
        objectSrc: ["'self'"],
        mediaSrc: ["'self'"],
        reportUri: "/csp-report-endpoint"
    }
}));

app.use(session({
    name: 'session_id',
    secret: process.env.secret_key,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false,httpOnly: true,sameSite: 'strict'}
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'library'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100 
});
app.use(limiter);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// User registration
app.post('/register', async(req, res) => {
    const { username, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        db.query('INSERT INTO users (username, passwords, role) VALUES (?,?,?)', [username, hashedPassword, role], (err, result) => {
            if (err) throw err;
            res.send({ success: true, message: 'User registered successfully!' });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send({ success: false, message: 'Registration failed due to password hashing error.' });
    }
});

// User login
app.post('/api/login', async(req, res) => {
    const { username, password} = req.body;
    try {
        const user = await db.promise().query('SELECT * FROM users WHERE username =?', [username]);
        if (user[0].length === 0) return res.status(401).send({ message: 'Authentication failed. User not found or wrong password.' });

        const match = await bcrypt.compare(password, user[0][0].passwords);
        if (!match) return res.status(401).send({ message: 'Authentication failed. User not found or wrong password.' });

        req.session.authenticated = true;
        res.send({ auth: true, user: user[0][0], role: user[0][0].role });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ message: 'Login failed due to an internal error.' });
    }
    });

//Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout failed:', err);
            return res.status(500).send({ message: 'Logout failed' });
        }
        res.clearCookie('session_id'); 
        res.redirect('/login.html');
    });
});

// Get all books
app.get('/books', (req, res) => {
    db.query('SELECT * FROM books', (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});


// Add a new book
app.post('/books',(req, res) => {
    const { title, author, description} = req.body;
    db.query('INSERT INTO books (title, author, description) VALUES (?, ?, ?)', [title, author, description], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send({ success: false, message: 'Database error' });
        } else {
            res.json({ success: true, result });
        }
    });
});

// Update a book
app.put('/books/:id',(req, res) => {
    const { title, author, description } = req.body;
    db.query('UPDATE books SET title = ?, author = ?, description = ? WHERE id = ?', [title, author, description, req.params.id], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

// Delete a book
app.delete('/books/:id', (req, res) => {
    db.query('DELETE FROM books WHERE id = ?', [req.params.id], (err, result) => {
        if (err) throw err;
        res.send(result);
    });

});
function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.authenticated) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));