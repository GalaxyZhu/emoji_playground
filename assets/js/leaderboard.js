/**
 * Leaderboard.js - Firebase v9+ 排行榜模块
 * 用于 emoji-playground 项目的全球排行榜功能
 *
 * 参考：Firebase v9 modular API 最佳实践
 * 作者：Kimi Claw
 */

// Firebase v9+ modular imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// ── i18n ─────────────────────────────────────────────
const i18n = {
  en: {
    title: '🏆 Global Leaderboard',
    rank: 'Rank',
    player: 'Player',
    score: 'Score',
    time: 'Time',
    duration: 'Time',
    when: 'Record',
    close: 'Close',
    enterNickname: 'Enter your nickname to join the leaderboard',
    nicknamePlaceholder: 'Your nickname',
    submit: 'Submit',
    skip: 'Skip',
    yourBest: 'Your best',
    rankSuffix: 'Rank',
    noRank: '--',
    points: 'points',
    newHighScore: '🎉 New High Score!',
  },
  zh: {
    title: '🏆 全球排行榜',
    rank: '排名',
    player: '玩家',
    score: '分数',
    time: '时间',
    close: '关闭',
    enterNickname: '输入昵称加入排行榜',
    nicknamePlaceholder: '你的昵称',
    submit: '提交',
    skip: '跳过',
    yourBest: '你的最佳',
    rankSuffix: '排名',
    noRank: '--',
    points: '分',
    newHighScore: '🎉 新纪录！',
  },
};

let currentLang = 'zh';
let rankBy = 'score'; // 'score' | 'time'

function t(key) {
  return i18n[currentLang]?.[key] ?? i18n.en[key];
}

/**
 * 格式化耗时（秒 → 可读字符串）
 */
function formatDuration(seconds) {
  if (seconds == null || isNaN(seconds)) return '--';
  const s = Math.floor(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}m ${rs}s`;
}

import { firebaseConfig } from './firebase-config.js';

// ── 初始化 ──────────────────────────────────────────
let app;
let db;
let auth;
let currentUser = null;
let currentGameId = null;

/**
 * 格式化时间戳为可读字符串
 */
function formatTime(ts) {
  if (!ts) return '--';
  let date;
  if (ts.toDate) {
    date = ts.toDate();
  } else if (typeof ts === 'number') {
    date = new Date(ts);
  } else {
    date = new Date(ts);
  }
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (currentLang === 'zh') {
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  } else {
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * 创建排行榜弹窗 DOM 结构
 */
function createModalDOM() {
  if (document.getElementById('leaderboard-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'leaderboard-modal';
  modal.innerHTML = `
    <div class="lb-overlay"></div>
    <div class="lb-container">
      <div class="lb-header">
        <h2 class="lb-title">${t('title')}</h2>
      </div>
      <div class="lb-body">
        <div class="lb-list"></div>
        <div class="lb-player-info"></div>
      </div>
      <div class="lb-footer">
        <button class="lb-close-btn">${t('close')}</button>
      </div>
    </div>
    <div class="lb-nickname-modal" style="display:none;">
      <div class="lb-nickname-box">
        <p class="lb-nickname-label">${t('enterNickname')}</p>
        <input type="text" class="lb-nickname-input" maxlength="16" placeholder="${t('nicknamePlaceholder')}" />
        <div class="lb-nickname-actions">
          <button class="lb-nickname-submit">${t('submit')}</button>
          <button class="lb-nickname-skip">${t('skip')}</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // 绑定关闭事件
  modal.querySelector('.lb-overlay').addEventListener('click', () => Leaderboard.hideModal());
  modal.querySelector('.lb-close-btn').addEventListener('click', () => Leaderboard.hideModal());

  // 昵称弹窗事件
  const nicknameModal = modal.querySelector('.lb-nickname-modal');
  const input = modal.querySelector('.lb-nickname-input');
  const submitBtn = modal.querySelector('.lb-nickname-submit');
  const skipBtn = modal.querySelector('.lb-nickname-skip');

  let nicknameResolve = null;

  submitBtn.addEventListener('click', () => {
    const val = input.value.trim();
    if (val) {
      nicknameModal.style.display = 'none';
      input.value = '';
      nicknameResolve?.(val);
    }
  });

  skipBtn.addEventListener('click', () => {
    nicknameModal.style.display = 'none';
    input.value = '';
    nicknameResolve?.(null);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitBtn.click();
    if (e.key === 'Escape') skipBtn.click();
  });

  // 注入样式
  if (!document.getElementById('leaderboard-styles')) {
    const style = document.createElement('style');
    style.id = 'leaderboard-styles';
    style.textContent = `
      #leaderboard-modal {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: none;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #leaderboard-modal.active { display: flex; }
      .lb-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
      }
      .lb-container {
        position: relative;
        background: #1e293b;
        border-radius: 16px;
        max-width: 400px;
        width: 90%;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      }
      .lb-header {
        padding: 20px 24px 12px;
        text-align: center;
        border-bottom: 1px solid #334155;
      }
      .lb-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #f8fafc;
      }
      .lb-body {
        flex: 1;
        overflow-y: auto;
        padding: 0;
      }
      .lb-list {
        padding: 8px 0;
      }
      .lb-item {
        display: flex;
        align-items: center;
        padding: 10px 20px;
        gap: 12px;
        transition: background 0.15s;
      }
      .lb-item:hover { background: #27354d; }
      .lb-item.lb-self {
        background: rgba(234, 179, 8, 0.15);
        border-left: 3px solid #eab308;
      }
      .lb-rank {
        width: 48px;
        text-align: center;
        font-weight: 700;
        font-size: 0.875rem;
        color: #94a3b8;
      }
      .lb-item:nth-child(1) .lb-rank { color: #fbbf24; font-size: 1.125rem; }
      .lb-item:nth-child(2) .lb-rank { color: #cbd5e1; }
      .lb-item:nth-child(3) .lb-rank { color: #b45309; }
      .lb-name {
        flex: 1;
        font-size: 0.875rem;
        color: #e2e8f0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .lb-score {
        font-size: 0.875rem;
        font-weight: 600;
        color: #38bdf8;
        text-align: right;
        min-width: 48px;
      }
      .lb-time {
        font-size: 0.75rem;
        color: #64748b;
        min-width: 56px;
        text-align: right;
      }
      .lb-player-info {
        padding: 12px 20px;
        border-top: 1px solid #334155;
        text-align: center;
        font-size: 0.875rem;
        color: #94a3b8;
      }
      .lb-player-info .lb-highlight {
        color: #eab308;
        font-weight: 600;
      }
      .lb-footer {
        padding: 12px 20px 20px;
        text-align: center;
      }
      .lb-close-btn {
        background: #475569;
        color: #f1f5f9;
        border: none;
        border-radius: 10px;
        padding: 10px 28px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
      }
      .lb-close-btn:hover { background: #64748b; }
      .lb-nickname-modal {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.7);
        z-index: 10;
      }
      .lb-nickname-box {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 14px;
        padding: 24px;
        max-width: 320px;
        width: 85%;
        text-align: center;
      }
      .lb-nickname-label {
        margin: 0 0 16px;
        color: #e2e8f0;
        font-size: 0.9375rem;
      }
      .lb-nickname-input {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 14px;
        border: 1px solid #475569;
        border-radius: 10px;
        background: #0f172a;
        color: #f8fafc;
        font-size: 1rem;
        outline: none;
        margin-bottom: 16px;
      }
      .lb-nickname-input:focus { border-color: #38bdf8; }
      .lb-nickname-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
      .lb-nickname-submit {
        background: #38bdf8;
        color: #0f172a;
        border: none;
        border-radius: 10px;
        padding: 8px 20px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
      }
      .lb-nickname-skip {
        background: transparent;
        color: #94a3b8;
        border: 1px solid #475569;
        border-radius: 10px;
        padding: 8px 20px;
        font-size: 0.875rem;
        cursor: pointer;
      }
      .lb-empty {
        text-align: center;
        padding: 32px;
        color: #64748b;
        font-size: 0.875rem;
      }
      .lb-list-header {
        display: flex;
        padding: 8px 20px;
        gap: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .lb-list-header .lb-rank { color: #64748b; }
    `;
    document.head.appendChild(style);
  }
}

/**
 * 请求玩家输入昵称
 */
/**
 * 请求玩家输入昵称（独立弹窗，不依赖 leaderboard modal）
 */
function askNickname() {
  return new Promise((resolve) => {
    const id = 'lb-nickname-only';
    let modal = document.getElementById(id);

    // 创建独立弹窗 DOM
    if (!modal) {
      modal = document.createElement('div');
      modal.id = id;
      modal.innerHTML = `
        <div class="lb-nick-overlay"></div>
        <div class="lb-nick-box">
          <p class="lb-nick-label">${t('enterNickname')}</p>
          <input type="text" class="lb-nick-input" maxlength="16" placeholder="${t('nicknamePlaceholder')}" />
          <div class="lb-nick-actions">
            <button class="lb-nick-submit">${t('submit')}</button>
            <button class="lb-nick-skip">${t('skip')}</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // 注入独立样式（只注入一次）
      if (!document.getElementById('lb-nick-styles')) {
        const style = document.createElement('style');
        style.id = 'lb-nick-styles';
        style.textContent = `
          #${id} {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: none;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          #${id}.active { display: flex; }
          .lb-nick-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.85);
          }
          .lb-nick-box {
            position: relative;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 28px;
            max-width: 340px;
            width: 85%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          }
          .lb-nick-label {
            margin: 0 0 18px;
            color: #f8fafc;
            font-size: 1rem;
            font-weight: 600;
          }
          .lb-nick-input {
            width: 100%;
            box-sizing: border-box;
            padding: 12px 16px;
            border: 1px solid #475569;
            border-radius: 12px;
            background: #0f172a;
            color: #f8fafc;
            font-size: 1rem;
            outline: none;
            margin-bottom: 18px;
          }
          .lb-nick-input:focus { border-color: #38bdf8; }
          .lb-nick-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
          }
          .lb-nick-submit {
            flex: 1;
            background: #38bdf8;
            color: #0f172a;
            border: none;
            border-radius: 12px;
            padding: 10px 20px;
            font-size: 0.9375rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.15s;
          }
          .lb-nick-submit:hover { background: #7dd3fc; }
          .lb-nick-skip {
            flex: 1;
            background: transparent;
            color: #94a3b8;
            border: 1px solid #475569;
            border-radius: 12px;
            padding: 10px 20px;
            font-size: 0.9375rem;
            cursor: pointer;
            transition: all 0.15s;
          }
          .lb-nick-skip:hover { border-color: #94a3b8; color: #e2e8f0; }
        `;
        document.head.appendChild(style);
      }
    }

    const input = modal.querySelector('.lb-nick-input');
    const submitBtn = modal.querySelector('.lb-nick-submit');
    const skipBtn = modal.querySelector('.lb-nick-skip');

    // 清理并关闭
    const cleanup = () => {
      input.value = '';
      modal.classList.remove('active');
    };

    // 绑定事件（每次重新绑定，避免残留）
    const newSubmit = submitBtn.cloneNode(true);
    const newSkip = skipBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmit, submitBtn);
    skipBtn.parentNode.replaceChild(newSkip, skipBtn);

    newSubmit.addEventListener('click', () => {
      const val = input.value.trim();
      if (val) {
        cleanup();
        resolve(val);
      }
    });

    newSkip.addEventListener('click', () => {
      cleanup();
      resolve(null);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') newSubmit.click();
      if (e.key === 'Escape') newSkip.click();
    });

    // 点击遮罩关闭
    modal.querySelector('.lb-nick-overlay').onclick = () => {
      cleanup();
      resolve(null);
    };

    // 显示弹窗
    modal.classList.add('active');
    setTimeout(() => input.focus(), 50);
  });
}

/**
 * 检查并获取玩家昵称
 * 优先读取首页用户系统统一设置的昵称，避免重复弹窗
 */
async function ensureNickname(uid) {
  if (!db || !currentGameId) return null;

  const playerDocRef = doc(db, 'leaderboards', currentGameId, 'players', uid);
  const snap = await getDoc(playerDocRef);

  // 如果 Firestore 已有昵称，直接返回
  if (snap.exists() && snap.data().nickname) {
    return snap.data().nickname;
  }

  // 优先读取首页用户系统设置的昵称（统一入口）
  const globalNickname = localStorage.getItem('emoji_arcade_nickname');
  if (globalNickname) {
    await setDoc(playerDocRef, { nickname: globalNickname, updatedAt: serverTimestamp() });
    return globalNickname;
  }

  // 完全没有昵称，弹出输入框（兜底）
  const nickname = await askNickname();
  if (nickname) {
    await setDoc(playerDocRef, { nickname, updatedAt: serverTimestamp() });
  }
  return nickname;
}

/**
 * 获取排行榜列表（内存排序，避免 Firestore 索引要求）
 */
async function fetchLeaderboard() {
  if (!db || !currentGameId) return [];

  const colRef = collection(db, 'leaderboards', currentGameId, 'scores');
  const snap = await getDocs(colRef);

  const entries = snap.docs.map(d => ({
    ...d.data(),
    id: d.id,
  }));

  // 内存排序：按主指标排序，取前50
  if (rankBy === 'time') {
    entries.sort((a, b) => (a.duration || Infinity) - (b.duration || Infinity));
  } else {
    entries.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  return entries.slice(0, 50).map((e, idx) => ({
    rank: idx + 1,
    ...e,
  }));
}

/**
 * 获取玩家个人最佳成绩（内存过滤，避免复合索引）
 */
async function fetchPlayerBest(uid) {
  if (!db || !currentGameId || !uid) return null;

  const colRef = collection(db, 'leaderboards', currentGameId, 'scores');
  const snap = await getDocs(colRef);

  const userScores = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(e => e.uid === uid);

  if (!userScores.length) return null;

  if (rankBy === 'time') {
    // 耗时越短越好
    userScores.sort((a, b) => (a.duration || Infinity) - (b.duration || Infinity));
  } else {
    // 分数越高越好
    userScores.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  return userScores[0];
}

/**
 * 渲染排行榜列表
 */
function renderList(entries, playerUid) {
  const modal = document.getElementById('leaderboard-modal');
  const listEl = modal.querySelector('.lb-list');

  if (!entries.length) {
    listEl.innerHTML = `<div class="lb-empty">No scores yet. Be the first!</div>`;
    return;
  }

  const header = rankBy === 'time'
    ? `<div class="lb-list-header">
    <span class="lb-rank">${t('rank')}</span>
    <span class="lb-name">${t('player')}</span>
    <span class="lb-score">${t('duration')}</span>
    <span class="lb-time">${t('when')}</span>
  </div>`
    : `<div class="lb-list-header">
    <span class="lb-rank">${t('rank')}</span>
    <span class="lb-name">${t('player')}</span>
    <span class="lb-score">${t('score')}</span>
    <span class="lb-time">${t('time')}</span>
  </div>`;

  const rows = entries.map((entry) => {
    const isSelf = entry.uid === playerUid;
    const primaryValue = rankBy === 'time'
      ? formatDuration(entry.duration)
      : (entry.score ?? '--');
    const secondaryValue = rankBy === 'time'
      ? formatTime(entry.timestamp)
      : formatTime(entry.timestamp);
    return `
      <div class="lb-item ${isSelf ? 'lb-self' : ''}">
        <span class="lb-rank">${entry.rank}</span>
        <span class="lb-name">${escapeHtml(entry.nickname || 'Anonymous')}</span>
        <span class="lb-score">${primaryValue}</span>
        <span class="lb-time">${secondaryValue}</span>
      </div>
    `;
  }).join('');

  listEl.innerHTML = header + rows;
}

/**
 * 渲染玩家信息栏
 */
function renderPlayerInfo(bestEntry, rank) {
  const modal = document.getElementById('leaderboard-modal');
  const infoEl = modal.querySelector('.lb-player-info');

  if (bestEntry === null) {
    infoEl.innerHTML = '';
    return;
  }

  const rankText = rank ? `<span class="lb-highlight">#${rank}</span>` : t('noRank');

  if (rankBy === 'time') {
    const bestTime = formatDuration(bestEntry.duration);
    infoEl.innerHTML = `${t('yourBest')}: <span class="lb-highlight">${bestTime}</span> · ${t('rankSuffix')}: ${rankText}`;
  } else {
    const bestScore = bestEntry.score ?? 0;
    infoEl.innerHTML = `${t('yourBest')}: <span class="lb-highlight">${bestScore} ${t('points')}</span> · ${t('rankSuffix')}: ${rankText}`;
  }
}

/**
 * 简单的 HTML 转义
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── 公开 API ─────────────────────────────────────────
const Leaderboard = {
  /**
   * 初始化 Firebase + 匿名登录
   * @param {string} gameId 游戏标识，如 "emoji-linkup"
   * @param {string} lang   语言，"zh" 或 "en"
   */
  async init(gameId, lang = 'zh', sortMode = 'score') {
    currentGameId = gameId;
    currentLang = lang === 'en' ? 'en' : 'zh';
    rankBy = sortMode === 'time' ? 'time' : 'score';

    if (!app) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
    }

    // 匿名登录
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          currentUser = user;
          resolve(user);
        } else {
          try {
            const cred = await signInAnonymously(auth);
            currentUser = cred.user;
            resolve(cred.user);
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  },

  /**
   * 提交分数
   * @param {number} score    分数
   * @param {object} data     额外数据，如 { difficulty: 'hard', level: 5 }
   * @returns {Promise<{nickname: string|null, isNewBest: boolean}>}
   */
  async submit(score, data = {}) {
    if (!currentUser || !db || !currentGameId) {
      throw new Error('Leaderboard not initialized. Call init() first.');
    }

    const uid = currentUser.uid;

    // 检查/获取昵称
    let nickname = await ensureNickname(uid);

    // 查询当前最佳，判断是否为新高
    const playerBest = await fetchPlayerBest(uid);
    const isNewBest = !playerBest || score > playerBest.score;

    // 写入分数记录（每次成绩都记录，便于追踪）
    const scoreId = `${uid}_${Date.now()}`;
    const scoreRef = doc(db, 'leaderboards', currentGameId, 'scores', scoreId);
    await setDoc(scoreRef, {
      score,
      nickname: nickname || 'Anonymous',
      uid,
      timestamp: serverTimestamp(),
      difficulty: data.difficulty || 'normal',
      ...data,
    });

    return { nickname, isNewBest };
  },

  /**
   * 获取前 50 名排行榜
   * @returns {Promise<Array>}
   */
  async getTop50() {
    if (!db || !currentGameId) {
      throw new Error('Leaderboard not initialized. Call init() first.');
    }
    return fetchLeaderboard();
  },

  /**
   * 获取玩家个人最佳成绩
   * @returns {Promise<object|null>}
   */
  async getPlayerBest() {
    if (!currentUser || !db || !currentGameId) {
      throw new Error('Leaderboard not initialized. Call init() first.');
    }
    return fetchPlayerBest(currentUser.uid);
  },

  /**
   * 显示排行榜弹窗
   * @param {Array}  entries    排行榜条目（可通过 getTop50 获取）
   * @param {number} playerRank 玩家排名（可选）
   */
  showModal(entries, playerRank) {
    createModalDOM();

    const modal = document.getElementById('leaderboard-modal');
    const titleEl = modal.querySelector('.lb-title');
    titleEl.textContent = t('title');

    renderList(entries || [], currentUser?.uid);

    // 获取玩家最佳并渲染底部信息
    const uid = currentUser?.uid;
    const selfEntry = entries?.find((e) => e.uid === uid);
    renderPlayerInfo(selfEntry || null, playerRank);

    modal.classList.add('active');
  },

  /**
   * 关闭排行榜弹窗
   */
  hideModal() {
    const modal = document.getElementById('leaderboard-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.querySelector('.lb-nickname-modal').style.display = 'none';
    }
  },

  /**
   * 切换语言
   * @param {string} lang "zh" 或 "en"
   */
  setLang(lang) {
    currentLang = lang === 'en' ? 'en' : 'zh';
  },

  /**
   * 获取当前用户
   */
  getCurrentUser() {
    return currentUser;
  },

  /**
   * 获取用户全局战绩（所有游戏）
   * @returns {Promise<Array>}  [{gameId, bestScore, bestTime, playCount, lastPlayed}]
   */
  async getUserGlobalStats() {
    if (!currentUser || !db) {
      throw new Error('Leaderboard not initialized. Call init() first.');
    }
    const uid = currentUser.uid;
    const games = ['emoji-linkup', 'emoji-shooter', 'emoji-match', 'emoji-survive',
                   'emoji-rush', 'emoji-drift', 'emoji-hop', 'emoji-frog',
                   'emoji-kart', 'emoji-rolling'];
    const results = [];

    for (const gameId of games) {
      try {
        const colRef = collection(db, 'leaderboards', gameId, 'scores');
        const snap = await getDocs(colRef);
        const userScores = snap.docs
          .map(d => d.data())
          .filter(e => e.uid === uid);

        if (userScores.length) {
          // 判断排序方式
          const isTimeMode = gameId === 'emoji-linkup'; // 可以扩展为从配置读取
          let bestEntry;
          if (isTimeMode) {
            bestEntry = userScores.sort((a, b) => (a.duration || Infinity) - (b.duration || Infinity))[0];
          } else {
            bestEntry = userScores.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
          }

          const timestamps = userScores.map(s => s.timestamp?.toDate?.() || new Date(s.timestamp)).filter(Boolean);
          const lastPlayed = timestamps.length ? new Date(Math.max(...timestamps)) : null;

          results.push({
            gameId,
            bestScore: bestEntry.score,
            bestTime: bestEntry.duration,
            playCount: userScores.length,
            lastPlayed,
          });
        }
      } catch (err) {
        console.warn(`[getUserGlobalStats] Failed for ${gameId}:`, err);
      }
    }

    return results;
  },

  /**
   * 获取用户成就列表
   * @returns {Promise<Array>}
   */
  async getAchievements() {
    if (!currentUser || !db) return [];
    const uid = currentUser.uid;

    try {
      const snap = await getDocs(collection(db, 'players', uid, 'achievements'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('[getAchievements] error:', err);
      return [];
    }
  },

  /**
   * 检查并授予成就
   * @param {string} gameId
   * @param {object} stats {score, duration, won, successfulMoves, maxCombo, ...}
   */
  async checkAndAwardAchievements(gameId, stats) {
    if (!currentUser || !db) return [];
    const uid = currentUser.uid;
    const newAchievements = [];

    const definitions = [
      { id: 'first-clear',    name: 'First Clear',    nameZh: '初出茅庐',   icon: '🏅',
        check: () => stats.won },
      { id: 'linkup-clear',   name: 'Link-Up Novice', nameZh: '连连看学徒', icon: '🥉',
        check: () => gameId === 'emoji-linkup' && stats.won },
      { id: 'linkup-10',      name: 'Link-Up Pro',    nameZh: '连连看高手', icon: '🥈',
        check: () => gameId === 'emoji-linkup' && stats.won },
      { id: 'linkup-50',      name: 'Link-Up Master', nameZh: '连连看大师', icon: '🥇',
        check: () => gameId === 'emoji-linkup' && stats.won },
      { id: 'lightning',      name: 'Lightning Hands',nameZh: '闪电手',     icon: '⚡',
        check: () => stats.duration && stats.duration < 30 },
      { id: 'combo-king',     name: 'Combo King',     nameZh: '连击王',     icon: '🔥',
        check: () => stats.maxCombo >= 20 },
      { id: 'shooter-clear',  name: 'Sharp Shooter',  nameZh: '神枪手',     icon: '🎯',
        check: () => gameId === 'emoji-shooter' && stats.won },
      { id: 'racer-clear',    name: 'Speed Racer',    nameZh: '赛车手',     icon: '🏎️',
        check: () => (gameId === 'emoji-rush' || gameId === 'emoji-drift' || gameId === 'emoji-kart') && stats.won },
    ];

    for (const def of definitions) {
      if (!def.check()) continue;

      const achRef = doc(db, 'players', uid, 'achievements', def.id);
      const snap = await getDoc(achRef);

      if (!snap.exists()) {
        await setDoc(achRef, {
          ...def,
          unlockedAt: serverTimestamp(),
        });
        newAchievements.push(def);
      }
    }

    return newAchievements;
  },
};

// 兼容 CommonJS / ESM / 浏览器全局
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Leaderboard };
} else if (typeof window !== 'undefined') {
  window.Leaderboard = Leaderboard;
}

export { Leaderboard };
export default Leaderboard;
;
