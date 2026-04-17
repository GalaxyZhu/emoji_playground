// Kart 诊断系统
const KartDiagnosisLang = (() => {
    // 优先读取 URL 参数 lang=zh/en（来自首页语言切换）
    const urlLang = new URLSearchParams(location.search).get('lang');
    if (urlLang === 'zh' || urlLang === 'en') {
        return urlLang;
    }
    // 回退到浏览器语言
    const lang = (navigator.language || navigator.userLanguage || 'zh-CN').toLowerCase();
    return lang.startsWith('zh') ? 'zh' : 'en';
})();

const KartDiagnosis = {
    types: [
        { icon: '🐌', title: '赛道散步者', titleEn: 'Track Walker', rarePercent: '40%', rarityClass: 'common', quote: '“你在赛道上留下了脚印，不是轮胎印。”', quoteEn: '"You left footprints on the track, not tire marks."', minRank: 4 },
        { icon: '🥉', title: '领奖台边缘', titleEn: 'Podium Edge', rarePercent: '20%', rarityClass: 'rare', quote: '“差一点就能喝香槟了。”', quoteEn: '"So close to popping champagne."', minRank: 3 },
        { icon: '🥈', title: '亚军专业户', titleEn: 'Second Place Pro', rarePercent: '5%', rarityClass: 'epic', quote: '“你总是差那么一点点。”', quoteEn: '"You are always just a little bit short."', minRank: 2 },
        { icon: '🥇', title: '冠军收割机', titleEn: 'Champion Harvester', rarePercent: '0.5%', rarityClass: 'legendary', quote: '“你的方向盘上有王者的气息。”', quoteEn: '"Your steering wheel smells like victory."', minRank: 1 }
    ],
    
    roasts: {
        zh: [
            "你的车速让蜗牛都自愧不如。",
            "建议先去考个驾照再来玩。",
            "你的驾驶技术让驾校教练都流泪。",
            "赛道上的其他车都在等你。",
            "你更适合玩步行模拟器。",
            "你的车技让保险公司都感到害怕。",
            "建议改名叫'散步冠军'。",
            "你的方向盘可能只是个装饰品。",
            "你开车像在开碰碰车。",
            "赛道上的草皮被你压坏了。"
        ],
        en: [
            "Your speed makes snails proud.",
            "Try getting a license first.",
            "Your driving makes instructors cry.",
            "Other cars are waiting for you.",
            "You are better suited for walking simulators.",
            "Your driving scares insurance companies.",
            "Consider renaming yourself 'Strolling Champion'.",
            "Your steering wheel might just be decoration.",
            "You drive like it is a bumper car.",
            "You have ruined the track grass."
        ]
    },

    getTexts() {
        const isZh = KartDiagnosisLang === 'zh';
        return isZh ? {
            confirmed: '确诊',
            record: '✨ 新纪录！',
            scoreLabel: '最终名次',
            highScoreLabel: '最佳',
            tag: '🎮 Emoji Kart 诊断',
            roastTitle: '💬 网友吐槽',
            statLaps: '完成圈数',
            statSpeed: '最高速度',
            share: '分享你的诊断报告',
            replay: '🔄 再来一局',
            copied: '已复制！',
            shareTitle: (type) => `🎮 Emoji Arcade 诊断报告\n\n${type.icon} ${type.title}\n${type.quote}\n\n测测你是什么玩家"病症" 👉 emojiarcade.app`,
            shareTwitter: (type) => `🎮 刚被诊断为「${type.title}」\n${type.quote}\n\n测测你是什么玩家"病症" 👇`
        } : {
            confirmed: 'DIAGNOSIS',
            record: '✨ NEW RECORD!',
            scoreLabel: 'Final Rank',
            highScoreLabel: 'Best',
            tag: '🎮 Emoji Kart Diagnosis',
            roastTitle: '💬 Roast',
            statLaps: 'Laps Completed',
            statSpeed: 'Top Speed',
            share: 'Share your diagnosis',
            replay: '🔄 Play Again',
            copied: 'Copied!',
            shareTitle: (type) => `🎮 Emoji Arcade Diagnosis\n\n${type.icon} ${type.titleEn}\n${type.quoteEn}\n\nFind out your player type 👉 emojiarcade.app`,
            shareTwitter: (type) => `🎮 Just diagnosed as "${type.titleEn}"\n${type.quoteEn}\n\nFind out your player type 👇`
        };
    },
    
    show(stats) {
        const isZh = KartDiagnosisLang === 'zh';
        const t = this.getTexts();
        const type = this.types.slice().reverse().find(t => stats.rank <= t.minRank) || this.types[0];
        const roastPool = this.roasts[isZh ? 'zh' : 'en'];
        const roast = roastPool[Math.floor(Math.random() * roastPool.length)];
        const isNewHighScore = stats.rank === 1 && (stats.bestRank === 0 || stats.rank <= stats.bestRank);
        const title = isZh ? type.title : type.titleEn;
        const quote = isZh ? type.quote : type.quoteEn;
        const rarity = isZh
            ? ({ common: '常见', rare: '稀有', epic: '史诗', legendary: '传说' }[type.rarityClass] || '常见')
            : ({ common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' }[type.rarityClass] || 'Common');
        
        const html = `
            <div id="diagnosisModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:99999;display:flex;justify-content:center;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"
                 onclick="if(event.target===this)KartDiagnosis.hide()">
                <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:20px;padding:30px;max-width:420px;width:90%;border:2px solid rgba(255,0,110,0.3);position:relative;max-height:90vh;overflow-y:auto;">
                    <div style="position:absolute;top:15px;right:15px;width:50px;height:50px;border:2px solid #ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ef4444;font-weight:bold;font-size:12px;transform:rotate(-15deg);opacity:0.8;">${t.confirmed}</div>
                    
                    <div style="text-align:center;margin-bottom:15px;padding:15px;background:rgba(255,255,255,0.03);border-radius:12px;">
                        <div style="font-size:13px;color:#94a3b8;margin-bottom:5px;">${isNewHighScore ? t.record : t.scoreLabel}</div>
                        <div style="font-size:36px;font-weight:800;background:linear-gradient(90deg,#ff006e,#bc13fe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">#${stats.rank}</div>
                        <div style="font-size:12px;color:#64748b;margin-top:5px;">${t.highScoreLabel}: ${stats.bestRank === 0 ? '-' : '#' + stats.bestRank}</div>
                    </div>
                    
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:50px;margin-bottom:10px;">${type.icon}</div>
                        <div style="background:rgba(255,255,255,0.1);padding:4px 12px;border-radius:15px;font-size:11px;color:#94a3b8;display:inline-block;margin-bottom:8px;">${t.tag}</div>
                        <h2 style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#ff006e,#bc13fe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:3px;">${title}</h2>
                        <div style="display:inline-flex;align-items:center;gap:4px;margin-top:12px;padding:6px 16px;border-radius:20px;font-weight:700;font-size:12px;background:linear-gradient(135deg,#ff006e,#bc13fe);color:#fff;">
                            🌟 ${rarity} · ${type.rarePercent}
                        </div>
                    </div>
                    <div style="background:rgba(99,102,241,0.1);border-left:3px solid #6366f1;padding:12px;margin:12px 0;border-radius:0 8px 8px 0;font-style:italic;color:#cbd5e1;font-size:13px;">${quote}</div>
                    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);padding:10px;border-radius:8px;margin:12px 0;">
                        <div style="color:#ef4444;font-size:11px;font-weight:600;margin-bottom:4px;">${t.roastTitle}</div>
                        <div style="color:#fca5a5;font-size:13px;">${roast}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0;">
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#ff006e;">${stats.laps || 0}</div><div style="font-size:11px;color:#94a3b8;">${t.statLaps}</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#fbbf24;">${stats.maxSpeed || 0}</div><div style="font-size:11px;color:#94a3b8;">${t.statSpeed}</div></div>
                    </div>
                    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:15px;">
                        <div style="text-align:center;color:#94a3b8;font-size:11px;margin-bottom:10px;">${t.share}</div>
                        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
                            <button onclick="KartDiagnosis.share('twitter')" style="padding:8px 14px;border-radius:15px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:12px;">🐦</button>
                            <button onclick="KartDiagnosis.share('weibo')" style="padding:8px 14px;border-radius:15px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:12px;">📱</button>
                            <button onclick="KartDiagnosis.share('copy')" style="padding:8px 14px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:12px;">📋</button>
                        </div>
                        <div style="display:flex;gap:8px;margin-top:12px;">
                            <button onclick="KartDiagnosis.hide();startGame();" style="flex:1;padding:12px;border-radius:15px;border:none;background:linear-gradient(135deg,#ff006e,#bc13fe);color:white;font-weight:600;cursor:pointer;font-size:14px;">${t.replay}</button>
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