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
        // Load projects count
        const projectsResponse = await fetch(`${API_URL}/api/projects`);
        const projects = await projectsResponse.json();
        document.getElementById('stat-projects').textContent = projects.length;

        // Calculate rooms and defects
        let roomsCount = 0;
        let defectsCount = 0;
        projects.forEach(p => {
            roomsCount += parseInt(p.room_count || 0);
            defectsCount += parseInt(p.open_defects_count || 0);
        });

        document.getElementById('stat-rooms').textContent = roomsCount;
        document.getElementById('stat-defects').textContent = defectsCount;
        document.getElementById('stat-users').textContent = '2'; // Hardcoded for now
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ==================== Projects ====================
async function loadProjects() {
    try {
        const response = await fetch(`${API_URL}/api/projects`);
        const projects = await response.json();

        if (projects.length === 0) {
            document.getElementById('projects-list').innerHTML = `
                <div class="card">
                    <div class="card-body text-center text-muted">
                        <i class="bi bi-folder" style="font-size: 48px;"></i>
                        <p class="mt-3">Keine Projekte vorhanden</p>
                        <button class="btn btn-primary" onclick="showProjectModal()">
                            <i class="bi bi-plus-circle"></i> Erstes Projekt erstellen
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const html = projects.map(project => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h5 class="card-title">
                                <i class="bi bi-folder"></i> ${project.name}
                            </h5>
                            <p class="card-text text-muted">${project.description || 'Keine Beschreibung'}</p>
                            <div class="mb-2">
                                <span class="badge bg-primary">${project.status}</span>
                                <span class="badge bg-info text-dark">
                                    <i class="bi bi-door-open"></i> ${project.room_count || 0} Räume
                                </span>
                                <span class="badge bg-warning text-dark">
                                    <i class="bi bi-exclamation-triangle"></i> ${project.open_defects_count || 0} Mängel
                                </span>
                            </div>
                            <small class="text-muted">
                                Start: ${formatDate(project.startDate)}
                                ${project.endDate ? ' | Ende: ' + formatDate(project.endDate) : ''}
                            </small>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-sm btn-outline-primary" onclick="viewProject('${project.id}')">
                                <i class="bi bi-eye"></i> Ansehen
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteProject('${project.id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('projects-list').innerHTML = html;
    } catch (error) {
        console.error('Error loading projects:', error);
        showAlert('Fehler beim Laden der Projekte', 'danger');
    }
}

async function loadProjectsForDropdown() {
    try {
        const response = await fetch(`${API_URL}/api/projects`);
        const projects = await response.json();

        const select = document.getElementById('room-projectId');
        const filter = document.getElementById('room-project-filter');

        const options = projects.map(p =>
            `<option value="${p.id}">${p.name}</option>`
        ).join('');

        if (select) {
            select.innerHTML = '<option value="">Projekt wählen...</option>' + options;
        }

        if (filter) {
            filter.innerHTML = '<option value="">Alle Projekte</option>' + options;
        }
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
        loadStats();
    } catch (error) {
        console.error('Error saving project:', error);
        showAlert('Fehler beim Speichern des Projekts', 'danger');
    }
}

async function viewProject(id) {
    try {
        const response = await fetch(`${API_URL}/api/projects/${id}`);
        const project = await response.json();

        alert(`Projekt: ${project.name}\nRäume: ${project.rooms?.length || 0}\nMängel: ${project.defects?.length || 0}`);
    } catch (error) {
        console.error('Error viewing project:', error);
    }
}

async function deleteProject(id) {
    if (!confirm('Möchten Sie dieses Projekt wirklich löschen?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/projects/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Fehler beim Löschen');
        }

        showAlert('Projekt gelöscht', 'success');
        loadProjects();
        loadStats();
    } catch (error) {
        console.error('Error deleting project:', error);
        showAlert('Fehler beim Löschen des Projekts', 'danger');
    }
}

// ==================== Rooms ====================
async function loadRooms() {
    try {
        const filterProjectId = document.getElementById('room-project-filter')?.value;

        const response = await fetch(`${API_URL}/api/projects`);
        const projects = await response.json();

        let allRooms = [];
        for (const project of projects) {
            if (!filterProjectId || project.id === filterProjectId) {
                const roomsResponse = await fetch(`${API_URL}/api/projects/${project.id}/rooms`);
                const rooms = await roomsResponse.json();
                rooms.forEach(room => {
                    room.projectName = project.name;
                });
                allRooms = allRooms.concat(rooms);
            }
        }

        if (allRooms.length === 0) {
            document.getElementById('rooms-list').innerHTML = `
                <div class="card">
                    <div class="card-body text-center text-muted">
                        <i class="bi bi-door-open" style="font-size: 48px;"></i>
                        <p class="mt-3">Keine Räume vorhanden</p>
                        <button class="btn btn-primary" onclick="showRoomModal()">
                            <i class="bi bi-plus-circle"></i> Ersten Raum erstellen
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const html = allRooms.map(room => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h5 class="card-title">
                                <i class="bi bi-door-open"></i> ${room.name}
                            </h5>
                            <p class="card-text">
                                <span class="badge bg-secondary">${room.projectName}</span>
                                ${room.floor ? `<span class="badge bg-info text-dark">${room.floor}</span>` : ''}
                                ${room.area ? `<span class="badge bg-light text-dark">${room.area} m²</span>` : ''}
                            </p>
                            ${room.description ? `<p class="text-muted small">${room.description}</p>` : ''}
                            <small class="text-muted">
                                <i class="bi bi-exclamation-triangle"></i> ${room.defect_count || 0} Mängel
                            </small>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteRoom('${room.id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

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
        loadStats();
    } catch (error) {
        console.error('Error saving room:', error);
        showAlert('Fehler beim Speichern des Raums', 'danger');
    }
}

async function deleteRoom(id) {
    if (!confirm('Möchten Sie diesen Raum wirklich löschen?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/rooms/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Fehler beim Löschen');
        }

        showAlert('Raum gelöscht', 'success');
        loadRooms();
        loadStats();
    } catch (error) {
        console.error('Error deleting room:', error);
        showAlert('Fehler beim Löschen des Raums', 'danger');
    }
}

// ==================== Defects ====================
async function loadDefects() {
    try {
        const response = await fetch(`${API_URL}/api/projects`);
        const projects = await response.json();

        document.getElementById('defects-list').innerHTML = `
            <div class="card">
                <div class="card-body">
                    <p class="text-muted">Mängel-Ansicht kommt bald...</p>
                    <p><small>Mängel werden über die Mobile App erfasst</small></p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading defects:', error);
        showAlert('Fehler beim Laden der Mängel', 'danger');
    }
}

// ==================== Users ====================
async function loadUsers() {
    try {
        document.getElementById('users-list').innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h6>Test-Benutzer:</h6>
                    <ul>
                        <li><strong>admin@herbock.de</strong> (Password: admin123) - ADMIN</li>
                        <li><strong>test@herbock.de</strong> (Password: test123) - EMPLOYEE</li>
                    </ul>
                    <p class="text-muted"><small>Benutzer-Verwaltung kommt später</small></p>
                </div>
            </div>
        `;
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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
}
