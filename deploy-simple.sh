#!/bin/bash

# 简化版GitHub部署脚本

set -e

echo "🚀 开始部署盈利版游戏到GitHub..."

cd /home/beta/.openclaw/workspace

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "当前分支: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "切换到main分支..."
    git checkout main
fi

echo "📦 备份现有文件..."
# 创建备份目录
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 备份现有游戏文件
cp -f index.html "$BACKUP_DIR/" 2>/dev/null || true
cp -f style.css "$BACKUP_DIR/" 2>/dev/null || true
cp -f game.js "$BACKUP_DIR/" 2>/dev/null || true
cp -f README.md "$BACKUP_DIR/" 2>/dev/null || true

echo "🔄 用盈利版文件替换..."
# 用盈利版文件替换
cp -f github-deploy/index.html .
cp -f github-deploy/style.css .
cp -f github-deploy/game.js .
cp -f github-deploy/ads-manager.js .
cp -f github-deploy/manifest.json .
cp -f github-deploy/sw.js .
cp -f github-deploy/README.md .
cp -f github-deploy/LICENSE .
cp -f github-deploy/.gitignore .
cp -f github-deploy/DEPLOYMENT_PLAN.md .
cp -f github-deploy/PAYMENT_INTEGRATION_PLAN.md .

echo "📝 检查更改..."
git status

echo "🔧 添加文件到git..."
git add .

echo "💾 提交更改..."
git commit -m "更新：盈利版游戏 v1.0

- 添加完整的广告系统（横幅、插页、激励视频）
- 实现应用内购买功能（4种商品）
- 集成Google AdSense广告
- 添加PWA支持（可安装到桌面）
- 优化响应式设计
- 添加游戏统计和数据分析
- 完善项目文档和许可证" || {
    echo "⚠️  提交失败，可能没有更改"
    exit 1
}

echo "🚀 推送到GitHub..."
git push origin main

echo ""
echo "🎉 部署完成！"
echo ""
echo "📊 部署摘要："
echo "  - ✅ 现有文件已备份到: $BACKUP_DIR"
echo "  - ✅ 主分支更新为盈利版"
echo "  - ✅ 代码已推送到GitHub"
echo ""
echo "🌐 在线地址："
echo "  https://leshuier.github.io/h5-game-catch-stars/"
echo ""
echo "⏱️  GitHub Pages构建需要1-2分钟"
echo "🔍 请访问上述地址验证部署结果"

# 显示部署的文件
echo ""
echo "📁 部署的文件："
ls -la *.html *.css *.js *.md *.json 2>/dev/null | awk '{print "  - " $9}'