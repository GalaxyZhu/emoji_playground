const GameConfig = {
  id: 'emoji-drift',
  emoji: '🚗',
  name: { zh: '节奏漂移', en: 'Emoji Drift' },
  tagline: { zh: '🎵 节奏漂移模式 V0.3.0', en: '🎵 Rhythm Drift Mode V0.3.0' },
  instructions: {
    zh: '🎵 弯道会在道路上出现<br>🎯 当车进入弯道判定区时<br>👈 点击左侧 = 左漂移<br>👉 点击右侧 = 右漂移<br>💚 Perfect = 最高速 + 连击+1<br>💙 Good = 正常<br>❌ Miss = 扣1血 + 连击重置<br><span style="color: #00ff88;">🔥 每10连击恢复1点生命！</span>',
    en: '🎵 Curves appear on the road<br>🎯 When car enters curve zone<br>👈 Tap left = drift left<br>👉 Tap right = drift right<br>💚 Perfect = max speed + combo+1<br>💙 Good = normal<br>❌ Miss = -1 health + combo reset<br><span style="color: #00ff88;">🔥 Every 10 combo restores 1 health!</span>'
  },
  bestScoreKey: 'emojiDriftHighScore',

  diagnosis: {
    types: {
      DRIFTGOD: {
        icon: '🌪️',
        title: { zh: '漂移之神', en: 'Drift God' },
        quote: { zh: '"你已经超越了物理定律。"', en: '"You have transcended physics."' },
        rare: { zh: '传说', en: 'Legendary' },
        rarePercent: '0.7%',
        rarityClass: 'legendary',
        roasts: {
          zh: ['你的漂移让轮胎都自愧不如', '物理定律对你无效', '建议去挑战职业赛车手'],
          en: ['Your drifting makes tires proud', 'Physics laws don\'t apply to you', 'Consider challenging pro racers']
        }
      },
      DRIFTARTIST: {
        icon: '🔥',
        title: { zh: '漂移艺术家', en: 'Drift Artist' },
        quote: { zh: '"你的轮胎烟雾是艺术品。"', en: 'Your tire smoke is modern art.' },
        rare: { zh: '史诗', en: 'Epic' },
        rarePercent: '5%',
        rarityClass: 'epic',
        roasts: {
          zh: ['你的漂移轨迹像莫奈的画', '轮胎 smoke 比烟花还美', '建议在美术馆展出你的漂移'],
          en: ['Your drift traces look like Monet paintings', 'Tire smoke prettier than fireworks', 'Consider exhibiting your drifts in a museum']
        }
      },
      RHYTHMMASTER: {
        icon: '🎵',
        title: { zh: '节奏大师', en: 'Rhythm Master' },
        quote: { zh: '"你和弯道的默契度：灵魂伴侣。"', en: '"You and corners are basically soulmates."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '20%',
        rarityClass: 'rare',
        roasts: {
          zh: ['你的节奏感让音乐都嫉妒', '弯道看了你都想主动配合', '建议去当DJ'],
          en: ['Your rhythm makes music jealous', 'Corners want to cooperate with you', 'Consider becoming a DJ']
        }
      },
      BUDDHIST: {
        icon: '🐢',
        title: { zh: '佛系车手', en: 'Buddhist Driver' },
        quote: { zh: '"慢是一种态度，不是技术问题。"', en: '"Slow is a lifestyle, not a skill issue."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '35%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的漂移让教练想辞职', '建议先去学开车再来玩', '你的漂移技术让驾校教练都流泪'],
          en: ['Your drifting makes instructors quit', 'Try learning to drive first', 'Your drifting makes coaches cry']
        }
      }
    },

    detectType(stats) {
      if (stats.score >= 10000) return 'DRIFTGOD';
      if (stats.score >= 5000) return 'DRIFTARTIST';
      if (stats.score >= 2000) return 'RHYTHMMASTER';
      return 'BUDDHIST';
    },

    statsLabels: {
      score: { zh: '得分', en: 'Score' },
      highScore: { zh: '最高', en: 'Best' },
      maxCombo: { zh: '最高连击', en: 'Max Combo' },
      perfectDrifts: { zh: '完美漂移', en: 'Perfect Drifts' }
    }
  }
};