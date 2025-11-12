// src/public/js/app.js

async function fetchData(endpoint) {
    try {
        const res = await fetch(endpoint);
        if (!res.ok) {
            showErrorMessage(`HTTP Error ${res.status}`);
            return null;
        }
        return await res.json();
    } catch (err) {
        console.error(`Fetch-Fehler für ${endpoint}:`, err);
        showErrorMessage('Fehler beim Laden der Daten. Bitte versuche es erneut.');
        return null;
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
        if (!res.ok) {
            showErrorMessage(`HTTP Fehler ${res.status} beim Laden der Fitbit-Daten`);
            return null;
        }

        const data = await res.json();
        const summary = data.summary || {};

        const activeMinutes = (summary.fairlyActiveMinutes || 0) + (summary.veryActiveMinutes || 0);
        const steps = summary.steps || 0;
        const earnings = activeMinutes / 30; // Beispiel: 1 € pro 30 aktive Minuten

        // Elemente auf der Seite aktualisieren, falls vorhanden
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        setText('active-minutes', activeMinutes);
        setText('steps', steps.toLocaleString());
        setText('earnings', `€${earnings.toFixed(2)}`);

        return {summary, activeMinutes, steps, earnings};
    } catch (err) {
        console.error('Fehler beim Laden des Dashboards:', err);
        showErrorMessage('Fehler beim Laden der Fitbit-Daten. Bitte versuche es erneut.');
        return null;
    }
}


/**
 * Zeigt eine interaktive Fehlernachricht basierend auf einem HTML-Template
 * @param {string} message - Die Fehlermeldung
 */
function showErrorMessage(message) {
    const template = document.getElementById('error-template');
    if (!template) {
        console.error('Error template not found!');
        return;
    }

    // Clone template
    const clone = template.content.cloneNode(true);
    const alertDiv = clone.querySelector('div.alert');
    const msgSpan = clone.querySelector('.error-message');
    const closeBtn = clone.querySelector('.btn-close');

    msgSpan.textContent = message;

    // Close button handler
    closeBtn.addEventListener('click', () => {
        alertDiv.remove();
    });

    // Append to body
    document.body.appendChild(alertDiv);
}