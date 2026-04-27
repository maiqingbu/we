import { List, ListOrdered, ListChecks } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ListGroupProps {
  editor: Editor | null
}

function ListGroup({ editor }: ListGroupProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', editor?.isActive('bulletList') && 'bg-accent text-accent-foreground')}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">无序列表</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', editor?.isActive('orderedList') && 'bg-accent text-accent-foreground')}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">有序列表</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', editor?.isActive('taskList') && 'bg-accent text-accent-foreground')}
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
          >
            <ListChecks className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">任务列表</TooltipContent>
      </Tooltip>
    </div>
  )
}

export { ListGroup }
