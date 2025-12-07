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
    const data = await fetchData('/fitbit/rewards');
    if (!data.activities) return;

    const summary = data.activities.summary;
    const activeMinutes = (summary.fairlyActiveMinutes || 0) + (summary.veryActiveMinutes || 0);
    const earnings = data.reward_today;
    console.log(data)

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText('active-minutes', activeMinutes);
    setText('steps', (summary.steps || 0).toLocaleString());
    setText('earnings', `€${earnings.toFixed(2)}`);
    setText('earnings_total', `€${Number(data.reward_total?.totalEarnings ?? 0).toFixed(2)}`);
}

// Beispielhafte Berechnung: z. B. 1 € pro Aktivität über 30 Minuten
async function loadEarnings() {
    const container = document.getElementById('earnings');

    try {
        const data = await fetchData('/fitbit/rewards'); // oder fetchFitbitRewards()
        if (!data) {
            container.innerHTML = '<p class="text-danger">Fehler beim Laden der Einnahmen.</p>';
            return;
        }

        const {activities, reward} = data;
        const activeMinutes = (activities.summary.fairlyActiveMinutes || 0) + (activities.summary.veryActiveMinutes || 0);

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        setText('active-minutes', activeMinutes);
        setText('steps', (activities.summary.steps || 0).toLocaleString());
        setText('earning-details', `€${reward.toFixed(2)}`);
    } catch (err) {
        console.error('Error loading earnings:', err);
        container.innerHTML = '<p class="text-danger">Fehler beim Laden der Einnahmen.</p>';
    }
}

// --- Activities Page ---
async function loadActivities() {
    const container = document.getElementById('activities');

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    try {
        const data = await fetchData('/fitbit/today'); // nutzt fetchFitbitDay() Utility
        if (!data.activities) {
            container.innerHTML = '<p class="text-danger">Fehler beim Laden der Aktivitäten.</p>';
            return;
        }

        const summary = data.activities.summary || {};
        const activeMinutes = (summary.fairlyActiveMinutes || 0) + (summary.veryActiveMinutes || 0);

        setText('steps', (summary.steps || 0).toLocaleString());
        setText('calories', (summary.caloriesOut || 0).toLocaleString());
        setText('active-minutes', activeMinutes);
        setText('distance', `${(summary.distances?.[0]?.distance || 0).toFixed(2)}`);
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
                    <p class="card-text"><strong>Mitglied Seit:</strong> ${data.user.memberSince}</p></p>
                    <p class="card-text"><strong>Synchronisiert am:</strong> ${formatDate(data.lastSync)}</p>
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

// Dynamically load navigation and footer
document.addEventListener('DOMContentLoaded', () => {
    loadPartial('/partials/navigation.html', 'navigation-container');
    loadPartial('/partials/footer.html', 'footer-container');
});

/**
 * Loads an external HTML partial into a container element.
 * Always returns a resolved Promise<string>.
 */
async function loadPartial(filePath, containerId) {
    try {
        const res = await fetch(filePath);

        if (!res.ok) {
            console.error(`Error loading partial: ${filePath}`);
            return ''; // Always return a string
        }

        const html = await res.text();

        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = html;
        } else {
            console.warn(`Container #${containerId} not found`);
        }

        return html; // Always return a string
    } catch (err) {
        console.error(`Error injecting partial (${filePath}):`, err);
        return ''; // Always return a string
    }
}

function formatDate(dateString, timeZone = "Europe/Berlin") {
    const d = new Date(dateString);
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
    return fmt.format(d);
}

// --- Global verfügbar machen ---
window.checkAuth = checkAuth;
window.fetchData = fetchData;
window.loadDashboard = loadDashboard;
window.loadActivities = loadActivities;
window.showErrorMessage = showErrorMessage;
