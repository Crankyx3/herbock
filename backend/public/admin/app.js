// API Base URL
const API_URL = window.location.origin;

// Current token (for future auth implementation)
let authToken = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    loadProjectsForDropdown();
});

// Show/Hide sections
function showSection(section) {
    document.querySelectorAll('.section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    document.getElementById(`${section}-section`).style.display = 'block';
    event.target.classList.add('active');

    // Load data for section
    if (section === 'dashboard') loadDashboard();
    else if (section === 'projects') loadProjects();
    else if (section === 'rooms') loadRooms();
    else if (section === 'defects') loadDefects();
    else if (section === 'users') loadUsers();
}

// ==================== Dashboard ====================
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();

        // Load stats
        await loadStats();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Fehler beim Laden des Dashboards', 'danger');
    }
}

async function loadStats() {
    try {
        // Since we don't have auth endpoints yet, we'll query the database directly
        // For now, show placeholder data
        document.getElementById('stat-projects').textContent = '-';
        document.getElementById('stat-rooms').textContent = '-';
        document.getElementById('stat-defects').textContent = '-';
        document.getElementById('stat-users').textContent = '-';

        // TODO: Add proper API calls when auth is implemented
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ==================== Projects ====================
async function loadProjects() {
    try {
        // For now, we'll use direct database queries
        // TODO: Implement auth and proper API calls

        const html = `
            <div class="card">
                <div class="card-body">
                    <p class="text-muted">Projekte werden geladen...</p>
                    <p><small>Hinweis: API-Authentifizierung wird noch implementiert</small></p>
                </div>
            </div>
        `;

        document.getElementById('projects-list').innerHTML = html;
    } catch (error) {
        console.error('Error loading projects:', error);
        showAlert('Fehler beim Laden der Projekte', 'danger');
    }
}

async function loadProjectsForDropdown() {
    try {
        const select = document.getElementById('room-projectId');
        const filter = document.getElementById('room-project-filter');

        // Placeholder
        select.innerHTML = '<option value="">Projekt wählen...</option>';
        if (filter) {
            filter.innerHTML = '<option value="">Alle Projekte</option>';
        }

        // TODO: Load real projects
    } catch (error) {
        console.error('Error loading projects dropdown:', error);
    }
}

function showProjectModal() {
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));
    document.getElementById('projectForm').reset();
    modal.show();
}

async function saveProject() {
    const name = document.getElementById('project-name').value;
    const description = document.getElementById('project-description').value;
    const startDate = document.getElementById('project-startDate').value;
    const endDate = document.getElementById('project-endDate').value;

    if (!name || !startDate) {
        showAlert('Bitte füllen Sie alle Pflichtfelder aus', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                description,
                startDate,
                endDate: endDate || null,
            }),
        });

        if (!response.ok) {
            throw new Error('Fehler beim Speichern');
        }

        showAlert('Projekt erfolgreich erstellt!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
        loadProjects();
        loadProjectsForDropdown();
    } catch (error) {
        console.error('Error saving project:', error);
        showAlert('Fehler beim Speichern des Projekts', 'danger');
    }
}

// ==================== Rooms ====================
async function loadRooms() {
    try {
        const html = `
            <div class="card">
                <div class="card-body">
                    <p class="text-muted">Räume werden geladen...</p>
                </div>
            </div>
        `;

        document.getElementById('rooms-list').innerHTML = html;
    } catch (error) {
        console.error('Error loading rooms:', error);
        showAlert('Fehler beim Laden der Räume', 'danger');
    }
}

function showRoomModal() {
    const modal = new bootstrap.Modal(document.getElementById('roomModal'));
    document.getElementById('roomForm').reset();
    modal.show();
}

async function saveRoom() {
    const projectId = document.getElementById('room-projectId').value;
    const name = document.getElementById('room-name').value;
    const floor = document.getElementById('room-floor').value;
    const area = document.getElementById('room-area').value;
    const description = document.getElementById('room-description').value;

    if (!projectId || !name) {
        showAlert('Bitte füllen Sie alle Pflichtfelder aus', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                projectId,
                name,
                floor,
                area: area ? parseFloat(area) : null,
                description,
            }),
        });

        if (!response.ok) {
            throw new Error('Fehler beim Speichern');
        }

        showAlert('Raum erfolgreich erstellt!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('roomModal')).hide();
        loadRooms();
    } catch (error) {
        console.error('Error saving room:', error);
        showAlert('Fehler beim Speichern des Raums', 'danger');
    }
}

// ==================== Defects ====================
async function loadDefects() {
    try {
        const html = `
            <div class="card">
                <div class="card-body">
                    <p class="text-muted">Mängel werden geladen...</p>
                </div>
            </div>
        `;

        document.getElementById('defects-list').innerHTML = html;
    } catch (error) {
        console.error('Error loading defects:', error);
        showAlert('Fehler beim Laden der Mängel', 'danger');
    }
}

// ==================== Users ====================
async function loadUsers() {
    try {
        const html = `
            <div class="card">
                <div class="card-body">
                    <p class="text-muted">Benutzer werden geladen...</p>
                </div>
            </div>
        `;

        document.getElementById('users-list').innerHTML = html;
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Fehler beim Laden der Benutzer', 'danger');
    }
}

// ==================== Utilities ====================
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
}
