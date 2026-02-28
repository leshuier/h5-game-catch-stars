# 接住星星 - 盈利版 H5 小游戏

![游戏截图](https://via.placeholder.com/800x400/1a3a5f/ffffff?text=接住星星+游戏截图)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-在线游戏-blue)
![PWA](https://img.shields.io/badge/PWA-可安装应用-green)
![AdSense](https://img.shields.io/badge/Google%20AdSense-广告集成-orange)

一个完整的HTML5小游戏，包含广告系统和应用内购买功能，支持PWA安装。

## 🎮 游戏介绍

**接住星星** 是一款简单的HTML5 Canvas游戏，玩家控制篮子接住掉落的星星和宝石，避开炸弹。游戏具有完整的盈利系统，包括广告展示和应用内购买。

### 游戏特点
- 🎯 **简单易玩** - 键盘或触摸控制
- ⭐ **多种物品** - 星星、宝石、炸弹
- 📈 **等级系统** - 难度随分数增加
- 💰 **盈利功能** - 广告展示和购买系统
- 📱 **PWA支持** - 可安装到手机桌面
- 🌐 **响应式设计** - 适配所有设备

## 🚀 在线体验

**GitHub Pages**: [https://leshuier.github.io/h5-game-catch-stars/](https://leshuier.github.io/h5-game-catch-stars/)

## 💰 盈利功能

### 1. 广告系统
- **横幅广告**: 游戏界面固定位置
- **插页广告**: 游戏开始/结束时显示
- **激励视频广告**: 用户选择观看获得奖励
- **广告统计**: 实时展示广告效果数据

### 2. 应用内购买
- **去除广告**: $2.99 (永久去除所有广告)
- **彩虹篮子**: $1.99 (解锁彩虹渐变皮肤)
- **星光特效**: $0.99 (为掉落物品添加尾迹)
- **双倍分数**: $0.99 (下一局游戏双倍分数)

### 3. PWA功能
- 可安装到手机桌面
- 离线游戏支持
- 应用图标和启动画面
- 全屏体验

## 🛠️ 技术栈

- **HTML5 Canvas** - 游戏渲染
- **CSS3** - 响应式界面设计
- **JavaScript (ES6+)** - 游戏逻辑和广告管理
- **Google AdSense** - 广告展示
- **PWA** - 渐进式Web应用
- **LocalStorage** - 数据持久化

## 📁 项目结构

```
├── index.html          # 主页面
├── style.css           # 样式文件
├── game.js             # 游戏核心逻辑
├── ads-manager.js      # 广告管理系统
├── manifest.json       # PWA配置文件
├── sw.js              # Service Worker
├── DEPLOYMENT_PLAN.md  # 部署方案
└── PAYMENT_INTEGRATION_PLAN.md # 支付集成方案
```

## 🔧 本地运行

### 方法1：直接打开
```bash
# 双击 index.html 文件
```

### 方法2：本地服务器
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

访问: http://localhost:8000

## 📱 移动端体验

### 安装到手机
1. 使用Chrome或Safari访问游戏
2. 点击"添加到主屏幕"
3. 像原生应用一样使用

### 触摸控制
- **左侧屏幕**: 向左移动
- **右侧屏幕**: 向右移动

## 🎯 游戏控制

### 桌面端
- **← 左箭头**: 向左移动
- **→ 右箭头**: 向右移动
- **A/D键**: 左右移动
- **空格键**: 暂停/继续
- **F11**: 全屏模式

### 移动端
- **触摸左侧**: 向左移动
- **触摸右侧**: 向右移动

## 📊 广告系统配置

### Google AdSense
游戏已集成Google AdSense，需要以下配置：

1. **发布商ID**: `ca-pub-7608517677287601`
2. **域名**: `6shequ.cn`
3. **广告单元ID**: 需要从AdSense控制台获取

### 广告类型
1. **横幅广告**: 游戏界面固定位置
2. **插页广告**: 游戏自然间隙显示
3. **激励视频**: 用户主动触发获得奖励

## 💳 支付集成

### 当前状态
- ✅ 模拟购买系统已实现
- 🔄 真实支付待集成（支持Stripe/PayPal）

### 支付集成计划
详细支付集成方案见: [PAYMENT_INTEGRATION_PLAN.md](PAYMENT_INTEGRATION_PLAN.md)

## 🌐 多平台部署

### 已部署平台
1. **GitHub Pages** - 静态托管
2. **本地测试** - 开发环境

### 计划部署平台
1. **Itch.io** - 游戏社区平台
2. **Google Play** - PWA应用商店
3. **微信小游戏** - 中国市场

详细部署方案见: [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md)

## 🧪 测试报告

游戏已通过完整测试，包括：
- ✅ 广告系统功能测试
- ✅ 购买系统测试
- ✅ 游戏功能测试
- ✅ 用户体验测试
- ✅ 多平台兼容测试

详细测试报告见: [TEST_REPORT.md](TEST_REPORT.md)

## 📈 收入模型

### 广告收入
- **CPM**: $1-5 (每千次展示)
- **CTR**: 0.5-2% (点击率)
- **日展示目标**: 1000次
- **预计日收入**: $1-5

### 应用内购买
- **转化率**: 1-5%
- **平均交易额**: $1-3
- **预计日收入**: $10-50 (1000用户)

## 🔒 隐私和安全

### 数据收集
- 仅收集必要的游戏数据
- 使用LocalStorage存储用户偏好
- 不收集个人身份信息

### 广告合规
- 遵守Google AdSense政策
- 明确的广告标识
- 用户控制广告选项

## 🤝 贡献指南

欢迎贡献代码和改进！

### 开发流程
1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 代码规范
- 使用ES6+语法
- 添加必要的注释
- 保持代码简洁
- 测试新功能

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- **OpenClaw** - AI助手开发支持
- **Google AdSense** - 广告平台
- **GitHub Pages** - 免费托管
- **所有测试玩家** - 宝贵的反馈

## 📞 联系和支持

- **问题反馈**: [GitHub Issues](https://github.com/leshuier/h5-game-catch-stars/issues)
- **功能请求**: 开启Issue描述需求
- **安全漏洞**: 请私信联系

---

**玩得开心，接住更多星星！** ⭐🎮