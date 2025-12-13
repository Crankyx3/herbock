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
let currentView = 'list'; // 'list', 'detail', or 'room-detail'
let currentProjectId = null;
let currentRoomId = null;

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
                            <button class="btn btn-sm btn-primary" onclick="viewProjectDetail('${project.id}')">
                                <i class="bi bi-box-arrow-in-right"></i> Öffnen
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

async function viewProjectDetail(projectId) {
    try {
        currentView = 'detail';
        currentProjectId = projectId;

        const response = await fetch(`${API_URL}/api/projects/${projectId}`);
        const project = await response.json();

        const roomsResponse = await fetch(`${API_URL}/api/projects/${projectId}/rooms`);
        const rooms = await roomsResponse.json();

        const html = `
            <div class="mb-3">
                <button class="btn btn-outline-secondary" onclick="backToProjectsList()">
                    <i class="bi bi-arrow-left"></i> Zurück zu Projekten
                </button>
            </div>

            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h4 class="card-title">
                                <i class="bi bi-folder-fill"></i> ${project.name}
                            </h4>
                            <p class="card-text">${project.description || 'Keine Beschreibung'}</p>
                            <div class="mb-2">
                                <span class="badge bg-primary">${project.status}</span>
                                <span class="badge bg-info text-dark">
                                    <i class="bi bi-door-open"></i> ${rooms.length} Räume
                                </span>
                            </div>
                            <small class="text-muted">
                                Start: ${formatDate(project.startDate)}
                                ${project.endDate ? ' | Ende: ' + formatDate(project.endDate) : ''}
                            </small>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-success" onclick="addRoomToProject('${project.id}')">
                                <i class="bi bi-plus-circle"></i> Neuer Raum
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="bi bi-door-open"></i> Räume (${rooms.length})</h5>
                </div>
                <div class="card-body">
                    ${rooms.length > 0 ? `
                        <div class="row">
                            ${rooms.map(room => `
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100 border-primary" style="cursor: pointer;" onclick="viewRoomDetail('${project.id}', '${room.id}')">
                                        <div class="card-body">
                                            <div class="d-flex justify-content-between align-items-start mb-2">
                                                <h6 class="card-title mb-0">
                                                    <i class="bi bi-door-closed"></i> ${room.name}
                                                </h6>
                                                <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteRoomFromProject('${room.id}')">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                            ${room.floor ? `
                                                <p class="card-text mb-1">
                                                    <small class="text-muted">
                                                        <i class="bi bi-building"></i> ${room.floor}
                                                    </small>
                                                </p>
                                            ` : ''}
                                            ${room.area ? `
                                                <p class="card-text mb-1">
                                                    <small class="text-muted">
                                                        <i class="bi bi-rulers"></i> ${room.area} m²
                                                    </small>
                                                </p>
                                            ` : ''}
                                            ${room.description ? `
                                                <p class="card-text mb-2">
                                                    <small>${room.description}</small>
                                                </p>
                                            ` : ''}
                                            <div class="mt-2">
                                                <span class="badge bg-warning text-dark">
                                                    <i class="bi bi-exclamation-triangle"></i> ${room.defect_count || 0} Mängel
                                                </span>
                                                ${room.floorPlanUrl ? `
                                                    <span class="badge bg-success">
                                                        <i class="bi bi-file-pdf"></i> Grundriss vorhanden
                                                    </span>
                                                ` : ''}
                                            </div>
                                            <div class="text-end mt-2">
                                                <small class="text-primary">Klicken für Details →</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="text-center text-muted py-5">
                            <i class="bi bi-door-open" style="font-size: 48px;"></i>
                            <p class="mt-3">Noch keine Räume vorhanden</p>
                            <button class="btn btn-primary" onclick="addRoomToProject('${project.id}')">
                                <i class="bi bi-plus-circle"></i> Ersten Raum erstellen
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;

        document.getElementById('projects-list').innerHTML = html;
    } catch (error) {
        console.error('Error loading project detail:', error);
        showAlert('Fehler beim Laden der Projektdetails', 'danger');
    }
}

function backToProjectsList() {
    currentView = 'list';
    currentProjectId = null;
    currentRoomId = null;
    loadProjects();
}

async function addRoomToProject(projectId) {
    const modal = new bootstrap.Modal(document.getElementById('roomModal'));
    document.getElementById('roomForm').reset();
    document.getElementById('room-projectId').value = projectId;
    modal.show();
}

async function deleteRoomFromProject(roomId) {
    await deleteRoom(roomId);
    if (currentProjectId) {
        viewProjectDetail(currentProjectId);
    }
}

async function viewRoomDetail(projectId, roomId) {
    // Navigate to dedicated room view page with floor plan and markers
    window.location.href = `/admin/room-view.html?projectId=${projectId}&roomId=${roomId}`;
    return;

    // OLD CODE - keeping for reference but not used
    try {
        currentView = 'room-detail';
        currentProjectId = projectId;
        currentRoomId = roomId;

        // Fetch room details
        const roomResponse = await fetch(`${API_URL}/api/rooms/${roomId}`);
        const room = await roomResponse.json();

        // Fetch defects for this room
        const defectsResponse = await fetch(`${API_URL}/api/projects/${projectId}/defects`);
        const allDefects = await defectsResponse.json();
        const roomDefects = allDefects.filter(d => d.roomId === roomId);

        const html = `
            <div class="mb-3">
                <button class="btn btn-outline-secondary" onclick="viewProjectDetail('${projectId}')">
                    <i class="bi bi-arrow-left"></i> Zurück zum Projekt
                </button>
            </div>

            <div class="card mb-3">
                <div class="card-body">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item">
                                <a href="#" onclick="backToProjectsList(); return false;">Projekte</a>
                            </li>
                            <li class="breadcrumb-item">
                                <a href="#" onclick="viewProjectDetail('${projectId}'); return false;">${room.project?.name || 'Projekt'}</a>
                            </li>
                            <li class="breadcrumb-item active">${room.name}</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h4 class="card-title">
                                <i class="bi bi-door-closed-fill"></i> ${room.name}
                            </h4>
                            ${room.description ? `<p class="card-text">${room.description}</p>` : ''}
                            <div class="mb-2">
                                ${room.floor ? `
                                    <span class="badge bg-secondary">
                                        <i class="bi bi-building"></i> ${room.floor}
                                    </span>
                                ` : ''}
                                ${room.area ? `
                                    <span class="badge bg-light text-dark">
                                        <i class="bi bi-rulers"></i> ${room.area} m²
                                    </span>
                                ` : ''}
                                <span class="badge bg-warning text-dark">
                                    <i class="bi bi-exclamation-triangle"></i> ${roomDefects.length} Mängel
                                </span>
                            </div>
                            ${room.floorPlanUrl ? `
                                <div class="mt-3">
                                    <a href="${room.floorPlanUrl}" target="_blank" class="btn btn-sm btn-outline-primary">
                                        <i class="bi bi-file-pdf"></i> Grundriss ansehen
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-success" onclick="showCreateDefectModal('${projectId}', '${roomId}')">
                                <i class="bi bi-plus-circle"></i> Neuer Mangel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="bi bi-exclamation-triangle"></i> Mängel (${roomDefects.length})</h5>
                </div>
                <div class="card-body">
                    ${roomDefects.length > 0 ? `
                        <div class="row">
                            ${roomDefects.map(defect => `
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100 ${getDefectCardClass(defect.status)}">
                                        <div class="card-body">
                                            <div class="d-flex justify-content-between align-items-start mb-2">
                                                <h6 class="card-title mb-0">
                                                    <i class="bi bi-exclamation-circle"></i> ${defect.title || 'Mangel'}
                                                </h6>
                                                <button class="btn btn-sm btn-outline-danger" onclick="deleteDefect('${defect.id}')">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                            ${defect.description ? `
                                                <p class="card-text mb-2">
                                                    <small>${defect.description}</small>
                                                </p>
                                            ` : ''}
                                            <div class="mb-2">
                                                <span class="badge ${getStatusBadgeClass(defect.status)}">
                                                    ${getStatusText(defect.status)}
                                                </span>
                                                <span class="badge ${getPriorityBadgeClass(defect.priority)}">
                                                    ${getPriorityText(defect.priority)}
                                                </span>
                                            </div>
                                            ${defect.images && defect.images.length > 0 ? `
                                                <div class="mb-2">
                                                    <small class="text-muted">
                                                        <i class="bi bi-images"></i> ${defect.images.length} Bild(er)
                                                    </small>
                                                </div>
                                            ` : ''}
                                            <small class="text-muted">
                                                Erstellt: ${formatDate(defect.createdAt)}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="text-center text-muted py-5">
                            <i class="bi bi-exclamation-triangle" style="font-size: 48px;"></i>
                            <p class="mt-3">Noch keine Mängel vorhanden</p>
                            <button class="btn btn-primary" onclick="showCreateDefectModal('${projectId}', '${roomId}')">
                                <i class="bi bi-plus-circle"></i> Ersten Mangel erstellen
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;

        document.getElementById('projects-list').innerHTML = html;
    } catch (error) {
        console.error('Error loading room detail:', error);
        showAlert('Fehler beim Laden der Raumdetails', 'danger');
    }
}

// Helper functions for defect display
function getDefectCardClass(status) {
    switch(status) {
        case 'OPEN': return 'border-danger';
        case 'IN_PROGRESS': return 'border-warning';
        case 'RESOLVED': return 'border-success';
        default: return '';
    }
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'OPEN': return 'bg-danger';
        case 'IN_PROGRESS': return 'bg-warning text-dark';
        case 'RESOLVED': return 'bg-success';
        default: return 'bg-secondary';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'OPEN': return 'Offen';
        case 'IN_PROGRESS': return 'In Bearbeitung';
        case 'RESOLVED': return 'Erledigt';
        default: return status;
    }
}

function getPriorityBadgeClass(priority) {
    switch(priority) {
        case 'HIGH': return 'bg-danger';
        case 'MEDIUM': return 'bg-warning text-dark';
        case 'LOW': return 'bg-info text-dark';
        default: return 'bg-secondary';
    }
}

function getPriorityText(priority) {
    switch(priority) {
        case 'HIGH': return 'Hoch';
        case 'MEDIUM': return 'Mittel';
        case 'LOW': return 'Niedrig';
        default: return priority;
    }
}

function showCreateDefectModal(projectId, roomId) {
    showAlert('Mängel werden über die Mobile App erfasst', 'info');
}

async function deleteDefect(id) {
    if (!confirm('Möchten Sie diesen Mangel wirklich löschen?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/defects/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Fehler beim Löschen');
        }

        showAlert('Mangel gelöscht', 'success');

        // Refresh current view
        if (currentView === 'room-detail' && currentProjectId && currentRoomId) {
            viewRoomDetail(currentProjectId, currentRoomId);
        }
        loadStats();
    } catch (error) {
        console.error('Error deleting defect:', error);
        showAlert('Fehler beim Löschen des Mangels', 'danger');
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
    const floorPlanFile = document.getElementById('room-floorplan').files[0];

    if (!projectId || !name) {
        showAlert('Bitte füllen Sie alle Pflichtfelder aus', 'warning');
        return;
    }

    try {
        let floorPlanUrl = null;

        // Upload floor plan PDF if selected
        if (floorPlanFile) {
            const formData = new FormData();
            formData.append('floorplan', floorPlanFile);

            const uploadResponse = await fetch(`${API_URL}/api/upload/floorplan`, {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Fehler beim Hochladen des Grundrisses');
            }

            const uploadResult = await uploadResponse.json();
            floorPlanUrl = uploadResult.fileUrl;
            console.log('Floor plan uploaded:', floorPlanUrl);
        }

        // Create room with floor plan URL
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
                floorPlanUrl,
            }),
        });

        if (!response.ok) {
            throw new Error('Fehler beim Speichern');
        }

        showAlert('Raum erfolgreich erstellt!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('roomModal')).hide();

        // Refresh current view
        if (currentView === 'detail' && currentProjectId) {
            viewProjectDetail(currentProjectId);
        } else {
            loadProjects();
        }
        loadStats();
    } catch (error) {
        console.error('Error saving room:', error);
        showAlert('Fehler beim Speichern des Raums: ' + error.message, 'danger');
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
        loadProjects();
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

// ==================== Floor Plan Upload ====================
function removeFloorPlan() {
    const fileInput = document.getElementById('room-floorplan');
    const preview = document.getElementById('floor-plan-preview');
    fileInput.value = '';
    preview.style.display = 'none';
}

// Auto-show preview when file is selected
document.addEventListener('DOMContentLoaded', () => {
    const floorPlanInput = document.getElementById('room-floorplan');
    if (floorPlanInput) {
        floorPlanInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const preview = document.getElementById('floor-plan-preview');
            const filename = document.getElementById('floor-plan-filename');

            if (file) {
                filename.textContent = file.name;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        });
    }
});
