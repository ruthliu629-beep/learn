/* Vocab auto-play: step through visible vocab cards, reading each aloud. */

const autoplayState = {
  enabled: false,
  index: 0,
  speed: 'slow',     // 'slow' | 'normal'
  abort: null,
};

function getAutoplayPref() {
  return {
    enabled: false,  // always off at page load (avoid surprise audio)
    speed: localStorage.getItem('autoplay_speed') || 'slow',
  };
}

function setAutoplaySpeed(speed) {
  autoplayState.speed = speed;
  localStorage.setItem('autoplay_speed', speed);
  renderAutoplayControls();
}

function toggleAutoplay() {
  if (autoplayState.enabled) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
}

async function startAutoplay() {
  if (!vocabState || !vocabState.items || vocabState.items.length === 0) return;
  autoplayState.enabled = true;
  autoplayState.index = 0;
  renderAutoplayControls();

  for (let i = 0; i < vocabState.items.length; i++) {
    if (!autoplayState.enabled) break;
    autoplayState.index = i;
    const item = vocabState.items[i];

    // Highlight the active card
    const cards = document.querySelectorAll('.vocab-card');
    cards.forEach(c => c.classList.remove('autoplay-active'));
    const card = cards[i];
    if (card) {
      card.classList.add('autoplay-active');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    await _playAwait(item.word, vocabState.langCode, item.romanization || '', autoplayState.speed);
    if (!autoplayState.enabled) break;

    await _sleep(500);
  }

  document.querySelectorAll('.vocab-card').forEach(c => c.classList.remove('autoplay-active'));
  autoplayState.enabled = false;
  renderAutoplayControls();
}

function stopAutoplay() {
  autoplayState.enabled = false;
  try { speechSynthesis.cancel(); } catch (e) {}
  if (typeof _googleAudio !== 'undefined' && _googleAudio) {
    _googleAudio.pause();
    _googleAudio = null;
  }
  document.querySelectorAll('.vocab-card').forEach(c => c.classList.remove('autoplay-active'));
  renderAutoplayControls();
}

function _playAwait(text, langCode, rom, speed) {
  return new Promise((resolve) => {
    let settled = false;
    const done = () => { if (!settled) { settled = true; resolve(); } };
    const started = speak(text, langCode, {
      romanization: rom || undefined,
      speed,
      onstart: () => {},
      onend: done,
      onerror: done,
    });
    if (!started) setTimeout(done, 1000);
    // Safety timeout: don't hang forever
    setTimeout(done, 15000);
  });
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function renderAutoplayControls() {
  const host = document.getElementById('autoplay-controls');
  if (!host) return;
  const zh = getUILang() === 'zh';
  const playing = autoplayState.enabled;
  const slow = autoplayState.speed === 'slow';

  host.innerHTML = `
    <button class="autoplay-toggle ${playing ? 'playing' : ''}" onclick="toggleAutoplay()"
            title="${zh ? '自动播放所有词语' : 'Auto-play all words'}">
      ${playing
        ? `⏸ ${zh ? '停止' : 'Stop'}`
        : `▶️ ${zh ? '自动播放' : 'Auto-play'}`}
    </button>
    <div class="autoplay-speed-group">
      <span class="autoplay-label">${zh ? '速度' : 'Speed'}:</span>
      <button class="autoplay-speed ${slow ? 'active' : ''}" onclick="setAutoplaySpeed('slow')">
        🐢 ${zh ? '慢' : 'Slow'}
      </button>
      <button class="autoplay-speed ${!slow ? 'active' : ''}" onclick="setAutoplaySpeed('normal')">
        🔊 ${zh ? '正常' : 'Normal'}
      </button>
    </div>
  `;
}

function initAutoplay() {
  const pref = getAutoplayPref();
  autoplayState.speed = pref.speed;
}
