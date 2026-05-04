/**
 * Token System - Emoji Arcade 虚拟代币系统
 * Preview 版：localStorage 实现
 * 后续可无缝替换为 Firebase Firestore
 */
(function() {
    'use strict';

    const STORAGE_PREFIX = 'emoji_arcade_token_';
    
    const KEYS = {
        BALANCE: 'balance',
        LAST_CHECKIN: 'last_checkin',
        TOTAL_CONSUMED: 'total_consumed',
        TRANSACTIONS: 'transactions',
        IS_VIP: 'is_vip',
        USER_INITIALIZED: 'user_initialized'
    };

    // ==================== 底层存储 ====================
    function get(key) {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function set(key, value) {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    }

    function getTodayStr() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'Never';
        const d = new Date(dateStr);
        return d.toLocaleDateString();
    }

    // ==================== 核心 API ====================
    const TokenSystem = {
        // --- 初始化 ---
        initUser() {
            const initialized = get(KEYS.USER_INITIALIZED);
            if (!initialized) {
                // 新用户：送30币
                set(KEYS.BALANCE, 30);
                set(KEYS.LAST_CHECKIN, null);
                set(KEYS.TOTAL_CONSUMED, 0);
                set(KEYS.TRANSACTIONS, []);
                set(KEYS.IS_VIP, false);
                set(KEYS.USER_INITIALIZED, true);
                console.log('[TokenSystem] New user initialized with 30 coins');
                return { isNew: true, balance: 30 };
            }
            console.log('[TokenSystem] Existing user, balance:', this.getBalance());
            return { isNew: false, balance: this.getBalance() };
        },

        resetUser() {
            Object.values(KEYS).forEach(k => {
                localStorage.removeItem(STORAGE_PREFIX + k);
            });
        },

        // --- 余额查询 ---
        getBalance() {
            return get(KEYS.BALANCE) ?? 0;
        },

        getTotalConsumed() {
            return get(KEYS.TOTAL_CONSUMED) ?? 0;
        },

        isVip() {
            return get(KEYS.IS_VIP) === true;
        },

        setVip(vip) {
            set(KEYS.IS_VIP, vip === true);
        },

        // --- 扣币（游戏入口）---
        // 返回 { success, balance, error }
        deductCoin(gameId) {
            // VIP 免扣
            if (this.isVip()) {
                this._addTransaction('consume', 0, gameId, 'VIP free play');
                return { success: true, balance: this.getBalance(), vip: true };
            }

            const current = this.getBalance();
            if (current < 1) {
                return { success: false, balance: current, error: 'INSUFFICIENT' };
            }

            // 模拟事务：先读后写（Preview版无并发问题，但保留事务结构）
            if (current < 1) {
                return { success: false, balance: current, error: 'INSUFFICIENT' };
            }
            const newBalance = current - 1;
            const newConsumed = (get(KEYS.TOTAL_CONSUMED) ?? 0) + 1;
            
            set(KEYS.BALANCE, newBalance);
            set(KEYS.TOTAL_CONSUMED, newConsumed);
            this._addTransaction('consume', 1, gameId, `Play ${gameId}`);

            return { success: true, balance: newBalance };
        },

        // --- 签到 ---
        // 返回 { success, amount, balance, alreadyCheckedIn }
        dailyCheckIn() {
            const today = getTodayStr();
            const lastCheckin = get(KEYS.LAST_CHECKIN);
            
            if (lastCheckin === today) {
                return { success: false, alreadyCheckedIn: true, balance: this.getBalance() };
            }

            const current = this.getBalance();
            const newBalance = current + 10;
            
            set(KEYS.BALANCE, newBalance);
            set(KEYS.LAST_CHECKIN, today);
            this._addTransaction('checkin', 10, null, 'Daily check-in');

            return { success: true, amount: 10, balance: newBalance };
        },

        canCheckIn() {
            const today = getTodayStr();
            const last = get(KEYS.LAST_CHECKIN);
            return last !== today;
        },

        // --- 看广告奖励 ---
        watchAdReward() {
            const current = this.getBalance();
            const newBalance = current + 5;
            set(KEYS.BALANCE, newBalance);
            this._addTransaction('ad_reward', 5, null, 'Watch ad reward');
            return { success: true, amount: 5, balance: newBalance };
        },

        // --- 交易记录 ---
        _addTransaction(type, amount, gameId, note) {
            const txs = get(KEYS.TRANSACTIONS) || [];
            txs.unshift({
                type,
                amount,
                gameId,
                note,
                timestamp: new Date().toISOString()
            });
            // 只保留最近 50 条
            if (txs.length > 50) txs.length = 50;
            set(KEYS.TRANSACTIONS, txs);
        },

        getTransactions(limit = 20) {
            const txs = get(KEYS.TRANSACTIONS) || [];
            return txs.slice(0, limit);
        },

        // --- 调试用：加币 ---
        debugAddCoins(amount) {
            const current = this.getBalance();
            set(KEYS.BALANCE, current + amount);
            this._addTransaction('debug', amount, null, 'Debug add');
            return this.getBalance();
        }
    };

    // ==================== UI 控制器 ====================
    const TokenUI = {
        // 更新右上角余额显示
        updateBalanceDisplay() {
            const el = document.getElementById('tokenBalance');
            if (el) {
                el.textContent = TokenSystem.getBalance();
            }
        },

        // 余额跳动动画
        bounceBalance() {
            const el = document.getElementById('tokenBalance');
            if (el) {
                el.style.transform = 'scale(1.4)';
                el.style.color = '#fbbf24';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                    el.style.color = '';
                }, 300);
            }
        },

        // 显示签到弹窗
        showCheckInModal() {
            const modal = document.getElementById('checkInModal');
            if (modal) modal.classList.add('active');
        },

        hideCheckInModal() {
            const modal = document.getElementById('checkInModal');
            if (modal) modal.classList.remove('active');
        },

        // 显示投币弹窗
        showCoinDeductionModal(game, onConfirm, onCancel) {
            const modal = document.getElementById('coinDeductionModal');
            const title = document.getElementById('deductionGameName');
            const balance = document.getElementById('deductionBalance');
            const btn = document.getElementById('deductionConfirmBtn');
            const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
            const isZh = lang === 'zh';

            if (title) title.textContent = game.name;
            if (balance) balance.textContent = TokenSystem.getBalance();

            // 更新文案
            const sub = document.getElementById('deductionSub');
            if (sub) sub.textContent = isZh 
                ? '进入游戏需投币 🪙×1' 
                : 'Start game requires 🪙×1';
            if (btn) btn.textContent = isZh ? '确认投币' : 'Confirm';

            // 绑定事件（先清旧）
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                this.hideCoinDeductionModal();
                if (onConfirm) onConfirm();
            });

            const cancelBtn = document.getElementById('deductionCancelBtn');
            if (cancelBtn) {
                const newCancel = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
                newCancel.addEventListener('click', () => {
                    this.hideCoinDeductionModal();
                    if (onCancel) onCancel();
                });
            }

            if (modal) modal.classList.add('active');
        },

        hideCoinDeductionModal() {
            const modal = document.getElementById('coinDeductionModal');
            if (modal) modal.classList.remove('active');
        },

        // 显示余额不足弹窗
        showInsufficientModal(game) {
            const modal = document.getElementById('insufficientModal');
            const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
            const isZh = lang === 'zh';

            // 更新文案
            const title = document.getElementById('insufficientTitle');
            const sub = document.getElementById('insufficientSub');
            const watchBtn = document.getElementById('insufficientWatchBtn');
            const cancelBtn = document.getElementById('insufficientCancelBtn');

            if (title) title.textContent = isZh ? '余额不足' : 'Not Enough Coins';
            if (sub) sub.textContent = isZh 
                ? `🪙 余额为 0，无法进入 ${game.name}` 
                : `🪙 Balance is 0, cannot enter ${game.name}`;
            if (watchBtn) watchBtn.textContent = isZh ? '📺 看广告领 5 币' : '📺 Watch Ad (+5)';
            if (cancelBtn) cancelBtn.textContent = isZh ? '取消' : 'Cancel';

            // 看广告按钮
            if (watchBtn) {
                const newBtn = watchBtn.cloneNode(true);
                watchBtn.parentNode.replaceChild(newBtn, watchBtn);
                newBtn.addEventListener('click', () => {
                    this.hideInsufficientModal();
                    this.showAdWatching(game);
                });
            }

            // 取消按钮
            if (cancelBtn) {
                const newCancel = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
                newCancel.addEventListener('click', () => this.hideInsufficientModal());
            }

            if (modal) modal.classList.add('active');
        },

        hideInsufficientModal() {
            const modal = document.getElementById('insufficientModal');
            if (modal) modal.classList.remove('active');
        },

        // 显示广告观看中（模拟）
        showAdWatching(game) {
            const modal = document.getElementById('adWatchingModal');
            const bar = document.getElementById('adProgressBar');
            const text = document.getElementById('adProgressText');
            const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
            const isZh = lang === 'zh';

            if (text) text.textContent = isZh ? '广告播放中...' : 'Playing ad...';
            if (bar) bar.style.width = '0%';

            if (modal) modal.classList.add('active');

            // 模拟广告进度
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                if (bar) bar.style.width = progress + '%';
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        this.hideAdWatching();
                        const result = TokenSystem.watchAdReward();
                        this.updateBalanceDisplay();
                        this.bounceBalance();
                        
                        // 再次尝试进入游戏
                        if (result.balance >= 1) {
                            this.showCoinDeductionModal(game, () => {
                                const deduct = TokenSystem.deductCoin(game.id);
                                if (deduct.success) {
                                    this.updateBalanceDisplay();
                                    _doLaunchGame(game);
                                }
                            });
                        }
                    }, 200);
                }
            }, 100);
        },

        hideAdWatching() {
            const modal = document.getElementById('adWatchingModal');
            if (modal) modal.classList.remove('active');
        },

        // 金币中心
        showTokenCenter() {
            const modal = document.getElementById('tokenCenterModal');
            const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
            const isZh = lang === 'zh';

            // 更新标题
            const title = document.getElementById('tokenCenterTitle');
            if (title) title.textContent = isZh ? '🪙 金币中心' : '🪙 Coin Center';

            // 更新余额
            const bal = document.getElementById('tokenCenterBalance');
            if (bal) bal.textContent = TokenSystem.getBalance();

            // 更新总消耗
            const consumed = document.getElementById('tokenCenterConsumed');
            if (consumed) consumed.textContent = TokenSystem.getTotalConsumed();

            // 更新签到状态
            const checkinBtn = document.getElementById('tokenCenterCheckinBtn');
            const canCheckin = TokenSystem.canCheckIn();
            if (checkinBtn) {
                checkinBtn.textContent = canCheckin 
                    ? (isZh ? '✅ 每日签到 (+10)' : '✅ Daily Check-in (+10)')
                    : (isZh ? '✅ 今日已签到' : '✅ Checked in today');
                checkinBtn.disabled = !canCheckin;
                checkinBtn.style.opacity = canCheckin ? '1' : '0.5';

                // 重绑事件
                const newBtn = checkinBtn.cloneNode(true);
                checkinBtn.parentNode.replaceChild(newBtn, checkinBtn);
                newBtn.addEventListener('click', () => {
                    if (!TokenSystem.canCheckIn()) return;
                    const result = TokenSystem.dailyCheckIn();
                    if (result.success) {
                        this.updateBalanceDisplay();
                        this.bounceBalance();
                        // 刷新弹窗内容
                        this.showTokenCenter();
                        // 显示签到成功提示
                        const notice = document.getElementById('tokenCenterNotice');
                        if (notice) {
                            notice.textContent = isZh 
                                ? `🎉 签到成功！+${result.amount} 🪙` 
                                : `🎉 Check-in success! +${result.amount} 🪙`;
                            notice.style.display = 'block';
                            setTimeout(() => notice.style.display = 'none', 3000);
                        }
                    }
                });
            }

            // 看广告按钮
            const adBtn = document.getElementById('tokenCenterAdBtn');
            if (adBtn) {
                adBtn.textContent = isZh ? '📺 看广告 (+5)' : '📺 Watch Ad (+5)';
                const newAdBtn = adBtn.cloneNode(true);
                adBtn.parentNode.replaceChild(newAdBtn, adBtn);
                newAdBtn.addEventListener('click', () => {
                    this.hideTokenCenter();
                    this.showAdWatching({ id: 'token-center', name: 'Coin Center' });
                });
            }

            // 渲染交易记录
            const list = document.getElementById('tokenTransactionList');
            if (list) {
                const txs = TokenSystem.getTransactions(10);
                if (txs.length === 0) {
                    list.innerHTML = `<div class="token-tx-empty">${isZh ? '暂无记录' : 'No records yet'}</div>`;
                } else {
                    list.innerHTML = txs.map(tx => {
                        const time = new Date(tx.timestamp).toLocaleString();
                        let icon = '🪙';
                        let color = '#94a3b8';
                        if (tx.type === 'consume') { icon = '➖'; color = '#ef4444'; }
                        if (tx.type === 'checkin') { icon = '📅'; color = '#22c55e'; }
                        if (tx.type === 'ad_reward') { icon = '📺'; color = '#38bdf8'; }
                        if (tx.type === 'debug') { icon = '🐛'; color = '#a855f7'; }
                        
                        const typeLabel = isZh ? {
                            consume: '消耗', checkin: '签到', ad_reward: '广告', debug: '调试'
                        }[tx.type] || tx.type : tx.type;

                        return `
                            <div class="token-tx-item">
                                <span class="token-tx-icon" style="color:${color}">${icon}</span>
                                <div class="token-tx-info">
                                    <div class="token-tx-note">${tx.note || typeLabel}</div>
                                    <div class="token-tx-time">${time}</div>
                                </div>
                                <span class="token-tx-amount" style="color:${color}">${tx.amount > 0 ? '+' : ''}${tx.amount}</span>
                            </div>
                        `;
                    }).join('');
                }
            }

            // VIP 调试按钮（预留）
            const vipBtn = document.getElementById('tokenCenterVipBtn');
            if (vipBtn) {
                const isVip = TokenSystem.isVip();
                vipBtn.textContent = isVip 
                    ? (isZh ? '👑 VIP 已激活' : '👑 VIP Active')
                    : (isZh ? '👑 激活 VIP（调试）' : '👑 Activate VIP (Debug)');
                const newVipBtn = vipBtn.cloneNode(true);
                vipBtn.parentNode.replaceChild(newVipBtn, vipBtn);
                newVipBtn.addEventListener('click', () => {
                    TokenSystem.setVip(!isVip);
                    this.showTokenCenter();
                });
            }

            // 关闭按钮
            const closeBtn = document.getElementById('tokenCenterCloseBtn');
            if (closeBtn) {
                const newClose = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newClose, closeBtn);
                newClose.addEventListener('click', () => this.hideTokenCenter());
            }

            if (modal) modal.classList.add('active');
        },

        hideTokenCenter() {
            const modal = document.getElementById('tokenCenterModal');
            if (modal) modal.classList.remove('active');
        }
    };

    // ==================== 游戏启动拦截器 ====================
    // 保存原始 launchGame 的引用
    let _originalLaunchGame = null;

    function _doLaunchGame(game) {
        if (_originalLaunchGame) {
            _originalLaunchGame(game);
        }
    }

    function interceptLaunchGame() {
        if (typeof window.launchGame === 'function' && !_originalLaunchGame) {
            _originalLaunchGame = window.launchGame;
            
            window.launchGame = function(game) {
                // 未就绪游戏直接走原逻辑
                if (game.status !== 'ready') {
                    _originalLaunchGame(game);
                    return;
                }

                const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
                const isZh = lang === 'zh';

                // VIP 免扣
                if (TokenSystem.isVip()) {
                    _originalLaunchGame(game);
                    return;
                }

                const deduct = TokenSystem.deductCoin(game.id);
                
                if (deduct.success) {
                    TokenUI.updateBalanceDisplay();
                    _originalLaunchGame(game);
                } else if (deduct.error === 'INSUFFICIENT') {
                    // 余额不足 -> 显示引导
                    TokenUI.showInsufficientModal(game);
                }
            };
            console.log('[TokenSystem] launchGame intercepted');
        }
    }

    // ==================== 签到自动检测 ====================
    function autoCheckIn() {
        const canCheckin = TokenSystem.canCheckIn();
        if (canCheckin) {
            // 延迟一点弹出，等页面加载完
            setTimeout(() => {
                TokenUI.showCheckInModal();
            }, 1500);
        }
    }

    // ==================== 导出入口 ====================
    window.TokenSystem = TokenSystem;
    window.TokenUI = TokenUI;

    // 初始化钩子
    function init() {
        TokenSystem.initUser();
        TokenUI.updateBalanceDisplay();
        
        // 尝试拦截 launchGame（可能被覆盖，所以多次尝试）
        if (typeof window.launchGame === 'function') {
            interceptLaunchGame();
        } else {
            // 等页面脚本加载完
            const check = setInterval(() => {
                if (typeof window.launchGame === 'function') {
                    interceptLaunchGame();
                    clearInterval(check);
                }
            }, 200);
            setTimeout(() => clearInterval(check), 5000);
        }

        // 自动签到检测
        autoCheckIn();

        console.log('[TokenSystem] Initialized. Balance:', TokenSystem.getBalance());
    }

    // DOM 就绪后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
