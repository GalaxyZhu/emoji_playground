const GameConfig = {
  id: 'emoji-pattern',
  emoji: '👁️',
  name: { zh: '眼疾手快', en: 'Emoji Pattern' },
  tagline: { zh: 'V0.1', en: 'V0.1' },
  instructions: {
    zh: '快速找出目标emoji<br>点击正确目标得分<br>连击加分<br>速度越快分数越高！',
    en: 'Quickly find the target emoji<br>Click correct target to score<br>Combo bonus<br>Faster = higher score!'
  },
  bestScoreKey: 'emojiPatternBest',

  diagnosis: {
    types: {
      GOD: {
        icon: '⚡',
        title: { zh: '人形自走外挂', en: 'Human Aimbot' },
        quote: { zh: '"我的眼睛就是尺，我的手就是风。"', en: '"My eyes are the ruler, my hands are the wind."' },
        rare: { zh: '传说', en: 'Legendary' },
        rarePercent: '2%',
        rarityClass: 'legendary',
        roasts: {
          zh: ['建议你去参加电竞奥运会', 'emoji看到你都会发抖', '这手速，单身多少年练的？'],
          en: ['You should enter the e-sports Olympics', 'Emojis tremble when they see you', 'How many years of singlehood built this hand speed?']
        }
      },
      PRO: {
        icon: '🎵',
        title: { zh: '节奏大师', en: 'Rhythm Master' },
        quote: { zh: '"每个emoji都有它的节拍。"', en: '"Every emoji has its beat."' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '8%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你的手和emoji之间有心电感应', '建议开直播教课', '连击数高到像开了连点器'],
          en: ['Your hands and emojis have telepathy', 'You should stream and teach', 'Your combo looks like an auto-clicker']
        }
      },
      EYE: {
        icon: '👁️',
        title: { zh: '鹰眼玩家', en: 'Eagle Eye' },
        quote: { zh: '"错误？那是什么，能吃吗？"', en: '"Errors? What are those, can you eat them?"' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '12%',
        rarityClass: 'rare',
        roasts: {
          zh: ['你一眼就能从矩阵里挑出目标', '显微镜都没你看得准', '怀疑你偷偷给emoji贴了标签'],
          en: ['You can spot targets instantly', 'More accurate than a microscope', 'Did you secretly label the emojis?']
        }
      },
      RAGE: {
        icon: '💢',
        title: { zh: '键盘破坏者', en: 'Keyboard Destroyer' },
        quote: { zh: '"屏幕没碎是我的仁慈。"', en: '"The screen not breaking is my mercy."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '18%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的点击方式叫"地毯式轰炸"', 'emoji是被你吓死的不是被点死的', '建议换个耐造的屏幕'],
          en: ['Your clicking style is "carpet bombing"', 'Emojis die from fear not clicks', 'Consider a tougher screen']
        }
      },
      NOOB: {
        icon: '🤕',
        title: { zh: '帕金森早期', en: 'Early Parkinson\'s' },
        quote: { zh: '"我不是在点错，我是在给emoji按摩。"', en: '"I\'m not misclicking, I\'m massaging the emojis."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '25%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的手指和emoji在玩捉迷藏', '准确率感人，建议多练', 'emoji在你手下活得挺滋润'],
          en: ['Your fingers play hide-and-seek with emojis', 'Accuracy is touching, practice more', 'Emojis live comfortably under your fingers']
        }
      },
      SLOW: {
        icon: '🐌',
        title: { zh: '树懒转世', en: 'Reincarnated Sloth' },
        quote: { zh: '"我不是慢，我是在享受人生。"', en: '"I\'m not slow, I\'m enjoying life."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '22%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的时间感跟常人不一样', 'emoji等得都快睡着了', '建议去玩回合制游戏'],
          en: ['Your sense of time is different', 'Emojis almost fell asleep waiting', 'Consider turn-based games']
        }
      },
      AVERAGE: {
        icon: '😐',
        title: { zh: '平平无奇打工人', en: 'Average Worker' },
        quote: { zh: '"及格万岁，多一分浪费。"', en: '"Passing is enough, extra points are wasted."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '13%',
        rarityClass: 'common',
        roasts: {
          zh: ['稳定发挥，毫无惊喜', '你就像emoji矩阵里的一块背景板', '多喝热水，下次加油'],
          en: ['Consistent, zero surprises', 'You\'re like a background emoji', 'Drink more water, try harder next time']
        }
      }
    },

    detectType(stats) {
      const accuracy = stats.totalClicks > 0 ? (stats.correctClicks / stats.totalClicks * 100) : 0;
      const avgTimePerLevel = stats.level > 0 ? (stats.totalTimeSpent / stats.level) : 0;
      if (stats.maxCombo >= 15 && stats.level >= 5 && accuracy > 85) return 'GOD';
      if (accuracy > 75 && stats.maxCombo >= 8 && stats.level >= 3) return 'PRO';
      if (stats.wrongClicks === 0 && stats.level >= 3) return 'EYE';
      if (stats.wrongClicks >= 8 || accuracy < 30) return 'NOOB';
      if (stats.level <= 2 && stats.wrongClicks >= 3) return 'RAGE';
      if (stats.level === 1 && avgTimePerLevel > 15) return 'SLOW';
      return 'AVERAGE';
    },

    statsLabels: {
      score: { zh: '得分', en: 'Score' },
      bestScore: { zh: '最高', en: 'Best' },
      totalClicks: { zh: '点击', en: 'Clicks' },
      accuracy: { zh: '准确率', en: 'Accuracy' },
      maxCombo: { zh: '最高连击', en: 'Max Combo' },
      level: { zh: '关卡', en: 'Level' }
    }
  }
};
