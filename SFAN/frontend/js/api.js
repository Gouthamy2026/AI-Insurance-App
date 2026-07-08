const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
const isLanIp = window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.');
const API_URL = (isLocalhost || isLanIp) 
    ? (window.location.protocol === 'file:' ? 'http://127.0.0.1:8000' : `http://${window.location.hostname}:8000`)
    : 'https://api.myapp.com';
window.API_URL = API_URL;

class ApiClient {
    static getToken() {
        return localStorage.getItem('token');
    }

    static async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Only set Content-Type to application/json if we're not sending FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });
            
            if (response.status === 401) {
                // Unauthorized, clear token and redirect
                localStorage.removeItem('token');
                window.location.href = '/index.html';
                return null;
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async login(email, password) {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        
        return fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            body: formData
        }).then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Login failed');
            return data;
        });
    }
    

}

// Global theme application on load
(function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
})();
