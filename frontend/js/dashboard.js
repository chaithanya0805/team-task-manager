document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const stats = await fetchAPI('/dashboard/stats');
        const container = document.getElementById('stats-container');
        
        container.innerHTML = `
            <div class="card">
                <h3>Total Projects</h3>
                <p>${stats.totalProjects}</p>
            </div>
            <div class="card">
                <h3>Total Tasks</h3>
                <p>${stats.totalTasks}</p>
            </div>
            <div class="card">
                <h3>To Do</h3>
                <p>${stats.tasksTodo}</p>
            </div>
            <div class="card">
                <h3>In Progress</h3>
                <p>${stats.tasksInProgress}</p>
            </div>
            <div class="card">
                <h3>Done</h3>
                <p>${stats.tasksDone}</p>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        document.getElementById('stats-container').innerHTML = '<p class="error">Failed to load statistics.</p>';
    }
}
