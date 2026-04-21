/**
 * Emoji Arcade 游戏语言检测模块
 * 统一处理语言优先级：URL 参数 > localStorage > 浏览器语言
 * 各游戏只需引入此脚本，调用 GameI18n.detectLang() 即可
 */
(function() {
    const GameI18n = {
        detectLang() {
            const forced = new URLSearchParams(location.search).get('lang');
            const stored = localStorage.getItem('emoji_arcade_lang');
            const browser = (navigator.language || navigator.userLanguage || 'zh-CN').toLowerCase();
            
            if (forced === 'zh' || forced === 'en') return forced;
            if (stored === 'zh' || stored === 'en') return stored;
            return browser.startsWith('zh') ? 'zh' : 'en';
        },
        
        setHtmlLang(lang) {
            document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
        }
    };
    
    window.GameI18n = GameI18n;
})();
