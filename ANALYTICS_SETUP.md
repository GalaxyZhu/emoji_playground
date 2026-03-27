# Google Analytics & Google Ads 配置指南

## 概述
网站已集成 GA4 和 Google Ads 跟踪代码，你需要替换占位符 ID 为自己的真实 ID。

## 需要替换的 ID

### 1. Google Analytics 4 (GA4)
**占位符:** `G-XXXXXXXXXX`

**获取步骤:**
1. 访问 [Google Analytics](https://analytics.google.com/)
2. 创建账号 → 创建属性（Property）
3. 在属性设置中找到 **Measurement ID**
4. 格式如: `G-ABC123DEF4`

**替换位置:** `index.html` 中的两处 `G-XXXXXXXXXX`

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
<script>
    gtag('config', 'G-ABC123DEF4');
</script>
```

---

### 2. Google Ads
**占位符:** `AW-XXXXXXXXXX`

**获取步骤:**
1. 访问 [Google Ads](https://ads.google.com/)
2. 创建账号和广告系列
3. 进入 **工具与设置** → **衡量** → **转化**
4. 创建转化操作 → 选择 **网站**
5. 获取 **转化 ID** (格式: `AW-12345678901`)

**替换位置:** `index.html` 中的两处 `AW-XXXXXXXXXX`

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-12345678901"></script>
<script>
    gtag('config', 'AW-12345678901');
</script>
```

---

## 可选：添加转化标签 (Conversion Label)

如果你需要追踪特定的转化事件（如游戏完成），添加转化标签：

```javascript
// 在游戏完成/得分时添加
gtag('event', 'conversion', {
    'send_to': 'AW-12345678901/XXXXXXXXXXXXXX',
    'value': 1.0,
    'currency': 'USD'
});
```

---

## 追踪的事件

已自动追踪以下用户行为：

| 事件名称 | 触发时机 | 参数 |
|---------|---------|------|
| `page_view` | 页面浏览 | 自动 |
| `page_ready` | DOM 加载完成 | `load_time` |
| `game_launch` | 用户启动游戏 | `game_id`, `game_name`, `game_category` |
| `game_close` | 用户关闭游戏 | `game_id`, `play_count` |
| `game_score` | 游戏上报分数 | `game_id`, `score`, `is_high_score` |
| `click_coming_soon` | 点击未上线游戏 | `game_id`, `game_name` |

---

## 验证安装

### 方法1: Google Tag Assistant
1. 安装 [Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmjkmjkhlljgocfgnbkk) Chrome 扩展
2. 访问你的网站
3. 检查 GA4 和 Google Ads 是否被检测到

### 方法2: 实时报告
1. 访问 GA4 后台 → **报告** → **实时**
2. 打开你的网站
3. 查看是否有活跃用户

### 方法3: 浏览器控制台
打开控制台 (F12)，输入：
```javascript
dataLayer
```
如果返回数组且包含事件数据，说明安装成功。

---

## 隐私合规提示

### GDPR / CCPA 合规
如果你面向欧盟/加州用户，需要：

1. **添加 Cookie 同意横幅**
2. **延迟加载追踪代码** 直到用户同意

示例实现：
```javascript
// 用户同意后执行
gtag('consent', 'update', {
    'ad_storage': 'granted',
    'analytics_storage': 'granted'
});
```

### 推荐工具
- [Cookiebot](https://www.cookiebot.com/) - 免费版支持小规模网站
- [OneTrust](https://www.onetrust.com/) - 企业级解决方案

---

## 故障排查

### GA4 没有数据
- [ ] 确认 Measurement ID 正确
- [ ] 检查是否有广告拦截器
- [ ] 查看实时报告（可能有延迟）

### Google Ads 转化未记录
- [ ] 确认 Conversion ID 正确
- [ ] 检查转化状态是否为 "激活"
- [ ] 验证转化标签格式（如使用）

---

## 进阶设置

### 自定义维度
在 GA4 中添加自定义维度追踪更多信息：

```javascript
gtag('event', 'game_complete', {
    'game_id': 'emoji-shooter',
    'difficulty': 'hard',
    'play_time_seconds': 120
});
```

### 受众群体
在 GA4 中创建受众群体进行再营销：
1. **高活跃用户**: 玩了3+ 游戏
2. **高分用户**: 至少一个游戏超过 1000 分
3. **回访用户**: 7天内再次访问

---

## 相关链接

- [GA4 设置向导](https://support.google.com/analytics/answer/9304153)
- [Google Ads 转化设置](https://support.google.com/google-ads/answer/6095821)
- [gtag.js 文档](https://developers.google.com/gtagjs)

---

**最后更新:** 2026-03-28
