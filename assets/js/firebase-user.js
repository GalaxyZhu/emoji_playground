/**
 * Firebase User Layer - Firestore 数据层
 * Emoji Arcade 第二阶段后端迁移
 * 保持 TokenSystem API 兼容，无缝替换 localStorage
 */
(function() {
    'use strict';

    // ==================== Firebase 初始化 ====================
    let app, db, auth, currentUser, userDocRef;
    let _firestoreReady = false;
    let _pendingQueue = []; // Firestore 初始化前的操作队列

    function initFirebase() {
        if (typeof firebase === 'undefined') {
            console.warn('[FirebaseUser] Firebase SDK not loaded, falling back to localStorage');
            return false;
        }
        if (typeof firebaseConfig === 'undefined') {
            console.warn('[FirebaseUser] firebaseConfig not found');
            return false;
        }

        try {
            app = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            auth = firebase.auth();

            // 匿名登录（每个设备一个匿名用户）
            auth.signInAnonymously()
                .then((cred) => {
                    currentUser = cred.user;
                    userDocRef = db.collection('users').doc(currentUser.uid);
                    _firestoreReady = true;
                    console.log('[FirebaseUser] Anonymous auth success, uid:', currentUser.uid);

                    // 初始化用户文档（如果不存在）
                    return _initUserDoc();
                })
                .then(() => {
                    // 清空队列
                    while (_pendingQueue.length > 0) {
                        const fn = _pendingQueue.shift();
                        fn();
                    }
                })
                .catch((err) => {
                    console.error('[FirebaseUser] Auth or init error:', err);
                    _firestoreReady = false;
                });

            return true;
        } catch (e) {
            console.error('[FirebaseUser] Init error:', e);
            return false;
        }
    }

    // 初始化用户文档：如果不存在则创建
    async function _initUserDoc() {
        if (!userDocRef) return;
        const snap = await userDocRef.get();
        if (!snap.exists) {
            await userDocRef.set({
                balance: 30,
                lastCheckIn: null,
                totalConsumed: 0,
                isVip: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('[FirebaseUser] New user doc created with 30 coins');
        }
    }

    // 等 Firestore 就绪
    function _whenReady(fn) {
        if (_firestoreReady) {
            fn();
        } else {
            _pendingQueue.push(fn);
        }
    }

    function getTodayStr() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    }

    // ==================== Firestore 存储层 ====================
    const _firestoreBackend = {
        // --- 初始化 ---
        async initUser() {
            if (!userDocRef) return { isNew: false, balance: 0, offline: true };
            try {
                const snap = await userDocRef.get();
                if (!snap.exists) {
                    await userDocRef.set({
                        balance: 30,
                        lastCheckIn: null,
                        totalConsumed: 0,
                        isVip: false,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    return { isNew: true, balance: 30 };
                }
                const data = snap.data();
                return { isNew: false, balance: data.balance ?? 0 };
            } catch (e) {
                console.error('[FirebaseUser] initUser error:', e);
                return { isNew: false, balance: 0, offline: true };
            }
        },

        resetUser() {
            if (userDocRef) {
                userDocRef.delete().catch(() => {});
            }
        },

        // --- 余额查询（读缓存）---
        getBalance() {
            return window._fbBalanceCache ?? 0;
        },

        getTotalConsumed() {
            return window._fbConsumedCache ?? 0;
        },

        isVip() {
            return window._fbVipCache === true;
        },

        async setVip(vip) {
            if (!userDocRef) return;
            window._fbVipCache = vip === true;
            try {
                await userDocRef.update({ isVip: vip === true });
            } catch (e) {
                console.error('[FirebaseUser] setVip error:', e);
            }
        },

        // --- 扣币（事务）---
        async deductCoin(gameId) {
            if (!userDocRef) return { success: false, balance: 0, error: 'OFFLINE' };
            const today = getTodayStr();
            try {
                const result = await db.runTransaction(async (tx) => {
                    const snap = await tx.get(userDocRef);
                    if (!snap.exists) return { success: false, error: 'NO_USER' };

                    const data = snap.data();
                    const current = data.balance ?? 0;
                    const totalConsumed = data.totalConsumed ?? 0;

                    if (current < 1) {
                        return { success: false, balance: current, error: 'INSUFFICIENT' };
                    }

                    const newBalance = current - 1;
                    const newConsumed = totalConsumed + 1;

                    tx.update(userDocRef, {
                        balance: newBalance,
                        totalConsumed: newConsumed,
                        lastPlayAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastPlayGame: gameId || null
                    });

                    return { success: true, balance: newBalance };
                });
                if (result.success) {
                    window._fbBalanceCache = result.balance;
                    window._fbConsumedCache = (window._fbConsumedCache ?? 0) + 1;
                }
                return result;
            } catch (e) {
                console.error('[FirebaseUser] deductCoin error:', e);
                return { success: false, balance: 0, error: 'TRANSACTION_FAILED' };
            }
        },

        // --- 签到 ---
        async dailyCheckIn() {
            if (!userDocRef) return { success: false, alreadyCheckedIn: false, balance: 0, error: 'OFFLINE' };
            const today = getTodayStr();
            try {
                const result = await db.runTransaction(async (tx) => {
                    const snap = await tx.get(userDocRef);
                    if (!snap.exists) return { success: false, error: 'NO_USER' };

                    const data = snap.data();
                    const lastCheckIn = data.lastCheckIn || null;

                    if (lastCheckIn === today) {
                        return { success: false, alreadyCheckedIn: true, balance: data.balance ?? 0 };
                    }

                    const current = data.balance ?? 0;
                    const newBalance = current + 10;

                    tx.update(userDocRef, {
                        balance: newBalance,
                        lastCheckIn: today,
                        lastCheckInAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    return { success: true, amount: 10, balance: newBalance };
                });
                if (result.success) {
                    window._fbBalanceCache = result.balance;
                }
                return result;
            } catch (e) {
                console.error('[FirebaseUser] dailyCheckIn error:', e);
                return { success: false, alreadyCheckedIn: false, balance: 0, error: 'TRANSACTION_FAILED' };
            }
        },

        async canCheckIn() {
            if (!userDocRef) return false;
            try {
                const snap = await userDocRef.get();
                if (!snap.exists) return false;
                const data = snap.data();
                const today = getTodayStr();
                return (data.lastCheckIn || null) !== today;
            } catch (e) {
                return false;
            }
        },

        // --- 看广告奖励 ---
        async watchAdReward() {
            if (!userDocRef) return { success: false, balance: 0, error: 'OFFLINE' };
            try {
                const result = await db.runTransaction(async (tx) => {
                    const snap = await tx.get(userDocRef);
                    if (!snap.exists) return { success: false, error: 'NO_USER' };

                    const data = snap.data();
                    const current = data.balance ?? 0;
                    const newBalance = current + 5;

                    tx.update(userDocRef, {
                        balance: newBalance,
                        lastAdRewardAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    return { success: true, amount: 5, balance: newBalance };
                });
                if (result.success) {
                    window._fbBalanceCache = result.balance;
                }
                return result;
            } catch (e) {
                console.error('[FirebaseUser] watchAdReward error:', e);
                return { success: false, balance: 0, error: 'TRANSACTION_FAILED' };
            }
        },

        // --- 交易记录（Firestore 版不做子集合，留空接口兼容）---
        _addTransaction(type, amount, gameId, note) {
            // Firestore 版暂不记录交易明细
        },

        getTransactions(limit) {
            return []; // Firestore 版暂不返回
        },

        // --- 调试 ---
        async debugAddCoins(amount) {
            if (!userDocRef) return 0;
            const snap = await userDocRef.get();
            if (!snap.exists) return 0;
            const current = snap.data().balance ?? 0;
            const newBalance = current + amount;
            await userDocRef.update({ balance: newBalance });
            window._fbBalanceCache = newBalance;
            return newBalance;
        }
    };

    // ==================== 全局暴露：FirebaseUser ====================
    window.FirebaseUser = {
        isReady() {
            return _firestoreReady;
        },

        initUser() { return _firestoreBackend.initUser(); },
        resetUser() { _firestoreBackend.resetUser(); },
        getBalance() { return _firestoreBackend.getBalance(); },
        getTotalConsumed() { return _firestoreBackend.getTotalConsumed(); },
        isVip() { return _firestoreBackend.isVip(); },
        setVip(vip) { return _firestoreBackend.setVip(vip); },
        deductCoin(gameId) { return _firestoreBackend.deductCoin(gameId); },
        dailyCheckIn() { return _firestoreBackend.dailyCheckIn(); },
        canCheckIn() { return _firestoreBackend.canCheckIn(); },
        watchAdReward() { return _firestoreBackend.watchAdReward(); },
        _addTransaction(type, amount, gameId, note) { return _firestoreBackend._addTransaction(type, amount, gameId, note); },
        getTransactions(limit) { return _firestoreBackend.getTransactions(limit); },
        debugAddCoins(amount) { return _firestoreBackend.debugAddCoins(amount); },

        refreshCache() {
            // 由 snapshot listener 自动维护缓存
            return Promise.resolve();
        }
    };

    // ==================== 实时监听余额变化 ====================
    function startBalanceListener() {
        if (!userDocRef) return;
        userDocRef.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                window._fbBalanceCache = data.balance ?? 0;
                window._fbConsumedCache = data.totalConsumed ?? 0;
                window._fbVipCache = data.isVip === true;
                // 触发 UI 更新
                if (typeof window.TokenUI !== 'undefined') {
                    window.TokenUI.updateBalanceDisplay();
                }
            }
        }, (err) => {
            console.warn('[FirebaseUser] Snapshot listener error:', err);
        });
    }

    // ==================== 启动 ====================
    const initOk = initFirebase();
    if (initOk) {
        // 匿名认证完成后启动监听
        const checkInterval = setInterval(() => {
            if (_firestoreReady && userDocRef) {
                clearInterval(checkInterval);
                startBalanceListener();
            }
        }, 500);
        // 安全清理
        setTimeout(() => clearInterval(checkInterval), 30000);
    }

    // 标记 Firebase 层已加载
    window._firebaseUserLoaded = true;
    console.log('[FirebaseUser] Module loaded, init status:', initOk);

})();