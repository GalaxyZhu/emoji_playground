/**
 * Emoji Arcade i18n 国际化模块
 * 自动检测浏览器语言，支持中英双语
 */

const i18n = {
    // 当前语言
    lang: 'zh',
    
    // 翻译字典
    dict: {
        zh: {
            // 通用
            'diagnosis.title': '🎮 诊断结果',
            'diagnosis.result': '诊断结果',
            'diagnosis.confirmed': '确诊',
            'diagnosis.share.title': '分享你的"诊断报告"',
            'diagnosis.roast.title': '💬 网友吐槽',
            
            // 按钮
            'btn.twitter': '🐦 Twitter',
            'btn.weibo': '📱 微博',
            'btn.copy': '📋 复制',
            'btn.replay': '🔄 再来一局',
            
            // 统计数据标签
            'stat.score': '最终得分',
            'stat.highscore': '最高分',
            'stat.accuracy': '命中率',
            'stat.keep_trying': '再接再厉',
            'stat.wave': '波次',
            'stat.died_at_wave': '阵亡于第{wave}波',
            'stat.new_record': '新纪录!',
            
            // 稀有度
            'rarity.common': '常见',
            'rarity.rare': '稀有',
            'rarity.epic': '史诗',
            'rarity.legendary': '传说',
            
            // 游戏类型标签
            'game.tag': '🎮 Emoji Shooter 诊断结果',
            
            // 游戏HUD
            'activePowerups': '当前加成',
            'health': '生命值',
            'score': '得分',
            'wave': '波次',
            'highScore': '最高分',
            
            // 游戏开始界面
            'startGame': '开始游戏',
            'backToArcade': '回到街机厅',
            'instructions': '移动鼠标控制🗿，自动射击消灭敌人<br>到<b>左边奖励区</b>击破奖励包获取强力加成<br>⚡极速 💪强力 🛡️护盾<br><b>每5关有BOSS战！</b>躲避BOSS攻击并反击！',
            'highScoreLabel': '最高分',
            'gameOver': '游戏结束',
            'scoreLabel': '得分',
            'playAgain': '再来一局',
            'gamePaused': '⏸️ 游戏暂停',
            'resume': '▶️ 继续游戏',
            'restart': '🔄 重新开始',
            'pauseHint': '按 ESC 键也可以继续游戏',
            
            // 分享文案
            'share.text': '🎮 刚被 Emoji Arcade 诊断为「{title}」\n{quote}\n\n测测你是什么玩家"病症" 👇',
            'share.weibo': '【Emoji Arcade 诊断报告】\n我是「{title}」{icon}\n{quote}\n\n测测你是什么玩家类型 👉 emojiarcade.app',
            'share.copy': '🎮 Emoji Arcade 诊断报告\n\n{icon} {title} ({titleEn})\n{rare} · {rarePercent}\n\n{quote}\n\n测测你是什么玩家"病症" 👉 emojiarcade.app',
            
            // Shooter 特定
            'shooter.shots_fired': '射击次数',
            'shooter.shots_hit': '命中次数',
            'shooter.kills': '击杀数',
            'shooter.keyboard_tired': '键盘辛苦了',
            'shooter.accuracy_label': '命中率',
            'shooter.wave': '波次',
            
            // Hop 特定
            'hop.jumps': '跳跃次数',
            'hop.platforms': '成功平台数',
            'hop.max_combo': '最高连击',
            'hop.jumps_label': '跳跃',
            'hop.platforms_label': '平台',
            'hop.combo_label': '连击',
            
            // Kart 特定
            'kart.distance': '行驶距离',
            'kart.coins': '收集金币',
            'kart.crashes': '撞墙次数',
            'kart.distance_label': '米',
            'kart.coins_label': '金币',
            'kart.crashes_label': '撞墙',
            
            // Match 特定
            'match.moves': '步数',
            'match.matches': '消除数',
            'match.max_combo': '最高连击',
            'match.moves_label': '步数',
            'match.matches_label': '消除',
            'match.combo_label': '连击',
            
            // Survive 特定
            'survive.time': '生存时间',
            'survive.dodged': '躲避子弹',
            'survive.time_label': '秒',
            'survive.dodged_label': '躲避',
            
            // 玩家类型 (Shooter)
            'type.shooter.SPD.title': '人体描边大师',
            'type.shooter.SPD.titleEn': 'Human Outline Artist',
            'type.shooter.SPD.quote': '"敌人没死，但我键盘先死了。"',
            'type.shooter.SPD.roasts': [
                '你的准星在敌人周围画了一个完美的圆',
                '敌人以为你在故意放水，其实你在全力以赴',
                '建议转行做气象预报，反正都瞄不准'
            ],
            
            'type.shooter.SNP.title': '锁头挂嫌疑人',
            'type.shooter.SNP.titleEn': 'Aimbot Suspect',
            'type.shooter.SNP.quote': '"我说我没开，你信吗？"',
            'type.shooter.SNP.roasts': [
                '你的鼠标dpi是不是调成了心灵感应模式',
                '敌人都怀疑你在服务器里有亲戚',
                '建议去打职业，反正也没朋友一起玩了'
            ],
            
            'type.shooter.SPR.title': '无限换弹癌',
            'type.shooter.SPR.titleEn': 'Reload Addict',
            'type.shooter.SPR.quote': '"弹匣还有29发？不行，必须换。"',
            'type.shooter.SPR.roasts': [
                '你的枪里永远有子弹，但敌人永远在你换弹时出现',
                'R键是你磨损最严重的按键',
                '建议去玩近战游戏，放过那个R键吧'
            ],
            
            'type.shooter.PAN.title': 'Panic射击手',
            'type.shooter.PAN.titleEn': 'Panic Shooter',
            'type.shooter.PAN.quote': '"看到敌人→狂按鼠标→祈祷。"',
            'type.shooter.PAN.roasts': [
                '你的战术就是吓死对方',
                '弹药供应商应该给你颁个奖',
                '敌人不是被你打死的，是被你吵死的'
            ],
        },
        
        en: {
            // Common
            'diagnosis.title': '🎮 Diagnosis Result',
            'diagnosis.result': 'Diagnosis Result',
            'diagnosis.confirmed': 'CONFIRMED',
            'diagnosis.share.title': 'Share Your "Diagnosis Report"',
            'diagnosis.roast.title': '💬 Community Roast',
            
            // Buttons
            'btn.twitter': '🐦 Twitter',
            'btn.weibo': '📱 Weibo',
            'btn.copy': '📋 Copy',
            'btn.replay': '🔄 Replay',
            
            // Stats labels
            'stat.score': 'Final Score',
            'stat.highscore': 'High Score',
            'stat.accuracy': 'Accuracy',
            'stat.keep_trying': 'Keep Trying',
            'stat.wave': 'Wave',
            'stat.died_at_wave': 'Died at Wave {wave}',
            'stat.new_record': 'NEW RECORD!',
            
            // Rarity
            'rarity.common': 'Common',
            'rarity.rare': 'Rare',
            'rarity.epic': 'Epic',
            'rarity.legendary': 'Legendary',
            
            // Game tag
            'game.tag': '🎮 Emoji Shooter Diagnosis',
            
            // Toast
            'toast.copied': 'Copied to clipboard!',
            
            // Game HUD
            'activePowerups': 'Power-ups',
            'health': 'Health',
            'score': 'Score',
            'wave': 'Wave',
            'highScore': 'High Score',
            
            // Game menu
            'startGame': 'Start Game',
            'backToArcade': 'Back to Arcade',
            'instructions': 'Move mouse to control 🗿, auto-fire to eliminate enemies<br>Go to <b>Left Power-up Zone</b> to break reward packs<br>⚡Speed 💪Power 🛡️Shield<br><b>BOSS every 5 waves!</b> Dodge and counter!',
            'highScoreLabel': 'High Score',
            'gameOver': 'Game Over',
            'scoreLabel': 'Score',
            'playAgain': 'Play Again',
            'gamePaused': '⏸️ Game Paused',
            'resume': '▶️ Resume',
            'restart': '🔄 Restart',
            'pauseHint': 'Press ESC to resume',
            
            // Share text
            'share.text': '🎮 Just got diagnosed as "{title}" on Emoji Arcade\n{quote}\n\nWhat\'s your gaming "condition"? 👇',
            'share.weibo': '【Emoji Arcade Diagnosis】\nI am "{title}" {icon}\n{quote}\n\nDiscover your player type 👉 emojiarcade.app',
            'share.copy': '🎮 Emoji Arcade Diagnosis\n\n{icon} {title}\n{rare} · {rarePercent}\n\n{quote}\n\nWhat\'s your gaming "condition"? 👉 emojiarcade.app',
            
            // Shooter specific
            'shooter.shots_fired': 'Shots Fired',
            'shooter.shots_hit': 'Shots Hit',
            'shooter.kills': 'Enemies Killed',
            'shooter.keyboard_tired': 'RIP Keyboard',
            'shooter.accuracy_label': 'Accuracy',
            'shooter.wave': 'Wave',
            
            // Hop specific
            'hop.jumps': 'Jumps',
            'hop.platforms': 'Platforms',
            'hop.max_combo': 'Max Combo',
            'hop.jumps_label': 'jumps',
            'hop.platforms_label': 'platforms',
            'hop.combo_label': 'combo',
            
            // Kart specific
            'kart.distance': 'Distance',
            'kart.coins': 'Coins',
            'kart.crashes': 'Crashes',
            'kart.distance_label': 'm',
            'kart.coins_label': 'coins',
            'kart.crashes_label': 'crashes',
            
            // Match specific
            'match.moves': 'Moves',
            'match.matches': 'Matches',
            'match.max_combo': 'Max Combo',
            'match.moves_label': 'moves',
            'match.matches_label': 'matches',
            'match.combo_label': 'combo',
            
            // Survive specific
            'survive.time': 'Survival Time',
            'survive.dodged': 'Bullets Dodged',
            'survive.time_label': 'sec',
            'survive.dodged_label': 'dodged',
            
            // Player types (Shooter)
            'type.shooter.SPD.title': 'Human Outline Artist',
            'type.shooter.SPD.titleEn': '人体描边大师',
            'type.shooter.SPD.quote': '"The enemy didn\'t die, but my keyboard did."',
            'type.shooter.SPD.roasts': [
                'Your crosshair draws a perfect circle around enemies',
                'Enemies think you\'re going easy on them, but you\'re trying your best',
                'Consider a career in weather forecasting, you never hit anything anyway'
            ],
            
            'type.shooter.SNP.title': 'Aimbot Suspect',
            'type.shooter.SNP.titleEn': '锁头挂嫌疑人',
            'type.shooter.SNP.quote': '"I swear I\'m not cheating... do you believe me?"',
            'type.shooter.SNP.roasts': [
                'Is your mouse DPI set to telepathy mode?',
                'Enemies suspect you have relatives in the server',
                'Consider going pro, you don\'t have friends to play with anyway'
            ],
            
            'type.shooter.SPR.title': 'Reload Addict',
            'type.shooter.SPR.titleEn': '无限换弹癌',
            'type.shooter.SPR.quote': '"29 bullets left? No, must reload."',
            'type.shooter.SPR.roasts': [
                'Your gun always has bullets, but enemies always appear when you reload',
                'The R key is your most worn-out button',
                'Consider playing melee games, give that R key a break'
            ],
            
            'type.shooter.PAN.title': 'Panic Shooter',
            'type.shooter.PAN.titleEn': 'Panic射击手',
            'type.shooter.PAN.quote': '"See enemy → spam mouse → pray."',
            'type.shooter.PAN.roasts': [
                'Your strategy is to scare enemies to death',
                'Ammunition suppliers should give you an award',
                'Enemies aren\'t killed by you, they\'re killed by the noise'
            ],
        }
    },
    
    // 初始化语言
    init() {
        const browserLang = navigator.language || navigator.userLanguage;
        this.lang = browserLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
        console.log(`🌐 i18n initialized: ${this.lang}`);
    },
    
    // 获取翻译
    t(key, params = {}) {
        const text = this.dict[this.lang][key] || this.dict['en'][key] || key;
        
        // 处理参数替换 {param}
        return text.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    },
    
    // 获取数组翻译（如吐槽列表）
    tArray(key) {
        const arr = this.dict[this.lang][key] || this.dict['en'][key] || [];
        return arr;
    },
    
    // 切换语言（调试用）
    setLang(lang) {
        this.lang = lang === 'zh' ? 'zh' : 'en';
        this.updatePage();
    },
    
    // 更新页面所有 data-i18n 元素
    updatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.t(key);
            // 保留子元素，只替换文本节点
            if (el.children.length === 0) {
                el.textContent = text;
            } else {
                // 如果元素有子元素，替换 HTML
                el.innerHTML = text;
            }
        });
    }
};

// 自动初始化
i18n.init();

// 页面加载完成后更新文本和lang属性
function applyI18n() {
    i18n.updatePage();
    document.documentElement.lang = i18n.lang === 'zh' ? 'zh-CN' : 'en';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyI18n);
} else {
    applyI18n();
}

// 全局暴露
window.i18n = i18n;
