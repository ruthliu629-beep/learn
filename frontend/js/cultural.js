async function loadCulture(langId) {
  const panel = document.getElementById('tab-culture');
  const uiLang = getUILang();
  panel.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const notes = await api.get(`/api/cultural/${langId}`);
    if (notes.length === 0) {
      panel.innerHTML = `<div class="empty">${uiLang === 'zh' ? '暂无文化内容' : 'No cultural notes yet'}</div>`;
      return;
    }

    const cards = notes.map(n => {
      const title = uiLang === 'zh' ? n.title_zh : n.title_en;
      const body = uiLang === 'zh' ? n.body_zh : n.body_en;
      return `
        <div class="culture-card">
          ${n.region ? `<span class="culture-region">${escapeHtml(n.region)}</span>` : ''}
          <h3>${escapeHtml(title)}</h3>
          <p class="culture-body">${escapeHtml(body)}</p>
        </div>
      `;
    }).join('');

    panel.innerHTML = `
      <div class="panel-header">
        <h2>${uiLang === 'zh' ? '文化背景' : 'Cultural Context'}</h2>
      </div>
      <div class="culture-grid">${cards}</div>
    `;
  } catch (e) {
    panel.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}
