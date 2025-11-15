// src/public/js/app.js (Browser-Version) 🚀

// --- Auth prüfen ---
async function checkAuth() {
    try {
        const res = await fetch('/auth/status');
        const data = await res.json();

        if (!data.authenticated) {
            console.warn('Nicht eingeloggt – Redirect zu Login');
            window.location.href = '/index.html';
        }
    } catch {
        window.location.href = '/index.html';
    }
}

// --- API Wrapper ---
async function fetchData(endpoint) {
    try {
        const res = await fetch(endpoint);
        if (!res.ok) {
            showErrorMessage(`HTTP Fehler ${res.status} beim Laden der Fitbit-Daten`);
            return null;
        }
        return await res.json();
    } catch (err) {
        console.error(err);
        showErrorMessage('Fehler beim Laden der Daten');
        return null;
    }
}

// --- Dashboard laden ---
async function loadDashboard() {
    const data = await fetchData('/fitbit/today');
    if (!data?.summary) return;

    const summary = data.summary;
    const activeMinutes = (summary.fairlyActiveMinutes || 0) + (summary.veryActiveMinutes || 0);
    const earnings = activeMinutes / 30;

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText('active-minutes', activeMinutes);
    setText('steps', (summary.steps || 0).toLocaleString());
    setText('earnings', `€${earnings.toFixed(2)}`);
}

// Beispielhafte Berechnung: z. B. 1 € pro Aktivität über 30 Minuten
async function loadEarnings() {
    const container = document.getElementById('earnings');
    container.innerHTML = '<p>Lade Einnahmen...</p>';

    try {
        const data = await fetchData('/fitbit/rewards'); // oder fetchFitbitRewards()
        if (!data) {
            container.innerHTML = '<p class="text-danger">Fehler beim Laden der Einnahmen.</p>';
            return;
        }

        const { activities, reward } = data;
        const activeMinutes = (activities.summary.fairlyActiveMinutes || 0) + (activities.summary.veryActiveMinutes || 0);

        container.innerHTML = `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card shadow-sm text-center">
                <div class="card-body">
                    <h5 class="card-title">Aktive Minuten</h5>
                    <p class="card-text display-6">${activeMinutes}</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card shadow-sm text-center">
                <div class="card-body">
                    <h5 class="card-title">Schritte</h5>
                    <p class="card-text display-6">${activities.summary.steps || 0}</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card shadow-sm text-center">
                <div class="card-body">
                    <h5 class="card-title">Verdientes Geld</h5>
                    <p class="card-text display-6">€${reward.toFixed(2)}</p>
                </div>
            </div>
        </div>
        `;
    } catch (err) {
        console.error('Error loading earnings:', err);
        container.innerHTML = '<p class="text-danger">Fehler beim Laden der Einnahmen.</p>';
    }
}

// --- Activities Page ---
async function loadActivities() {
    const container = document.getElementById('activities');
    container.innerHTML = '<p>Lade Aktivitäten...</p>';

    try {
        const data = await fetchData('/fitbit/today'); // nutzt fetchFitbitDay() Utility
        if (!data) {
            container.innerHTML = '<p class="text-danger">Fehler beim Laden der Aktivitäten.</p>';
            return;
        }

        const summary = data.summary || {};
        const activeMinutes = (summary.fairlyActiveMinutes || 0) + (summary.veryActiveMinutes || 0);

        container.innerHTML = `
        <div class="col-12 col-md-6 col-lg-3">
            <div class="card shadow-sm text-center">
                <div class="card-body">
                    <h5 class="card-title">Schritte</h5>
                    <p class="card-text display-6">${summary.steps || 0}</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
            <div class="card shadow-sm text-center">
                <div class="card-body">
                    <h5 class="card-title">Kalorien</h5>
                    <p class="card-text display-6">${summary.caloriesOut || 0}</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
            <div class="card shadow-sm text-center">
                <div class="card-body">
                    <h5 class="card-title">Aktive Minuten</h5>
                    <p class="card-text display-6">${activeMinutes}</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
            <div class="card shadow-sm text-center">
                <div class="card-body">
                    <h5 class="card-title">Entfernung (km)</h5>
                    <p class="card-text display-6">${(summary.distances?.[0]?.distance || 0).toFixed(2)}</p>
                </div>
            </div>
        </div>
        `;
    } catch (err) {
        console.error('Error loading activities:', err);
        container.innerHTML = '<p class="text-danger">Fehler beim Laden der Aktivitäten.</p>';
    }
}

async function loadProfile() {
    try {
        const data = await fetchData('/fitbit/profile');
        if (!data) return;

        document.getElementById('profile').innerHTML = `
        <div class="col-12 col-md-6">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${data.user.displayName}</h5>
                    <p class="card-text"><strong>Alter:</strong> ${data.user.age}</p>
                    <p class="card-text"><strong>Schritte-Ziel:</strong> ${data.user.topBadges.length} Badges</p>
                    ${data.user.avatar ? `<img src="${data.user.avatar}" class="img-fluid rounded mt-3" alt="Avatar">` : ''}
                </div>
            </div>
        </div>
        `;
    } catch (err) {
        console.error('Error loading profile:', err);
        showErrorMessage('Fehler beim Laden des Profils.');
    }
}

// --- Error Template Anzeigen ---
function showErrorMessage(message) {
    const template = document.getElementById('error-template');
    if (!template) return console.error('Missing #error-template');

    const clone = template.content.cloneNode(true);
    const alertDiv = clone.querySelector('.alert');
    const msg = clone.querySelector('.error-message');

    msg.textContent = message;
    alertDiv.querySelector('.btn-close').addEventListener('click', () =>
        alertDiv.remove()
    );

    document.body.appendChild(alertDiv);
}

// --- Global verfügbar machen ---
window.checkAuth = checkAuth;
window.fetchData = fetchData;
window.loadDashboard = loadDashboard;
window.loadActivities = loadActivities;
window.showErrorMessage = showErrorMessage;
