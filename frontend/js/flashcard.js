let flashState = {
  langId: null,
  langCode: null,
  items: [],
  index: 0,
  flipped: false,
  reviewed: 0,
};

async function loadFlashcards(langId) {
  flashState.langId = langId;
  flashState.langCode = currentLang.code;
  flashState.index = 0;
  flashState.flipped = false;
  flashState.reviewed = 0;

  const panel = document.getElementById('tab-flashcard');
  panel.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await api.get(`/api/vocabulary/${langId}?random=true&limit=30`);
    flashState.items = data.items;
    renderFlashcard();
  } catch (e) {
    panel.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}

function renderFlashcard() {
  const panel = document.getElementById('tab-flashcard');
  const lang = getUILang();

  if (flashState.items.length === 0) {
    panel.innerHTML = `<div class="empty">${lang === 'zh' ? '没有词汇可复习' : 'No vocabulary to review'}</div>`;
    return;
  }

  if (flashState.index >= flashState.items.length) {
    panel.innerHTML = `
      <div class="quiz-result">
        <h2>${lang === 'zh' ? '🎉 完成一轮复习！' : '🎉 Round complete!'}</h2>
        <p style="margin:1rem 0">${lang === 'zh' ? '复习了' : 'Reviewed'} ${flashState.reviewed} ${lang === 'zh' ? '张卡片' : 'cards'}</p>
        <button class="btn-primary" onclick="loadFlashcards(flashState.langId)">
          ${lang === 'zh' ? '再来一轮' : 'Another round'}
        </button>
      </div>`;
    return;
  }

  const item = flashState.items[flashState.index];
  const meaning = lang === 'zh' ? item.meaning_zh : item.meaning_en;
  const progress = `${flashState.index + 1} / ${flashState.items.length}`;

  panel.innerHTML = `
    <div class="flashcard-wrapper">
      <div class="panel-header" style="justify-content:center">
        <h2>${lang === 'zh' ? '闪卡练习' : 'Flashcards'}</h2>
      </div>
      <div class="flashcard-progress">${progress}</div>
      <div class="flashcard ${flashState.flipped ? 'flipped' : ''}" id="flashcard" onclick="flipCard()">
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <div class="flashcard-word">${escapeHtml(item.word)}</div>
            <button class="btn-speak btn-speak-lg" title="${lang === 'zh' ? '朗读' : 'Speak'}"
                    onclick="event.stopPropagation(); speakFromButton(this, '${escapeAttr(item.word)}', '${flashState.langCode}', '${escapeAttr(item.romanization || '')}')">🔊</button>
            <div class="flashcard-hint">${lang === 'zh' ? '点击翻转卡片' : 'Tap card to flip'}</div>
          </div>
          <div class="flashcard-back">
            ${item.romanization ? `<div class="flashcard-rom">${escapeHtml(item.romanization)}</div>` : ''}
            <div class="flashcard-meaning">${escapeHtml(meaning)}</div>
            ${item.example_native ? `
              <div class="flashcard-example">
                <div class="flashcard-example-native">${escapeHtml(item.example_native)}</div>
                ${item.example_romanization ? `<div class="flashcard-example-rom">${escapeHtml(item.example_romanization)}</div>` : ''}
                <div class="flashcard-example-trans">${escapeHtml(lang === 'zh' ? (item.example_zh || '') : (item.example_en || ''))}</div>
                <button class="btn-speak-pill" title="${lang === 'zh' ? '播放例句' : 'Play example'}"
                        onclick="event.stopPropagation(); speakFromButton(this, '${escapeAttr(item.example_native)}', '${flashState.langCode}', '${escapeAttr(item.example_romanization || '')}')">
                  📢 <span>${lang === 'zh' ? '听例句' : 'Play example'}</span>
                </button>
              </div>` : ''}
            <button class="btn-speak btn-speak-lg" title="${lang === 'zh' ? '朗读词语' : 'Speak word'}"
                    onclick="event.stopPropagation(); speakFromButton(this, '${escapeAttr(item.word)}', '${flashState.langCode}', '${escapeAttr(item.romanization || '')}')">🔊</button>
          </div>
        </div>
      </div>
      <div class="flashcard-actions">
        <button class="btn-outline" onclick="reviewCard(false)" ${!flashState.flipped ? 'disabled' : ''}>
          ${lang === 'zh' ? '✗ 没记住' : '✗ Missed it'}
        </button>
        <button class="btn-primary" onclick="reviewCard(true)" ${!flashState.flipped ? 'disabled' : ''}>
          ${lang === 'zh' ? '✓ 记住了' : '✓ Knew it'}
        </button>
      </div>
    </div>
  `;

  // Auto-speak the word when the card is shown
  setTimeout(() => {
    const btn = panel.querySelector('.flashcard-front .btn-speak');
    if (btn && SPEECH_LOCALE[flashState.langCode]) {
      speakFromButton(btn, item.word, flashState.langCode);
    }
  }, 150);
}

function flipCard() {
  flashState.flipped = !flashState.flipped;
  const el = document.getElementById('flashcard');
  if (el) el.classList.toggle('flipped');
  const buttons = document.querySelectorAll('.flashcard-actions button');
  buttons.forEach(b => b.disabled = !flashState.flipped);
}

async function reviewCard(correct) {
  const item = flashState.items[flashState.index];
  try {
    await api.post('/api/progress/review', { vocab_id: item.id, correct });
  } catch (e) {
    console.warn('Review sync failed:', e.message);
  }
  flashState.reviewed++;
  flashState.index++;
  flashState.flipped = false;
  renderFlashcard();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
