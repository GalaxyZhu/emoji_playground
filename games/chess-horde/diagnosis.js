// ♟ Chess Horde — 诊断系统

const HordeDiagnosis = {
  types: {
    GRANDMASTER: {
      icon: '♛', title: '棋圣降临', titleEn: 'Grandmaster',
      quote: '"我看到的不是棋盘，是敌人的终焉。"',
      quoteEn: '"I see not a board, but the enemy\'s end."',
      rare: '传说', rareEn: 'Legendary', rarePercent: '1%', rarityClass: 'legendary',
      roasts: ['你就是国际象棋AI在逃本体', '建议去挑战Stockfish', '敌人看了想投子认输'],
      roastsEn: ['You are the Stockfish AI on the run', 'Consider challenging Stockfish', 'Enemies want to resign when they see you']
    },
    TACTICIAN: {
      icon: '🧠', title: '战术大师', titleEn: 'Master Tactician',
      quote: '"每一步都是陷阱，每一吃都是算计。"',
      quoteEn: '"Every move is a trap, every capture is calculated."',
      rare: '史诗', rareEn: 'Epic', rarePercent: '5%', rarityClass: 'epic',
      roasts: ['你的大脑是256核处理器', '敌人被你玩得团团转', '建议开个棋艺培训班'],
      roastsEn: ['Your brain is a 256-core processor', 'Enemies are spinning in circles', 'Consider opening a chess school']
    },
    CONDUCTOR: {
      icon: '🎼', title: '指挥家', titleEn: 'Orchestrator',
      quote: '"我的棋子不是士兵，是乐章。"',
      quoteEn: '"My pieces are not soldiers, they are symphonies."',
      rare: '稀有', rareEn: 'Rare', rarePercent: '10%', rarityClass: 'rare',
      roasts: ['后在你手里成了收割机', '你的阵型让敌人绝望', '兵都能被你玩出花'],
      roastsEn: ['Your queen is a harvester', 'Your formation makes enemies despair', 'Even pawns become art in your hands']
    },
    MERCHANT: {
      icon: '💰', title: '奸商', titleEn: 'Ruthless Merchant',
      quote: '"每颗金币都是敌人的眼泪。"',
      quoteEn: '"Every coin is an enemy\'s tear."',
      rare: '稀有', rareEn: 'Rare', rarePercent: '12%', rarityClass: 'rare',
      roasts: ['你的商店运营得比军队还好', '兵买得比吃的还多', '经济学博士学位请查收'],
      roastsEn: ['Your shop runs better than your army', 'You buy more than you kill', 'Economics PhD incoming']
    },
    SCRAMBLER: {
      icon: '🐔', title: '鸡飞狗跳', titleEn: 'Scrambler',
      quote: '"别管战术了，点哪算哪！"',
      quoteEn: '"Forget tactics, click wherever!"',
      rare: '常见', rareEn: 'Common', rarePercent: '20%', rarityClass: 'common',
      roasts: ['你的棋盘看起来像车祸现场', '兵比将先没了这是合理的吗', '建议开个随机数生成器当教练'],
      roastsEn: ['Your board looks like a crash site', 'Pawns gone before the king is reasonable?', 'Consider a RNG as your coach']
    },
    SITTINGDUCK: {
      icon: '🦆', title: '坐以待毙', titleEn: 'Sitting Duck',
      quote: '"我在思考... 啊敌人已经到脸上了。"',
      quoteEn: '"I\'m thinking... oh they\'re already here."',
      rare: '常见', rareEn: 'Common', rarePercent: '25%', rarityClass: 'common',
      roasts: ['你的计时器比你还紧张', '敌人排队等你反应过来', '王：你倒是动一下啊'],      
      roastsEn: ['Your timer is more nervous than you', 'Enemies are queuing for you to react', 'King: could you move please?']
    },
    AVERAGE: {
      icon: '😐', title: '平平无奇棋手', titleEn: 'Average Player',
      quote: '"及格万岁，撑过这波就行。"',
      quoteEn: '"Passing is enough, survive this wave."',
      rare: '常见', rareEn: 'Common', rarePercent: '27%', rarityClass: 'common',
      roasts: ['稳定发挥，毫无惊喜', '你就像棋盘上的背景格子', '多喝热水，下次加油'],
      roastsEn: ['Consistent, zero surprises', 'You are like a background square', 'Drink water, try harder next time']
    }
  },

  getDiagnosis(score, wave, turns, maxCombo, kills) {
    if (score >= 2000 && wave >= 20) return this.types.GRANDMASTER;
    if (score >= 1200 && wave >= 15) return this.types.TACTICIAN;
    if (score >= 800 && wave >= 10) return this.types.CONDUCTOR;
    if (score >= 500 && wave >= 8 && maxCombo >= 5) return this.types.MERCHANT;
    if (wave >= 5 && score < 200) return this.types.SCRAMBLER;
    if (wave < 5 && score < 100) return this.types.SITTINGDUCK;
    return this.types.AVERAGE;
  }
};