const GameConfig = {
  id: 'emoji-frog',
  emoji: '🐸',
  name: { zh: '跳跳蛙', en: 'Emoji Frog' },
  tagline: { zh: 'V0.1', en: 'V0.1' },
  instructions: {
    zh: '点击屏幕跳跃<br>落在睡莲上弹跳更高<br>吃火箭加速<br>小心别掉下去！',
    en: 'Tap screen to jump<br>Land on lily pads to bounce higher<br>Eat rockets for boost<br>Don\'t fall!'
  },
  bestScoreKey: 'emojiFrogBest',

  diagnosis: {
    types: {
      FROGLEGEND: {
        icon: '🌟',
        title: { zh: '蛙界传奇', en: 'Frog Legend' },
        quote: { zh: '"你已经超越了青蛙的极限。"', en: '"You have exceeded the limits of frogkind."' },
        rare: { zh: '传说', en: 'Legendary' },
        rarePercent: '0.8%',
        rarityClass: 'legendary',
        roasts: {
          zh: ['你的弹跳力让袋鼠都自愧不如', '你已经超越了青蛙的极限', '建议去当青蛙界的大明星'],
          en: ['Your bounce puts kangaroos to shame', 'You have exceeded frog limits', 'Consider becoming a frog superstar']
        }
      },
      ROCKETFROG: {
        icon: '🚀',
        title: { zh: '火箭青蛙', en: 'Rocket Frog' },
        quote: { zh: '"重力对你只是建议，不是规则。"', en: '"Gravity is just a suggestion for you."' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '7%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你的青蛙像装了火箭引擎', '重力对你只是建议', 'NASA 想雇你当宇航员'],
          en: ['Your frog has a rocket engine', 'Gravity is just a suggestion for you', 'NASA wants to hire you as an astronaut']
        }
      },
      JUMPMASTER: {
        icon: '🦘',
        title: { zh: '跳跃健将', en: 'Jump Master' },
        quote: { zh: '"你的弹跳力让袋鼠都自愧不如。"', en: '"Your bounce puts kangaroos to shame."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '18%',
        rarityClass: 'rare',
        roasts: {
          zh: ['你的弹跳力让袋鼠都自愧不如', '建议去参加奥运会跳高', '你的青蛙是国家队的吧'],
          en: ['Your bounce puts kangaroos to shame', 'Consider joining Olympic high jump', 'Your frog is on the national team']
        }
      },
      PONDNOVICE: {
        icon: '🐸',
        title: { zh: '池塘菜鸟', en: 'Pond Novice' },
        quote: { zh: '"掉下去不是你的错，是重力的错。"', en: '"Falling is not your fault. Blame gravity."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '40%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的青蛙更适合当潜水员', '掉下去不是你的错，是重力的错', '建议先学游泳'],
          en: ['Your frog is better suited as a diver', 'Falling is not your fault, blame gravity', 'Consider learning to swim first']
        }
      }
    },

    detectType(stats) {
      if (stats.score >= 500) return 'FROGLEGEND';
      if (stats.score >= 300) return 'ROCKETFROG';
      if (stats.score >= 100) return 'JUMPMASTER';
      return 'PONDNOVICE';
    },

    statsLabels: {
      score: { zh: '高度', en: 'Height' },
      maxHeight: { zh: '最高', en: 'Best' },
      lilyBounces: { zh: '睡莲弹跳', en: 'Lily Bounces' },
      rocketBoosts: { zh: '火箭加速', en: 'Rocket Boosts' }
    }
  }
};
