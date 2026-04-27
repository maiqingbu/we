import { Eraser } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { ToolbarButton } from '../ToolbarButton'

interface ClearFormatGroupProps {
  editor: Editor | null
}

function ClearFormatGroup({ editor }: ClearFormatGroupProps): React.JSX.Element {
  return (
    <ToolbarButton
      editor={editor}
      onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
      tooltip="清除格式"
    >
      <Eraser className="h-4 w-4" />
    </ToolbarButton>
  )
}

export { ClearFormatGroup }
