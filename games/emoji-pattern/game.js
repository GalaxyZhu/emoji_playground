/** Emoji Pattern (Emoji劲舞团) - 核心游戏逻辑 */
(function() {
'use strict';

// ===================== 主题池 =====================
const THEMES = [
  { name: 'fruits',    emojis: ['🍎','🍌','🍇','🍊','🍓','🍉','🍒','🍑'] },
  { name: 'faces',     emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂'] },
  { name: 'red',       emojis: ['🍎','🍅','🌶️','🍓','🍒','🍉','🌹','💋'] },
  { name: 'animals',   emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼'] },
  { name: 'transport', emojis: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑'] },
  { name: 'mixed',     emojis: ['🍎','🍌','🍇','😀','😃','🐶','🐱','🚗','🚕','🍅','🌶️','🍓','🐭','🐹','🦊','🐻'] }
];

// ===================== 关卡配置 =====================
function getLevelConfig(level) {
  const presets = {
    1: { grid: 3, phases: 3, time: 15, distractors: 0 },
    2: { grid: 4, phases: 4, time: 15, distractors: 1 },
    3: { grid: 4, phases: 5, time: 15, distractors: 2 },
    4: { grid: 5, phases: 5, time: 15, distractors: 2 },
    5: { grid: 5, phases: 6, time: 15, distractors: 3 },
  };

  if (presets[level]) return presets[level];

  // 6+ 动态配置
  const grid = Math.min(8, 5 + Math.floor((level - 6) / 2));
  const phases = Math.min(10, 5 + Math.floor((level - 3) / 2));
  const distractors = Math.min(grid * grid - phases, 4 + Math.floor((level - 6) / 2));
  return {
    grid,
    phases,
    time: 15,
    distractors
  };
}

// ===================== 音频 =====================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, dur, type = 'sine', vol = 0.15) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
}

function playCorrect()   { ensureAudio(); playTone(880, 0.1, 'sine', 0.12); }
function playPhaseDone() { ensureAudio(); playTone(1320, 0.2, 'sine', 0.15); setTimeout(() => playTone(1760, 0.25, 'sine', 0.12), 120); }
function playWrong()     { ensureAudio(); playTone(220, 0.3, 'sawtooth', 0.1); }
function playLevelDone() {
  ensureAudio();
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 'sine', 0.12), i * 150));
}
function playGameOver() {
  ensureAudio();
  [440, 330, 220].forEach((f, i) => setTimeout(() => playTone(f, 0.4, 'sawtooth', 0.1), i * 250));
}

// ===================== 游戏状态 =====================
const state = {
  level: 1,
  score: 0,
  combo: 0,
  maxCombo: 0,
  timeLeft: 15,
  phase: 0,           // 当前序列阶段（0-based）
  sequence: [],       // 目标序列
  matrix: [],         // 当前矩阵 [{emoji, id, eliminated, row, col}]
  phaseStartTime: 0,
  totalErrors: 0,
  consecutiveErrors: 0,
  totalClicks: 0,
  correctClicks: 0,
  wrongClicks: 0,
  totalTimeSpent: 0,
  levelStartTime: 0,
  gameState: 'idle',   // idle | playing | paused | gameover | leveldone
  timerInterval: null,
  animFrame: null,
  bestScore: parseInt(localStorage.getItem('emojiPattern_bestScore') || '0', 10),
  bestLevel: parseInt(localStorage.getItem('emojiPattern_bestLevel') || '0', 10),
};

// ===================== DOM 引用 =====================
let $ = {};
function cacheDOM() {
  $ = {
    startScreen: document.getElementById('startScreen'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    pauseScreen: document.getElementById('pauseScreen'),
    levelDoneScreen: document.getElementById('levelDoneScreen'),
    gameBoard: document.getElementById('gameBoard'),
    sequenceBar: document.getElementById('sequenceBar'),
    timerDisplay: document.getElementById('timerDisplay'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    comboDisplay: document.getElementById('comboDisplay'),
    levelDisplay: document.getElementById('levelDisplay'),
    finalScore: document.getElementById('finalScore'),
    finalLevel: document.getElementById('finalLevel'),
    bestScoreDisplay: document.getElementById('bestScoreDisplay'),
    starRating: document.getElementById('starRating'),
    flashOverlay: document.getElementById('flashOverlay'),
    phaseLabel: document.getElementById('phaseLabel'),
    errorCount: document.getElementById('errorCount'),
  };
}

// ===================== 工具函数 =====================
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function getComboMultiplier(combo) {
  if (combo >= 20) return 3.0;
  if (combo >= 10) return 2.0;
  if (combo >= 5)  return 1.5;
  return 1.0;
}

// ===================== 矩阵生成 =====================
function generateLevel(level) {
  const cfg = getLevelConfig(level);
  const themeIdx = Math.min(Math.floor((level - 1) / 3), THEMES.length - 1);
  const theme = THEMES[themeIdx];
  const pool = theme.emojis;

  // 生成有序序列（允许重复）
  const seqEmojis = [];
  for (let i = 0; i < cfg.phases; i++) {
    seqEmojis.push(pool[randInt(0, pool.length - 1)]);
  }

  // 统计每种emoji在序列中出现的次数
  const seqCounts = {};
  seqEmojis.forEach(e => { seqCounts[e] = (seqCounts[e] || 0) + 1; });

  // 矩阵总格子数
  const totalCells = cfg.grid * cfg.grid;

  // 先放置序列需要的emoji（确保数量足够）
  let cells = [];
  Object.entries(seqCounts).forEach(([emoji, count]) => {
    for (let i = 0; i < count; i++) {
      cells.push({ emoji, isTarget: true });
    }
  });

  // 填充干扰项（非序列emoji优先）
  const seqSet = new Set(seqEmojis);
  const distractorPool = theme.emojis.filter(e => !seqSet.has(e));
  if (distractorPool.length > 0) {
    for (let i = 0; i < cfg.distractors; i++) {
      const de = distractorPool[randInt(0, distractorPool.length - 1)];
      cells.push({ emoji: de, isTarget: false });
    }
  }

  // 剩余空位用随机emoji填充
  const emptySlots = totalCells - cells.length;
  for (let i = 0; i < emptySlots; i++) {
    const fe = pool[randInt(0, pool.length - 1)];
    cells.push({ emoji: fe, isTarget: false });
  }

  cells = shuffle(cells);

  // 赋予行列和ID
  const matrix = cells.map((c, i) => ({
    ...c,
    id: `cell-${level}-${i}`,
    row: Math.floor(i / cfg.grid),
    col: i % cfg.grid,
    eliminated: false,
  }));

  return { cfg, seqEmojis, matrix };
}

// ===================== 渲染 =====================
function renderSequence() {
  const container = $.sequenceBar;
  container.innerHTML = '';

  state.sequence.forEach((emoji, idx) => {
    const el = document.createElement('div');
    el.className = 'seq-item';
    el.textContent = emoji;
    if (idx < state.phase) el.classList.add('done');
    if (idx === state.phase) el.classList.add('active');
    container.appendChild(el);
  });
}

function renderMatrix() {
  const board = $.gameBoard;
  board.innerHTML = '';

  const cfg = state.currentLevelCfg;
  board.style.gridTemplateColumns = `repeat(${cfg.grid}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${cfg.grid}, minmax(36px, 1fr))`;

  state.matrix.forEach(cell => {
    const el = document.createElement('div');
    el.className = 'matrix-cell';
    el.dataset.id = cell.id;
    el.textContent = cell.emoji;

    if (cell.eliminated) {
      el.classList.add('eliminated');
      el.style.visibility = 'hidden';
    }

    el.addEventListener('click', () => onCellClick(cell, el));
    el.addEventListener('touchstart', (e) => { e.preventDefault(); onCellClick(cell, el); }, { passive: false });

    board.appendChild(el);
  });

  // 根据grid大小调整字体
  const sizeMap = { 3: '42px', 4: '36px', 5: '32px', 6: '28px', 7: '24px', 8: '22px' };
  board.style.fontSize = sizeMap[cfg.grid] || '28px';
}

function renderHUD() {
  $.timerDisplay.textContent = Math.ceil(state.timeLeft);
  $.scoreDisplay.textContent = state.score;
  $.comboDisplay.textContent = state.combo > 0 ? `×${state.combo}` : '';
  $.levelDisplay.textContent = state.level;
  $.phaseLabel.textContent = `${state.phase + 1} / ${state.sequence.length}`;
  $.errorCount.textContent = `${state.consecutiveErrors} / 3`;
}

// ===================== 动画 =====================
function animateCorrect(el) {
  el.classList.add('anim-correct');
  setTimeout(() => {
    el.classList.remove('anim-correct');
    el.style.visibility = 'hidden';
  }, 300);
}

function animateWrong(el) {
  el.classList.add('anim-shake');
  $.flashOverlay.classList.add('flash-red');
  setTimeout(() => {
    el.classList.remove('anim-shake');
    $.flashOverlay.classList.remove('flash-red');
  }, 400);
}

function animatePhaseDone(emoji) {
  // 找到当前阶段所有该emoji的已消除格子，做飞出效果
  const cells = document.querySelectorAll('.matrix-cell');
  cells.forEach(el => {
    if (el.textContent === emoji && el.style.visibility === 'hidden') {
      // 已经隐藏了，给相邻的非隐藏格子加庆祝效果
    }
  });

  // 给序列栏当前项做飞出
  const seqItems = $.sequenceBar.querySelectorAll('.seq-item');
  const active = seqItems[state.phase];
  if (active) {
    active.classList.add('anim-flyout');
    setTimeout(() => active.classList.remove('anim-flyout'), 500);
  }
}

function animateLevelDone() {
  const cells = document.querySelectorAll('.matrix-cell');
  cells.forEach((el, i) => {
    if (!el.classList.contains('eliminated')) {
      setTimeout(() => el.classList.add('anim-flyout'), i * 30);
    }
  });
}

// ===================== 点击处理 =====================
function onCellClick(cell, el) {
  if (state.gameState !== 'playing') return;
  if (cell.eliminated) return;

  state.totalClicks++;
  const targetEmoji = state.sequence[state.phase];

  if (cell.emoji === targetEmoji) {
    // 正确点击 — 直接进入下一阶段
    state.correctClicks++;
    cell.eliminated = true;
    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;

    const mult = getComboMultiplier(state.combo);
    const pts = Math.floor(50 * mult);
    state.score += pts;
    state.consecutiveErrors = 0;

    playCorrect();
    animateCorrect(el);
    renderHUD();

    state.phase++;

    if (state.phase >= state.sequence.length) {
      // 关卡完成
      setTimeout(() => levelComplete(), 300);
    } else {
      // 下一阶段
      state.phaseStartTime = Date.now();
      setTimeout(() => {
        renderSequence();
        renderHUD();
      }, 200);
    }
  } else {
    // 错误点击
    state.wrongClicks++;
    state.totalErrors++;
    state.combo = 0;
    state.consecutiveErrors++;
    state.timeLeft -= 2;
    if (state.timeLeft < 0) state.timeLeft = 0;

    playWrong();
    animateWrong(el);
    renderHUD();

    if (state.consecutiveErrors >= 3) {
      setTimeout(() => gameOver(), 400);
    }
  }
}

// ===================== 关卡 / 游戏流程 =====================
function startGame() {
  state.level = 1;
  state.score = 0;
  state.combo = 0;
  state.maxCombo = 0;
  state.totalClicks = 0;
  state.correctClicks = 0;
  state.wrongClicks = 0;
  state.totalErrors = 0;
  state.totalTimeSpent = 0;
  state.gameState = 'playing';

  loadLevel(1);

  $.startScreen.classList.add('hidden');
  $.gameOverScreen.classList.add('hidden');
  $.pauseScreen.classList.add('hidden');
  $.levelDoneScreen.classList.add('hidden');

  startTimer();
}

function loadLevel(level) {
  const data = generateLevel(level);
  state.currentLevelCfg = data.cfg;
  state.sequence = data.seqEmojis;
  state.matrix = data.matrix;
  state.phase = 0;
  state.timeLeft = data.cfg.time;
  state.phaseStartTime = Date.now();
  state.consecutiveErrors = 0;
  state.levelStartTime = Date.now();

  renderSequence();
  renderMatrix();
  renderHUD();
}

function levelComplete() {
  state.gameState = 'leveldone';
  stopTimer();

  // 累加本关用时
  state.totalTimeSpent += (Date.now() - state.levelStartTime) / 1000;

  // 过关奖励
  state.score += 500 * state.level;

  playLevelDone();
  animateLevelDone();

  // 保存记录（容错处理）
  try {
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      localStorage.setItem('emojiPattern_bestScore', state.bestScore);
    }
    if (state.level > state.bestLevel) {
      state.bestLevel = state.level;
      localStorage.setItem('emojiPattern_bestLevel', state.bestLevel);
    }
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }

  // 短暂延迟让玩家看到飞走动画，然后直接进入下一关
  setTimeout(() => {
    state.level++;
    state.gameState = 'playing';
    loadLevel(state.level);
    startTimer();
  }, 600);
}

function gameOver() {
  if (state.gameState === 'gameover') return;
  state.gameState = 'gameover';
  stopTimer();
  playGameOver();

  // 累加最后一关用时（如果还没到 levelComplete）
  if (state.levelStartTime) {
    state.totalTimeSpent += (Date.now() - state.levelStartTime) / 1000;
  }

  // 保存记录
  try {
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      localStorage.setItem('emojiPattern_bestScore', state.bestScore);
    }
    if (state.level > state.bestLevel) {
      state.bestLevel = state.level;
      localStorage.setItem('emojiPattern_bestLevel', state.bestLevel);
    }
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }

  // 显示诊断报告
  if (typeof PatternDiagnosis !== 'undefined') {
    const stats = {
      score: state.score,
      level: state.level,
      maxCombo: state.maxCombo,
      totalClicks: state.totalClicks,
      correctClicks: state.correctClicks,
      wrongClicks: state.wrongClicks,
      totalErrors: state.totalErrors,
      totalTimeSpent: state.totalTimeSpent,
      highScore: state.bestScore,
      highLevel: state.bestLevel,
      bestScore: state.bestScore,
      bestLevel: state.bestLevel,
    };
    PatternDiagnosis.show(stats);
  } else {
    // fallback: 显示传统 gameover 画面
    $.finalScore.textContent = state.score;
    $.finalLevel.textContent = state.level;
    $.bestScoreDisplay.textContent = state.bestScore;
    $.gameOverScreen.classList.remove('hidden');
  }
}

// ===================== 计时器 =====================
function startTimer() {
  stopTimer();
  let lastTick = Date.now();
  state.timerInterval = setInterval(() => {
    if (state.gameState !== 'playing') return;
    const now = Date.now();
    const dt = (now - lastTick) / 1000;
    lastTick = now;

    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      gameOver();
    }
    renderHUD();
  }, 100);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

// ===================== 暂停 =====================
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

// ===================== 键盘 / 事件 =====================
function bindEvents() {
  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('restartBtn').addEventListener('click', startGame);
  document.getElementById('resumeBtn').addEventListener('click', resumeGame);
  document.getElementById('restartFromPauseBtn').addEventListener('click', () => {
    $.pauseScreen.classList.add('hidden');
    startGame();
  });

  // 回到街机厅按钮
  document.querySelectorAll('.back-arcade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = '../../index.html';
    });
  });

  // ESC 暂停
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (state.gameState === 'playing') pauseGame();
      else if (state.gameState === 'paused') resumeGame();
    }
  });
}

// ===================== 初始化 =====================
window.addEventListener('DOMContentLoaded', () => {
  cacheDOM();
  bindEvents();

  // 应用翻译
  if (typeof GameI18n !== 'undefined') {
    const lang = GameI18n.detectLang();
    GameI18n.setHtmlLang(lang);
    applyTranslations(lang);
  }
});

// ===================== i18n 翻译 =====================
function applyTranslations(lang) {
  const isEn = lang === 'en';
  const T = {
    zh: {
      title: '眼疾手快',
      subtitle: '按顺序消灭Emoji，挑战你的眼力和手速！',
      startGame: '▶️ 开始游戏',
      backToArcade: '🏠 回到街机厅',
      gamePaused: '⏸️ 游戏暂停',
      resume: '▶️ 继续游戏',
      restart: '🔄 重新开始',
      pauseHint: '按 ESC 键也可以继续游戏',
      gameOver: '💀 游戏结束',
      scoreLabel: '得分',
      levelLabel: '关卡',
      bestLabel: '历史最高',
      restartGame: '🔄 再玩一次',
      levelComplete: '🎉 关卡完成！',
      nextLevel: '➡️ 马上进入下一关...',
      timeLeft: '剩余时间',
      currentTarget: '当前目标',
      combo: '连击',
      errors: '失误',
      instructions: '顶部显示目标Emoji序列（允许重复）<br>按序列顺序，逐个点击匹配的Emoji<br>消灭完整条序列 = 过关<br>连续3次错误 → 游戏结束',
      howToPlay: '玩法说明',
      levelDoneTitle: '🎉 关卡完成！',
      levelDoneScore: '得分',
      levelDoneTime: '剩余时间',
      levelDoneCombo: '最高连击',
      levelDoneNext: '马上进入下一关...',
    },
    en: {
      title: 'Emoji Pattern',
      subtitle: 'Eliminate emojis in order. Test your eyes and speed!',
      startGame: '▶️ Start Game',
      backToArcade: '🏠 Back to Arcade',
      gamePaused: '⏸️ Game Paused',
      resume: '▶️ Resume',
      restart: '🔄 Restart',
      pauseHint: 'Press ESC to resume',
      gameOver: '💀 Game Over',
      scoreLabel: 'Score',
      levelLabel: 'Level',
      bestLabel: 'Best',
      restartGame: '🔄 Play Again',
      levelComplete: '🎉 Level Complete!',
      nextLevel: '➡️ Next Level Soon...',
      timeLeft: 'Time Left',
      currentTarget: 'Target',
      combo: 'Combo',
      errors: 'Errors',
      instructions: 'Target sequence shown at top (repeats allowed)<br>Tap matching emojis ONE BY ONE in order<br>Clear the whole sequence to pass<br>3 consecutive errors = Game Over',
      howToPlay: 'How to Play',
      levelDoneTitle: '🎉 Level Complete!',
      levelDoneScore: 'Score',
      levelDoneTime: 'Time Left',
      levelDoneCombo: 'Max Combo',
      levelDoneNext: 'Next Level Soon...',
    }
  };

  const dict = isEn ? T.en : T.zh;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else {
        el.innerHTML = dict[key];
      }
    }
  });

  document.title = isEn ? 'Emoji Pattern' : '眼疾手快';
}

// 暴露关键函数到全局，供诊断系统调用
window.startGame = startGame;

})();
