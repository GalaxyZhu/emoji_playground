const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 背景色改为白色
const BG_COLOR = '#ffffff';

// 确保 assets 目录存在
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// 读取 emoji 基础图片
const emojiBuffer = fs.readFileSync(path.join(__dirname, 'emoji-base.png'));

// 生成指定尺寸的 favicon
async function generateFavicon(size, filename) {
    const filepath = path.join(assetsDir, filename);
    
    // 创建白色背景
    const background = await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
    }).png().toBuffer();
    
    // 调整 emoji 大小（留一些边距）
    const emojiSize = Math.floor(size * 0.8);
    const resizedEmoji = await sharp(emojiBuffer)
        .resize(emojiSize, emojiSize, { fit: 'contain' })
        .toBuffer();
    
    // 合成：白色背景 + emoji 居中
    await sharp(background)
        .composite([{
            input: resizedEmoji,
            gravity: 'center'
        }])
        .toFile(filepath);
    
    console.log(`✅ Generated ${filename} (${size}x${size})`);
}

// 生成所有需要的 favicon
async function generateAll() {
    await generateFavicon(32, 'favicon-32x32.png');
    await generateFavicon(180, 'apple-touch-icon.png');
    await generateFavicon(192, 'icon-192x192.png');
    await generateFavicon(512, 'icon-512x512.png');
    
    console.log('\n🎉 All favicons generated successfully!');
}

generateAll().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
