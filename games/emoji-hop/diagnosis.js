// Hop 诊断系统
const HopDiagnosisLang = (() => {
    const lang = (navigator.language || navigator.userLanguage || 'zh-CN').toLowerCase();
    return lang.startsWith('zh') ? 'zh' : 'en';
})();

const HopDiagnosis = {
    types: [
        { icon: '🐒', title: '落水猴王', titleEn: 'Drowned Monkey', rarePercent: '38%', rarityClass: 'common', quote: '“你的特长是让自己变湿。”', quoteEn: '"Your specialty is getting yourself wet."', minScore: 0 },
        { icon: '🪵', title: '过河老手', titleEn: 'River Veteran', rarePercent: '15%', rarityClass: 'rare', quote: '“木头是你最好的朋友。”', quoteEn: '"Logs are your best friends."', minScore: 1000 },
        { icon: '🏃', title: '马路杀手', titleEn: 'Road Runner', rarePercent: '6%', rarityClass: 'epic', quote: '“车辆在你面前自动避让。”', quoteEn: '"Cars politely dodge you. Somehow."', minScore: 3000 },
        { icon: '👑', title: '丛林之王', titleEn: 'Jungle King', rarePercent: '0.5%', rarityClass: 'legendary', quote: '“鳄鱼见了你都绕道走。”', quoteEn: '"Even crocodiles go around you."', minScore: 5000 }
    ],
    
    roasts: {
        zh: [
        "你的游泳技术比跳跃还好。",
        "建议先去学一下水上漂。",
        "鳄鱼：自助餐来了！",
        "你的过河策略就是闭眼冲。",
        "建议改名叫'落汤鸡'。",
        "你的存在感让木头都沉了。",
        "马路不是你的家，请走人行道。",
        "你的反应速度像树懒。",
        "建议先去动物园实习。",
        "你的青蛙跳是青蛙'扑通'。"
        ],
        en: [
            "Your swimming is better than your jumping.",
            "Maybe learn how to 'walk on water' first.",
            "Crocodile: dinner time!",
            "Your strategy is closing your eyes and sprinting.",
            "Consider renaming yourself 'Soaked Chicken'.",
            "Your presence makes logs sink.",
            "The road is not your home—use the sidewalk.",
            "Your reaction time is like a sloth.",
            "Try an internship at the zoo first.",
            "Your 'frog jump' is actually 'splash'."
        ]
    },

    getTexts() {
        const isZh = HopDiagnosisLang === 'zh';
        return isZh ? {
            confirmed: '确诊',
            record: '✨ 新纪录！',
            scoreLabel: '最终得分',
            highScoreLabel: '最高分',
            tag: '🎮 Emoji Hop 诊断',
            roastTitle: '💬 网友吐槽',
            statLevel: '到达关卡',
            statGoals: '填满目标',
            share: '分享你的诊断报告',
            replay: '🔄 再来一局',
            copied: '已复制！',
            shareTitle: (type) => `🎮 Emoji Arcade 诊断报告\n\n${type.icon} ${type.title}\n${type.quote}\n\n测测你是什么玩家"病症" 👉 emojiarcade.app`,
            shareTwitter: (type) => `🎮 刚被诊断为「${type.title}」\n${type.quote}\n\n测测你是什么玩家"病症" 👇`
        } : {
            confirmed: 'DIAGNOSIS',
            record: '✨ NEW RECORD!',
            scoreLabel: 'Final Score',
            highScoreLabel: 'High Score',
            tag: '🎮 Emoji Hop Diagnosis',
            roastTitle: '💬 Roast',
            statLevel: 'Level Reached',
            statGoals: 'Goals Filled',
            share: 'Share your diagnosis',
            replay: '🔄 Play Again',
            copied: 'Copied!',
            shareTitle: (type) => `🎮 Emoji Arcade Diagnosis\n\n${type.icon} ${type.titleEn}\n${type.quoteEn}\n\nFind out your player type 👉 emojiarcade.app`,
            shareTwitter: (type) => `🎮 Just diagnosed as "${type.titleEn}"\n${type.quoteEn}\n\nFind out your player type 👇`
        };
    },
    
    show(stats) {
        const isZh = HopDiagnosisLang === 'zh';
        const t = this.getTexts();
        const type = this.types.slice().reverse().find(t => stats.score >= t.minScore) || this.types[0];
        const roastPool = this.roasts[isZh ? 'zh' : 'en'];
        const roast = roastPool[Math.floor(Math.random() * roastPool.length)];
        const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;
        const title = isZh ? type.title : type.titleEn;
        const quote = isZh ? type.quote : type.quoteEn;
        const rarity = isZh
            ? ({ common: '常见', rare: '稀有', epic: '史诗', legendary: '传说' }[type.rarityClass] || '常见')
            : ({ common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' }[type.rarityClass] || 'Common');
        
        const html = `
            <div id="diagnosisModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:99999;display:flex;justify-content:center;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"
                 onclick="if(event.target===this)HopDiagnosis.hide()">
                <div style="background:linear-gradient(135deg,#1a2d16 0%,#0d1f15 100%);border-radius:20px;padding:30px;max-width:420px;width:90%;border:2px solid rgba(76,175,80,0.3);position:relative;max-height:90vh;overflow-y:auto;">
                    <div style="position:absolute;top:15px;right:15px;width:50px;height:50px;border:2px solid #ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ef4444;font-weight:bold;font-size:12px;transform:rotate(-15deg);opacity:0.8;">${t.confirmed}</div>
                    
                    <div style="text-align:center;margin-bottom:15px;padding:15px;background:rgba(255,255,255,0.03);border-radius:12px;">
                        <div style="font-size:13px;color:#94a3b8;margin-bottom:5px;">${isNewHighScore ? t.record : t.scoreLabel}</div>
                        <div style="font-size:36px;font-weight:800;background:linear-gradient(90deg,#4caf50,#45a049);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${stats.score}</div>
                        <div style="font-size:12px;color:#64748b;margin-top:5px;">${t.highScoreLabel}: ${stats.highScore}</div>
                    </div>
                    
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:50px;margin-bottom:10px;">${type.icon}</div>
                        <div style="background:rgba(255,255,255,0.1);padding:4px 12px;border-radius:15px;font-size:11px;color:#94a3b8;display:inline-block;margin-bottom:8px;">${t.tag}</div>
                        <h2 style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#4caf50,#45a049);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:3px;">${title}</h2>
                        <div style="display:inline-flex;align-items:center;gap:4px;margin-top:12px;padding:6px 16px;border-radius:20px;font-weight:700;font-size:12px;background:linear-gradient(135deg,#4caf50,#45a049);color:#fff;">
                            🌟 ${rarity} · ${type.rarePercent}
                        </div>
                    </div>
                    <div style="background:rgba(99,102,241,0.1);border-left:3px solid #6366f1;padding:12px;margin:12px 0;border-radius:0 8px 8px 0;font-style:italic;color:#cbd5e1;font-size:13px;">${quote}</div>
                    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);padding:10px;border-radius:8px;margin:12px 0;">
                        <div style="color:#ef4444;font-size:11px;font-weight:600;margin-bottom:4px;">${t.roastTitle}</div>
                        <div style="color:#fca5a5;font-size:13px;">${roast}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0;">
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#4caf50;">${stats.level || 1}</div><div style="font-size:11px;color:#94a3b8;">${t.statLevel}</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#fbbf24;">${stats.goalsFilled || 0}</div><div style="font-size:11px;color:#94a3b8;">${t.statGoals}</div></div>
                    </div>
                    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:15px;">
                        <div style="text-align:center;color:#94a3b8;font-size:11px;margin-bottom:10px;">${t.share}</div>
                        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
                            <button onclick="HopDiagnosis.share('twitter')" style="padding:8px 14px;border-radius:15px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:12px;">🐦</button>
                            <button onclick="HopDiagnosis.share('weibo')" style="padding:8px 14px;border-radius:15px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:12px;">📱</button>
                            <button onclick="HopDiagnosis.share('copy')" style="padding:8px 14px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:12px;">📋</button>
                        </div>
                        <div style="display:flex;gap:8px;margin-top:12px;">
                            <button onclick="HopDiagnosis.hide();restartGame();" style="flex:1;padding:12px;border-radius:15px;border:none;background:linear-gradient(135deg,#4caf50,#45a049);color:white;font-weight:600;cursor:pointer;font-size:14px;">${t.replay}</button>
                            <button onclick="location.href='../../index.html'" style="padding:12px 16px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:14px;">🏠</button>
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
        const t = this.getTexts();
        const type = this.currentType;
        const text = t.shareTitle(type);
        
        if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t.shareTwitter(type))}&url=${encodeURIComponent('https://emojiarcade.app')}`, '_blank');
        } else if (platform === 'weibo') {
            window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent('https://emojiarcade.app')}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(text).then(() => alert(t.copied));
        }
    }
};
