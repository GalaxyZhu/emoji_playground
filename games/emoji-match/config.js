const GameConfig = {
  id: 'emoji-match',
  emoji: '🧩',
  name: { zh: 'Emoji Match', en: 'Emoji Match' },
  tagline: { zh: '记忆翻牌', en: 'Memory Match' },
  instructions: {
    zh: '翻开卡片找到配对<br>双人轮流对战<br>匹配最多者获胜！',
    en: 'Flip cards to find pairs<br>Two players take turns<br>Most matches wins!'
  },
  bestScoreKey: 'emojiMatchBest',

  diagnosis: {
    types: {
      BRN: {
        icon: '🧠',
        title: { zh: '人脑计算机', en: 'Human Computer' },
        quote: { zh: '"三消？那是我的母语。"', en: '"Match-3? That is my native language."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '8%',
        rarityClass: 'rare',
        roasts: {
          zh: ['你的大脑是GPU做的吧', '建议去拉斯维加斯', '你玩匹配像在做高数题'],
          en: ['Is your brain made of GPUs?', 'Consider Vegas—seriously', 'You match like you are doing calculus']
        }
      },
      COL: {
        icon: '🦥',
        title: { zh: '树懒型选手', en: 'Sloth Gamer' },
        quote: { zh: '"我找到了！……刚才那个。"', en: '"I found it! ...the one from earlier."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '38%',
        rarityClass: 'common',
        roasts: {
          zh: ['反应速度让树懒都着急', '游戏结束三秒后才点', '建议玩回合制'],
          en: ['Your reaction time makes sloths impatient', 'You click 3 seconds after the game ends', 'Try turn-based games instead']
        }
      },
      OCD: {
        icon: '🔍',
        title: { zh: '强迫症患者', en: 'Match OCD' },
        quote: { zh: '"颜色不对，宁愿不消。"', en: '"Wrong color? I would rather not match."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '24%',
        rarityClass: 'common',
        roasts: {
          zh: ['强迫症比分数还高', '太挑剔导致时间到了', '建议去整理衣柜'],
          en: ['Your OCD is higher than your score', 'Too picky, time is up', 'Go organize your wardrobe']
        }
      },
      RNG: {
        icon: '🎰',
        title: { zh: '瞎点点大师', en: 'Random Clicker' },
        quote: { zh: '"只要点得够快，概率就追不上我。"', en: '"If I click fast enough, probability cannot catch me."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '30%',
        rarityClass: 'common',
        roasts: {
          zh: ['手速和智商成反比', '鼠标：我承受了太多', '建议去玩刮刮乐'],
          en: ['Hand speed is inversely proportional to IQ', 'Mouse: I have suffered enough', 'Try scratch-off lottery tickets']
        }
      }
    },

    detectType(stats) {
      if (stats.isDraw) return 'RNG';
      if (stats.score1 >= 8 || stats.score2 >= 8) return 'BRN';
      if (stats.score1 <= 2 && stats.score2 <= 2) return 'COL';
      return 'OCD';
    },

    statsLabels: {
      score1: { zh: '玩家1得分', en: 'Player 1 Score' },
      score2: { zh: '玩家2得分', en: 'Player 2 Score' },
      totalMatches: { zh: '总匹配数', en: 'Total Matches' }
    }
  }
};