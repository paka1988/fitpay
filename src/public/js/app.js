// src/public/js/app.js

async function fetchData(endpoint) {
    try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log('Data:', data);
        return data;
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

// Beispiel: Aufrufe, wenn du Daten anzeigst
// fetchData('/fitbit/profile');
// fetchData('/fitbit/today');

// src/public/js/app.js

/**
 * Prüft, ob der User eingeloggt ist (Session aktiv)
 */
async function checkAuth() {
    try {
        const res = await fetch('/auth/status');
        const data = await res.json();
        if (!data.authenticated) {
            console.warn('Nicht eingeloggt – Redirect zu Login');
            window.location.href = '/index.html';
        }
    } catch (err) {
        console.error('Auth check failed', err);
        window.location.href = '/index.html';
    }
}

/**
 * Lädt heutige Fitbit-Daten und aktualisiert die Dashboard-Elemente.
 * Diese Funktion kann von mehreren Seiten verwendet werden.
 */
async function loadDashboard() {
    try {
        const res = await fetch('/fitbit/today');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const summary = data.summary || {};
        const activeMinutes = (summary.fairlyActiveMinutes || 0) + (summary.veryActiveMinutes || 0);
        const steps = summary.steps || 0;
        const earnings = (activeMinutes / 30) * 1.0; // Beispiel: 1 € pro 30 aktive Minuten

        // Elemente auf der Seite aktualisieren, falls vorhanden
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        setText('active-minutes', activeMinutes);
        setText('steps', steps.toLocaleString());
        setText('earnings', `€${earnings.toFixed(2)}`);

        return { summary, activeMinutes, steps, earnings };
    } catch (err) {
        console.error('Fehler beim Laden des Dashboards:', err);
    }
}