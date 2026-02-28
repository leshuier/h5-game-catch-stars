// 游戏主逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 获取Canvas和上下文
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // 游戏状态
    let game = {
        running: false,
        paused: false,
        score: 0,
        lives: 3,
        level: 1,
        speed: 2,
        lastDropTime: 0,
        dropInterval: 1000, // 初始掉落间隔(毫秒)
        objects: [],
        basket: {
            x: canvas.width / 2 - 50,
            y: canvas.height - 40,
            width: 100,
            height: 20,
            speed: 8,
            color: '#4dffea',
            skin: 'default' // 皮肤系统
        },
        keys: {},
        purchases: {
            doubleScore: false,
            rainbowBasket: false,
            sparkleEffect: false
        },
        multiplier: 1 // 分数乘数
    };
    
    // 获取DOM元素
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const levelElement = document.getElementById('level');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const restartBtn = document.getElementById('restart-btn');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const finalLevelElement = document.getElementById('final-level');
    
    // 物体类型
    const OBJECT_TYPES = {
        STAR: { color: '#FFD700', score: 10, radius: 12, emoji: '⭐' },
        GEM: { color: '#4169E1', score: 25, radius: 10, emoji: '💎' },
        BOMB: { color: '#FF4444', score: -1, radius: 14, emoji: '💣' }
    };
    
    // 初始化游戏
    function initGame() {
        game.objects = [];
        game.score = 0;
        game.lives = 3;
        game.level = 1;
        game.speed = 2;
        game.dropInterval = 1000;
        game.lastDropTime = 0;
        game.basket.x = canvas.width / 2 - 50;
        
        // 检查购买状态
        checkPurchases();
        
        updateUI();
        gameOverElement.classList.add('hidden');
    }
    
    // 检查购买状态
    function checkPurchases() {
        const purchases = JSON.parse(localStorage.getItem('game_purchases') || '[]');
        
        // 双倍分数
        if (purchases.includes('powerup_double') || purchases.includes('powerup')) {
            game.purchases.doubleScore = true;
            game.multiplier = 2;
        }
        
        // 彩虹篮子
        if (purchases.includes('skin_rainbow') || purchases.includes('skin1')) {
            game.purchases.rainbowBasket = true;
        }
        
        // 星光特效
        if (purchases.includes('skin_sparkle') || purchases.includes('skin2')) {
            game.purchases.sparkleEffect = true;
        }
    }
    
    // 更新UI显示
    function updateUI() {
        scoreElement.textContent = game.score;
        livesElement.textContent = game.lives;
        levelElement.textContent = game.level;
    }
    
    // 创建掉落物体
    function createObject() {
        const types = [OBJECT_TYPES.STAR, OBJECT_TYPES.GEM, OBJECT_TYPES.BOMB];
        const weights = [0.6, 0.3, 0.1]; // 概率权重
        const rand = Math.random();
        let typeIndex = 0;
        let cumulativeWeight = 0;
        
        for (let i = 0; i < weights.length; i++) {
            cumulativeWeight += weights[i];
            if (rand < cumulativeWeight) {
                typeIndex = i;
                break;
            }
        }
        
        const type = types[typeIndex];
        const object = {
            x: Math.random() * (canvas.width - type.radius * 2) + type.radius,
            y: -type.radius,
            radius: type.radius,
            color: type.color,
            type: type,
            speed: game.speed + Math.random() * 1
        };
        
        game.objects.push(object);
    }
    
    // 绘制篮子
    function drawBasket() {
        ctx.save();
        
        if (game.purchases.rainbowBasket) {
            // 彩虹渐变效果
            const gradient = ctx.createLinearGradient(
                game.basket.x, game.basket.y,
                game.basket.x + game.basket.width, game.basket.y + game.basket.height
            );
            gradient.addColorStop(0, '#FF0000');
            gradient.addColorStop(0.2, '#FF7F00');
            gradient.addColorStop(0.4, '#FFFF00');
            gradient.addColorStop(0.6, '#00FF00');
            gradient.addColorStop(0.8, '#0000FF');
            gradient.addColorStop(1, '#8B00FF');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = game.basket.color;
        }
        
        ctx.fillRect(game.basket.x, game.basket.y, game.basket.width, game.basket.height);
        
        // 篮子装饰
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(game.basket.x + 10, game.basket.y - 5, 80, 5);
        
        // 篮子手柄
        ctx.beginPath();
        ctx.arc(game.basket.x + 50, game.basket.y - 10, 15, Math.PI, 0);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 如果购买了双倍分数，显示特效
        if (game.purchases.doubleScore) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.fillRect(game.basket.x - 5, game.basket.y - 5, game.basket.width + 10, game.basket.height + 10);
            
            // 显示"2x"文字
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';
            ctx.fillText('2x', game.basket.x + game.basket.width/2, game.basket.y - 15);
        }
        
        ctx.restore();
    }
    
    // 绘制物体
    function drawObject(obj) {
        ctx.save();
        
        // 如果购买了星光特效，添加尾迹
        if (game.purchases.sparkleEffect) {
            drawSparkleTrail(obj);
        }
        
        // 绘制圆形物体
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fillStyle = obj.color;
        ctx.fill();
        
        // 添加光泽效果
        ctx.beginPath();
        ctx.arc(obj.x - obj.radius/3, obj.y - obj.radius/3, obj.radius/3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        
        // 绘制表情符号
        ctx.font = `${obj.radius * 1.5}px Arial`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.type.emoji, obj.x, obj.y);
        
        ctx.restore();
    }
    
    // 绘制星光尾迹
    function drawSparkleTrail(obj) {
        ctx.save();
        
        // 创建尾迹渐变
        const gradient = ctx.createRadialGradient(
            obj.x, obj.y, 0,
            obj.x, obj.y, obj.radius * 3
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        // 绘制尾迹
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 添加随机星光点
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * obj.radius * 2;
            const sparkleX = obj.x + Math.cos(angle) * distance;
            const sparkleY = obj.y + Math.sin(angle) * distance;
            const size = Math.random() * 3 + 1;
            
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // 绘制背景
    function drawBackground() {
        // 渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 网格效果
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        // 垂直线
        for (let x = 0; x < canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // 水平线
        for (let y = 0; y < canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // 闪烁星星背景
        const time = Date.now() / 1000;
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(time + i) * 0.5 + 0.5) * canvas.width;
            const y = (i * 25 + time * 50) % canvas.height;
            const size = Math.sin(time * 2 + i) * 2 + 3;
            const opacity = Math.sin(time * 3 + i) * 0.3 + 0.4;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();
        }
    }
    
    // 更新物体位置
    function updateObjects(deltaTime) {
        for (let i = game.objects.length - 1; i >= 0; i--) {
            const obj = game.objects[i];
            obj.y += obj.speed;
            
            // 检查是否被篮子接住
            if (obj.y + obj.radius > game.basket.y && 
                obj.y - obj.radius < game.basket.y + game.basket.height &&
                obj.x + obj.radius > game.basket.x && 
                obj.x - obj.radius < game.basket.x + game.basket.width) {
                
                // 处理接住物体
                handleObjectCaught(obj, i);
                continue;
            }
            
            // 检查是否掉出屏幕
            if (obj.y - obj.radius > canvas.height) {
                // 如果星星或宝石掉出屏幕，扣生命值
                if (obj.type === OBJECT_TYPES.STAR || obj.type === OBJECT_TYPES.GEM) {
                    game.lives--;
                    updateUI();
                    
                    // 显示扣血效果
                    showEffect(obj.x, obj.y, '💔', '#FF4444');
                }
                game.objects.splice(i, 1);
            }
        }
    }
    
    // 处理接住的物体
    function handleObjectCaught(obj, index) {
        // 计算实际得分（应用乘数）
        const actualScore = obj.type.score * game.multiplier;
        
        // 显示得分效果
        showEffect(obj.x, obj.y, `+${actualScore}`, obj.color);
        
        // 更新分数
        game.score += actualScore;
        
        // 如果是炸弹，扣生命值
        if (obj.type === OBJECT_TYPES.BOMB) {
            game.lives--;
            showEffect(obj.x, obj.y, '💥', '#FF4444');
        }
        
        // 移除物体
        game.objects.splice(index, 1);
        
        // 检查升级
        const oldLevel = game.level;
        game.level = Math.floor(game.score / 100) + 1;
        
        if (game.level > oldLevel) {
            // 升级效果
            game.speed += 0.5;
            game.dropInterval = Math.max(300, 1000 - (game.level - 1) * 100);
            showEffect(canvas.width / 2, canvas.height / 2, `等级 ${game.level}!`, '#FFD700');
        }
        
        updateUI();
    }
    
    // 显示特效
    function showEffect(x, y, text, color) {
        const effect = {
            x: x,
            y: y,
            text: text,
            color: color,
            alpha: 1,
            vy: -2
        };
        
        // 绘制特效
        function drawEffect() {
            ctx.save();
            ctx.globalAlpha = effect.alpha;
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = effect.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(effect.text, effect.x, effect.y);
            ctx.restore();
            
            effect.y += effect.vy;
            effect.alpha -= 0.02;
            effect.vy *= 0.95;
            
            if (effect.alpha > 0) {
                requestAnimationFrame(drawEffect);
            }
        }
        
        drawEffect();
    }
    
    // 更新篮子位置
    function updateBasket() {
        if (game.keys['ArrowLeft'] || game.keys['a'] || game.keys['A']) {
            game.basket.x = Math.max(0, game.basket.x - game.basket.speed);
        }
        if (game.keys['ArrowRight'] || game.keys['d'] || game.keys['D']) {
            game.basket.x = Math.min(canvas.width - game.basket.width, game.basket.x + game.basket.speed);
        }
    }
    
    // 检查游戏结束
    function checkGameOver() {
        if (game.lives <= 0) {
            game.running = false;
            finalScoreElement.textContent = game.score;
            finalLevelElement.textContent = game.level;
            gameOverElement.classList.remove('hidden');
            
            // 游戏结束时显示插页广告
            if (window.adManager && window.adManager.userPrefs.adsEnabled) {
                setTimeout(() => {
                    window.adManager.showInterstitial();
                }, 500);
            }
            
            return true;
        }
        return false;
    }
    
    // 游戏主循环
    function gameLoop(timestamp) {
        if (!game.running || game.paused) return;
        
        const deltaTime = timestamp - game.lastDropTime;
        
        // 清空画布
        drawBackground();
        
        // 更新篮子位置
        updateBasket();
        
        // 创建新物体
        if (deltaTime > game.dropInterval) {
            createObject();
            game.lastDropTime = timestamp;
        }
        
        // 更新物体位置
        updateObjects(deltaTime);
        
        // 绘制所有物体
        game.objects.forEach(drawObject);
        
        // 绘制篮子
        drawBasket();
        
        // 检查游戏结束
        if (checkGameOver()) {
            return;
        }
        
        // 继续循环
        requestAnimationFrame(gameLoop);
    }
    
    // 开始游戏
    function startGame() {
        if (!game.running) {
            initGame();
            game.running = true;
            game.paused = false;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
            game.lastDropTime = performance.now();
            requestAnimationFrame(gameLoop);
            
            // 显示插页广告（如果启用）
            if (window.adManager && window.adManager.userPrefs.adsEnabled) {
                // 延迟显示，让游戏先开始
                setTimeout(() => {
                    window.adManager.showInterstitial();
                }, 1000);
            }
        }
    }
    
    // 暂停/继续游戏
    function togglePause() {
        if (!game.running) return;
        
        game.paused = !game.paused;
        if (game.paused) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> 继续';
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
            game.lastDropTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
    }
    
    // 重新开始游戏
    function resetGame() {
        initGame();
        if (game.running) {
            game.running = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }
    
    // 事件监听器
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    restartBtn.addEventListener('click', function() {
        gameOverElement.classList.add('hidden');
        startGame();
    });
    
    // 键盘控制
    document.addEventListener('keydown', function(e) {
        game.keys[e.key] = true;
        
        // 空格键暂停/继续
        if (e.key === ' ' && game.running) {
            togglePause();
            e.preventDefault();
        }
        
        // Enter键开始游戏
        if (e.key === 'Enter' && !game.running) {
            startGame();
            e.preventDefault();
        }
    });
    
    document.addEventListener('keyup', function(e) {
        game.keys[e.key] = false;
    });
    
    // 触摸控制（移动设备）
    let touchStartX = 0;
    
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (!game.running || game.paused) return;
        
        const touchX = e.touches[0].clientX;
        const canvasRect = canvas.getBoundingClientRect();
        const touchInCanvas = touchX - canvasRect.left;
        
        // 移动篮子到触摸位置
        game.basket.x = touchInCanvas - game.basket.width / 2;
        
        // 限制篮子不超出画布
        if (game.basket.x < 0) game.basket.x = 0;
        if (game.basket.x > canvas.width - game.basket.width) {
            game.basket.x = canvas.width - game.basket.width;
        }
    });
    
    // 初始化游戏
    initGame();
    
    // 绘制初始画面
    drawBackground();
    drawBasket();
    
    // 绘制游戏标题
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('点击"开始游戏"按钮开始', canvas.width / 2, canvas.height / 2);
    
    console.log('游戏初始化完成！使用左右箭头键控制篮子，接住星星和宝石，避开炸弹！');
});