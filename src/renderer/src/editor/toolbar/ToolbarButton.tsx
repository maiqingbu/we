import type { Editor } from '@tiptap/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ToolbarButtonProps {
  editor: Editor | null
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  tooltip: string
  children: React.ReactNode
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  children,
}: ToolbarButtonProps): React.JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', isActive && 'bg-accent text-accent-foreground')}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

export { ToolbarButton }
export type { ToolbarButtonProps }
