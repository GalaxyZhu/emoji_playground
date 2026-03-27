# Google Analytics & Google AdSense 配置指南

## 概述
网站已集成 GA4（数据分析）和 Google AdSense（广告变现），你需要替换占位符 ID 为自己的真实 ID。

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

### 2. Google AdSense
**占位符:** `ca-pub-XXXXXXXXXXXXXXXX`

**获取步骤:**
1. 访问 [Google AdSense](https://www.google.com/adsense/)
2. 申请账号（需 Google 账号）
3. 添加网站 `emojiarcade.vercel.app`
4. 等待审核（通常 1-3 天，需要网站有内容）
5. 审核通过后，在 **广告** → **概览** 中找到你的发布商 ID
6. 格式如: `ca-pub-1234567890123456`

**替换位置:** `index.html` 中的 `ca-pub-XXXXXXXXXXXXXXXX`

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
     crossorigin="anonymous"></script>
```

---

## 添加广告位

在想要展示广告的位置添加以下代码：

```html
<!-- 示例：横幅广告 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

**常见广告尺寸:**
| 尺寸 | 用途 |
|------|------|
| 728×90 | 页首横幅 |
| 300×250 | 侧边栏/内容区 |
| 336×280 | 大矩形（高单价）|
| 160×600 |  skyscraper |
| 320×100 | 移动页首 |

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
3. 检查 GA4 是否被检测到

### 方法2: 实时报告
1. 访问 GA4 后台 → **报告** → **实时**
2. 打开你的网站
3. 查看是否有活跃用户

### 方法3: 浏览器控制台
打开控制台 (F12)，输入：
```javascript
dataLayer
```
如果返回数组且包含事件数据，说明 GA4 安装成功。

### 方法4: 检查 AdSense 代码
在浏览器控制台查看网络请求，搜索 `adsbygoogle`，确认脚本已加载。

---

## AdSense 审核注意事项

### 提高通过率
1. **网站有实质内容** - 你的 7 个游戏应该足够
2. **原创性** - 确保不是抄袭内容
3. **页面完整** - 没有 404 错误
4. **隐私政策** - 建议添加隐私政策页面（广告要求）
5. **易于导航** - 用户能轻松找到内容

### 审核期间
- 代码已经安装但**不会显示广告**
- 审核通过后自动开始展示

---

## 隐私合规提示

### GDPR / CCPA 合规
如果你面向欧盟/加州用户，需要：

1. **添加 Cookie 同意横幅**
2. **延迟加载 AdSense** 直到用户同意广告 Cookie

示例实现：
```javascript
// 用户同意后加载 AdSense
if (userConsentedToAds) {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXX';
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.head.appendChild(script);
}
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

### AdSense 广告不显示
- [ ] 确认账号已审核通过
- [ ] 检查发布商 ID 正确
- [ ] 广告位代码是否正确放置
- [ ] 浏览器是否有广告拦截器

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
在 GA4 中创建受众群体：
1. **高活跃用户**: 玩了3+ 游戏
2. **高分用户**: 至少一个游戏超过 1000 分
3. **回访用户**: 7天内再次访问

---

## 相关链接

- [GA4 设置向导](https://support.google.com/analytics/answer/9304153)
- [Google AdSense 入门指南](https://support.google.com/adsense/answer/1045358)
- [AdSense 广告格式](https://support.google.com/adsense/answer/185665)

---

**最后更新:** 2026-03-28
