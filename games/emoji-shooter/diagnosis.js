// Emoji Shooter 游戏后诊断系统
// 在 gameOver() 函数后添加此代码

// ==================== 游戏数据收集器 ====================
const ShooterDataCollector = {
    shotsFired: 0,      // 射击次数
    shotsHit: 0,        // 命中次数
    reloads: 0,         // 换弹次数（shooter是自动射击，用其他指标）
    panicShots: 0,      // panic射击（短时间内疯狂射击）
    lastShotTime: 0,    // 上次射击时间
    rapidFireCount: 0,  // 连射计数
    
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
        
        // 检测 panic 射击（0.5秒内连续射击超过5次）
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
        
        // 锁头挂嫌疑人：命中率>85% 且 击杀>10
        if (accuracy > 85 && enemiesKilled > 10) {
            return 'SNP';
        }
        
        // panic射击手：射击次数>100 且 命中率<20% 且 panic标记多
        if (shotsFired > 100 && accuracy < 20 && panicShots > 10) {
            return 'PAN';
        }
        
        // 无限换弹癌（shooter里用低命中率+高射击数模拟）
        if (shotsFired > 50 && accuracy < 30) {
            return 'SPR';
        }
        
        // 默认：人体描边大师
        return 'SPD';
    }
};

// ==================== 诊断报告UI ====================
const ShooterDiagnosisUI = {
    types: {
        SPD: {
            icon: '🔫',
            title: '人体描边大师',
            titleEn: 'Human Outline Artist',
            quote: '"敌人没死，但我键盘先死了。"',
            rare: '常见',
            rarePercent: '28%',
            rarityClass: 'rarity-common',
            roasts: [
                '你的准星在敌人周围画了一个完美的圆',
                '敌人以为你在故意放水，其实你在全力以赴',
                '建议转行做气象预报，反正都瞄不准'
            ]
        },
        SNP: {
            icon: '🎯',
            title: '锁头挂嫌疑人',
            titleEn: 'Aimbot Suspect',
            quote: '"我说我没开，你信吗？"',
            rare: '稀有',
            rarePercent: '5%',
            rarityClass: 'rarity-rare',
            roasts: [
                '你的鼠标dpi是不是调成了心灵感应模式',
                '敌人都怀疑你在服务器里有亲戚',
                '建议去打职业，反正也没朋友一起玩了'
            ]
        },
        SPR: {
            icon: '🏃',
            title: '无限换弹癌',
            titleEn: 'Reload Addict',
            quote: '"弹匣还有29发？不行，必须换。"',
            rare: '常见',
            rarePercent: '22%',
            rarityClass: 'rarity-common',
            roasts: [
                '你的枪里永远有子弹，但敌人永远在你换弹时出现',
                'R键是你磨损最严重的按键',
                '建议去玩近战游戏，放过那个R键吧'
            ]
        },
        PAN: {
            icon: '😱',
            title: 'Panic射击手',
            titleEn: 'Panic Shooter',
            quote: '"看到敌人→狂按鼠标→祈祷。"',
            rare: '常见',
            rarePercent: '35%',
            rarityClass: 'rarity-common',
            roasts: [
                '你的战术就是吓死对方',
                '弹药供应商应该给你颁个奖',
                '敌人不是被你打死的，是被你吵死的'
            ]
        }
    },
    
    show(stats) {
        const typeCode = ShooterArchetypeDetector.detect(stats);
        const type = this.types[typeCode];
        const roast = type.roasts[Math.floor(Math.random() * type.roasts.length)];
        
        // 创建诊断报告HTML
        const html = `
            <div id="diagnosisModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;justify-content:center;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"
                 onclick="if(event.target===this)ShooterDiagnosisUI.hide()">
                <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:20px;padding:30px;max-width:400px;width:90%;border:2px solid rgba(255,255,255,0.1);position:relative;"
                     onclick="event.stopPropagation()">
                    
                    <div style="position:absolute;top:20px;right:20px;width:60px;height:60px;border:3px solid #ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ef4444;font-weight:bold;font-size:14px;transform:rotate(-15deg);opacity:0.8;">确诊</div>
                    
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:60px;margin-bottom:10px;">${type.icon}</div>
                        <div style="background:rgba(255,255,255,0.1);padding:5px 15px;border-radius:20px;font-size:12px;color:#94a3b8;display:inline-block;margin-bottom:10px;">🎮 Emoji Shooter 诊断结果</div>
                        <h2 style="font-size:24px;font-weight:800;background:linear-gradient(90deg,#fbbf24,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:5px;">${type.title}</h2>
                        <div style="color:#64748b;font-size:14px;">${type.titleEn}</div>
                        <div style="display:inline-flex;align-items:center;gap:5px;margin-top:15px;padding:8px 20px;border-radius:25px;font-weight:700;font-size:13px;${this.getRarityStyle(type.rarityClass)}">
                            <span>🌟</span><span>${type.rare} · ${type.rarePercent}</span>
                        </div>
                    </div>
                    
                    <div style="background:rgba(99,102,241,0.1);border-left:4px solid #6366f1;padding:15px;margin:15px 0;border-radius:0 10px 10px 0;font-style:italic;color:#cbd5e1;font-size:14px;">
                        ${type.quote}
                    </div>
                    
                    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);padding:12px;border-radius:10px;margin:15px 0;">
                        <div style="color:#ef4444;font-size:12px;font-weight:600;margin-bottom:5px;">💬 专属吐槽</div>
                        <div style="color:#fca5a5;font-size:14px;">${roast}</div>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0;">
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;text-align:center;">
                            <div style="font-size:20px;font-weight:800;color:#ef4444;">${stats.shotsFired}</div>
                            <div style="font-size:12px;color:#94a3b8;">射击次数</div>
                            <div style="font-size:11px;color:#64748b;margin-top:3px;">键盘辛苦了</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;text-align:center;">
                            <div style="font-size:20px;font-weight:800;color:#22c55e;">${stats.shotsHit}</div>
                            <div style="font-size:12px;color:#94a3b8;">命中次数</div>
                            <div style="font-size:11px;color:#64748b;margin-top:3px;">命中率${stats.accuracy}%</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;text-align:center;">
                            <div style="font-size:20px;font-weight:800;color:#fbbf24;">${stats.enemiesKilled}</div>
                            <div style="font-size:12px;color:#94a3b8;">击杀数</div>
                            <div style="font-size:11px;color:#64748b;margin-top:3px;">第${stats.wave}波阵亡</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;text-align:center;">
                            <div style="font-size:20px;font-weight:800;color:#a855f7;">${stats.score}</div>
                            <div style="font-size:12px;color:#94a3b8;">最终得分</div>
                            <div style="font-size:11px;color:#64748b;margin-top:3px;">再接再厉</div>
                        </div>
                    </div>
                    
                    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;margin-top:20px;">
                        <div style="text-align:center;color:#94a3b8;font-size:12px;margin-bottom:12px;">分享你的"诊断报告"</div>
                        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                            <button onclick="ShooterDiagnosisUI.shareTwitter()" style="padding:10px 18px;border-radius:20px;border:none;background:#1da1f2;color:white;font-weight:600;cursor:pointer;font-size:13px;">🐦 Twitter</button>
                            <button onclick="ShooterDiagnosisUI.shareWeibo()" style="padding:10px 18px;border-radius:20px;border:none;background:#e6162d;color:white;font-weight:600;cursor:pointer;font-size:13px;">📱 微博</button>
                            <button onclick="ShooterDiagnosisUI.copyText()" style="padding:10px 18px;border-radius:20px;border:none;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);font-weight:600;cursor:pointer;font-size:13px;">📋 复制</button>
                            <button onclick="ShooterDiagnosisUI.hide()" style="padding:10px 18px;border-radius:20px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:600;cursor:pointer;font-size:13px;">🔄 再玩</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 移除已存在的模态框
        const existing = document.getElementById('diagnosisModal');
        if (existing) existing.remove();
        
        // 添加新模态框
        document.body.insertAdjacentHTML('beforeend', html);
        
        // 保存当前类型用于分享
        this.currentType = type;
        this.currentStats = stats;
    },
    
    hide() {
        const modal = document.getElementById('diagnosisModal');
        if (modal) modal.remove();
        // 重新开始游戏
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
        const text = encodeURIComponent(`🎮 刚被 Emoji Arcade 诊断为「${type.title}」\n${type.quote}\n\n测测你是什么玩家"病症" 👇`);
        const url = encodeURIComponent('https://emojiarcade.app');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    },
    
    shareWeibo() {
        const type = this.currentType;
        const text = encodeURIComponent(`【Emoji Arcade 诊断报告】\n我是「${type.title}」${type.icon}\n${type.quote}\n\n测测你是什么玩家类型 👉 emojiarcade.app`);
        const url = encodeURIComponent('https://emojiarcade.app');
        window.open(`https://service.weibo.com/share/share.php?title=${text}&url=${url}`, '_blank');
    },
    
    copyText() {
        const type = this.currentType;
        const text = `🎮 Emoji Arcade 诊断报告\n\n${type.icon} ${type.title} (${type.titleEn})\n${type.rare} · ${type.rarePercent}\n\n${type.quote}\n\n测测你是什么玩家"病症" 👉 emojiarcade.app`;
        navigator.clipboard.writeText(text).then(() => alert('已复制到剪贴板！'));
    }
};

// ==================== 修改原游戏代码 ====================
// 在 shoot() 函数中添加数据收集
const originalShoot = window.shoot;
window.shoot = function() {
    ShooterDataCollector.logShot(false); // 先记录射击，hit检测在碰撞逻辑里
    if (originalShoot) originalShoot();
};

// 修改 gameOver 函数
const originalGameOver = window.gameOver;
window.gameOver = function() {
    // 调用原函数
    if (originalGameOver) originalGameOver();
    
    // 显示诊断报告
    const stats = ShooterDataCollector.getStats();
    setTimeout(() => ShooterDiagnosisUI.show(stats), 500);
};

// 修改 startGame 函数，重置数据收集器
const originalStartGame = window.startGame;
window.startGame = function() {
    ShooterDataCollector.reset();
    if (originalStartGame) originalStartGame();
};

console.log('🎮 Emoji Shooter 诊断系统已加载');