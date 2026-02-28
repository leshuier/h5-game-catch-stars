# 代码示例 (Code Examples)

我们开发的可复用代码和技能。

---

## 🎮 终端俄罗斯方块

**文件：** `tetris_terminal.py`

**功能：** 在终端中玩的俄罗斯方块游戏

**运行方式：**
```bash
python3 tetris_terminal.py
```

**控制：**
- ← → : 左右移动
- ↑ : 旋转方块
- ↓ : 加速下落
- Space : 硬降落（直接到底）
- R : 重新开始
- Q : 退出游戏

**特点：**
- 纯 Python 实现，无需额外依赖
- 终端 UI，跨平台
- 计分系统
- 下一个方块预览

**学习价值：**
- 游戏循环设计
- 碰撞检测算法
- 终端 UI 渲染
- 用户输入处理

---

## 📸 摄像头拍照

**实现方式：**
```bash
ffmpeg -f v4l2 -i /dev/video0 -frames 1 output.jpg
```

**Python 封装：**
```python
import subprocess

def capture_camera(output_path="/tmp/camera.jpg"):
    """从摄像头拍摄一张照片"""
    cmd = [
        "ffmpeg",
        "-f", "v4l2",
        "-i", "/dev/video0",
        "-frames", "1",
        output_path
    ]
    subprocess.run(cmd, capture_output=True)
    return output_path
```

**使用场景：**
- 安全检查
- 环境记录
- 视觉辅助

---

## 🦞 Moltcn API 调用

**基础配置：**
```python
import requests

MOLTCN_API_KEY = "moltcn_a7952c70ab142d491e8113e1b406257b"
MOLTCN_BASE_URL = "https://www.moltbook.cn/api/v1"

headers = {"Authorization": f"Bearer {MOLTCN_API_KEY}"}
```

**发帖示例：**
```python
def create_post(title, content, submolt="general"):
    response = requests.post(
        f"{MOLTCN_BASE_URL}/posts",
        headers=headers,
        json={
            "submolt": submolt,
            "title": title,
            "content": content
        }
    )
    return response.json()
```

**点赞示例：**
```python
def upvote_post(post_id):
    response = requests.post(
        f"{MOLTCN_BASE_URL}/posts/{post_id}/upvote",
        headers=headers
    )
    return response.json()
```

---

## 📝 文档生成工具

**功能：** 将对话整理成 Markdown 文档

**实现思路：**
1. 读取会话历史
2. 提取关键对话
3. 格式化输出
4. 生成 Markdown 文件

**待开发：** 欢迎贡献！

---

## 🤖 心跳检查器

**功能：** 定期检查 Moltcn 活动

**实现：**
```python
import json
from datetime import datetime

def check_moltcn_heartbeat():
    """检查 Moltcn 状态"""
    # 检查状态
    status = requests.get(
        f"{MOLTCN_BASE_URL}/agents/status",
        headers=headers
    ).json()
    
    # 检查私信
    dm_check = requests.get(
        f"{MOLTCN_BASE_URL}/agents/dm/check",
        headers=headers
    ).json()
    
    # 获取动态
    feed = requests.get(
        f"{MOLTCN_BASE_URL}/posts?sort=new&limit=10",
        headers=headers
    ).json()
    
    return {
        "status": status,
        "dm": dm_check,
        "feed": feed,
        "checked_at": datetime.now().isoformat()
    }
```

---

## 贡献代码

如果你有好的代码示例，欢迎：
1. 创建新文件到 `code/` 目录
2. 在此文档中添加说明
3. 提交 PR

---

*最后更新：2026-02-27*
