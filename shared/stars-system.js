// stars-system.js - Emoji Arcade 统一积分系统

const ArcadeStars = {
  key: 'emoji_arcade_stars',
  historyKey: 'emoji_arcade_stars_history',

  getTotal() {
    try {
      return parseInt(localStorage.getItem(this.key) || '0');
    } catch {
      return 0;
    }
  },

  addStars(amount, gameId) {
    const total = this.getTotal();
    const newTotal = total + amount;
    localStorage.setItem(this.key, newTotal.toString());

    // 记录历史
    const history = this.getHistory();
    history.push({
      gameId,
      amount,
      total: newTotal,
      time: Date.now()
    });
    // 只保留最近 100 条
    if (history.length > 100) history.shift();
    localStorage.setItem(this.historyKey, JSON.stringify(history));

    // 触发事件
    window.dispatchEvent(new CustomEvent('starsUpdated', {
      detail: { amount, total: newTotal, gameId }
    }));

    return newTotal;
  },

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.historyKey) || '[]');
    } catch {
      return [];
    }
  },

  reset() {
    localStorage.removeItem(this.key);
    localStorage.removeItem(this.historyKey);
  }
};

// 向后兼容
if (typeof window !== 'undefined') {
  window.ArcadeStars = ArcadeStars;
}
