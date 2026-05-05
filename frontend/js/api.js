const API_BASE_URL = 'http://localhost:8081/api';

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

async function fetchAPI(endpoint, options = {}) {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            logout();
            return;
        }

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || typeof data === 'string' ? data : 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function setupNavigation() {
    const user = getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-role').textContent = `(${user.role})`;

    // Hide links based on role
    if (user.role !== 'ROLE_ADMIN') {
        const usersLink = document.getElementById('nav-users');
        if (usersLink) usersLink.style.display = 'none';
    }

    document.getElementById('logout-btn').addEventListener('click', logout);
}

function showMessage(id, message, isError = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className = isError ? 'error' : 'success';
    el.style.display = 'block';
    setTimeout(() => {
        el.style.display = 'none';
    }, 5000);
}
