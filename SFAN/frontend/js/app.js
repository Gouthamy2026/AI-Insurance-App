document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        if (localStorage.getItem('rememberedEmail')) {
            document.getElementById('email').value = localStorage.getItem('rememberedEmail');
            document.getElementById('rememberMe').checked = true;
        }

        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');
        
        if (togglePassword) {
            togglePassword.addEventListener('click', function () {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.textContent = type === 'password' ? '👁️' : '🙈';
            });
        }
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = passwordInput.value;
            const errorMsg = document.getElementById('errorMsg');
            const rememberMe = document.getElementById('rememberMe').checked;
            
            try {
                const data = await ApiClient.login(email, password);
                localStorage.setItem('token', data.access_token);
                const payload = JSON.parse(atob(data.access_token.split('.')[1]));
                localStorage.setItem('user', JSON.stringify({ email: payload.email, role: payload.role }));
                
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                window.location.href = 'welcome.html';
            } catch (error) {
                errorMsg.textContent = error.message;
            }
        });
        
        return;
    }
    
    if (!localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const currentPath = window.location.pathname.split('/').pop() || '';
    const isWelcome = currentPath === 'welcome.html';
    const isRole = currentPath === 'role.html';
    const isReady = currentPath === 'ready.html';
    
    if (!user.fullName && !isWelcome) {
        window.location.href = 'welcome.html';
        return;
    }
    
    if (user.fullName && (!user.role || user.role === 'Analyst') && !isRole && !isWelcome) { 
        window.location.href = 'role.html';
        return;
    }
    
    const displayName = user.fullName ? user.fullName : user.email;
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    const initialEl = document.getElementById('user-initial');
    
    if (nameEl) nameEl.textContent = displayName;
    if (roleEl) roleEl.textContent = user.role || 'User';
    if (initialEl) initialEl.textContent = displayName.charAt(0).toUpperCase();
});
