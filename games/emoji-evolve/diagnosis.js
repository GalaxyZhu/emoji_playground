// diagnosis.js - Emoji Evolution 2048 诊断系统

const EvolveDiagnosis = {
  types: {
    GOD: {
      icon: '🧬', title: '进化之神', titleEn: 'Evolution God',
      quote: '"从细胞到霸王龙，我只用了几分钟。"',
      quoteEn: '"From cell to T-Rex king, just a few minutes."',
      rare: '传说', rareEn: 'Legendary', rarePercent: '3%', rarityClass: 'legendary',
      roasts: ['你的进化速度让达尔文都想重写进化论', '建议去当生物课代表', '虫子看到你都想进化'],
      roastsEn: ['Your evolution speed makes Darwin want to rewrite the theory', 'Consider being a biology class rep', 'Bugs want to evolve when they see you']
    },
    MAD: {
      icon: '🧪', title: '实验室疯子', titleEn: 'Lab Maniac',
      quote: '"合并！合并！全部给我合并！"',
      quoteEn: '"Merge! Merge! MERGE EVERYTHING!"',
      rare: '史诗', rareEn: 'Epic', rarePercent: '8%', rarityClass: 'epic',
      roasts: ['你的手指是永动机吗？', '合并次数多到系统都震惊了', '建议申请吉尼斯合并纪录'],
      roastsEn: ['Are your fingers perpetual motion machines?', 'Merge count shocked the system', 'Apply for Guinness merge record']
    },
    SLOW: {
      icon: '🐌', title: '慢热型进化者', titleEn: 'Slow Evolutionist',
      quote: '"慢工出细活，我的进化不急。"',
      quoteEn: '"Slow and steady wins the evolution."',
      rare: '稀有', rareEn: 'Rare', rarePercent: '12%', rarityClass: 'rare',
      roasts: ['你玩出了养生局的感觉', 'emoji在你手下慢慢变老', '稳扎稳打，迟早进化成功'],
      roastsEn: ['You play like a wellness session', 'Emojis grow old under your hands', 'Slow and steady, evolution succeeds eventually']
    },
    DEMOLITION: {
      icon: '💥', title: '拆迁队', titleEn: 'Demolition Team',
      quote: '"我不是在玩游戏，我是在拆网格。"',
      quoteEn: '"I\'m not playing, I\'m demolishing the grid."',
      rare: '常见', rareEn: 'Common', rarePercent: '20%', rarityClass: 'common',
      roasts: ['你的滑动方式叫"乱拳打死老师傅"', '还没看明白就结束了', '建议先读读游戏规则'],
      roastsEn: ['Your sliding style is "random punches kill the master"', 'Ended before understanding', 'Consider reading the rules first']
    },
    ROOKIE: {
      icon: '🥚', title: '萌新观察员', titleEn: 'Rookie Observer',
      quote: '"第一次进化，请多指教。"',
      quoteEn: '"First evolution, please be kind."',
      rare: '常见', rareEn: 'Common', rarePercent: '25%', rarityClass: 'common',
      roasts: ['万事开头难，下次会更好', '你的虫子还在学走路', '多练几局，进化指日可待'],
      roastsEn: ['Everything is hard at the start', 'Your bugs are still learning to walk', 'Practice more, evolution is coming']
    },
    AVERAGE: {
      icon: '😐', title: '平平无奇进化者', titleEn: 'Average Evolver',
      quote: '"还行吧，没进化也没退化。"',
      quoteEn: '"Okay-ish, neither evolved nor devolved."',
      rare: '常见', rareEn: 'Common', rarePercent: '32%', rarityClass: 'common',
      roasts: ['稳定发挥，毫无惊喜', '你的进化曲线是一条直线', '多喝热水，下次进化'],
      roastsEn: ['Consistent, zero surprises', 'Your evolution curve is a straight line', 'Drink more water, evolve next time']
    }
  },

  // 根据游戏数据判断类型
  analyze(data) {
    const { score, moves, merges, maxLevel, won } = data;

    if (won && score > 5000) return this.types.GOD;
    if (merges > 100) return this.types.MAD;
    if (moves > 200 && score > 3000) return this.types.SLOW;
    if (moves < 50 && !won) return this.types.DEMOLITION;
    if (score < 500 && moves < 30) return this.types.ROOKIE;
    return this.types.AVERAGE;
  },

  // 生成诊断报告
  generate(data) {
    const type = this.analyze(data);
    const roast = type.roasts[Math.floor(Math.random() * type.roasts.length)];
    const theme = data.theme;
    const bestItem = theme.chain[Math.min(data.maxLevel - 1, theme.chain.length - 1)];

    return {
      type,
      roast,
      data: {
        score: data.score,
        bestScore: data.bestScore,
        moves: data.moves,
        merges: data.merges,
        maxLevel: data.maxLevel,
        maxLevelName: bestItem.name,
        maxLevelNameEn: bestItem.nameEn || bestItem.name,
        maxLevelEmoji: bestItem.emoji,
        won: data.won,
        stars: data.stars,
        theme: theme.name,
        themeEn: theme.nameEn || theme.name
      }
    };
  },

  // 渲染诊断报告 HTML
  render(result, lang) {
    const { type, roast, data } = result;
    const isWin = data.won;
    const isEn = lang === 'en';
    
    const title = isEn ? type.titleEn : type.title;
    const quote = isEn ? type.quoteEn : type.quote;
    const rareLabel = isEn ? type.rareEn : type.rare;
    const roastText = isEn 
      ? type.roastsEn[type.roasts.indexOf(roast)] || roast 
      : roast;
    
    const labels = isEn ? {
      score: 'Final Score',
      best: 'Best',
      moves: 'Moves',
      merges: 'Merges',
      maxLevel: 'Max Evolved',
      stars: 'Stars Earned',
      win: '🎉 Cleared! Evolution complete!',
      lose: '😢 Evolution interrupted. Try again!'
    } : {
      score: '最终得分',
      best: '最高分',
      moves: '总步数',
      merges: '合并次数',
      maxLevel: '最高进化',
      stars: '获得 Stars',
      win: '🎉 通关！进化完成！',
      lose: '😢 进化中断，下次继续！'
    };

    const maxLevelName = isEn && data.maxLevelNameEn ? data.maxLevelNameEn : data.maxLevelName;

    return `
      <div class="diagnosis-card">
        <div class="diagnosis-header">
          <div class="diagnosis-icon">${type.icon}</div>
          <div class="diagnosis-title">
            <div class="diagnosis-name">${title}</div>
            <div class="diagnosis-rare ${type.rarityClass}">${rareLabel} · ${type.rarePercent}</div>
          </div>
        </div>
        <div class="diagnosis-quote">${quote}</div>
        <div class="diagnosis-roast">💬 ${roastText}</div>
        <div class="diagnosis-stats">
          <div class="stat-item">
            <div class="stat-label">${labels.score}</div>
            <div class="stat-value">${data.score}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">${labels.best}</div>
            <div class="stat-value">${data.bestScore}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">${labels.moves}</div>
            <div class="stat-value">${data.moves}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">${labels.merges}</div>
            <div class="stat-value">${data.merges}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">${labels.maxLevel}</div>
            <div class="stat-value">${data.maxLevelEmoji} ${maxLevelName}</div>
          </div>
          <div class="stat-item stars">
            <div class="stat-label">${labels.stars}</div>
            <div class="stat-value">⭐ ${data.stars}</div>
          </div>
        </div>
        <div class="diagnosis-result ${isWin ? 'win' : 'lose'}">
          ${isWin ? labels.win : labels.lose}
        </div>
      </div>
    `;
  }
};

// 导出
if (typeof window !== 'undefined') {
  window.EvolveDiagnosis = EvolveDiagnosis;
}
