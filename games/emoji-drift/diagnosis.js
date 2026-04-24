// Drift 诊断系统
const DriftDiagnosisLang = (() => {
    // 优先读取 URL 参数 lang=zh/en（来自首页语言切换）
    const urlLang = new URLSearchParams(location.search).get('lang');
    if (urlLang === 'zh' || urlLang === 'en') {
        return urlLang;
    }
    // 回退到浏览器语言
    const lang = (navigator.language || navigator.userLanguage || 'zh-CN').toLowerCase();
    return lang.startsWith('zh') ? 'zh' : 'en';
})();

const DriftDiagnosis = {
    types: [
        { icon: '🐢', title: '佛系车手', titleEn: 'Buddhist Driver', rarePercent: '35%', rarityClass: 'common', quote: '“慢是一种态度，不是技术问题。”', quoteEn: '"Slow is a lifestyle, not a skill issue."', minScore: 0 },
        { icon: '🎵', title: '节奏大师', titleEn: 'Rhythm Master', rarePercent: '20%', rarityClass: 'rare', quote: '“你和弯道的默契度：灵魂伴侣。”', quoteEn: '"You and corners are basically soulmates."', minScore: 2000 },
        { icon: '🔥', title: '漂移艺术家', titleEn: 'Drift Artist', rarePercent: '5%', rarityClass: 'epic', quote: '“你的轮胎烟雾是艺术品。”', quoteEn: "Your tire smoke is modern art.", minScore: 5000 },
        { icon: '🌪️', title: '漂移之神', titleEn: 'Drift God', rarePercent: '0.7%', rarityClass: 'legendary', quote: '“你已经超越了物理定律。”', quoteEn: '"You have transcended physics."', minScore: 10000 }
    ],
    
    roasts: {
        zh: [
            "你的漂移让教练想辞职。",
            "建议先去学开车再来玩。",
            "你的漂移技术让驾校教练都流泪。",
            "弯道上的其他车都在等你。",
            "你更适合开拖拉机。",
            "你的车技让轮胎都感到害怕。",
            "建议改名叫'撞墙专家'。",
            "你的方向盘只是个装饰品。",
            "你开车像在开碰碰车。",
            "弯道的墙都被你撞坏了。"
        ],
        en: [
            "Your drifting makes instructors quit.",
            "Try learning to drive first.",
            "Your drifting makes coaches cry.",
            "Other cars are waiting at corners.",
            "You are better suited for tractors.",
            "Your driving scares tires.",
            "Consider renaming yourself 'Wall Expert'.",
            "Your steering wheel is just for show.",
            "You drive like it is a bumper car.",
            "You have ruined all the corner walls."
        ]
    },

    getTexts() {
        const isZh = DriftDiagnosisLang === 'zh';
        return isZh ? {
            confirmed: '确诊',
            record: '✨ 新纪录！',
            scoreLabel: '最终分数',
            highScoreLabel: '最高',
            tag: '🎮 Emoji Drift 诊断',
            roastTitle: '💬 网友吐槽',
            statDrifts: '完美漂移',
            statCombo: '最高连击',
            share: '分享你的诊断报告',
            replay: '🔄 再来一局',
            copied: '已复制！',
            shareTitle: (type) => `🎮 Emoji Arcade 诊断报告\n\n${type.icon} ${type.title}\n${type.quote}\n\n测测你是什么玩家"病症" 👉 emojiarcade.app`,
            shareTwitter: (type) => `🎮 刚被诊断为「${type.title}」\n${type.quote}\n\n测测你是什么玩家"病症" 👇`
        } : {
            confirmed: 'DIAGNOSIS',
            record: '✨ NEW RECORD!',
            scoreLabel: 'Final Score',
            highScoreLabel: 'Best',
            tag: '🎮 Emoji Drift Diagnosis',
            roastTitle: '💬 Roast',
            statDrifts: 'Perfect Drifts',
            statCombo: 'Max Combo',
            share: 'Share your diagnosis',
            replay: '🔄 Play Again',
            copied: 'Copied!',
            shareTitle: (type) => `🎮 Emoji Arcade Diagnosis\n\n${type.icon} ${type.titleEn}\n${type.quoteEn}\n\nFind out your player type 👉 emojiarcade.app`,
            shareTwitter: (type) => `🎮 Just diagnosed as "${type.titleEn}"\n${type.quoteEn}\n\nFind out your player type 👇`
        };
    },
    
    show(stats) {
        const isZh = DriftDiagnosisLang === 'zh';
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
            <div id="diagnosisModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:99999;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 0;box-sizing:border-box;touch-action:pan-y!important;"
                 onclick="DriftDiagnosis.hide()">
                <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:20px;padding:30px;max-width:420px;width:90%;border:2px solid rgba(0,245,255,0.3);position:relative;margin:auto;touch-action:pan-y!important;"
                     onclick="event.stopPropagation()">
                    <div style="position:absolute;top:15px;right:15px;width:50px;height:50px;border:2px solid #ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ef4444;font-weight:bold;font-size:12px;transform:rotate(-15deg);opacity:0.8;">${t.confirmed}</div>
                    
                    <div style="text-align:center;margin-bottom:15px;padding:15px;background:rgba(255,255,255,0.03);border-radius:12px;">
                        <div style="font-size:13px;color:#94a3b8;margin-bottom:5px;">${isNewHighScore ? t.record : t.scoreLabel}</div>
                        <div style="font-size:36px;font-weight:800;background:linear-gradient(90deg,#00f5ff,#bc13fe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${stats.score}</div>
                        <div style="font-size:12px;color:#64748b;margin-top:5px;">${t.highScoreLabel}: ${stats.highScore}</div>
                    </div>
                    
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:50px;margin-bottom:10px;">${type.icon}</div>
                        <div style="background:rgba(255,255,255,0.1);padding:4px 12px;border-radius:15px;font-size:11px;color:#94a3b8;display:inline-block;margin-bottom:8px;">${t.tag}</div>
                        <h2 style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#00f5ff,#bc13fe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:3px;">${title}</h2>
                        <div style="display:inline-flex;align-items:center;gap:4px;margin-top:12px;padding:6px 16px;border-radius:20px;font-weight:700;font-size:12px;background:linear-gradient(135deg,#00f5ff,#bc13fe);color:#fff;">
                            🌟 ${rarity} · ${type.rarePercent}
                        </div>
                    </div>
                    <div style="background:rgba(99,102,241,0.1);border-left:3px solid #6366f1;padding:12px;margin:12px 0;border-radius:0 8px 8px 0;font-style:italic;color:#cbd5e1;font-size:13px;">${quote}</div>
                    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);padding:10px;border-radius:8px;margin:12px 0;">
                        <div style="color:#ef4444;font-size:11px;font-weight:600;margin-bottom:4px;">${t.roastTitle}</div>
                        <div style="color:#fca5a5;font-size:13px;">${roast}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0;">
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#00f5ff;">${stats.perfectDrifts || 0}</div><div style="font-size:11px;color:#94a3b8;">${t.statDrifts}</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#fbbf24;">${stats.maxCombo || 0}</div><div style="font-size:11px;color:#94a3b8;">${t.statCombo}</div></div>
                    </div>
                    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:15px;">
                        <div style="text-align:center;color:#94a3b8;font-size:11px;margin-bottom:10px;">${t.share}</div>
                        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
                            <button onclick="DriftDiagnosis.share('twitter')" style="padding:8px 14px;border-radius:15px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:12px;">🐦</button>
                            <button onclick="DriftDiagnosis.share('weibo')" style="padding:8px 14px;border-radius:15px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:12px;">📱</button>
                            <button onclick="DriftDiagnosis.share('copy')" style="padding:8px 14px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:12px;">📋</button>
                        </div>
                        <div style="display:flex;gap:8px;margin-top:12px;">
                            <button onclick="DriftDiagnosis.hide();startGame();" style="flex:1;padding:12px;border-radius:15px;border:none;background:linear-gradient(135deg,#00f5ff,#bc13fe);color:white;font-weight:600;cursor:pointer;font-size:14px;">${t.replay}</button>
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