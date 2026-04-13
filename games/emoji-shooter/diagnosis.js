// Emoji Shooter 游戏后诊断系统 (i18n 版本)
// 在 gameOver() 函数后添加此代码

// ==================== 游戏数据收集器 ====================
const ShooterDataCollector = {
    shotsFired: 0,
    shotsHit: 0,
    reloads: 0,
    panicShots: 0,
    lastShotTime: 0,
    rapidFireCount: 0,
    
    reset() {
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.reloads = 0;
        this.panicShots = 0;
        this.lastShotTime = 0;
        this.rapidFireCount = 0;
    },
    
    logShot(hit) {
        this.shotsFired++;
        if (hit) this.shotsHit++;
        
        const now = Date.now();
        if (now - this.lastShotTime < 500) {
            this.rapidFireCount++;
            if (this.rapidFireCount > 5) {
                this.panicShots++;
            }
        } else {
            this.rapidFireCount = 1;
        }
        this.lastShotTime = now;
    },
    
    getStats() {
        const accuracy = this.shotsFired > 0 ? (this.shotsHit / this.shotsFired * 100).toFixed(1) : 0;
        return {
            shotsFired: this.shotsFired,
            shotsHit: this.shotsHit,
            accuracy: parseFloat(accuracy),
            panicShots: this.panicShots,
            enemiesKilled: window.enemiesKilled || 0,
            wave: window.wave || 1,
            score: window.score || 0
        };
    }
};

// ==================== 玩家类型判定器 ====================
const ShooterArchetypeDetector = {
    detect(stats) {
        const { shotsFired, shotsHit, accuracy, panicShots, enemiesKilled } = stats;
        
        if (accuracy > 85 && enemiesKilled > 10) {
            return 'SNP';
        }
        
        if (shotsFired > 100 && accuracy < 20 && panicShots > 10) {
            return 'PAN';
        }
        
        if (shotsFired > 50 && accuracy < 30) {
            return 'SPR';
        }
        
        return 'SPD';
    }
};

// ==================== 诊断报告UI ====================
const ShooterDiagnosisUI = {
    types: {
        SPD: { icon: '🔫', rarityClass: 'rarity-common', rarePercent: '28%' },
        SNP: { icon: '🎯', rarityClass: 'rarity-rare', rarePercent: '5%' },
        SPR: { icon: '🏃', rarityClass: 'rarity-common', rarePercent: '22%' },
        PAN: { icon: '😱', rarityClass: 'rarity-common', rarePercent: '35%' }
    },
    
    show(stats) {
        const typeCode = ShooterArchetypeDetector.detect(stats);
        const type = this.types[typeCode];
        const title = i18n.t(`type.shooter.${typeCode}.title`);
        const titleEn = i18n.t(`type.shooter.${typeCode}.titleEn`);
        const quote = i18n.t(`type.shooter.${typeCode}.quote`);
        const rarity = i18n.t(`type.${type.rarityClass.replace('rarity-', 'rarity.')}`);
        const roasts = i18n.tArray(`type.shooter.${typeCode}.roasts`);
        const roast = roasts[Math.floor(Math.random() * roasts.length)];
        
        const html = `
            <div id="diagnosisModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;justify-content:center;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"
                 onclick="if(event.target===this)ShooterDiagnosisUI.hide()">
                <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:20px;padding:30px;max-width:400px;width:90%;border:2px solid rgba(255,255,255,0.1);position:relative;"
                     onclick="event.stopPropagation()">
                    
                    <div style="position:absolute;top:20px;right:20px;width:60px;height:60px;border:3px solid #ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ef4444;font-weight:bold;font-size:14px;transform:rotate(-15deg);opacity:0.8;">${i18n.t('diagnosis.confirmed')}</div>
                    
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:60px;margin-bottom:10px;">${type.icon}</div>
                        <div style="background:rgba(255,255,255,0.1);padding:5px 15px;border-radius:20px;font-size:12px;color:#94a3b8;display:inline-block;margin-bottom:10px;">${i18n.t('game.tag')}</div>
                        <h2 style="font-size:24px;font-weight:800;background:linear-gradient(90deg,#fbbf24,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:5px;">${title}</h2>
                        <div style="color:#64748b;font-size:14px;">${titleEn}</div>
                        <div style="display:inline-flex;align-items:center;gap:5px;margin-top:15px;padding:8px 20px;border-radius:25px;font-weight:700;font-size:13px;${this.getRarityStyle(type.rarityClass)}">
                            <span>🌟</span><span>${rarity} · ${type.rarePercent}</span>
                        </div>
                    </div>
                    
                    <div style="background:rgba(99,102,241,0.1);border-left:4px solid #6366f1;padding:15px;margin:15px 0;border-radius:0 10px 10px 0;font-style:italic;color:#cbd5e1;font-size:14px;">
                        ${quote}
                    </div>
                    
                    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);padding:12px;border-radius:10px;margin:15px 0;">
                        <div style="color:#ef4444;font-size:12px;font-weight:600;margin-bottom:5px;">${i18n.t('diagnosis.roast.title')}</div>
                        <div style="color:#fca5a5;font-size:14px;">${roast}</div>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0;">
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;text-align:center;">
                            <div style="font-size:20px;font-weight:800;color:#ef4444;">${stats.shotsFired}</div>
                            <div style="font-size:12px;color:#94a3b8;">${i18n.t('shooter.shots_fired')}</div>
                            <div style="font-size:11px;color:#64748b;margin-top:3px;">${i18n.t('shooter.keyboard_tired')}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;text-align:center;">
                            <div style="font-size:20px;font-weight:800;color:#22c55e;">${stats.shotsHit}</div>
                            <div style="font-size:12px;color:#94a3b8;">${i18n.t('shooter.shots_hit')}</div>
                            <div style="font-size:11px;color:#64748b;margin-top:3px;">${i18n.t('shooter.accuracy_label')}${stats.accuracy}%</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;text-align:center;">
                            <div style="font-size:20px;font-weight:800;color:#fbbf24;">${stats.enemiesKilled}</div>
                            <div style="font-size:12px;color:#94a3b8;">${i18n.t('shooter.kills')}</div>
                            <div style="font-size:11px;color:#64748b;margin-top:3px;">${i18n.t('stat.died_at_wave', {wave: stats.wave})}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;text-align:center;">
                            <div style="font-size:20px;font-weight:800;color:#a855f7;">${stats.score}</div>
                            <div style="font-size:12px;color:#94a3b8;">${i18n.t('stat.score')}</div>
                            <div style="font-size:11px;color:#64748b;margin-top:3px;">${i18n.t('stat.keep_trying')}</div>
                        </div>
                    </div>
                    
                    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:20px;">
                        <div style="text-align:center;color:#94a3b8;font-size:12px;margin-bottom:12px;">${i18n.t('diagnosis.share.title')}</div>
                        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                            <button onclick="ShooterDiagnosisUI.shareTwitter()" style="padding:10px 18px;border-radius:20px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:13px;">${i18n.t('btn.twitter')}</button>
                            <button onclick="ShooterDiagnosisUI.shareWeibo()" style="padding:10px 18px;border-radius:20px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:13px;">${i18n.t('btn.weibo')}</button>
                            <button onclick="ShooterDiagnosisUI.copyText()" style="padding:10px 18px;border-radius:20px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:13px;">${i18n.t('btn.copy')}</button>
                            <button onclick="ShooterDiagnosisUI.hide()" style="padding:10px 18px;border-radius:20px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:600;cursor:pointer;font-size:13px;">${i18n.t('btn.replay')}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existing = document.getElementById('diagnosisModal');
        if (existing) existing.remove();
        
        document.body.insertAdjacentHTML('beforeend', html);
        
        this.currentType = { ...type, title, titleEn, quote, rarity };
        this.currentStats = stats;
    },
    
    hide() {
        const modal = document.getElementById('diagnosisModal');
        if (modal) modal.remove();
        if (typeof startGame === 'function') startGame();
    },
    
    getRarityStyle(rarityClass) {
        const styles = {
            'rarity-common': 'background:linear-gradient(135deg,#94a3b8,#64748b);color:#fff;',
            'rarity-rare': 'background:linear-gradient(135deg,#60a5fa,#3b82f6);color:#fff;',
            'rarity-epic': 'background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;',
            'rarity-legendary': 'background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#000;'
        };
        return styles[rarityClass] || styles['rarity-common'];
    },
    
    shareTwitter() {
        const type = this.currentType;
        const text = encodeURIComponent(i18n.t('share.text', { 
            title: type.title, 
            quote: type.quote 
        }));
        const url = encodeURIComponent('https://emojiarcade.app');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    },
    
    shareWeibo() {
        const type = this.currentType;
        const text = encodeURIComponent(i18n.t('share.weibo', {
            title: type.title,
            icon: type.icon,
            quote: type.quote
        }));
        const url = encodeURIComponent('https://emojiarcade.app');
        window.open(`https://service.weibo.com/share/share.php?title=${text}&url=${url}`, '_blank');
    },
    
    copyText() {
        const type = this.currentType;
        const text = i18n.t('share.copy', {
            icon: type.icon,
            title: type.title,
            titleEn: type.titleEn,
            rare: type.rarity,
            rarePercent: type.rarePercent,
            quote: type.quote
        });
        navigator.clipboard.writeText(text).then(() => alert(i18n.t('toast.copied')));
    }
};

// ==================== 修改原游戏代码 ====================
const originalShoot = window.shoot;
window.shoot = function() {
    ShooterDataCollector.logShot(false);
    if (originalShoot) originalShoot();
};

const originalGameOver = window.gameOver;
window.gameOver = function() {
    if (originalGameOver) originalGameOver();
    const stats = ShooterDataCollector.getStats();
    setTimeout(() => ShooterDiagnosisUI.show(stats), 500);
};

const originalStartGame = window.startGame;
window.startGame = function() {
    ShooterDataCollector.reset();
    if (originalStartGame) originalStartGame();
};

console.log('🎮 Emoji Shooter Diagnosis (i18n) loaded');
