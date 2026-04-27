import { Bold, Italic, Underline, Strikethrough, Code } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface FormatGroupProps {
  editor: Editor | null
}

interface FormatButtonProps {
  editor: Editor | null
  onClick: () => void
  isActive: boolean
  tooltip: string
  children: React.ReactNode
}

function FormatButton({ onClick, isActive, tooltip, children }: FormatButtonProps): React.JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', isActive && 'bg-accent text-accent-foreground')}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function FormatGroup({ editor }: FormatGroupProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-0.5">
      <FormatButton
        editor={editor}
        onClick={() => editor?.chain().focus().toggleBold().run()}
        isActive={editor?.isActive('bold') ?? false}
        tooltip="粗体 ⌘B"
      >
        <Bold className="h-4 w-4" />
      </FormatButton>
      <FormatButton
        editor={editor}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        isActive={editor?.isActive('italic') ?? false}
        tooltip="斜体 ⌘I"
      >
        <Italic className="h-4 w-4" />
      </FormatButton>
      <FormatButton
        editor={editor}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        isActive={editor?.isActive('underline') ?? false}
        tooltip="下划线 ⌘U"
      >
        <Underline className="h-4 w-4" />
      </FormatButton>
      <FormatButton
        editor={editor}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        isActive={editor?.isActive('strike') ?? false}
        tooltip="删除线 ⇧⌘X"
      >
        <Strikethrough className="h-4 w-4" />
      </FormatButton>
      <FormatButton
        editor={editor}
        onClick={() => editor?.chain().focus().toggleCode().run()}
        isActive={editor?.isActive('code') ?? false}
        tooltip="行内代码 ⌘E"
      >
        <Code className="h-4 w-4" />
      </FormatButton>
    </div>
  )
}

export { FormatGroup }
