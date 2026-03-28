# Google AdSense 配置指南

## 概述
网站已集成 Google AdSense（广告变现），你需要替换占位符 ID 为自己的真实 ID。

## 网站分析工具

本项目使用 **Vercel Analytics** 进行网站数据分析：
- 无需额外代码，直接在 Vercel Dashboard 开启
- 实时访客、页面浏览、设备分布等基础数据
- 无需 Cookie 弹窗，GDPR 友好

**开启方式：**
1. 访问 [vercel.com/dashboard](https://vercel.com/dashboard)
2. 进入项目 `emojiarcade`
3. 点击 **Analytics** 标签 → **Enable Analytics**

---

## 需要替换的 ID

### Google AdSense
**占位符:** `ca-pub-XXXXXXXXXXXXXXXX`

**获取步骤:**
1. 访问 [Google AdSense](https://www.google.com/adsense/)
2. 申请账号（需 Google 账号）
3. 添加网站 `emojiarcade.vercel.app`
4. 等待审核（通常 1-3 天，需要网站有内容）
5. 审核通过后，在 **广告** → **概览** 中找到你的发布商 ID
6. 格式如: `ca-pub-1234567890123456`

**替换位置:** 以下文件中的 `ca-pub-XXXXXXXXXXXXXXXX`
- `index.html`
- `games/emoji-shooter/index.html`
- `games/emoji-survive/index.html`

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
     crossorigin="anonymous"></script>
```

---

## 添加广告位

### 首页广告（可选）
在想要展示广告的位置添加：

```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

### 游戏内广告（已配置）
以下游戏已配置侧边栏广告位：
- **emoji-shooter**: 左右两侧垂直广告位
- **emoji-survive**: 左右两侧垂直广告位

需要替换每个广告位的 `data-ad-slot` 为你创建的广告单元 ID。

**常见广告尺寸:**
| 尺寸 | 用途 |
|------|------|
| 728×90 | 页首横幅 |
| 300×250 | 侧边栏/内容区 |
| 336×280 | 大矩形（高单价）|
| 160×600 | skyscraper |
| 320×100 | 移动页首 |

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

---

## 故障排查

### AdSense 广告不显示
- [ ] 确认账号已审核通过
- [ ] 检查发布商 ID 正确
- [ ] 广告位代码是否正确放置
- [ ] 浏览器是否有广告拦截器

---

## 相关链接

- [Google AdSense 入门指南](https://support.google.com/adsense/answer/1045358)
- [AdSense 广告格式](https://support.google.com/adsense/answer/185665)
- [Vercel Analytics 文档](https://vercel.com/docs/analytics)

---

**最后更新:** 2026-03-28
