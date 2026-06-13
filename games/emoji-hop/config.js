const GameConfig = {
  id: 'emoji-hop',
  emoji: '🐵',
  name: { zh: '猴子过河', en: 'Emoji Hop' },
  tagline: { zh: 'Frogger风格过河冒险', en: 'Frogger-style River Adventure' },
  instructions: {
    zh: '方向键或触摸控制猴子移动<br>穿越马路躲避车辆 🚗<br>跳上木头 🪵 过河，小心鳄鱼 🐊<br><b>鳄鱼会随机张嘴！</b> 张嘴时跳上去会被吃掉<br>填满 5 个荷叶目标 🪷 进入下一关<br>注意时间限制！',
    en: 'Use arrow keys or touch to move<br>Dodge cars on the road 🚗<br>Jump on logs 🪵 to cross river, beware of crocodiles 🐊<br><b>Crocodiles randomly open mouth!</b> Don\'t jump when biting<br>Fill all 5 lotus goals 🪷 to advance<br>Watch the time limit!'
  },
  bestScoreKey: 'emojiHopHighScore',

  diagnosis: {
    types: {
      RIVERKING: {
        icon: '🌊',
        title: { zh: '河流之王', en: 'River King' },
        quote: { zh: '"河流在你面前都要绕道。"', en: '"Rivers reroute to avoid you."' },
        rare: { zh: '传说', en: 'Legendary' },
        rarePercent: '0.9%',
        rarityClass: 'legendary',
        roasts: {
          zh: ['河流在你面前都要绕道', '你的跳跃让河神都臣服', '建议去统治亚马逊河'],
          en: ['Rivers reroute to avoid you', 'Your jumps make river gods bow', 'Consider ruling the Amazon']
        }
      },
      JUMPMASTER: {
        icon: '🏃',
        title: { zh: '跳跃大师', en: 'Jump Master' },
        quote: { zh: '"你的跳跃让牛顿都怀疑人生。"', en: '"Your jumps make Newton question physics."' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '6%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你的跳跃让牛顿都怀疑人生', '物理学家看了想改论文', '建议去申请跳跃专利'],
          en: ['Your jumps make Newton question physics', 'Physicists want to rewrite papers', 'Consider patenting your jumps']
        }
      },
      RIVERVETERAN: {
        icon: '🪵',
        title: { zh: '过河老手', en: 'River Veteran' },
        quote: { zh: '"木头是你最好的朋友。"', en: '"Logs are your best friends."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '15%',
        rarityClass: 'rare',
        roasts: {
          zh: ['木头是你最好的朋友', '你和木头的关系比情侣还亲密', '建议去当伐木工人'],
          en: ['Logs are your best friends', 'Your relationship with logs is closer than couples', 'Consider becoming a lumberjack']
        }
      },
      DROWNEDMONKEY: {
        icon: '🐒',
        title: { zh: '落水猴王', en: 'Drowned Monkey' },
        quote: { zh: '"你的特长是让自己变湿。"', en: '"Your specialty is getting yourself wet."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '38%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的特长是让自己变湿', '建议去当游泳教练', '猴子看了都摇头'],
          en: ['Your specialty is getting yourself wet', 'Consider becoming a swimming coach', 'Even monkeys shake their heads']
        }
      }
    },

    detectType(stats) {
      if (stats.score >= 5000) return 'RIVERKING';
      if (stats.score >= 2000) return 'JUMPMASTER';
      if (stats.score >= 1000) return 'RIVERVETERAN';
      return 'DROWNEDMONKEY';
    },

    statsLabels: {
      score: { zh: '得分', en: 'Score' },
      highScore: { zh: '最高', en: 'Best' },
      logsJumped: { zh: '木头踩踏', en: 'Logs Stepped' },
      hopCount: { zh: '跳跃次数', en: 'Jumps' }
    }
  }
};
