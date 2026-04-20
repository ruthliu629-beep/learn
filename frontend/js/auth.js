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

  if (!username || !password) {
    errorEl.textContent = getUILang() === 'zh' ? '请填写用户名和密码' : 'Please enter both fields';
    return;
  }

  try {
    const data = await api.post('/api/auth/login', { username, password });
    if (!data || !data.access_token) {
      errorEl.textContent = getUILang() === 'zh' ? '服务器返回异常' : 'Unexpected server response';
      return;
    }
    auth.login(data.access_token, data.username);
    if (typeof window.onAuthSuccess === 'function') window.onAuthSuccess();
    else window.location.href = '/app';
  } catch (e) {
    const msg = (e && e.message) || '';
    const zh = getUILang() === 'zh';
    if (msg.toLowerCase().includes('incorrect')) {
      errorEl.textContent = zh ? '用户名或密码错误' : 'Incorrect username or password';
    } else if (msg.toLowerCase().includes('failed to fetch') || msg === 'Request failed') {
      errorEl.textContent = zh ? '无法连接服务器，请检查后端是否运行' : 'Cannot reach server — is the backend running?';
    } else {
      errorEl.textContent = (zh ? '登录失败: ' : 'Login failed: ') + msg;
    }
    console.error('[login] error:', e);
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
  const forms = {
    login:    document.getElementById('login-form'),
    register: document.getElementById('register-form'),
    forgot:   document.getElementById('forgot-form'),
    reset:    document.getElementById('reset-form'),
  };
  for (const [name, el] of Object.entries(forms)) {
    if (el) el.hidden = (name !== tab);
  }
  const tabLogin = document.getElementById('tab-login');
  const tabReg = document.getElementById('tab-register');
  const tabFor = document.getElementById('tab-forgot');
  tabLogin.classList.toggle('active', tab === 'login');
  tabReg.classList.toggle('active', tab === 'register');
  if (tabFor) tabFor.classList.toggle('active', tab === 'forgot' || tab === 'reset');
}

async function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  const errorEl = document.getElementById('forgot-error');
  errorEl.textContent = '';
  const zh = getUILang() === 'zh';
  if (!email || !email.includes('@')) {
    errorEl.textContent = zh ? '请输入有效邮箱' : 'Please enter a valid email';
    return;
  }
  try {
    const data = await api.post('/api/auth/forgot-password', { email });
    // Store email for reset form
    window._resetEmail = email;
    document.getElementById('reset-email-display').textContent = email;
    document.getElementById('reset-code').value = '';
    document.getElementById('reset-password-new').value = '';
    switchAuthTab('reset');
    // If SMTP not configured, backend returns dev_code — show it so user can proceed
    if (data && data.dev_code) {
      const infoEl = document.getElementById('reset-info');
      infoEl.innerHTML = zh
        ? `服务器未配置 SMTP，验证码是 <strong style="color:var(--primary);font-size:1.2rem">${data.dev_code}</strong>（控制台也有）`
        : `SMTP not configured — code is <strong style="color:var(--primary);font-size:1.2rem">${data.dev_code}</strong> (also in server console)`;
    }
  } catch (e) {
    errorEl.textContent = (zh ? '发送失败: ' : 'Failed: ') + (e.message || '');
  }
}

async function handleResetPassword(event) {
  event.preventDefault();
  const email = window._resetEmail || document.getElementById('forgot-email').value.trim().toLowerCase();
  const code = document.getElementById('reset-code').value.trim();
  const newPassword = document.getElementById('reset-password-new').value;
  const errorEl = document.getElementById('reset-error');
  const zh = getUILang() === 'zh';
  errorEl.textContent = '';
  if (!/^\d{6}$/.test(code)) {
    errorEl.textContent = zh ? '验证码必须是 6 位数字' : 'Code must be 6 digits';
    return;
  }
  if (newPassword.length < 6) {
    errorEl.textContent = zh ? '新密码至少 6 位' : 'Password must be at least 6 characters';
    return;
  }
  try {
    await api.post('/api/auth/reset-password', { email, code, new_password: newPassword });
    alert(zh ? '密码重置成功！请用新密码登录。' : 'Password reset! Please log in with the new password.');
    // Pre-fill login form
    const emailLocalPart = email.split('@')[0];
    const loginUsernameEl = document.getElementById('login-username');
    if (loginUsernameEl && !loginUsernameEl.value) loginUsernameEl.value = emailLocalPart;
    switchAuthTab('login');
  } catch (e) {
    errorEl.textContent = e.message || (zh ? '重置失败' : 'Reset failed');
  }
}
