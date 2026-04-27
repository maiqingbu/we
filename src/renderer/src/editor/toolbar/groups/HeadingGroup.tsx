import type { Editor } from '@tiptap/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface HeadingGroupProps {
  editor: Editor | null
}

const headingOptions = [
  { value: '0', label: '正文', className: 'text-sm' },
  { value: '1', label: '标题 1', className: 'text-lg font-bold' },
  { value: '2', label: '标题 2', className: 'text-base font-bold' },
  { value: '3', label: '标题 3', className: 'text-sm font-bold' },
  { value: '4', label: '标题 4', className: 'text-sm font-semibold' },
]

function HeadingGroup({ editor }: HeadingGroupProps): React.JSX.Element {
  const currentLevel = editor?.isActive('heading', { level: 1 })
    ? '1'
    : editor?.isActive('heading', { level: 2 })
      ? '2'
      : editor?.isActive('heading', { level: 3 })
        ? '3'
        : editor?.isActive('heading', { level: 4 })
          ? '4'
          : '0'

  return (
    <Select
      value={currentLevel}
      onValueChange={(value) => {
        if (value === '0') {
          editor?.chain().focus().setParagraph().run()
        } else {
          editor?.chain().focus().toggleHeading({ level: Number(value) as 1 | 2 | 3 | 4 }).run()
        }
      }}
    >
      <SelectTrigger className="h-8 w-[90px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {headingOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <span className={cn(opt.className)}>{opt.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { HeadingGroup }
