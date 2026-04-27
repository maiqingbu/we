import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface AlignGroupProps {
  editor: Editor | null
}

function AlignGroup({ editor }: AlignGroupProps): React.JSX.Element {
  const currentAlign = editor?.isActive({ textAlign: 'center' })
    ? 'center'
    : editor?.isActive({ textAlign: 'right' })
      ? 'right'
      : editor?.isActive({ textAlign: 'justify' })
        ? 'justify'
        : 'left'

  return (
    <div className="flex items-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', currentAlign === 'left' && 'bg-accent text-accent-foreground')}
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">左对齐</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', currentAlign === 'center' && 'bg-accent text-accent-foreground')}
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">居中</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', currentAlign === 'right' && 'bg-accent text-accent-foreground')}
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">右对齐</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', currentAlign === 'justify' && 'bg-accent text-accent-foreground')}
            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">两端对齐</TooltipContent>
      </Tooltip>
    </div>
  )
}

export { AlignGroup }
