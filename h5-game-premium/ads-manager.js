// AdSense广告管理系统
class AdManager {
    constructor() {
        this.config = {
            publisherId: 'ca-pub-7608517677287601',
            domain: '6shequ.cn',
            enabled: true,
            testMode: false,
            adUnits: {
                // 这些ID需要从AdSense控制台获取
                // 暂时使用占位符，实际部署时需要替换
                banner: '横幅广告单元ID',
                interstitial: '插页广告单元ID',
                rewarded: '激励视频广告单元ID'
            }
        };
        
        this.ads = {
            banner: null,
            interstitial: null,
            rewarded: null
        };
        
        this.stats = {
            impressions: 0,
            clicks: 0,
            revenue: 0,
            lastShown: null
        };
        
        this.userPrefs = {
            adsEnabled: true,
            lastAdShown: 0,
            adFrequency: 3, // 每3次游戏显示一次插页广告
            gameCount: 0
        };
        
        this.loadUserPreferences();
        this.init();
    }
    
    // 初始化广告系统
    init() {
        if (!this.config.enabled) return;
        
        // 加载AdSense脚本
        this.loadAdSenseScript();
        
        // 初始化广告单元
        this.initAdUnits();
        
        // 恢复用户偏好
        this.restoreUserPreferences();
        
        console.log('AdManager初始化完成');
    }
    
    // 加载AdSense脚本
    loadAdSenseScript() {
        if (document.querySelector('script[src*="adsbygoogle"]')) {
            console.log('AdSense脚本已加载');
            return;
        }
        
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.publisherId}`;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
            console.log('AdSense脚本加载成功');
            this.initAdUnits();
        };
        script.onerror = (error) => {
            console.error('AdSense脚本加载失败:', error);
        };
        
        document.head.appendChild(script);
    }
    
    // 初始化广告单元
    initAdUnits() {
        // 横幅广告
        this.initBannerAd();
        
        // 插页广告（延迟初始化，需要时再加载）
        // 激励视频广告（延迟初始化）
    }
    
    // 初始化横幅广告
    initBannerAd() {
        if (!this.userPrefs.adsEnabled) return;
        
        const adContainer = document.getElementById('ad-banner');
        if (!adContainer) {
            console.warn('横幅广告容器未找到');
            return;
        }
        
        // 清除占位符
        adContainer.innerHTML = '';
        
        // 创建广告代码
        const adCode = `
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="${this.config.publisherId}"
                 data-ad-slot="${this.config.adUnits.banner}"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
        `;
        
        adContainer.innerHTML = adCode;
        
        // 标记广告已初始化
        this.ads.banner = {
            element: adContainer,
            loaded: false,
            lastRefresh: Date.now()
        };
        
        console.log('横幅广告初始化完成');
    }
    
    // 显示插页广告
    showInterstitial() {
        if (!this.userPrefs.adsEnabled) return;
        if (!this.shouldShowAd('interstitial')) return;
        
        this.userPrefs.gameCount++;
        
        // 每3次游戏显示一次插页广告
        if (this.userPrefs.gameCount % this.userPrefs.adFrequency !== 0) {
            return;
        }
        
        console.log('显示插页广告');
        
        // 实际部署时这里会显示真实插页广告
        // 现在使用模拟广告
        this.showMockAd('interstitial', '插页广告 - 游戏暂停中');
        
        this.updateStats('interstitial');
        this.saveUserPreferences();
    }
    
    // 显示激励视频广告
    showRewardedAd(rewardCallback) {
        if (!this.userPrefs.adsEnabled) {
            if (rewardCallback) rewardCallback(false);
            return;
        }
        
        console.log('显示激励视频广告');
        
        // 模拟广告展示
        const userConfirmed = confirm('观看激励视频广告可以获得游戏奖励！\n\n观看广告后，下一局游戏将获得：\n✅ 双倍分数\n✅ 额外3条生命\n✅ 特殊皮肤\n\n是否观看广告？');
        
        if (userConfirmed) {
            // 模拟广告观看过程
            this.showMockAd('rewarded', '激励视频广告播放中...', 3000);
            
            setTimeout(() => {
                // 广告观看完成，给予奖励
                if (rewardCallback) {
                    rewardCallback(true);
                }
                
                // 保存奖励状态
                this.grantReward();
                
                this.updateStats('rewarded');
                this.saveUserPreferences();
                
                alert('广告观看完成！\n\n奖励已发放：\n✅ 下一局游戏双倍分数\n✅ 额外3条生命\n✅ 解锁特殊皮肤');
            }, 3000);
        } else {
            if (rewardCallback) rewardCallback(false);
        }
    }
    
    // 显示模拟广告（开发测试用）
    showMockAd(type, message, duration = 2000) {
        const mockAd = document.createElement('div');
        mockAd.className = 'mock-ad';
        mockAd.innerHTML = `
            <div class="mock-ad-content">
                <h3>${message}</h3>
                <p>广告类型: ${type}</p>
                <p>广告商: Google AdSense</p>
                <p>收入: $0.001 - $0.005</p>
                <div class="mock-ad-progress"></div>
            </div>
        `;
        
        mockAd.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        const content = mockAd.querySelector('.mock-ad-content');
        content.style.cssText = `
            background: linear-gradient(45deg, #1a3a5f, #2a4a7f);
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            border: 2px solid #4dffea;
        `;
        
        const progress = mockAd.querySelector('.mock-ad-progress');
        progress.style.cssText = `
            width: 100%;
            height: 10px;
            background: #333;
            border-radius: 5px;
            margin-top: 20px;
            overflow: hidden;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #00b09b, #96c93d);
            transition: width ${duration}ms linear;
        `;
        progress.appendChild(progressBar);
        
        document.body.appendChild(mockAd);
        
        // 开始进度条动画
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 100);
        
        // 广告结束后移除
        setTimeout(() => {
            document.body.removeChild(mockAd);
            console.log(`${type}广告展示完成`);
        }, duration + 100);
    }
    
    // 给予奖励
    grantReward() {
        const rewards = {
            doubleScore: true,
            extraLives: 3,
            specialSkin: 'golden',
            rewardTime: Date.now()
        };
        
        localStorage.setItem('game_rewards', JSON.stringify(rewards));
        
        // 触发游戏内奖励应用
        if (window.game && window.game.applyRewards) {
            window.game.applyRewards(rewards);
        }
    }
    
    // 检查是否应该显示广告
    shouldShowAd(type) {
        const now = Date.now();
        const lastShown = this.userPrefs.lastAdShown;
        
        // 防止广告过于频繁
        if (type === 'interstitial') {
            const minInterval = 60 * 1000; // 至少1分钟间隔
            if (now - lastShown < minInterval) {
                return false;
            }
        }
        
        return true;
    }
    
    // 更新统计数据
    updateStats(type) {
        this.stats.impressions++;
        this.stats.lastShown = Date.now();
        
        // 模拟点击（实际由AdSense追踪）
        if (Math.random() < 0.01) { // 1%点击率
            this.stats.clicks++;
            this.stats.revenue += 0.001 + Math.random() * 0.004; // $0.001-$0.005
        }
        
        this.saveStats();
        this.updateStatsDisplay();
    }
    
    // 更新统计显示
    updateStatsDisplay() {
        const statsElement = document.getElementById('ad-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div>展示次数: ${this.stats.impressions}</div>
                <div>点击次数: ${this.stats.clicks}</div>
                <div>预估收入: $${this.stats.revenue.toFixed(3)}</div>
                <div>点击率: ${this.stats.impressions > 0 ? ((this.stats.clicks / this.stats.impressions) * 100).toFixed(2) : 0}%</div>
            `;
        }
    }
    
    // 去除广告
    removeAds() {
        this.userPrefs.adsEnabled = false;
        
        // 隐藏所有广告
        const adContainer = document.getElementById('ad-banner');
        if (adContainer) {
            adContainer.innerHTML = '<div class="ad-removed-message">🎉 广告已去除 - 感谢支持！</div>';
            adContainer.style.background = 'linear-gradient(45deg, #00b09b, #96c93d)';
        }
        
        // 隐藏去除广告按钮
        const removeBtn = document.getElementById('remove-ads-btn');
        if (removeBtn) {
            removeBtn.style.display = 'none';
        }
        
        this.saveUserPreferences();
        console.log('广告已去除');
    }
    
    // 恢复广告
    restoreAds() {
        this.userPrefs.adsEnabled = true;
        this.initBannerAd();
        this.saveUserPreferences();
    }
    
    // 加载用户偏好
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('ad_preferences');
            if (saved) {
                this.userPrefs = { ...this.userPrefs, ...JSON.parse(saved) };
            }
            
            const savedStats = localStorage.getItem('ad_stats');
            if (savedStats) {
                this.stats = { ...this.stats, ...JSON.parse(savedStats) };
            }
        } catch (error) {
            console.error('加载用户偏好失败:', error);
        }
    }
    
    // 保存用户偏好
    saveUserPreferences() {
        try {
            localStorage.setItem('ad_preferences', JSON.stringify(this.userPrefs));
            localStorage.setItem('ad_stats', JSON.stringify(this.stats));
        } catch (error) {
            console.error('保存用户偏好失败:', error);
        }
    }
    
    // 恢复用户偏好到UI
    restoreUserPreferences() {
        // 如果用户已去除广告，更新UI
        if (!this.userPrefs.adsEnabled) {
            this.removeAds();
        }
    }
    
    // 保存统计数据
    saveStats() {
        try {
            localStorage.setItem('ad_stats', JSON.stringify(this.stats));
        } catch (error) {
            console.error('保存统计数据失败:', error);
        }
    }
    
    // 获取广告报告
    getReport() {
        return {
            stats: this.stats,
            preferences: this.userPrefs,
            config: this.config
        };
    }
    
    // 重置统计数据
    resetStats() {
        this.stats = {
            impressions: 0,
            clicks: 0,
            revenue: 0,
            lastShown: null
        };
        this.saveStats();
        this.updateStatsDisplay();
    }
}

// 创建全局AdManager实例
window.adManager = new AdManager();