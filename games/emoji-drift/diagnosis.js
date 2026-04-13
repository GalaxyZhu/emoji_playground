// Drift 诊断系统
const DriftDiagnosis = {
    types: [
        { icon: '🐢', title: '佛系车手', titleEn: 'Buddhist Driver', rare: '常见', rarePercent: '35%', rarityClass: 'common', quote: '“慢是一种态度，不是技术问题。”', minScore: 0 },
        { icon: '🎵', title: '节奏大师', titleEn: 'Rhythm Master', rare: '稀有', rarePercent: '20%', rarityClass: 'rare', quote: '“你和弯道的默契度：灵魂伴侣。”', minScore: 2000 },
        { icon: '🏎️', title: '漂移狂人', titleEn: 'Drift Maniac', rare: '史诗', rarePercent: '8%', rarityClass: 'epic', quote: '“轮胎在哭泣，但你在笑。”', minScore: 5000 },
        { icon: '👑', title: '秋名山车神', titleEn: 'Mountain God', rare: '传说', rarePercent: '1%', rarityClass: 'legendary', quote: '“排水渠过弯只是你的热身。”', minScore: 8000 }
    ],
    
    roasts: [
        "你的漂移轨迹比我的生命线还直。",
        "建议去考个卡丁车驾照先。",
        "方向盘在你手里只是装饰品吧？",
        "弯道不减速，人生不回头。",
        "你的车技和WiFi信号一样不稳定。",
        "建议改名叫'刹不住先生'。",
        "完美错过每一个弯道的也是一种本事。",
        "你的轮胎：我真的尽力了。",
        "漂移？你那叫滑行。",
        "建议先去驾校回炉重造。"
    ],
    
    show(stats) {
        const type = this.types.slice().reverse().find(t => stats.score >= t.minScore) || this.types[0];
        const roast = this.roasts[Math.floor(Math.random() * this.roasts.length)];
        const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;
        
        const html = `
            <div id="diagnosisModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:99999;display:flex;justify-content:center;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"
                 onclick="if(event.target===this)DriftDiagnosis.hide()">
                <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:20px;padding:30px;max-width:420px;width:90%;border:2px solid rgba(255,255,255,0.1);position:relative;max-height:90vh;overflow-y:auto;">
                    <div style="position:absolute;top:15px;right:15px;width:50px;height:50px;border:2px solid #ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ef4444;font-weight:bold;font-size:12px;transform:rotate(-15deg);opacity:0.8;">确诊</div>
                    
                    <div style="text-align:center;margin-bottom:15px;padding:15px;background:rgba(255,255,255,0.03);border-radius:12px;">
                        <div style="font-size:13px;color:#94a3b8;margin-bottom:5px;">${isNewHighScore ? '✨ 新纪录！' : '最终得分'}</div>
                        <div style="font-size:36px;font-weight:800;background:linear-gradient(90deg,#00c8ff,#0077ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${Math.floor(stats.score)}</div>
                        <div style="font-size:12px;color:#64748b;margin-top:5px;">最高分: ${Math.floor(stats.highScore)}</div>
                    </div>
                    
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:50px;margin-bottom:10px;">${type.icon}</div>
                        <div style="background:rgba(255,255,255,0.1);padding:4px 12px;border-radius:15px;font-size:11px;color:#94a3b8;display:inline-block;margin-bottom:8px;">🎮 Emoji Drift 诊断</div>
                        <h2 style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#00c8ff,#0077ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:3px;">${type.title}</h2>
                        <div style="color:#64748b;font-size:13px;">${type.titleEn}</div>
                        <div style="display:inline-flex;align-items:center;gap:4px;margin-top:12px;padding:6px 16px;border-radius:20px;font-weight:700;font-size:12px;background:linear-gradient(135deg,#00c8ff,#0077ff);color:#fff;">
                            🌟 ${type.rare} · ${type.rarePercent}
                        </div>
                    </div>
                    <div style="background:rgba(99,102,241,0.1);border-left:3px solid #6366f1;padding:12px;margin:12px 0;border-radius:0 8px 8px 0;font-style:italic;color:#cbd5e1;font-size:13px;">${type.quote}</div>
                    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);padding:10px;border-radius:8px;margin:12px 0;">
                        <div style="color:#ef4444;font-size:11px;font-weight:600;margin-bottom:4px;">💬 网友吐槽</div>
                        <div style="color:#fca5a5;font-size:13px;">${roast}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0;">
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#00c8ff;">${stats.combo || 0}</div><div style="font-size:11px;color:#94a3b8;">最高连击</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#00ff88;">${stats.perfectCount || 0}</div><div style="font-size:11px;color:#94a3b8;">Perfect</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#fbbf24;">${stats.goodCount || 0}</div><div style="font-size:11px;color:#94a3b8;">Good</div></div>
                        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#a855f7;">${stats.missCount || 0}</div><div style="font-size:11px;color:#94a3b8;">Miss</div></div>
                    </div>
                    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:15px;">
                        <div style="text-align:center;color:#94a3b8;font-size:11px;margin-bottom:10px;">分享你的诊断报告</div>
                        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
                            <button onclick="DriftDiagnosis.share('twitter')" style="padding:8px 14px;border-radius:15px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:12px;">🐦</button>
                            <button onclick="DriftDiagnosis.share('weibo')" style="padding:8px 14px;border-radius:15px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:12px;">📱</button>
                            <button onclick="DriftDiagnosis.share('copy')" style="padding:8px 14px;border-radius:15px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:12px;">📋</button>
                        </div>
                        <div style="display:flex;gap:8px;margin-top:12px;">
                            <button onclick="DriftDiagnosis.hide();startGame();" style="flex:1;padding:12px;border-radius:15px;border:none;background:linear-gradient(135deg,#00c8ff,#0077ff);color:white;font-weight:600;cursor:pointer;font-size:14px;">🔄 再来一局</button>
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
        const type = this.currentType;
        const text = `🎮 Emoji Arcade 诊断报告\n\n${type.icon} ${type.title}\n${type.quote}\n\n测测你是什么玩家"病症" 👉 emojiarcade.app`;
        
        if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('🎮 刚被诊断为「' + type.title + '」\n' + type.quote)}&url=${encodeURIComponent('https://emojiarcade.app')}`, '_blank');
        } else if (platform === 'weibo') {
            window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent('https://emojiarcade.app')}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(text).then(() => alert('已复制！'));
        }
    }
};
