const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 背景色与网站一致
const BG_COLOR = '#1a1a2e';
const EMOJI = '🎮';

// 确保 assets 目录存在
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// 生成指定尺寸的 favicon
function generateFavicon(size, filename) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, size, size);
    
    // 绘制 emoji
    ctx.font = `${Math.floor(size * 0.7)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(EMOJI, size / 2, size / 2 + size * 0.05);
    
    // 保存
    const buffer = canvas.toBuffer('image/png');
    const filepath = path.join(assetsDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ Generated ${filename} (${size}x${size})`);
}

// 生成所有需要的 favicon
generateFavicon(32, 'favicon-32x32.png');
generateFavicon(180, 'apple-touch-icon.png');
generateFavicon(192, 'icon-192x192.png');
generateFavicon(512, 'icon-512x512.png');

console.log('\n🎉 All favicons generated successfully!');
console.log('\nFiles created:');
console.log('- assets/favicon-32x32.png');
console.log('- assets/apple-touch-icon.png');
console.log('- assets/icon-192x192.png');
console.log('- assets/icon-512x512.png');
