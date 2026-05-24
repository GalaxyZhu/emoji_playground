// game.js - Emoji Evolution 2048 核心逻辑

class EmojiEvolveGame {
  constructor(options = {}) {
    this.themeId = options.theme || 'life';
    this.theme = getTheme(this.themeId);
    this.board = [];
    this.score = 0;
    this.moves = 0;
    this.merges = 0;
    this.combo = 0;
    this.maxLevel = 1;
    this.undoCount = 3;
    this.gameOver = false;
    this.won = false;
    this.lastBoard = null;
    this.lastScore = 0;
    this.newCells = []; // 记录新出现的格子位置，用于动画
    this.mergeCells = []; // 记录合并的格子位置，用于动画
    this.size = 4;
    this.init();
  }

  // 检查主题是否已解锁
  isThemeUnlocked(themeId) {
    const theme = getTheme(themeId);
    if (!theme.locked) return true;
    const unlocked = this.getUnlockedThemes();
    return unlocked.includes(themeId);
  }

  // 获取已解锁主题列表
  getUnlockedThemes() {
    try {
      return JSON.parse(localStorage.getItem('emoji-evolve-unlocked') || '[]');
    } catch {
      return [];
    }
  }

  // 保存解锁主题
  saveUnlockedTheme(themeId) {
    const unlocked = this.getUnlockedThemes();
    if (!unlocked.includes(themeId)) {
      unlocked.push(themeId);
      localStorage.setItem('emoji-evolve-unlocked', JSON.stringify(unlocked));
    }
  }

  // 尝试解锁主题，返回成功/失败
  tryUnlockTheme(themeId) {
    const theme = getTheme(themeId);
    if (!theme.locked) return { success: true, reason: 'free' };
    if (this.isThemeUnlocked(themeId)) return { success: true, reason: 'already' };

    const stars = this.getTotalStars();
    if (stars < theme.unlockCost) {
      return { success: false, reason: 'insufficient', needed: theme.unlockCost, has: stars };
    }

    // 扣除 stars
    if (typeof ArcadeStars !== 'undefined') {
      const current = ArcadeStars.getTotal ? ArcadeStars.getTotal() : parseInt(localStorage.getItem('emoji_arcade_stars') || '0');
      localStorage.setItem('emoji_arcade_stars', (current - theme.unlockCost).toString());
      const history = JSON.parse(localStorage.getItem('emoji_arcade_stars_history') || '[]');
      history.push({ gameId: 'emoji-evolve', amount: -theme.unlockCost, total: current - theme.unlockCost, time: Date.now(), action: 'unlock_' + themeId });
      if (history.length > 100) history.shift();
      localStorage.setItem('emoji_arcade_stars_history', JSON.stringify(history));
    }

    this.saveUnlockedTheme(themeId);
    return { success: true, reason: 'purchased', cost: theme.unlockCost };
  }

  // 获取总 stars（兼容有无 ArcadeStars）
  getTotalStars() {
    if (typeof ArcadeStars !== 'undefined' && ArcadeStars.getTotal) {
      return ArcadeStars.getTotal();
    }
    return parseInt(localStorage.getItem('emoji_arcade_stars') || '0');
  }

  init() {
    this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    this.score = 0;
    this.moves = 0;
    this.merges = 0;
    this.combo = 0;
    this.maxLevel = 1;
    this.undoCount = 3;
    this.gameOver = false;
    this.won = false;
    this.newCells = [];
    this.mergeCells = [];
    // 初始生成两个格子
    this.addRandomCell();
    this.addRandomCell();
    this.saveBestScore();
  }

  // 获取空格子列表
  getEmptyCells() {
    const empty = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === 0) empty.push({ r, c });
      }
    }
    return empty;
  }

  // 在空白格随机生成最低级（level 1）
  addRandomCell() {
    const empty = this.getEmptyCells();
    if (empty.length === 0) return;
    const pos = empty[Math.floor(Math.random() * empty.length)];
    this.board[pos.r][pos.c] = 1;
    this.newCells.push({ r: pos.r, c: pos.c });
  }

  // 克隆棋盘
  cloneBoard(board) {
    return board.map(row => [...row]);
  }

  // 比较两个棋盘是否相同
  boardsEqual(a, b) {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (a[r][c] !== b[r][c]) return false;
      }
    }
    return true;
  }

  // 保存状态用于撤销
  saveState() {
    this.lastBoard = this.cloneBoard(this.board);
    this.lastScore = this.score;
  }

  // 撤销
  undo() {
    if (this.undoCount <= 0 || !this.lastBoard) return false;
    this.board = this.cloneBoard(this.lastBoard);
    this.score = this.lastScore;
    this.undoCount--;
    this.newCells = [];
    this.mergeCells = [];
    return true;
  }

  // 核心滑动逻辑：处理单行/单列（从左到右）
  // 返回 { moved: boolean, scoreGain: number, merged: number }
  slideLine(line) {
    // 1. 过滤掉 0
    let filtered = line.filter(x => x !== 0);
    let scoreGain = 0;
    let mergedCount = 0;

    // 2. 合并相邻相同
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1] && filtered[i] !== 0) {
        filtered[i]++;
        scoreGain += this.getChainItem(filtered[i]).value * 10;
        filtered[i + 1] = 0;
        mergedCount++;
        this.maxLevel = Math.max(this.maxLevel, filtered[i]);
      }
    }

    // 3. 再次过滤
    filtered = filtered.filter(x => x !== 0);

    // 4. 补 0
    while (filtered.length < this.size) {
      filtered.push(0);
    }

    return { line: filtered, scoreGain, mergedCount };
  }

  getChainItem(level) {
    return getChainItem(this.themeId, level);
  }

  // 执行滑动
  move(direction) {
    if (this.gameOver || this.won) return false;

    this.saveState();
    this.newCells = [];
    this.mergeCells = [];

    const oldBoard = this.cloneBoard(this.board);
    let totalScoreGain = 0;
    let totalMerged = 0;
    let moved = false;

    if (direction === 'left') {
      for (let r = 0; r < this.size; r++) {
        const result = this.slideLine(this.board[r]);
        if (!this.arraysEqual(this.board[r], result.line)) moved = true;
        this.board[r] = result.line;
        totalScoreGain += result.scoreGain;
        totalMerged += result.mergedCount;
      }
    } else if (direction === 'right') {
      for (let r = 0; r < this.size; r++) {
        const reversed = [...this.board[r]].reverse();
        const result = this.slideLine(reversed);
        const newLine = result.line.reverse();
        if (!this.arraysEqual(this.board[r], newLine)) moved = true;
        this.board[r] = newLine;
        totalScoreGain += result.scoreGain;
        totalMerged += result.mergedCount;
      }
    } else if (direction === 'up') {
      for (let c = 0; c < this.size; c++) {
        const col = [];
        for (let r = 0; r < this.size; r++) col.push(this.board[r][c]);
        const result = this.slideLine(col);
        if (!this.arraysEqual(col, result.line)) moved = true;
        for (let r = 0; r < this.size; r++) this.board[r][c] = result.line[r];
        totalScoreGain += result.scoreGain;
        totalMerged += result.mergedCount;
      }
    } else if (direction === 'down') {
      for (let c = 0; c < this.size; c++) {
        const col = [];
        for (let r = 0; r < this.size; r++) col.push(this.board[r][c]);
        const reversed = [...col].reverse();
        const result = this.slideLine(reversed);
        const newCol = result.line.reverse();
        if (!this.arraysEqual(col, newCol)) moved = true;
        for (let r = 0; r < this.size; r++) this.board[r][c] = newCol[r];
        totalScoreGain += result.scoreGain;
        totalMerged += result.mergedCount;
      }
    }

    if (moved) {
      this.score += totalScoreGain;
      this.moves++;
      this.merges += totalMerged;
      if (totalMerged > 0) {
        this.combo++;
      } else {
        this.combo = 0;
      }
      this.addRandomCell();
      this.checkGameOver();
      this.checkWin();
      this.saveBestScore();
    } else {
      // 如果没移动，恢复 lastBoard
      this.lastBoard = null;
      this.lastScore = 0;
    }

    return moved;
  }

  arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  // 检查是否通关（存在终极形态 level 7）
  checkWin() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === 7) {
          this.won = true;
          return;
        }
      }
    }
  }

  // 检查游戏结束
  checkGameOver() {
    // 还有空格？
    if (this.getEmptyCells().length > 0) return;

    // 还能合并？
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const val = this.board[r][c];
        // 检查右边
        if (c < this.size - 1 && this.board[r][c + 1] === val) return;
        // 检查下边
        if (r < this.size - 1 && this.board[r + 1][c] === val) return;
      }
    }
    this.gameOver = true;
  }

  // 检查某方向是否可移动（用于预览提示）
  canMove(direction) {
    const testBoard = this.cloneBoard(this.board);
    // 简单检测：模拟移动，看是否有变化
    // 这里简化处理，直接调用 checkGameOver 逻辑
    if (this.getEmptyCells().length > 0) return true;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const val = testBoard[r][c];
        if (c < this.size - 1 && testBoard[r][c + 1] === val) return true;
        if (r < this.size - 1 && testBoard[r + 1][c] === val) return true;
      }
    }
    return false;
  }

  // localStorage 最高分
  getBestScore() {
    const key = `emoji-evolve-best-${this.themeId}`;
    return parseInt(localStorage.getItem(key) || '0');
  }

  saveBestScore() {
    const key = `emoji-evolve-best-${this.themeId}`;
    const best = this.getBestScore();
    if (this.score > best) {
      localStorage.setItem(key, this.score.toString());
    }
  }

  // Stars 计算
  calculateStars() {
    const emptyCells = this.getEmptyCells().length;
    const stars = Math.floor(this.score / 100) + emptyCells * 5 + (this.won ? 50 : 0);
    return stars;
  }

  // 获取诊断数据
  getDiagnosisData() {
    return {
      theme: this.theme,
      score: this.score,
      moves: this.moves,
      merges: this.merges,
      maxLevel: this.maxLevel,
      won: this.won,
      stars: this.calculateStars(),
      bestScore: this.getBestScore()
    };
  }
}

// 导出
if (typeof window !== 'undefined') {
  window.EmojiEvolveGame = EmojiEvolveGame;
}
