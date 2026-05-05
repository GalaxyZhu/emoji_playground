/**
 * Token System - Emoji Arcade 虚拟代币系统
 * V2: 支持 Firebase Firestore 后端 + localStorage Fallback
 * 自动检测 Firebase 可用性，无缝切换后端
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

    // ==================== 底层存储（localStorage Fallback）====================
    function _lsGet(key) {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function _lsSet(key, value) {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    }

    function _todayStr() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    }

    function _nowStr() {
        return new Date().toISOString();
    }

    // ==================== 后端抽象层 ====================
    // localStorage 后端实现
    const _localBackend = {
        // --- 初始化 ---
        initUser() {
            const initialized = _lsGet(KEYS.USER_INITIALIZED);
            if (!initialized) {
                _lsSet(KEYS.BALANCE, 30);
                _lsSet(KEYS.LAST_CHECKIN, null);
                _lsSet(KEYS.TOTAL_CONSUMED, 0);
                _lsSet(KEYS.TRANSACTIONS, []);
                _lsSet(KEYS.IS_VIP, false);
                _lsSet(KEYS.USER_INITIALIZED, true);
                console.log('[TokenSystem] New user initialized with 30 coins (localStorage)');
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
            return _lsGet(KEYS.BALANCE) ?? 0;
        },

        getTotalConsumed() {
            return _lsGet(KEYS.TOTAL_CONSUMED) ?? 0;
        },

        isVip() {
            return _lsGet(KEYS.IS_VIP) === true;
        },

        setVip(vip) {
            _lsSet(KEYS.IS_VIP, vip === true);
        },

        // --- 扣币 ---
        deductCoin(gameId) {
            if (this.isVip()) {
                this._addTransaction('consume', 0, gameId, 'VIP free play');
                return { success: true, balance: this.getBalance(), vip: true };
            }

            const current = this.getBalance();
            if (current < 1) {
                return { success: false, balance: current, error: 'INSUFFICIENT' };
            }

            const newBalance = current - 1;
            const newConsumed = (_lsGet(KEYS.TOTAL_CONSUMED) ?? 0) + 1;
            
            _lsSet(KEYS.BALANCE, newBalance);
            _lsSet(KEYS.TOTAL_CONSUMED, newConsumed);
            this._addTransaction('consume', 1, gameId, `Play ${gameId}`);

            return { success: true, balance: newBalance };
        },

        // --- 签到 ---
        dailyCheckIn() {
            const today = _todayStr();
            const lastCheckin = _lsGet(KEYS.LAST_CHECKIN);
            
            if (lastCheckin === today) {
                return { success: false, alreadyCheckedIn: true, balance: this.getBalance() };
            }

            const current = this.getBalance();
            const newBalance = current + 10;
            
            _lsSet(KEYS.BALANCE, newBalance);
            _lsSet(KEYS.LAST_CHECKIN, today);
            this._addTransaction('checkin', 10, null, 'Daily check-in');

            return { success: true, amount: 10, balance: newBalance };
        },

        canCheckIn() {
            const today = _todayStr();
            const last = _lsGet(KEYS.LAST_CHECKIN);
            return last !== today;
        },

        // --- 看广告奖励 ---
        watchAdReward() {
            const current = this.getBalance();
            const newBalance = current + 5;
            _lsSet(KEYS.BALANCE, newBalance);
            this._addTransaction('ad_reward', 5, null, 'Watch ad reward');
            return { success: true, amount: 5, balance: newBalance };
        },

        // --- 交易记录 ---
        _addTransaction(type, amount, gameId, note) {
            const txs = _lsGet(KEYS.TRANSACTIONS) || [];
            txs.unshift({
                type,
                amount,
                gameId,
                note,
                timestamp: _nowStr()
            });
            if (txs.length > 50) txs.length = 50;
            _lsSet(KEYS.TRANSACTIONS, txs);
        },

        getTransactions(limit = 20) {
            const txs = _lsGet(KEYS.TRANSACTIONS) || [];
            return txs.slice(0, limit);
        },

        // --- 调试 ---
        debugAddCoins(amount) {
            const current = this.getBalance();
            _lsSet(KEYS.BALANCE, current + amount);
            this._addTransaction('debug', amount, null, 'Debug add');
            return this.getBalance();
        }
    };

    // Firebase 后端代理（动态绑定 FirebaseUser 方法）
    const _fbBackend = {
        initUser() { return window.FirebaseUser.initUser(); },
        resetUser() { window.FirebaseUser.resetUser(); },
        getBalance() { return window.FirebaseUser.getBalance(); },
        getTotalConsumed() { return window.FirebaseUser.getTotalConsumed(); },
        isVip() { return window.FirebaseUser.isVip(); },
        setVip(vip) { return window.FirebaseUser.setVip(vip); },
        deductCoin(gameId) { return window.FirebaseUser.deductCoin(gameId); },
        dailyCheckIn() { return window.FirebaseUser.dailyCheckIn(); },
        canCheckIn() { return window.FirebaseUser.canCheckIn(); },
        watchAdReward() { return window.FirebaseUser.watchAdReward(); },
        _addTransaction(type, amount, gameId, note) { return window.FirebaseUser._addTransaction(type, amount, gameId, note); },
        getTransactions(limit) { return window.FirebaseUser.getTransactions(limit); },
        debugAddCoins(amount) { return window.FirebaseUser.debugAddCoins(amount); }
    };

    // 当前激活的后端
    let _activeBackend = _localBackend;
    let _backendChecked = false;

    function _useFirebase() {
        return window.FirebaseUser && window.FirebaseUser.isReady();
    }

    function _switchBackend() {
        if (_useFirebase() && _activeBackend !== _fbBackend) {
            _activeBackend = _fbBackend;
            console.log('[TokenSystem] Switched to Firebase backend');
            TokenUI.updateBalanceDisplay();
        }
    }

    // 定期检查 Firebase 是否就绪
    function _startBackendPolling() {
        const check = setInterval(() => {
            if (_useFirebase()) {
                _switchBackend();
                clearInterval(check);
            }
        }, 500);
        setTimeout(() => clearInterval(check), 10000);
    }

    // ==================== 核心 API（代理到当前后端）====================
    const TokenSystem = {
        // 初始化
        async initUser() {
            _switchBackend();
            return await _activeBackend.initUser();
        },

        resetUser() {
            _activeBackend.resetUser();
        },

        // 余额查询（同步，因为 FirebaseUser 读缓存）
        getBalance() {
            _switchBackend();
            return _activeBackend.getBalance();
        },

        getTotalConsumed() {
            _switchBackend();
            return _activeBackend.getTotalConsumed();
        },

        isVip() {
            _switchBackend();
            return _activeBackend.isVip();
        },

        async setVip(vip) {
            _switchBackend();
            return await _activeBackend.setVip(vip);
        },

        // 扣币
        async deductCoin(gameId) {
            _switchBackend();
            return await _activeBackend.deductCoin(gameId);
        },

        // 签到
        async dailyCheckIn() {
            _switchBackend();
            return await _activeBackend.dailyCheckIn();
        },

        canCheckIn() {
            _switchBackend();
            return _activeBackend.canCheckIn();
        },

        // 看广告奖励
        async watchAdReward() {
            _switchBackend();
            return await _activeBackend.watchAdReward();
        },

        // 交易记录
        async _addTransaction(type, amount, gameId, note) {
            _switchBackend();
            return await _activeBackend._addTransaction(type, amount, gameId, note);
        },

        getTransactions(limit = 20) {
            _switchBackend();
            return _activeBackend.getTransactions(limit);
        },

        // 调试
        async debugAddCoins(amount) {
            _switchBackend();
            return await _activeBackend.debugAddCoins(amount);
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
            const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
            const isZh = lang === 'zh';

            const title = document.getElementById('checkinTitle');
            const reward = document.getElementById('checkinReward');
            const sub = document.getElementById('checkinSub');
            const btn = document.getElementById('checkinBtn');

            if (title) title.textContent = isZh ? '每日签到' : 'Daily Check-in';
            if (reward) reward.textContent = isZh ? '+10 🪙' : '+10 🪙';
            if (sub) sub.textContent = isZh ? '每天回来领取更多游戏币！' : 'Come back every day for more coins!';
            if (btn) btn.textContent = isZh ? '领取奖励' : 'Claim Reward';

            // 绑定签到按钮事件（覆盖旧的）
            if (btn) {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', async () => {
                    const result = await TokenSystem.dailyCheckIn();
                    if (result.success) {
                        this.hideCheckInModal();
                        this.updateBalanceDisplay();
                        this.bounceBalance();
                    }
                });
            }

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
                ? '进入游戏需投币 \ud83e\ude99\u00d71' 
                : 'Start game requires \ud83e\ude99\u00d71';
            if (btn) btn.textContent = isZh ? '确认投币' : 'Confirm';

            // 绑定事件（先清旧）
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', async () => {
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
                ? `\ud83e\ude99 余额为 0，无法进入 ${game.name}` 
                : `\ud83e\ude99 Balance is 0, cannot enter ${game.name}`;
            if (watchBtn) watchBtn.textContent = isZh ? '\ud83d\udcfa 看广告领 5 币' : '\ud83d\udcfa Watch Ad (+5)';
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
                    setTimeout(async () => {
                        this.hideAdWatching();
                        const result = await TokenSystem.watchAdReward();
                        this.updateBalanceDisplay();
                        this.bounceBalance();
                        
                        // 再次尝试进入游戏
                        if (result.balance >= 1) {
                            this.showCoinDeductionModal(game, () => {
                                _doLaunchGame(game);
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

        // 我的游戏币
        async showTokenCenter() {
            const modal = document.getElementById('tokenCenterModal');
            const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
            const isZh = lang === 'zh';

            // 更新标题
            const title = document.getElementById('tokenCenterTitle');
            if (title) title.textContent = isZh ? '\ud83e\ude99 我的游戏币' : '\ud83e\ude99 My Coins';

            // 更新余额
            const bal = document.getElementById('tokenCenterBalance');
            if (bal) bal.textContent = TokenSystem.getBalance();

            // 更新总消耗
            const consumed = document.getElementById('tokenCenterConsumed');
            if (consumed) consumed.textContent = TokenSystem.getTotalConsumed();

            // 更新标签（i18n）
            const balanceLabel = document.getElementById('tokenCenterBalanceLabel');
            const spentLabel = document.getElementById('tokenCenterSpentLabel');
            const txTitle = document.getElementById('tokenCenterTxTitle');
            if (balanceLabel) balanceLabel.textContent = isZh ? '余额' : 'Balance';
            if (spentLabel) spentLabel.textContent = isZh ? '总消耗' : 'Total Spent';
            if (txTitle) txTitle.textContent = isZh ? '最近交易' : 'Recent Transactions';

            // 更新签到状态
            const checkinBtn = document.getElementById('tokenCenterCheckinBtn');
            const canCheckin = TokenSystem.canCheckIn();
            if (checkinBtn) {
                checkinBtn.textContent = canCheckin 
                    ? (isZh ? '\u2705 每日签到 (+10)' : '\u2705 Daily Check-in (+10)')
                    : (isZh ? '\u2705 今日已签到' : '\u2705 Checked in today');
                checkinBtn.disabled = !canCheckin;
                checkinBtn.style.opacity = canCheckin ? '1' : '0.5';

                // 重绑事件
                const newBtn = checkinBtn.cloneNode(true);
                checkinBtn.parentNode.replaceChild(newBtn, checkinBtn);
                newBtn.addEventListener('click', async () => {
                    if (!TokenSystem.canCheckIn()) return;
                    const result = await TokenSystem.dailyCheckIn();
                    if (result.success) {
                        this.updateBalanceDisplay();
                        this.bounceBalance();
                        // 刷新弹窗内容
                        this.showTokenCenter();
                        // 显示签到成功提示
                        const notice = document.getElementById('tokenCenterNotice');
                        if (notice) {
                            notice.textContent = isZh 
                                ? `\ud83c\udf89 签到成功！+${result.amount} \ud83e\ude99` 
                                : `\ud83c\udf89 Check-in success! +${result.amount} \ud83e\ude99`;
                            notice.style.display = 'block';
                            setTimeout(() => notice.style.display = 'none', 3000);
                        }
                    }
                });
            }

            // 看广告按钮
            const adBtn = document.getElementById('tokenCenterAdBtn');
            if (adBtn) {
                adBtn.textContent = isZh ? '\ud83d\udcfa 看广告 (+5)' : '\ud83d\udcfa Watch Ad (+5)';
                const newAdBtn = adBtn.cloneNode(true);
                adBtn.parentNode.replaceChild(newAdBtn, adBtn);
                newAdBtn.addEventListener('click', () => {
                    this.hideTokenCenter();
                    this.showAdWatching({ id: 'token-center', name: 'My Coins' });
                });
            }

            // 渲染交易记录
            const list = document.getElementById('tokenTransactionList');
            if (list) {
                const txs = TokenSystem.getTransactions(10);
                if (txs.length === 0) {
                    list.innerHTML = `<div class="token-tx-empty">${isZh ? '\u6682\u65e0\u8bb0\u5f55' : 'No records yet'}</div>`;
                } else {
                    list.innerHTML = txs.map(tx => {
                        const time = new Date(tx.timestamp).toLocaleString();
                        let icon = '\ud83e\ude99';
                        let color = '#94a3b8';
                        if (tx.type === 'consume') { icon = '\u2796'; color = '#ef4444'; }
                        if (tx.type === 'checkin') { icon = '\ud83d\udcc5'; color = '#22c55e'; }
                        if (tx.type === 'ad_reward') { icon = '\ud83d\udcfa'; color = '#38bdf8'; }
                        if (tx.type === 'debug') { icon = '\ud83d\udc1b'; color = '#a855f7'; }
                        
                        const typeLabel = isZh ? {
                            consume: '\u6d88\u8017', checkin: '\u7b7e\u5230', ad_reward: '\u5e7f\u544a', debug: '\u8c03\u8bd5'
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
                    ? (isZh ? '\ud83d\udc51 VIP \u5df2\u6fc0\u6d3b' : '\ud83d\udc51 VIP Active')
                    : (isZh ? '\ud83d\udc51 \u6fc0\u6d3b VIP\uff08\u8c03\u8bd5\uff09' : '\ud83d\udc51 Activate VIP (Debug)');
                const newVipBtn = vipBtn.cloneNode(true);
                vipBtn.parentNode.replaceChild(newVipBtn, vipBtn);
                newVipBtn.addEventListener('click', async () => {
                    await TokenSystem.setVip(!isVip);
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
            
            window.launchGame = async function(game) {
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

                const deduct = await TokenSystem.deductCoin(game.id);
                
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
    async function init() {
        await TokenSystem.initUser();
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

        // 启动后端轮询（检测 Firebase 切换）
        _startBackendPolling();

        console.log('[TokenSystem] Initialized. Balance:', TokenSystem.getBalance());
    }

    // DOM 就绪后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
