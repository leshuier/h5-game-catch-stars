#!/usr/bin/env python3
"""
俄罗斯方块游戏
使用Pygame库
"""

import pygame
import random
import sys

# 初始化pygame
pygame.init()

# 游戏常量
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
GRID_SIZE = 30
GRID_WIDTH = 10
GRID_HEIGHT = 20
SIDEBAR_WIDTH = 200

# 颜色定义
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 120, 255)
CYAN = (0, 255, 255)
MAGENTA = (255, 0, 255)
YELLOW = (255, 255, 0)
ORANGE = (255, 165, 0)
GRAY = (128, 128, 128)

# 方块形状定义
SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]],  # O
    [[1, 1, 1], [0, 1, 0]],  # T
    [[1, 1, 1], [1, 0, 0]],  # J
    [[1, 1, 1], [0, 0, 1]],  # L
    [[0, 1, 1], [1, 1, 0]],  # S
    [[1, 1, 0], [0, 1, 1]]   # Z
]

# 方块颜色
SHAPE_COLORS = [CYAN, YELLOW, MAGENTA, BLUE, ORANGE, GREEN, RED]

class Tetromino:
    def __init__(self):
        self.shape_index = random.randint(0, len(SHAPES) - 1)
        self.shape = SHAPES[self.shape_index]
        self.color = SHAPE_COLORS[self.shape_index]
        self.x = GRID_WIDTH // 2 - len(self.shape[0]) // 2
        self.y = 0
        
    def rotate(self):
        # 转置矩阵并反转每一行来实现90度旋转
        rotated = [[self.shape[y][x] for y in range(len(self.shape)-1, -1, -1)] 
                  for x in range(len(self.shape[0]))]
        return rotated
    
    def get_rotated(self):
        return self.rotate()

class TetrisGame:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("俄罗斯方块")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont(None, 36)
        self.small_font = pygame.font.SysFont(None, 24)
        
        self.reset_game()
        
    def reset_game(self):
        self.grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.current_piece = Tetromino()
        self.next_piece = Tetromino()
        self.game_over = False
        self.score = 0
        self.level = 1
        self.lines_cleared = 0
        self.fall_speed = 0.5  # 方块下落速度（秒）
        self.fall_time = 0
        
    def draw_grid(self):
        # 绘制游戏区域背景
        grid_rect = pygame.Rect(
            (SCREEN_WIDTH - SIDEBAR_WIDTH - GRID_WIDTH * GRID_SIZE) // 2,
            (SCREEN_HEIGHT - GRID_HEIGHT * GRID_SIZE) // 2,
            GRID_WIDTH * GRID_SIZE,
            GRID_HEIGHT * GRID_SIZE
        )
        pygame.draw.rect(self.screen, BLACK, grid_rect)
        pygame.draw.rect(self.screen, WHITE, grid_rect, 2)
        
        # 绘制网格线
        for x in range(GRID_WIDTH + 1):
            pygame.draw.line(self.screen, GRAY, 
                           (grid_rect.left + x * GRID_SIZE, grid_rect.top),
                           (grid_rect.left + x * GRID_SIZE, grid_rect.bottom), 1)
        for y in range(GRID_HEIGHT + 1):
            pygame.draw.line(self.screen, GRAY,
                           (grid_rect.left, grid_rect.top + y * GRID_SIZE),
                           (grid_rect.right, grid_rect.top + y * GRID_SIZE), 1)
        
        # 绘制已落下的方块
        for y in range(GRID_HEIGHT):
            for x in range(GRID_WIDTH):
                if self.grid[y][x]:
                    color_idx = self.grid[y][x] - 1
                    color = SHAPE_COLORS[color_idx]
                    rect = pygame.Rect(
                        grid_rect.left + x * GRID_SIZE,
                        grid_rect.top + y * GRID_SIZE,
                        GRID_SIZE, GRID_SIZE
                    )
                    pygame.draw.rect(self.screen, color, rect)
                    pygame.draw.rect(self.screen, WHITE, rect, 1)
        
        # 绘制当前下落的方块
        for y, row in enumerate(self.current_piece.shape):
            for x, cell in enumerate(row):
                if cell:
                    rect = pygame.Rect(
                        grid_rect.left + (self.current_piece.x + x) * GRID_SIZE,
                        grid_rect.top + (self.current_piece.y + y) * GRID_SIZE,
                        GRID_SIZE, GRID_SIZE
                    )
                    pygame.draw.rect(self.screen, self.current_piece.color, rect)
                    pygame.draw.rect(self.screen, WHITE, rect, 1)
        
        return grid_rect
    
    def draw_sidebar(self, grid_rect):
        sidebar_rect = pygame.Rect(
            grid_rect.right + 20,
            grid_rect.top,
            SIDEBAR_WIDTH - 40,
            grid_rect.height
        )
        
        # 绘制下一个方块预览
        next_text = self.font.render("下一个:", True, WHITE)
        self.screen.blit(next_text, (sidebar_rect.left, sidebar_rect.top))
        
        # 绘制下一个方块
        next_block_y = sidebar_rect.top + 50
        for y, row in enumerate(self.next_piece.shape):
            for x, cell in enumerate(row):
                if cell:
                    rect = pygame.Rect(
                        sidebar_rect.left + x * GRID_SIZE,
                        next_block_y + y * GRID_SIZE,
                        GRID_SIZE, GRID_SIZE
                    )
                    pygame.draw.rect(self.screen, self.next_piece.color, rect)
                    pygame.draw.rect(self.screen, WHITE, rect, 1)
        
        # 绘制分数和等级
        score_text = self.font.render(f"分数: {self.score}", True, WHITE)
        level_text = self.font.render(f"等级: {self.level}", True, WHITE)
        lines_text = self.font.render(f"消除行数: {self.lines_cleared}", True, WHITE)
        
        self.screen.blit(score_text, (sidebar_rect.left, next_block_y + 150))
        self.screen.blit(level_text, (sidebar_rect.left, next_block_y + 200))
        self.screen.blit(lines_text, (sidebar_rect.left, next_block_y + 250))
        
        # 绘制操作说明
        controls_y = next_block_y + 320
        controls = [
            "操作说明:",
            "← → : 左右移动",
            "↑ : 旋转",
            "↓ : 加速下落",
            "空格 : 直接落下",
            "R : 重新开始",
            "ESC : 退出"
        ]
        
        for i, text in enumerate(controls):
            control_text = self.small_font.render(text, True, WHITE)
            self.screen.blit(control_text, (sidebar_rect.left, controls_y + i * 30))
    
    def draw_game_over(self):
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 180))
        self.screen.blit(overlay, (0, 0))
        
        game_over_text = self.font.render("游戏结束!", True, RED)
        score_text = self.font.render(f"最终分数: {self.score}", True, WHITE)
        restart_text = self.font.render("按 R 重新开始", True, GREEN)
        
        self.screen.blit(game_over_text, 
                        (SCREEN_WIDTH // 2 - game_over_text.get_width() // 2, 
                         SCREEN_HEIGHT // 2 - 60))
        self.screen.blit(score_text,
                        (SCREEN_WIDTH // 2 - score_text.get_width() // 2,
                         SCREEN_HEIGHT // 2))
        self.screen.blit(restart_text,
                        (SCREEN_WIDTH // 2 - restart_text.get_width() // 2,
                         SCREEN_HEIGHT // 2 + 60))
    
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
        lines_cleared = self.clear_lines()
        self.current_piece = self.next_piece
        self.next_piece = Tetromino()
        
        # 检查游戏是否结束
        if self.check_collision(self.current_piece.shape, self.current_piece.x, self.current_piece.y):
            self.game_over = True
    
    def run(self):
        last_time = pygame.time.get_ticks()
        
        while True:
            current_time = pygame.time.get_ticks()
            delta_time = (current_time - last_time) / 1000.0  # 转换为秒
            last_time = current_time
            
            # 处理事件
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                
                if event.type == pygame.KEYDOWN:
                    if self.game_over:
                        if event.key == pygame.K_r:
                            self.reset_game()
                    else:
                        if event.key == pygame.K_LEFT:
                            self.move_piece(-1, 0)
                        elif event.key == pygame.K_RIGHT:
                            self.move_piece(1, 0)
                        elif event.key == pygame.K_DOWN:
                            self.move_piece(0, 1)
                        elif event.key == pygame.K_UP:
                            self.rotate_piece()
                        elif event.key == pygame.K_SPACE:
                            self.hard_drop()
                        elif event.key == pygame.K_r:
                            self.reset_game()
                    
                    if event.key == pygame.K_ESCAPE:
                        pygame.quit()
                        sys.exit()
            
            # 自动下落
            if not self.game_over:
                self.fall_time += delta_time
                if self.fall_time >= self.fall_speed:
                    if not self.move_piece(0, 1):
                        self.lock_piece()
                    self.fall_time = 0
            
            # 绘制
            self.screen.fill((40, 40, 60))  # 深蓝色背景
            
            grid_rect = self.draw_grid()
            self.draw_sidebar(grid_rect)
            
            if self.game_over:
                self.draw_game_over()
            
            pygame.display.flip()
            self.clock.tick(60)

if __name__ == "__main__":
    # 检查是否安装了pygame
    try:
        game = TetrisGame()
        game.run()
    except pygame.error as e:
        print(f"错误: {e}")
        print("请确保已安装pygame库。")
        print("安装命令: pip install pygame")
        sys.exit(1)