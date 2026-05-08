// 🕵️ Emoji Spot — 找坏人 核心游戏逻辑

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
  finalBest: document.getElementById('finalBest')
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

  $.levelTitle.textContent = `第 ${level} 关`;
  const hints = [
    '找出那个不一样的表情！',
    '注意看，有一个表情跟大家不同！',
    '擦亮眼睛，坏人就藏在这里！',
    '找到混入其中的卧底！'
  ];
  $.levelHint.textContent = hints[Math.floor(Math.random() * hints.length)];
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

// 暴露到全局（供诊断系统调用）
window.startGame = startGame;
window.goBack = goBack;
