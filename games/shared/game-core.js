/* ===== Emoji Arcade — 统一游戏核心框架 =====
 * 提供：启动页 (GameLauncher) + 诊断系统 (GameDiagnosis)
 * 每个游戏只需提供 GameConfig 对象
 */

(function() {
  'use strict';

  const RARITY_COLORS = {
    common:    'linear-gradient(135deg,#94a3b8,#64748b)',
    rare:      'linear-gradient(135deg,#60a5fa,#3b82f6)',
    epic:      'linear-gradient(135deg,#a855f7,#7c3aed)',
    legendary: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
  };

  const RARITY_LABELS = {
    zh: { common: '常见', rare: '稀有', epic: '史诗', legendary: '传说' },
    en: { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' },
  };

  /* ---------- i18n helper ---------- */
  function T(obj, lang) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.zh || obj.en || '';
  }

  /* ---------- GameLauncher ---------- */
  class GameLauncher {
    constructor(config) {
      this.cfg = config;
      this.lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
      this.overlay = null;
    }

    show() {
      if (this.overlay) return;
      const cfg = this.cfg;
      const lang = this.lang;
      const bestKey = cfg.bestScoreKey || (cfg.id + 'Best');
      const bestScore = parseInt(localStorage.getItem(bestKey) || '0', 10);

      const html = `
        <div id="gameOverlay" class="game-overlay" style="
          position:fixed;inset:0;background:#0a0a0f;z-index:100;
          display:flex;align-items:center;justify-content:center;
          flex-direction:column;opacity:1;transition:opacity 0.3s;
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
          overflow-y:auto;padding:40px 20px;">
          <div style="text-align:center;max-width:360px;width:100%;">
            <div class="game-icon" style="
              font-size:52px;margin-bottom:16px;
              filter:drop-shadow(0 0 12px rgba(255,255,255,0.15));
              animation:gcBounce 2s ease-in-out infinite;">${cfg.emoji}</div>
            <div class="game-title" style="
              font-size:28px;font-weight:800;color:#fff;
              text-shadow:0 0 20px rgba(255,255,255,0.15);
              letter-spacing:1px;margin-bottom:4px;">${T(cfg.name, lang)}</div>
            <div class="game-tagline" style="
              color:#94a3b8;font-size:12px;margin-bottom:16px;
              line-height:1.5;">${T(cfg.tagline, lang)}</div>
            ${bestScore > 0 ? `<div class="game-best" style="
              color:#fbbf24;font-size:14px;font-weight:700;margin-bottom:20px;">
              🏆 ${lang==='zh'?'最高':'Best'}: ${bestScore}</div>` : ''}
            <div class="game-instructions" style="
              color:#94a3b8;font-size:12px;line-height:1.6;
              margin-bottom:24px;padding:0 10px;">${T(cfg.instructions, lang)}</div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
              <button id="gcStartBtn" style="
                padding:14px 36px;background:linear-gradient(135deg,#22c55e,#16a34a);
                color:#fff;border:none;border-radius:12px;font-size:16px;
                font-weight:700;cursor:pointer;transition:all 0.3s;
                box-shadow:0 8px 24px rgba(34,197,94,0.3);">${lang==='zh'?'🎮 开始游戏':'🎮 Play'}</button>
              <button id="gcHomeBtn" style="
                padding:14px 36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
                color:#fff;border:none;border-radius:12px;font-size:16px;
                font-weight:700;cursor:pointer;text-decoration:none;
                transition:all 0.3s;">${lang==='zh'?'🏠 回到街机厅':'🏠 Arcade'}</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
      this.overlay = document.getElementById('gameOverlay');
      document.getElementById('gcStartBtn').addEventListener('click', () => this.hide());
      const homeBtn = document.getElementById('gcHomeBtn');
      if (homeBtn) homeBtn.addEventListener('click', () => GameLauncher.goHome());
    }

    hide() {
      if (!this.overlay) return;
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        if (this.overlay) { this.overlay.remove(); this.overlay = null; }
      }, 300);
    }

    /* 统一返回街机厅：优先调用父页面 closeGame，fallback 到 URL 跳转 */
    static goHome() {
      try {
        if (window.parent && window.parent !== window && typeof window.parent.closeGame === 'function') {
          window.parent.closeGame();
          return;
        }
      } catch (e) { /* 跨域忽略 */ }
      const lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
      location.href = `../../index.html?lang=${lang}`;
    }
  }

  /* ---------- GameDiagnosis ---------- */
  class GameDiagnosis {
    constructor(config) {
      this.cfg = config;
      this.lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
    }

    show(stats) {
      const diag = this.cfg.diagnosis;
      if (!diag || !diag.types) return;
      const lang = this.lang;
      const typeKey = diag.detectType(stats);
      const type = diag.types[typeKey] || diag.types.AVERAGE || Object.values(diag.types)[0];
      if (!type) return;

      const roastPool = type.roasts ? (type.roasts[lang] || type.roasts.zh || type.roasts.en || []) : [];
      const roast = roastPool.length > 0 ? roastPool[Math.floor(Math.random() * roastPool.length)] : '';
      const quote = T(type.quote, lang);
      const title = T(type.title, lang);
      const rareClass = type.rarityClass || 'common';
      const rareLabel = (RARITY_LABELS[lang] || RARITY_LABELS.zh)[rareClass] || rareClass;
      const rareColor = RARITY_COLORS[rareClass] || RARITY_COLORS.common;
      const rarePercent = type.rarePercent || '?';
      const icon = type.icon || this.cfg.emoji;
      const tag = lang === 'zh' ? `🎮 ${T(this.cfg.name, lang)} 诊断` : `🎮 ${T(this.cfg.name, lang)} Diagnosis`;
      const confirmed = lang === 'zh' ? '确诊' : 'DIAGNOSED';
      const roastTitle = lang === 'zh' ? '💬 专属吐槽' : '💬 Roast';
      const shareText = lang === 'zh' ? '分享你的诊断报告' : 'Share your diagnosis';
      const replay = lang === 'zh' ? '🔄 再来一局' : '🔄 Play Again';
      const copied = lang === 'zh' ? '已复制！' : 'Copied!';

      const bestKey = this.cfg.bestScoreKey || (this.cfg.id + 'Best');
      const bestScore = parseInt(localStorage.getItem(bestKey) || '0', 10);
      const isNewRecord = (stats.score || 0) > 0 && (stats.score >= bestScore);
      const newRecordText = isNewRecord ? (lang === 'zh' ? '✨ 新纪录！' : '✨ NEW RECORD!') : '';

      // Build stat grid from statsLabels
      const labels = diag.statsLabels || {};
      const statEntries = Object.entries(stats).filter(([k]) => labels[k]);
      let statGrid = '';
      if (statEntries.length > 0) {
        statGrid = statEntries.map(([k, v]) => {
          const label = T(labels[k], lang);
          return `<div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;">
            <div style="font-size:18px;font-weight:800;color:#3b82f6;">${v}</div>
            <div style="font-size:11px;color:#94a3b8;">${label}</div>
          </div>`;
        }).join('');
      }
      if (bestScore > 0) {
        statGrid += `<div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;">
          <div style="font-size:18px;font-weight:800;color:#fbbf24;">${bestScore}</div>
          <div style="font-size:11px;color:#94a3b8;">${lang==='zh'?'最高':'Best'}</div>
        </div>`;
      }
      if (statGrid) {
        statGrid = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0;">${statGrid}</div>`;
      }

      const shareTitle = (type) => {
        const t = isNewRecord ? newRecordText + '\n' : '';
        return `${t}🎮 ${T(this.cfg.name, lang)} 诊断\n\n${type.icon} ${title}\n${quote}\n\n测测你是什么玩家"病症" 👉 emojiarcade.app`;
      };
      const shareTwitter = (type) => {
        return `🎮 刚被诊断为「${title}」\n${quote}\n\n测测你是什么玩家"病症" 👇`;
      };
      const currentType = type; // capture for share handlers

      const html = `
        <div id="diagnosisModal" style="
          position:fixed;top:0;left:0;width:100%;height:100%;
          background:rgba(0,0,0,0.92);z-index:99999;
          overflow-y:auto;-webkit-overflow-scrolling:touch;
          padding:20px 0;box-sizing:border-box;
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"
          onclick="if(event.target===this)GameDiagnosis.hide()">
          <div style="
            background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
            border-radius:20px;padding:30px;max-width:420px;width:90%;
            border:2px solid rgba(255,255,255,0.1);
            position:relative;max-height:90vh;overflow-y:auto;
            margin:20px auto;">
            <div style="
              position:absolute;top:15px;right:15px;width:50px;height:50px;
              border:2px solid #ef4444;border-radius:50%;display:flex;
              align-items:center;justify-content:center;color:#ef4444;
              font-weight:bold;font-size:12px;transform:rotate(-15deg);opacity:0.8;">${confirmed}</div>
            <div style="text-align:center;margin-bottom:20px;">
              <div style="font-size:50px;margin-bottom:10px;">${icon}</div>
              <div style="background:rgba(255,255,255,0.1);padding:4px 12px;border-radius:15px;font-size:11px;color:#94a3b8;display:inline-block;margin-bottom:8px;">${tag}</div>
              ${isNewRecord ? `<div style="color:#fbbf24;font-size:14px;font-weight:700;margin-bottom:4px;">${newRecordText}</div>` : ''}
              <h2 style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#fbbf24,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:3px;">${title}</h2>
              <div style="display:inline-flex;align-items:center;gap:4px;margin-top:12px;padding:6px 16px;border-radius:20px;font-weight:700;font-size:12px;background:${rareColor};color:#fff;">🌟 ${rareLabel} · ${rarePercent}</div>
            </div>
            <div style="background:rgba(99,102,241,0.1);border-left:3px solid #6366f1;padding:12px;margin:12px 0;border-radius:0 8px 8px 0;font-style:italic;color:#cbd5e1;font-size:13px;">${quote}</div>
            ${roast ? `<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);padding:10px;border-radius:8px;margin:12px 0;">
              <div style="color:#ef4444;font-size:11px;font-weight:600;margin-bottom:4px;">${roastTitle}</div>
              <div style="color:#fca5a5;font-size:13px;">${roast}</div>
            </div>` : ''}
            ${statGrid}
            <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:15px;">
              <div style="text-align:center;color:#94a3b8;font-size:11px;margin-bottom:10px;">${shareText}</div>
              <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
                <button onclick="GameDiagnosis.shareTwitter('${encodeURIComponent(shareTwitter(currentType))}')" style="padding:8px 14px;border-radius:15px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:12px;">🐦</button>
                <button onclick="GameDiagnosis.shareWeibo('${encodeURIComponent(shareTitle(currentType))}')" style="padding:8px 14px;border-radius:15px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:12px;">📱</button>
                <button onclick="GameDiagnosis.shareCopy('${encodeURIComponent(shareTitle(currentType))}')" style="padding:8px 14px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:12px;">📋</button>
              </div>
              <div style="display:flex;gap:8px;margin-top:12px;">
                <button id="gcReplayBtn" style="flex:1;padding:12px;border-radius:15px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:600;cursor:pointer;font-size:14px;">${replay}</button>
                <button id="gcHomeBtn" style="padding:12px 16px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:14px;">🏠</button>
              </div>
            </div>
          </div>
        </div>
      `;
      const existing = document.getElementById('diagnosisModal');
      if (existing) existing.remove();
      document.body.insertAdjacentHTML('beforeend', html);
      document.getElementById('gcReplayBtn').addEventListener('click', () => {
        GameDiagnosis.hide();
        if (typeof startGame === 'function') startGame();
      });
      const homeBtn = document.getElementById('gcHomeBtn');
      if (homeBtn) homeBtn.addEventListener('click', () => GameLauncher.goHome());

      /* 统一上报分数给父页面（同源才发，避免跨域伪造） */
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'GAME_SCORE',
            gameId: this.cfg.id,
            score: stats.score || 0,
            isHighScore: isNewRecord,
            stats: stats
          }, location.origin);
        }
      } catch (e) { /* 跨域忽略 */ }
    }

    static hide() {
      const modal = document.getElementById('diagnosisModal');
      if (modal) modal.remove();
    }

    static shareTwitter(text) {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://emojiarcade.app')}`, '_blank');
    }
    static shareWeibo(text) {
      window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent('https://emojiarcade.app')}`, '_blank');
    }
    static shareCopy(text) {
      navigator.clipboard.writeText(text).then(() => alert('已复制！'));
    }
  }

  /* ---------- Global expose ---------- */
  window.GameLauncher = GameLauncher;
  window.GameDiagnosis = GameDiagnosis;
})();
