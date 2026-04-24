// Hop 诊断系统
const HopDiagnosisLang = (() => {
    // 优先读取 URL 参数 lang=zh/en（来自首页语言切换）
    const urlLang = new URLSearchParams(location.search).get('lang');
    if (urlLang === 'zh' || urlLang === 'en') {
        return urlLang;
    }
    // 回退到浏览器语言
    const lang = (navigator.language || navigator.userLanguage || 'zh-CN').toLowerCase();
    return lang.startsWith('zh') ? 'zh' : 'en';
})();

const HopDiagnosis = {
    types: [
        { icon: '🐒', title: '落水猴王', titleEn: 'Drowned Monkey', rarePercent: '38%', rarityClass: 'common', quote: '“你的特长是让自己变湿。”', quoteEn: '"Your specialty is getting yourself wet."', minScore: 0 },
        { icon: '🪵', title: '过河老手', titleEn: 'River Veteran', rarePercent: '15%', rarityClass: 'rare', quote: '“木头是你最好的朋友。”', quoteEn: '"Logs are your best friends."', minScore: 1000 },
        { icon: '🏃', title: '跳跃大师', titleEn: 'Jump Master', rarePercent: '6%', rarityClass: 'epic', quote: '“你的跳跃让牛顿都怀疑人生。”', quoteEn: '"Your jumps make Newton question physics."', minScore: 2000 },
        { icon: '🌊', title: '河流之王', titleEn: 'River King', rarePercent: '0.9%', rarityClass: 'legendary', quote: '“河流在你面前都要绕道。”', quoteEn: '"Rivers reroute to avoid you."', minScore: 5000 }
    ],
    
    roasts: {
        zh: [
            "你跳河的样子像在练习自杀。",
            "建议先去学游泳再来玩。",
            "你的落点精准度堪比随机数生成器。",
            "猴子看了你的操作都摇头。",
            "你更适合玩跳水游戏。",
            "连木头都救不了你。",
            "你的跳跃让河神都感到困惑。",
            "建议改名叫'落水专家'。",
            "你的猴子可能在梦游。",
            "过河？你更像是过葬。"
        ],
        en: [
            "Your jumping looks like practicing self-harm.",
            "Try learning to swim first.",
            "Your landing accuracy rivals a random number generator.",
            "Even monkeys shake their heads at your moves.",
            "You are better suited for diving games.",
            "Not even logs can save you.",
            "Your jumps confuse the river god.",
            "Consider renaming yourself 'Drowning Expert'.",
            "Your monkey might be sleepwalking.",
            "Crossing? More like funeral procession."
        ]
    },

    getTexts() {
        const isZh = HopDiagnosisLang === 'zh';
        return isZh ? {
            confirmed: '确诊',
            record: '✨ 新纪录！',
            scoreLabel: '最终分数',
            highScoreLabel: '最高',
            tag: '🎮 Emoji Hop 诊断',
            roastTitle: '💬 网友吐槽',
            statLogs: '木头踩踏',
            statHops: '跳跃次数',
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
            tag: '🎮 Emoji Hop Diagnosis',
            roastTitle: '💬 Roast',
            statLogs: 'Logs Stepped',
            statHops: 'Jumps',
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
            <div id="diagnosisModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:99999;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 0;box-sizing:border-box;touch-action:pan-y!important;"
                 onclick="HopDiagnosis.hide()">
                <div style="background:linear-gradient(135deg,#1a3a2e 0%,#0d1f15 100%);border-radius:20px;padding:30px;max-width:420px;width:90%;border:2px solid rgba(74,222,128,0.3);position:relative;margin:auto;touch-action:pan-y!important;"
                     onclick="event.stopPropagation()">
                    <div style="position:absolute;top:15px;right:15px;width:50px;height:50px;border:2px solid #ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ef4444;font-weight:bold;font-size:12px;transform:rotate(-15deg);opacity:0.8;">${t.confirmed}</div>
                    
                    <div style="text-align:center;margin-bottom:15px;padding:15px;background:rgba(255,255,255,0.03);border-radius:12px;">
                        <div style="font-size:13px;color:#94a3b8;margin-bottom:5px;">${isNewHighScore ? t.record : t.scoreLabel}</div>
                        <div style="font-size:36px;font-weight:800;background:linear-gradient(90deg,#4ade80,#16a34a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${stats.score}</div>
                        <div style="font-size:12px;color:#64748b;margin-top:5px;">${t.highScoreLabel}: ${stats.highScore}</div>
                    </div>
                    
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:50px;margin-bottom:10px;">${type.icon}</div>
                        <div style="background:rgba(255,255,255,0.1);padding:4px 12px;border-radius:15px;font-size:11px;color:#94a3b8;display:inline-block;margin-bottom:8px;">${t.tag}</div>
                        <h2 style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#4ade80,#16a34a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:3px;">${title}</h2>
                        <div style="display:inline-flex;align-items:center;gap:4px;margin-top:12px;padding:6px 16px;border-radius:20px;font-weight:700;font-size:12px;background:linear-gradient(135deg,#4ade80,#16a34a);color:#fff;">
                            🌟 ${rarity} · ${type.rarePercent}
                        </div>
                    </div>
                    <div style="background:rgba(99,102,241,0.1);border-left:3px solid #6366f1;padding:12px;margin:12px 0;border-radius:0 8px 8px 0;font-style:italic;color:#cbd5e1;font-size:13px;">${quote}</div>
                    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);padding:10px;border-radius:8px;margin:12px 0;">
                        <div style="color:#ef4444;font-size:11px;font-weight:600;margin-bottom:4px;">${t.roastTitle}</div>
                        <div style="color:#fca5a5;font-size:13px;">${roast}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0;">
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#4ade80;">${stats.logsJumped || 0}</div><div style="font-size:11px;color:#94a3b8;">${t.statLogs}</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#fbbf24;">${stats.hopCount || 0}</div><div style="font-size:11px;color:#94a3b8;">${t.statHops}</div></div>
                    </div>
                    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:15px;">
                        <div style="text-align:center;color:#94a3b8;font-size:11px;margin-bottom:10px;">${t.share}</div>
                        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
                            <button onclick="HopDiagnosis.share('twitter')" style="padding:8px 14px;border-radius:15px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:12px;">🐦</button>
                            <button onclick="HopDiagnosis.share('weibo')" style="padding:8px 14px;border-radius:15px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:12px;">📱</button>
                            <button onclick="HopDiagnosis.share('copy')" style="padding:8px 14px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:12px;">📋</button>
                        </div>
                        <div style="display:flex;gap:8px;margin-top:12px;">
                            <button onclick="HopDiagnosis.hide();startGame();" style="flex:1;padding:12px;border-radius:15px;border:none;background:linear-gradient(135deg,#4ade80,#16a34a);color:white;font-weight:600;cursor:pointer;font-size:14px;">${t.replay}</button>
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