let memoryState = {
  langId: null,
  langCode: null,
  items: [],
  queue: [],
  phase: 'home',
  learnIndex: 0,
  question: null,
  answered: false,
  score: 0,
  attempts: 0,
  misses: new Map(),
  startedAt: null,
};

async function loadMemoryMode(langId) {
  memoryState.langId = langId;
  memoryState.langCode = currentLang.code;
  memoryState.phase = 'home';
  memoryState.items = [];
  memoryState.queue = [];
  memoryState.learnIndex = 0;
  memoryState.score = 0;
  memoryState.attempts = 0;
  memoryState.misses = new Map();
  memoryState.startedAt = null;
  renderMemoryHome();
}

function renderMemoryHome() {
  const panel = document.getElementById('tab-memory');
  const zh = getUILang() === 'zh';
  panel.innerHTML = `
    <div class="panel-header">
      <h2>${zh ? '速记模式' : 'Quick Memory'}</h2>
    </div>
    <div class="memory-shell">
      <div class="memory-hero">
        <div class="memory-kicker">${zh ? '8 个词 · 先看后测 · 错词加练' : '8 words · Preview then recall · Misses repeat'}</div>
        <h3>${zh ? '用 3 分钟把一组新词先塞进脑子里' : 'Get a new word set into memory in 3 minutes'}</h3>
        <p>${zh ? '每轮会先快速浏览单词、读音、释义和例句，然后马上做回忆选择。答错的词会自动回到队列末尾。' : 'Preview word, sound, meaning, and example, then recall immediately. Missed words return to the end of the queue.'}</p>
        <button class="btn-primary btn-lg" onclick="startMemoryRound()">${zh ? '开始速记' : 'Start'}</button>
      </div>
    </div>
  `;
}

async function startMemoryRound() {
  const panel = document.getElementById('tab-memory');
  panel.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const data = await api.get(`/api/vocabulary/${memoryState.langId}?random=true&limit=24&source=curated`);
    memoryState.items = shuffle([...data.items]).slice(0, 8);
    if (memoryState.items.length < 4) {
      const fallback = await api.get(`/api/vocabulary/${memoryState.langId}?random=true&limit=24`);
      memoryState.items = shuffle([...fallback.items]).slice(0, 8);
    }
    if (memoryState.items.length < 4) {
      panel.innerHTML = `<div class="empty">${getUILang() === 'zh' ? '词汇太少，暂时不能开始速记' : 'Not enough vocabulary for memory mode'}</div>`;
      return;
    }
    memoryState.phase = 'learn';
    memoryState.learnIndex = 0;
    memoryState.score = 0;
    memoryState.attempts = 0;
    memoryState.misses = new Map();
    memoryState.startedAt = Date.now();
    renderMemoryLearn();
  } catch (e) {
    panel.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}

function renderMemoryLearn() {
  const panel = document.getElementById('tab-memory');
  const zh = getUILang() === 'zh';
  const item = memoryState.items[memoryState.learnIndex];
  const meaning = zh ? item.meaning_zh : item.meaning_en;
  const example = zh ? item.example_zh : item.example_en;
  const progressPct = Math.round(((memoryState.learnIndex + 1) / memoryState.items.length) * 100);

  panel.innerHTML = `
    <div class="memory-shell">
      <div class="memory-topbar">
        <span>${zh ? '快速预览' : 'Preview'} ${memoryState.learnIndex + 1} / ${memoryState.items.length}</span>
        <span>${progressPct}%</span>
      </div>
      <div class="memory-progress"><span style="width:${progressPct}%"></span></div>
      <div class="memory-card">
        ${item.emoji ? `<div class="memory-emoji">${item.emoji}</div>` : ''}
        <div class="memory-word">${escapeHtml(item.word)}</div>
        ${item.romanization ? `<div class="memory-rom">${escapeHtml(item.romanization)}</div>` : ''}
        <div class="memory-meaning">${escapeHtml(meaning)}</div>
        <div class="memory-audio">
          ${speakButtonsHTML(item.word, memoryState.langCode, item.romanization || '', { size: 'lg' })}
        </div>
        ${item.example_native ? `
          <div class="memory-example">
            <strong>${escapeHtml(item.example_native)}</strong>
            ${item.example_romanization ? `<span>${escapeHtml(item.example_romanization)}</span>` : ''}
            ${example ? `<span>${escapeHtml(example)}</span>` : ''}
          </div>
        ` : ''}
      </div>
      <div class="memory-actions">
        <button class="btn-outline" onclick="prevMemoryLearn()" ${memoryState.learnIndex === 0 ? 'disabled' : ''}>${zh ? '上一个' : 'Back'}</button>
        <button class="btn-primary" onclick="nextMemoryLearn()">${memoryState.learnIndex === memoryState.items.length - 1 ? (zh ? '开始回忆' : 'Recall') : (zh ? '下一个' : 'Next')}</button>
      </div>
    </div>
  `;

  setTimeout(() => {
    const btn = panel.querySelector('.memory-audio .btn-speak:not(.btn-speak-slow)');
    if (btn) speakFromButton(btn, item.word, memoryState.langCode, item.romanization || '', 'normal');
  }, 120);
}

function prevMemoryLearn() {
  memoryState.learnIndex = Math.max(0, memoryState.learnIndex - 1);
  renderMemoryLearn();
}

function nextMemoryLearn() {
  if (memoryState.learnIndex < memoryState.items.length - 1) {
    memoryState.learnIndex++;
    renderMemoryLearn();
    return;
  }
  memoryState.phase = 'recall';
  memoryState.queue = shuffle([...memoryState.items]);
  nextMemoryQuestion();
}

function nextMemoryQuestion() {
  if (memoryState.queue.length === 0) {
    renderMemoryResult();
    return;
  }
  const item = memoryState.queue.shift();
  const zh = getUILang() === 'zh';
  const answer = zh ? item.meaning_zh : item.meaning_en;
  const distractors = shuffle(memoryState.items.filter(x => x.id !== item.id))
    .slice(0, 3)
    .map(x => zh ? x.meaning_zh : x.meaning_en);
  memoryState.question = {
    item,
    answer,
    choices: shuffle([answer, ...distractors]),
  };
  memoryState.answered = false;
  renderMemoryQuestion();
}

function renderMemoryQuestion() {
  const panel = document.getElementById('tab-memory');
  const zh = getUILang() === 'zh';
  const q = memoryState.question;
  const done = memoryState.attempts;
  const total = memoryState.items.length + Array.from(memoryState.misses.values()).reduce((a, b) => a + b, 0);
  const choices = q.choices.map((choice, idx) => `
    <button class="quiz-choice memory-choice" onclick="answerMemory(${idx})" data-choice="${escapeAttr(choice)}">
      ${escapeHtml(choice)}
    </button>
  `).join('');

  panel.innerHTML = `
    <div class="memory-shell">
      <div class="memory-topbar">
        <span>${zh ? '回忆' : 'Recall'} ${Math.min(done + 1, total || memoryState.items.length)} / ${total || memoryState.items.length}</span>
        <span>${zh ? '得分' : 'Score'} ${memoryState.score}</span>
      </div>
      <div class="quiz-question memory-question">
        <h3>${zh ? '这个词是什么意思？' : 'What does this word mean?'}</h3>
        <div class="quiz-word">${escapeHtml(q.item.word)}</div>
        ${q.item.romanization ? `<div class="quiz-rom">${escapeHtml(q.item.romanization)}</div>` : ''}
        <div style="margin-top:1rem">${speakButtonsHTML(q.item.word, memoryState.langCode, q.item.romanization || '', {})}</div>
      </div>
      <div class="quiz-choices">${choices}</div>
    </div>
  `;
}

async function answerMemory(choiceIdx) {
  if (memoryState.answered) return;
  memoryState.answered = true;
  const q = memoryState.question;
  const picked = q.choices[choiceIdx];
  const correct = picked === q.answer;
  memoryState.attempts++;
  if (correct) memoryState.score++;
  else {
    const missed = memoryState.misses.get(q.item.id) || 0;
    if (missed < 2) {
      memoryState.misses.set(q.item.id, missed + 1);
      memoryState.queue.push(q.item);
    }
  }

  document.querySelectorAll('.memory-choice').forEach((btn, idx) => {
    btn.disabled = true;
    const value = q.choices[idx];
    if (value === q.answer) btn.classList.add('correct');
    else if (idx === choiceIdx) btn.classList.add('wrong');
  });

  try {
    await api.post('/api/progress/review', { vocab_id: q.item.id, correct });
  } catch (e) {
    console.warn('Memory progress sync failed:', e.message);
  }

  setTimeout(nextMemoryQuestion, correct ? 650 : 1200);
}

function renderMemoryResult() {
  const panel = document.getElementById('tab-memory');
  const zh = getUILang() === 'zh';
  const seconds = Math.max(1, Math.round((Date.now() - memoryState.startedAt) / 1000));
  const missedCount = memoryState.misses.size;
  const percent = Math.round((memoryState.score / Math.max(1, memoryState.attempts)) * 100);
  const title = missedCount === 0
    ? (zh ? '这组词记住了' : 'Set memorized')
    : (zh ? '再巩固一下错词' : 'Review the misses once more');

  panel.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-result memory-result">
        <div style="font-size:4rem">${missedCount === 0 ? '✓' : '↻'}</div>
        <h2>${title}</h2>
        <div class="quiz-score">${percent}%</div>
        <p style="color:var(--text-muted);margin-bottom:1.5rem">
          ${zh ? `用时 ${seconds} 秒 · 答题 ${memoryState.attempts} 次 · 错词 ${missedCount} 个` : `${seconds}s · ${memoryState.attempts} attempts · ${missedCount} misses`}
        </p>
        <div class="memory-actions">
          <button class="btn-outline" onclick="startMemoryRound()">${zh ? '换一组词' : 'New set'}</button>
          <button class="btn-primary" onclick="restartMemoryMisses()" ${missedCount === 0 ? 'disabled' : ''}>${zh ? '只练错词' : 'Misses only'}</button>
        </div>
      </div>
    </div>
  `;
}

function restartMemoryMisses() {
  const missedIds = new Set(memoryState.misses.keys());
  memoryState.items = memoryState.items.filter(item => missedIds.has(item.id));
  if (memoryState.items.length === 0) {
    startMemoryRound();
    return;
  }
  memoryState.score = 0;
  memoryState.attempts = 0;
  memoryState.misses = new Map();
  memoryState.queue = shuffle([...memoryState.items]);
  memoryState.startedAt = Date.now();
  nextMemoryQuestion();
}
