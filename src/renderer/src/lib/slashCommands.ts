import type { Editor } from '@tiptap/react'
import {
  Heading1, Heading2, Heading3, Pilcrow, List, ListOrdered,
  ListChecks, Quote, Code2, Minus, Image, Link, Table, Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface SlashCommand {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  keywords: string[]
  group: '基础块' | '样式' | '插入' | 'AI'
  action: (editor: Editor) => void
}

export const SLASH_COMMANDS: SlashCommand[] = [
  // 基础块
  { id: 'h1', title: '一级标题', subtitle: '大号粗体标题', icon: Heading1, keywords: ['h1', 'heading', '标题', 'title'], group: '基础块',
    action: (e) => e.chain().focus().setHeading({ level: 1 }).run() },
  { id: 'h2', title: '二级标题', subtitle: '中号粗体标题', icon: Heading2, keywords: ['h2', '标题'], group: '基础块',
    action: (e) => e.chain().focus().setHeading({ level: 2 }).run() },
  { id: 'h3', title: '三级标题', subtitle: '小号粗体标题', icon: Heading3, keywords: ['h3', '标题'], group: '基础块',
    action: (e) => e.chain().focus().setHeading({ level: 3 }).run() },
  { id: 'p', title: '正文', subtitle: '普通段落', icon: Pilcrow, keywords: ['p', '正文', '段落'], group: '基础块',
    action: (e) => e.chain().focus().setParagraph().run() },
  { id: 'ul', title: '无序列表', subtitle: '带圆点的列表', icon: List, keywords: ['list', 'ul', '列表'], group: '基础块',
    action: (e) => e.chain().focus().toggleBulletList().run() },
  { id: 'ol', title: '有序列表', subtitle: '带数字的列表', icon: ListOrdered, keywords: ['list', 'ol', '编号'], group: '基础块',
    action: (e) => e.chain().focus().toggleOrderedList().run() },
  { id: 'task', title: '任务列表', subtitle: '带复选框', icon: ListChecks, keywords: ['todo', 'task', '任务', '待办'], group: '基础块',
    action: (e) => e.chain().focus().toggleTaskList().run() },
  { id: 'quote', title: '引用', subtitle: '块引用', icon: Quote, keywords: ['quote', '引用'], group: '基础块',
    action: (e) => e.chain().focus().setBlockquote().run() },
  { id: 'code', title: '代码块', subtitle: '带语法高亮', icon: Code2, keywords: ['code', '代码'], group: '基础块',
    action: (e) => e.chain().focus().setCodeBlock().run() },
  { id: 'hr', title: '分割线', subtitle: '水平分隔线', icon: Minus, keywords: ['hr', '分割', 'divider'], group: '基础块',
    action: (e) => e.chain().focus().setHorizontalRule().run() },

  // 插入
  { id: 'image', title: '图片', subtitle: '插入图片', icon: Image, keywords: ['img', '图片'], group: '插入',
    action: (e) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = () => {
        const file = input.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
          e.chain().focus().setImage({ src: reader.result as string }).run()
        }
        reader.readAsDataURL(file)
      }
      input.click()
    } },
  { id: 'link', title: '链接', subtitle: '插入超链接', icon: Link, keywords: ['link', '链接', 'url'], group: '插入',
    action: (e) => {
      const url = window.prompt?.('请输入链接地址：')
      if (url) {
        e.chain().focus().setLink({ href: url }).run()
      }
    } },
  { id: 'table', title: '表格', subtitle: '3×3 表格', icon: Table, keywords: ['table', '表格'], group: '插入',
    action: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },

  // AI
  { id: 'ai-polish', title: 'AI 润色当前段', subtitle: '让表达更清晰', icon: Sparkles, keywords: ['ai', '润色', 'polish'], group: 'AI',
    action: () => { window.dispatchEvent(new CustomEvent('ai-polish-current-paragraph')) } },
  { id: 'ai-title', title: 'AI 生成标题', subtitle: '基于全文', icon: Sparkles, keywords: ['ai', '标题', 'title'], group: 'AI',
    action: () => { window.dispatchEvent(new CustomEvent('ai-generate-title')) } },
]

export const COMMAND_GROUPS = ['基础块', '插入', 'AI'] as const
