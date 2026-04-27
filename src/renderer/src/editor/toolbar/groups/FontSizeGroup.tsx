import type { Editor } from '@tiptap/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

const FONT_SIZES = [
  { value: '12px', label: '12px' },
  { value: '13px', label: '13px' },
  { value: '14px', label: '14px' },
  { value: '15px', label: '15px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '24px', label: '24px' },
  { value: '28px', label: '28px' },
  { value: '32px', label: '32px' },
]

interface FontSizeGroupProps {
  editor: Editor | null
}

function FontSizeGroup({ editor }: FontSizeGroupProps): React.JSX.Element {
  const currentSize = editor?.getAttributes('textStyle').fontSize || '16px'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Select
            value={currentSize}
            onValueChange={(value) => {
              editor?.chain().focus().setFontSize(value).run()
            }}
          >
            <SelectTrigger className="h-8 w-[72px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <span style={{ fontSize: s.value }}>{s.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">字号</TooltipContent>
    </Tooltip>
  )
}

export { FontSizeGroup }
