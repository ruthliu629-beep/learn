let quizState = {
  langId: null,
  langCode: null,
  questions: [],
  index: 0,
  score: 0,
  results: [],
  answered: false,
};

async function loadQuiz(langId) {
  quizState.langId = langId;
  quizState.langCode = currentLang.code;
  const panel = document.getElementById('tab-quiz');
  panel.innerHTML = `
    <div class="panel-header">
      <h2>${getUILang() === 'zh' ? '测验' : 'Quiz'}</h2>
    </div>
    <div class="quiz-container">
      <div class="quiz-result">
        <h3>${getUILang() === 'zh' ? '测试你对这门语言的掌握程度' : 'Test your grasp of this language'}</h3>
        <p style="margin:1rem 0;color:var(--text-muted)">
          ${getUILang() === 'zh' ? '25 道随机选择题' : '25 random multiple-choice questions'}
        </p>
        <button class="btn-primary" onclick="startQuiz()">
          ${getUILang() === 'zh' ? '开始测验' : 'Start Quiz'}
        </button>
      </div>
    </div>
  `;
}

async function startQuiz() {
  const panel = document.getElementById('tab-quiz');
  panel.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    quizState.questions = await api.get(`/api/quiz/${quizState.langId}?count=25`);
    quizState.index = 0;
    quizState.score = 0;
    quizState.results = [];
    quizState.answered = false;
    renderQuiz();
  } catch (e) {
    panel.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}

function renderQuiz() {
  const panel = document.getElementById('tab-quiz');
  const lang = getUILang();

  if (quizState.index >= quizState.questions.length) {
    submitQuizResults();
    return;
  }

  const q = quizState.questions[quizState.index];
  const choices = lang === 'zh' ? q.choices_zh : q.choices_en;

  const choicesHtml = choices.map((c, i) =>
    `<button class="quiz-choice" onclick="answerQuiz(${i})" data-idx="${i}">${escapeHtml(c)}</button>`
  ).join('');

  panel.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-header">
        <span>${lang === 'zh' ? '第' : 'Question'} ${quizState.index + 1} / ${quizState.questions.length}</span>
        <span>${lang === 'zh' ? '得分' : 'Score'}: ${quizState.score}</span>
      </div>
      <div class="quiz-question">
        <h3>${lang === 'zh' ? '这个词的意思是？' : 'What does this mean?'}</h3>
        <div class="quiz-word">${escapeHtml(q.word)}</div>
        ${q.romanization ? `<div class="quiz-rom">${escapeHtml(q.romanization)}</div>` : ''}
        <div style="margin-top:1rem">
          ${speakButtonsHTML(q.word, quizState.langCode, q.romanization || '', {})}
        </div>
      </div>
      <div class="quiz-choices">${choicesHtml}</div>
    </div>
  `;
  quizState.answered = false;
}

function answerQuiz(choiceIdx) {
  if (quizState.answered) return;
  quizState.answered = true;

  const q = quizState.questions[quizState.index];
  const lang = getUILang();
  const correctIdx = lang === 'zh' ? q.correct_index_zh : q.correct_index_en;
  const correct = choiceIdx === correctIdx;
  if (correct) quizState.score++;
  quizState.results.push({ vocab_id: q.id, correct });

  const buttons = document.querySelectorAll('.quiz-choice');
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === correctIdx) b.classList.add('correct');
    else if (i === choiceIdx) b.classList.add('wrong');
  });

  setTimeout(() => {
    quizState.index++;
    renderQuiz();
  }, 1200);
}

async function submitQuizResults() {
  const panel = document.getElementById('tab-quiz');
  const lang = getUILang();
  const percent = Math.round((quizState.score / quizState.questions.length) * 100);

  try {
    await api.post('/api/quiz/submit', {
      language_id: quizState.langId,
      score: quizState.score,
      total: quizState.questions.length,
      results: quizState.results,
    });
  } catch (e) {
    console.warn('Quiz submit failed:', e.message);
  }

  const emoji = percent >= 80 ? '🏆' : percent >= 60 ? '👍' : '💪';
  const msg = lang === 'zh'
    ? (percent >= 80 ? '太棒了！' : percent >= 60 ? '不错哦！' : '继续加油！')
    : (percent >= 80 ? 'Excellent!' : percent >= 60 ? 'Well done!' : 'Keep practicing!');

  panel.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-result">
        <div style="font-size:4rem">${emoji}</div>
        <h2>${msg}</h2>
        <div class="quiz-score">${quizState.score} / ${quizState.questions.length}</div>
        <p style="color:var(--text-muted);margin-bottom:1.5rem">${percent}%</p>
        <button class="btn-primary" onclick="startQuiz()">
          ${lang === 'zh' ? '再来一次' : 'Try again'}
        </button>
      </div>
    </div>
  `;
}
