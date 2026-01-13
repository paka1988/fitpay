// src/public/js/app.js (Browser-Version) 🚀

// --- Auth prüfen ---
async function checkAuth() {
    try {
        const res = await fetch('/auth/status');
        const data = await res.json();

        if (!data.authenticated) {
            console.warn('Nicht eingeloggt – Redirect zu Login');
            globalThis.location.href = '/index.html';
        }
    } catch {
        globalThis.location.href = '/index.html';
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

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText('active-minutes', activeMinutes);
    setText('steps', (summary.steps || 0).toLocaleString());
    setText('earnings', `€${earnings.toFixed(2)}`);
    setText('earnings_total', `€${Number(data.reward_total?.totalEarnings ?? 0).toFixed(2)}`);
}

async function loadProfile() {
    try {
        const data = await fetchData('/fitbit/profile');
        if (!data) return;

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        setText('card-title', data.user.displayName);
        setText('member-since', data.user.memberSince);
        setText('last-sync', formatDate(data.lastSync));
        setText('user-age', data.user.age);
        setText('fully-synchronized', data.fullySynchronized);

        const el = document.getElementById('user-avatar');
        let avatarImg = `<img src="${data.user.avatar}" class="img-fluid rounded mt-3" alt="Avatar">`;
        el.innerHTML = `${data.user.avatar ? avatarImg : ''}`;
    } catch (err) {
        console.error('Error loading profile:', err);
        showErrorMessage('Fehler beim Laden des Profils.');
    }
}

async function loadSyncCard() {
    const res = await fetch("/cronRoutes/status", {credentials: "include"});

    const data = await res.json();

    // Fill UI
    document.getElementById("sync-status").innerText = data.status;
    document.getElementById("sync-status").className = "badge " + (data.status === 'success' ? "bg-success" : "bg-secondary");
    document.getElementById("sync-progress-date").innerText = data.lastSync || "-";
    document.getElementById("sync-missing-count").innerText = data.missingDates?.length ?? "-";

    // Disable start button while running
    document.querySelector("button.btn-success").disabled = data.status === 'running' || data.status === 'idle';

    // Disable stop button if not ( running or idling )
    document.querySelector("button.btn-danger").disabled = !(['running', 'idle'].includes(data.status));
}

async function startSync() {
    const startDate = document.getElementById("sync-start-date").value;

    await fetch("/cronRoutes/start", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({startDate})
    });

    setTimeout(loadSyncCard, 300);
}

async function stopSync() {
    await fetch("/cronRoutes/stop", {
        method: "POST",
        credentials: "include"
    });

    setTimeout(loadSyncCard, 300);
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
globalThis.checkAuth = checkAuth;
globalThis.fetchData = fetchData;
globalThis.loadDashboard = loadDashboard;
globalThis.loadActivities = loadActivities;
globalThis.showErrorMessage = showErrorMessage;
