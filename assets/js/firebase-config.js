/**
 * Firebase 配置
 * Emoji Arcade - 全局 Firebase 初始化配置
 */
const firebaseConfig = {
    apiKey: "AIzaSyCxDmifyCSkCWiCzt0hIfPjACBP0vWr8ss",
    authDomain: "emojiarcade.firebaseapp.com",
    projectId: "emojiarcade",
    storageBucket: "emojiarcade.firebasestorage.app",
    messagingSenderId: "248496652872",
    appId: "1:248496652872:web:1e629607979ff9057a8e7d",
    measurementId: "G-Q47YKBF6RV"
};

// Also expose on window for modular Firebase v9+ API consumers (e.g. leaderboard.js)
window.firebaseConfig = firebaseConfig;