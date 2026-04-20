const auth = {
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  login(token, username) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('selected_lang_id');
    window.location.href = '/';
  },

  getUsername() {
    return localStorage.getItem('username');
  },
};

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';
  try {
    const data = await api.post('/api/auth/login', { username, password });
    auth.login(data.access_token, data.username);
    if (typeof window.onAuthSuccess === 'function') window.onAuthSuccess();
    else window.location.href = '/app';
  } catch (e) {
    errorEl.textContent = getUILang() === 'zh'
      ? '用户名或密码错误'
      : 'Incorrect username or password';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const errorEl = document.getElementById('reg-error');
  errorEl.textContent = '';
  try {
    const data = await api.post('/api/auth/register', { username, email, password });
    auth.login(data.access_token, data.username);
    if (typeof window.onAuthSuccess === 'function') window.onAuthSuccess();
    else window.location.href = '/app';
  } catch (e) {
    errorEl.textContent = (getUILang() === 'zh' ? '注册失败: ' : 'Registration failed: ') + e.message;
  }
}

function showAuthModal(tab = 'login') {
  document.getElementById('auth-modal').hidden = false;
  switchAuthTab(tab);
}

function hideAuthModal() {
  document.getElementById('auth-modal').hidden = true;
}

function switchAuthTab(tab) {
  document.getElementById('login-form').hidden = tab !== 'login';
  document.getElementById('register-form').hidden = tab !== 'register';
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}
