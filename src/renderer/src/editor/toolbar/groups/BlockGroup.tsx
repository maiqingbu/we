import { Quote, Code2, Minus } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { ToolbarButton } from '../ToolbarButton'

interface BlockGroupProps {
  editor: Editor | null
}

function BlockGroup({ editor }: BlockGroupProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        editor={editor}
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        isActive={editor?.isActive('blockquote') ?? false}
        tooltip="引用"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        isActive={editor?.isActive('codeBlock') ?? false}
        tooltip="代码块"
      >
        <Code2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        tooltip="分割线"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}

export { BlockGroup }
