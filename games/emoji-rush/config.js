const GameConfig = {
  id: 'emoji-rush',
  emoji: '🏎️',
  name: { zh: '极速冲刺', en: 'Emoji Rush' },
  tagline: { zh: 'Free Online Racing Game with QTE Challenges', en: 'Free Online Racing Game with QTE Challenges' },
  instructions: {
    zh: '刹车坏了！🏎️💨<br>躲避障碍物<br>QTE紧急刹车 ⏱️<br>在速度 rush 中生存！',
    en: 'Brakes broken! 🏎️💨<br>Dodge obstacles<br>QTE emergency brake ⏱️<br>Survive the speed rush!'
  },
  bestScoreKey: 'emojiRushHighScore',

  diagnosis: {
    types: {
      SPEEDKING: {
        icon: '👑',
        title: { zh: '极速之王', en: 'Speed King' },
        quote: { zh: '"你的速度突破了物理极限。"', en: '"Your speed breaks the laws of physics."' },
        rare: { zh: '传说', en: 'Legendary' },
        rarePercent: '0.8%',
        rarityClass: 'legendary',
        roasts: {
          zh: ['你的速度突破了物理极限', '爱因斯坦看了想重写相对论', '建议去当火箭推进器'],
          en: ['Your speed breaks physics', 'Einstein wants to rewrite relativity', 'Consider becoming a rocket booster']
        }
      },
      TRACKVETERAN: {
        icon: '🎖️',
        title: { zh: '赛道老兵', en: 'Track Veteran' },
        quote: { zh: '"你的车技让其他车手望而却步。"', en: '"Your skills make other drivers hesitate."' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '5%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你的车技让其他车手望而却步', '保险公司看到你都想加保费', '建议去当赛车教练'],
          en: ['Your skills make other drivers hesitate', 'Insurance companies want to raise your premium', 'Consider becoming a racing instructor']
        }
      },
      SPEEDFREAK: {
        icon: '🏎️',
        title: { zh: '速度狂人', en: 'Speed Freak' },
        quote: { zh: '"你对速度的渴望超过了一切。"', en: '"Your need for speed beats everything."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '18%',
        rarityClass: 'rare',
        roasts: {
          zh: ['你对速度的渴望超过了一切', '油门焊死了对吧', '建议去开战斗机'],
          en: ['Your need for speed beats everything', 'The throttle is welded down, right?', 'Consider flying fighter jets']
        }
      },
      ROADKILLER: {
        icon: '💥',
        title: { zh: '马路杀手', en: 'Road Killer' },
        quote: { zh: '"你让保险公司都感到恐惧。"', en: '"You make insurance companies nervous."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '35%',
        rarityClass: 'common',
        roasts: {
          zh: ['你让保险公司都感到恐惧', '建议先考驾照', '路上的障碍物都是你的朋友'],
          en: ['You make insurance companies nervous', 'Consider getting a license first', 'Road obstacles are your friends']
        }
      }
    },

    detectType(stats) {
      if (stats.score >= 2000) return 'SPEEDKING';
      if (stats.score >= 1000) return 'TRACKVETERAN';
      if (stats.score >= 500) return 'SPEEDFREAK';
      return 'ROADKILLER';
    },

    statsLabels: {
      score: { zh: '得分', en: 'Score' },
      highScore: { zh: '最高', en: 'Best' },
      carsPassed: { zh: '超越车辆', en: 'Cars Passed' },
      nearMisses: { zh: '险险错过', en: 'Near Misses' }
    }
  }
};
