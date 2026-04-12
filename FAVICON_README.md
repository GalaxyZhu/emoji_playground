# Emoji Arcade Favicon Configuration

## 问题
国产浏览器（微信、QQ浏览器、UC浏览器）对 SVG favicon 支持不完善，需要 PNG 格式。

## 解决方案

### 已添加的 Meta 标签（index.html 已更新）
```html
<!-- 标准 favicon -->
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="shortcut icon" href="favicon.ico">

<!-- Apple / iOS -->
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
<link rel="apple-touch-icon-precomposed" sizes="180x180" href="apple-touch-icon.png">

<!-- Android / Chrome -->
<link rel="icon" sizes="192x192" href="assets/icon-192x192.png">

<!-- 国产浏览器兼容 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="format-detection" content="telephone=no">
<meta name="x5-page-mode" content="app">
<meta name="browsermode" content="application">
<meta name="full-screen" content="yes">
```

## 需要生成的文件

你需要生成以下 favicon 文件（可用 https://favicon.io/ 或 https://realfavicongenerator.net/）：

1. **favicon-32x32.png** - 32x32 像素 PNG
2. **favicon-16x16.png** - 16x16 像素 PNG (可选)
3. **favicon.ico** - 多尺寸 ICO 文件 (可选但推荐)
4. **apple-touch-icon.png** - 180x180 像素 PNG
5. **assets/icon-192x192.png** - 192x192 像素 PNG
6. **assets/icon-512x512.png** - 512x512 像素 PNG

## 快速生成方法

### 方法1：使用 favicon.io（最简单）
1. 访问 https://favicon.io/
2. 选择 "Emoji" 选项
3. 输入 🎮 
4. 点击下载
5. 解压后将所有文件放到项目根目录

### 方法2：使用 RealFaviconGenerator（最完整）
1. 访问 https://realfavicongenerator.net/
2. 上传你的 SVG 或 PNG
3. 配置选项（推荐添加所有平台）
4. 下载并解压到项目目录

## 验证

添加收藏夹后，如果图标仍不显示：
1. 清除浏览器缓存
2. 微信：退出重进或清除缓存
3. QQ浏览器：设置 → 清除数据 → 清除缓存

## 微信特殊处理

微信内置浏览器有自己的缓存机制，可能需要：
- 在 URL 后添加 `?v=2` 强制刷新
- 或等待 24 小时后自动更新
