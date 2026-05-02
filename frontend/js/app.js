let currentLang = null;
let allLanguages = [];
let currentTab = 'vocabulary';

async function initApp() {
  if (!auth.isLoggedIn()) {
    window.location.href = '/';
    return;
  }

  await ensureNativeLanguage();
  document.getElementById('username-display').textContent = auth.getUsername();

  try {
    allLanguages = await api.get('/api/languages/');
    if (allLanguages.length === 0) {
      document.querySelector('main').innerHTML = '<div class="empty">No languages seeded</div>';
      return;
    }

    const savedId = parseInt(localStorage.getItem('selected_lang_id'));
    const lang = allLanguages.find(l => l.id === savedId) || allLanguages[0];
    currentLang = lang;
    localStorage.setItem('selected_lang_id', lang.id);

    renderLangNav();
    updateLangDisplay();
    initUILang();
    initAutoplay();
    await loadFavoriteIds();
    switchTab('vocabulary');
  } catch (e) {
    console.error('Init failed:', e);
    document.querySelector('main').innerHTML = `<div class="empty">Error: ${e.message}</div>`;
  }
}

function renderLangNav() {
  const inner = document.getElementById('lang-nav-inner');
  inner.innerHTML = allLanguages.map(lang => {
    const name = getUILang() === 'zh' ? lang.name_zh : lang.name_en;
    const active = lang.id === currentLang.id ? 'active' : '';
    return `<button class="lang-nav-btn ${active}" data-lang-id="${lang.id}" onclick="selectLanguage(${lang.id})">
      ${lang.flag} ${escapeHtml(name)}
    </button>`;
  }).join('');
}

function updateLangDisplay() {
  const el = document.getElementById('lang-display');
  if (!el || !currentLang) return;
  const name = getUILang() === 'zh' ? currentLang.name_zh : currentLang.name_en;
  el.innerHTML = `${currentLang.flag} <strong>${escapeHtml(name)}</strong> <span style="color:var(--text-muted);font-size:0.85rem">${escapeHtml(currentLang.romanization_system || '')}</span>`;
}

async function selectLanguage(langId) {
  const lang = allLanguages.find(l => l.id === langId);
  if (!lang) return;
  currentLang = lang;
  localStorage.setItem('selected_lang_id', langId);
  renderLangNav();
  updateLangDisplay();
  await loadTabContent(currentTab);
}

function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-panel').forEach(p => p.hidden = true);
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const panel = document.getElementById(`tab-${tabName}`);
  const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  if (panel) panel.hidden = false;
  if (btn) btn.classList.add('active');

  loadTabContent(tabName);
}

async function loadTabContent(tabName) {
  if (!currentLang) return;
  switch (tabName) {
    case 'vocabulary': await loadVocabulary(currentLang.id); break;
    case 'flashcard': await loadFlashcards(currentLang.id); break;
    case 'memory': await loadMemoryMode(currentLang.id); break;
    case 'quiz': await loadQuiz(currentLang.id); break;
    case 'pronunciation': await loadPronunciation(currentLang); break;
    case 'skills': await loadSkills(currentLang.id); break;
    case 'culture': await loadCulture(currentLang.id); break;
    case 'favorites': await loadFavoritesPanel(); break;
    case 'progress': await loadProgress(); break;
  }
  // Stop autoplay when leaving vocab tab
  if (tabName !== 'vocabulary' && typeof stopAutoplay === 'function' && autoplayState.enabled) {
    stopAutoplay();
  }
}

// Hook into UI language change
function onUILangChange() {
  if (currentLang) {
    renderLangNav();
    updateLangDisplay();
    loadTabContent(currentTab);
  }
}

initApp();
