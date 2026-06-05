// ♟ Chess Horde — 棋阵守卫战 核心游戏逻辑

// ========== i18n 翻译 ==========
let currentLang = 'zh';

function applyTranslations(lang) {
  currentLang = lang;
  const isEn = lang === 'en';
  const T = {
    zh: {
      title: '♟ 棋阵守卫战',
      subtitle: '经典棋阵 vs 无尽尸潮\n移动棋子，吃掉敌人，赚取金币，购买新兵！',
      startGame: '▶️ 开始战斗',
      backToArcade: '🏠 回到街机厅',
      gameOver: '💀 防线崩溃',
      gameOverSub: '你的王倒下了，或时间耗尽',
      waveTitle: '第 {wave} 波',
      score: '得分',
      gold: '金币',
      best: '最高',
      wave: '波次',
      time: '时间',
      combo: '连击',
      comboBreak: '连击中断！',
      checkWarning: '⚠️ 王被将军！下一回合必须解除！',
      buySuccess: '已购买 {piece}！',
      buyFail: '金币不足！',
      shopFull: '底线已满，无法购买！',
      shopCooldown: '冷却中...',
      bossWave: '👑 BOSS 波次！',
      waveClear: '✨ 波次清场！',
      kingCaptured: '王被吃掉了！',
      timeUp: '时间耗尽！',
      pauseTitle: '⏸️ 游戏暂停',
      resume: '▶️ 继续',
      restart: '🔄 重新开始',
      howToPlay: '玩法说明',
      instructions: '标准国际象棋走法\n每回合移动1个棋子吃掉敌人\n吃子获得金币，可在商店买新棋子\n王被将军必须解除，否则失败\n敌人每回合自动向下移动',
      shopPawn: '兵',
      shopKnight: '马',
      shopBishop: '相',
      shopRook: '车',
      shopQueen: '后',
      price: '价格',
      cd: 'CD',
      turns: '回合',
      playAgain: '🔄 再来一局',
    },
    en: {
      title: '♟ Chess Horde',
      subtitle: 'Classic Chess vs Endless Horde\nMove, capture, earn gold, buy reinforcements!',
      startGame: '▶️ Start Battle',
      backToArcade: '🏠 Back to Arcade',
      gameOver: '💀 Line Broken',
      gameOverSub: 'Your King fell or time ran out',
      waveTitle: 'Wave {wave}',
      score: 'Score',
      gold: 'Gold',
      best: 'Best',
      wave: 'Wave',
      time: 'Time',
      combo: 'Combo',
      comboBreak: 'Combo broken!',
      checkWarning: '⚠️ King in check! Must escape next turn!',
      buySuccess: 'Bought {piece}!',
      buyFail: 'Not enough gold!',
      shopFull: 'Base line full!',
      shopCooldown: 'Cooldown...',
      bossWave: '👑 BOSS WAVE!',
      waveClear: '✨ Wave cleared!',
      kingCaptured: 'King captured!',
      timeUp: 'Time ran out!',
      pauseTitle: '⏸️ Paused',
      resume: '▶️ Resume',
      restart: '🔄 Restart',
      howToPlay: 'How to Play',
      instructions: 'Standard chess moves\nMove 1 piece per turn to capture enemies\nEarn gold per capture, buy reinforcements\nKing in check must escape, or lose\nEnemies move down every turn',
      shopPawn: 'Pawn',
      shopKnight: 'Knight',
      shopBishop: 'Bishop',
      shopRook: 'Rook',
      shopQueen: 'Queen',
      price: 'Cost',
      cd: 'CD',
      turns: 'turns',
      playAgain: '🔄 Play Again',
    }
  };
  const dict = isEn ? T.en : T.zh;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  return dict;
}

const T = applyTranslations(currentLang);

// ========== 常量 ==========
const BOARD_SIZE = 8;
const TURN_TIME = 15;

const PLAYER_EMOJI = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' };
const ENEMY_EMOJI = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };

const PIECE_VALUES = { P: 10, N: 25, B: 25, R: 40, Q: 80, K: 200 };
const SHOP_PRICES = { P: 30, N: 60, B: 60, R: 100, Q: 180 };
const SHOP_COOLDOWNS = { P: 2, N: 3, B: 3, R: 4, Q: 5 };

const PIECE_NAMES = { P: '兵', N: '马', B: '相', R: '车', Q: '后', K: '王' };
const PIECE_NAMES_EN = { P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King' };

// ========== 状态 ==========
let board = [];
let selected = null;
let validMoves = [];
let validCaptures = [];
let gameState = 'menu'; // menu, playing, paused, gameover
let wave = 1;
let gold = 0;
let score = 0;
let bestScore = parseInt(localStorage.getItem('chessHordeBest') || '0');
let combo = 0;
let comboTimer = null;
let comboTimeLeft = 0;
let turnTimer = null;
let timeLeft = TURN_TIME;
let turnCount = 0;
let isPlayerTurn = true;
let shopCooldowns = { P: 0, N: 0, B: 0, R: 0, Q: 0 };
let enemiesMoved = false;
let animating = false;
let checkState = { inCheck: false, from: [] };

// ========== 棋盘初始化 ==========
function initBoard() {
  board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[r][c] = null;
    }
  }
  // 玩家初始布局 (底部2行)
  const playerRow1 = [
    { type: 'R', owner: 'player' }, { type: 'N', owner: 'player' },
    { type: 'B', owner: 'player' }, { type: 'Q', owner: 'player' },
    { type: 'K', owner: 'player' }, { type: 'B', owner: 'player' },
    { type: 'N', owner: 'player' }, { type: 'R', owner: 'player' }
  ];
  const playerRow2 = Array(8).fill({ type: 'P', owner: 'player' });
  playerRow1.forEach((p, i) => board[7][i] = { ...p });
  playerRow2.forEach((p, i) => board[6][i] = { ...p });
}

// ========== 渲染 ==========
function renderBoard() {
  const container = document.getElementById('chessBoard');
  container.innerHTML = '';

  // 生成区域标记
  const spawnZone = document.createElement('div');
  spawnZone.className = 'spawnZone';
  container.appendChild(spawnZone);

  for (let r = 0; r < BOARD_SIZE; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
      cell.dataset.r = r;
      cell.dataset.c = c;

      // 选中和移动提示
      if (selected && selected.r === r && selected.c === c) {
        cell.classList.add('selected');
      }
      if (validMoves.some(m => m.r === r && m.c === c)) {
        const dot = document.createElement('div');
        dot.className = 'moveDot';
        cell.appendChild(dot);
      }
      if (validCaptures.some(m => m.r === r && m.c === c)) {
        const ring = document.createElement('div');
        ring.className = 'attackRing';
        cell.appendChild(ring);
      }

      // 棋子
      const piece = board[r][c];
      if (piece) {
        const span = document.createElement('span');
        span.className = 'piece ' + piece.owner;
        if (piece.type === 'K') span.classList.add('king');
        if (piece.type === 'Q') span.classList.add('queen');
        span.textContent = piece.owner === 'player' ? PLAYER_EMOJI[piece.type] : ENEMY_EMOJI[piece.type];
        cell.appendChild(span);
      }

      cell.addEventListener('click', () => onCellClick(r, c));
      rowEl.appendChild(cell);
    }
    container.appendChild(rowEl);
  }

  // 将军警告
  if (checkState.inCheck) {
    const kingPos = findKing('player');
    if (kingPos) {
      const cell = container.querySelector(`[data-r="${kingPos.r}"][data-c="${kingPos.c}"]`);
      if (cell) {
        const flash = document.createElement('div');
        flash.className = 'checkFlash';
        cell.appendChild(flash);
      }
    }
  }
}

function findKing(owner) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p && p.type === 'K' && p.owner === owner) return { r, c };
    }
  }
  return null;
}

// ========== 棋子移动规则 ==========
function getPieceMoves(r, c, piece) {
  const moves = [];
  const captures = [];
  const type = piece.type;

  const addMove = (nr, nc) => {
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) return;
    const target = board[nr][nc];
    if (!target) moves.push({ r: nr, c: nc });
    else if (target.owner !== piece.owner) captures.push({ r: nr, c: nc });
  };

  const addLine = (dr, dc) => {
    for (let i = 1; i < BOARD_SIZE; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
      const target = board[nr][nc];
      if (!target) moves.push({ r: nr, c: nc });
      else {
        if (target.owner !== piece.owner) captures.push({ r: nr, c: nc });
        break;
      }
    }
  };

  switch (type) {
    case 'P': {
      const dir = piece.owner === 'player' ? -1 : 1;
      const startRow = piece.owner === 'player' ? 6 : 1;
      // 前进
      if (r + dir >= 0 && r + dir < BOARD_SIZE && !board[r + dir][c]) {
        moves.push({ r: r + dir, c });
        if (r === startRow && !board[r + dir * 2][c]) {
          moves.push({ r: r + dir * 2, c });
        }
      }
      // 斜吃
      [-1, 1].forEach(dc => {
        const nr = r + dir, nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          const target = board[nr][nc];
          if (target && target.owner !== piece.owner) captures.push({ r: nr, c: nc });
        }
      });
      break;
    }
    case 'N': {
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => {
        addMove(r + dr, c + dc);
      });
      break;
    }
    case 'B': {
      [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr, dc]) => addLine(dr, dc));
      break;
    }
    case 'R': {
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => addLine(dr, dc));
      break;
    }
    case 'Q': {
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => addLine(dr, dc));
      break;
    }
    case 'K': {
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => {
        addMove(r + dr, c + dc);
      });
      break;
    }
  }
  return { moves, captures };
}

// ========== 点击处理 ==========
function onCellClick(r, c) {
  if (gameState !== 'playing' || animating || !isPlayerTurn) return;

  const clicked = board[r][c];

  // 如果选中了己方棋子，点击目标位置
  if (selected) {
    const isMove = validMoves.some(m => m.r === r && m.c === c);
    const isCapture = validCaptures.some(m => m.r === r && m.c === c);

    if (isMove || isCapture) {
      executeMove(selected.r, selected.c, r, c);
      return;
    }
  }

  // 选中己方棋子
  if (clicked && clicked.owner === 'player') {
    selected = { r, c };
    const { moves, captures } = getPieceMoves(r, c, clicked);
    validMoves = moves;
    validCaptures = captures;
    renderBoard();
    return;
  }

  // 取消选择
  selected = null;
  validMoves = [];
  validCaptures = [];
  renderBoard();
}

// ========== 执行移动 ==========
function executeMove(fromR, fromC, toR, toC) {
  const movingPiece = board[fromR][fromC];
  const target = board[toR][toC];
  let captured = false;
  let goldEarned = 0;

  if (target) {
    captured = true;
    goldEarned = PIECE_VALUES[target.type] || 10;
    // 连击加成
    if (combo > 0) goldEarned += Math.floor(combo * 5);
    gold += goldEarned;
    score += goldEarned;

    // 连击系统
    combo++;
    resetComboTimer();

    // 显示金币弹出
    showGoldPop(toR, toC, goldEarned, combo);
  } else {
    combo = 0;
    clearComboTimer();
  }

  // 执行移动
  board[toR][toC] = movingPiece;
  board[fromR][fromC] = null;

  // 兵升变（玩家兵到达第0行）
  if (movingPiece.type === 'P' && movingPiece.owner === 'player' && toR === 0) {
    board[toR][toC] = { type: 'Q', owner: 'player' };
    showToast('⭐ ' + (currentLang === 'en' ? 'Pawn promoted!' : '兵升变为后！'));
  }

  // 敌人兵到达第7行 = 玩家受创（扣金币/分数）
  if (movingPiece.type === 'P' && movingPiece.owner === 'enemy' && toR === 7) {
    const penalty = 20;
    gold = Math.max(0, gold - penalty);
    score = Math.max(0, score - penalty);
    showToast('⚠️ ' + (currentLang === 'en' ? 'Enemy broke through!' : '敌人突破防线！') + ' -' + penalty);
  }

  selected = null;
  validMoves = [];
  validCaptures = [];

  // 检查是否吃掉敌人王
  if (target && target.type === 'K') {
    waveClearBonus();
  }

  updateUI();
  renderBoard();

  // 结束玩家回合，敌人回合
  endPlayerTurn();
}

function showGoldPop(r, c, amount, comboCount) {
  const container = document.getElementById('chessBoard');
  const cell = container.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  if (!cell) return;

  const popEl = document.createElement('div');
  popEl.className = 'goldPop';
  popEl.textContent = '+' + amount + (comboCount > 1 ? ' 🔥x' + comboCount : '');
  cell.appendChild(popEl);
  setTimeout(() => popEl.remove(), 900);
}

// ========== 连击系统 ==========
function resetComboTimer() {
  clearComboTimer();
  comboTimeLeft = 100;
  const comboBar = document.getElementById('comboBar');
  const comboText = document.getElementById('comboText');
  const comboFill = document.getElementById('comboFill');
  comboBar.classList.add('show');
  comboText.textContent = (currentLang === 'en' ? 'Combo ' : '连击 ') + 'x' + combo;

  comboTimer = setInterval(() => {
    comboTimeLeft -= 2;
    comboFill.style.width = comboTimeLeft + '%';
    if (comboTimeLeft <= 0) {
      clearComboTimer();
      combo = 0;
      showToast(currentLang === 'en' ? 'Combo broken!' : '连击中断！');
    }
  }, 100);
}

function clearComboTimer() {
  if (comboTimer) clearInterval(comboTimer);
  comboTimer = null;
  document.getElementById('comboBar').classList.remove('show');
}

// ========== 回合管理 ==========
function endPlayerTurn() {
  isPlayerTurn = false;
  turnCount++;

  // 减少商店冷却
  for (let key in shopCooldowns) {
    if (shopCooldowns[key] > 0) shopCooldowns[key]--;
  }
  renderShop();

  // 检查将军状态
  checkState = checkIfInCheck('player');
  if (checkState.inCheck) {
    showCheckWarning(true);
  }

  // 敌人移动
  setTimeout(() => {
    enemyTurn();
  }, 400);
}

function enemyTurn() {
  animating = true;

  // 收集所有敌人
  const enemies = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p && p.owner === 'enemy') enemies.push({ r, c, piece: p });
    }
  }

  // 敌人移动（贪婪AI：向玩家阵地/最近目标移动）
  enemies.forEach(e => {
    const moves = getEnemyMove(e.r, e.c, e.piece);
    if (moves.length > 0) {
      // 优先吃子，其次向玩家阵地移动
      const captureMoves = moves.filter(m => board[m.r][m.c] && board[m.r][m.c].owner === 'player');
      const chosen = captureMoves.length > 0
        ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
        : moves[Math.floor(Math.random() * Math.min(moves.length, 3))];

      if (board[chosen.r][chosen.c] && board[chosen.r][chosen.c].owner === 'player') {
        // 敌人吃掉玩家棋子
        if (board[chosen.r][chosen.c].type === 'K') {
          // 王被吃
          gameOver('kingCaptured');
          return;
        }
      }

      board[chosen.r][chosen.c] = e.piece;
      board[e.r][e.c] = null;
    }
  });

  renderBoard();

  // 检查是否有敌人到达底线
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board[7][c] && board[7][c].owner === 'enemy') {
      const penalty = 30;
      gold = Math.max(0, gold - penalty);
      score = Math.max(0, score - penalty);
      showToast('⚠️ 敌人突破防线！ -' + penalty);
      // 移除突破的敌人
      board[7][c] = null;
    }
  }

  // 检查是否有敌人到达第6行（预警）
  let dangerCount = 0;
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board[6][c] && board[6][c].owner === 'enemy') dangerCount++;
  }
  if (dangerCount > 0) {
    document.getElementById('timerPill').classList.add('danger');
  } else {
    document.getElementById('timerPill').classList.remove('danger');
  }

  setTimeout(() => {
    animating = false;

    // 检查将军是否被解除
    const newCheck = checkIfInCheck('player');
    if (checkState.inCheck && newCheck.inCheck) {
      // 将军未解除，游戏结束
      gameOver('checkmate');
      return;
    }
    checkState = newCheck;
    if (!checkState.inCheck) {
      showCheckWarning(false);
    } else {
      showCheckWarning(true);
    }

    // 生成新敌人
    spawnEnemies();

    // 开始新回合
    isPlayerTurn = true;
    timeLeft = TURN_TIME;
    startTurnTimer();
    updateUI();
    renderBoard();
  }, 300);
}

// 敌人移动AI（贪婪策略）
function getEnemyMove(r, c, piece) {
  const { moves, captures } = getPieceMoves(r, c, piece);
  const all = [...moves, ...captures];
  if (all.length === 0) return [];

  // 过滤：敌人更倾向于向下/向玩家移动
  const scored = all.map(m => {
    let score = 0;
    const target = board[m.r][m.c];

    // 优先吃子
    if (target && target.owner === 'player') {
      score += 100 + (PIECE_VALUES[target.type] || 0);
    }

    // 向玩家阵地移动（行号增加）
    score += (m.r - r) * 5;

    // 王的距离（优先向王移动）
    const kingPos = findKing('player');
    if (kingPos) {
      const dist = Math.abs(m.r - kingPos.r) + Math.abs(m.c - kingPos.c);
      score += (14 - dist) * 2;
    }

    // Boss王的特殊行为：不主动移动，有护卫时不动
    if (piece.type === 'K') {
      const guards = countEnemyGuards(r, c);
      if (guards >= 2) score -= 200; // 王周围有2+护卫时不动
    }

    return { ...m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.min(3, scored.length));
}

function countEnemyGuards(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        if (board[nr][nc] && board[nr][nc].owner === 'enemy') count++;
      }
    }
  }
  return count;
}

// 检查将军
function checkIfInCheck(owner) {
  const kingPos = findKing(owner);
  if (!kingPos) return { inCheck: false, from: [] };

  const attackers = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p && p.owner !== owner) {
        const { captures } = getPieceMoves(r, c, p);
        if (captures.some(m => m.r === kingPos.r && m.c === kingPos.c)) {
          attackers.push({ r, c });
        }
      }
    }
  }
  return { inCheck: attackers.length > 0, from: attackers };
}

function showCheckWarning(show) {
  const el = document.getElementById('checkWarning');
  if (show) {
    el.textContent = T.checkWarning;
    el.classList.add('show');
  } else {
    el.classList.remove('show');
  }
}

// ========== 生成敌人 ==========
function spawnEnemies() {
  // 根据波次计算生成参数
  const { enemyTypes, count } = getWaveConfig(wave);

  // 找到顶部行的空位
  const spawnRows = [0, 1, 2];
  let spawned = 0;

  for (let i = 0; i < count; i++) {
    // 随机选择类型
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    // 随机选择顶部行的空位
    const emptySpots = [];
    for (let sr of spawnRows) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!board[sr][c]) emptySpots.push({ r: sr, c });
      }
    }

    if (emptySpots.length === 0) break;

    const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    board[spot.r][spot.c] = { type, owner: 'enemy' };
    spawned++;
  }

  // Boss 波次
  if (wave % 5 === 0) {
    const centerC = 3 + Math.floor(Math.random() * 2);
    if (!board[0][centerC]) {
      board[0][centerC] = { type: 'K', owner: 'enemy' };
    }
    // Boss 护卫
    const guardTypes = ['N', 'B', 'R'];
    for (let c = 2; c <= 5; c++) {
      if (c !== centerC && !board[0][c]) {
        board[0][c] = { type: guardTypes[Math.floor(Math.random() * guardTypes.length)], owner: 'enemy' };
      }
    }
    showWaveBanner('👑 ' + (currentLang === 'en' ? 'BOSS WAVE ' : 'BOSS 波次 ') + wave);
  } else {
    showWaveBanner('🌊 ' + T.waveTitle.replace('{wave}', wave));
  }

  wave++;
}

function getWaveConfig(w) {
  if (w <= 3) return { enemyTypes: ['P'], count: 3 + w };
  if (w <= 6) return { enemyTypes: ['P', 'N', 'B'], count: 5 + Math.floor(w / 2) };
  if (w <= 10) return { enemyTypes: ['P', 'N', 'B', 'R'], count: 7 + Math.floor(w / 2) };
  if (w <= 15) return { enemyTypes: ['P', 'N', 'B', 'R', 'Q'], count: 10 + Math.floor(w / 3) };
  if (w <= 20) return { enemyTypes: ['P', 'N', 'B', 'R', 'Q'], count: 12 + Math.floor(w / 3) };
  return { enemyTypes: ['P', 'N', 'B', 'R', 'Q', 'K'], count: 15 + Math.floor(w / 4) };
}

function showWaveBanner(text) {
  const el = document.getElementById('waveBanner');
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1600);
}

function waveClearBonus() {
  const bonus = 50 + wave * 10;
  gold += bonus;
  score += bonus;
  showToast('✨ ' + (currentLang === 'en' ? 'Boss defeated! +' : 'Boss击败！+') + bonus);
  updateUI();
  document.getElementById('chessBoard').classList.add('goldGlow');
  setTimeout(() => document.getElementById('chessBoard').classList.remove('goldGlow'), 600);
}

// ========== 商店 ==========
function initShop() {
  const shopBar = document.getElementById('shopBar');
  shopBar.innerHTML = '';

  const items = ['P', 'N', 'B', 'R', 'Q'];
  items.forEach(type => {
    const item = document.createElement('div');
    item.className = 'shopItem';
    item.dataset.type = type;

    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = PLAYER_EMOJI[type];

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = SHOP_PRICES[type] + '🪙';

    const cooldown = document.createElement('div');
    cooldown.className = 'cooldown';
    cooldown.textContent = SHOP_COOLDOWNS[type] + (currentLang === 'en' ? ' turns' : '回合');

    const badge = document.createElement('span');
    badge.className = 'cdBadge';
    badge.style.display = 'none';
    badge.textContent = '0';

    item.appendChild(emoji);
    item.appendChild(price);
    item.appendChild(cooldown);
    item.appendChild(badge);
    item.addEventListener('click', () => buyPiece(type));
    shopBar.appendChild(item);
  });
}

function renderShop() {
  const items = document.querySelectorAll('.shopItem');
  items.forEach(item => {
    const type = item.dataset.type;
    const price = SHOP_PRICES[type];
    const cd = shopCooldowns[type] || 0;
    const canAfford = gold >= price;
    const onCooldown = cd > 0;

    if (canAfford && !onCooldown) {
      item.classList.remove('disabled');
    } else {
      item.classList.add('disabled');
    }

    const badge = item.querySelector('.cdBadge');
    if (onCooldown) {
      badge.style.display = 'block';
      badge.textContent = cd;
      item.classList.add('onCooldown');
    } else {
      badge.style.display = 'none';
      item.classList.remove('onCooldown');
    }
  });
}

function buyPiece(type) {
  if (gameState !== 'playing' || !isPlayerTurn || animating) return;
  const price = SHOP_PRICES[type];
  const cd = shopCooldowns[type] || 0;

  if (cd > 0) {
    showToast(T.shopCooldown);
    return;
  }
  if (gold < price) {
    showToast(T.buyFail);
    return;
  }

  // 找底线空位
  const emptySlots = [];
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (!board[7][c]) emptySlots.push(c);
  }
  if (emptySlots.length === 0) {
    showToast(T.shopFull);
    return;
  }

  const c = emptySlots[Math.floor(Math.random() * emptySlots.length)];
  board[7][c] = { type, owner: 'player' };
  gold -= price;
  shopCooldowns[type] = SHOP_COOLDOWNS[type];

  const name = currentLang === 'en' ? PIECE_NAMES_EN[type] : PIECE_NAMES[type];
  showToast(T.buySuccess.replace('{piece}', name));
  updateUI();
  renderBoard();
  renderShop();
}

// ========== 计时器 ==========
function startTurnTimer() {
  clearInterval(turnTimer);
  timeLeft = TURN_TIME;
  updateTimer();
  turnTimer = setInterval(() => {
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
      clearInterval(turnTimer);
      gameOver('timeUp');
    }
    updateTimer();
  }, 100);
}

function updateTimer() {
  document.getElementById('timerNum').textContent = Math.ceil(timeLeft);
  const pct = (timeLeft / TURN_TIME) * 100;
  document.getElementById('phaseFill').style.width = pct + '%';
}

function updateUI() {
  document.getElementById('waveNum').textContent = (currentLang === 'en' ? 'W' : '波') + ' ' + wave;
  document.getElementById('goldNum').textContent = gold;
  document.getElementById('scoreNum').textContent = score;
}

// ========== Toast ==========
function showToast(msg) {
  const wrap = document.getElementById('toastWrap');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 3100);
}

// ========== 游戏流程 ==========
function startGame() {
  gameState = 'playing';
  wave = 1;
  gold = 0;
  score = 0;
  combo = 0;
  turnCount = 0;
  shopCooldowns = { P: 0, N: 0, B: 0, R: 0, Q: 0 };
  checkState = { inCheck: false, from: [] };
  isPlayerTurn = true;
  animating = false;

  initBoard();
  initShop();
  renderShop();
  updateUI();
  renderBoard();

  document.getElementById('overlay').classList.remove('show');
  document.getElementById('checkWarning').classList.remove('show');

  // 初始敌人
  setTimeout(() => {
    spawnEnemies();
    startTurnTimer();
  }, 500);
}

function gameOver(reason) {
  gameState = 'gameover';
  clearInterval(turnTimer);
  clearComboTimer();

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('chessHordeBest', bestScore.toString());
  }

  const diag = HordeDiagnosis.getDiagnosis(score, wave, turnCount, combo);
  const isEn = currentLang === 'en';

  const title = document.getElementById('overlayTitle');
  const subtitle = document.getElementById('overlaySub');
  const content = document.getElementById('overlayContent');

  title.textContent = T.gameOver;
  subtitle.textContent = T.gameOverSub;

  content.innerHTML = `
    <div class="overlayDiagnosis">
      <div class="dIcon">${diag.icon}</div>
      <div class="dTitle">${isEn ? diag.titleEn : diag.title}</div>
      <div class="dRare">${isEn ? diag.rareEn : diag.rare} · ${diag.rarePercent}</div>
      <div class="dQuote">${isEn ? diag.quoteEn : diag.quote}</div>
      <div class="dRoast">${isEn ? diag.roastsEn[Math.floor(Math.random() * diag.roastsEn.length)] : diag.roasts[Math.floor(Math.random() * diag.roasts.length)]}</div>
    </div>
    <div class="overlayStats">
      <div class="overlayStat"><div class="val">${score}</div><div class="lab">${T.score}</div></div>
      <div class="overlayStat"><div class="val">${wave - 1}</div><div class="lab">${T.wave}</div></div>
      <div class="overlayStat"><div class="val">${turnCount}</div><div class="lab">${T.time}</div></div>
      <div class="overlayStat"><div class="val">${bestScore}</div><div class="lab">${T.best}</div></div>
    </div>
    <div class="overlayBtnWrap">
      <button class="overlayBtn" onclick="startGame()">${T.playAgain}</button>
      <a class="overlayBtn secondary" href="../../index.html">${T.backToArcade}</a>
    </div>
  `;

  document.getElementById('overlay').classList.add('show');
}

function pauseGame() {
  if (gameState !== 'playing') return;
  gameState = 'paused';
  clearInterval(turnTimer);

  const title = document.getElementById('overlayTitle');
  const subtitle = document.getElementById('overlaySub');
  const content = document.getElementById('overlayContent');

  title.textContent = T.pauseTitle;
  subtitle.textContent = T.pauseSubtitle;
  content.innerHTML = `
    <div class="overlayBtnWrap">
      <button class="overlayBtn" onclick="resumeGame()">${T.resume}</button>
      <button class="overlayBtn secondary" onclick="startGame()">${T.restart}</button>
      <a class="overlayBtn secondary" href="../../index.html">${T.backToArcade}</a>
    </div>
    <div style="margin-top:24px;color:var(--dim);font-size:13px;line-height:1.6;max-width:320px;text-align:left">
      <strong style="color:var(--light)">${T.howToPlay}</strong><br><br>
      ${T.instructions.replace(/\n/g, '<br>')}
    </div>
  `;
  document.getElementById('overlay').classList.add('show');
}

function resumeGame() {
  gameState = 'playing';
  document.getElementById('overlay').classList.remove('show');
  startTurnTimer();
}

// ========== 键盘 ==========
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
    if (gameState === 'playing') pauseGame();
    else if (gameState === 'paused') resumeGame();
  }
});

// ========== 初始化 ==========
function init() {
  initBoard();
  initShop();
  renderShop();
  renderBoard();
  updateUI();

  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('overlayTitle').textContent = T.title;
  document.getElementById('overlaySub').textContent = T.subtitle;
  document.getElementById('overlay').classList.add('show');
}

init();
