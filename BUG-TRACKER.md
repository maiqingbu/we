# Bug Tracker - wx-typesetter

> 还原点：`a999f1a` - 迭代1还原点：材料库+表格+工具栏滚动条+图床上传修复

---

## 🔴 待修复（迭代2）

### BUG-001：图床上传后仍提示未上传
- **优先级**：高
- **位置**：`src/renderer/src/editor/Editor.tsx`
- **现象**：图片上传到图床成功后（右下角显示成功），编辑器顶部仍显示"此文档包含 N 张未上传图片"
- **已尝试的修复**：
  1. ❌ 字符串替换 `newHtml.replace(src, url)` — base64 特殊字符导致匹配失败
  2. ❌ ProseMirror 事务 `tr.setNodeMarkup` — 异步上传期间文档 pos 变化导致事务静默失败
  3. ❌ 改用每次上传后从最新文档查找并替换 — 仍未解决（用户反馈仍存在）
  4. ✅ 检测方式改为 ProseMirror 节点遍历（替代 HTML 字符串正则）
- **根因分析**：可能在于 ImageUpload 扩展的自动上传路径（拖拽/粘贴），上传成功后 `view.dispatch` 替换 src 时，文档已被修改导致 dispatch 静默失败。需要添加 dispatch 失败的重试机制或回退策略
- **修复方向**：
  - 在 ImageUpload.ts 中添加 dispatch 失败检测和重试
  - 或在上传完成后重新扫描文档确认 src 已更新
  - 添加调试日志定位具体是哪条路径失败

### BUG-002：段落统计错误
- **优先级**：中
- **位置**：`src/renderer/src/lib/linter/statistics.ts` → `countParagraphs()`
- **现象**：状态栏显示的段落数与实际不符
- **根因**：`containerParents` 只包含 `doc, blockquote, listItem, taskItem`，缺少 `tableCell` 和 `tableHeader`。表格单元格内的段落不会被计入。`templateBlock`（材料库节点）内的段落也未计入
- **修复方向**：在 `containerParents` 中补充 `tableCell`, `tableHeader`，并考虑 `templateBlock` 内的段落

### BUG-003：敏感词标记/跳转位置错误
- **优先级**：中
- **位置**：`src/renderer/src/editor/Editor.tsx` → `handleJump()` + `src/renderer/src/lib/linter/sensitiveChecker.ts`
- **现象**：敏感词检测到的位置与编辑器中实际位置不匹配，点击跳转后定位不准确
- **根因**：`checkSensitive` 用 `plainText.indexOf` 获取位置（基于 `editor.getText()` 的纯文本偏移），`handleJump` 用 `nodesBetween` 遍历 ProseMirror 文档树转换位置。两者对 block 节点（段落分隔符）的偏移计算不一致——`handleJump` 在遇到 block 节点时 `textOffset += 1`，但 `editor.getText()` 中表格、代码块等特殊节点的换行符数量可能不同
- **修复方向**：统一位置计算逻辑，改用 ProseMirror 的 `doc.textBetween()` 确保偏移量一致

### BUG-004：模板双击不可编辑
- **优先级**：中
- **位置**：`src/renderer/src/editor/extensions/TemplateBlock.ts` → `addNodeView()`
- **现象**：双击模板材料后无法编辑其中的文字
- **已尝试的修复**：添加了 `stopEvent` 在编辑模式下阻止 ProseMirror 拦截键盘事件
- **根因**：atom 节点本身会拦截编辑事件，`contentEditable` 切换可能被 ProseMirror 覆盖
- **修复方向**：验证 `stopEvent` 是否生效；考虑将 atom 改为非 atom 节点（但会影响序列化）；或使用 ProseMirror 的 `decorations` 方案替代 NodeView

### BUG-005：添加的元素预览区不可见
- **优先级**：中
- **位置**：`src/renderer/src/themes/PreviewRenderer.tsx` + `src/renderer/src/editor/extensions/TemplateBlock.ts` → `getEditorHtml()`
- **现象**：在编辑器中添加材料后，右侧预览区不显示该材料内容
- **已尝试的修复**：修复了 `renderHTML` 返回 `0` 导致 atom 叶节点序列化报错（"Content hole not allowed in a leaf node spec"），改用正则替换方案展开 atom 节点内容
- **根因**：`getEditorHtml` 的正则替换可能未正确匹配 `editor.getHTML()` 的输出格式
- **修复方向**：需要实际运行验证 `editor.getHTML()` 对 atom 节点的输出格式，确认正则匹配正确

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
