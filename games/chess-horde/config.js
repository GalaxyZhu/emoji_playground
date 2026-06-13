// 棋阵守卫战 — 游戏配置（统一框架版）
const GameConfig = {
  id: 'chess-horde',
  emoji: '♟️',
  name: { zh: '棋阵守卫战', en: 'Chess Horde' },
  tagline: { zh: '经典棋阵 vs 无尽尸潮', en: 'Classic Chess vs Endless Horde' },
  instructions: {
    zh: '点击己方棋子选择，再点击目标位置移动<br>吃敌人赚金币，整备期可买新兵<br>保王不死，撑过每一波！',
    en: 'Tap your piece to select, then tap destination to move<br>Capture enemies for gold, buy pieces in prep phase<br>Keep your king alive, survive each wave!'
  },
  bestScoreKey: 'chessHordeBest',

  diagnosis: {
    types: {
      GRANDMASTER: {
        icon: '♛',
        title: { zh: '棋圣降临', en: 'Grandmaster' },
        quote: { zh: '"我看到的不是棋盘，是敌人的终焉。"', en: '"I see not a board, but the enemy\'s end."' },
        rare: { zh: '传说', en: 'Legendary' },
        rarePercent: '1%',
        rarityClass: 'legendary',
        roasts: {
          zh: ['你就是国际象棋AI在逃本体', '建议去挑战Stockfish', '敌人看了想投子认输'],
          en: ['You are the Stockfish AI on the run', 'Consider challenging Stockfish', 'Enemies want to resign when they see you']
        }
      },
      TACTICIAN: {
        icon: '🧠',
        title: { zh: '战术大师', en: 'Master Tactician' },
        quote: { zh: '"每一步都是陷阱，每一吃都是算计。"', en: '"Every move is a trap, every capture is calculated."' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '5%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你的大脑是256核处理器', '敌人被你玩得团团转', '建议开个棋艺培训班'],
          en: ['Your brain is a 256-core processor', 'Enemies are spinning in circles', 'Consider opening a chess school']
        }
      },
      CONDUCTOR: {
        icon: '🎼',
        title: { zh: '指挥家', en: 'Orchestrator' },
        quote: { zh: '"我的棋子不是士兵，是乐章。"', en: '"My pieces are not soldiers, they are symphonies."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '10%',
        rarityClass: 'rare',
        roasts: {
          zh: ['后在你手里成了收割机', '你的阵型让敌人绝望', '兵都能被你玩出花'],
          en: ['Your queen is a harvester', 'Your formation makes enemies despair', 'Even pawns become art in your hands']
        }
      },
      MERCHANT: {
        icon: '💰',
        title: { zh: '奸商', en: 'Ruthless Merchant' },
        quote: { zh: '"每颗金币都是敌人的眼泪。"', en: '"Every coin is an enemy\'s tear."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '12%',
        rarityClass: 'rare',
        roasts: {
          zh: ['你的商店运营得比军队还好', '兵买得比吃的还多', '经济学博士学位请查收'],
          en: ['Your shop runs better than your army', 'You buy more than you kill', 'Economics PhD incoming']
        }
      },
      SCRAMBLER: {
        icon: '🐔',
        title: { zh: '鸡飞狗跳', en: 'Scrambler' },
        quote: { zh: '"别管战术了，点哪算哪！"', en: '"Forget tactics, click wherever!"' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '20%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的棋盘看起来像车祸现场', '兵比将先没了这是合理的吗', '建议开个随机数生成器当教练'],
          en: ['Your board looks like a crash site', 'Pawns gone before the king is reasonable?', 'Consider a RNG as your coach']
        }
      },
      SITTINGDUCK: {
        icon: '🦆',
        title: { zh: '坐以待毙', en: 'Sitting Duck' },
        quote: { zh: '"我在思考... 啊敌人已经到脸上了。"', en: '"I\'m thinking... oh they\'re already here."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '25%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的计时器比你还紧张', '敌人排队等你反应过来', '王：你倒是动一下啊'],
          en: ['Your timer is more nervous than you', 'Enemies are queuing for you to react', 'King: could you move please?']
        }
      },
      AVERAGE: {
        icon: '😐',
        title: { zh: '平平无奇棋手', en: 'Average Player' },
        quote: { zh: '"及格万岁，撑过这波就行。"', en: '"Passing is enough, survive this wave."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '27%',
        rarityClass: 'common',
        roasts: {
          zh: ['稳定发挥，毫无惊喜', '你就像棋盘上的背景格子', '多喝热水，下次加油'],
          en: ['Consistent, zero surprises', 'You are like a background square', 'Drink water, try harder next time']
        }
      }
    },

    detectType(stats) {
      if (stats.score >= 2000 && stats.wave >= 20) return 'GRANDMASTER';
      if (stats.score >= 1200 && stats.wave >= 15) return 'TACTICIAN';
      if (stats.score >= 800 && stats.wave >= 10) return 'CONDUCTOR';
      if (stats.score >= 500 && stats.wave >= 8 && stats.maxCombo >= 5) return 'MERCHANT';
      if (stats.wave >= 5 && stats.score < 200) return 'SCRAMBLER';
      if (stats.wave < 5 && stats.score < 100) return 'SITTINGDUCK';
      return 'AVERAGE';
    },

    statsLabels: {
      score: { zh: '得分', en: 'Score' },
      wave: { zh: '波次', en: 'Wave' },
      kills: { zh: '杀敌', en: 'Kills' },
      turns: { zh: '回合', en: 'Turns' },
      maxCombo: { zh: '最高连击', en: 'Max Combo' }
    }
  }
};
