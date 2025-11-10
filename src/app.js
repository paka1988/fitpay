require('dotenv').config();
const express = require('express');
const path = require('path');       // wichtig für Dateipfade
const session = require('express-session');
const authRoutes = require('./routes/auth');
const fitbitRoutes = require('./routes/fitbit');

const app = express();
app.use(express.json());
app.use(session({ secret: 'fitbit_secret', resave: false, saveUninitialized: true }));

// ----------------------------
// 1️⃣ HTML-Dateien ausliefern
// ----------------------------

// Root → index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Erfolg-Seite → success.html
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'success.html'));
});

// ----------------------------
// 2️⃣ Routes einbinden
// ----------------------------
app.use('/auth', authRoutes);
app.use('/fitbit', fitbitRoutes);

// Server starten
app.listen(5000, () => console.log('Server läuft auf http://localhost:5000'));