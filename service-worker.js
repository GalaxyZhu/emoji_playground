// Emoji Arcade Service Worker
const CACHE_NAME = 'emoji-arcade-v3';  // 更新版本号强制刷新缓存
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/assets/css/style.css',
  '/games.json',
  '/robots.txt',
  '/sitemap.xml',
  // Core games (shells + launcher will handle most)
  '/games/emoji-shooter/index.html',
  '/games/emoji-hop/index.html',
  '/games/emoji-frog/index.html',
  '/games/emoji-match/index.html',
  '/games/emoji-linkup/index.html',
  '/games/shared/game-core.css',
  '/games/shared/game-core.js'
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.error('Cache failed:', err))
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

// 拦截网络请求
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
            // 缓存成功的响应
            if (response.ok && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            // 网络失败，返回离线页面（如果有的话）
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
