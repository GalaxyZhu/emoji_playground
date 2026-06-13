const GameConfig = {
  id: 'emoji-spot',
  emoji: '🕵️',
  name: { zh: '找坏人', en: 'Emoji Spot' },
  tagline: { zh: 'V0.1', en: 'V0.1' },
  instructions: {
    zh: '找出隐藏在不同emoji中的坏人<br>点击正确目标得分<br>速度越快，分数越高<br>小心不要点错！',
    en: 'Find the bad guy hidden among emojis<br>Click correct target to score<br>Faster = higher score<br>Don\'t click wrong!'
  },
  bestScoreKey: 'emojiSpotBest',

  diagnosis: {
    types: {
      EAGLE: {
        icon: '🦅',
        title: { zh: '鹰眼侦探', en: 'Eagle Eye Detective' },
        quote: { zh: '"在我眼里，每个像素都是嫌疑人。"', en: '"Every pixel is a suspect in my eyes."' },
        rare: { zh: '传说', en: 'Legendary' },
        rarePercent: '2%',
        rarityClass: 'legendary',
        roasts: {
          zh: ['你的眼睛装了显微镜吧？', '建议去当鉴宝专家', '坏人看到你都想自首'],
          en: ['Did you install a microscope in your eyes?', 'You should be an antiques expert', 'Bad guys want to surrender when they see you']
        }
      },
      DETAIL: {
        icon: '🧐',
        title: { zh: '细节狂魔', en: 'Detail Maniac' },
        quote: { zh: '"差一个像素，也是犯罪。"', en: '"One pixel off is still a crime."' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '8%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你的专注度让人害怕', 'emoji在你手下无处遁形', '怀疑你有强迫症'],
          en: ['Your focus is terrifying', 'Emojis have nowhere to hide', 'Suspecting you have OCD']
        }
      },
      SHARP: {
        icon: '👁️',
        title: { zh: '火眼金睛', en: 'Sharp Eyes' },
        quote: { zh: '"不是我看出来的，是它自己招的。"', en: '"It confessed itself, I didn\'t even look."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '12%',
        rarityClass: 'rare',
        roasts: {
          zh: ['一眼锁定，绝不失手', 'emoji还没藏好就被你抓了', '建议去玩找不同专业版'],
          en: ['Lock on at first glance, never miss', 'Emojis get caught before they hide', 'Consider the pro version of spot-the-difference']
        }
      },
      RAGE: {
        icon: '💢',
        title: { zh: '愤怒小鸟', en: 'Angry Clicker' },
        quote: { zh: '"我不是在找坏人，我是在拆网格。"', en: '"I\'m not finding the bad guy, I\'m destroying the grid."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '18%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的点击方式叫"地毯式排查"', '坏人没被找到，被你吓死的', '建议换个耐点的屏幕'],
          en: ['Your clicking style is "carpet bombing"', 'The bad guy died from fear, not found', 'Consider a tougher screen']
        }
      },
      BLURRY: {
        icon: '😵',
        title: { zh: '眼花大师', en: 'Blurry Master' },
        quote: { zh: '"我觉得它们都一样...对吧？"', en: '"They all look the same... right?"' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '25%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的眼睛和emoji在玩捉迷藏', '准确率感人，建议配眼镜', '坏人看到你都想帮帮你'],
          en: ['Your eyes play hide-and-seek with emojis', 'Accuracy is touching, consider glasses', 'Bad guys want to help you']
        }
      },
      SLOW: {
        icon: '🐌',
        title: { zh: '慢动作侦探', en: 'Slow-Motion Detective' },
        quote: { zh: '"我不是慢，我是在享受寻找的过程。"', en: '"I\'m not slow, I\'m enjoying the hunt."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '22%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的时间感跟常人不一样', '坏人等得都快睡着了', '建议去玩拼图'],
          en: ['Your sense of time is different', 'Bad guys almost fell asleep waiting', 'Consider jigsaw puzzles']
        }
      },
      AVERAGE: {
        icon: '😐',
        title: { zh: '平平无奇观察员', en: 'Average Observer' },
        quote: { zh: '"及格万岁，找到就行。"', en: '"Passing is enough, found is found."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '13%',
        rarityClass: 'common',
        roasts: {
          zh: ['稳定发挥，毫无惊喜', '你就像emoji网格里的一块背景板', '多喝热水，下次加油'],
          en: ['Consistent, zero surprises', 'You\'re like a background emoji', 'Drink more water, try harder next time']
        }
      }
    },

    detectType(stats) {
      const accuracy = stats.totalClicks > 0 ? (stats.correctClicks / stats.totalClicks * 100) : 0;
      if (stats.level >= 10 && stats.wrongClicks === 0) return 'EAGLE';
      if (accuracy > 90 && stats.level >= 7) return 'DETAIL';
      if (accuracy > 80 && stats.level >= 5) return 'SHARP';
      if (stats.wrongClicks >= 5 || accuracy < 30) return 'BLURRY';
      if (stats.level <= 2 && stats.wrongClicks >= 2) return 'RAGE';
      if (stats.level <= 3 && stats.totalClicks > 0 && accuracy < 50) return 'SLOW';
      return 'AVERAGE';
    },

    statsLabels: {
      score: { zh: '得分', en: 'Score' },
      bestScore: { zh: '最高', en: 'Best' },
      level: { zh: '关卡', en: 'Level' },
      accuracy: { zh: '准确率', en: 'Accuracy' },
      maxStreak: { zh: '最高连击', en: 'Max Streak' },
      totalClicks: { zh: '总点击', en: 'Total Clicks' }
    }
  }
};
