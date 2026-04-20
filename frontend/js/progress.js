async function loadProgress() {
  const panel = document.getElementById('tab-progress');
  const uiLang = getUILang();
  panel.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const stats = await api.get(`/api/progress/?lang_id=${currentLang.id}`);
    const langMap = Object.fromEntries(allLanguages.map(l => [l.id, l]));

    const sessionRows = stats.recent_sessions.length === 0
      ? `<div class="empty">${uiLang === 'zh' ? '还没有测验记录' : 'No quiz sessions yet'}</div>`
      : stats.recent_sessions.map(s => {
          const l = langMap[s.language_id];
          const name = l ? (uiLang === 'zh' ? l.name_zh : l.name_en) : '?';
          const date = new Date(s.completed_at + 'Z').toLocaleString(uiLang === 'zh' ? 'zh-CN' : 'en-US');
          const pct = Math.round((s.score / s.total) * 100);
          return `
            <div class="session-row">
              <div>
                <strong>${l ? l.flag : ''} ${escapeHtml(name)}</strong>
                <div style="color:var(--text-muted);font-size:0.85rem">${date}</div>
              </div>
              <div style="text-align:right">
                <strong>${s.score} / ${s.total}</strong>
                <div style="color:var(--text-muted);font-size:0.85rem">${pct}%</div>
              </div>
            </div>
          `;
        }).join('');

    panel.innerHTML = `
      <div class="panel-header">
        <h2>${uiLang === 'zh' ? '我的进度' : 'My Progress'}</h2>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.mastered_current_lang}</div>
          <div class="stat-label">${uiLang === 'zh' ? '本语言已掌握' : 'Mastered (this language)'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.total_vocab_current_lang}</div>
          <div class="stat-label">${uiLang === 'zh' ? '总词汇量' : 'Total vocabulary'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.total_mastered_all}</div>
          <div class="stat-label">${uiLang === 'zh' ? '全部已掌握' : 'Total mastered (all languages)'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.accuracy}%</div>
          <div class="stat-label">${uiLang === 'zh' ? '总正确率' : 'Overall accuracy'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.total_attempts}</div>
          <div class="stat-label">${uiLang === 'zh' ? '总练习次数' : 'Total attempts'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.due_count}</div>
          <div class="stat-label">${uiLang === 'zh' ? '今天待复习' : 'Due for review'}</div>
        </div>
      </div>
      <div class="progress-sessions">
        <h3 style="margin-bottom:1rem">${uiLang === 'zh' ? '最近测验' : 'Recent Quizzes'}</h3>
        ${sessionRows}
      </div>
    `;
  } catch (e) {
    panel.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}
