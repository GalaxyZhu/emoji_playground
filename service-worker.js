// Emoji Arcade Service Worker
const CACHE_NAME = 'emoji-arcade-v4';  // 升版本号强制刷新缓存（v3 → v4）

// 核心资源：install 时预缓存（应用外壳 + 共享框架）
// 各游戏 HTML / config.js 走运行时动态缓存，避免 addAll 因单文件 404 整体失败
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/assets/css/style.css',
  '/games.json',
  '/robots.txt',
  '/sitemap.xml',
  '/games/shared/game-core.css',
  '/games/shared/game-core.js',
  '/games/shared/i18n-detect.js',
  '/assets/js/i18n.js',
  '/assets/js/nickname-generator.js',
  '/assets/js/leaderboard.js',
  '/assets/js/firebase-config.js',
  '/assets/js/firebase-user.js',
  '/assets/js/token-system.js',
  '/shared/stars-system.js'
];

// 安装时缓存核心静态资源（单个失败不影响其他）
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching core assets...');
        // 用 Promise.allSettled 替代 addAll，单个失败不会让整个 install 崩
        return Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((err) => console.warn('Cache miss:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 拦截网络请求：cache-first + 后台更新策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非 GET 请求和第三方资源
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request)
      .then((cached) => {
        // 如果有缓存，先返回缓存
        if (cached) {
          // 同时发起网络请求更新缓存（后台更新）
          fetch(request)
            .then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, response));
              }
            })
            .catch(() => {});
          return cached;
        }

        // 没有缓存，发起网络请求
        return fetch(request)
          .then((response) => {
            // 缓存成功的响应（同源 GET 才缓存，避免缓存错误页/重定向）
            if (response.ok && response.status === 200 && response.type === 'basic') {
              const clone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            // 网络失败，返回离线首页
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
