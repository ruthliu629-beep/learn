/* Skills Test 能力测试 — Listening, Speaking, Reading, Writing */

const skillsState = {
  mode: null,          // 'listen' | 'speak' | 'read' | 'write'
  langId: null,
  langCode: null,
  items: [],
  index: 0,
  correct: 0,
  total: 0,
  recognition: null,   // SpeechRecognition instance
  answered: false,
};

const SKILL_META = {
  listen: { icon: '👂', zh: '听力测试', en: 'Listening' },
  speak:  { icon: '🎤', zh: '口语测试', en: 'Speaking'  },
  shadow: { icon: '🔁', zh: '跟读对比', en: 'Shadow Speak' },
  read:   { icon: '📖', zh: '阅读测试', en: 'Reading'   },
  write:  { icon: '✍️', zh: '写作测试', en: 'Writing'   },
};

async function loadSkills(langId) {
  skillsState.langId = langId;
  skillsState.langCode = currentLang.code;
  skillsState.mode = null;
  const panel = document.getElementById('tab-skills');
  const lang = getUILang();

  // Pre-fetch a random sample large enough for a 25-question round with varied distractors
  try {
    const data = await api.get(`/api/vocabulary/${langId}?random=true&limit=120`);
    skillsState.items = data.items;
  } catch (e) {
    panel.innerHTML = `<div class="empty">${e.message}</div>`;
    return;
  }

  const cards = Object.entries(SKILL_META).map(([key, m]) => `
    <button class="skill-card" onclick="startSkill('${key}')">
      <span class="skill-icon">${m.icon}</span>
      <span class="skill-title">${lang === 'zh' ? m.zh : m.en}</span>
      <span class="skill-sub">${skillDescription(key, lang)}</span>
    </button>
  `).join('');

  const speechOK = 'speechSynthesis' in window;
  const recogOK = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  const warn = (!speechOK || !recogOK) ? `
    <div class="skill-warn">
      ${lang === 'zh' ? '⚠️ 你的浏览器' : '⚠️ Your browser'}
      ${!speechOK ? (lang === 'zh' ? '不支持语音合成（听力不可用）' : 'lacks speech synthesis (listening disabled)') : ''}
      ${(!speechOK && !recogOK) ? ', ' : ''}
      ${!recogOK ? (lang === 'zh' ? '不支持语音识别（口语不可用）。推荐 Chrome/Edge。' : 'lacks speech recognition (speaking disabled). Recommend Chrome/Edge.') : ''}
    </div>
  ` : '';

  panel.innerHTML = `
    <div class="panel-header">
      <h2>${lang === 'zh' ? '听说读写能力测试' : 'Skills Test'}</h2>
    </div>
    <p class="skill-intro">${lang === 'zh'
      ? '四种测试方式全面检验你的语言能力。每轮 25 题，成绩自动保存到进度。'
      : 'Four test modes to comprehensively evaluate your language skills. 25 questions each round; scores saved to progress.'}</p>
    ${warn}
    <div class="skills-grid">${cards}</div>
  `;
}

function skillDescription(key, lang) {
  const D = {
    listen: { zh: '听词选意思 — 考听力', en: 'Hear the word, pick the meaning' },
    speak:  { zh: '开口读单词 — 考发音', en: 'Speak the word; we check pronunciation' },
    shadow: { zh: '跟读并与原音波形对比', en: 'Record + compare waveform with original' },
    read:   { zh: '读拼音／音标还原文字', en: 'Read romanization, recall the word' },
    write:  { zh: '看意思，写出对应单词', en: 'See the meaning, type the word' },
  };
  return D[key][lang];
}

function startSkill(mode) {
  skillsState.mode = mode;
  skillsState.index = 0;
  skillsState.correct = 0;
  skillsState.total = Math.min(25, skillsState.items.length);
  skillsState.answered = false;

  // Shuffle a fresh batch of items
  skillsState.queue = shuffleArr([...skillsState.items]).slice(0, skillsState.total);

  if (mode === 'listen') renderListen();
  else if (mode === 'speak') renderSpeak();
  else if (mode === 'shadow') renderShadow();
  else if (mode === 'read') renderRead();
  else if (mode === 'write') renderWrite();
}

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============ SHARED HEADER / FINAL ============
function skillHeader() {
  const lang = getUILang();
  const m = SKILL_META[skillsState.mode];
  return `
    <div class="panel-header">
      <h2>${m.icon} ${lang === 'zh' ? m.zh : m.en}</h2>
      <button class="btn-text" onclick="loadSkills(skillsState.langId)">
        ← ${lang === 'zh' ? '返回' : 'Back'}
      </button>
    </div>
    <div class="quiz-header">
      <span>${lang === 'zh' ? '第' : 'Question'} ${skillsState.index + 1} / ${skillsState.total}</span>
      <span>${lang === 'zh' ? '得分' : 'Score'}: ${skillsState.correct}</span>
    </div>
  `;
}

async function finishSkill() {
  const panel = document.getElementById('tab-skills');
  const lang = getUILang();
  const pct = Math.round((skillsState.correct / skillsState.total) * 100);
  const m = SKILL_META[skillsState.mode];
  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪';

  // Save to progress API as a quiz session (reuse endpoint)
  try {
    const results = skillsState.queue.map((q, i) => ({
      vocab_id: q.id,
      correct: i < skillsState.correct,
    }));
    await api.post('/api/quiz/submit', {
      language_id: skillsState.langId,
      score: skillsState.correct,
      total: skillsState.total,
      results,
    });
  } catch (e) {
    console.warn('Save failed:', e.message);
  }

  panel.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-result">
        <div style="font-size:4rem">${emoji}</div>
        <h2>${lang === 'zh' ? m.zh + ' 完成！' : m.en + ' complete!'}</h2>
        <div class="quiz-score">${skillsState.correct} / ${skillsState.total}</div>
        <p style="color:var(--text-muted);margin-bottom:1.5rem">${pct}%</p>
        <button class="btn-primary" onclick="startSkill('${skillsState.mode}')">
          ${lang === 'zh' ? '再来一轮' : 'Another round'}
        </button>
        <button class="btn-outline" onclick="loadSkills(skillsState.langId)" style="margin-left:0.5rem">
          ${lang === 'zh' ? '换模式' : 'Change mode'}
        </button>
      </div>
    </div>
  `;
}

function nextSkillQuestion() {
  skillsState.index++;
  skillsState.answered = false;
  if (skillsState.index >= skillsState.total) {
    finishSkill();
  } else {
    if (skillsState.mode === 'listen') renderListen();
    else if (skillsState.mode === 'speak') renderSpeak();
    else if (skillsState.mode === 'shadow') renderShadow();
    else if (skillsState.mode === 'read') renderRead();
    else if (skillsState.mode === 'write') renderWrite();
  }
}

// ============ 听 LISTENING ============
function renderListen() {
  const panel = document.getElementById('tab-skills');
  const lang = getUILang();
  const q = skillsState.queue[skillsState.index];

  // Pick 3 random distractor meanings
  const distractors = skillsState.items
    .filter(v => v.id !== q.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const pool = [q, ...distractors];
  const choices = shuffleArr(pool);
  const correctIdx = choices.findIndex(c => c.id === q.id);

  const choicesHtml = choices.map((c, i) => `
    <button class="quiz-choice" onclick="answerListen(${i}, ${correctIdx})" data-idx="${i}">
      ${escapeHtml(lang === 'zh' ? c.meaning_zh : c.meaning_en)}
    </button>
  `).join('');

  panel.innerHTML = `
    ${skillHeader()}
    <div class="quiz-container">
      <div class="quiz-question">
        <h3>${lang === 'zh' ? '听下面的词，选择正确的意思：' : 'Listen and pick the correct meaning:'}</h3>
        <button class="btn-speak btn-speak-lg" style="margin:1rem auto" onclick="speakFromButton(this, '${escapeAttr(q.word)}', '${skillsState.langCode}')">🔊</button>
        <div class="quiz-hint">${lang === 'zh' ? '（点击喇叭按钮播放）' : '(Tap the speaker to play)'}</div>
        <div class="listen-reveal" id="listen-reveal" hidden></div>
      </div>
      <div class="quiz-choices">${choicesHtml}</div>
    </div>
  `;

  // Auto-play the audio once when question appears
  setTimeout(() => {
    const b = panel.querySelector('.btn-speak-lg');
    if (b) speakFromButton(b, q.word, skillsState.langCode);
  }, 200);
}

function answerListen(picked, correctIdx) {
  if (skillsState.answered) return;
  skillsState.answered = true;
  const lang = getUILang();
  const q = skillsState.queue[skillsState.index];
  const buttons = document.querySelectorAll('.quiz-choice');
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === correctIdx) b.classList.add('correct');
    else if (i === picked) b.classList.add('wrong');
  });
  if (picked === correctIdx) skillsState.correct++;

  // Reveal the actual word the user just heard
  const reveal = document.getElementById('listen-reveal');
  if (reveal) {
    reveal.innerHTML = `
      <div class="listen-reveal-label">${lang === 'zh' ? '刚才的词是：' : 'The word was:'}</div>
      <div class="listen-reveal-word">${escapeHtml(q.word)}</div>
      ${q.romanization ? `<div class="listen-reveal-rom">${escapeHtml(q.romanization)}</div>` : ''}
      <div class="listen-reveal-meaning">${escapeHtml(lang === 'zh' ? q.meaning_zh : q.meaning_en)}</div>
    `;
    reveal.hidden = false;
  }

  setTimeout(nextSkillQuestion, 2400);
}

// ============ 说 SPEAKING ============
function renderSpeak() {
  const panel = document.getElementById('tab-skills');
  const lang = getUILang();
  const q = skillsState.queue[skillsState.index];

  panel.innerHTML = `
    ${skillHeader()}
    <div class="quiz-container">
      <div class="quiz-question">
        <h3>${lang === 'zh' ? '读出下面这个词：' : 'Read the following aloud:'}</h3>
        <div class="quiz-word">${escapeHtml(q.word)}</div>
        ${q.romanization ? `<div class="quiz-rom">${escapeHtml(q.romanization)}</div>` : ''}
        <div class="speak-actions">
          <button class="btn-outline" onclick="speakFromButton(this, '${escapeAttr(q.word)}', '${skillsState.langCode}')">
            🔊 ${lang === 'zh' ? '先听一次' : 'Listen first'}
          </button>
          <button class="btn-primary" id="btn-record" onclick="toggleRecord()">
            🎤 ${lang === 'zh' ? '开始朗读' : 'Start speaking'}
          </button>
        </div>
        <div class="speak-status" id="speak-status"></div>
        <div class="speak-result" id="speak-result"></div>
      </div>
    </div>
  `;
}

function toggleRecord() {
  const lang = getUILang();
  const btn = document.getElementById('btn-record');
  const status = document.getElementById('speak-status');
  const result = document.getElementById('speak-result');

  // Stop if already recording
  if (skillsState.recognition && skillsState.recognition._running) {
    skillsState.recognition.stop();
    return;
  }

  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Rec) {
    status.textContent = lang === 'zh'
      ? '浏览器不支持语音识别。请用 Chrome 或 Edge。'
      : 'Browser lacks speech recognition. Use Chrome or Edge.';
    return;
  }

  const locale = SPEECH_LOCALE[skillsState.langCode];
  if (!locale) {
    status.textContent = lang === 'zh'
      ? '此语言暂不支持语音识别'
      : 'Speech recognition not available for this language';
    return;
  }

  const r = new Rec();
  r.lang = locale;
  r.interimResults = false;
  r.maxAlternatives = 3;
  r._running = true;
  skillsState.recognition = r;

  btn.classList.add('recording');
  btn.innerHTML = `🔴 ${lang === 'zh' ? '录音中...点击停止' : 'Recording... tap to stop'}`;
  status.textContent = lang === 'zh' ? '请清晰地朗读上方词语' : 'Speak the word clearly';
  result.innerHTML = '';

  r.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    const confidence = event.results[0][0].confidence;
    const q = skillsState.queue[skillsState.index];
    const match = compareSpeech(transcript, q.word, skillsState.langCode);

    if (match) skillsState.correct++;
    result.innerHTML = `
      <div class="speak-transcript ${match ? 'ok' : 'fail'}">
        <div>${lang === 'zh' ? '识别到' : 'Heard'}: <strong>${escapeHtml(transcript)}</strong></div>
        <div>${lang === 'zh' ? '目标' : 'Target'}: <strong>${escapeHtml(q.word)}</strong></div>
        <div class="speak-verdict">${match
          ? (lang === 'zh' ? '✓ 发音正确！' : '✓ Correct!')
          : (lang === 'zh' ? '✗ 再试一次' : '✗ Try again')}</div>
      </div>
    `;
    setTimeout(nextSkillQuestion, 2000);
  };

  r.onerror = (e) => {
    status.textContent = (lang === 'zh' ? '识别错误：' : 'Error: ') + e.error;
    resetRecordBtn();
  };

  r.onend = () => {
    r._running = false;
    resetRecordBtn();
  };

  try {
    r.start();
  } catch (e) {
    status.textContent = e.message;
    resetRecordBtn();
  }
}

function resetRecordBtn() {
  const btn = document.getElementById('btn-record');
  if (!btn) return;
  const lang = getUILang();
  btn.classList.remove('recording');
  btn.innerHTML = `🎤 ${lang === 'zh' ? '重新朗读' : 'Speak again'}`;
}

function compareSpeech(heard, target, langCode) {
  // Normalize: lowercase, strip punctuation and whitespace
  const norm = (s) => s.toLowerCase()
    .replace(/[、，。．,.!?！？'"'"：:；;]/g, '')
    .replace(/\s+/g, '')
    .trim();
  const h = norm(heard);
  const t = norm(target);
  if (!h || !t) return false;
  if (h === t) return true;
  // Substring tolerance (recognition often adds extra words)
  if (h.includes(t) || t.includes(h)) return true;
  // Edit distance ≤ 20% of length
  return editDistance(h, t) <= Math.max(1, Math.floor(t.length * 0.2));
}

function editDistance(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

// ============ 读 READING ============
// Show romanization / pronunciation only, user picks the correct word
function renderRead() {
  const panel = document.getElementById('tab-skills');
  const lang = getUILang();
  const q = skillsState.queue[skillsState.index];

  // Find 3 distractors with same category, or fall back to random
  const sameCat = skillsState.items.filter(v => v.id !== q.id && v.category === q.category);
  const pool = sameCat.length >= 3 ? sameCat : skillsState.items.filter(v => v.id !== q.id);
  const distractors = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = shuffleArr([q, ...distractors]);
  const correctIdx = choices.findIndex(c => c.id === q.id);

  const choicesHtml = choices.map((c, i) => `
    <button class="quiz-choice" onclick="answerRead(${i}, ${correctIdx})">${escapeHtml(c.word)}</button>
  `).join('');

  panel.innerHTML = `
    ${skillHeader()}
    <div class="quiz-container">
      <div class="quiz-question">
        <h3>${lang === 'zh' ? '根据发音／含义选择正确的写法：' : 'Pick the word matching the pronunciation / meaning:'}</h3>
        ${q.romanization ? `<div class="quiz-rom" style="font-size:1.8rem">${escapeHtml(q.romanization)}</div>` : ''}
        <div class="quiz-meaning" style="color:var(--text-muted);margin-top:0.5rem">
          ${lang === 'zh' ? '意思: ' : 'Meaning: '}${escapeHtml(lang === 'zh' ? q.meaning_zh : q.meaning_en)}
        </div>
      </div>
      <div class="quiz-choices">${choicesHtml}</div>
    </div>
  `;
}

function answerRead(picked, correctIdx) {
  if (skillsState.answered) return;
  skillsState.answered = true;
  const buttons = document.querySelectorAll('.quiz-choice');
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === correctIdx) b.classList.add('correct');
    else if (i === picked) b.classList.add('wrong');
  });
  if (picked === correctIdx) skillsState.correct++;
  setTimeout(nextSkillQuestion, 1200);
}

// ============ 写 WRITING ============
function renderWrite() {
  const panel = document.getElementById('tab-skills');
  const lang = getUILang();
  const q = skillsState.queue[skillsState.index];

  panel.innerHTML = `
    ${skillHeader()}
    <div class="quiz-container">
      <div class="quiz-question">
        <h3>${lang === 'zh' ? '根据意思，输入对应的词：' : 'Type the word for the meaning:'}</h3>
        <div class="write-meaning">${escapeHtml(lang === 'zh' ? q.meaning_zh : q.meaning_en)}</div>
        ${q.romanization ? `<div class="write-hint-rom">${lang === 'zh' ? '提示（发音）' : 'Hint (pronunciation)'}: ${escapeHtml(q.romanization)}</div>` : ''}
        <input type="text" class="write-input" id="write-input" autocomplete="off" autocapitalize="off"
               placeholder="${lang === 'zh' ? '在此输入...' : 'Type here...'}"
               onkeydown="if(event.key==='Enter') submitWrite()">
        <div class="speak-actions">
          <button class="btn-primary" onclick="submitWrite()">${lang === 'zh' ? '提交' : 'Submit'}</button>
          <button class="btn-outline" onclick="skipWrite()">${lang === 'zh' ? '跳过' : 'Skip'}</button>
        </div>
        <div class="write-result" id="write-result"></div>
      </div>
    </div>
  `;
  setTimeout(() => document.getElementById('write-input')?.focus(), 100);
}

function submitWrite() {
  if (skillsState.answered) return;
  const input = document.getElementById('write-input');
  const result = document.getElementById('write-result');
  const lang = getUILang();
  const q = skillsState.queue[skillsState.index];
  const guess = (input.value || '').trim();
  if (!guess) return;

  skillsState.answered = true;
  input.disabled = true;
  const match = compareWrite(guess, q.word);
  if (match) skillsState.correct++;

  result.innerHTML = `
    <div class="write-verdict ${match ? 'ok' : 'fail'}">
      ${match ? '✓ ' + (lang === 'zh' ? '正确！' : 'Correct!') : '✗ ' + (lang === 'zh' ? '答案：' : 'Answer: ') + escapeHtml(q.word)}
    </div>
  `;
  setTimeout(nextSkillQuestion, 1500);
}

function skipWrite() {
  if (skillsState.answered) return;
  skillsState.answered = true;
  const q = skillsState.queue[skillsState.index];
  const lang = getUILang();
  document.getElementById('write-result').innerHTML = `
    <div class="write-verdict fail">
      ${lang === 'zh' ? '答案：' : 'Answer: '}${escapeHtml(q.word)}
    </div>
  `;
  setTimeout(nextSkillQuestion, 1500);
}

function compareWrite(guess, target) {
  const norm = (s) => s.toLowerCase()
    .replace(/[、，。．,.!?！？'"'"：:；;\s]/g, '')
    .trim();
  return norm(guess) === norm(target);
}


// ============ 跟读对比 SHADOW SPEAKING ============
// Shows original + user recording waveforms side by side.

const shadowState = {
  mediaStream: null,
  recorder: null,
  recording: false,
  userBlob: null,
  originalBuffer: null,
  userBuffer: null,
  audioCtx: null,
};

function _ensureAudioContext() {
  if (!shadowState.audioCtx) {
    shadowState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return shadowState.audioCtx;
}

async function renderShadow() {
  const panel = document.getElementById('tab-skills');
  const lang = getUILang();
  const q = skillsState.queue[skillsState.index];

  panel.innerHTML = `
    ${skillHeader()}
    <div class="quiz-container">
      <div class="quiz-question">
        <h3>${lang === 'zh' ? '跟着发音朗读，对比波形' : 'Read aloud and compare waveforms'}</h3>
        <div class="quiz-word">${escapeHtml(q.word)}</div>
        ${q.romanization ? `<div class="quiz-rom">${escapeHtml(q.romanization)}</div>` : ''}
        <div class="shadow-actions">
          <button class="btn-outline" onclick="shadowPlayOriginal()">
            🔊 ${lang === 'zh' ? '播放原音' : 'Play original'}
          </button>
          <button class="btn-primary" id="btn-shadow-record" onclick="shadowToggleRecord()">
            🎤 ${lang === 'zh' ? '开始录音' : 'Start recording'}
          </button>
          <button class="btn-outline" id="btn-shadow-playback" onclick="shadowPlayUser()" disabled>
            ▶️ ${lang === 'zh' ? '回放我的' : 'Play mine'}
          </button>
        </div>
        <div class="shadow-status" id="shadow-status"></div>

        <div class="shadow-waves">
          <div class="shadow-wave-row">
            <div class="shadow-wave-label">${lang === 'zh' ? '原音' : 'Original'}</div>
            <canvas id="wave-original" class="shadow-wave" width="800" height="80"></canvas>
          </div>
          <div class="shadow-wave-row">
            <div class="shadow-wave-label">${lang === 'zh' ? '你的录音' : 'Your voice'}</div>
            <canvas id="wave-user" class="shadow-wave" width="800" height="80"></canvas>
          </div>
        </div>

        <div class="shadow-nav">
          <button class="btn-outline" onclick="shadowSkip(false)">${lang === 'zh' ? '下一个（不计分）' : 'Next'}</button>
          <button class="btn-primary" onclick="shadowSkip(true)">✓ ${lang === 'zh' ? '听起来对 · 下一个' : 'Sounds right · Next'}</button>
        </div>
      </div>
    </div>
  `;

  // Reset state
  shadowState.userBlob = null;
  shadowState.userBuffer = null;
  shadowState.originalBuffer = null;

  // Fetch + draw original waveform
  shadowFetchOriginal(q).catch(e => console.warn('shadow original fetch:', e));
}

async function shadowFetchOriginal(item) {
  const status = document.getElementById('shadow-status');
  const lang = getUILang();
  status.textContent = lang === 'zh' ? '载入原音中…' : 'Loading original…';
  const url = _shadowSourceURL(item, skillsState.langCode);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const arr = await res.arrayBuffer();
    const ctx = _ensureAudioContext();
    const decoded = await ctx.decodeAudioData(arr.slice(0));
    shadowState.originalBuffer = decoded;
    _drawWaveform(document.getElementById('wave-original'), decoded, '#c0392b');
    status.textContent = '';
  } catch (e) {
    status.textContent = (lang === 'zh' ? '原音波形不可用（Web Speech 无法抓取）：' : 'Original waveform unavailable: ') + (e.message || '');
  }
}

function _shadowSourceURL(item, langCode) {
  const text = encodeURIComponent(item.word);
  if (langCode === 'zh-nan') return `/api/tts/nan?text=${text}`;
  if (langCode === 'zh-yue' && item.romanization)
    return `/api/tts/yue?jp=${encodeURIComponent(item.romanization)}`;
  const tl = (GOOGLE_TTS_LANG[langCode] || langCode);
  return `/api/tts/google?tl=${encodeURIComponent(tl)}&text=${text}`;
}

function shadowPlayOriginal() {
  const q = skillsState.queue[skillsState.index];
  speak(q.word, skillsState.langCode, { romanization: q.romanization, speed: 'normal' });
}

function shadowPlayUser() {
  if (!shadowState.userBlob) return;
  const audio = new Audio(URL.createObjectURL(shadowState.userBlob));
  audio.play();
}

async function shadowToggleRecord() {
  const btn = document.getElementById('btn-shadow-record');
  const status = document.getElementById('shadow-status');
  const lang = getUILang();

  if (shadowState.recording) {
    shadowState.recorder.stop();
    return;
  }

  try {
    if (!shadowState.mediaStream) {
      shadowState.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    const chunks = [];
    const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    const rec = new MediaRecorder(shadowState.mediaStream, mime ? { mimeType: mime } : undefined);
    shadowState.recorder = rec;
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = async () => {
      shadowState.recording = false;
      btn.classList.remove('recording');
      btn.innerHTML = `🎤 ${lang === 'zh' ? '重新录音' : 'Record again'}`;
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      shadowState.userBlob = blob;
      document.getElementById('btn-shadow-playback').disabled = false;
      status.textContent = lang === 'zh' ? '处理波形中…' : 'Processing waveform…';
      try {
        const arr = await blob.arrayBuffer();
        const decoded = await _ensureAudioContext().decodeAudioData(arr.slice(0));
        shadowState.userBuffer = decoded;
        _drawWaveform(document.getElementById('wave-user'), decoded, '#f39c12');
        status.textContent = lang === 'zh' ? '✓ 录制完成，可对比波形' : '✓ Done — compare the waveforms';
      } catch (e) {
        status.textContent = (lang === 'zh' ? '解码失败: ' : 'Decode failed: ') + e.message;
      }
    };
    rec.start();
    shadowState.recording = true;
    btn.classList.add('recording');
    btn.innerHTML = `⏺ ${lang === 'zh' ? '录音中…点击停止' : 'Recording… tap to stop'}`;
    status.textContent = lang === 'zh' ? '清晰地朗读' : 'Speak clearly';
  } catch (e) {
    status.textContent = (lang === 'zh' ? '无法访问麦克风: ' : 'Microphone error: ') + e.message;
  }
}

function _drawWaveform(canvas, audioBuffer, color) {
  if (!canvas || !audioBuffer) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background + centerline
  ctx.fillStyle = '#f8f5f0';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#ddd';
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  const data = audioBuffer.getChannelData(0);
  const step = Math.max(1, Math.floor(data.length / w));
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < w; x++) {
    let min = 1.0, max = -1.0;
    const s = x * step;
    const end = Math.min(s + step, data.length);
    for (let i = s; i < end; i++) {
      const v = data[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    ctx.moveTo(x + 0.5, (1 - max) * h / 2);
    ctx.lineTo(x + 0.5, (1 - min) * h / 2);
  }
  ctx.stroke();
}

function shadowSkip(counted) {
  if (counted) skillsState.correct++;
  if (shadowState.recorder && shadowState.recording) {
    try { shadowState.recorder.stop(); } catch (e) {}
  }
  nextSkillQuestion();
}
