document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    
    const user = getUser();
    if (user && user.role === 'ROLE_ADMIN') {
        document.getElementById('admin-project-controls').style.display = 'block';
        document.getElementById('th-actions').style.display = 'table-cell';
        setupAdminControls();
    }

    loadProjects();
});

async function loadProjects() {
    const user = getUser();
    const isAdmin = user && user.role === 'ROLE_ADMIN';
    
    try {
        const projects = await fetchAPI('/projects');
        const tbody = document.getElementById('projects-table-body');
        
        tbody.innerHTML = '';
        
        if (projects.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${isAdmin ? 7 : 6}" style="text-align: center;">No projects found.</td></tr>`;
            return;
        }

        projects.forEach(project => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${project.id}</td>
                <td>${project.name}</td>
                <td>${project.description || '-'}</td>
                <td>${project.startDate || '-'}</td>
                <td>${project.endDate || '-'}</td>
                <td>${project.status}</td>
                ${isAdmin ? `<td><button onclick="deleteProject(${project.id})" class="btn-small">Delete</button></td>` : ''}
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

async function setupAdminControls() {
    // Create Project
    document.getElementById('create-project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('project-name').value,
            description: document.getElementById('project-desc').value,
            startDate: document.getElementById('start-date').value || null,
            endDate: document.getElementById('end-date').value || null
        };

        try {
            await fetchAPI('/projects', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showMessage('project-msg', 'Project created successfully!');
            document.getElementById('create-project-form').reset();
            loadProjects();
            populateDropdowns();
        } catch (error) {
            showMessage('project-msg', error.message || 'Error creating project', true);
        }
    });

    // Populate Add Member Dropdowns
    populateDropdowns();

    // Add Member
    document.getElementById('add-member-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const projectId = document.getElementById('select-project').value;
        const userId = document.getElementById('select-user').value;

        try {
            await fetchAPI(`/projects/${projectId}/members/${userId}`, { method: 'POST' });
            showMessage('member-msg', 'Member added successfully!');
        } catch (error) {
            showMessage('member-msg', error.message || 'Error adding member', true);
        }
    });
}

async function populateDropdowns() {
    try {
        const [projects, users] = await Promise.all([
            fetchAPI('/projects'),
            fetchAPI('/users')
        ]);

        const projectSelect = document.getElementById('select-project');
        projectSelect.innerHTML = '<option value="">Select Project</option>';
        projects.forEach(p => {
            projectSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        });

        const userSelect = document.getElementById('select-user');
        userSelect.innerHTML = '<option value="">Select User</option>';
        users.forEach(u => {
            userSelect.innerHTML += `<option value="${u.id}">${u.name} (${u.email})</option>`;
        });
    } catch (error) {
        console.error('Failed to populate dropdowns', error);
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
        await fetchAPI(`/projects/${id}`, { method: 'DELETE' });
        loadProjects();
        populateDropdowns();
    } catch (error) {
        alert('Failed to delete project: ' + error.message);
    }
}
