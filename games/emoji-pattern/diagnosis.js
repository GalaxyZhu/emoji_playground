// Emoji Pattern 诊断系统
// 游戏结束后弹出个性化诊断报告

const PatternDiagnosis = {
    types: {
        GOD: {
            icon: '⚡', title: '人形自走外挂', titleEn: 'Human Aimbot',
            quote: '"我的眼睛就是尺，我的手就是风。"',
            quoteEn: '"My eyes are the ruler, my hands are the wind."',
            rare: '传说', rareEn: 'Legendary', rarePercent: '2%', rarityClass: 'legendary',
            roasts: ['建议你去参加电竞奥运会', 'emoji看到你都会发抖', '这手速，单身多少年练的？'],
            roastsEn: ['You should enter the e-sports Olympics', 'Emojis tremble when they see you', 'How many years of singlehood built this hand speed?']
        },
        PRO: {
            icon: '🎵', title: '节奏大师', titleEn: 'Rhythm Master',
            quote: '"每个emoji都有它的节拍。"',
            quoteEn: '"Every emoji has its beat."',
            rare: '史诗', rareEn: 'Epic', rarePercent: '8%', rarityClass: 'epic',
            roasts: ['你的手和emoji之间有心电感应', '建议开直播教课', '连击数高到像开了连点器'],
            roastsEn: ['Your hands and emojis have telepathy', 'You should stream and teach', 'Your combo looks like an auto-clicker']
        },
        EYE: {
            icon: '👁️', title: '鹰眼玩家', titleEn: 'Eagle Eye',
            quote: '"错误？那是什么，能吃吗？"',
            quoteEn: '"Errors? What are those, can you eat them?"',
            rare: '稀有', rareEn: 'Rare', rarePercent: '12%', rarityClass: 'rare',
            roasts: ['你一眼就能从矩阵里挑出目标', '显微镜都没你看得准', '怀疑你偷偷给emoji贴了标签'],
            roastsEn: ['You can spot targets instantly', 'More accurate than a microscope', 'Did you secretly label the emojis?']
        },
        RAGE: {
            icon: '💢', title: '键盘破坏者', titleEn: 'Keyboard Destroyer',
            quote: '"屏幕没碎是我的仁慈。"',
            quoteEn: '"The screen not breaking is my mercy."',
            rare: '常见', rareEn: 'Common', rarePercent: '18%', rarityClass: 'common',
            roasts: ['你的点击方式叫"地毯式轰炸"', 'emoji是被你吓死的不是被点死的', '建议换个耐造的屏幕'],
            roastsEn: ['Your clicking style is "carpet bombing"', 'Emojis die from fear not clicks', 'Consider a tougher screen']
        },
        NOOB: {
            icon: '🤕', title: '帕金森早期', titleEn: 'Early Parkinson\'s',
            quote: '"我不是在点错，我是在给emoji按摩。"',
            quoteEn: '"I\'m not misclicking, I\'m massaging the emojis."',
            rare: '常见', rareEn: 'Common', rarePercent: '25%', rarityClass: 'common',
            roasts: ['你的手指和emoji在玩捉迷藏', '准确率感人，建议多练', 'emoji在你手下活得挺滋润'],
            roastsEn: ['Your fingers play hide-and-seek with emojis', 'Accuracy is touching, practice more', 'Emojis live comfortably under your fingers']
        },
        SLOW: {
            icon: '🐌', title: '树懒转世', titleEn: 'Reincarnated Sloth',
            quote: '"我不是慢，我是在享受人生。"',
            quoteEn: '"I\'m not slow, I\'m enjoying life."',
            rare: '常见', rareEn: 'Common', rarePercent: '22%', rarityClass: 'common',
            roasts: ['你的时间感跟常人不一样', 'emoji等得都快睡着了', '建议去玩回合制游戏'],
            roastsEn: ['Your sense of time is different', 'Emojis almost fell asleep waiting', 'Consider turn-based games']
        },
        AVERAGE: {
            icon: '😐', title: '平平无奇打工人', titleEn: 'Average Worker',
            quote: '"及格万岁，多一分浪费。"',
            quoteEn: '"Passing is enough, extra points are wasted."',
            rare: '常见', rareEn: 'Common', rarePercent: '13%', rarityClass: 'common',
            roasts: ['稳定发挥，毫无惊喜', '你就像emoji矩阵里的一块背景板', '多喝热水，下次加油'],
            roastsEn: ['Consistent, zero surprises', 'You\'re like a background emoji', 'Drink more water, try harder next time']
        }
    },

    detectType(stats) {
        const accuracy = stats.totalClicks > 0 ? (stats.correctClicks / stats.totalClicks * 100) : 0;
        const avgTimePerLevel = stats.level > 0 ? (stats.totalTimeSpent / stats.level) : 0;

        // 优先级从高到低
        if (stats.maxCombo >= 15 && stats.level >= 5 && accuracy > 85) return 'GOD';
        if (accuracy > 75 && stats.maxCombo >= 8 && stats.level >= 3) return 'PRO';
        if (stats.wrongClicks === 0 && stats.level >= 3) return 'EYE';
        if (stats.wrongClicks >= 8 || accuracy < 30) return 'NOOB';
        if (stats.level <= 2 && stats.wrongClicks >= 3) return 'RAGE';
        if (stats.level === 1 && avgTimePerLevel > 15) return 'SLOW';
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
        const accuracy = stats.totalClicks > 0 ? (stats.correctClicks / stats.totalClicks * 100).toFixed(1) : 0;
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
                diagnosis: '🎮 眼疾手快 诊断',
                roastTitle: '💬 专属吐槽',
                clicks: '点击',
                accuracy: '准确率',
                combo: '最高连击',
                level: '到达关卡',
                share: '分享你的诊断报告',
                playAgain: '🔄 再来一局'
            },
            en: {
                confirmed: 'DIAGNOSED',
                newRecord: '✨ NEW RECORD!',
                finalScore: 'Final Score',
                highScore: 'High Score',
                diagnosis: '🎮 Emoji Pattern Diagnosis',
                roastTitle: '💬 Roast',
                clicks: 'Clicks',
                accuracy: 'Accuracy',
                combo: 'Max Combo',
                level: 'Level Reached',
                share: 'Share your diagnosis',
                playAgain: '🔄 Play Again'
            }
        };

        const t = texts[isZh ? 'zh' : 'en'];
        const timeStr = stats.totalTimeSpent ? Math.ceil(stats.totalTimeSpent) + 's' : '?';

        const html = `
            <div id="diagnosisModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:99999;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 0;box-sizing:border-box;touch-action:pan-y!important;"
                 onclick="PatternDiagnosis.hide()">
                <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:20px;padding:30px;max-width:420px;width:90%;border:2px solid rgba(255,255,255,0.1);position:relative;margin:auto;touch-action:pan-y!important;"
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
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#00f5ff;">${stats.totalClicks || '?'}</div><div style="font-size:11px;color:#94a3b8;">${t.clicks}</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#4ade80;">${accuracy}%</div><div style="font-size:11px;color:#94a3b8;">${t.accuracy}</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#fbbf24;">${stats.maxCombo}</div><div style="font-size:11px;color:#94a3b8;">${t.combo}</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#a855f7;">Lv.${stats.level}</div><div style="font-size:11px;color:#94a3b8;">${t.level}</div></div>
                    </div>
                    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:15px;">
                        <div style="text-align:center;color:#94a3b8;font-size:11px;margin-bottom:10px;">${t.share}</div>
                        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
                            <button onclick="PatternDiagnosis.share('twitter')" style="padding:8px 14px;border-radius:15px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:12px;">🐦</button>
                            <button onclick="PatternDiagnosis.share('weibo')" style="padding:8px 14px;border-radius:15px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:12px;">📱</button>
                            <button onclick="PatternDiagnosis.share('copy')" style="padding:8px 14px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:12px;">📋</button>
                        </div>
                        <div style="display:flex;gap:8px;margin-top:12px;">
                            <button onclick="PatternDiagnosis.hide()" style="flex:1;padding:12px;border-radius:15px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:600;cursor:pointer;font-size:14px;">${t.playAgain}</button>
                            <button onclick="goBackToArcade()" style="padding:12px 16px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:14px;">🏠</button>
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

    hide() {
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
        const accuracy = stats.totalClicks > 0 ? (stats.correctClicks / stats.totalClicks * 100).toFixed(1) : 0;

        let shareText;
        if (platform === 'twitter') {
            shareText = `🎮 Just diagnosed as "${shareTitle}" in Emoji Pattern!\n${shareQuote}\n\nScore: ${stats.score} · Level ${stats.level} · ${accuracy}% accuracy\n\nFind out what player "disease" you have 👉 emojiarcade.app`;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'weibo') {
            shareText = `🎮 Emoji Arcade 诊断报告\n\n${type.icon} ${shareTitle}\n${shareQuote}\n\n得分：${stats.score} · 关卡：${stats.level} · 准确率：${accuracy}%\n\n测测你是什么玩家"病症" 👉 emojiarcade.app`;
            window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'copy') {
            shareText = `🎮 Emoji Arcade 诊断报告\n\n${type.icon} ${shareTitle} (${isZh ? type.titleEn : type.title})\n🌟 ${shareRare} · ${type.rarePercent}\n💬 ${shareQuote}\n\n得分：${stats.score} · 关卡：${stats.level} · 准确率：${accuracy}% · 最高连击：${stats.maxCombo}`;
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

// 全局函数供诊断页面调用
function goBackToArcade() {
    window.location.href = '../../index.html';
}
