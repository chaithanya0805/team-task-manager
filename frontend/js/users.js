document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    
    const user = getUser();
    if (!user || user.role !== 'ROLE_ADMIN') {
        window.location.href = 'dashboard.html';
        return;
    }

    loadUsers();
});

async function loadUsers() {
    try {
        const users = await fetchAPI('/users');
        const tbody = document.getElementById('users-table-body');
        
        tbody.innerHTML = '';
        
        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No users found.</td></tr>`;
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Failed to load users:', error);
        document.getElementById('users-table-body').innerHTML = `<tr><td colspan="5" class="error">Error loading users.</td></tr>`;
    }
}
