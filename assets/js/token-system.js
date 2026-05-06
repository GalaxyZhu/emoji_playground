/**
 * Token System - Emoji Arcade 虚拟代币系统
 * V3: 区分游客(guest)和会员(member)
 *   - 游客: 初始5币, 每日最多玩3次, 签到+5币, 看广告+3币
 *   - 会员: 初始30币, 无次数限制, 签到+10币, 看广告+5币
 *   - 支持 Firebase Firestore 后端 + localStorage Fallback
 */
(function() {
    'use strict';

    const STORAGE_PREFIX = 'emoji_arcade_token_';
    const GUEST_PREFIX = 'emoji_arcade_guest_';

    const KEYS = {
        BALANCE: 'balance',
        LAST_CHECKIN: 'last_checkin',
        TOTAL_CONSUMED: 'total_consumed',
        TRANSACTIONS: 'transactions',
        IS_VIP: 'is_vip',
        USER_INITIALIZED: 'user_initialized',
        // 游客专属
        TODAY_PLAYS: 'today_plays',
        TODAY_PLAYS_DATE: 'today_plays_date',
        IS_GUEST: 'is_guest'
    };

    // 游客/会员配置
    const GUEST = {
        INITIAL_BALANCE: 10,      // 一次性给够，用完提示登录
        MAX_PLAYS_PER_DAY: 10,    // 10个币 = 10次游戏
        CHECKIN_REWARD: 0,        // 游客无签到奖励
        AD_REWARD: 3              // 游客看广告仍可赚币
    };

    const MEMBER = {
        INITIAL_BALANCE: 30,
        CHECKIN_REWARD: 10,
        AD_REWARD: 5
    };

    // ==================== 底层存储 ====================
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

    // 检测当前身份
    function _isGuest() {
        // 未登录 = 游客（检测 FirebaseUser 是否已登录）
        if (window.FirebaseUser && window.FirebaseUser.isLoggedIn && window.FirebaseUser.isLoggedIn()) {
            return false;
        }
        // 兜底：localStorage 标记
        return _lsGet(KEYS.IS_GUEST) !== false;
    }

    function _getConfig() {
        return _isGuest() ? GUEST : MEMBER;
    }

    // ==================== localStorage 后端 ====================
    const _localBackend = {
        initUser() {
            const initialized = _lsGet(KEYS.USER_INITIALIZED);
            const isGuest = _isGuest();
            const cfg = isGuest ? GUEST : MEMBER;

            if (!initialized) {
                _lsSet(KEYS.BALANCE, cfg.INITIAL_BALANCE);
                _lsSet(KEYS.LAST_CHECKIN, null);
                _lsSet(KEYS.TOTAL_CONSUMED, 0);
                _lsSet(KEYS.TRANSACTIONS, []);
                _lsSet(KEYS.IS_VIP, false);
                _lsSet(KEYS.IS_GUEST, isGuest);
                _lsSet(KEYS.TODAY_PLAYS, 0);
                _lsSet(KEYS.TODAY_PLAYS_DATE, _todayStr());
                _lsSet(KEYS.USER_INITIALIZED, true);
                console.log(`[TokenSystem] New ${isGuest ? 'guest' : 'member'} initialized with ${cfg.INITIAL_BALANCE} coins (localStorage)`);
                return { isNew: true, balance: cfg.INITIAL_BALANCE, isGuest };
            }

            // 如果身份变了（游客→会员），重新初始化给30币
            const wasGuest = _lsGet(KEYS.IS_GUEST);
            if (wasGuest === true && !isGuest) {
                // 升级到会员：保留余额，如果低于30则补足到30
                const currentBal = _lsGet(KEYS.BALANCE) ?? 0;
                const newBal = Math.max(currentBal, MEMBER.INITIAL_BALANCE);
                _lsSet(KEYS.BALANCE, newBal);
                _lsSet(KEYS.IS_GUEST, false);
                _lsSet(KEYS.TODAY_PLAYS, 0);
                console.log(`[TokenSystem] Guest upgraded to member, balance set to ${newBal}`);
                return { isNew: false, balance: newBal, isGuest: false, upgraded: true };
            }

            console.log('[TokenSystem] Existing user, balance:', this.getBalance(), 'guest:', isGuest);
            return { isNew: false, balance: this.getBalance(), isGuest };
        },

        resetUser() {
            Object.values(KEYS).forEach(k => {
                localStorage.removeItem(STORAGE_PREFIX + k);
            });
        },

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

        // 获取今日游戏次数（自动重置）
        _getTodayPlays() {
            const date = _lsGet(KEYS.TODAY_PLAYS_DATE);
            const today = _todayStr();
            if (date !== today) {
                _lsSet(KEYS.TODAY_PLAYS, 0);
                _lsSet(KEYS.TODAY_PLAYS_DATE, today);
                return 0;
            }
            return _lsGet(KEYS.TODAY_PLAYS) ?? 0;
        },

        _incrementPlay() {
            const count = this._getTodayPlays();
            _lsSet(KEYS.TODAY_PLAYS, count + 1);
        },

        deductCoin(gameId) {
            const isGuest = _isGuest();

            // VIP 免扣
            if (this.isVip()) {
                this._addTransaction('consume', 0, gameId, 'VIP free play');
                return { success: true, balance: this.getBalance(), vip: true };
            }

            // 游客限制：每日最多3次
            if (isGuest) {
                const plays = this._getTodayPlays();
                if (plays >= GUEST.MAX_PLAYS_PER_DAY) {
                    return { success: false, balance: this.getBalance(), error: 'GUEST_LIMIT',
                             message: '游客每日最多玩3次，登录后可无限畅玩！' };
                }
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

            // 如果是游客，记录今日次数
            if (isGuest) {
                this._incrementPlay();
            }

            return { success: true, balance: newBalance };
        },

        dailyCheckIn() {
            const today = _todayStr();
            const lastCheckin = _lsGet(KEYS.LAST_CHECKIN);
            const isGuest = _isGuest();

            // 游客无签到奖励
            if (isGuest) {
                const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
                const isZh = lang === 'zh';
                return {
                    success: false,
                    alreadyCheckedIn: false,
                    balance: this.getBalance(),
                    error: 'GUEST_NO_CHECKIN',
                    message: isZh
                        ? '游客无法签到，登录后可每日领取 10 币！'
                        : 'Guests cannot check in. Login for daily 10 coins!'
                };
            }

            const reward = MEMBER.CHECKIN_REWARD;

            if (lastCheckin === today) {
                return { success: false, alreadyCheckedIn: true, balance: this.getBalance() };
            }

            const current = this.getBalance();
            const newBalance = current + reward;

            _lsSet(KEYS.BALANCE, newBalance);
            _lsSet(KEYS.LAST_CHECKIN, today);
            this._addTransaction('checkin', reward, null, 'Daily check-in');

            return { success: true, amount: reward, balance: newBalance };
        },

        canCheckIn() {
            const today = _todayStr();
            const last = _lsGet(KEYS.LAST_CHECKIN);
            return last !== today;
        },

        watchAdReward() {
            const isGuest = _isGuest();
            const reward = isGuest ? GUEST.AD_REWARD : MEMBER.AD_REWARD;
            const current = this.getBalance();
            const newBalance = current + reward;
            _lsSet(KEYS.BALANCE, newBalance);
            this._addTransaction('ad_reward', reward, null, 'Watch ad reward');
            return { success: true, amount: reward, balance: newBalance };
        },

        _addTransaction(type, amount, gameId, note) {
            const txs = _lsGet(KEYS.TRANSACTIONS) || [];
            txs.unshift({ type, amount, gameId, note, timestamp: _nowStr() });
            if (txs.length > 50) txs.length = 50;
            _lsSet(KEYS.TRANSACTIONS, txs);
        },

        getTransactions(limit = 20) {
            const txs = _lsGet(KEYS.TRANSACTIONS) || [];
            return txs.slice(0, limit);
        },

        debugAddCoins(amount) {
            const current = this.getBalance();
            _lsSet(KEYS.BALANCE, current + amount);
            this._addTransaction('debug', amount, null, 'Debug add');
            return this.getBalance();
        }
    };

    // ==================== Firebase 后端代理 ====================
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

    let _activeBackend = _localBackend;
    let _backendChecked = false;

    function _useFirebase() {
        return window.FirebaseUser && window.FirebaseUser.isReady && window.FirebaseUser.isReady();
    }

    function _switchBackend() {
        if (_useFirebase() && _activeBackend !== _fbBackend) {
            _activeBackend = _fbBackend;
            console.log('[TokenSystem] Switched to Firebase backend');
            TokenUI.updateBalanceDisplay();
        }
    }

    function _startBackendPolling() {
        const check = setInterval(() => {
            if (_useFirebase()) {
                _switchBackend();
                clearInterval(check);
            }
        }, 500);
        setTimeout(() => clearInterval(check), 10000);
    }

    // ==================== 核心 API ====================
    const TokenSystem = {
        async initUser() {
            _switchBackend();
            return await _activeBackend.initUser();
        },

        resetUser() {
            _activeBackend.resetUser();
        },

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

        isGuest() {
            return _isGuest();
        },

        getGuestRemainingPlays() {
            if (!_isGuest()) return Infinity;
            const plays = _localBackend._getTodayPlays();
            return Math.max(0, GUEST.MAX_PLAYS_PER_DAY - plays);
        },

        async deductCoin(gameId) {
            _switchBackend();
            return await _activeBackend.deductCoin(gameId);
        },

        async dailyCheckIn() {
            _switchBackend();
            return await _activeBackend.dailyCheckIn();
        },

        canCheckIn() {
            _switchBackend();
            return _activeBackend.canCheckIn();
        },

        async watchAdReward() {
            _switchBackend();
            return await _activeBackend.watchAdReward();
        },

        async _addTransaction(type, amount, gameId, note) {
            _switchBackend();
            return await _activeBackend._addTransaction(type, amount, gameId, note);
        },

        getTransactions(limit = 20) {
            _switchBackend();
            return _activeBackend.getTransactions(limit);
        },

        async debugAddCoins(amount) {
            _switchBackend();
            return await _activeBackend.debugAddCoins(amount);
        }
    };

    // ==================== UI 控制器 ====================
    const TokenUI = {
        updateBalanceDisplay() {
            const el = document.getElementById('tokenBalance');
            if (el) {
                el.textContent = TokenSystem.getBalance();
            }
        },

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

        showCheckInModal() {
            const modal = document.getElementById('checkInModal');
            const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
            const isZh = lang === 'zh';
            const isGuest = TokenSystem.isGuest();
            const reward = isGuest ? GUEST.CHECKIN_REWARD : MEMBER.CHECKIN_REWARD;

            const title = document.getElementById('checkinTitle');
            const rewardEl = document.getElementById('checkinReward');
            const sub = document.getElementById('checkinSub');
            const btn = document.getElementById('checkinBtn');

            if (title) title.textContent = isZh ? '每日签到' : 'Daily Check-in';
            if (rewardEl) rewardEl.textContent = `+${reward} 🪙`;
            if (sub) {
                if (isGuest && isZh) {
                    sub.textContent = '👤 游客无法签到，登录后可每日领取 10 🪙！';
                } else if (isGuest) {
                    sub.textContent = '👤 Guests cannot check in. Login for daily 10 🪙!';
                } else {
                    sub.textContent = isZh ? '每天回来领取更多游戏币！' : 'Come back every day for more coins!';
                }
            }
            if (btn) btn.textContent = isZh ? '领取奖励' : 'Claim Reward';

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

        showCoinDeductionModal(game, onConfirm, onCancel) {
            const modal = document.getElementById('coinDeductionModal');
            const title = document.getElementById('deductionGameName');
            const balance = document.getElementById('deductionBalance');
            const btn = document.getElementById('deductionConfirmBtn');
            const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
            const isZh = lang === 'zh';
            const isGuest = TokenSystem.isGuest();
            const remaining = TokenSystem.getGuestRemainingPlays();

            if (title) title.textContent = game.name;
            if (balance) balance.textContent = TokenSystem.getBalance();

            const sub = document.getElementById('deductionSub');
            if (sub) {
                if (isGuest && isZh) {
                    sub.textContent = `进入游戏需投币 🪙×1（今日还剩 ${remaining} 次，登录后无限）`;
                } else if (isGuest) {
                    sub.textContent = `Start game requires 🪙×1 (${remaining} plays left today, unlimited after login)`;
                } else {
                    sub.textContent = isZh ? '进入游戏需投币 🪙×1' : 'Start game requires 🪙×1';
                }
            }
            if (btn) btn.textContent = isZh ? '确认投币' : 'Confirm';

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

        showInsufficientModal(game) {
            const modal = document.getElementById('insufficientModal');
            const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
            const isZh = lang === 'zh';
            const isGuest = TokenSystem.isGuest();

            const title = document.getElementById('insufficientTitle');
            const sub = document.getElementById('insufficientSub');
            const watchBtn = document.getElementById('insufficientWatchBtn');
            const cancelBtn = document.getElementById('insufficientCancelBtn');

            if (title) title.textContent = isZh ? '余额不足' : 'Not Enough Coins';
            if (sub) {
                if (isGuest && isZh) {
                    sub.textContent = `🪙 余额为 0，游客每日限玩 ${GUEST.MAX_PLAYS_PER_DAY} 次。看广告或登录可获更多！`;
                } else if (isGuest) {
                    sub.textContent = `🪙 Balance is 0. Guests limited to ${GUEST.MAX_PLAYS_PER_DAY} plays/day. Watch ad or login for more!`;
                } else {
                    sub.textContent = isZh ? `🪙 余额为 0，无法进入 ${game.name}` : `🪙 Balance is 0, cannot enter ${game.name}`;
                }
            }
            if (watchBtn) watchBtn.textContent = isZh ? `📺 看广告领 ${GUEST.AD_REWARD} 币` : `📺 Watch Ad (+${GUEST.AD_REWARD})`;
            if (cancelBtn) cancelBtn.textContent = isZh ? '取消' : 'Cancel';

            if (watchBtn) {
                const newBtn = watchBtn.cloneNode(true);
                watchBtn.parentNode.replaceChild(newBtn, watchBtn);
                newBtn.addEventListener('click', () => {
                    this.hideInsufficientModal();
                    this.showAdWatching(game);
                });
            }

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

        showAdWatching(game) {
            const modal = document.getElementById('adWatchingModal');
            const bar = document.getElementById('adProgressBar');
            const text = document.getElementById('adProgressText');
            const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
            const isZh = lang === 'zh';

            if (text) text.textContent = isZh ? '广告播放中...' : 'Playing ad...';
            if (bar) bar.style.width = '0%';
            if (modal) modal.classList.add('active');

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

        async showTokenCenter() {
            const modal = document.getElementById('tokenCenterModal');
            const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
            const isZh = lang === 'zh';
            const isGuest = TokenSystem.isGuest();
            const cfg = isGuest ? GUEST : MEMBER;

            const title = document.getElementById('tokenCenterTitle');
            if (title) title.textContent = isZh ? '🪙 我的游戏币' : '🪙 My Coins';

            const bal = document.getElementById('tokenCenterBalance');
            if (bal) bal.textContent = TokenSystem.getBalance();

            const consumed = document.getElementById('tokenCenterConsumed');
            if (consumed) consumed.textContent = TokenSystem.getTotalConsumed();

            const balanceLabel = document.getElementById('tokenCenterBalanceLabel');
            const spentLabel = document.getElementById('tokenCenterSpentLabel');
            const txTitle = document.getElementById('tokenCenterTxTitle');
            if (balanceLabel) balanceLabel.textContent = isZh ? '余额' : 'Balance';
            if (spentLabel) spentLabel.textContent = isZh ? '总消耗' : 'Total Spent';
            if (txTitle) txTitle.textContent = isZh ? '最近交易' : 'Recent Transactions';

            // 游客提示
            const guestNotice = document.getElementById('tokenCenterGuestNotice');
            if (guestNotice) {
                if (isGuest && isZh) {
                    guestNotice.innerHTML = `👤 <b>游客模式</b> · 每日限玩 ${GUEST.MAX_PLAYS_PER_DAY} 次 · <a href="#" onclick="window.dispatchEvent(new CustomEvent('requestLogin')); return false;" style="color:#38bdf8;text-decoration:underline;">登录</a> 解锁无限`;
                    guestNotice.style.display = 'block';
                } else if (isGuest) {
                    guestNotice.innerHTML = `👤 <b>Guest Mode</b> · ${GUEST.MAX_PLAYS_PER_DAY} plays/day · <a href="#" onclick="window.dispatchEvent(new CustomEvent('requestLogin')); return false;" style="color:#38bdf8;text-decoration:underline;">Login</a> for unlimited`;
                    guestNotice.style.display = 'block';
                } else {
                    guestNotice.style.display = 'none';
                }
            }

            // 签到按钮
            const checkinBtn = document.getElementById('tokenCenterCheckinBtn');
            const canCheckin = TokenSystem.canCheckIn();
            if (checkinBtn) {
                const reward = cfg.CHECKIN_REWARD;
                checkinBtn.textContent = canCheckin
                    ? (isZh ? `✅ 每日签到 (+${reward})` : `✅ Daily Check-in (+${reward})`)
                    : (isZh ? '✅ 今日已签到' : '✅ Checked in today');
                checkinBtn.disabled = !canCheckin;
                checkinBtn.style.opacity = canCheckin ? '1' : '0.5';

                const newBtn = checkinBtn.cloneNode(true);
                checkinBtn.parentNode.replaceChild(newBtn, checkinBtn);
                newBtn.addEventListener('click', async () => {
                    if (!TokenSystem.canCheckIn()) return;
                    const result = await TokenSystem.dailyCheckIn();
                    if (result.success) {
                        this.updateBalanceDisplay();
                        this.bounceBalance();
                        this.showTokenCenter();
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
                adBtn.textContent = isZh ? `📺 看广告 (+${cfg.AD_REWARD})` : `📺 Watch Ad (+${cfg.AD_REWARD})`;
                const newAdBtn = adBtn.cloneNode(true);
                adBtn.parentNode.replaceChild(newAdBtn, adBtn);
                newAdBtn.addEventListener('click', () => {
                    this.hideTokenCenter();
                    this.showAdWatching({ id: 'token-center', name: 'My Coins' });
                });
            }

            // 交易记录
            const list = document.getElementById('tokenTransactionList');
            if (list) {
                const txs = TokenSystem.getTransactions(10);
                if (txs.length === 0) {
                    list.innerHTML = `<div class="token-tx-empty">${isZh ? '暂无记录' : 'No records yet'}</div>`;
                } else {
                    list.innerHTML = txs.map(tx => {
                        const time = new Date(tx.timestamp).toLocaleString();
                        let icon = '🪙', color = '#94a3b8';
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

            // VIP 调试按钮
            const vipBtn = document.getElementById('tokenCenterVipBtn');
            if (vipBtn) {
                const isVip = TokenSystem.isVip();
                vipBtn.textContent = isVip
                    ? (isZh ? '👑 VIP 已激活' : '👑 VIP Active')
                    : (isZh ? '👑 激活 VIP（调试）' : '👑 Activate VIP (Debug)');
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
                if (game.status !== 'ready') {
                    _originalLaunchGame(game);
                    return;
                }

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
                    TokenUI.showInsufficientModal(game);
                } else if (deduct.error === 'GUEST_LIMIT') {
                    // 游客次数用完：提示登录
                    const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';
                    const isZh = lang === 'zh';
                    alert(isZh
                        ? `👤 游客每日最多玩 ${GUEST.MAX_PLAYS_PER_DAY} 次\n登录后可无限畅玩！`
                        : `👤 Guests limited to ${GUEST.MAX_PLAYS_PER_DAY} plays/day\nLogin for unlimited access!`);
                }
            };
            console.log('[TokenSystem] launchGame intercepted');
        }
    }

    // ==================== 签到自动检测 ====================
    function autoCheckIn() {
        const canCheckin = TokenSystem.canCheckIn();
        if (canCheckin) {
            setTimeout(() => {
                TokenUI.showCheckInModal();
            }, 1500);
        }
    }

    // ==================== 导出入口 ====================
    window.TokenSystem = TokenSystem;
    window.TokenUI = TokenUI;
    window.GUEST_CONFIG = GUEST;
    window.MEMBER_CONFIG = MEMBER;

    // 初始化钩子
    async function init() {
        await TokenSystem.initUser();
        TokenUI.updateBalanceDisplay();

        if (typeof window.launchGame === 'function') {
            interceptLaunchGame();
        } else {
            const check = setInterval(() => {
                if (typeof window.launchGame === 'function') {
                    interceptLaunchGame();
                    clearInterval(check);
                }
            }, 200);
            setTimeout(() => clearInterval(check), 5000);
        }

        autoCheckIn();
        _startBackendPolling();

        console.log('[TokenSystem] Initialized. Guest:', TokenSystem.isGuest(), 'Balance:', TokenSystem.getBalance());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();