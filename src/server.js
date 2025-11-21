require('./loadEnv');
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');
const fitbitRoutes = require('./routes/fitbit');
const ensureAuthenticated = require('./middleware/authCheck');


const server = express();

// Serve Bootstrap directly from node_modules
server.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
server.use(express.static(path.join(__dirname, 'public')));
server.use(express.urlencoded({extended: true}));
server.use(express.json());

// Session-Setup (WICHTIG)
server.use(
    session({
        secret: process.env.SESSION_SECRET || 'supersecret',
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false}, // secure:true nur mit HTTPS
    })
);

// Auth-Routen
server.use('/auth', authRoutes);
server.use('/fitbit', fitbitRoutes);

// Geschützte Seiten
server.get(['/dashboard.html', '/profile.html', '/activities.html', '/earnings.html'], ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', req.path));
});

// --- Debug incoming requests (optional) ---
server.use((req, res, next) => {
    console.log('Incoming:', req.method, req.url);
    next();
});

server.listen(process.env.PORT || 3000, () => console.log('🚀 Server läuft'));
