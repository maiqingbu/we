import { useCallback } from 'react'
import { GripVertical, ArrowUp, ArrowDown, Copy, Trash2, Type, Heading1, Heading2, Heading3, Quote, Code } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Editor } from '@tiptap/react'

interface BlockMenuProps {
  editor: Editor
}

function BlockMenu({ editor }: BlockMenuProps): React.JSX.Element {
  const getBlockRange = useCallback(() => {
    const { $from } = editor.state.selection
    const from = $from.start()
    const to = $from.end()
    return { from, to }
  }, [editor])

  const insertAbove = useCallback(() => {
    const { $from } = editor.state.selection
    const pos = $from.start()
    editor.chain().focus().insertContentAt(pos, { type: 'paragraph' }).run()
  }, [editor])

  const insertBelow = useCallback(() => {
    const { $from } = editor.state.selection
    const pos = $from.end()
    editor.chain().focus().insertContentAt(pos, { type: 'paragraph' }).run()
  }, [editor])

  const duplicateNode = useCallback(() => {
    const { $from } = editor.state.selection
    const node = $from.parent
    const pos = $from.after()
    if (pos === undefined) return
    editor.chain().focus().insertContentAt(pos, node.toJSON()).run()
  }, [editor])

  const deleteNode = useCallback(() => {
    const { from, to } = getBlockRange()
    // Don't delete if it's the only node
    const docSize = editor.state.doc.content.size
    if (from <= 1 && to >= docSize - 1) return
    editor.chain().focus().deleteRange({ from, to }).run()
  }, [editor, getBlockRange])

  const convertTo = useCallback(
    (type: string, attrs?: Record<string, unknown>) => {
      if (type === 'paragraph') {
        editor.chain().focus().setParagraph().run()
      } else if (type === 'heading') {
        editor.chain().focus().setHeading(attrs as { level: 1 | 2 | 3 | 4 }).run()
      } else if (type === 'blockquote') {
        editor.chain().focus().setBlockquote().run()
      } else if (type === 'codeBlock') {
        editor.chain().focus().setCodeBlock().run()
      }
    },
    [editor]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-grab active:cursor-grabbing"
          contentEditable={false}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="w-48">
        <DropdownMenuItem onClick={insertAbove}>
          <ArrowUp className="mr-2 h-4 w-4" />
          上方插入
        </DropdownMenuItem>
        <DropdownMenuItem onClick={insertBelow}>
          <ArrowDown className="mr-2 h-4 w-4" />
          下方插入
        </DropdownMenuItem>
        <DropdownMenuItem onClick={duplicateNode}>
          <Copy className="mr-2 h-4 w-4" />
          复制段落
        </DropdownMenuItem>
        <DropdownMenuItem onClick={deleteNode} className="text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          删除段落
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            转换为...
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => convertTo('paragraph')}>
              <Type className="mr-2 h-4 w-4" />
              正文
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => convertTo('heading', { level: 1 })}>
              <Heading1 className="mr-2 h-4 w-4" />
              H1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => convertTo('heading', { level: 2 })}>
              <Heading2 className="mr-2 h-4 w-4" />
              H2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => convertTo('heading', { level: 3 })}>
              <Heading3 className="mr-2 h-4 w-4" />
              H3
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => convertTo('blockquote')}>
              <Quote className="mr-2 h-4 w-4" />
              引用
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => convertTo('codeBlock')}>
              <Code className="mr-2 h-4 w-4" />
              代码块
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { BlockMenu }
