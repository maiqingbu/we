import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { TableIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TableGridSelectorProps {
  editor: Editor | null
}

function TableGridSelector({ editor }: TableGridSelectorProps): React.JSX.Element {
  const [hoveredRow, setHoveredRow] = useState(0)
  const [hoveredCol, setHoveredCol] = useState(0)

  const insertTable = (rows: number, cols: number): void => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setHoveredRow(0)
    setHoveredCol(0)
  }

  return (
    <Popover onOpenChange={(open) => { if (!open) { setHoveredRow(0); setHoveredCol(0) } }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <TableIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">插入表格</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-2">
          <div
            className="grid gap-[2px]"
            style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}
          >
            {Array.from({ length: 100 }).map((_, i) => {
              const row = Math.floor(i / 10) + 1
              const col = (i % 10) + 1
              const isHovered = row <= hoveredRow && col <= hoveredCol
              return (
                <div
                  key={i}
                  className="h-4 w-4 rounded-sm border border-border cursor-pointer transition-colors"
                  style={{
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: isHovered ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: isHovered ? 'var(--color-primary)' : 'transparent',
                    opacity: isHovered ? 1 : 0.3,
                  }}
                  onMouseEnter={() => { setHoveredRow(row); setHoveredCol(col) }}
                  onClick={() => insertTable(row, col)}
                />
              )
            })}
          </div>
          <div className="text-center text-xs text-muted-foreground">
            {hoveredRow > 0 ? `${hoveredCol} × ${hoveredRow}` : '选择表格大小'}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { TableGridSelector }
