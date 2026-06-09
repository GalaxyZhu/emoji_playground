// ♟ Chess Horde — 棋阵守卫战 重平衡版 V2
// 核心改动：波次制(战斗期/整备期)、棋子HP、技能系统、经济重平衡

// ========== i18n 翻译 ==========
let currentLang = 'zh';

function applyTranslations(lang) {
  currentLang = lang;
  const isEn = lang === 'en';
  const T = {
    zh: {
      title: '♟ 棋阵守卫战',
      subtitle: '经典棋阵 vs 无尽尸潮\n战斗期杀敌，整备期调整，撑住每一波！',
      startGame: '▶️ 开始战斗',
      backToArcade: '🏠 回到街机厅',
      gameOver: '💀 防线崩溃',
      gameOverSub: '你的王倒下了，或时间耗尽',
      waveTitle: '第 {wave} 波',
      battlePhase: '🔴 战斗期',
      prepPhase: '🟢 整备期',
      score: '得分',
      gold: '金币',
      best: '最高',
      wave: '波次',
      phase: '回合',
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
      phaseShift: '整备期开始！调整阵型',
      battleStart: '战斗开始！敌人来袭',
      kingCaptured: '王被吃掉了！',
      timeUp: '时间耗尽！',
      pauseTitle: '⏸️ 游戏暂停',
      resume: '▶️ 继续',
      restart: '🔄 重新开始',
      howToPlay: '玩法说明',
      instructions: '战斗期：敌人每回合移动，你移动1个棋子杀敌\n整备期：敌人不动，你移动2个棋子+可购买新兵\n吃子赚金币，购买强化防线\n王被将军必须解除，否则失败\n王技能：国王威压清除周围敌人，女王审判清除直线',
      shopPawn: '兵',
      shopKnight: '马',
      shopBishop: '相',
      shopRook: '车',
      shopQueen: '后',
      price: '价格',
      cd: 'CD',
      turns: '回合',
      playAgain: '🔄 再来一局',
      skillReady: '👑 国王威压就绪！点击发动',
      queenSkillReady: '♕ 女王审判就绪！',
      reinforce: '💂 援军到达！',
      hp: 'HP',
    },
    en: {
      title: '♟ Chess Horde',
      subtitle: 'Classic Chess vs Endless Horde\nBattle phase to kill, Prep phase to rebuild!',
      startGame: '▶️ Start Battle',
      backToArcade: '🏠 Back to Arcade',
      gameOver: '💀 Line Broken',
      gameOverSub: 'Your King fell or time ran out',
      waveTitle: 'Wave {wave}',
      battlePhase: '🔴 Battle',
      prepPhase: '🟢 Prep',
      score: 'Score',
      gold: 'Gold',
      best: 'Best',
      wave: 'Wave',
      phase: 'Turn',
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
      phaseShift: 'Prep phase! Rebuild your formation',
      battleStart: 'Battle begins! Enemies incoming',
      kingCaptured: 'King captured!',
      timeUp: 'Time ran out!',
      pauseTitle: '⏸️ Paused',
      resume: '▶️ Resume',
      restart: '🔄 Restart',
      howToPlay: 'How to Play',
      instructions: 'Battle: enemies move every turn, you move 1 piece\nPrep: enemies frozen, you move 2 pieces + buy\nEarn gold by capturing, buy reinforcements\nKing in check must escape\nSkills: King Aura clears nearby, Queen Judgment clears line',
      shopPawn: 'Pawn',
      shopKnight: 'Knight',
      shopBishop: 'Bishop',
      shopRook: 'Rook',
      shopQueen: 'Queen',
      price: 'Cost',
      cd: 'CD',
      turns: 'turns',
      playAgain: '🔄 Play Again',
      skillReady: '👑 King Aura ready! Tap to activate',
      queenSkillReady: '♕ Queen Judgment ready!',
      reinforce: '💂 Reinforcements arrived!',
      hp: 'HP',
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
const TURN_TIME = 20;
const BATTLE_TURNS = 4;   // 战斗期回合数
const PREP_TURNS = 2;     // 整备期回合数

const PLAYER_EMOJI = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' };
const ENEMY_EMOJI = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };

const PIECE_VALUES = { P: 10, N: 25, B: 25, R: 40, Q: 80, K: 200 };
const SHOP_PRICES = { P: 30, N: 60, B: 60, R: 100, Q: 180 };
const SHOP_COOLDOWNS = { P: 1, N: 2, B: 2, R: 3, Q: 4 };

const PIECE_HP = { P: 2, N: 3, B: 3, R: 4, Q: 5, K: 5 };
const ENEMY_ATTACK = { P: 1, N: 1, B: 1, R: 2, Q: 2, K: 3 };

const ENEMY_MOVE_CHANCE = { P: 1.0, N: 0.8, B: 0.8, R: 0.6, Q: 0.5, K: 0.0 };

const PIECE_NAMES = { P: '兵', N: '马', B: '相', R: '车', Q: '后', K: '王' };
const PIECE_NAMES_EN = { P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King' };

const KING_SKILL_CD = 5;  // 国王技能冷却
const QUEEN_SKILL_CD = 10; // 女王技能冷却
const REINFORCE_INTERVAL = 5; // 自动援军间隔

// ========== 状态 ==========
let board = [];
let selected = null;
let validMoves = [];
let validCaptures = [];
let gameState = 'menu'; // menu, playing, paused, gameover
let wave = 1;
let gold = 150; // 开局150
let score = 0;
let bestScore = parseInt(localStorage.getItem('chessHordeBest') || '0');
let combo = 0;
let comboTimer = null;
let comboTimeLeft = 0;
let turnTimer = null;
let timeLeft = TURN_TIME;
let turnCount = 0;
let isPlayerTurn = true;
let animating = false;
let checkState = { inCheck: false, from: [] };

// 波次系统
let phase = 'battle'; // battle, prep
let phaseTurnsLeft = BATTLE_TURNS;
let maxPhaseTurns = BATTLE_TURNS;
let reinforceCounter = 0; // 援军计数器
let kingSkillCD = 0; // 王技能冷却
let queenSkillCD = 0; // 后技能冷却
let movesThisTurn = 0;
let maxMovesThisTurn = 1;
let buysThisTurn = 0;
let maxBuysThisTurn = 1;

let shopCooldowns = { P: 0, N: 0, B: 0, R: 0, Q: 0 };
let totalEnemiesDefeated = 0;

// ========== 棋盘初始化 ==========
function initBoard() {
  board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[r][c] = null;
    }
  }
  const playerRow1 = [
    { type: 'R', owner: 'player', hp: PIECE_HP.R, maxHp: PIECE_HP.R },
    { type: 'N', owner: 'player', hp: PIECE_HP.N, maxHp: PIECE_HP.N },
    { type: 'B', owner: 'player', hp: PIECE_HP.B, maxHp: PIECE_HP.B },
    { type: 'Q', owner: 'player', hp: PIECE_HP.Q, maxHp: PIECE_HP.Q },
    { type: 'K', owner: 'player', hp: PIECE_HP.K, maxHp: PIECE_HP.K },
    { type: 'B', owner: 'player', hp: PIECE_HP.B, maxHp: PIECE_HP.B },
    { type: 'N', owner: 'player', hp: PIECE_HP.N, maxHp: PIECE_HP.N },
    { type: 'R', owner: 'player', hp: PIECE_HP.R, maxHp: PIECE_HP.R }
  ];
  const playerRow2 = Array(8).fill(null).map(() => ({ type: 'P', owner: 'player', hp: PIECE_HP.P, maxHp: PIECE_HP.P }));
  playerRow1.forEach((p, i) => board[7][i] = { ...p });
  playerRow2.forEach((p, i) => board[6][i] = { ...p });
}

// ========== 渲染 ==========
function renderBoard() {
  const container = document.getElementById('chessBoard');
  container.innerHTML = '';

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

      const piece = board[r][c];
      if (piece) {
        const span = document.createElement('span');
        span.className = 'piece ' + piece.owner;
        if (piece.type === 'K') span.classList.add('king');
        if (piece.type === 'Q') span.classList.add('queen');
        if (piece.hp <= 0) span.classList.add('dead');
        span.textContent = piece.owner === 'player' ? PLAYER_EMOJI[piece.type] : ENEMY_EMOJI[piece.type];
        cell.appendChild(span);

        // HP bar
        if (piece.owner === 'player' && piece.hp < piece.maxHp) {
          const hpWrap = document.createElement('div');
          hpWrap.style.cssText = 'position:absolute;bottom:2px;left:10%;width:80%;height:3px;background:rgba(0,0,0,0.3);border-radius:2px;z-index:4;';
          const hpFill = document.createElement('div');
          const hpPct = piece.hp / piece.maxHp;
          hpFill.style.cssText = `width:${hpPct*100}%;height:100%;background:${hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#f59e0b' : '#ef4444'};border-radius:2px;transition:width 0.3s;`;
          hpWrap.appendChild(hpFill);
          cell.appendChild(hpWrap);
        }
      }

      cell.addEventListener('click', () => onCellClick(r, c));
      rowEl.appendChild(cell);
    }
    container.appendChild(rowEl);
  }

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

  switch (piece.type) {
    case 'P': {
      const dir = piece.owner === 'player' ? -1 : 1;
      const startRow = piece.owner === 'player' ? 6 : 1;
      if (r + dir >= 0 && r + dir < BOARD_SIZE && !board[r + dir][c]) {
        moves.push({ r: r + dir, c });
        if (r === startRow && !board[r + dir * 2][c]) {
          moves.push({ r: r + dir * 2, c });
        }
      }
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
  if (gameState !== 'playing' || animating) return;

  // 整备期检查：是否还能移动
  if (movesThisTurn >= maxMovesThisTurn && phase === 'prep') return;
  if (movesThisTurn >= maxMovesThisTurn && phase === 'battle') return;

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
    if (combo > 0) goldEarned += Math.floor(combo * 5);
    gold += goldEarned;
    score += goldEarned;
    totalEnemiesDefeated++;

    combo++;
    resetComboTimer();
    showGoldPop(toR, toC, goldEarned, combo);
  } else {
    combo = 0;
    clearComboTimer();
  }

  board[toR][toC] = movingPiece;
  board[fromR][fromC] = null;

  // 兵升变
  if (movingPiece.type === 'P' && movingPiece.owner === 'player' && toR === 0) {
    board[toR][toC] = { type: 'Q', owner: 'player', hp: PIECE_HP.Q, maxHp: PIECE_HP.Q };
    showToast('⭐ ' + (currentLang === 'en' ? 'Pawn promoted!' : '兵升变为后！'));
  }

  // 敌人兵到达第7行 = 攻击玩家
  if (movingPiece.type === 'P' && movingPiece.owner === 'enemy' && toR === 7) {
    const penalty = 20;
    gold = Math.max(0, gold - penalty);
    score = Math.max(0, score - penalty);
    showToast('⚠️ ' + (currentLang === 'en' ? 'Enemy broke through!' : '敌人突破防线！') + ' -' + penalty);
  }

  selected = null;
  validMoves = [];
  validCaptures = [];

  movesThisTurn++;

  if (target && target.type === 'K') {
    waveClearBonus();
  }

  updateUI();
  renderBoard();

  // 检查是否还有移动次数
  if (movesThisTurn >= maxMovesThisTurn) {
    endPlayerTurn();
  }
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
  reinforceCounter++;

  // 减少商店冷却
  for (let key in shopCooldowns) {
    if (shopCooldowns[key] > 0) shopCooldowns[key]--;
  }
  renderShop();

  // 被动收入
  gold += 5;
  if (phase === 'prep') gold += 20;

  // 检查将军
  checkState = checkIfInCheck('player');
  if (checkState.inCheck) showCheckWarning(true);

  // 技能冷却
  if (kingSkillCD > 0) kingSkillCD--;
  if (queenSkillCD > 0) queenSkillCD--;

  // 阶段切换
  phaseTurnsLeft--;
  if (phaseTurnsLeft <= 0) {
    switchPhase();
  } else {
    // 继续当前阶段
    if (phase === 'battle') {
      setTimeout(() => enemyTurn(), 400);
    } else {
      // 整备期：敌人不动，直接回玩家回合
      startNewPlayerTurn();
    }
  }
}

function switchPhase() {
  if (phase === 'battle') {
    // 进入整备期
    phase = 'prep';
    phaseTurnsLeft = PREP_TURNS;
    maxPhaseTurns = PREP_TURNS;
    showToast('🟢 ' + T.prepPhase + ' ×' + PREP_TURNS);
    showPhaseBanner('🟢 ' + (currentLang === 'en' ? 'PREP PHASE' : '整备期'));
    startNewPlayerTurn();
  } else {
    // 整备期结束，进入新波次战斗期
    phase = 'battle';
    phaseTurnsLeft = BATTLE_TURNS + Math.floor(wave / 5);
    maxPhaseTurns = phaseTurnsLeft;
    spawnEnemies();
    showToast('🔴 ' + T.battleStart);
    showPhaseBanner('🔴 ' + (currentLang === 'en' ? 'BATTLE!' : '战斗开始！'));
    startNewPlayerTurn();
  }
}

function startNewPlayerTurn() {
  isPlayerTurn = true;
  movesThisTurn = 0;
  buysThisTurn = 0;
  timeLeft = TURN_TIME;

  // 整备期可以多移动
  maxMovesThisTurn = phase === 'prep' ? 2 : 1;
  maxBuysThisTurn = phase === 'prep' ? 2 : 1;

  // 自动援军
  if (reinforceCounter >= REINFORCE_INTERVAL) {
    reinforceCounter = 0;
    autoReinforce();
  }

  updateUI();
  renderBoard();
  startTurnTimer();
}

function autoReinforce() {
  const emptySlots = [];
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (!board[7][c]) emptySlots.push(c);
  }
  if (emptySlots.length === 0) return;
  const c = emptySlots[Math.floor(Math.random() * emptySlots.length)];
  board[7][c] = { type: 'P', owner: 'player', hp: PIECE_HP.P, maxHp: PIECE_HP.P };
  showToast('💂 ' + T.reinforce);
}

function enemyTurn() {
  animating = true;

  const enemies = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p && p.owner === 'enemy') enemies.push({ r, c, piece: p });
    }
  }

  enemies.forEach(e => {
    const chance = ENEMY_MOVE_CHANCE[e.piece.type] || 1;
    if (Math.random() > chance) return; // 一定概率不动

    const moves = getEnemyMove(e.r, e.c, e.piece);
    if (moves.length > 0) {
      const captureMoves = moves.filter(m => board[m.r][m.c] && board[m.r][m.c].owner === 'player');
      const chosen = captureMoves.length > 0
        ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
        : moves[Math.floor(Math.random() * Math.min(moves.length, 3))];

      const target = board[chosen.r][chosen.c];
      if (target && target.owner === 'player') {
        // 敌人攻击玩家棋子（HP系统）
        const dmg = ENEMY_ATTACK[e.piece.type] || 1;
        target.hp -= dmg;

        if (target.hp <= 0) {
          if (target.type === 'K') {
            gameOver('kingCaptured');
            return;
          }
          board[chosen.r][chosen.c] = e.piece;
          board[e.r][e.c] = null;
          showToast('💀 ' + (currentLang === 'en' ? 'Your ' : '你的') + (currentLang === 'en' ? PIECE_NAMES_EN[target.type] : PIECE_NAMES[target.type]) + (currentLang === 'en' ? ' fell!' : ' 阵亡了！'));
        } else {
          // 攻击但棋子还在，敌人移动到旁边
          showToast('⚔️ ' + (currentLang === 'en' ? 'Your ' : '你的') + (currentLang === 'en' ? PIECE_NAMES_EN[target.type] : PIECE_NAMES[target.type]) + ' -' + dmg + 'HP');
          // 敌人不移动，原地攻击
        }
      } else {
        board[chosen.r][chosen.c] = e.piece;
        board[e.r][e.c] = null;
      }
    }
  });

  renderBoard();

  // 检查突破底线的敌人
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board[7][c] && board[7][c].owner === 'enemy') {
      const penalty = 30;
      gold = Math.max(0, gold - penalty);
      score = Math.max(0, score - penalty);
      showToast('⚠️ ' + (currentLang === 'en' ? 'Enemy broke through!' : '敌人突破防线！') + ' -' + penalty);
      board[7][c] = null;
    }
  }

  setTimeout(() => {
    animating = false;

    const newCheck = checkIfInCheck('player');
    if (checkState.inCheck && newCheck.inCheck) {
      gameOver('checkmate');
      return;
    }
    checkState = newCheck;
    if (!checkState.inCheck) showCheckWarning(false);
    else showCheckWarning(true);

    startNewPlayerTurn();
  }, 300);
}

function getEnemyMove(r, c, piece) {
  const { moves, captures } = getPieceMoves(r, c, piece);
  const all = [...moves, ...captures];
  if (all.length === 0) return [];

  const scored = all.map(m => {
    let score = 0;
    const target = board[m.r][m.c];
    if (target && target.owner === 'player') {
      score += 100 + (PIECE_VALUES[target.type] || 0);
    }
    score += (m.r - r) * 5;
    const kingPos = findKing('player');
    if (kingPos) {
      const dist = Math.abs(m.r - kingPos.r) + Math.abs(m.c - kingPos.c);
      score += (14 - dist) * 2;
    }
    if (piece.type === 'K') {
      const guards = countEnemyGuards(r, c);
      if (guards >= 2) score -= 200;
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
  const { enemyTypes, count } = getWaveConfig(wave);
  const spawnRows = [0, 1, 2];
  let spawned = 0;

  for (let i = 0; i < count; i++) {
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
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
  if (w <= 2) return { enemyTypes: ['P'], count: 3 };
  if (w <= 4) return { enemyTypes: ['P'], count: 4 };
  if (w <= 5) return { enemyTypes: ['P', 'N'], count: 5 };
  if (w <= 7) return { enemyTypes: ['P', 'N', 'B'], count: 5 + Math.floor(w/3) };
  if (w <= 10) return { enemyTypes: ['P', 'N', 'B', 'R'], count: 6 + Math.floor(w/3) };
  if (w <= 15) return { enemyTypes: ['P', 'N', 'B', 'R', 'Q'], count: 7 + Math.floor(w/4) };
  return { enemyTypes: ['P', 'N', 'B', 'R', 'Q'], count: 8 + Math.floor(w/5) };
}

function showWaveBanner(text) {
  const el = document.getElementById('waveBanner');
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1600);
}

function showPhaseBanner(text) {
  const el = document.getElementById('waveBanner');
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

function waveClearBonus() {
  const bonus = 50 + wave * 10;
  gold += bonus;
  score += bonus;
  // 全棋子回满HP
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p && p.owner === 'player') p.hp = p.maxHp;
    }
  }
  showToast('✨ ' + (currentLang === 'en' ? 'Boss defeated! +' : 'Boss击败！全棋回满HP！+') + bonus);
  updateUI();
  renderBoard();
  document.getElementById('chessBoard').classList.add('goldGlow');
  setTimeout(() => document.getElementById('chessBoard').classList.remove('goldGlow'), 600);
}

// ========== 技能系统 ==========
function useKingSkill() {
  if (kingSkillCD > 0 || gameState !== 'playing' || !isPlayerTurn) return;
  const kingPos = findKing('player');
  if (!kingPos) return;

  // 清除周围2格所有敌人
  let cleared = 0;
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = kingPos.r + dr, nc = kingPos.c + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        const p = board[nr][nc];
        if (p && p.owner === 'enemy') {
          board[nr][nc] = null;
          cleared++;
        }
      }
    }
  }

  if (cleared > 0) {
    const bonus = cleared * 15;
    gold += bonus;
    score += bonus;
    kingSkillCD = KING_SKILL_CD;
    showToast('👑 ' + (currentLang === 'en' ? 'King Aura!' : '国王威压！') + ' +' + bonus + '🪙 (' + cleared + ')');
    updateUI();
    renderBoard();
  }
}

function useQueenSkill() {
  if (queenSkillCD > 0 || gameState !== 'playing' || !isPlayerTurn) return;
  const queenPos = findQueen('player');
  if (!queenPos) return;

  // 清除后所在直线/斜线所有敌人（简化：清除同行同列）
  let cleared = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (r !== queenPos.r) {
      const p = board[r][queenPos.c];
      if (p && p.owner === 'enemy') { board[r][queenPos.c] = null; cleared++; }
    }
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (c !== queenPos.c) {
      const p = board[queenPos.r][c];
      if (p && p.owner === 'enemy') { board[queenPos.r][c] = null; cleared++; }
    }
  }

  if (cleared > 0) {
    const bonus = cleared * 20;
    gold += bonus;
    score += bonus;
    queenSkillCD = QUEEN_SKILL_CD;
    showToast('♕ ' + (currentLang === 'en' ? 'Queen Judgment!' : '女王审判！') + ' +' + bonus + '🪙 (' + cleared + ')');
    updateUI();
    renderBoard();
  }
}

function findQueen(owner) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p && p.type === 'Q' && p.owner === owner) return { r, c };
    }
  }
  return null;
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
    const canBuy = buysThisTurn < maxBuysThisTurn;

    if (canAfford && !onCooldown && canBuy) {
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
  if (gameState !== 'playing' || !isPlayerTurn || buysThisTurn >= maxBuysThisTurn) return;
  const price = SHOP_PRICES[type];
  const cd = shopCooldowns[type] || 0;

  if (cd > 0) { showToast(T.shopCooldown); return; }
  if (gold < price) { showToast(T.buyFail); return; }

  const emptySlots = [];
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (!board[7][c]) emptySlots.push(c);
  }
  if (emptySlots.length === 0) { showToast(T.shopFull); return; }

  const c = emptySlots[Math.floor(Math.random() * emptySlots.length)];
  board[7][c] = { type, owner: 'player', hp: PIECE_HP[type], maxHp: PIECE_HP[type] };
  gold -= price;
  shopCooldowns[type] = SHOP_COOLDOWNS[type];
  buysThisTurn++;

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
      // 超时：强制结束回合
      if (movesThisTurn >= maxMovesThisTurn || phase === 'prep') {
        endPlayerTurn();
      } else {
        gameOver('timeUp');
      }
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
  const phaseLabel = phase === 'battle' ? '🔴' : '🟢';
  document.getElementById('waveNum').textContent = phaseLabel + ' ' + (currentLang === 'en' ? 'W' : '波') + wave + ' · ' + phaseTurnsLeft + '/' + maxPhaseTurns;
  document.getElementById('goldNum').textContent = gold;
  document.getElementById('scoreNum').textContent = score;

  // 技能状态
  if (kingSkillCD === 0) {
    showToastIfNotShown('👑 ' + T.skillReady);
  }
}

let shownSkillToast = { king: false, queen: false };
function showToastIfNotShown(msg) {
  if (msg.includes('👑') && !shownSkillToast.king) {
    shownSkillToast.king = true;
    showToast(msg);
  }
  if (msg.includes('♕') && !shownSkillToast.queen) {
    shownSkillToast.queen = true;
    showToast(msg);
  }
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
  gold = 150;
  score = 0;
  combo = 0;
  turnCount = 0;
  reinforceCounter = 0;
  kingSkillCD = 0;
  queenSkillCD = 0;
  shopCooldowns = { P: 0, N: 0, B: 0, R: 0, Q: 0 };
  totalEnemiesDefeated = 0;
  checkState = { inCheck: false, from: [] };
  isPlayerTurn = true;
  animating = false;
  phase = 'battle';
  phaseTurnsLeft = BATTLE_TURNS;
  maxPhaseTurns = BATTLE_TURNS;
  movesThisTurn = 0;
  buysThisTurn = 0;
  shownSkillToast = { king: false, queen: false };

  initBoard();
  initShop();
  renderShop();
  updateUI();
  renderBoard();

  document.getElementById('overlay').classList.remove('show');
  document.getElementById('checkWarning').classList.remove('show');

  // 初始生成第一波敌人
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

  const diag = HordeDiagnosis.getDiagnosis(score, wave, turnCount, combo, totalEnemiesDefeated);
  const isEn = currentLang === 'en';

  const title = document.getElementById('overlayTitle');
  const sub = document.getElementById('overlaySub');
  const content = document.getElementById('overlayContent');

  title.textContent = T.gameOver;
  sub.textContent = T.gameOverSub;

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
      <div class="overlayStat"><div class="val">${totalEnemiesDefeated}</div><div class="lab">${currentLang === 'en' ? 'Kills' : '杀敌'}</div></div>
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
  const sub = document.getElementById('overlaySub');
  const content = document.getElementById('overlayContent');

  title.textContent = T.pauseTitle;
  sub.textContent = T.pauseSubtitle;
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
  if (e.key === '1' || e.key === 'k') useKingSkill();
  if (e.key === '2' || e.key === 'q') useQueenSkill();
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
