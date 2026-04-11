
/**
 * Emoji Arcade - 社交分享诊断系统
 * 在现有游戏基础上增加病毒式传播元素
 */

// ==================== 玩家类型数据库 ====================
const PlayerArchetypes = {
  // 射击游戏类型
  shooter: {
    SPD: {
      icon: '🔫',
      title: '人体描边大师',
      titleEn: 'Human Outline Artist',
      quote: '"敌人没死，但我键盘先死了。"',
      rare: '常见',
      rarePercent: '28%',
      condition: '命中率<30%',
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
      condition: '命中率>85%',
      roasts: [
        '你的鼠标dpi是不是调成了心灵感应模式',
        '敌人举报键已经按烂了',
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
      condition: '换弹次数>射击次数',
      roasts: [
        '你的枪里永远有子弹，但敌人永远在你换弹时出现',
        'R键是你磨损最严重的按键',
        '建议去玩近战游戏，放过那个R键吧'
      ]
    },
    PAN: {
      icon: '😱',
      title: ' panic 射击手',
      titleEn: 'Panic Shooter',
      quote: '"看到敌人→狂按鼠标→祈祷。"',
      rare: '常见',
      rarePercent: '35%',
      condition: '射击频率极高但命中率低',
      roasts: [
        '你的战术就是吓死对方',
        '弹药供应商应该给你颁个奖',
        '敌人不是被你打死的，是被你吵死的'
      ]
    }
  },
  
  // 生存游戏类型
  survive: {
    CHL: {
      icon: '🧘',
      title: '佛系等死流',
      titleEn: 'Zen Death Awaiter',
      quote: '"反正都会死，我选个舒服的姿势。"',
      rare: '常见',
      rarePercent: '32%',
      condition: '存活时间<平均值的50%',
      roasts: [
        '你玩游戏的样子像在泡温泉',
        '敌人的子弹比你更有求生欲',
        '建议去玩放置类游戏，那个不用动'
      ]
    },
    DGE: {
      icon: '🕷️',
      title: '人形自走挂',
      titleEn: 'Dodge God',
      quote: '"打不到我，略略略~"',
      rare: '超稀有',
      rarePercent: '3%',
      condition: '被击中次数<3',
      roasts: [
        '你是装了子弹时间插件吗',
        '敌人都怀疑你在服务器里有亲戚',
        '建议去拍《黑客帝国》续集'
      ]
    },
    MAS: {
      icon: '🎲',
      title: '薛定谔的走位',
      titleEn: 'Schrödinger Dodger',
      quote: '"走位全靠运气，生死交给天意。"',
      rare: '常见',
      rarePercent: '25%',
      condition: '走位轨迹完全随机',
      roasts: [
        '你的走位让敌人也无法预测——包括你自己',
        '量子力学在你这儿得到完美验证',
        '建议买彩票，反正都靠运气'
      ]
    },
    ABS: {
      icon: '🧲',
      title: '吸铁石体质',
      titleEn: 'Bullet Magnet',
      quote: '"不是我接得好，是子弹长眼睛。"',
      rare: '常见',
      rarePercent: '18%',
      condition: '被击中率>80%',
      roasts: [
        '敌人都纳闷：这靶子怎么还会动',
        '你的身体对子弹有不可抗拒的吸引力',
        '建议去玩坦克，那个本来就是挨打的'
      ]
    }
  },
  
  // 匹配游戏类型
  match: {
    BRN: {
      icon: '🧠',
      title: '人脑计算机',
      titleEn: 'Human Computer',
      quote: '"三消？那是我的母语。"',
      rare: '稀有',
      rarePercent: '8%',
      condition: '连续combo>10',
      roasts: [
        '你的大脑是GPU做的吧',
        '建议去拉斯维加斯，但别说是我推荐的',
        '你玩三消的样子像在做高数题'
      ]
    },
    COL: {
      icon: '🦥',
      title: '树懒型选手',
      titleEn: 'Sloth Gamer',
      quote: '"我找到了！……刚才那个。"',
      rare: '常见',
      rarePercent: '38%',
      condition: '平均反应时间>2秒',
      roasts: [
        '你的反应速度让树懒都着急',
        '游戏都结束三秒了你才点',
        '建议玩回合制，给你一回合的时间思考'
      ]
    },
    OCD: {
      icon: '🔍',
      title: '强迫症患者',
      titleEn: 'Match OCD',
      quote: '"颜色不对，宁愿不消。"',
      rare: '常见',
      rarePercent: '24%',
      condition: '跳过可行匹配等待完美匹配',
      roasts: [
        '你的强迫症比分数还高',
        '游戏结束不是因为时间到了，是因为你太挑剔',
        '建议去整理衣柜，那个更适合你'
      ]
    },
    RNG: {
      icon: '🎰',
      title: '瞎点点大师',
      titleEn: 'Random Clicker',
      quote: '"只要点得够快，概率就追不上我。"',
      rare: '常见',
      rarePercent: '30%',
      condition: '点击次数>有效匹配数x5',
      roasts: [
        '你的手速和智商成反比',
        '鼠标：我承受了太多',
        '建议去玩刮刮乐，反正都靠蒙'
      ]
    }
  },
  
  // 通用类型（综合数据）
  general: {
    TRY: {
      icon: '💀',
      title: '又菜又爱玩',
      titleEn: 'Hardstuck Noob',
      quote: '"死了100次，笑了101次。"',
      rare: '史诗',
      rarePercent: '15%',
      condition: '死亡次数>尝试次数的50%',
      roasts: [
        '你的游戏体验：加载→死→加载→死',
        '敌人看到你的名字都笑了',
        '建议把游戏id改成"经验宝宝"'
      ]
    },
    TIL: {
      icon: '🔥',
      title: '红温破防者',
      titleEn: 'Tilt Lord',
      quote: '"鼠标先死的，我随后。"',
      rare: '常见',
      rarePercent: '26%',
      condition: '失败后立即重试且表现更差',
      roasts: [
        '你的桌子质量真好，居然还没坏',
        '邻居以为你在拆家',
        '建议买抗压药，按吨买'
      ]
    },
    QUT: {
      icon: '🏳️',
      title: '秒退艺术家',
      titleEn: 'Instant Quitter',
      quote: '"这游戏有问题，不是我。"',
      rare: '常见',
      rarePercent: '20%',
      condition: '失败一次后立即退出',
      roasts: [
        '你的退出速度比你的反应速度快多了',
        '游戏还没加载完你已经alt+f4了',
        '建议去看视频，那个不会输'
      ]
    },
    ADDI: {
      icon: '🎮',
      title: '电子yw患者',
      titleEn: 'Gaming Addict',
      quote: '"再玩一把就睡……天怎么亮了？"',
      rare: '史诗',
      rarePercent: '12%',
      condition: '连续游戏时间>2小时或重试次数>20',
      roasts: [
        '你的睡眠周期跟着游戏帧率走',
        '朋友以为你失踪了，其实你在"最后一把"',
        '建议设置家长控制，但估计你自己就是家长'
      ]
    }
  }
};

// ==================== 分享卡片生成器 ====================
class ShareCardGenerator {
  constructor(gameType, gameData) {
    this.gameType = gameType;
    this.data = gameData;
    this.archetype = this.calculateArchetype();
  }
  
  calculateArchetype() {
    // 根据游戏数据匹配最合适的类型
    const types = PlayerArchetypes[this.gameType] || PlayerArchetypes.general;
    
    // 简化的匹配逻辑（实际应根据详细数据计算）
    const keys = Object.keys(types);
    // 这里应该根据实际游戏数据选择，现在随机演示
    return types[keys[Math.floor(Math.random() * keys.length)]];
  }
  
  generateCard() {
    const type = this.archetype;
    const roast = type.roasts[Math.floor(Math.random() * type.roasts.length)];
    
    return {
      html: this.generateHTML(type, roast),
      text: this.generateText(type, roast),
      image: this.generateImageData(type, roast)
    };
  }
  
  generateHTML(type, roast) {
    return `
    <div class="share-card" style="
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 20px;
      padding: 30px;
      max-width: 400px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: white;
      border: 2px solid rgba(255,255,255,0.1);
      position: relative;
      overflow: hidden;
    ">
      <!-- 背景装饰 -->
      <div style="
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
        pointer-events: none;
      "></div>
      
      <!-- 头部 -->
      <div style="text-align: center; margin-bottom: 20px; position: relative; z-index: 1;">
        <div style="font-size: 4rem; margin-bottom: 10px;">${type.icon}</div>
        <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 5px;">🎮 Emoji Arcade 诊断报告</div>
        <div style="font-size: 1.5rem; font-weight: 800; background: linear-gradient(90deg, #fbbf24, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${type.title}</div>
        <div style="font-size: 0.9rem; color: #64748b;">${type.titleEn}</div>
      </div>
      
      <!-- 稀有度 -->
      <div style="text-align: center; margin: 15px 0;">
        <span style="
          background: ${this.getRarityColor(type.rare)};
          color: #000;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        ">${type.rare} · ${type.rarePercent}</span>
      </div>
      
      <!-- 经典台词 -->
      <div style="
        background: rgba(255,255,255,0.05);
        padding: 15px;
        border-radius: 10px;
        margin: 20px 0;
        text-align: center;
        font-style: italic;
        color: #cbd5e1;
        border-left: 3px solid #6366f1;
      ">
        ${type.quote}
      </div>
      
      <!-- 专属吐槽 -->
      <div style="
        background: rgba(239, 68, 68, 0.1);
        padding: 12px;
        border-radius: 10px;
        margin: 15px 0;
        font-size: 0.9rem;
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.3);
      ">
        💬 ${roast}
      </div>
      
      <!-- 数据总结 -->
      <div style="margin: 20px 0;">
        ${this.generateStatsHTML()}
      </div>
      
      <!-- 底部 -->
      <div style="
        text-align: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255,255,255,0.1);
      ">
        <div style="font-size: 0.8rem; color: #64748b;">测测你是什么玩家类型</div>
        <div style="font-size: 1rem; color: #6366f1; font-weight: 600;">emojiarcade.app</div>
      </div>
    </div>
    `;
  }
  
  generateStatsHTML() {
    const stats = this.getMockStats();
    return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      ${stats.map(stat => `
        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; text-align: center;">
          <div style="font-size: 1.2rem; font-weight: 700; color: ${stat.color};">${stat.value}</div>
          <div style="font-size: 0.75rem; color: #64748b;">${stat.label}</div>
        </div>
      `).join('')}
    </div>
    `;
  }
  
  getMockStats() {
    return [
      { label: '手速', value: Math.floor(Math.random() * 50 + 50) + 'APM', color: '#ef4444' },
      { label: '精准', value: Math.floor(Math.random() * 100) + '%', color: '#3b82f6' },
      { label: '心态', value: ['💀', '🔥', '🧘', '🎲'][Math.floor(Math.random() * 4)], color: '#fbbf24' },
      { label: '时长', value: Math.floor(Math.random() * 60 + 5) + 'min', color: '#22c55e' }
    ];
  }
  
  getRarityColor(rare) {
    const colors = {
      '常见': 'linear-gradient(135deg, #94a3b8, #64748b)',
      '稀有': 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      '超稀有': 'linear-gradient(135deg, #a855f7, #7c3aed)',
      '史诗': 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      '传说': 'linear-gradient(135deg, #ec4899, #db2777)'
    };
    return colors[rare] || colors['常见'];
  }
  
  generateText(type, roast) {
    return `🎮 Emoji Arcade 诊断报告

${type.icon} ${type.title} (${type.titleEn})
${type.rare} · ${type.rarePercent}

${type.quote}

💬 专属吐槽：${roast}

测测你是什么玩家类型 👉 emojiarcade.app`;
  }
  
  generateImageData(type, roast) {
    // 返回用于html2canvas或类似库的配置
    return {
      width: 400,
      height: 600,
      background: '#1a1a2e',
      elements: [
        { type: 'text', content: type.icon, style: { fontSize: 64, y: 50 } },
        { type: 'text', content: type.title, style: { fontSize: 28, fontWeight: 'bold', y: 130, color: '#fbbf24' } },
        { type: 'text', content: type.quote, style: { fontSize: 16, y: 200, italic: true } },
        { type: 'text', content: roast, style: { fontSize: 14, y: 280, color: '#fca5a5' } }
      ]
    };
  }
}

// ==================== 社交分享组件 ====================
class SocialShareComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.init();
  }
  
  init() {
    this.container.innerHTML = `
    <div class="social-share-modal" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(5px);
    ">
      <div class="share-content" style="
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
        position: relative;
      ">
        <button class="close-btn" style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.5rem;
          z-index: 10;
        ">×</button>
        <div id="shareCardContainer"></div>
        <div class="share-actions" style="
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
          flex-wrap: wrap;
        ">
          <button onclick="socialShare.shareTo('twitter')" style="
            background: #1da1f2;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
          ">🐦 Twitter</button>
          <button onclick="socialShare.shareTo('weibo')" style="
            background: #e6162d;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
          ">📱 微博</button>
          <button onclick="socialShare.copyToClipboard()" style="
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
          ">📋 复制</button>
          <button onclick="socialShare.retake()" style="
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
          ">🔄 再测一次</button>
        </div>
      </div>
    </div>
    `;
    
    this.container.querySelector('.close-btn').onclick = () => this.close();
    this.cardContainer = this.container.querySelector('#shareCardContainer');
  }
  
  show(gameType, gameData) {
    const generator = new ShareCardGenerator(gameType, gameData);
    const card = generator.generateCard();
    this.currentCard = card;
    this.cardContainer.innerHTML = card.html;
    this.container.style.display = 'flex';
  }
  
  close() {
    this.container.style.display = 'none';
  }
  
  shareTo(platform) {
    const text = encodeURIComponent(this.currentCard.text);
    const url = encodeURIComponent('https://emojiarcade.app');
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      weibo: `https://service.weibo.com/share/share.php?title=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  }
  
  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.currentCard.text);
      this.showToast('已复制到剪贴板！');
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = this.currentCard.text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast('已复制到剪贴板！');
    }
  }
  
  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 0.9rem;
      z-index: 10000;
      animation: fadeInUp 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
  
  retake() {
    this.close();
    // 触发游戏重新开始
    if (window.gameInstance) {
      window.gameInstance.restart();
    }
  }
}

// ==================== 游戏数据收集器 ====================
class GameDataCollector {
  constructor(gameType) {
    this.gameType = gameType;
    this.reset();
  }
  
  reset() {
    this.data = {
      startTime: Date.now(),
      endTime: null,
      actions: [],
      scores: {},
      mistakes: 0,
      retries: 0,
      // 游戏特定数据
      shotsFired: 0,
      shotsHit: 0,
      reloads: 0,
      deaths: 0,
      matches: 0,
      reactionTimes: [],
      // 情绪指标
      rageQuits: 0,
      pauseCount: 0
    };
  }
  
  logAction(action, timestamp = Date.now()) {
    this.data.actions.push({ action, timestamp });
  }
  
  logShot(hit) {
    this.data.shotsFired++;
    if (hit) this.data.shotsHit++;
  }
  
  logReload() {
    this.data.reloads++;
  }
  
  logDeath() {
    this.data.deaths++;
  }
  
  logMatch(reactionTime) {
    this.data.matches++;
    this.data.reactionTimes.push(reactionTime);
  }
  
  finish(finalScore) {
    this.data.endTime = Date.now();
    this.data.scores.final = finalScore;
    this.data.duration = (this.data.endTime - this.data.startTime) / 1000;
    
    // 计算派生指标
    this.data.accuracy = this.data.shotsFired > 0 
      ? (this.data.shotsHit / this.data.shotsFired * 100).toFixed(1)
      : 0;
    this.data.avgReactionTime = this.data.reactionTimes.length > 0
      ? (this.data.reactionTimes.reduce((a,b) => a+b, 0) / this.data.reactionTimes.length).toFixed(0)
      : 0;
    
    return this.data;
  }
}

// ==================== 集成示例 ====================
/*
// 1. 在游戏页面引入此脚本

// 2. 初始化社交分享组件
const socialShare = new SocialShareComponent('shareModalContainer');

// 3. 游戏开始时创建数据收集器
const collector = new GameDataCollector('shooter');

// 4. 游戏过程中记录数据
collector.logShot(true);  // 命中
collector.logShot(false); // 未命中
collector.logReload();    // 换弹
collector.logDeath();     // 死亡

// 5. 游戏结束时生成分享卡片
function onGameEnd(finalScore) {
  const gameData = collector.finish(finalScore);
  socialShare.show('shooter', gameData);
  
  // 重置收集器准备下一局
  collector.reset();
}

// 6. 也可以生成静态分享（用于测试）
function generateDemoCard() {
  const demoData = {
    shotsFired: 50,
    shotsHit: 12,
    reloads: 15,
    deaths: 8,
    duration: 120
  };
  socialShare.show('shooter', demoData);
}
*/

// ==================== 导出 ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlayerArchetypes, ShareCardGenerator, SocialShareComponent, GameDataCollector };
} else {
  window.PlayerArchetypes = PlayerArchetypes;
  window.ShareCardGenerator = ShareCardGenerator;
  window.SocialShareComponent = SocialShareComponent;
  window.GameDataCollector = GameDataCollector;
}
