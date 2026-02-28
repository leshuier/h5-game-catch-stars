#!/usr/bin/env python3
"""
终端版俄罗斯方块游戏
使用字符界面，无需图形库
"""

import os
import sys
import time
import random
import termios
import tty
import select

# 游戏常量
GRID_WIDTH = 10
GRID_HEIGHT = 20

# 方块形状定义（使用字符表示）
SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]],  # O
    [[1, 1, 1], [0, 1, 0]],  # T
    [[1, 1, 1], [1, 0, 0]],  # J
    [[1, 1, 1], [0, 0, 1]],  # L
    [[0, 1, 1], [1, 1, 0]],  # S
    [[1, 1, 0], [0, 1, 1]]   # Z
]

# 方块字符
SHAPE_CHARS = ['█', '█', '█', '█', '█', '█', '█']

class Tetromino:
    def __init__(self):
        self.shape_index = random.randint(0, len(SHAPES) - 1)
        self.shape = SHAPES[self.shape_index]
        self.char = SHAPE_CHARS[self.shape_index]
        self.x = GRID_WIDTH // 2 - len(self.shape[0]) // 2
        self.y = 0
        
    def rotate(self):
        # 转置矩阵并反转每一行来实现90度旋转
        rotated = [[self.shape[y][x] for y in range(len(self.shape)-1, -1, -1)] 
                  for x in range(len(self.shape[0]))]
        return rotated
    
    def get_rotated(self):
        return self.rotate()

class TerminalTetris:
    def __init__(self):
        self.grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.current_piece = Tetromino()
        self.next_piece = Tetromino()
        self.game_over = False
        self.score = 0
        self.level = 1
        self.lines_cleared = 0
        self.fall_speed = 0.5  # 方块下落速度（秒）
        self.last_fall_time = time.time()
        
        # 保存终端设置
        self.old_settings = termios.tcgetattr(sys.stdin)
        
    def __del__(self):
        # 恢复终端设置
        termios.tcsetattr(sys.stdin, termios.TCSADRAIN, self.old_settings)
    
    def clear_screen(self):
        os.system('clear' if os.name == 'posix' else 'cls')
    
    def draw(self):
        output = []
        output.append("=" * 50)
        output.append(f"俄罗斯方块 - 分数: {self.score} | 等级: {self.level} | 消除行数: {self.lines_cleared}")
        output.append("=" * 50)
        output.append("")
        
        # 创建显示网格（包含当前方块）
        display_grid = [row[:] for row in self.grid]
        
        # 添加当前方块到显示网格
        for y, row in enumerate(self.current_piece.shape):
            for x, cell in enumerate(row):
                if cell and 0 <= self.current_piece.y + y < GRID_HEIGHT:
                    display_grid[self.current_piece.y + y][self.current_piece.x + x] = self.current_piece.shape_index + 1
        
        # 绘制游戏区域
        output.append("+" + "-" * (GRID_WIDTH * 2) + "+")
        for y in range(GRID_HEIGHT):
            line = "|"
            for x in range(GRID_WIDTH):
                if display_grid[y][x]:
                    line += "██"
                else:
                    line += "  "
            line += "|"
            output.append(line)
        output.append("+" + "-" * (GRID_WIDTH * 2) + "+")
        
        # 绘制下一个方块预览
        output.append("")
        output.append("下一个方块:")
        for row in self.next_piece.shape:
            line = "  "
            for cell in row:
                if cell:
                    line += "██"
                else:
                    line += "  "
            output.append(line)
        
        # 绘制操作说明
        output.append("")
        output.append("操作说明:")
        output.append("  ← → : 左右移动")
        output.append("  ↑   : 旋转")
        output.append("  ↓   : 加速下落")
        output.append("  空格 : 直接落下")
        output.append("  R   : 重新开始")
        output.append("  Q   : 退出游戏")
        
        if self.game_over:
            output.append("")
            output.append("=" * 50)
            output.append("游戏结束!")
            output.append(f"最终分数: {self.score}")
            output.append("按 R 重新开始")
            output.append("=" * 50)
        
        self.clear_screen()
        print("\n".join(output))
    
    def check_collision(self, shape, x, y):
        for shape_y, row in enumerate(shape):
            for shape_x, cell in enumerate(row):
                if cell:
                    # 检查是否超出边界
                    if (x + shape_x < 0 or x + shape_x >= GRID_WIDTH or
                        y + shape_y >= GRID_HEIGHT):
                        return True
                    # 检查是否与已有方块重叠
                    if y + shape_y >= 0 and self.grid[y + shape_y][x + shape_x]:
                        return True
        return False
    
    def merge_piece(self):
        for y, row in enumerate(self.current_piece.shape):
            for x, cell in enumerate(row):
                if cell:
                    grid_y = self.current_piece.y + y
                    grid_x = self.current_piece.x + x
                    if grid_y >= 0:  # 确保在网格内
                        self.grid[grid_y][grid_x] = self.current_piece.shape_index + 1
    
    def clear_lines(self):
        lines_to_clear = []
        for y in range(GRID_HEIGHT):
            if all(self.grid[y]):
                lines_to_clear.append(y)
        
        for line in lines_to_clear:
            # 移除满行
            del self.grid[line]
            # 在顶部添加新行
            self.grid.insert(0, [0 for _ in range(GRID_WIDTH)])
        
        # 更新分数
        if lines_to_clear:
            self.lines_cleared += len(lines_to_clear)
            self.score += (1, 2, 5, 10)[min(len(lines_to_clear) - 1, 3)] * 100 * self.level
            # 每清除10行升一级
            self.level = self.lines_cleared // 10 + 1
            self.fall_speed = max(0.05, 0.5 - (self.level - 1) * 0.05)
        
        return len(lines_to_clear)
    
    def move_piece(self, dx, dy):
        new_x = self.current_piece.x + dx
        new_y = self.current_piece.y + dy
        
        if not self.check_collision(self.current_piece.shape, new_x, new_y):
            self.current_piece.x = new_x
            self.current_piece.y = new_y
            return True
        return False
    
    def rotate_piece(self):
        rotated = self.current_piece.get_rotated()
        if not self.check_collision(rotated, self.current_piece.x, self.current_piece.y):
            self.current_piece.shape = rotated
            return True
        return False
    
    def hard_drop(self):
        while self.move_piece(0, 1):
            pass
        self.lock_piece()
    
    def lock_piece(self):
        self.merge_piece()
        self.clear_lines()
        self.current_piece = self.next_piece
        self.next_piece = Tetromino()
        
        # 检查游戏是否结束
        if self.check_collision(self.current_piece.shape, self.current_piece.x, self.current_piece.y):
            self.game_over = True
    
    def get_key(self):
        # 非阻塞获取按键
        if select.select([sys.stdin], [], [], 0.1)[0]:
            key = sys.stdin.read(1)
            if key == '\x1b':  # 处理方向键
                # 读取接下来的两个字符
                if select.select([sys.stdin], [], [], 0.1)[0]:
                    seq = sys.stdin.read(2)
                    if seq == '[A':
                        return 'up'
                    elif seq == '[B':
                        return 'down'
                    elif seq == '[C':
                        return 'right'
                    elif seq == '[D':
                        return 'left'
            elif key == ' ':
                return 'space'
            elif key.lower() == 'q':
                return 'quit'
            elif key.lower() == 'r':
                return 'restart'
            else:
                return key
        return None
    
    def reset_game(self):
        self.grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.current_piece = Tetromino()
        self.next_piece = Tetromino()
        self.game_over = False
        self.score = 0
        self.level = 1
        self.lines_cleared = 0
        self.fall_speed = 0.5
        self.last_fall_time = time.time()
    
    def run(self):
        # 设置终端为非阻塞模式
        tty.setcbreak(sys.stdin.fileno())
        
        try:
            while True:
                current_time = time.time()
                
                # 处理按键输入
                key = self.get_key()
                
                if key == 'quit':
                    break
                
                if self.game_over:
                    if key == 'restart':
                        self.reset_game()
                else:
                    if key == 'left':
                        self.move_piece(-1, 0)
                    elif key == 'right':
                        self.move_piece(1, 0)
                    elif key == 'down':
                        self.move_piece(0, 1)
                    elif key == 'up':
                        self.rotate_piece()
                    elif key == 'space':
                        self.hard_drop()
                    elif key == 'restart':
                        self.reset_game()
                
                # 自动下落
                if not self.game_over and current_time - self.last_fall_time >= self.fall_speed:
                    if not self.move_piece(0, 1):
                        self.lock_piece()
                    self.last_fall_time = current_time
                
                # 绘制游戏界面
                self.draw()
                
                # 控制帧率
                time.sleep(0.05)
        
        except KeyboardInterrupt:
            pass
        finally:
            # 恢复终端设置
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, self.old_settings)
            self.clear_screen()
            print("游戏结束！谢谢游玩！")

if __name__ == "__main__":
    game = TerminalTetris()
    game.run()