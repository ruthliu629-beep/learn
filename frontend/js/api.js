const api = {
  getToken() {
    return localStorage.getItem('token');
  },

  headers(json = true) {
    const h = {};
    if (json) h['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  },

  async _handle(res) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
    if (!res.ok) {
      let err;
      try { err = await res.json(); } catch { err = { detail: res.statusText }; }
      throw new Error(err.detail || 'Request failed');
    }
    return res.json();
  },

  async get(url) {
    const res = await fetch(url, { headers: this.headers() });
    return this._handle(res);
  },

  async post(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data || {}),
    });
    return this._handle(res);
  },
};

// ============ SPEECH SYNTHESIS ============
// Maps our language codes to browser BCP-47 locales (for Web Speech API)
const SPEECH_LOCALE = {
  'zh-cmn': 'zh-CN',
  'zh-yue': 'zh-HK',
  'zh-nan': 'google-nan',   // special: uses Google Translate TTS
  'en': 'en-US',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'fr': 'fr-FR',
  'es': 'es-ES',
  'de': 'de-DE',
};

// Google Translate TTS locale mapping (used as backend-proxy fallback
// when browser voice is missing for a language).
const GOOGLE_TTS_LANG = {
  'zh-cmn': 'zh-CN',
  'zh-yue': 'zh-HK',
  'zh-nan': 'nan-TW',
  'en': 'en',
  'ja': 'ja',
  'ko': 'ko',
  'fr': 'fr',
  'es': 'es',
  'de': 'de',
};

let _googleAudio = null;   // currently playing external audio

let _voicesCache = null;
function _loadVoices() {
  if (_voicesCache) return _voicesCache;
  if (!('speechSynthesis' in window)) return [];
  _voicesCache = speechSynthesis.getVoices();
  return _voicesCache;
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => { _voicesCache = speechSynthesis.getVoices(); };
}

function _pickVoice(locale) {
  const voices = _loadVoices();
  if (!voices.length) return null;
  // Exact match only for zh-* (to avoid picking Mandarin voice for Cantonese)
  if (locale.startsWith('zh-')) {
    return voices.find(x => x.lang === locale) || null;
  }
  let v = voices.find(x => x.lang === locale);
  if (v) return v;
  const prefix = locale.split('-')[0];
  v = voices.find(x => x.lang.startsWith(prefix));
  return v || null;
}

/**
 * Speak a word/phrase in the given language.
 * langCode: our internal language code ('zh-cmn', 'ja', etc.)
 * Returns true if speech started, false if unsupported.
 */
function _hasLocalVoice(locale) {
  const voices = _loadVoices();
  if (!voices.length) return false;
  // For Chinese variants require EXACT region match — zh-CN (Mandarin) and
  // zh-HK (Cantonese) are different languages, prefix matching would silently
  // play Mandarin for Cantonese content.
  if (locale.startsWith('zh-')) {
    return voices.some(v => v.lang === locale);
  }
  // For other languages, prefix match is fine (en-US / en-GB are mutually intelligible).
  const prefix = locale.split('-')[0];
  return voices.some(v => v.lang === locale || v.lang.startsWith(prefix + '-') || v.lang === prefix);
}

// Speed presets. Applied to Web Speech rate AND HTML Audio playbackRate.
//   slow   = 0.65  — clear pronunciation for beginners
//   normal = 1.0   — dictionary / native single-word pace
//   fast   = 1.5   — real human conversation tempo (compresses synthetic pauses)
const SPEAK_RATE = { slow: 0.65, normal: 1.0, fast: 1.5 };

// Some languages use concatenated per-syllable human recordings (Cantonese from
// words.hk, Hokkien from MOE Sutian). Each clip carries its own leading/trailing
// silence, so the assembled audio sounds slower than natural speech. Multiply
// the playback rate to compensate.
const LANG_RATE_MULT = {
  'zh-yue': 1.4,
  'zh-nan': 1.4,
};

function _rateFor(options, langCode) {
  if (typeof options.rate === 'number') return options.rate;
  const speed = options.speed || 'normal';
  let base = SPEAK_RATE[speed] || SPEAK_RATE.normal;
  // Only boost the conversational "fast" and "normal" tempo, not "slow"
  if (speed !== 'slow' && langCode && LANG_RATE_MULT[langCode]) {
    base *= LANG_RATE_MULT[langCode];
  }
  return base;
}

function speak(text, langCode, options = {}) {
  options = { ...options, rate: _rateFor(options, langCode) };

  // Hokkien: always via backend MOE — browser never supports it, and MOE is real human voice
  if (langCode === 'zh-nan') {
    return speakViaBackend(text, langCode, options);
  }

  // Cantonese: always prefer real human voice from words.hk if we have jyutping
  if (langCode === 'zh-yue' && options.romanization) {
    return speakViaBackend(text, langCode, options);
  }

  const locale = SPEECH_LOCALE[langCode];
  const supportsWebSpeech = 'speechSynthesis' in window;
  const hasVoice = supportsWebSpeech && locale && _hasLocalVoice(locale);

  // No local voice → fall back to backend Google TTS proxy
  if (!hasVoice) {
    return speakViaBackend(text, langCode, options);
  }

  speechSynthesis.cancel();
  if (_googleAudio) { _googleAudio.pause(); _googleAudio = null; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  u.rate = options.rate || 1.0;
  u.pitch = options.pitch || 1.0;
  const voice = _pickVoice(locale);
  if (voice) u.voice = voice;

  // Silent-failure guard: some browsers (or voices) report 'has voice' but then
  // never fire onstart. If nothing starts within 900ms, fall back to backend TTS.
  let fallbackFired = false;
  const fallback = setTimeout(() => {
    if (!u._started && !fallbackFired) {
      fallbackFired = true;
      try { speechSynthesis.cancel(); } catch (e) {}
      speakViaBackend(text, langCode, options);
    }
  }, 900);

  u.onstart = (e) => {
    u._started = true;
    clearTimeout(fallback);
    if (options.onstart) options.onstart(e);
  };
  u.onend = (e) => {
    clearTimeout(fallback);
    if (options.onend) options.onend(e);
  };
  u.onerror = (e) => {
    clearTimeout(fallback);
    if (!fallbackFired) {
      fallbackFired = true;
      speakViaBackend(text, langCode, options);
    } else if (options.onerror) {
      options.onerror(e);
    }
  };

  speechSynthesis.speak(u);
  return true;
}

function speakViaBackend(text, langCode, options = {}) {
  try { speechSynthesis.cancel(); } catch (e) {}
  if (_googleAudio) { _googleAudio.pause(); _googleAudio = null; }

  const snippet = text.length > 190 ? text.substring(0, 190) : text;
  const googleLang = GOOGLE_TTS_LANG[langCode] || langCode;

  // Pick sources per language
  let sources;
  if (langCode === 'zh-nan') {
    // Hokkien: MOE real-voice → Google fallback
    sources = [
      `/api/tts/nan?text=${encodeURIComponent(snippet)}`,
      `/api/tts/google?tl=${encodeURIComponent(googleLang)}&text=${encodeURIComponent(snippet)}`,
    ];
  } else if (langCode === 'zh-yue' && options.romanization) {
    // Cantonese: words.hk real-voice (by jyutping) → Google fallback
    sources = [
      `/api/tts/yue?jp=${encodeURIComponent(options.romanization)}`,
      `/api/tts/google?tl=${encodeURIComponent(googleLang)}&text=${encodeURIComponent(snippet)}`,
    ];
  } else {
    sources = [
      `/api/tts/google?tl=${encodeURIComponent(googleLang)}&text=${encodeURIComponent(snippet)}`,
    ];
  }

  let idx = 0;
  const playNext = () => {
    if (idx >= sources.length) {
      if (options.onerror) options.onerror(new Error('all sources failed'));
      if (langCode === 'zh-nan') showHokkienFallbackToast(snippet);
      else showToast(
        getUILang() === 'zh'
          ? '语音加载失败。本地未装语音包，且网络代理也无法获取。'
          : 'Audio unavailable. No local voice pack and backend proxy failed.',
        'error'
      );
      return;
    }
    const audio = new Audio(sources[idx]);
    audio.playbackRate = options.rate || 1.0;
    // Keep natural voice pitch when speeding up (no chipmunk effect)
    audio.preservesPitch = true;
    audio.mozPreservesPitch = true;
    audio.webkitPreservesPitch = true;
    _googleAudio = audio;
    if (options.onstart) audio.onplay = () => options.onstart();
    if (options.onend) audio.onended = () => { _googleAudio = null; options.onend && options.onend(); };
    audio.onerror = () => { idx++; playNext(); };
    audio.play().catch(() => { idx++; playNext(); });
  };
  playNext();
  return true;
}

function showHokkienFallbackToast(text) {
  const lang = getUILang();
  const href = `https://sutian.moe.edu.tw/zh-hant/?query=${encodeURIComponent(text)}`;
  let el = document.getElementById('__toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '__toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.innerHTML = (lang === 'zh'
    ? '闽南语语音源都被拦截，<a href="' + href + '" target="_blank" style="color:#fff;text-decoration:underline">点此到台湾教育部词典听音档 →</a>'
    : 'All Min Nan audio sources blocked. <a href="' + href + '" target="_blank" style="color:#fff;text-decoration:underline">Listen on MOE Sutian dictionary →</a>'
  );
  el.className = 'toast toast-warn show';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.classList.remove('show'); }, 8000);
}

// Click-safe button handler: toggle a pulsing animation.
// romanization (4th arg) is optional — used for Cantonese real-voice synthesis.
// speed (5th arg): 'normal' (default) or 'slow'.
function speakFromButton(btn, text, langCode, romanization, speed) {
  if (btn._speaking) {
    try { speechSynthesis.cancel(); } catch (e) {}
    if (_googleAudio) { _googleAudio.pause(); _googleAudio = null; }
    btn._speaking = false;
    btn.classList.remove('playing');
    return;
  }
  const started = speak(text, langCode, {
    romanization: romanization || undefined,
    speed: speed || 'normal',
    onstart: () => { btn._speaking = true; btn.classList.add('playing'); },
    onend: () => { btn._speaking = false; btn.classList.remove('playing'); },
    onerror: () => { btn._speaking = false; btn.classList.remove('playing'); },
  });
  if (!started) {
    btn.classList.remove('playing');
  }
}

// Helper that renders a paired normal+slow speak button group. Use in templates.
function speakButtonsHTML(text, langCode, romanization, opts = {}) {
  const size = opts.size || 'md';
  const sizeClass = size === 'lg' ? 'btn-speak-lg' : (size === 'sm' ? 'btn-speak-sm' : '');
  const zh = getUILang() === 'zh';
  const t = String(text || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const r = String(romanization || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const stopProp = opts.stopProp ? 'event.stopPropagation(); ' : '';
  return `
    <span class="speak-group">
      <button class="btn-speak ${sizeClass}" title="${zh ? '正常速度' : 'Normal speed'}"
              onclick="${stopProp}speakFromButton(this, '${t}', '${langCode}', '${r}', 'normal')">🔊</button>
      <button class="btn-speak ${sizeClass} btn-speak-slow" title="${zh ? '慢速' : 'Slow'}"
              onclick="${stopProp}speakFromButton(this, '${t}', '${langCode}', '${r}', 'slow')">🐢</button>
    </span>
  `;
}

// Lightweight toast notification
let _toastTimer = null;
function showToast(message, kind = 'info') {
  let el = document.getElementById('__toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '__toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast toast-${kind} show`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.classList.remove('show'); }, 3000);
}

// ============ UI LANGUAGE ============
function getUILang() {
  return localStorage.getItem('ui_lang') || 'zh';
}

function setUILang(lang) {
  localStorage.setItem('ui_lang', lang);
  applyUILang();
}

function toggleUILang() {
  setUILang(getUILang() === 'zh' ? 'en' : 'zh');
}

function applyUILang() {
  const lang = getUILang();
  document.querySelectorAll('[data-zh]').forEach(el => {
    el.textContent = lang === 'zh' ? el.dataset.zh : el.dataset.en;
  });
  document.querySelectorAll('[data-zh-placeholder]').forEach(el => {
    el.placeholder = lang === 'zh' ? el.dataset.zhPlaceholder : el.dataset.enPlaceholder;
  });
  document.querySelectorAll('.ui-lang-toggle').forEach(b => b.textContent = lang === 'zh' ? 'EN' : '中');
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  if (typeof onUILangChange === 'function') onUILangChange();
}

function initUILang() {
  applyUILang();
}

// ============ NATIVE LANGUAGE PICKER ============
// Shown once on first entry. Sets the user's mother tongue = translation language.
function ensureNativeLanguage() {
  return new Promise((resolve) => {
    if (localStorage.getItem('native_lang_chosen')) {
      resolve();
      return;
    }
    showNativePicker(() => resolve());
  });
}

function showNativePicker(onChoose) {
  if (document.getElementById('native-picker-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'native-picker-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal modal-wide">
      <div style="text-align:center;margin-bottom:1.25rem">
        <div style="font-size:3.2rem;line-height:1">🌏</div>
        <h2 style="margin-top:0.6rem">Welcome · 欢迎</h2>
        <p style="color:var(--text-muted);margin-top:0.4rem;line-height:1.6">
          Choose the language you speak — translations will appear in it.<br>
          请选择您的母语 — 学习时将用它来翻译。
        </p>
      </div>
      <div class="native-options">
        <button class="native-opt" data-lang="zh">
          <span class="native-flag">🇨🇳</span>
          <div class="native-info">
            <div class="native-name">中文</div>
            <div class="native-sub">Chinese · I'll translate to Chinese</div>
          </div>
        </button>
        <button class="native-opt" data-lang="en">
          <span class="native-flag">🇬🇧</span>
          <div class="native-info">
            <div class="native-name">English</div>
            <div class="native-sub">英语 · 我会翻译成英文</div>
          </div>
        </button>
      </div>
      <p style="text-align:center;color:var(--text-muted);font-size:0.85rem;margin-top:1.25rem">
        You can change this anytime from the header.<br>
        稍后可在顶部 EN／中 按钮切换。
      </p>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelectorAll('.native-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      localStorage.setItem('ui_lang', lang);
      localStorage.setItem('native_lang_chosen', '1');
      modal.remove();
      applyUILang();
      if (onChoose) onChoose();
    });
  });
}
