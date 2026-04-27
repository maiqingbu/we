import type { Editor } from '@tiptap/react'
import {
  ArrowUpFromLine,
  ArrowDownFromLine,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Minus,
  Merge,
  Split,
  Heading,
  Trash2,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TableBubbleMenuContentProps {
  editor: Editor
}

function TableBubbleMenuContent({ editor }: TableBubbleMenuContentProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border bg-white p-1 shadow-lg">
      {/* ===== 组1：行操作 ===== */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().addRowBefore().run()}
          >
            <ArrowUpFromLine className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">上方插入行</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <ArrowDownFromLine className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">下方插入行</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">删除当前行</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      {/* ===== 组2：列操作 ===== */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            <ArrowLeftFromLine className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">左侧插入列</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <ArrowRightFromLine className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">右侧插入列</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <Minus className="h-3.5 w-3.5 rotate-90" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">删除当前列</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      {/* ===== 组3：单元格操作 ===== */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().mergeCells().run()}
            disabled={!editor.can().mergeCells()}
          >
            <Merge className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">合并单元格</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().splitCell().run()}
            disabled={!editor.can().splitCell()}
          >
            <Split className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">拆分单元格</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          >
            <Heading className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">切换表头</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">删除整个表格</TooltipContent>
      </Tooltip>
    </div>
  )
}

export { TableBubbleMenuContent }
