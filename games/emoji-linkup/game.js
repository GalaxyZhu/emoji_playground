/**
 * Emoji Link-Up 核心游戏逻辑
 * 连连看：连接相同 Emoji，≤2个拐角（3条直线）
 */

// ==================== 国际化 ====================
const i18n = {
    zh: {
        score: '分数', time: '时间', pairs: '剩余',
        easy: '简单', medium: '中等', hard: '困难',
        newGame: '🎮 开始游戏', backToArcade: '🏠 回到街机厅',
        paused: '⏸️ 暂停', resume: '▶️ 继续', restart: '🔄 重新开始',
        hintTitle: '提示', shuffleTitle: '重排', pauseTitle: '暂停'
    },
    en: {
        score: 'Score', time: 'Time', pairs: 'Left',
        easy: 'Easy', medium: 'Medium', hard: 'Hard',
        newGame: '🎮 New Game', backToArcade: '🏠 Back to Arcade',
        paused: '⏸️ Paused', resume: '▶️ Resume', restart: '🔄 Restart',
        hintTitle: 'Hint', shuffleTitle: 'Shuffle', pauseTitle: 'Pause'
    }
};

let currentLang = 'zh';

function detectLanguage() {
    const forced = new URLSearchParams(location.search).get('lang');
    const stored = localStorage.getItem('emoji_arcade_lang');
    const browser = (navigator.language || navigator.userLanguage || 'zh-CN').toLowerCase();
    let lang = 'zh';
    if (forced === 'zh' || forced === 'en') lang = forced;
    else if (stored === 'zh' || stored === 'en') lang = stored;
    else if (browser.startsWith('en')) lang = 'en';
    currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    return lang;
}

function t(key) {
    return i18n[currentLang]?.[key] || i18n['zh'][key] || key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang]?.[key]) {
            el.textContent = i18n[currentLang][key];
        }
    });
    // 工具按钮 title
    const btnHint = document.getElementById('btnHint');
    const btnShuffle = document.getElementById('btnShuffle');
    const btnPause = document.getElementById('btnPause');
    if (btnHint) btnHint.title = t('hintTitle');
    if (btnShuffle) btnShuffle.title = t('shuffleTitle');
    if (btnPause) btnPause.title = t('pauseTitle');
}

// ==================== 游戏配置 ====================
const EMOJIS_POOL = [
    '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼',
    '🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔',
    '🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺',
    '🍎','🍌','🍇','🍉','🍓','🍑','🍍','🥝',
    '⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱',
    '😀','😂','🥰','😎','🤔','😴','🤯','🥳'
];

// 难度配置
const DIFFICULTY = {
    easy:   { cols: 8,  rows: 6,  time: 90,  emojis: 12, hint: 3, shuffle: 3 },
    medium: { cols: 10, rows: 8,  time: 120, emojis: 20, hint: 3, shuffle: 3 },
    hard:   { cols: 12, rows: 10, time: 150, emojis: 30, hint: 3, shuffle: 3 }
};

// ==================== 游戏状态 ====================
let game = {
    board: [],          // 二维数组，每个元素是 { emoji, empty }
    cols: 8,
    rows: 6,
    totalTime: 90,
    remainingTime: 90,
    score: 0,
    pairsRemaining: 0,
    combo: 0,
    maxCombo: 0,
    selected: null,   // { r, c }
    hints: 3,
    shuffles: 3,
    timer: null,
    isRunning: false,
    isPaused: false,
    totalMoves: 0,
    successfulMoves: 0,
    failedClicks: 0,
    startTime: null,
    hintCells: [],     // 当前提示高亮的格子
};

// ==================== 初始化 ====================
function init() {
    detectLanguage();
    applyTranslations();
    bindEvents();
    newGame();
}

function bindEvents() {
    // 难度切换
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            newGame();
        });
    });

    // 工具按钮
    document.getElementById('btnHint').addEventListener('click', useHint);
    document.getElementById('btnShuffle').addEventListener('click', useShuffle);
    document.getElementById('btnPause').addEventListener('click', togglePause);
    document.getElementById('btnNewGame').addEventListener('click', newGame);
    document.getElementById('btnResume').addEventListener('click', togglePause);
    document.getElementById('btnRestart').addEventListener('click', () => {
        togglePause();
        newGame();
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') togglePause();
        if (e.key === 'h' || e.key === 'H') useHint();
        if (e.key === 'r' || e.key === 'R') useShuffle();
    });
}

// ==================== 新游戏 ====================
function newGame() {
    clearInterval(game.timer);

    const activeDiff = document.querySelector('.diff-btn.active');
    const diffKey = activeDiff?.dataset.diff || 'easy';
    const config = DIFFICULTY[diffKey];

    game.cols = config.cols;
    game.rows = config.rows;
    game.totalTime = config.time;
    game.remainingTime = config.time;
    game.hints = config.hint;
    game.shuffles = config.shuffle;
    game.score = 0;
    game.combo = 0;
    game.maxCombo = 0;
    game.selected = null;
    game.isRunning = true;
    game.isPaused = false;
    game.totalMoves = 0;
    game.successfulMoves = 0;
    game.failedClicks = 0;
    game.startTime = Date.now();
    game.hintCells = [];

    const totalCells = game.cols * game.rows;
    game.pairsRemaining = totalCells / 2;

    // 生成棋盘
    generateBoard(config.emojis);

    // 确保有解
    ensureSolvable();

    // 渲染
    renderBoard();
    updateHUD();
    updateTools();
    hideLine();
    hidePause();

    // 启动计时器
    game.timer = setInterval(tick, 1000);
}

// ==================== 棋盘生成 ====================
function generateBoard(emojiCount) {
    const totalCells = game.cols * game.rows;
    const pairsNeeded = totalCells / 2;

    // 选取 emoji
    const selected = EMOJIS_POOL.slice(0, emojiCount);

    // 创建配对数组
    let emojis = [];
    for (let i = 0; i < pairsNeeded; i++) {
        const emoji = selected[i % selected.length];
        emojis.push(emoji, emoji);
    }

    // Fisher-Yates 洗牌
    for (let i = emojis.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [emojis[i], emojis[j]] = [emojis[j], emojis[i]];
    }

    // 构建二维数组
    game.board = [];
    let idx = 0;
    for (let r = 0; r < game.rows; r++) {
        game.board[r] = [];
        for (let c = 0; c < game.cols; c++) {
            game.board[r][c] = {
                emoji: emojis[idx++],
                empty: false
            };
        }
    }
}

// 确保棋盘至少有一对可消除的
function ensureSolvable() {
    if (!hasAnyValidPair()) {
        // 如果没有可消除的，随机交换两个格子
        let attempts = 0;
        while (!hasAnyValidPair() && attempts < 50) {
            const r1 = rand(game.rows), c1 = rand(game.cols);
            const r2 = rand(game.rows), c2 = rand(game.cols);
            if (r1 !== r2 || c1 !== c2) {
                swapCells(r1, c1, r2, c2);
            }
            attempts++;
        }
    }
}

function rand(n) { return Math.floor(Math.random() * n); }

function swapCells(r1, c1, r2, c2) {
    const tmp = game.board[r1][c1].emoji;
    game.board[r1][c1].emoji = game.board[r2][c2].emoji;
    game.board[r2][c2].emoji = tmp;
}

// ==================== 路径查找（核心算法）====================
/**
 * BFS 查找两点之间是否有合法路径
 * 最多2个拐角（3条直线段）
 * @returns {Array|null} 路径点数组 [{r,c}, ...] 或 null
 */
function findPath(r1, c1, r2, c2) {
    if (r1 === r2 && c1 === c2) return null;
    if (game.board[r1][c1].emoji !== game.board[r2][c2].emoji) return null;

    // 方向：上右下左
    const dr = [-1, 0, 1, 0];
    const dc = [0, 1, 0, -1];

    // BFS: [r, c, dir, turns, path]
    const queue = [];
    const visited = new Set();

    // 从4个方向出发
    for (let d = 0; d < 4; d++) {
        const nr = r1 + dr[d];
        const nc = c1 + dc[d];
        if (isValid(nr, nc)) {
            queue.push({ r: nr, c: nc, dir: d, turns: 0, path: [{r: r1, c: c1}] });
            visited.add(key(nr, nc, d, 0));
        }
    }

    while (queue.length > 0) {
        const cur = queue.shift();

        // 到达终点
        if (cur.r === r2 && cur.c === c2) {
            return [...cur.path, { r: r2, c: c2 }];
        }

        // 继续向当前方向走
        for (let d = 0; d < 4; d++) {
            const nr = cur.r + dr[d];
            const nc = cur.c + dc[d];
            const newTurns = cur.dir === d ? cur.turns : cur.turns + 1;

            if (newTurns > 2) continue; // 最多2个拐角
            if (!isValid(nr, nc)) continue;

            const k = key(nr, nc, d, newTurns);
            if (visited.has(k)) continue;
            visited.add(k);

            queue.push({
                r: nr, c: nc, dir: d, turns: newTurns,
                path: [...cur.path, { r: cur.r, c: cur.c }]
            });
        }
    }

    return null;
}

function isValid(r, c) {
    // 在棋盘范围内，且为空或到达终点
    if (r < 0 || r >= game.rows || c < 0 || c >= game.cols) return true; // 超出棋盘算空
    return game.board[r][c].empty;
}

function key(r, c, dir, turns) {
    return `${r},${c},${dir},${turns}`;
}

// 修正 isValid：路径可以穿过空格子，但不能穿过非空格子（除了起点和终点）
// 重新实现 findPath，正确的路径检查
function findPath(r1, c1, r2, c2) {
    if (r1 === r2 && c1 === c2) return null;
    if (game.board[r1][c1].empty || game.board[r2][c2].empty) return null;
    if (game.board[r1][c1].emoji !== game.board[r2][c2].emoji) return null;

    const dr = [-1, 0, 1, 0]; // 上右下左
    const dc = [0, 1, 0, -1];

    // BFS 状态: [r, c, dir, turns]
    const queue = [];
    const visited = new Set();
    const parent = new Map(); // 用于重建路径
    const parentKey = new Map();

    // 从起点向4个方向出发
    for (let d = 0; d < 4; d++) {
        const nr = r1 + dr[d];
        const nc = c1 + dc[d];
        if (canPass(nr, nc) || (nr === r2 && nc === c2)) {
            const state = { r: nr, c: nc, dir: d, turns: 0 };
            queue.push(state);
            visited.add(stateKey(state));
            parent.set(stateKey(state), { r: r1, c: c1 });
            parentKey.set(stateKey(state), null);
        }
    }

    while (queue.length > 0) {
        const cur = queue.shift();

        // 到达终点
        if (cur.r === r2 && cur.c === c2) {
            // 重建路径
            const path = [{ r: r2, c: c2 }];
            let k = stateKey(cur);
            while (k) {
                const p = parent.get(k);
                if (p) path.unshift(p);
                k = parentKey.get(k);
            }
            return path;
        }

        // 向4个方向扩展
        for (let d = 0; d < 4; d++) {
            const nr = cur.r + dr[d];
            const nc = cur.c + dc[d];
            const newTurns = (cur.dir === d) ? cur.turns : cur.turns + 1;

            if (newTurns > 2) continue;
            if (!canPass(nr, nc) && !(nr === r2 && nc === c2)) continue;

            const nextState = { r: nr, c: nc, dir: d, turns: newTurns };
            const k = stateKey(nextState);
            if (visited.has(k)) continue;
            visited.add(k);

            queue.push(nextState);
            parent.set(k, { r: cur.r, c: cur.c });
            parentKey.set(k, stateKey(cur));
        }
    }

    return null;
}

function canPass(r, c) {
    // 边界外最多允许紧邻1格，超过则不可通行（防止BFS无限探索）
    if (r < -1 || r > game.rows || c < -1 || c > game.cols) return false;
    // 边界外紧邻1格 - 可以穿过
    if (r < 0 || r >= game.rows || c < 0 || c >= game.cols) return true;
    // 空格子 - 可以穿过
    return game.board[r][c].empty;
}

function stateKey(s) {
    return `${s.r},${s.c},${s.dir},${s.turns}`;
}

// ==================== 格子点击处理 ====================
function onCellClick(r, c) {
    if (!game.isRunning || game.isPaused) return;
    if (game.board[r][c].empty) return;

    // 清除之前的提示高亮
    clearHints();

    // 如果已经选中了一个，检查是否匹配
    if (game.selected) {
        const sr = game.selected.r, sc = game.selected.c;

        // 点击同一个格子，取消选中
        if (sr === r && sc === c) {
            deselect();
            return;
        }

        game.totalMoves++;

        // 检查路径
        const path = findPath(sr, sc, r, c);

        if (path) {
            // 匹配成功
            game.successfulMoves++;
            game.combo++;
            if (game.combo > game.maxCombo) game.maxCombo = game.combo;

            // 分数计算
            const baseScore = 10;
            const comboMultiplier = Math.min(game.combo, 5);
            game.score += baseScore * comboMultiplier;

            // 显示连线动画
            drawLine(path);

            // 消除
            setTimeout(() => {
                removeCells(sr, sc, r, c);
                hideLine();
                deselect();
                game.pairsRemaining--;
                updateHUD();

                // 检查胜利
                if (game.pairsRemaining <= 0) {
                    endGame(true);
                    return;
                }

                // 检查死局
                if (!hasAnyValidPair()) {
                    // 自动重排一次
                    autoShuffle();
                }
            }, 300);
        } else {
            // 匹配失败
            game.combo = 0;
            game.failedClicks++;
            deselect();
            shakeCell(r, c);
            shakeCell(sr, sc);
            updateHUD();
        }
    } else {
        // 选中第一个
        game.selected = { r, c };
        highlightCell(r, c, true);
    }
}

function deselect() {
    if (game.selected) {
        highlightCell(game.selected.r, game.selected.c, false);
        game.selected = null;
    }
}

// ==================== 消除与重力 ====================
function removeCells(r1, c1, r2, c2) {
    // 标记为空
    game.board[r1][c1].empty = true;
    game.board[r2][c2].empty = true;

    // 粒子效果
    spawnParticles(r1, c1);
    spawnParticles(r2, c2);

    // 重力下落：每列中，上方的 emoji 向下落
    for (let c = 0; c < game.cols; c++) {
        // 收集该列非空元素（从下到上）
        let writeRow = game.rows - 1;
        for (let r = game.rows - 1; r >= 0; r--) {
            if (!game.board[r][c].empty) {
                if (writeRow !== r) {
                    game.board[writeRow][c] = { ...game.board[r][c] };
                    game.board[r][c].empty = true;
                }
                writeRow--;
            }
        }
        // 清空剩余位置
        for (let r = writeRow; r >= 0; r--) {
            game.board[r][c].empty = true;
        }
    }

    renderBoard();
}

// ==================== 提示功能 ====================
function useHint() {
    if (!game.isRunning || game.isPaused || game.hints <= 0) return;

    clearHints();

    // 找到一对可消除的
    const pair = findAnyValidPair();
    if (!pair) {
        // 没有可消除的，自动重排
        autoShuffle();
        return;
    }

    game.hints--;
    updateTools();

    // 高亮提示
    game.hintCells = [pair[0], pair[1]];
    const cell1 = getCellElement(pair[0].r, pair[0].c);
    const cell2 = getCellElement(pair[1].r, pair[1].c);
    if (cell1) cell1.classList.add('hint');
    if (cell2) cell2.classList.add('hint');

    // 3秒后清除
    setTimeout(clearHints, 3000);
}

function clearHints() {
    game.hintCells.forEach(p => {
        const el = getCellElement(p.r, p.c);
        if (el) el.classList.remove('hint');
    });
    game.hintCells = [];
}

// ==================== 重排功能 ====================
function useShuffle() {
    if (!game.isRunning || game.isPaused || game.shuffles <= 0) return;
    autoShuffle();
    game.shuffles--;
    updateTools();
}

function autoShuffle() {
    // 收集所有非空格子的 emoji
    const emojis = [];
    for (let r = 0; r < game.rows; r++) {
        for (let c = 0; c < game.cols; c++) {
            if (!game.board[r][c].empty) {
                emojis.push(game.board[r][c].emoji);
            }
        }
    }

    // Fisher-Yates 洗牌
    for (let i = emojis.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [emojis[i], emojis[j]] = [emojis[j], emojis[i]];
    }

    // 重新分配
    let idx = 0;
    for (let r = 0; r < game.rows; r++) {
        for (let c = 0; c < game.cols; c++) {
            if (!game.board[r][c].empty) {
                game.board[r][c].emoji = emojis[idx++];
            }
        }
    }

    deselect();
    renderBoard();
}

// ==================== 死局检测 ====================
function hasAnyValidPair() {
    const nonEmpty = [];
    for (let r = 0; r < game.rows; r++) {
        for (let c = 0; c < game.cols; c++) {
            if (!game.board[r][c].empty) {
                nonEmpty.push({ r, c, emoji: game.board[r][c].emoji });
            }
        }
    }

    // 按 emoji 分组
    const groups = {};
    nonEmpty.forEach(cell => {
        if (!groups[cell.emoji]) groups[cell.emoji] = [];
        groups[cell.emoji].push(cell);
    });

    // 检查每种 emoji 是否有可连接的一对
    for (const emoji in groups) {
        const cells = groups[emoji];
        for (let i = 0; i < cells.length; i++) {
            for (let j = i + 1; j < cells.length; j++) {
                if (findPath(cells[i].r, cells[i].c, cells[j].r, cells[j].c)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function findAnyValidPair() {
    const nonEmpty = [];
    for (let r = 0; r < game.rows; r++) {
        for (let c = 0; c < game.cols; c++) {
            if (!game.board[r][c].empty) {
                nonEmpty.push({ r, c, emoji: game.board[r][c].emoji });
            }
        }
    }

    const groups = {};
    nonEmpty.forEach(cell => {
        if (!groups[cell.emoji]) groups[cell.emoji] = [];
        groups[cell.emoji].push(cell);
    });

    for (const emoji in groups) {
        const cells = groups[emoji];
        for (let i = 0; i < cells.length; i++) {
            for (let j = i + 1; j < cells.length; j++) {
                if (findPath(cells[i].r, cells[i].c, cells[j].r, cells[j].c)) {
                    return [cells[i], cells[j]];
                }
            }
        }
    }
    return null;
}

// ==================== 渲染 ====================
function renderBoard() {
    const boardEl = document.getElementById('gameBoard');
    boardEl.innerHTML = '';

    // 设置 grid 列数
    boardEl.style.gridTemplateColumns = `repeat(${game.cols}, 1fr)`;

    for (let r = 0; r < game.rows; r++) {
        for (let c = 0; c < game.cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.r = r;
            cell.dataset.c = c;

            if (game.board[r][c].empty) {
                cell.classList.add('empty');
            } else {
                cell.textContent = game.board[r][c].emoji;
                cell.addEventListener('click', () => onCellClick(r, c));
            }

            boardEl.appendChild(cell);
        }
    }

    // 重新选中
    if (game.selected) {
        highlightCell(game.selected.r, game.selected.c, true);
    }
}

function highlightCell(r, c, on) {
    const el = getCellElement(r, c);
    if (el) {
        el.classList.toggle('selected', on);
    }
}

function shakeCell(r, c) {
    const el = getCellElement(r, c);
    if (el) {
        el.classList.remove('shake');
        void el.offsetWidth; // reflow
        el.classList.add('shake');
    }
}

function getCellElement(r, c) {
    return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

// ==================== 连线绘制 ====================
function drawLine(path) {
    const svg = document.getElementById('lineLayer');
    const board = document.getElementById('gameBoard');

    // 获取棋盘的实际位置和尺寸
    const boardRect = board.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    // 计算每个格子的大小（基于渲染后的棋盘）
    const cellW = boardRect.width / game.cols;
    const cellH = boardRect.height / game.rows;

    // 计算格子中心点
    const points = path.map(p => {
        let r = p.r, c = p.c;
        // 对于超出边界的点，取边界外的一个合理位置
        if (r < 0) r = -0.5;
        if (r >= game.rows) r = game.rows - 0.5;
        if (c < 0) c = -0.5;
        if (c >= game.cols) c = game.cols - 0.5;

        const x = boardRect.left - svgRect.left + c * cellW + cellW / 2;
        const y = boardRect.top - svgRect.top + r * cellH + cellH / 2;
        return `${x},${y}`;
    });

    // 创建折线
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points.join(' '));
    polyline.setAttribute('class', 'line-path');

    svg.innerHTML = `
        <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#00f5ff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#bc13fe;stop-opacity:1" />
            </linearGradient>
        </defs>
    `;
    svg.appendChild(polyline);
    svg.style.display = 'block';
}

function hideLine() {
    document.getElementById('lineLayer').style.display = 'none';
}

// ==================== 粒子效果 ====================
function spawnParticles(r, c) {
    const layer = document.getElementById('particleLayer');
    const cell = getCellElement(r, c);
    if (!cell) return;

    const rect = cell.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const emojis = ['✨', '⭐', '💫', '🌟'];
    for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.left = cx + 'px';
        p.style.top = cy + 'px';

        const angle = (Math.PI * 2 * i) / 6;
        const dist = 30 + Math.random() * 30;
        p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);

        layer.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

// ==================== HUD 更新 ====================
function updateHUD() {
    document.getElementById('score').textContent = game.score;
    document.getElementById('timer').textContent = game.remainingTime;
    document.getElementById('remaining').textContent = game.pairsRemaining;

    // 时间条
    const pct = game.remainingTime / game.totalTime * 100;
    document.getElementById('timeFill').style.width = pct + '%';

    // Combo
    const comboBox = document.getElementById('comboBox');
    const comboEl = document.getElementById('combo');
    if (game.combo > 1) {
        comboBox.style.display = 'flex';
        comboEl.textContent = 'x' + game.combo;
        // 重新触发动画
        comboBox.classList.remove('combo');
        void comboBox.offsetWidth;
        comboBox.classList.add('combo');
    } else {
        comboBox.style.display = 'none';
    }
}

function updateTools() {
    document.getElementById('hintCount').textContent = game.hints;
    document.getElementById('shuffleCount').textContent = game.shuffles;

    document.getElementById('btnHint').disabled = game.hints <= 0;
    document.getElementById('btnShuffle').disabled = game.shuffles <= 0;
}

// ==================== 计时器 ====================
function tick() {
    if (game.isPaused) return;
    game.remainingTime--;
    updateHUD();

    if (game.remainingTime <= 0) {
        endGame(false);
    }
}

// ==================== 暂停 ====================
function togglePause() {
    if (!game.isRunning) return;
    game.isPaused = !game.isPaused;

    const modal = document.getElementById('pauseModal');
    if (game.isPaused) {
        modal.classList.add('show');
    } else {
        modal.classList.remove('show');
    }
}

function hidePause() {
    document.getElementById('pauseModal').classList.remove('show');
}

// ==================== 游戏结束 ====================
function endGame(won) {
    clearInterval(game.timer);
    game.isRunning = false;
    game.isPaused = false;

    const duration = Math.floor((Date.now() - game.startTime) / 1000);
    const avgTime = game.successfulMoves > 0 ? (duration / game.successfulMoves).toFixed(1) : '0';

    // 调用诊断系统
    if (typeof LinkUpDiagnosis !== 'undefined') {
        LinkUpDiagnosis.show({
            score: game.score,
            won: won,
            duration: duration,
            successfulMoves: game.successfulMoves,
            failedClicks: game.failedClicks,
            maxCombo: game.maxCombo,
            avgTime: parseFloat(avgTime),
            hintsUsed: DIFFICULTY[document.querySelector('.diff-btn.active')?.dataset.diff || 'easy'].hint - game.hints,
            remainingTime: game.remainingTime,
            difficulty: document.querySelector('.diff-btn.active')?.dataset.diff || 'easy'
        });
    }
}

// ==================== 启动 ====================
init();
