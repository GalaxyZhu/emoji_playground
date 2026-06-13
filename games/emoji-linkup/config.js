const GameConfig = {
  id: 'emoji-linkup',
  emoji: '🔗',
  name: { zh: 'Emoji Link-Up', en: 'Emoji Link-Up' },
  tagline: { zh: 'V0.1', en: 'V0.1' },
  instructions: {
    zh: '连接相同的emoji来消除<br>在规定时间内消除所有配对<br>使用提示功能帮助寻找<br>获得连击加分！',
    en: 'Connect matching emojis to eliminate<br>Eliminate all pairs within time limit<br>Use hints to help find matches<br>Get combo bonuses!'
  },
  bestScoreKey: 'emojiLinkUpBest',

  diagnosis: {
    types: {
      CMB: {
        icon: '🔥',
        title: { zh: '连击狂魔', en: 'Combo Master' },
        quote: { zh: '"Combo×20？这才刚开始。"', en: '"Combo x20? Just getting started."' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '5%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你的手根本停不下来', 'Combo断了你比失恋还难受', '建议去打音游'],
          en: ['Your hands cannot stop', 'Combo break hurts more than breakup', 'Try rhythm games']
        }
      },
      BRN: {
        icon: '🧠',
        title: { zh: '人形计算机', en: 'Human Computer' },
        quote: { zh: '"大脑CPU占用率100%，但从不死机。"', en: '"Brain CPU at 100%, never crashes."' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '3%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你的大脑是M1芯片做的吧', '建议去破解密码', '这记忆力不去背圆周率可惜了'],
          en: ['Is your brain an M1 chip?', 'Consider password cracking', 'Waste not to memorize pi']
        }
      },
      ASS: {
        icon: '⏰',
        title: { zh: '时间刺客', en: 'Time Assassin' },
        quote: { zh: '"最后一秒通关，心跳比手速快。"', en: '"Last-second win, heartbeat faster than hands."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '12%',
        rarityClass: 'rare',
        roasts: {
          zh: ['你是故意拖到最后吓自己吗', '心脏不好的别这么玩', '建议去买彩票'],
          en: ['Did you deliberately drag to the end?', 'Not for the faint-hearted', 'Buy lottery tickets instead']
        }
      },
      SPD: {
        icon: '⚡',
        title: { zh: '闪电手', en: 'Lightning Hands' },
        quote: { zh: '"我的手速，肉眼根本跟不上。"', en: '"My hand speed defies human vision."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '8%',
        rarityClass: 'rare',
        roasts: {
          zh: ['你手机屏幕都被你戳出火星了', '旁边的人以为你在练钢琴', '这手速去打职业吧'],
          en: ['Your screen is smoking from tapping', 'People think you are playing piano', 'Go pro with that hand speed']
        }
      },
      SLW: {
        icon: '🐢',
        title: { zh: '树懒型选手', en: 'Sloth Gamer' },
        quote: { zh: '"不急，先让我观察一下... 十秒后再说。"', en: '"Let me observe first... maybe in ten seconds."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '32%',
        rarityClass: 'common',
        roasts: {
          zh: ['时间到了你还没找到第二对', '旁边的人以为你在冥想', '建议玩不需要时间的游戏'],
          en: ['Time is up before you find the second pair', 'People think you are meditating', 'Try games without time limits']
        }
      },
      RNG: {
        icon: '🎲',
        title: { zh: '瞎点点大师', en: 'Random Clicker' },
        quote: { zh: '"只要点得够快，概率就追不上我。"', en: '"Click fast enough, probability cannot catch me."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '28%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的准确率还不如抛硬币', '屏幕：我被乱点了一整场', '建议去玩刮刮乐'],
          en: ['Your accuracy is worse than a coin flip', 'Screen: I was clicked randomly all game', 'Try scratch-off lottery instead']
        }
      }
    },

    detectType(stats) {
      if (stats.maxCombo >= 10) return 'CMB';
      if (stats.won && stats.hintsUsed === 0) return 'BRN';
      if (stats.won && stats.remainingTime <= 10) return 'ASS';
      if (stats.avgTime < 1.5 && stats.successfulMoves >= 5) return 'SPD';
      if (stats.failedClicks > stats.successfulMoves && stats.successfulMoves > 0) return 'RNG';
      if (stats.avgTime > 5) return 'SLW';
      if (stats.avgTime < 1.5) return 'SPD';
      return 'RNG';
    },

    statsLabels: {
      score: { zh: '得分', en: 'Score' },
      successfulMoves: { zh: '成功匹配', en: 'Matches' },
      maxCombo: { zh: '最高连击', en: 'Max Combo' },
      duration: { zh: '耗时(秒)', en: 'Time(s)' },
      accuracy: { zh: '准确率', en: 'Accuracy' }
    }
  }
};