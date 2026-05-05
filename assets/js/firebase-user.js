/**
 * Firebase User Data Layer
 * Emoji Arcade - Firestore 后端数据层
 * 保持与 TokenSystem 相同的 API，供 token-system.js 调用
 */
(function() {
    'use strict';

    const DB_PATH = 'users';
    const MAX_TRANSACTIONS = 50;

    let db = null;
    let currentUser = null;
    let userDocRef = null;
    let isReady = false;
    let localCache = null; // 本地缓存，减少 Firestore 读取

    // ==================== 初始化 ====================
    async function init() {
        try {
            // Firebase SDK 应该已通过 CDN 加载
            if (typeof firebase === 'undefined') {
                console.warn('[FirebaseUser] Firebase SDK not loaded');
                return false;
            }

            // 使用全局 firebaseConfig（由 firebase-config.js 设置）
            const config = window.firebaseConfig || {};
            if (!config.apiKey) {
                console.warn('[FirebaseUser] firebaseConfig missing');
                return false;
            }

            // 初始化 Firebase App（如果还没初始化）
            if (!firebase.apps.length) {
                firebase.initializeApp(config);
            }

            // 获取 Auth 和 Firestore 实例
            const auth = firebase.auth();
            db = firebase.firestore();

            // 匿名登录
            await auth.signInAnonymously();

            auth.onAuthStateChanged((user) => {
                if (user) {
                    currentUser = user;
                    userDocRef = db.collection(DB_PATH).doc(user.uid);
                    _initUserDoc().then(() => {
                        isReady = true;
                        console.log('[FirebaseUser] Ready. UID:', user.uid);
                    });
                } else {
                    console.warn('[FirebaseUser] Auth state: no user');
                }
            });

            return true;
        } catch (e) {
            console.error('[FirebaseUser] Init failed:', e);
            return false;
        }
    }

    // 初始化用户文档（如果不存在）
    async function _initUserDoc() {
        try {
            const doc = await userDocRef.get();
            if (!doc.exists) {
                const defaultData = {
                    balance: 30,
                    lastCheckIn: null,
                    totalConsumed: 0,
                    isVip: false,
                    transactions: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await userDocRef.set(defaultData);
                localCache = { ...defaultData };
                console.log('[FirebaseUser] New user doc created with 30 coins');
            } else {
                localCache = doc.data();
                console.log('[FirebaseUser] Existing user, balance:', localCache.balance);
            }
        } catch (e) {
            console.error('[FirebaseUser] _initUserDoc error:', e);
        }
    }

    // 刷新缓存
    async function _refreshCache() {
        if (!userDocRef) return false;
        try {
            const doc = await userDocRef.get();
            if (doc.exists) {
                localCache = doc.data();
                return true;
            }
        } catch (e) {
            console.error('[FirebaseUser] _refreshCache error:', e);
        }
        return false;
    }

    function _todayStr() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    }

    function _nowStr() {
        return new Date().toISOString();
    }

    // ==================== 核心 API ====================
    const FirebaseUser = {
        isReady() { return isReady; },

        // --- 初始化 ---
        async initUser() {
            if (!isReady) {
                // 等待初始化完成
                let waited = 0;
                while (!isReady && waited < 5000) {
                    await new Promise(r => setTimeout(r, 100));
                    waited += 100;
                }
            }
            if (!isReady || !localCache) {
                return { isNew: true, balance: 30 };
            }
            const isNew = !localCache.lastCheckIn && localCache.totalConsumed === 0;
            return { isNew, balance: localCache.balance ?? 0 };
        },

        resetUser() {
            if (!userDocRef) return;
            userDocRef.delete().catch(() => {});
            localCache = null;
        },

        // --- 余额查询 ---
        getBalance() {
            return localCache?.balance ?? 0;
        },

        getTotalConsumed() {
            return localCache?.totalConsumed ?? 0;
        },

        isVip() {
            return localCache?.isVip === true;
        },

        async setVip(vip) {
            if (!userDocRef) return false;
            try {
                await userDocRef.update({
                    isVip: vip === true,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                if (localCache) localCache.isVip = vip === true;
                return true;
            } catch (e) {
                console.error('[FirebaseUser] setVip error:', e);
                return false;
            }
        },

        // --- 扣币（游戏入口）---
        async deductCoin(gameId) {
            if (this.isVip()) {
                await this._addTransaction('consume', 0, gameId, 'VIP free play');
                return { success: true, balance: this.getBalance(), vip: true };
            }

            const current = this.getBalance();
            if (current < 1) {
                return { success: false, balance: current, error: 'INSUFFICIENT' };
            }

            // Firestore 事务：原子扣币
            if (!userDocRef) {
                return { success: false, balance: current, error: 'NOT_READY' };
            }

            try {
                await db.runTransaction(async (transaction) => {
                    const doc = await transaction.get(userDocRef);
                    if (!doc.exists) throw new Error('User doc not found');

                    const data = doc.data();
                    if ((data.balance ?? 0) < 1) {
                        throw new Error('INSUFFICIENT');
                    }

                    const newBalance = (data.balance ?? 0) - 1;
                    const newConsumed = (data.totalConsumed ?? 0) + 1;
                    const tx = {
                        type: 'consume',
                        amount: 1,
                        gameId,
                        note: `Play ${gameId}`,
                        timestamp: _nowStr()
                    };
                    let txs = data.transactions || [];
                    txs.unshift(tx);
                    if (txs.length > MAX_TRANSACTIONS) txs.length = MAX_TRANSACTIONS;

                    transaction.update(userDocRef, {
                        balance: newBalance,
                        totalConsumed: newConsumed,
                        transactions: txs,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });

                // 刷新缓存
                await _refreshCache();
                return { success: true, balance: this.getBalance() };
            } catch (e) {
                if (e.message === 'INSUFFICIENT') {
                    return { success: false, balance: this.getBalance(), error: 'INSUFFICIENT' };
                }
                console.error('[FirebaseUser] deductCoin transaction error:', e);
                return { success: false, balance: this.getBalance(), error: 'TRANSACTION_FAILED' };
            }
        },

        // --- 签到 ---
        async dailyCheckIn() {
            const today = _todayStr();
            const lastCheckin = localCache?.lastCheckIn;

            if (lastCheckin === today) {
                return { success: false, alreadyCheckedIn: true, balance: this.getBalance() };
            }

            if (!userDocRef) {
                return { success: false, balance: this.getBalance(), error: 'NOT_READY' };
            }

            try {
                await db.runTransaction(async (transaction) => {
                    const doc = await transaction.get(userDocRef);
                    if (!doc.exists) throw new Error('User doc not found');

                    const data = doc.data();
                    if (data.lastCheckIn === today) {
                        throw new Error('ALREADY_CHECKED_IN');
                    }

                    const newBalance = (data.balance ?? 0) + 10;
                    const tx = {
                        type: 'checkin',
                        amount: 10,
                        gameId: null,
                        note: 'Daily check-in',
                        timestamp: _nowStr()
                    };
                    let txs = data.transactions || [];
                    txs.unshift(tx);
                    if (txs.length > MAX_TRANSACTIONS) txs.length = MAX_TRANSACTIONS;

                    transaction.update(userDocRef, {
                        balance: newBalance,
                        lastCheckIn: today,
                        transactions: txs,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });

                await _refreshCache();
                return { success: true, amount: 10, balance: this.getBalance() };
            } catch (e) {
                if (e.message === 'ALREADY_CHECKED_IN') {
                    return { success: false, alreadyCheckedIn: true, balance: this.getBalance() };
                }
                console.error('[FirebaseUser] dailyCheckIn error:', e);
                return { success: false, balance: this.getBalance(), error: 'TRANSACTION_FAILED' };
            }
        },

        canCheckIn() {
            const today = _todayStr();
            const last = localCache?.lastCheckIn;
            return last !== today;
        },

        // --- 看广告奖励 ---
        async watchAdReward() {
            if (!userDocRef) {
                return { success: false, balance: this.getBalance(), error: 'NOT_READY' };
            }

            try {
                await db.runTransaction(async (transaction) => {
                    const doc = await transaction.get(userDocRef);
                    if (!doc.exists) throw new Error('User doc not found');

                    const data = doc.data();
                    const newBalance = (data.balance ?? 0) + 5;
                    const tx = {
                        type: 'ad_reward',
                        amount: 5,
                        gameId: null,
                        note: 'Watch ad reward',
                        timestamp: _nowStr()
                    };
                    let txs = data.transactions || [];
                    txs.unshift(tx);
                    if (txs.length > MAX_TRANSACTIONS) txs.length = MAX_TRANSACTIONS;

                    transaction.update(userDocRef, {
                        balance: newBalance,
                        transactions: txs,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });

                await _refreshCache();
                return { success: true, amount: 5, balance: this.getBalance() };
            } catch (e) {
                console.error('[FirebaseUser] watchAdReward error:', e);
                return { success: false, balance: this.getBalance(), error: 'TRANSACTION_FAILED' };
            }
        },

        // --- 交易记录 ---
        async _addTransaction(type, amount, gameId, note) {
            if (!userDocRef) return false;
            try {
                await db.runTransaction(async (transaction) => {
                    const doc = await transaction.get(userDocRef);
                    if (!doc.exists) return;

                    const data = doc.data();
                    const tx = {
                        type, amount, gameId, note,
                        timestamp: _nowStr()
                    };
                    let txs = data.transactions || [];
                    txs.unshift(tx);
                    if (txs.length > MAX_TRANSACTIONS) txs.length = MAX_TRANSACTIONS;

                    transaction.update(userDocRef, {
                        transactions: txs,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
                await _refreshCache();
                return true;
            } catch (e) {
                console.error('[FirebaseUser] _addTransaction error:', e);
                return false;
            }
        },

        getTransactions(limit = 20) {
            const txs = localCache?.transactions || [];
            return txs.slice(0, limit);
        },

        // --- 调试用：加币 ---
        async debugAddCoins(amount) {
            if (!userDocRef) return this.getBalance();
            try {
                await db.runTransaction(async (transaction) => {
                    const doc = await transaction.get(userDocRef);
                    if (!doc.exists) return;

                    const data = doc.data();
                    const newBalance = (data.balance ?? 0) + amount;
                    const tx = {
                        type: 'debug',
                        amount,
                        gameId: null,
                        note: 'Debug add',
                        timestamp: _nowStr()
                    };
                    let txs = data.transactions || [];
                    txs.unshift(tx);
                    if (txs.length > MAX_TRANSACTIONS) txs.length = MAX_TRANSACTIONS;

                    transaction.update(userDocRef, {
                        balance: newBalance,
                        transactions: txs,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
                await _refreshCache();
                return this.getBalance();
            } catch (e) {
                console.error('[FirebaseUser] debugAddCoins error:', e);
                return this.getBalance();
            }
        }
    };

    // 自动初始化
    init().then((ok) => {
        if (ok) {
            console.log('[FirebaseUser] Auto-init started');
        } else {
            console.log('[FirebaseUser] Auto-init skipped (SDK not ready)');
        }
    });

    // 导出入口
    window.FirebaseUser = FirebaseUser;

})();
