// 🕵️ Emoji Spot — 找坏人 核心游戏逻辑

// ========== i18n 翻译 ==========
let currentLang = 'zh';

function applyTranslations(lang) {
  currentLang = lang;
  const isEn = lang === 'en';
  const T = {
    zh: {
      title: '🕵️ 找坏人',
      subtitle: '在一堆表情中找出唯一的不同\n从 2×2 到 10×10，考验你的眼力！',
      startGame: '▶️ 开始游戏',
      backToArcade: '🏠 回到街机厅',
      gamePaused: '⏸️ 游戏暂停',
      pauseSubtitle: '休息一下，或者重来',
      resume: '▶️ 继续游戏',
      restart: '🔄 重新开始',
      pauseHint: '按 ESC 键也可以继续游戏',
      gameOver: '💀 游戏结束',
      levelLabel: '关卡',
      scoreLabel: '得分',
      timeLabel: '时间',
      accuracyLabel: '准确率',
      bestLabel: '最高分',
      restartGame: '🔄 再来一局',
      levelTitle: '第 {level} 关',
      levelHint: '找出那个不一样的表情！',
      levelHints: [
        '找出那个不一样的表情！',
        '注意看，有一个表情跟大家不同！',
        '擦亮眼睛，坏人就藏在这里！',
        '找到混入其中的卧底！'
      ]
    },
    en: {
      title: '🕵️ Find the Odd One',
      subtitle: 'Spot the one different emoji\nFrom 2×2 to 10×10, test your eyes!',
      startGame: '▶️ Start Game',
      backToArcade: '🏠 Back to Arcade',
      gamePaused: '⏸️ Game Paused',
      pauseSubtitle: 'Take a break, or restart',
      resume: '▶️ Resume',
      restart: '🔄 Restart',
      pauseHint: 'Press ESC to resume',
      gameOver: '💀 Game Over',
      levelLabel: 'Level',
      scoreLabel: 'Score',
      timeLabel: 'Time',
      accuracyLabel: 'Accuracy',
      bestLabel: 'Best',
      restartGame: '🔄 Play Again',
      levelTitle: 'Level {level}',
      levelHint: 'Find the emoji that\'s different!',
      levelHints: [
        'Find the emoji that\'s different!',
        'Look closely, one emoji is not like the others!',
        'Keep your eyes sharp, the bad guy is hiding here!',
        'Spot the impostor among them!'
      ]
    }
  };

  const dict = isEn ? T.en : T.zh;

  // 翻译 data-i18n 元素
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else {
        // 处理可能包含换行的文本
        el.innerHTML = dict[key].replace(/\n/g, '<br>');
      }
    }
  });

  // 更新标题
  document.title = isEn ? 'Find the Odd One' : '找坏人';

  // 更新 html lang
  if (typeof GameI18n !== 'undefined') {
    GameI18n.setHtmlLang(lang);
  }
}

// ========== Emoji 差异素材池 ==========
const EMOJI_POOLS = {
  easy: [      // Lv 1-3: 完全不同
    ['🍎','🍊'],['🐱','🐶'],['🌸','🌺'],['😀','😃'],
    ['👍','👎'],['🔴','🔵'],['🌞','🌝'],['🍕','🍔']
  ],
  medium: [    // Lv 4-7: 同类不同个体
    ['😀','😁'],['😂','🤣'],['😍','🥰'],['😎','🤓'],
    ['🐱','🐈'],['🐯','🐅'],['🐶','🐕'],['🌹','🥀'],
    ['🍎','🍏'],['🍊','🍋'],['🍇','🍓'],['🥕','🌽']
  ],
  hard: [      // Lv 8-12: 肤色/细微变体
    ['👩','👩🏻'],['👨','👨🏻'],['🧑','🧑🏻'],['👧','👧🏻'],
    ['👦','👦🏻'],['👴','👴🏻'],['👵','👵🏻'],['🧓','🧓🏻'],
    ['👀','👁️'],['✋','🤚'],['👆','👇'],['👈','👉']
  ],
  hell: [      // Lv 13+: 视觉极其接近
    ['🔴','🟠'],['🟢','🟩'],['🔵','🟦'],['🟡','🟨'],
    ['❤️','🧡'],['💛','💚'],['💙','💜'],['🤍','🩶']
  ]
};

function getPairForLevel(level) {
  let pool;
  if (level <= 3) pool = EMOJI_POOLS.easy;
  else if (level <= 7) pool = EMOJI_POOLS.medium;
  else if (level <= 12) pool = EMOJI_POOLS.hard;
  else pool = EMOJI_POOLS.hell;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getGridSize(level) {
  if (level <= 2) return 2;
  if (level <= 4) return 3;
  if (level <= 6) return 4;
  if (level <= 8) return 5;
  if (level <= 10) return 6;
  if (level <= 12) return 7;
  if (level <= 14) return 8;
  return Math.min(10, 8 + Math.floor((level - 14) / 2));
}

function getTimeForLevel(level) {
  return Math.max(15, 45 - level * 2);
}

// ========== 状态 ==========
let state = {
  level: 1,
  score: 0,
  timeLeft: 30,
  totalTime: 0,
  totalClicks: 0,
  correctClicks: 0,
  wrongClicks: 0,
  streak: 0,
  maxStreak: 0,
  gameState: 'start',
  badGuyIndex: 0,
  gridSize: 2,
  emojiBase: '',
  emojiBad: '',
  timerInterval: null,
  bestScore: parseInt(localStorage.getItem('emojiSpot_bestScore') || '0'),
  bestLevel: parseInt(localStorage.getItem('emojiSpot_bestLevel') || '0')
};

const $ = {
  gridContainer: document.getElementById('gridContainer'),
  levelDisplay: document.getElementById('levelDisplay'),
  scoreDisplay: document.getElementById('scoreDisplay'),
  timeDisplay: document.getElementById('timeDisplay'),
  timerFill: document.getElementById('timerFill'),
  levelTitle: document.getElementById('levelTitle'),
  levelHint: document.getElementById('levelHint'),
  startScreen: document.getElementById('startScreen'),
  gameOverScreen: document.getElementById('gameOverScreen'),
  finalLevel: document.getElementById('finalLevel'),
  finalScore: document.getElementById('finalScore'),
  finalAccuracy: document.getElementById('finalAccuracy'),
  pauseScreen: document.getElementById('pauseScreen'),
  resumeBtn: document.getElementById('resumeBtn'),
  restartFromPauseBtn: document.getElementById('restartFromPauseBtn'),
};

// ========== 核心逻辑 ==========
function startGame() {
  state = {
    level: 1, score: 0, timeLeft: 30, totalTime: 0,
    totalClicks: 0, correctClicks: 0, wrongClicks: 0,
    streak: 0, maxStreak: 0,
    gameState: 'playing',
    badGuyIndex: 0, gridSize: 2,
    emojiBase: '', emojiBad: '',
    timerInterval: null,
    bestScore: parseInt(localStorage.getItem('emojiSpot_bestScore') || '0'),
    bestLevel: parseInt(localStorage.getItem('emojiSpot_bestLevel') || '0')
  };

  $.startScreen.classList.add('hidden');
  $.gameOverScreen.classList.add('hidden');
  $.pauseScreen.classList.add('hidden');
  if (typeof SpotDiagnosis !== 'undefined') SpotDiagnosis.hide();

  loadLevel(1);
  startTimer();
}

function loadLevel(level) {
  state.level = level;
  state.gridSize = getGridSize(level);
  state.timeLeft = getTimeForLevel(level);

  const pair = getPairForLevel(level);
  state.emojiBase = pair[0];
  state.emojiBad = pair[1];

  const totalCells = state.gridSize * state.gridSize;
  state.badGuyIndex = Math.floor(Math.random() * totalCells);

  renderGrid();
  updateHUD();

  // 翻译关卡标题和提示
  const isEn = currentLang === 'en';
  const T = isEn ? {
    levelTitle: 'Level {level}',
    levelHints: [
      'Find the emoji that\'s different!',
      'Look closely, one emoji is not like the others!',
      'Keep your eyes sharp, the bad guy is hiding here!',
      'Spot the impostor among them!'
    ]
  } : {
    levelTitle: '第 {level} 关',
    levelHints: [
      '找出那个不一样的表情！',
      '注意看，有一个表情跟大家不同！',
      '擦亮眼睛，坏人就藏在这里！',
      '找到混入其中的卧底！'
    ]
  };
  $.levelTitle.textContent = T.levelTitle.replace('{level}', level);
  $.levelHint.textContent = T.levelHints[Math.floor(Math.random() * T.levelHints.length)];
}

function renderGrid() {
  $.gridContainer.innerHTML = '';
  $.gridContainer.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;

  const totalCells = state.gridSize * state.gridSize;
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.textContent = (i === state.badGuyIndex) ? state.emojiBad : state.emojiBase;
    cell.dataset.index = i;
    cell.addEventListener('click', () => onCellClick(i, cell));
    $.gridContainer.appendChild(cell);
  }
}

function onCellClick(index, cellEl) {
  if (state.gameState !== 'playing') return;

  state.totalClicks++;

  if (index === state.badGuyIndex) {
    // 找对！
    state.correctClicks++;
    state.streak++;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;

    cellEl.classList.add('correct');

    // 得分
    const baseScore = state.level * 100;
    const timeBonus = Math.floor(state.timeLeft * 10);
    const streakBonus = state.streak * 50;
    state.score += baseScore + timeBonus + streakBonus;

    // 短暂延迟后进入下一关
    setTimeout(() => {
      loadLevel(state.level + 1);
    }, 400);
  } else {
    // 点错！
    state.wrongClicks++;
    state.streak = 0;
    state.timeLeft = Math.max(0, state.timeLeft - 3);
    cellEl.classList.add('wrong');
    setTimeout(() => cellEl.classList.remove('wrong'), 400);

    if (state.timeLeft <= 0) {
      gameOver();
    }
  }

  updateHUD();
}

// ========== 计时器 ==========
function startTimer() {
  stopTimer();
  const maxTime = getTimeForLevel(state.level);
  state.timerInterval = setInterval(() => {
    if (state.gameState !== 'playing') return;
    state.timeLeft -= 0.1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      gameOver();
    }
    updateHUD();
  }, 100);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

// ========== 游戏结束 ==========
function gameOver() {
  if (state.gameState === 'gameover') return;
  state.gameState = 'gameover';
  stopTimer();

  // 保存记录
  try {
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      localStorage.setItem('emojiSpot_bestScore', state.bestScore);
    }
    if (state.level > state.bestLevel) {
      state.bestLevel = state.level;
      localStorage.setItem('emojiSpot_bestLevel', state.bestLevel);
    }
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }

  // 显示诊断报告
  if (typeof SpotDiagnosis !== 'undefined') {
    const accuracy = state.totalClicks > 0 ? (state.correctClicks / state.totalClicks * 100) : 0;
    const stats = {
      score: state.score,
      level: state.level,
      maxStreak: state.maxStreak,
      totalClicks: state.totalClicks,
      correctClicks: state.correctClicks,
      wrongClicks: state.wrongClicks,
      accuracy: accuracy.toFixed(1),
      bestScore: state.bestScore,
      bestLevel: state.bestLevel
    };
    SpotDiagnosis.show(stats);
  } else {
    // fallback
    const accuracy = state.totalClicks > 0 ? (state.correctClicks / state.totalClicks * 100) : 0;
    $.finalLevel.textContent = state.level;
    $.finalScore.textContent = state.score;
    $.finalAccuracy.textContent = accuracy.toFixed(1) + '%';
    $.finalBest.textContent = state.bestScore;
    $.gameOverScreen.classList.remove('hidden');
  }
}

// ========== 暂停 ==========
function pauseGame() {
  if (state.gameState !== 'playing') return;
  state.gameState = 'paused';
  stopTimer();
  $.pauseScreen.classList.remove('hidden');
}

function resumeGame() {
  if (state.gameState !== 'paused') return;
  state.gameState = 'playing';
  $.pauseScreen.classList.add('hidden');
  startTimer();
}

// ========== HUD ==========
function updateHUD() {
  $.levelDisplay.textContent = state.level;
  $.scoreDisplay.textContent = state.score;
  $.timeDisplay.textContent = Math.ceil(state.timeLeft);

  const maxTime = getTimeForLevel(state.level);
  const pct = Math.max(0, (state.timeLeft / maxTime) * 100);
  $.timerFill.style.width = pct + '%';
}

// ========== 通用 ==========
function goBack() {
  window.location.href = '../../index.html';
}

// 事件绑定
$.resumeBtn.addEventListener('click', resumeGame);
$.restartFromPauseBtn.addEventListener('click', () => {
  $.pauseScreen.classList.add('hidden');
  startGame();
});

// 初始化：检测语言并应用翻译
window.addEventListener('DOMContentLoaded', () => {
  let lang = 'zh';
  if (typeof GameI18n !== 'undefined') {
    lang = GameI18n.detectLang();
  }
  applyTranslations(lang);
});

// ESC 暂停
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    if (state.gameState === 'playing') pauseGame();
    else if (state.gameState === 'paused') resumeGame();
  }
});

// 暴露到全局（供诊断系统调用）
window.startGame = startGame;
window.goBack = goBack;
