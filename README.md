# 微信公众号排版工具

一款基于 Electron + React + Tiptap 的桌面端微信公众号文章编辑器，提供所见即所得的编辑体验、丰富的素材库、AI 写作辅助和一键导出功能。

## 功能特性

### 富文本编辑器
- 基于 Tiptap 的所见即所得编辑器，支持标题、粗体、斜体、下划线、删除线、文字颜色/高亮
- 字体大小、字体、行高、段间距、首行缩进、文字对齐
- 有序/无序/任务列表、引用块、代码块（语法高亮）、表格（可拖拽调整列宽）
- 插入图片（支持本地和 base64）、链接、分割线
- 多栏布局（图文混排）
- 斜杠命令（输入 `/` 快速插入各种块）
- 查找和替换（`Cmd+F` / `Cmd+H`）
- Markdown 粘贴自动转换

### 主题样式
- 9 套内置主题：默认、优雅、科技、养生、本草纲目、食验室、蓝图、折叠空间
- 自定义主题：基于 CSS 创建个性化样式，支持在预设主题基础上修改
- 实时右侧预览面板，所见即所得

### 素材库
- **分割线**（47 种）：极简、图案、渐变、装饰四大类
- **模板**（18 种）：信息盒、引用卡、高亮重点、CTA 按钮、二维码卡、作者卡、问答卡片、优劣对比、步骤引导、数据统计、关键要点、警告提示、用户评价、编号列表、目录等
- **节日素材**：春节、中秋、圣诞、七夕、国庆，自动识别农历节日并智能推荐
- **SVG 素材**（80 种）：装饰图案、常用图标、徽章标签
- **自定义素材**：选中内容右键保存，支持分组管理、导入/导出

### AI 写作助手
- 支持 DeepSeek、通义千问、豆包三大 AI 平台
- 选中文本即可使用：润色、缩写、扩写、改风格（专业/口语/幽默/严肃/文学）、翻译（英/日/韩）
- 自定义指令：自由输入任何写作需求
- 全文功能：生成标题（5 种风格）、生成摘要、全文校对
- 流式输出，支持取消

### 导入
- Word (.docx)、Markdown (.md)、PDF 文件导入
- 网页 URL 导入（自动提取正文内容）

### 导出
- **复制到公众号**：一键复制带样式内容，粘贴到公众号后台即可
- **长图 PNG**：支持 750px / 1080px / 677px 宽度，适合微博、朋友圈、小红书
- **PDF**：支持 A4、A3、公众号文章宽度
- **HTML**：完整样式 HTML 文件
- **Markdown**：源文件导出

### 图片编辑器
- 基于 Fabric.js 的画布编辑器
- 裁剪、旋转、滤镜、亮度/对比度调节
- 文字覆盖、贴纸、水印
- 图层管理、撤销/重做
- 支持上传到 SM.MS、GitHub 或自定义图床

### 文章管理
- 多文章管理，左侧边栏切换
- 文章版本历史（自动快照，最多保留 30 个版本）
- 样式收藏：保存常用样式配置

### 校对与统计
- 错别字检测（中文词典匹配）
- 敏感词检测（分级：高/中/低）
- 文章统计：字数、段落数、图片数、链接数、预估阅读时间
- 链接可用性检测

### 开发者工具
- 状态栏右键菜单 → 开发者工具
- F12 快捷键切换控制台

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Electron 38 + electron-vite |
| 前端 | React 19 + TypeScript 5.9 |
| 编辑器 | Tiptap 3.22 (ProseMirror) |
| UI | Radix UI + Tailwind CSS 4 + Lucide Icons |
| 状态管理 | Zustand 5 |
| 数据库 | SQLite (better-sqlite3) |
| 图片编辑 | Fabric.js 6 |
| 导入 | mammoth (Word) + marked (MD) + pdf-parse + Readability |
| 导出 | juice (CSS 内联) + html-to-image + turndown |

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建打包

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

构建产物位于 `dist/` 目录。

### 其他命令

```bash
# 仅构建不打包
npm run build

# 代码检查
npm run lint

# 格式化
npm run format

# 类型检查
npm run typecheck
```

## 项目结构

```
wx-typesetter/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts             # 入口、窗口创建
│   │   ├── db/                  # SQLite 数据库
│   │   ├── ipc/                 # IPC 处理器
│   │   └── services/            # 预览服务器等
│   ├── preload/                 # 预加载脚本
│   │   └── index.ts             # API 桥接
│   └── renderer/                # 渲染进程 (React)
│       └── src/
│           ├── editor/          # Tiptap 编辑器
│           │   ├── extensions/  # 自定义扩展
│           │   └── toolbar/     # 工具栏组件
│           ├── components/      # UI 组件
│           ├── lib/             # 工具库
│           │   ├── materials/   # 素材系统
│           │   ├── ai/          # AI 集成
│           │   ├── linter/      # 校对检测
│           │   └── exporter/    # 导出逻辑
│           ├── themes/          # 主题预设
│           └── store/           # Zustand 状态
├── resources/                   # 应用图标
├── build/                       # 构建资源
├── electron-builder.yml         # 打包配置
└── package.json
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + B` | 粗体 |
| `Cmd/Ctrl + I` | 斜体 |
| `Cmd/Ctrl + U` | 下划线 |
| `Cmd/Ctrl + Shift + X` | 删除线 |
| `Cmd/Ctrl + E` | 行内代码 |
| `Cmd/Ctrl + Z` | 撤销 |
| `Cmd/Ctrl + Shift + Z` | 重做 |
| `Cmd/Ctrl + F` | 查找 |
| `Cmd/Ctrl + H` | 查找替换 |
| `Cmd/Ctrl + Shift + E` | 复制到公众号 |
| `F12` | 开发者工具 |
| `/` | 斜杠命令菜单 |

## 许可证

MIT
