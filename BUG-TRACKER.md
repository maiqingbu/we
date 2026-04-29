# Bug Tracker - wx-typesetter

> 还原点：`a999f1a` - 迭代1还原点：材料库+表格+工具栏滚动条+图床上传修复

---

## ✅ 已修复（迭代2）

### FIX-007：图床上传后仍提示未上传 ✅
- **位置**：`src/renderer/src/editor/Editor.tsx`
- **根因**：`onUpdate`（1秒防抖）和 `handleUploadBase64Images` 的 `finally` 块存在竞态条件。每次 `dispatch(tr)` 重置防抖计时器，`finally` 块正确设置 `base64Count=0` 后，防抖回调仍会触发并覆盖值。
- **修复**：在 `finally` 块中、设置 `base64Count` 前，先 `clearTimeout(lintTimerRef.current)` 取消防抖回调。

### FIX-008：段落统计错误 ✅
- **位置**：`src/renderer/src/lib/linter/statistics.ts` → `countParagraphs()`
- **根因**：`containerParents` 缺少 `column`（分栏布局的列容器），导致分栏内的段落不被计入。
- **修复**：在 `containerParents` 中补充 `'column'`。

### FIX-009：敏感词标记/跳转位置错误 ✅
- **位置**：`src/renderer/src/editor/extensions/LintHighlight.ts` → `buildOffsetMap()`
- **根因**：旧实现用 `doc.descendants()` 遍历，在每一层嵌套的 block 节点处都插入虚拟 `\n`，而 ProseMirror 的 `getText()` 只在同级兄弟 block 之间插入 `\n`。嵌套结构（如 blockquote、list）导致多余的 `\n`，使所有后续偏移量错位。
- **修复**：重写 `buildOffsetMap` 为递归遍历，使用 `node.forEach` 只在同级兄弟 block 之间插入虚拟 `\n`，与 `getText()` 逻辑一致。

### FIX-010：模板双击不可编辑 ✅
- **位置**：`src/renderer/src/editor/extensions/TemplateBlock.ts` → `addNodeView()`
- **根因**：`atom: true` 节点被 ProseMirror 视为不透明叶节点，在事件到达 `stopEvent` 之前就拦截了 `keydown` 等键盘事件。
- **修复**：放弃 `contentEditable` 切换方案，改为双击时创建脱离 ProseMirror DOM 的浮层编辑器（绝对定位 div），编辑完成后通过 `tr.setNodeMarkup` 同步回 `node.attrs.html`。

### FIX-011：添加的元素预览区不可见 ✅
- **位置**：`src/renderer/src/editor/extensions/TemplateBlock.ts` + `src/renderer/src/themes/PreviewRenderer.tsx`
- **根因**：`renderHTML` 输出空 `<section>` 标签，依赖 `getEditorHtml` 正则后处理展开内容。正则匹配脆弱，且 DOMPurify 可能剥离模板内部内容。
- **修复**：
  1. `renderHTML` 将模板内容存入 `data-html` 属性（DOMPurify 白名单已有此属性）
  2. `PreviewRenderer` 新增 `expandTemplateBlocks()`，在 DOMPurify 清洗前从 `data-html` 展开 section 内容
  3. 移除 `getEditorHtml` 包装函数，`useEditor.ts` 直接用 `editor.getHTML()`

---

## ✅ 已修复

### FIX-001：工具栏被裁切/无法滚动
- **修复**：移除折叠机制，改为 `overflow-x: auto` + 自定义 4px 细滚动条（`.toolbar-scroll`）
- **文件**：`Toolbar.tsx`, `main.css`

### FIX-002：编辑区鼠标滚轮不工作
- **修复**：移除之前添加的 `wheel` 事件监听器（它干扰了浏览器原生滚动），`.tiptap` 的 `overflow-y: auto` 原生处理滚动
- **文件**：`Editor.tsx`

### FIX-003：表格浮动菜单延迟显示
- **修复**：移除 `updateDelay={100}`，菜单立即显示
- **文件**：`Editor.tsx`

### FIX-004：表格合并/拆分按钮 disabled 状态不更新
- **修复**：添加 `useEffect` 订阅 `editor.on('selectionUpdate')` 和 `editor.on('transaction')` 事件，强制组件在选区变化时重新渲染
- **文件**：`TableBubbleMenu.tsx`

### FIX-005：TemplateBlock renderHTML 序列化报错
- **修复**：移除 `renderHTML` 中的 `0`（content hole），atom 叶节点不允许有 content hole
- **文件**：`TemplateBlock.ts`

### FIX-006：图床检测改用 ProseMirror 节点遍历
- **修复**：`countBase64Images(html)` 改为直接遍历 `editor.state.doc.descendants` 检查 `node.attrs.src`
- **文件**：`Editor.tsx`

---

## 📋 验收标准

### 表格功能（图二）— 10 条全部通过
| # | 标准 | 状态 |
|---|------|------|
| 1 | 光标点进表格→浮动菜单立刻出现 | ✅ |
| 2 | 下方插入行 | ✅ |
| 3 | 右侧插入列 | ✅ |
| 4 | 删除当前行 | ✅ |
| 5 | 选中多单元格→合并可用 | ✅ |
| 6 | 合并单元格→拆分可用 | ✅ |
| 7 | 切换表头→背景灰+加粗 | ✅ |
| 8 | 删除整个表格 | ✅ |
| 9 | 光标移出→菜单消失 | ✅ |
| 10 | 按钮正确置灰 | ✅ |

### 工具栏（图三）— 部分通过
| # | 标准 | 状态 |
|---|------|------|
| 1 | 默认窗口所有按钮可见 | ⚠️ 改为滚动方案 |
| 2 | 缩小窗口折叠进"更多" | ⚠️ 改为滚动方案 |
| 3 | 所有按钮有 Tooltip | ✅ |
| 4 | 按钮激活态高亮 | ⚠️ 需逐个验证 |
