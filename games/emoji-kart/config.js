const GameConfig = {
  id: 'emoji-kart',
  emoji: '🏎️',
  name: { zh: '卡丁车', en: 'Emoji Kart' },
  tagline: { zh: 'V0.1.0', en: 'V0.1.0' },
  instructions: {
    zh: '方向键控制卡丁车<br>收集道具加速<br>躲避障碍物<br>争取第一名！',
    en: 'Arrow keys to control kart<br>Collect items for speed boost<br>Dodge obstacles<br>Aim for first place!'
  },
  bestScoreKey: 'emojiKartBestRank',

  diagnosis: {
    types: {
      CHAMPION: {
        icon: '🥇',
        title: { zh: '冠军收割机', en: 'Champion Harvester' },
        quote: { zh: '"你的方向盘上有王者的气息。"', en: '"Your steering wheel smells like victory."' },
        rare: { zh: '传说', en: 'Legendary' },
        rarePercent: '0.5%',
        rarityClass: 'legendary',
        roasts: {
          zh: ['你的方向盘上有王者的气息', '其他车手看到你都想退赛', '建议去F1发展'],
          en: ['Your steering wheel smells like victory', 'Other drivers want to quit when they see you', 'Consider joining F1']
        }
      },
      SECONDPRO: {
        icon: '🥈',
        title: { zh: '亚军专业户', en: 'Second Place Pro' },
        quote: { zh: '"你总是差那么一点点。"', en: '"You are always just a little bit short."' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '5%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你总是差那么一点点', '千年老二非你莫属', '建议去当银牌收藏家'],
          en: ['You are always just a little bit short', 'The eternal runner-up', 'Consider collecting silver medals']
        }
      },
      PODIUMEDGE: {
        icon: '🥉',
        title: { zh: '领奖台边缘', en: 'Podium Edge' },
        quote: { zh: '"差一点就能喝香槟了。"', en: '"So close to popping champagne."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '20%',
        rarityClass: 'rare',
        roasts: {
          zh: ['差一点就能喝香槟了', '建议带个梯子爬上去', '领奖台边缘风景不错吧'],
          en: ['So close to popping champagne', 'Consider bringing a ladder', 'Nice view from the podium edge']
        }
      },
      TRACKWALKER: {
        icon: '🐌',
        title: { zh: '赛道散步者', en: 'Track Walker' },
        quote: { zh: '"你在赛道上留下了脚印，不是轮胎印。"', en: '"You left footprints on the track, not tire marks."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '40%',
        rarityClass: 'common',
        roasts: {
          zh: ['你在赛道上留下了脚印', '蜗牛都比你快', '建议去当步行教练'],
          en: ['You left footprints on the track', 'Snails are faster than you', 'Consider becoming a walking coach']
        }
      }
    },

    detectType(stats) {
      if (stats.rank <= 1) return 'CHAMPION';
      if (stats.rank <= 2) return 'SECONDPRO';
      if (stats.rank <= 3) return 'PODIUMEDGE';
      return 'TRACKWALKER';
    },

    statsLabels: {
      rank: { zh: '名次', en: 'Rank' },
      bestRank: { zh: '最佳', en: 'Best' },
      laps: { zh: '完成圈数', en: 'Laps' },
      maxSpeed: { zh: '最高速度', en: 'Top Speed' }
    }
  }
};
