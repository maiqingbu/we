import { Indent, Outdent, ChevronDown, ArrowDownToLine } from 'lucide-react'
import type { Editor } from '@tiptap/react'
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
import { Button } from '@/components/ui/button'

interface MoreMenuGroupProps {
  editor: Editor | null
}

const LINE_HEIGHTS = [
  { value: '1', label: '1.0' },
  { value: '1.25', label: '1.25' },
  { value: '1.5', label: '1.5' },
  { value: '1.75', label: '1.75（默认）' },
  { value: '2', label: '2.0' },
]

const PARAGRAPH_SPACINGS = [
  { value: '0.5em', label: '紧凑' },
  { value: '', label: '默认' },
  { value: '1.5em', label: '宽松' },
]

function MoreMenuGroup({ editor }: MoreMenuGroupProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Line Height */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>行高</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {LINE_HEIGHTS.map((lh) => (
              <DropdownMenuItem
                key={lh.value}
                onClick={() => editor?.chain().focus().setLineHeight(lh.value).run()}
              >
                {lh.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Paragraph Spacing */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            段间距
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {PARAGRAPH_SPACINGS.map((ps) => (
              <DropdownMenuItem
                key={ps.value || 'default'}
                onClick={() => {
                  if (ps.value) {
                    editor?.chain().focus().setParagraphSpacing(ps.value).run()
                  } else {
                    editor?.chain().focus().unsetParagraphSpacing().run()
                  }
                }}
              >
                {ps.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Text Indent */}
        <DropdownMenuItem onClick={() => editor?.chain().focus().indent().run()}>
          <Indent className="mr-2 h-4 w-4" />
          首行缩进
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor?.chain().focus().outdent().run()}>
          <Outdent className="mr-2 h-4 w-4" />
          取消缩进
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { MoreMenuGroup }
