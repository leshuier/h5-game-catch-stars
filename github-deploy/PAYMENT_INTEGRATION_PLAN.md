# 支付集成技术方案

## 目标
集成真实支付系统，替换现有的模拟购买逻辑，实现完整的应用内购买功能。

## 支付平台选择

### 首选：Stripe
**优势：**
- 国际支付，支持全球用户
- 开发者友好，API简单
- 支持多种支付方式（信用卡、Apple Pay、Google Pay）
- 完善的测试环境
- 丰富的文档和社区支持

**费率：** 2.9% + $0.30 每笔交易

### 备选：PayPal
**优势：**
- 广泛接受
- 用户熟悉度高
- 国际支付支持

**费率：** 2.9% + $0.30 每笔交易

### 中国市场：微信支付/支付宝
**要求：**
- 企业资质
- 国内备案域名
- 服务器在中国大陆

**费率：** 约0.6%

## 技术架构

### 前端（浏览器）
```
用户界面 → Stripe Checkout → 支付成功 → 更新用户状态
```

### 后端（需要简单服务器）
```
Stripe Webhook → 验证支付 → 更新数据库 → 发送确认
```

## 集成步骤

### 步骤1：Stripe账号设置
1. 注册Stripe账号 (https://dashboard.stripe.com/register)
2. 获取API密钥：
   - 公开密钥 (publishable key)：用于前端
   - 秘密密钥 (secret key)：用于后端
3. 创建产品价格：
   - 去除广告：price_remove_ads ($2.99)
   - 彩虹篮子：price_rainbow_basket ($1.99)
   - 星光特效：price_sparkle_effect ($0.99)
   - 双倍分数：price_double_score ($0.99)

### 步骤2：前端集成
1. 加载Stripe.js
2. 创建Checkout会话
3. 处理支付成功/失败
4. 更新本地购买状态

### 步骤3：后端集成（最小化）
1. 创建支付会话端点
2. 验证Webhook签名
3. 更新购买状态
4. 发送确认邮件（可选）

### 步骤4：测试
1. 使用测试信用卡号
2. 测试完整支付流程
3. 测试退款流程
4. 测试错误处理

## 代码实现

### 1. 前端支付处理 (payment.js)
```javascript
class PaymentManager {
    constructor() {
        this.stripe = null;
        this.products = {
            remove_ads: 'price_xxx',
            skin_rainbow: 'price_xxx',
            skin_sparkle: 'price_xxx',
            powerup_double: 'price_xxx'
        };
    }
    
    async init(stripePublishableKey) {
        // 加载Stripe.js
        if (!window.Stripe) {
            await this.loadStripeJS();
        }
        
        this.stripe = Stripe(stripePublishableKey);
    }
    
    async purchase(productId) {
        try {
            // 创建Checkout会话
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: this.products[productId],
                    successUrl: window.location.origin + '/success.html',
                    cancelUrl: window.location.origin + '/cancel.html'
                })
            });
            
            const session = await response.json();
            
            // 重定向到Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.id
            });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('支付失败:', error);
            alert('支付失败: ' + error.message);
        }
    }
    
    async loadStripeJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}
```

### 2. 后端API示例 (Node.js)
```javascript
// server.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

// 创建Checkout会话
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: req.body.priceId,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: req.body.successUrl,
            cancel_url: req.body.cancelUrl,
            metadata: {
                productId: req.body.productId,
                userId: req.body.userId
            }
        });
        
        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stripe Webhook处理
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), 
    async (req, res) => {
        const sig = req.headers['stripe-signature'];
        
        try {
            const event = stripe.webhooks.constructEvent(
                req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
            );
            
            switch (event.type) {
                case 'checkout.session.completed':
                    const session = event.data.object;
                    await handleSuccessfulPayment(session);
                    break;
                case 'payment_intent.succeeded':
                    // 处理成功支付
                    break;
                case 'payment_intent.payment_failed':
                    // 处理失败支付
                    break;
            }
            
            res.json({ received: true });
        } catch (error) {
            res.status(400).send(`Webhook Error: ${error.message}`);
        }
    }
);

async function handleSuccessfulPayment(session) {
    // 更新用户购买状态
    const { productId, userId } = session.metadata;
    
    // 保存到数据库或更新用户状态
    console.log(`用户 ${userId} 购买了 ${productId}`);
    
    // 可以发送确认邮件
    // await sendConfirmationEmail(userId, productId);
}

app.listen(3000, () => {
    console.log('服务器运行在 http://localhost:3000');
});
```

### 3. 成功页面 (success.html)
```html
<!DOCTYPE html>
<html>
<head>
    <title>支付成功</title>
</head>
<body>
    <h1>🎉 支付成功！</h1>
    <p>感谢你的购买！购买物品已添加到你的账户。</p>
    <p>如果物品没有立即生效，请刷新游戏页面。</p>
    <button onclick="window.close()">关闭窗口</button>
    
    <script>
        // 通知主窗口支付成功
        if (window.opener) {
            window.opener.postMessage({
                type: 'payment_success',
                productId: new URLSearchParams(window.location.search).get('product')
            }, '*');
        }
        
        // 自动关闭窗口
        setTimeout(() => {
            window.close();
        }, 3000);
    </script>
</body>
</html>
```

## 安全考虑

### 1. API密钥安全
- 公开密钥可以放在前端
- 秘密密钥必须放在后端
- 使用环境变量存储密钥

### 2. 支付验证
- 使用Stripe Webhook验证支付
- 不要信任前端传递的支付状态
- 验证Webhook签名

### 3. 用户数据
- 不要存储信用卡信息
- 使用Stripe的Customer对象管理用户
- 遵守PCI DSS合规要求

## 测试计划

### 测试信用卡号
```
卡号: 4242 4242 4242 4242
有效期: 任意未来日期
CVC: 任意三位数
邮编: 任意五位数
```

### 测试场景
1. 成功支付流程
2. 支付失败处理
3. 网络中断恢复
4. 重复支付防止
5. 退款流程测试

## 部署要求

### 服务器要求
- HTTPS域名（Stripe要求）
- 简单的Node.js/Express服务器
- 环境变量配置
- Webhook端点可公开访问

### 域名配置
```
https://game.yourdomain.com/          # 游戏主页面
https://game.yourdomain.com/api/      # API端点
https://game.yourdomain.com/success   # 支付成功页面
https://game.yourdomain.com/cancel    # 支付取消页面
```

## 成本估算

### 一次性成本
- 域名注册: $10-20/年
- SSL证书: 免费 (Let's Encrypt)
- 服务器: $5-10/月 (VPS)

### 交易成本
- Stripe费率: 2.9% + $0.30 每笔交易
- 预计交易量: 根据用户数估算

## 替代方案

### 方案A：第三方支付平台
- **Gumroad**: 简单集成，处理所有支付逻辑
- **Payhip**: 数字产品销售平台
- **Paddle**: 游戏支付专家

### 方案B：平台内置支付
- **Itch.io**: 内置支付系统，适合游戏
- **Google Play**: 应用内购买API
- **微信小游戏**: 虚拟支付API

### 方案C：简化实现
1. 使用Stripe Payment Links
2. 手动激活购买码
3. 捐赠模式替代购买

## 实施时间表

### 第1天：设置和开发
- 注册Stripe账号
- 设置开发环境
- 实现前端支付逻辑
- 创建后端API

### 第2天：测试和优化
- 完整支付流程测试
- 错误处理测试
- 性能优化
- 安全审计

### 第3天：部署和监控
- 部署到生产环境
- 设置监控和日志
- 创建用户文档
- 准备营销材料

## 风险缓解

### 技术风险
- **支付失败**: 提供清晰的错误提示和重试机制
- **服务器宕机**: 使用云服务商的高可用方案
- **安全漏洞**: 定期安全审计和更新

### 业务风险
- **低转化率**: A/B测试定价和支付流程
- **退款纠纷**: 明确的退款政策和客服支持
- **合规问题**: 遵守各地支付法规

## 成功指标

### 技术指标
- 支付成功率 > 95%
- 支付完成时间 < 30秒
- 错误率 < 1%

### 业务指标
- 购买转化率
- 平均交易金额
- 用户留存率
- 收入增长

## 下一步行动

### 立即行动
1. 注册Stripe账号
2. 获取API密钥
3. 设置测试环境

### 开发任务
1. 集成Stripe.js到前端
2. 创建后端API服务
3. 实现Webhook处理
4. 测试完整流程

### 部署任务
1. 配置生产环境
2. 设置域名和SSL
3. 部署代码
4. 监控设置