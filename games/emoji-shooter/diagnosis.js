// Emoji Shooter 诊断系统
// 从 index.html 抽离，统一维护

const ShooterDiagnosis = {
    types: {
        SPD: {
            icon: '🔫', title: '人体描边大师', titleEn: 'Human Outline Artist',
            quote: '"敌人没死，但我键盘先死了。"', quoteEn: '"Enemy alive, keyboard dead."',
            rare: '常见', rareEn: 'Common', rarePercent: '28%', rarityClass: 'common',
            roasts: ['你的准星在敌人周围画了一个完美的圆', '敌人以为你在故意放水', '建议转行做气象预报'],
            roastsEn: ['Your crosshair draws a perfect circle around enemies', 'Enemies think you\'re going easy on them', 'Consider a career in weather forecasting']
        },
        SNP: {
            icon: '🎯', title: '锁头挂嫌疑人', titleEn: 'Aimbot Suspect',
            quote: '"我说我没开，你信吗？"', quoteEn: '"I swear I\'m not cheating."',
            rare: '稀有', rareEn: 'Rare', rarePercent: '5%', rarityClass: 'rare',
            roasts: ['你的鼠标dpi调成了心灵感应模式', '敌人举报键按烂了', '建议去打职业'],
            roastsEn: ['Your mouse DPI is set to telepathy mode', 'Enemies broke their report button', 'Consider going pro']
        },
        SPR: {
            icon: '🏃', title: '无限换弹癌', titleEn: 'Reload Addict',
            quote: '"弹匣还有29发？不行，必须换。"', quoteEn: '"29 rounds left? Must reload."',
            rare: '常见', rareEn: 'Common', rarePercent: '22%', rarityClass: 'common',
            roasts: ['敌人永远在你换弹时出现', 'R键磨损最严重', '建议玩近战游戏'],
            roastsEn: ['Enemies always appear when you reload', 'Your R key has the most wear', 'Consider melee games']
        },
        PAN: {
            icon: '😱', title: 'Panic射击手', titleEn: 'Panic Shooter',
            quote: '"看到敌人→狂按鼠标→祈祷。"', quoteEn: '"See enemy → Spam click → Pray."',
            rare: '常见', rareEn: 'Common', rarePercent: '35%', rarityClass: 'common',
            roasts: ['战术就是吓死对方', '弹药商该给你颁奖', '敌人是被你吵死的'],
            roastsEn: ['Your tactic is to scare enemies to death', 'Ammo dealers should sponsor you', 'Enemies die from noise pollution']
        }
    },

    detectType(stats) {
        const accuracy = stats.shotsFired > 0 ? (stats.shotsHit / stats.shotsFired * 100) : 0;
        if (accuracy > 80 && stats.enemiesKilled > 10) return 'SNP';
        if (stats.shotsFired > 80 && accuracy < 25) return 'PAN';
        if (stats.shotsFired > 40 && accuracy < 35) return 'SPR';
        return 'SPD';
    },

    show(stats) {
        const typeCode = this.detectType(stats);
        const type = this.types[typeCode];
        const isZh = (typeof currentLang !== 'undefined' && currentLang === 'zh');

        const roast = isZh
            ? type.roasts[Math.floor(Math.random() * type.roasts.length)]
            : type.roastsEn[Math.floor(Math.random() * type.roastsEn.length)];
        const quote = isZh ? type.quote : type.quoteEn;
        const title = isZh ? type.title : type.titleEn;
        const rareLabel = isZh ? type.rare : type.rareEn;
        const accuracy = stats.shotsFired > 0 ? (stats.shotsHit / stats.shotsFired * 100).toFixed(1) : 0;
        const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

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
                diagnosis: '🎮 Emoji Shooter 诊断',
                roastTitle: '💬 专属吐槽',
                shots: '射击',
                hits: '命中',
                kills: '击杀',
                wave: '波次',
                share: '分享你的诊断报告',
                playAgain: '🔄 再来一局'
            },
            en: {
                confirmed: 'DIAGNOSED',
                newRecord: '✨ NEW RECORD!',
                finalScore: 'Final Score',
                highScore: 'High Score',
                diagnosis: '🎮 Emoji Shooter Diagnosis',
                roastTitle: '💬 Roast',
                shots: 'Shots',
                hits: 'Hits',
                kills: 'Kills',
                wave: 'Wave',
                share: 'Share your diagnosis',
                playAgain: '🔄 Play Again'
            }
        };

        const t = texts[isZh ? 'zh' : 'en'];

        const html = `
            <div id="diagnosisModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:99999;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 0;box-sizing:border-box;touch-action:pan-y!important;"
                 onclick="ShooterDiagnosis.hide()">
                <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:20px;padding:30px;max-width:420px;width:90%;border:2px solid rgba(255,255,255,0.1);position:relative;margin:auto;touch-action:pan-y!important;"
                     onclick="event.stopPropagation()">
                    <div style="position:absolute;top:15px;right:15px;width:50px;height:50px;border:2px solid #ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ef4444;font-weight:bold;font-size:12px;transform:rotate(-15deg);opacity:0.8;">${t.confirmed}</div>

                    <div style="text-align:center;margin-bottom:15px;padding:15px;background:rgba(255,255,255,0.03);border-radius:12px;">
                        <div style="font-size:13px;color:#94a3b8;margin-bottom:5px;">${isNewHighScore ? t.newRecord : t.finalScore}</div>
                        <div style="font-size:36px;font-weight:800;background:linear-gradient(90deg,#fbbf24,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${stats.score}</div>
                        <div style="font-size:12px;color:#64748b;margin-top:5px;">${t.highScore}: ${stats.highScore}</div>
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
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#ef4444;">${stats.shotsFired || '?'}</div><div style="font-size:11px;color:#94a3b8;">${t.shots}</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#22c55e;">${stats.shotsHit || '?'}</div><div style="font-size:11px;color:#94a3b8;">${t.hits} ${accuracy}%</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#fbbf24;">${stats.enemiesKilled}</div><div style="font-size:11px;color:#94a3b8;">${t.kills}</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#a855f7;">${stats.wave}</div><div style="font-size:11px;color:#94a3b8;">${t.wave}</div></div>
                    </div>
                    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:15px;">
                        <div style="text-align:center;color:#94a3b8;font-size:11px;margin-bottom:10px;">${t.share}</div>
                        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
                            <button onclick="ShooterDiagnosis.share('twitter')" style="padding:8px 14px;border-radius:15px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:12px;">🐦</button>
                            <button onclick="ShooterDiagnosis.share('weibo')" style="padding:8px 14px;border-radius:15px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:12px;">📱</button>
                            <button onclick="ShooterDiagnosis.share('copy')" style="padding:8px 14px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:12px;">📋</button>
                        </div>
                        <div style="display:flex;gap:8px;margin-top:12px;">
                            <button onclick="ShooterDiagnosis.hide()" style="flex:1;padding:12px;border-radius:15px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:600;cursor:pointer;font-size:14px;">${t.playAgain}</button>
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
        if (typeof restartGame === 'function') restartGame();
    },

    share(platform) {
        const type = this.currentType;
        const isZh = (typeof currentLang !== 'undefined' && currentLang === 'zh');

        const shareTitle = isZh ? type.title : type.titleEn;
        const shareQuote = isZh ? type.quote : type.quoteEn;
        const shareRare = isZh ? type.rare : type.rareEn;

        let shareText;
        if (platform === 'twitter') {
            shareText = `🎮 Just diagnosed as "${shareTitle}" in Emoji Shooter!\n${shareQuote}\n\nFind out what player "disease" you have 👉 emojiarcade.app`;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'weibo') {
            shareText = `🎮 Emoji Arcade 诊断报告\n\n${type.icon} ${shareTitle}\n${shareQuote}\n\n测测你是什么玩家"病症" 👉 emojiarcade.app`;
            window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'copy') {
            shareText = `🎮 Emoji Arcade 诊断报告\n\n${type.icon} ${shareTitle} (${isZh ? type.titleEn : type.title})\n🌟 ${shareRare} · ${type.rarePercent}\n💬 ${shareQuote}`;
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
