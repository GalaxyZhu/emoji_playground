/**
 * Emoji Link-Up 诊断系统
 */
const LinkUpDiagnosis = {
    types: {
        SPD: {
            icon: '⚡', title: '闪电手', titleEn: 'Lightning Hands',
            quote: '"我的手速，肉眼根本跟不上。"', quoteEn: '"My hand speed defies human vision."',
            rare: '稀有', rareEn: 'Rare', rarePercent: '8%', rarityClass: 'rare',
            roasts: { zh: ['你手机屏幕都被你戳出火星了', '旁边的人以为你在练钢琴', '这手速去打职业吧'], en: ['Your screen is smoking from tapping', 'People think you are playing piano', 'Go pro with that hand speed'] }
        },
        SLW: {
            icon: '🐢', title: '树懒型选手', titleEn: 'Sloth Gamer',
            quote: '"不急，先让我观察一下... 十秒后再说。"', quoteEn: '"Let me observe first... maybe in ten seconds."',
            rare: '常见', rareEn: 'Common', rarePercent: '32%', rarityClass: 'common',
            roasts: { zh: ['时间到了你还没找到第二对', '旁边的人以为你在冥想', '建议玩不需要时间的游戏'], en: ['Time is up before you find the second pair', 'People think you are meditating', 'Try games without time limits'] }
        },
        BRN: {
            icon: '🧠', title: '人形计算机', titleEn: 'Human Computer',
            quote: '"大脑CPU占用率100%，但从不死机。"', quoteEn: '"Brain CPU at 100%, never crashes."',
            rare: '史诗', rareEn: 'Epic', rarePercent: '3%', rarityClass: 'epic',
            roasts: { zh: ['你的大脑是M1芯片做的吧', '建议去破解密码', '这记忆力不去背圆周率可惜了'], en: ['Is your brain an M1 chip?', 'Consider password cracking', 'Waste not to memorize pi'] }
        },
        RNG: {
            icon: '🎲', title: '瞎点点大师', titleEn: 'Random Clicker',
            quote: '"只要点得够快，概率就追不上我。"', quoteEn: '"Click fast enough, probability cannot catch me."',
            rare: '常见', rareEn: 'Common', rarePercent: '28%', rarityClass: 'common',
            roasts: { zh: ['你的准确率还不如抛硬币', '屏幕：我被乱点了一整场', '建议去玩刮刮乐'], en: ['Your accuracy is worse than a coin flip', 'Screen: I was clicked randomly all game', 'Try scratch-off lottery instead'] }
        },
        ASS: {
            icon: '⏰', title: '时间刺客', titleEn: 'Time Assassin',
            quote: '"最后一秒通关，心跳比手速快。"', quoteEn: '"Last-second win, heartbeat faster than hands."',
            rare: '稀有', rareEn: 'Rare', rarePercent: '12%', rarityClass: 'rare',
            roasts: { zh: ['你是故意拖到最后吓自己吗', '心脏不好的别这么玩', '建议去买彩票'], en: ['Did you deliberately drag to the end?', 'Not for the faint-hearted', 'Buy lottery tickets instead'] }
        },
        CMB: {
            icon: '🔥', title: '连击狂魔', titleEn: 'Combo Master',
            quote: '"Combo×20？这才刚开始。"', quoteEn: '"Combo x20? Just getting started."',
            rare: '史诗', rareEn: 'Epic', rarePercent: '5%', rarityClass: 'epic',
            roasts: { zh: ['你的手根本停不下来', 'Combo断了你比失恋还难受', '建议去打音游'], en: ['Your hands cannot stop', 'Combo break hurts more than breakup', 'Try rhythm games'] }
        }
    },

    getTexts() {
        // 尝试读取游戏语言，默认中文
        const isZh = (typeof lang !== 'undefined' && lang === 'zh') ||
                     document.documentElement.lang?.startsWith('zh') ||
                     true;
        return isZh ? {
            confirmed: '确诊',
            tag: '🔗 Emoji Link-Up 诊断',
            roastTitle: '💬 网友吐槽',
            statScore: '最终得分',
            statMoves: '成功匹配',
            statCombo: '最高连击',
            statTime: '耗时(秒)',
            statAccuracy: '准确率',
            share: '分享你的诊断报告',
            replay: '🔄 再来一局',
            copied: '已复制！',
            gameWon: '✅ 通关！',
            gameLost: '❌ 超时',
            resultSuffix: '通关',
            shareTitle: (type, stats) => `🎮 Emoji Arcade 诊断报告

${type.icon} ${type.title} — ${stats.won ? '通关' : '超时'}
${type.quote}

⭐ 得分: ${stats.score} | 🔥 Combo: x${stats.maxCombo}
测测你是什么玩家"病症" 👉 emojiarcade.app`,
            shareTwitter: (type) => `🎮 刚被诊断为「${type.title}」
${type.quote}
测测你是什么玩家"病症" 👇`
        } : {
            confirmed: 'DIAGNOSIS',
            tag: '🔗 Emoji Link-Up Diagnosis',
            roastTitle: '💬 Roast',
            statScore: 'Final Score',
            statMoves: 'Matches',
            statCombo: 'Max Combo',
            statTime: 'Time(s)',
            statAccuracy: 'Accuracy',
            share: 'Share your diagnosis',
            replay: '🔄 Play Again',
            copied: 'Copied!',
            gameWon: '✅ Cleared!',
            gameLost: '❌ Time Up',
            resultSuffix: 'cleared',
            shareTitle: (type, stats) => `🎮 Emoji Arcade Diagnosis

${type.icon} ${type.titleEn} — ${stats.won ? 'Cleared' : 'Failed'}
${type.quoteEn}

⭐ Score: ${stats.score} | 🔥 Combo: x${stats.maxCombo}
Find your player type 👉 emojiarcade.app`,
            shareTwitter: (type) => `🎮 Just diagnosed as "${type.titleEn}"
${type.quoteEn}
Find your player type 👇`
        };
    },

    detectType(stats) {
        if (stats.maxCombo >= 10) return 'CMB';
        if (stats.won && stats.hintsUsed === 0) return 'BRN';
        if (stats.won && stats.remainingTime <= 10) return 'ASS';
        if (stats.avgTime < 1.5 && stats.successfulMoves >= 5) return 'SPD';
        if (stats.failedClicks > stats.successfulMoves && stats.successfulMoves > 0) return 'RNG';
        if (stats.avgTime > 5) return 'SLW';
        if (stats.avgTime < 1.5) return 'SPD';
        return 'RNG';
    },

    show(stats) {
        const t = this.getTexts();
        const typeCode = this.detectType(stats);
        const type = this.types[typeCode];
        const isZh = t.confirmed === '确诊';

        const roastPool = type.roasts[isZh ? 'zh' : 'en'];
        const roast = roastPool[Math.floor(Math.random() * roastPool.length)];

        const totalClicks = stats.successfulMoves + stats.failedClicks;
        const accuracy = totalClicks > 0 ? Math.round(stats.successfulMoves / totalClicks * 100) : 0;

        const rarityColors = {
            common: 'linear-gradient(135deg,#94a3b8,#64748b)',
            rare: 'linear-gradient(135deg,#60a5fa,#3b82f6)',
            epic: 'linear-gradient(135deg,#a855f7,#7c3aed)',
            legendary: 'linear-gradient(135deg,#fbbf24,#f59e0b)'
        };

        const title = isZh ? type.title : type.titleEn;
        const quote = isZh ? type.quote : type.quoteEn;
        const rarity = isZh
            ? ({ common: '常见', rare: '稀有', epic: '史诗', legendary: '传说' }[type.rarityClass] || '常见')
            : ({ common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' }[type.rarityClass] || 'Common');

        const resultText = stats.won ? t.gameWon : t.gameLost;

        const html = `
            <div id="diagnosisModal" onclick="if(event.target===this)LinkUpDiagnosis.hide()">
                <div onclick="event.stopPropagation()">
                    <div style="position:absolute;top:15px;right:15px;width:50px;height:50px;border:2px solid #ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ef4444;font-weight:bold;font-size:12px;transform:rotate(-15deg);opacity:0.8;">${t.confirmed}</div>

                    <!-- 结果 -->
                    <div style="text-align:center;margin-bottom:15px;padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;">
                        <div style="font-size:24px;font-weight:800;background:linear-gradient(90deg,#fbbf24,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${resultText}</div>
                        <div style="font-size:13px;color:#94a3b8;margin-top:4px;">⭐ ${t.statScore}: ${stats.score}</div>
                    </div>

                    <!-- 诊断类型 -->
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:50px;margin-bottom:10px;">${type.icon}</div>
                        <div style="background:rgba(255,255,255,0.1);padding:4px 12px;border-radius:15px;font-size:11px;color:#94a3b8;display:inline-block;margin-bottom:8px;">${t.tag}</div>
                        <h2 style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#fbbf24,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:3px;">${title}</h2>
                        <div style="display:inline-flex;align-items:center;gap:4px;margin-top:12px;padding:6px 16px;border-radius:20px;font-weight:700;font-size:12px;background:${rarityColors[type.rarityClass]};color:#fff;">
                            🌟 ${rarity} · ${type.rarePercent}
                        </div>
                    </div>

                    <!-- 名言 -->
                    <div style="background:rgba(99,102,241,0.1);border-left:3px solid #6366f1;padding:12px;margin:12px 0;border-radius:0 8px 8px 0;font-style:italic;color:#cbd5e1;font-size:13px;">${quote}</div>

                    <!-- 吐槽 -->
                    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);padding:10px;border-radius:8px;margin:12px 0;">
                        <div style="color:#ef4444;font-size:11px;font-weight:600;margin-bottom:4px;">${t.roastTitle}</div>
                        <div style="color:#fca5a5;font-size:13px;">${roast}</div>
                    </div>

                    <!-- 统计 -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0;">
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;">
                            <div style="font-size:18px;font-weight:800;color:#fbbf24;">${stats.score}</div>
                            <div style="font-size:11px;color:#94a3b8;">${t.statScore}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;">
                            <div style="font-size:18px;font-weight:800;color:#22c55e;">${stats.successfulMoves}</div>
                            <div style="font-size:11px;color:#94a3b8;">${t.statMoves}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;">
                            <div style="font-size:18px;font-weight:800;color:#ef4444;">🔥 x${stats.maxCombo}</div>
                            <div style="font-size:11px;color:#94a3b8;">${t.statCombo}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;">
                            <div style="font-size:18px;font-weight:800;color:#a855f7;">${stats.duration}s</div>
                            <div style="font-size:11px;color:#94a3b8;">${t.statTime}</div>
                        </div>
                    </div>

                    <!-- 分享 -->
                    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:15px;">
                        <div style="text-align:center;color:#94a3b8;font-size:11px;margin-bottom:10px;">${t.share}</div>
                        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
                            <button onclick="LinkUpDiagnosis.share('twitter')" style="padding:8px 14px;border-radius:15px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:12px;">🐦</button>
                            <button onclick="LinkUpDiagnosis.share('weibo')" style="padding:8px 14px;border-radius:15px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:12px;">📱</button>
                            <button onclick="LinkUpDiagnosis.share('copy')" style="padding:8px 14px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:12px;">📋</button>
                        </div>
                        <!-- 排行榜按钮 -->
                        <div style="margin-top:10px;">
                            <button onclick="LinkUpDiagnosis.showLeaderboard()" style="width:100%;padding:10px;border-radius:12px;border:none;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0f172a;font-weight:700;cursor:pointer;font-size:14px;">🏆 ${isZh ? '查看全球排行榜' : 'View Global Leaderboard'}</button>
                        </div>
                        <div style="display:flex;gap:8px;margin-top:12px;">
                            <button onclick="LinkUpDiagnosis.hide()" style="flex:1;padding:12px;border-radius:15px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:600;cursor:pointer;font-size:14px;">${t.replay}</button>
                            <button onclick="location.href='../../index.html'" style="padding:12px 16px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:14px;">🏠</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const container = document.getElementById('diagnosisContainer');
        if (!container) {
            console.error('[diagnosis] diagnosisContainer NOT found in DOM!');
            return;
        }
        container.innerHTML = html;
        console.log('[diagnosis] Modal rendered, diagnosisModal exists:', !!document.getElementById('diagnosisModal'));
        this.currentType = type;
        this.currentStats = stats;
        this.texts = t;
    },

    hide() {
        document.getElementById('diagnosisContainer').innerHTML = '';
        // 触发新游戏
        if (typeof newGame === 'function') newGame();
    },

    showLeaderboard() {
        if (typeof window.Leaderboard === 'undefined') {
            alert('Leaderboard loading... Please try again in a moment.');
            return;
        }
        const isZh = this.texts?.confirmed === '确诊';
        window.Leaderboard.getTop50().then(entries => {
            const uid = window.Leaderboard.getCurrentUser()?.uid;
            const playerEntry = entries.find(e => e.uid === uid);
            const playerRank = playerEntry ? playerEntry.rank : null;
            window.Leaderboard.showModal(entries, playerRank);
        }).catch(err => {
            console.error('Failed to load leaderboard:', err);
            alert(isZh ? '排行榜加载失败，请稍后重试' : 'Failed to load leaderboard. Please try again.');
        });
    },
        const t = this.texts || this.getTexts();
        const type = this.currentType;
        const stats = this.currentStats;
        if (!type || !stats) return;

        const text = t.shareTitle(type, stats);

        if (platform === 'twitter') {
            const twText = t.shareTwitter(type);
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twText)}&url=${encodeURIComponent('https://emojiarcade.app')}`, '_blank');
        } else if (platform === 'weibo') {
            window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent('https://emojiarcade.app')}`, '_blank');
        } else if (platform === 'copy') {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => alert(t.copied));
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert(t.copied);
            }
        }
    }
};
