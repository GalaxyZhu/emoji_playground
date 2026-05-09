// 🕵️ Emoji Spot — 找坏人 诊断系统

const SpotDiagnosis = {
  types: {
    EAGLE: {
      icon: '🦅', title: '鹰眼侦探', titleEn: 'Eagle Eye Detective',
      quote: '"在我眼里，每个像素都是嫌疑人。"',
      quoteEn: '"Every pixel is a suspect in my eyes."',
      rare: '传说', rareEn: 'Legendary', rarePercent: '2%', rarityClass: 'legendary',
      roasts: ['你的眼睛装了显微镜吧？', '建议去当鉴宝专家', '坏人看到你都想自首'],
      roastsEn: ['Did you install a microscope in your eyes?', 'You should be an antiques expert', 'Bad guys want to surrender when they see you']
    },
    DETAIL: {
      icon: '🧐', title: '细节狂魔', titleEn: 'Detail Maniac',
      quote: '"差一个像素，也是犯罪。"',
      quoteEn: '"One pixel off is still a crime."',
      rare: '史诗', rareEn: 'Epic', rarePercent: '8%', rarityClass: 'epic',
      roasts: ['你的专注度让人害怕', 'emoji在你手下无处遁形', '怀疑你有强迫症'],
      roastsEn: ['Your focus is terrifying', 'Emojis have nowhere to hide', 'Suspecting you have OCD']
    },
    SHARP: {
      icon: '👁️', title: '火眼金睛', titleEn: 'Sharp Eyes',
      quote: '"不是我看出来的，是它自己招的。"',
      quoteEn: '"It confessed itself, I didn\'t even look."',
      rare: '稀有', rareEn: 'Rare', rarePercent: '12%', rarityClass: 'rare',
      roasts: ['一眼锁定，绝不失手', 'emoji还没藏好就被你抓了', '建议去玩找不同专业版'],
      roastsEn: ['Lock on at first glance, never miss', 'Emojis get caught before they hide', 'Consider the pro version of spot-the-difference']
    },
    RAGE: {
      icon: '💢', title: '愤怒小鸟', titleEn: 'Angry Clicker',
      quote: '"我不是在找坏人，我是在拆网格。"',
      quoteEn: '"I\'m not finding the bad guy, I\'m destroying the grid."',
      rare: '常见', rareEn: 'Common', rarePercent: '18%', rarityClass: 'common',
      roasts: ['你的点击方式叫"地毯式排查"', '坏人没被找到，被你吓死的', '建议换个耐点的屏幕'],
      roastsEn: ['Your clicking style is "carpet bombing"', 'The bad guy died from fear, not found', 'Consider a tougher screen']
    },
    BLURRY: {
      icon: '😵', title: '眼花大师', titleEn: 'Blurry Master',
      quote: '"我觉得它们都一样...对吧？"',
      quoteEn: '"They all look the same... right?"',
      rare: '常见', rareEn: 'Common', rarePercent: '25%', rarityClass: 'common',
      roasts: ['你的眼睛和emoji在玩捉迷藏', '准确率感人，建议配眼镜', '坏人看到你都想帮帮你'],
      roastsEn: ['Your eyes play hide-and-seek with emojis', 'Accuracy is touching, consider glasses', 'Bad guys want to help you']
    },
    SLOW: {
      icon: '🐌', title: '慢动作侦探', titleEn: 'Slow-Motion Detective',
      quote: '"我不是慢，我是在享受寻找的过程。"',
      quoteEn: '"I\'m not slow, I\'m enjoying the hunt."',
      rare: '常见', rareEn: 'Common', rarePercent: '22%', rarityClass: 'common',
      roasts: ['你的时间感跟常人不一样', '坏人等得都快睡着了', '建议去玩拼图'],
      roastsEn: ['Your sense of time is different', 'Bad guys almost fell asleep waiting', 'Consider jigsaw puzzles']
    },
    AVERAGE: {
      icon: '😐', title: '平平无奇观察员', titleEn: 'Average Observer',
      quote: '"及格万岁，找到就行。"',
      quoteEn: '"Passing is enough, found is found."',
      rare: '常见', rareEn: 'Common', rarePercent: '13%', rarityClass: 'common',
      roasts: ['稳定发挥，毫无惊喜', '你就像emoji网格里的一块背景板', '多喝热水，下次加油'],
      roastsEn: ['Consistent, zero surprises', 'You\'re like a background emoji', 'Drink more water, try harder next time']
    }
  },

  detectType(stats) {
    const accuracy = stats.totalClicks > 0 ? (stats.correctClicks / stats.totalClicks * 100) : 0;

    if (stats.level >= 10 && stats.wrongClicks === 0) return 'EAGLE';
    if (accuracy > 90 && stats.level >= 7) return 'DETAIL';
    if (accuracy > 80 && stats.level >= 5) return 'SHARP';
    if (stats.wrongClicks >= 5 || accuracy < 30) return 'BLURRY';
    if (stats.level <= 2 && stats.wrongClicks >= 2) return 'RAGE';
    if (stats.level <= 3 && stats.totalClicks > 0 && accuracy < 50) return 'SLOW';
    return 'AVERAGE';
  },

  show(stats) {
    const typeCode = this.detectType(stats);
    const type = this.types[typeCode];
    let isZh = false;
    if (typeof currentLang !== 'undefined' && currentLang === 'zh') {
      isZh = true;
    } else if (typeof GameI18n !== 'undefined' && GameI18n.detectLang() === 'zh') {
      isZh = true;
    }

    const roast = isZh
      ? type.roasts[Math.floor(Math.random() * type.roasts.length)]
      : type.roastsEn[Math.floor(Math.random() * type.roastsEn.length)];
    const quote = isZh ? type.quote : type.quoteEn;
    const title = isZh ? type.title : type.titleEn;
    const rareLabel = isZh ? type.rare : type.rareEn;

    const isNewHighScore = stats.score > 0 && stats.score >= stats.bestScore;
    const isNewHighLevel = stats.level > 0 && stats.level >= stats.bestLevel;
    const isNewRecord = isNewHighScore || isNewHighLevel;

    const rarityColors = {
      common: 'linear-gradient(135deg,#94a3b8,#64748b)',
      rare: 'linear-gradient(135deg,#60a5fa,#3b82f6)',
      epic: 'linear-gradient(135deg,#a855f7,#7c3aed)',
      legendary: 'linear-gradient(135deg,#fbbf24,#f59e0b)'
    };

    const texts = {
      zh: {
        confirmed: '确诊',
        newRecord: '✨ 新纪录！',
        finalScore: '最终得分',
        highScore: '最高分',
        diagnosis: '🕵️ 找坏人 诊断',
        roastTitle: '💬 专属吐槽',
        level: '到达关卡',
        accuracy: '准确率',
        streak: '最高连击',
        clicks: '总点击',
        share: '分享你的诊断报告',
        playAgain: '🔄 再来一局'
      },
      en: {
        confirmed: 'DIAGNOSED',
        newRecord: '✨ NEW RECORD!',
        finalScore: 'Final Score',
        highScore: 'High Score',
        diagnosis: '🕵️ Emoji Spot Diagnosis',
        roastTitle: '💬 Roast',
        level: 'Level Reached',
        accuracy: 'Accuracy',
        streak: 'Max Streak',
        clicks: 'Total Clicks',
        share: 'Share your diagnosis',
        playAgain: '🔄 Play Again'
      }
    };

    const t = texts[isZh ? 'zh' : 'en'];

    const html = `
      <div id="diagnosisModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:99999;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 0;box-sizing:border-box;"
           onclick="SpotDiagnosis.hide(event)">
        <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:20px;padding:30px;max-width:420px;width:90%;border:2px solid rgba(255,255,255,0.1);position:relative;margin:auto;"
             onclick="event.stopPropagation()">
          <div style="position:absolute;top:15px;right:15px;width:50px;height:50px;border:2px solid #ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ef4444;font-weight:bold;font-size:12px;transform:rotate(-15deg);opacity:0.8;">${t.confirmed}</div>

          <div style="text-align:center;margin-bottom:15px;padding:15px;background:rgba(255,255,255,0.03);border-radius:12px;">
            <div style="font-size:13px;color:#94a3b8;margin-bottom:5px;">${isNewRecord ? t.newRecord : t.finalScore}</div>
            <div style="font-size:36px;font-weight:800;background:linear-gradient(90deg,#fbbf24,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${stats.score}</div>
            <div style="font-size:12px;color:#64748b;margin-top:5px;">${t.highScore}: ${stats.bestScore}</div>
          </div>

          <div style="text-align:center;margin-bottom:20px;">
            <div style="font-size:50px;margin-bottom:10px;">${type.icon}</div>
            <div style="background:rgba(255,255,255,0.1);padding:4px 12px;border-radius:15px;font-size:11px;color:#94a3b8;display:inline-block;margin-bottom:8px;">${t.diagnosis}</div>
            <h2 style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#fbbf24,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:3px;">${title}</h2>
            <div style="display:inline-flex;align-items:center;gap:4px;margin-top:12px;padding:6px 16px;border-radius:20px;font-weight:700;font-size:12px;background:${rarityColors[type.rarityClass]};color:${type.rarityClass==='legendary'?'#000':'#fff'};">
              🌟 ${rareLabel} · ${type.rarePercent}
            </div>
          </div>
          <div style="background:rgba(99,102,241,0.1);border-left:3px solid #6366f1;padding:12px;margin:12px 0;border-radius:0 8px 8px 0;font-style:italic;color:#cbd5e1;font-size:13px;">${quote}</div>
          <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);padding:10px;border-radius:8px;margin:12px 0;">
            <div style="color:#ef4444;font-size:11px;font-weight:600;margin-bottom:4px;">${t.roastTitle}</div>
            <div style="color:#fca5a5;font-size:13px;">${roast}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0;">
            <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#00f5ff;">${stats.level}</div><div style="font-size:11px;color:#94a3b8;">${t.level}</div></div>
            <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#4ade80;">${stats.accuracy}%</div><div style="font-size:11px;color:#94a3b8;">${t.accuracy}</div></div>
            <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#fbbf24;">${stats.maxStreak}</div><div style="font-size:11px;color:#94a3b8;">${t.streak}</div></div>
            <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#a855f7;">${stats.totalClicks}</div><div style="font-size:11px;color:#94a3b8;">${t.clicks}</div></div>
          </div>
          <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:15px;">
            <div style="text-align:center;color:#94a3b8;font-size:11px;margin-bottom:10px;">${t.share}</div>
            <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
              <button onclick="SpotDiagnosis.share('twitter')" style="padding:8px 14px;border-radius:15px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:12px;">🐦</button>
              <button onclick="SpotDiagnosis.share('weibo')" style="padding:8px 14px;border-radius:15px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:12px;">📱</button>
              <button onclick="SpotDiagnosis.share('copy')" style="padding:8px 14px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:12px;">📋</button>
            </div>
            <div style="display:flex;gap:8px;margin-top:12px;">
              <button onclick="SpotDiagnosis.hide()" style="flex:1;padding:12px;border-radius:15px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:600;cursor:pointer;font-size:14px;">${t.playAgain}</button>
              <button onclick="goBack()" style="padding:12px 16px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:14px;">🏠</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('diagnosisModal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
    this.currentType = type;
    this.currentStats = stats;
  },

  hide(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('diagnosisModal');
    if (modal) modal.remove();
  },

  share(platform) {
    const type = this.currentType;
    const stats = this.currentStats;
    let isZh = false;
    if (typeof currentLang !== 'undefined' && currentLang === 'zh') {
      isZh = true;
    } else if (typeof GameI18n !== 'undefined' && GameI18n.detectLang() === 'zh') {
      isZh = true;
    }

    const shareTitle = isZh ? type.title : type.titleEn;
    const shareQuote = isZh ? type.quote : type.quoteEn;
    const shareRare = isZh ? type.rare : type.rareEn;

    let shareText;
    if (platform === 'twitter') {
      shareText = `🕵️ Just diagnosed as "${shareTitle}" in Emoji Spot!\n${shareQuote}\n\nScore: ${stats.score} · Level ${stats.level} · ${stats.accuracy}% accuracy\n\nFind out what detective you are 👉 emojiarcade.app`;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'weibo') {
      shareText = `🕵️ Emoji Arcade 诊断报告\n\n${type.icon} ${shareTitle}\n${shareQuote}\n\n得分：${stats.score} · 关卡：${stats.level} · 准确率：${stats.accuracy}%\n\n测测你是什么侦探等级 👉 emojiarcade.app`;
      window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'copy') {
      shareText = `🕵️ Emoji Arcade 诊断报告\n\n${type.icon} ${shareTitle} (${isZh ? type.titleEn : type.title})\n🌟 ${shareRare} · ${type.rarePercent}\n💬 ${shareQuote}\n\n得分：${stats.score} · 关卡：${stats.level} · 准确率：${stats.accuracy}% · 最高连击：${stats.maxStreak}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          alert(isZh ? '已复制到剪贴板！' : 'Copied to clipboard!');
        });
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert(isZh ? '已复制到剪贴板！' : 'Copied to clipboard!');
      }
    }
  }
};
