// themes.js - Emoji Evolution 2048 进化链数据

const THEMES = {
  life: {
    id: 'life',
    name: '生命进化',
    nameEn: 'Life Evolution',
    emoji: '🦠',
    description: '从单细胞到史前霸主',
    descriptionEn: 'From cell to prehistoric king',
    locked: false,
    unlockCost: 0,
    colors: ['#2d5a7b', '#3d7a5b', '#5a8a3d', '#8a7a2d', '#8a5a2d', '#7a3d2d', '#ff6b35'],
    chain: [
      { level: 1, emoji: '🦠', name: '细胞', nameEn: 'Cell', value: 2 },
      { level: 2, emoji: '🐛', name: '虫子', nameEn: 'Bug', value: 4 },
      { level: 3, emoji: '🐸', name: '青蛙', nameEn: 'Frog', value: 8 },
      { level: 4, emoji: '🦎', name: '蜥蜴', nameEn: 'Lizard', value: 16 },
      { level: 5, emoji: '🐍', name: '蛇', nameEn: 'Snake', value: 32 },
      { level: 6, emoji: '🦖', name: '恐龙', nameEn: 'Dino', value: 64 },
      { level: 7, emoji: '👑', name: '霸王龙之王', nameEn: 'T-Rex King', value: 128 }
    ]
  },
  fire: {
    id: 'fire',
    name: '火之进化',
    nameEn: 'Fire Evolution',
    emoji: '🔥',
    description: '从星火到太阳神',
    descriptionEn: 'From spark to sun god',
    locked: false,
    unlockCost: 0,
    colors: ['#5a1a1a', '#7a2a1a', '#9a3a1a', '#ba5a1a', '#da7a1a', '#fa9a1a', '#ffcc00'],
    chain: [
      { level: 1, emoji: '🔥', name: '火花', nameEn: 'Spark', value: 2 },
      { level: 2, emoji: '🕯️', name: '蜡烛', nameEn: 'Candle', value: 4 },
      { level: 3, emoji: '🏮', name: '灯笼', nameEn: 'Lantern', value: 8 },
      { level: 4, emoji: '🔥🔥', name: '烈焰', nameEn: 'Blaze', value: 16 },
      { level: 5, emoji: '🏰', name: '烽火', nameEn: 'Beacon', value: 32 },
      { level: 6, emoji: '🌋', name: '火山', nameEn: 'Volcano', value: 64 },
      { level: 7, emoji: '☀️', name: '太阳神', nameEn: 'Sun God', value: 128 }
    ]
  },
  water: {
    id: 'water',
    name: '水之进化',
    nameEn: 'Water Evolution',
    emoji: '💧',
    description: '从水滴到海洋之王',
    descriptionEn: 'From droplet to ocean king',
    locked: true,
    unlockCost: 20,
    colors: ['#1a3a5a', '#1a4a6a', '#1a5a7a', '#1a6a8a', '#1a7a9a', '#1a8aaa', '#00ccff'],
    chain: [
      { level: 1, emoji: '💧', name: '水滴', nameEn: 'Droplet', value: 2 },
      { level: 2, emoji: '🌊', name: '浪花', nameEn: 'Wave', value: 4 },
      { level: 3, emoji: '🐟', name: '小鱼', nameEn: 'Fish', value: 8 },
      { level: 4, emoji: '🐬', name: '海豚', nameEn: 'Dolphin', value: 16 },
      { level: 5, emoji: '🦈', name: '鲨鱼', nameEn: 'Shark', value: 32 },
      { level: 6, emoji: '🐳', name: '鲸鱼', nameEn: 'Whale', value: 64 },
      { level: 7, emoji: '🌊🌊', name: '海洋之王', nameEn: 'Ocean King', value: 128 }
    ]
  },
  weapon: {
    id: 'weapon',
    name: '武器进化',
    nameEn: 'Weapon Evolution',
    emoji: '⚔️',
    description: '从石器到末日武器',
    descriptionEn: 'From stone to doomsday weapon',
    locked: true,
    unlockCost: 50,
    colors: ['#3a3a3a', '#4a4a4a', '#5a5a5a', '#6a6a6a', '#7a7a7a', '#8a8a8a', '#ff4444'],
    chain: [
      { level: 1, emoji: '🪨', name: '石器', nameEn: 'Stone', value: 2 },
      { level: 2, emoji: '🔪', name: '匕首', nameEn: 'Dagger', value: 4 },
      { level: 3, emoji: '⚔️', name: '长剑', nameEn: 'Sword', value: 8 },
      { level: 4, emoji: '🏹', name: '弓箭', nameEn: 'Bow', value: 16 },
      { level: 5, emoji: '🔫', name: '火枪', nameEn: 'Gun', value: 32 },
      { level: 6, emoji: '🚀', name: '火箭', nameEn: 'Rocket', value: 64 },
      { level: 7, emoji: '☢️', name: '末日武器', nameEn: 'Doomsday', value: 128 }
    ]
  },
  food: {
    id: 'food',
    name: '食物链',
    nameEn: 'Food Chain',
    emoji: '🍔',
    description: '从农田到满汉全席',
    descriptionEn: 'From farm to feast',
    locked: true,
    unlockCost: 100,
    colors: ['#3a5a1a', '#4a6a2a', '#5a7a3a', '#6a8a4a', '#7a9a5a', '#8aaa6a', '#ff8800'],
    chain: [
      { level: 1, emoji: '🌾', name: '稻穗', nameEn: 'Grain', value: 2 },
      { level: 2, emoji: '🥚', name: '鸡蛋', nameEn: 'Egg', value: 4 },
      { level: 3, emoji: '🐔', name: '小鸡', nameEn: 'Chick', value: 8 },
      { level: 4, emoji: '🍗', name: '鸡腿', nameEn: 'Drumstick', value: 16 },
      { level: 5, emoji: '🍔', name: '汉堡', nameEn: 'Burger', value: 32 },
      { level: 6, emoji: '🍟', name: '套餐', nameEn: 'Meal', value: 64 },
      { level: 7, emoji: '🏆', name: '满汉全席', nameEn: 'Feast', value: 128 }
    ]
  }
};

function getTheme(themeId) {
  return THEMES[themeId] || THEMES['life'];
}

function getChainItem(themeId, level) {
  const theme = getTheme(themeId);
  return theme.chain.find(item => item.level === level) || theme.chain[theme.chain.length - 1];
}

function getColor(themeId, level) {
  const theme = getTheme(themeId);
  const colors = theme.colors;
  return colors[Math.min(level - 1, colors.length - 1)];
}

// 导出给 game.js 使用
if (typeof window !== 'undefined') {
  window.THEMES = THEMES;
  window.getTheme = getTheme;
  window.getChainItem = getChainItem;
  window.getColor = getColor;
}
