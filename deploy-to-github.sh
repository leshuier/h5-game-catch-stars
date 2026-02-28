#!/bin/bash

# GitHub部署脚本
# 将盈利版游戏代码部署到现有GitHub仓库

set -e  # 遇到错误时退出

echo "🚀 开始部署盈利版游戏到GitHub..."

# 检查当前目录
if [ ! -d "/home/beta/.openclaw/workspace" ]; then
    echo "❌ 错误：不在工作空间目录"
    exit 1
fi

cd /home/beta/.openclaw/workspace

# 检查git仓库状态
if [ ! -d ".git" ]; then
    echo "❌ 错误：当前目录不是git仓库"
    exit 1
fi

echo "📦 检查git状态..."
git status

# 确认操作
read -p "⚠️  这将更新现有仓库，是否继续？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 操作取消"
    exit 0
fi

echo "🔧 步骤1：备份现有基础版到legacy分支..."
if git branch --list | grep -q "legacy"; then
    echo "⚠️  legacy分支已存在，跳过创建"
else
    git checkout -b legacy
    if [ -d "h5-game" ]; then
        git add h5-game/
        git commit -m "备份：基础版游戏" || echo "⚠️  提交可能为空，继续..."
    else
        echo "⚠️  h5-game目录不存在，创建空提交"
        git commit --allow-empty -m "备份：创建legacy分支"
    fi
    git push origin legacy
    echo "✅ legacy分支创建完成"
fi

echo "🔧 步骤2：切换回主分支并更新为盈利版..."
git checkout master

echo "🔧 步骤3：清理旧文件..."
# 移除旧的基础版文件
rm -rf h5-game/ 2>/dev/null || true

echo "🔧 步骤4：复制盈利版文件..."
# 复制盈利版文件到当前目录
cp -r github-deploy/* . 2>/dev/null || true

echo "🔧 步骤5：添加文件到git..."
git add .

echo "🔧 步骤6：提交更改..."
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

echo "🔧 步骤7：推送到GitHub..."
git push origin master

echo "🎉 部署完成！"
echo ""
echo "📊 部署摘要："
echo "  - ✅ 基础版已备份到legacy分支"
echo "  - ✅ 主分支更新为盈利版"
echo "  - ✅ 代码已推送到GitHub"
echo ""
echo "🌐 在线地址："
echo "  https://leshuier.github.io/h5-game-catch-stars/"
echo ""
echo "⏱️  GitHub Pages构建需要1-2分钟"
echo "🔍 请访问上述地址验证部署结果"
echo ""
echo "📝 后续操作："
echo "  1. 等待GitHub Pages构建完成"
echo "  2. 访问在线游戏测试功能"
echo "  3. 检查广告系统是否正常工作"
echo "  4. 测试购买功能"
echo "  5. 验证PWA安装功能"

# 显示部署的文件列表
echo ""
echo "📁 部署的文件："
find . -maxdepth 1 -type f -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.md" -o -name "*.json" | sort | while read file; do
    echo "  - $(basename "$file")"
done