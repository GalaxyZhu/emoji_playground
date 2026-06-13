const GameConfig = {
  id: 'emoji-evolve',
  emoji: '🧬',
  name: { zh: 'Emoji Evolution', en: 'Emoji Evolution' },
  tagline: { zh: '2048进化版', en: '2048 Evolution' },
  instructions: {
    zh: '滑动合并相同的emoji<br>从细胞进化到霸王龙<br>获得最高分！',
    en: 'Swipe to merge matching emojis<br>Evolve from cell to T-Rex<br>Get the highest score!'
  },
  bestScoreKey: 'emojiEvolveBest',

  diagnosis: {
    types: {
      GOD: {
        icon: '🧬',
        title: { zh: '进化之神', en: 'Evolution God' },
        quote: { zh: '"从细胞到霸王龙，我只用了几分钟。"', en: '"From cell to T-Rex king, just a few minutes."' },
        rare: { zh: '传说', en: 'Legendary' },
        rarePercent: '3%',
        rarityClass: 'legendary',
        roasts: {
          zh: ['你的进化速度让达尔文都想重写进化论', '建议去当生物课代表', '虫子看到你都想进化'],
          en: ['Your evolution speed makes Darwin want to rewrite the theory', 'Consider being a biology class rep', 'Bugs want to evolve when they see you']
        }
      },
      MAD: {
        icon: '🧪',
        title: { zh: '实验室疯子', en: 'Lab Maniac' },
        quote: { zh: '"合并！合并！全部给我合并！"', en: '"Merge! Merge! MERGE EVERYTHING!"' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '8%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你的手指是永动机吗？', '合并次数多到系统都震惊了', '建议申请吉尼斯合并纪录'],
          en: ['Are your fingers perpetual motion machines?', 'Merge count shocked the system', 'Apply for Guinness merge record']
        }
      },
      SLOW: {
        icon: '🐌',
        title: { zh: '慢热型进化者', en: 'Slow Evolutionist' },
        quote: { zh: '"慢工出细活，我的进化不急。"', en: '"Slow and steady wins the evolution."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '12%',
        rarityClass: 'rare',
        roasts: {
          zh: ['你玩出了养生局的感觉', 'emoji在你手下慢慢变老', '稳扎稳打，迟早进化成功'],
          en: ['You play like a wellness session', 'Emojis grow old under your hands', 'Slow and steady, evolution succeeds eventually']
        }
      },
      DEMOLITION: {
        icon: '💥',
        title: { zh: '拆迁队', en: 'Demolition Team' },
        quote: { zh: '"我不是在玩游戏，我是在拆网格。"', en: '"I\'m not playing, I\'m demolishing the grid."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '20%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的滑动方式叫"乱拳打死老师傅"', '还没看明白就结束了', '建议先读读游戏规则'],
          en: ['Your sliding style is "random punches kill the master"', 'Ended before understanding', 'Consider reading the rules first']
        }
      },
      ROOKIE: {
        icon: '🥚',
        title: { zh: '萌新观察员', en: 'Rookie Observer' },
        quote: { zh: '"第一次进化，请多指教。"', en: '"First evolution, please be kind."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '25%',
        rarityClass: 'common',
        roasts: {
          zh: ['万事开头难，下次会更好', '你的虫子还在学走路', '多练几局，进化指日可待'],
          en: ['Everything is hard at the start', 'Your bugs are still learning to walk', 'Practice more, evolution is coming']
        }
      },
      AVERAGE: {
        icon: '😐',
        title: { zh: '平平无奇进化者', en: 'Average Evolver' },
        quote: { zh: '"还行吧，没进化也没退化。"', en: '"Okay-ish, neither evolved nor devolved."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '32%',
        rarityClass: 'common',
        roasts: {
          zh: ['稳定发挥，毫无惊喜', '你的进化曲线是一条直线', '多喝热水，下次进化'],
          en: ['Consistent, zero surprises', 'Your evolution curve is a straight line', 'Drink more water, evolve next time']
        }
      }
    },

    detectType(stats) {
      if (stats.won && stats.score > 5000) return 'GOD';
      if (stats.merges > 100) return 'MAD';
      if (stats.moves > 200 && stats.score > 3000) return 'SLOW';
      if (stats.moves < 50 && !stats.won) return 'DEMOLITION';
      if (stats.score < 500 && stats.moves < 30) return 'ROOKIE';
      return 'AVERAGE';
    },

    statsLabels: {
      score: { zh: '得分', en: 'Score' },
      bestScore: { zh: '最高', en: 'Best' },
      moves: { zh: '步数', en: 'Moves' },
      merges: { zh: '合并', en: 'Merges' },
      maxLevel: { zh: '最高进化', en: 'Max Evolved' },
      stars: { zh: '获得 Stars', en: 'Stars Earned' }
    }
  }
};