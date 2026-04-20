/* Favorites — star words, view list, export CSV / Anki. */

const favState = {
  ids: new Set(),  // vocab ids the current user has favorited
  loaded: false,
};

async function loadFavoriteIds() {
  if (!auth.isLoggedIn()) return;
  try {
    const data = await api.get('/api/favorites/ids');
    favState.ids = new Set(data.ids || []);
    favState.loaded = true;
  } catch (e) {
    console.warn('Favorites load failed:', e.message);
  }
}

async function toggleFavorite(vocabId, btn) {
  if (!auth.isLoggedIn()) return;
  try {
    const res = await api.post('/api/favorites/toggle', { vocab_id: vocabId });
    if (res.favorited) {
      favState.ids.add(vocabId);
      btn.classList.add('favorited');
      btn.textContent = '⭐';
    } else {
      favState.ids.delete(vocabId);
      btn.classList.remove('favorited');
      btn.textContent = '☆';
    }
  } catch (e) {
    showToast(e.message, 'error');
  }
}

function isFavorited(vocabId) {
  return favState.ids.has(vocabId);
}

function favoriteButtonHTML(vocabId) {
  const fav = isFavorited(vocabId);
  const lang = getUILang();
  return `<button class="btn-fav ${fav ? 'favorited' : ''}"
                   title="${lang === 'zh' ? '加入生词本' : 'Add to word list'}"
                   onclick="toggleFavorite(${vocabId}, this)">${fav ? '⭐' : '☆'}</button>`;
}

// ============ FAVORITES PANEL ============
let favoritesPanelState = { items: [] };

async function loadFavoritesPanel() {
  const panel = document.getElementById('tab-favorites');
  const lang = getUILang();
  panel.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const langId = currentLang ? currentLang.id : null;
    const url = langId ? `/api/favorites/?lang_id=${langId}` : '/api/favorites/';
    const data = await api.get(url);
    favoritesPanelState.items = data.items;
    renderFavoritesPanel();
  } catch (e) {
    panel.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}

function renderFavoritesPanel() {
  const panel = document.getElementById('tab-favorites');
  const lang = getUILang();
  const items = favoritesPanelState.items;

  if (items.length === 0) {
    panel.innerHTML = `
      <div class="panel-header">
        <h2>${lang === 'zh' ? '我的生词本' : 'My Word List'}</h2>
      </div>
      <div class="empty">
        ${lang === 'zh'
          ? '还没有收藏词汇。在词汇页点 ☆ 加入。'
          : 'No favorites yet. Tap ☆ on vocab cards to add.'}
      </div>
    `;
    return;
  }

  const langId = currentLang ? currentLang.id : '';
  const langCode = currentLang ? currentLang.code : '';

  const cards = items.map(v => {
    const meaning = lang === 'zh' ? v.meaning_zh : v.meaning_en;
    const exTrans = lang === 'zh' ? v.example_zh : v.example_en;
    return `
      <div class="vocab-card">
        ${favoriteButtonHTML(v.id)}
        ${speakButtonsHTML(v.word, langCode, v.romanization || '', { size: 'sm' })}
        <div class="vocab-word">${escapeHtml(v.word)}</div>
        ${v.romanization ? `<div class="vocab-rom">${escapeHtml(v.romanization)}</div>` : ''}
        <div class="vocab-meaning">${escapeHtml(meaning || '')}</div>
        ${v.example_native ? `
          <div class="vocab-example">
            <div class="vocab-example-native">${escapeHtml(v.example_native)}</div>
            ${exTrans ? `<div class="vocab-example-trans">${escapeHtml(exTrans)}</div>` : ''}
          </div>` : ''}
      </div>
    `;
  }).join('');

  const langSuffix = langId ? `?lang_id=${langId}` : '';
  const langSuffixAnd = langId ? `&lang_id=${langId}` : '';

  panel.innerHTML = `
    <div class="panel-header">
      <h2>${lang === 'zh' ? '我的生词本' : 'My Word List'}
          <span style="color:var(--text-muted);font-size:1rem">(${items.length})</span></h2>
      <div style="display:flex;gap:0.5rem">
        <a class="btn-outline" href="/api/favorites/export?format=csv${langSuffixAnd}" target="_blank" rel="noopener">
          📄 ${lang === 'zh' ? '导出 CSV' : 'Export CSV'}
        </a>
        <a class="btn-outline" href="/api/favorites/export?format=anki${langSuffixAnd}" target="_blank" rel="noopener">
          🎴 ${lang === 'zh' ? '导出 Anki' : 'Export Anki'}
        </a>
        <button class="btn-outline" onclick="printFavorites()">
          🖨 ${lang === 'zh' ? '打印 / PDF' : 'Print / PDF'}
        </button>
      </div>
    </div>
    <div class="vocab-grid">${cards}</div>
  `;
}

function printFavorites() {
  const lang = getUILang();
  const items = favoritesPanelState.items;
  if (!items.length) return;
  const langName = currentLang ? (lang === 'zh' ? currentLang.name_zh : currentLang.name_en) : '';

  const rows = items.map((v, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="word">${escapeHtml(v.word)}</td>
      <td class="rom">${escapeHtml(v.romanization || '')}</td>
      <td>${escapeHtml((lang === 'zh' ? v.meaning_zh : v.meaning_en) || '')}</td>
      <td class="ex">${escapeHtml(v.example_native || '')}</td>
    </tr>
  `).join('');

  const w = window.open('', '_blank');
  w.document.write(`
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>${lang === 'zh' ? '生词本' : 'Word List'} - LangLearn</title>
    <style>
      body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; padding: 2rem; max-width: 900px; margin: 0 auto; }
      h1 { color: #c0392b; }
      table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
      th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #ddd; }
      th { background: #f5f1ea; }
      td.word { font-size: 1.1rem; font-weight: 600; }
      td.rom { color: #f39c12; font-style: italic; font-size: 0.9rem; }
      td.ex { color: #555; font-size: 0.9rem; }
      tr:nth-child(even) { background: #fafafa; }
      @media print { body { padding: 1rem; } h1 { page-break-after: avoid; } }
    </style>
    </head><body>
    <h1>${lang === 'zh' ? '生词本' : 'Word List'} — ${langName} (${items.length})</h1>
    <p style="color:#888">${new Date().toLocaleString()}</p>
    <table>
      <thead><tr>
        <th>#</th>
        <th>${lang === 'zh' ? '词' : 'Word'}</th>
        <th>${lang === 'zh' ? '发音' : 'Pronunciation'}</th>
        <th>${lang === 'zh' ? '释义' : 'Meaning'}</th>
        <th>${lang === 'zh' ? '例句' : 'Example'}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <script>setTimeout(() => window.print(), 500);</script>
    </body></html>
  `);
  w.document.close();
}
