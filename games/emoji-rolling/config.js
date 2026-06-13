const GameConfig = {
  id: 'emoji-rolling',
  emoji: '🚙',
  name: { zh: 'Emoji Rolling', en: 'Emoji Rolling' },
  tagline: { zh: 'V0.1', en: 'V0.1' },
  instructions: {
    zh: '控制车辆在山路上行驶<br>保持平衡，避免翻车<br>飞跃障碍，收集金币<br>到达终点！',
    en: 'Drive your vehicle on mountain roads<br>Keep balance, avoid rollover<br>Jump obstacles, collect coins<br>Reach the finish line!'
  },
  bestScoreKey: 'emojiRollingBest',

  diagnosis: {
    types: {
      LEGEND: {
        icon: '🏔️',
        title: { zh: '山峰征服者', en: 'Peak Conqueror' },
        quote: { zh: '"山峰只是你的游乐场。"', en: '"Mountains are just your playground."' },
        rare: { zh: '传说', en: 'Legendary' },
        rarePercent: '0.6%',
        rarityClass: 'legendary',
        roasts: {
          zh: ['山神看了都给你让路', '你的车技可以申请非物质文化遗产', '建议去当特技演员'],
          en: ['Mountain gods yield to you', 'Your driving should be intangible cultural heritage', 'Consider being a stunt driver']
        }
      },
      EPIC: {
        icon: '🦅',
        title: { zh: '天空之王', en: 'Sky King' },
        quote: { zh: '"你的飞行高度让鸟类都嫉妒。"', en: '"Your flight altitude makes birds jealous."' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '5%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你开车像在开飞机', '牛顿看了你的操作想辞职', '建议去考飞行执照'],
          en: ['You drive like you fly', 'Newton would resign seeing your moves', 'Consider getting a pilot license']
        }
      },
      RARE: {
        icon: '⛰️',
        title: { zh: '山路行者', en: 'Mountain Walker' },
        quote: { zh: '"你对地形的感觉比GPS还准。"', en: '"Your terrain sense is better than GPS."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '18%',
        rarityClass: 'rare',
        roasts: {
          zh: ['山路十八弯，你走的直线', '你的车像长了眼睛', '建议去当导航员'],
          en: ['Eighteen bends, you take the straight line', 'Your car seems to have eyes', 'Consider being a navigator']
        }
      },
      COMMON: {
        icon: '🚜',
        title: { zh: '翻车新手', en: 'Rollover Rookie' },
        quote: { zh: '"翻车是你的常态，平稳是意外。"', en: '"Rolling over is normal; staying upright is a miracle."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '42%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的翻滚技术让洗衣机都自愧不如', '建议先去学平衡术再来玩', '你的驾驶让牛顿都感到困惑'],
          en: ['Your rolling makes washing machines jealous', 'Try learning balance first', 'Your driving confuses Newton']
        }
      }
    },

    detectType(stats) {
      if (stats.score >= 5000) return 'LEGEND';
      if (stats.score >= 3000) return 'EPIC';
      if (stats.score >= 1000) return 'RARE';
      return 'COMMON';
    },

    statsLabels: {
      score: { zh: '得分', en: 'Score' },
      highScore: { zh: '最高', en: 'Best' },
      airTime: { zh: '空中时间', en: 'Air Time' },
      flips: { zh: '翻滚次数', en: 'Flips' }
    }
  }
};