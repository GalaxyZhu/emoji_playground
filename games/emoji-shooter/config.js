const GameConfig = {
  id: 'emoji-shooter',
  emoji: '🔫',
  name: { zh: 'Emoji Shooter', en: 'Emoji Shooter' },
  tagline: { zh: 'V0.1', en: 'V0.1' },
  instructions: {
    zh: '点击射击敌人<br>不同敌人需要不同射击次数<br>收集道具升级武器<br>生存尽可能久！',
    en: 'Click to shoot enemies<br>Different enemies need different shots<br>Collect items to upgrade weapons<br>Survive as long as possible!'
  },
  bestScoreKey: 'emojiShooterBest',

  diagnosis: {
    types: {
      SNP: {
        icon: '🎯',
        title: { zh: '锁头挂嫌疑人', en: 'Aimbot Suspect' },
        quote: { zh: '"我说我没开，你信吗？"', en: '"I swear I\'m not cheating."' },
        rare: { zh: '稀有', en: 'Rare' },
        rarePercent: '5%',
        rarityClass: 'rare',
        roasts: {
          zh: ['你的鼠标dpi调成了心灵感应模式', '敌人举报键按烂了', '建议去打职业'],
          en: ['Your mouse DPI is set to telepathy mode', 'Enemies broke their report button', 'Consider going pro']
        }
      },
      PAN: {
        icon: '😱',
        title: { zh: 'Panic射击手', en: 'Panic Shooter' },
        quote: { zh: '"看到敌人→狂按鼠标→祈祷。"', en: '"See enemy → Spam click → Pray."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '35%',
        rarityClass: 'common',
        roasts: {
          zh: ['战术就是吓死对方', '弹药商该给你颁奖', '敌人是被你吵死的'],
          en: ['Your tactic is to scare enemies to death', 'Ammo dealers should sponsor you', 'Enemies die from noise pollution']
        }
      },
      SPR: {
        icon: '🏃',
        title: { zh: '无限换弹癌', en: 'Reload Addict' },
        quote: { zh: '"弹匣还有29发？不行，必须换。"', en: '"29 rounds left? Must reload."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '22%',
        rarityClass: 'common',
        roasts: {
          zh: ['敌人永远在你换弹时出现', 'R键磨损最严重', '建议玩近战游戏'],
          en: ['Enemies always appear when you reload', 'Your R key has the most wear', 'Consider melee games']
        }
      },
      SPD: {
        icon: '🔫',
        title: { zh: '人体描边大师', en: 'Human Outline Artist' },
        quote: { zh: '"敌人没死，但我键盘先死了。"', en: '"Enemy alive, keyboard dead."' },
        rare: { zh: '常见', en: 'Common' },
        rarePercent: '28%',
        rarityClass: 'common',
        roasts: {
          zh: ['你的准星在敌人周围画了一个完美的圆', '敌人以为你在故意放水', '建议转行做气象预报'],
          en: ['Your crosshair draws a perfect circle around enemies', 'Enemies think you\'re going easy on them', 'Consider a career in weather forecasting']
        }
      }
    },

    detectType(stats) {
      const accuracy = stats.shotsFired > 0 ? (stats.shotsHit / stats.shotsFired * 100) : 0;
      if (accuracy > 80 && stats.enemiesKilled > 10) return 'SNP';
      if (stats.shotsFired > 80 && accuracy < 25) return 'PAN';
      if (stats.shotsFired > 40 && accuracy < 35) return 'SPR';
      return 'SPD';
    },

    statsLabels: {
      score: { zh: '得分', en: 'Score' },
      highScore: { zh: '最高', en: 'Best' },
      shotsFired: { zh: '射击', en: 'Shots' },
      shotsHit: { zh: '命中', en: 'Hits' },
      enemiesKilled: { zh: '击杀', en: 'Kills' },
      wave: { zh: '波次', en: 'Wave' }
    }
  }
};
