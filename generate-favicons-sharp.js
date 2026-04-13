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

// 创建带有 emoji 的 SVG
function createEmojiSVG(size, emoji) {
    const fontSize = Math.floor(size * 0.7);
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="${BG_COLOR}"/>
        <text x="50%" y="55%" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    </svg>`;
}

// 生成指定尺寸的 favicon
async function generateFavicon(size, filename, emoji = '🎮') {
    const svg = createEmojiSVG(size, emoji);
    const filepath = path.join(assetsDir, filename);
    
    await sharp(Buffer.from(svg))
        .png()
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
