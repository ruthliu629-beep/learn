let vocabState = {
  langId: null,
  langCode: null,
  category: 'all',
  search: '',
  items: [],
  categories: [],
  total: 0,
  offset: 0,
  pageSize: 60,
};

const CATEGORY_LABELS = {
  romance:   { zh: '恋爱', en: 'Romance',   icon: '❤️' },
  greetings: { zh: '问候', en: 'Greetings', icon: '👋' },
  numbers:   { zh: '数字', en: 'Numbers',   icon: '🔢' },
  time:      { zh: '时间', en: 'Time',      icon: '⏰' },
  family:    { zh: '家庭', en: 'Family',    icon: '👨‍👩‍👧' },
  food:      { zh: '饮食', en: 'Food',      icon: '🍜' },
  travel:    { zh: '出行', en: 'Travel',    icon: '✈️' },
  shopping:  { zh: '购物', en: 'Shopping',  icon: '🛒' },
  emergency: { zh: '急救', en: 'Emergency', icon: '🚨' },
  feelings:  { zh: '感受', en: 'Feelings',  icon: '💭' },
  phrases:   { zh: '常用短语', en: 'Phrases', icon: '💬' },
  verbs:     { zh: '动词', en: 'Verbs',     icon: '🏃' },
  adjectives:{ zh: '形容词', en: 'Adjectives', icon: '✨' },
  adverbs:   { zh: '副词', en: 'Adverbs',   icon: '⚡' },
  colors:    { zh: '颜色', en: 'Colors',    icon: '🎨' },
  body:      { zh: '身体', en: 'Body',      icon: '🫀' },
  weather:   { zh: '天气', en: 'Weather',   icon: '☁️' },
  general:   { zh: '通用', en: 'General',   icon: '📚' },
};

function categoryLabel(cat, lang) {
  const c = CATEGORY_LABELS[cat];
  if (!c) return cat;
  return `${c.icon} ${c[lang]}`;
}

async function loadVocabulary(langId, opts = {}) {
  const langChanged = vocabState.langId !== langId;
  vocabState.langId = langId;
  vocabState.langCode = currentLang.code;
  if (langChanged) vocabState.offset = 0;
  if (opts.resetOffset) vocabState.offset = 0;

  const panel = document.getElementById('tab-vocabulary');
  if (!opts.append) panel.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const params = new URLSearchParams();
    if (vocabState.category && vocabState.category !== 'all') params.set('category', vocabState.category);
    if (vocabState.search) params.set('search', vocabState.search);
    params.set('limit', vocabState.pageSize);
    params.set('offset', vocabState.offset);
    const data = await api.get(`/api/vocabulary/${langId}?${params}`);
    vocabState.items = opts.append ? [...vocabState.items, ...data.items] : data.items;
    vocabState.categories = data.categories;
    vocabState.total = data.total;
    renderVocabulary();
  } catch (e) {
    panel.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}

function loadMoreVocab() {
  vocabState.offset += vocabState.pageSize;
  loadVocabulary(vocabState.langId, { append: true });
}

function renderVocabulary() {
  const panel = document.getElementById('tab-vocabulary');
  const lang = getUILang();

  const pills = ['all', ...vocabState.categories].map(c => {
    const label = c === 'all'
      ? (lang === 'zh' ? '🌐 全部' : '🌐 All')
      : categoryLabel(c, lang);
    const active = c === vocabState.category ? 'active' : '';
    return `<button class="filter-pill ${active}" onclick="setVocabCategory('${c}')">${label}</button>`;
  }).join('');

  const cards = vocabState.items.length === 0
    ? `<div class="empty">${lang === 'zh' ? '没有匹配的词汇' : 'No vocabulary found'}</div>`
    : vocabState.items.map(v => {
        const meaning = lang === 'zh' ? v.meaning_zh : v.meaning_en;
        const cl = CATEGORY_LABELS[v.category];
        const catLabel = cl ? `${cl.icon} ${cl[lang]}` : v.category;
        const ex_translation = lang === 'zh' ? v.example_zh : v.example_en;
        const exampleHtml = v.example_native ? `
          <div class="vocab-example">
            <div class="vocab-example-native">${escapeHtml(v.example_native)}</div>
            ${v.example_romanization ? `<div class="vocab-example-rom">${escapeHtml(v.example_romanization)}</div>` : ''}
            ${ex_translation ? `<div class="vocab-example-trans">${escapeHtml(ex_translation)}</div>` : ''}
            <div class="vocab-example-actions">
              <button class="btn-speak-pill" title="${lang === 'zh' ? '口语语速' : 'Conversational speed'}"
                      onclick="speakFromButton(this, '${escapeAttr(v.example_native)}', '${vocabState.langCode}', '${escapeAttr(v.example_romanization || '')}', 'fast')">
                📢 <span>${lang === 'zh' ? '听例句' : 'Play example'}</span>
              </button>
              <button class="btn-speak-pill btn-speak-pill-slow" title="${lang === 'zh' ? '慢速朗读' : 'Slow'}"
                      onclick="speakFromButton(this, '${escapeAttr(v.example_native)}', '${vocabState.langCode}', '${escapeAttr(v.example_romanization || '')}', 'slow')">
                🐢 <span>${lang === 'zh' ? '慢速' : 'Slow'}</span>
              </button>
            </div>
          </div>
        ` : '';
        return `
          <div class="vocab-card" data-vocab-id="${v.id}">
            ${favoriteButtonHTML(v.id)}
            ${speakButtonsHTML(v.word, vocabState.langCode, v.romanization || '', { size: 'sm' })}
            ${v.emoji ? `<div class="vocab-emoji">${v.emoji}</div>` : ''}
            <div class="vocab-word">${escapeHtml(v.word)}</div>
            ${v.romanization ? `<div class="vocab-rom">${escapeHtml(v.romanization)}</div>` : ''}
            <div class="vocab-meaning">${escapeHtml(meaning)}</div>
            <span class="vocab-category">${catLabel}</span>
            ${exampleHtml}
          </div>
        `;
      }).join('');

  const searchPh = lang === 'zh' ? '搜索词汇...' : 'Search vocabulary...';
  const totalNote = lang === 'zh'
    ? `显示 ${vocabState.items.length} / 共 ${vocabState.total.toLocaleString()} 条`
    : `Showing ${vocabState.items.length} of ${vocabState.total.toLocaleString()}`;
  const hasMore = vocabState.items.length < vocabState.total;
  const moreBtn = hasMore ? `
    <div style="text-align:center;margin-top:1.5rem">
      <button class="btn-outline" onclick="loadMoreVocab()">
        ${lang === 'zh' ? '加载更多' : 'Load more'} (+${vocabState.pageSize})
      </button>
    </div>` : '';

  panel.innerHTML = `
    <div class="panel-header">
      <h2>${lang === 'zh' ? '词汇与短语' : 'Vocabulary & Phrases'}</h2>
      <input type="text" class="search-box" id="vocab-search"
             placeholder="${searchPh}" value="${escapeHtml(vocabState.search)}"
             oninput="onVocabSearch(event)">
    </div>
    <div class="autoplay-bar" id="autoplay-controls"></div>
    <div class="filter-pills">${pills}</div>
    <div class="vocab-count">${totalNote}</div>
    <div class="vocab-grid">${cards}</div>
    ${moreBtn}
  `;
  renderAutoplayControls();
}

function setVocabCategory(cat) {
  vocabState.category = cat;
  loadVocabulary(vocabState.langId, { resetOffset: true });
}

let searchTimer = null;
function onVocabSearch(event) {
  clearTimeout(searchTimer);
  vocabState.search = event.target.value;
  searchTimer = setTimeout(() => loadVocabulary(vocabState.langId, { resetOffset: true }), 300);
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function escapeAttr(s) {
  // escape for inclusion inside single-quoted JS string in HTML attribute
  if (s == null) return '';
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
