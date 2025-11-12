require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');
const ensureAuthenticated = require('./middleware/authCheck');

const app = express();

// Serve Bootstrap directly from node_modules
app.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Session-Setup (WICHTIG)
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'supersecret',
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false}, // secure:true nur mit HTTPS
    })
);

// Auth-Routen
app.use('/auth', authRoutes);

// Geschützte Seiten
app.get(['/dashboard.html', '/profile.html', '/activities.html', '/earnings.html'], ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', req.path));
});

app.listen(process.env.PORT || 3000, () => console.log('🚀 Server läuft'));
