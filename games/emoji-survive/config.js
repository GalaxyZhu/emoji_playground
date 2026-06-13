const GameConfig = {
  id: 'emoji-survive',
  emoji: '🛻',
  name: { zh: 'Emoji Survive', en: 'Emoji Survive' },
  tagline: { zh: '废土生存', en: 'Wasteland Survival' },
  instructions: {
    zh: '驾驶车辆穿越废土<br>击败僵尸大军<br>升级你的载具<br>生存20波！',
    en: 'Drive through wasteland<br>Defeat zombie hordes<br>Upgrade your vehicle<br>Survive 20 waves!'
  },
  bestScoreKey: 'emojiSurviveBest',

  diagnosis: {
    types: {
      HERO: {
        icon: '🛡️',
        title: { zh: '废土英雄', en: 'Wasteland Hero' },
        quote: { zh: '"20波？只是热身。"', en: '"20 waves? Just warming up."' },
        rare: { zh: '传说', en: 'Legendary' },
        rarePercent: '1%',
        rarityClass: 'legendary',
        roasts: {
          zh: ['僵尸看到你就想逃跑', '你的载具比坦克还硬', '废土因你而安全'],
          en: ['Zombies want to run when they see you', 'Your vehicle is tougher than a tank', 'The wasteland is safe because of you']
        }
      },
      VETERAN: {
        icon: '⚔️',
        title: { zh: '废土老兵', en: 'Wasteland Veteran' },
        quote: { zh: '"子弹打完了，我还有拳头。"', en: '"Out of bullets? I still have my fists."' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '5%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你的战斗经验值爆表', '载具坏了你都能扛着跑', '僵尸军团最怕你'],
          en: ['Your combat experience is off the charts', 'You can carry the vehicle if it breaks', 'Zombie hordes fear you most']
        }
      },
      SURVIVOR: {
        icon: '🏃',
        title: { zh: '求生专家', en: 'Survival Expert' },
        quote: { zh: '"跑得快也是一种生存技能。"', en: '"Running fast is a survival skill too."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '15%',
        rarityClass: 'rare',
        roasts: {
          zh: ['你的闪避技能点满了', '坑洞都追不上你', '建议去跑酷'],
          en: ['Your dodge skill is maxed out', 'Pits cannot catch you', 'Consider parkour']
        }
      },
      LUCKY: {
        icon: '🍀',
        title: { zh: '运气流选手', en: 'Lucky Player' },
        quote: { zh: '"我能活到现在全靠运气。"', en: '"I survived this far on luck alone."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '25%',
        rarityClass: 'common',
        roasts: {
          zh: ['建议去买彩票', '你的运气比技术好', '下次可能就没这么好运了'],
          en: ['Consider buying lottery tickets', 'Your luck is better than your skill', 'Next time might not be so lucky']
        }
      },
      ROOKIE: {
        icon: '🥺',
        title: { zh: '废土萌新', en: 'Wasteland Rookie' },
        quote: { zh: '"第一次来废土，请多关照。"', en: '"First time in the wasteland, be kind."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '30%',
        rarityClass: 'common',
        roasts: {
          zh: ['坑洞比僵尸更致命', '建议先看看路再踩油门', '废土不太适合你'],
          en: ['Pits are deadlier than zombies', 'Look at the road before hitting the gas', 'The wasteland is not for you']
        }
      },
      CARELESS: {
        icon: '😵',
        title: { zh: '粗心大意', en: 'Careless Driver' },
        quote: { zh: '"我没看到那个坑...真的。"', en: '"I didn\'t see that pit... really."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '24%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的眼睛是装饰品吗', '建议安装自动驾驶', '坑洞都在感谢你的贡献'],
          en: ['Are your eyes just for decoration?', 'Consider installing autopilot', 'Pits thank you for your contribution']
        }
      }
    },

    detectType(stats) {
      if (stats.wave >= 20) return 'HERO';
      if (stats.wave >= 15) return 'VETERAN';
      if (stats.wave >= 10) return 'SURVIVOR';
      if (stats.wave >= 5 && stats.reason === 'damage') return 'LUCKY';
      if (stats.reason === 'fall') return 'CARELESS';
      return 'ROOKIE';
    },

    statsLabels: {
      wave: { zh: '存活波次', en: 'Waves Survived' },
      gold: { zh: '获得金币', en: 'Gold Earned' },
      reason: { zh: '失败原因', en: 'Fail Reason' }
    }
  }
};