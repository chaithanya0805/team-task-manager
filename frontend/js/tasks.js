document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    
    const user = getUser();
    if (user && user.role === 'ROLE_ADMIN') {
        document.getElementById('admin-task-controls').style.display = 'block';
        setupAdminControls();
    }

    loadTasks();
});

async function loadTasks() {
    const user = getUser();
    const isAdmin = user && user.role === 'ROLE_ADMIN';
    
    try {
        const tasks = await fetchAPI('/tasks');
        const tbody = document.getElementById('tasks-table-body');
        
        tbody.innerHTML = '';
        
        if (tasks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center;">No tasks found.</td></tr>`;
            return;
        }

        tasks.forEach(task => {
            const canUpdate = isAdmin || (task.assignedTo && task.assignedTo.id === user.id);
            const statusSelect = canUpdate ? `
                <select onchange="updateTaskStatus(${task.id}, this.value)">
                    <option value="TO_DO" ${task.status === 'TO_DO' ? 'selected' : ''}>To Do</option>
                    <option value="IN_PROGRESS" ${task.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                    <option value="DONE" ${task.status === 'DONE' ? 'selected' : ''}>Done</option>
                </select>
            ` : task.status;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${task.id}</td>
                <td>${task.title}</td>
                <td>${task.description || '-'}</td>
                <td>${task.project ? task.project.name : '-'}</td>
                <td>${task.assignedTo ? task.assignedTo.name : 'Unassigned'}</td>
                <td>${task.dueDate || '-'}</td>
                <td>${task.priority}</td>
                <td>${task.status}</td>
                <td>${statusSelect}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Failed to load tasks:', error);
    }
}

async function setupAdminControls() {
    // Populate Dropdowns
    try {
        const [projects, users] = await Promise.all([
            fetchAPI('/projects'),
            fetchAPI('/users')
        ]);

        const projectSelect = document.getElementById('task-project');
        projectSelect.innerHTML = '<option value="">Select Project</option>';
        projects.forEach(p => {
            projectSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        });

        const userSelect = document.getElementById('task-user');
        userSelect.innerHTML = '<option value="">Assign To</option>';
        users.forEach(u => {
            userSelect.innerHTML += `<option value="${u.id}">${u.name} (${u.email})</option>`;
        });
    } catch (error) {
        console.error('Failed to populate dropdowns', error);
    }

    // Create Task
    document.getElementById('create-task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-desc').value,
            dueDate: document.getElementById('due-date').value || null,
            priority: document.getElementById('task-priority').value,
            project: { id: parseInt(document.getElementById('task-project').value) },
            assignedTo: { id: parseInt(document.getElementById('task-user').value) }
        };

        try {
            await fetchAPI('/tasks', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showMessage('task-msg', 'Task assigned successfully!');
            document.getElementById('create-task-form').reset();
            loadTasks();
        } catch (error) {
            showMessage('task-msg', error.message || 'Error creating task', true);
        }
    });
}

async function updateTaskStatus(taskId, status) {
    try {
        await fetchAPI(`/tasks/${taskId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        loadTasks();
    } catch (error) {
        alert('Failed to update status: ' + error.message);
        loadTasks(); // reload to revert select box
    }
}
