import { Undo2, Redo2 } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { ToolbarButton } from '../ToolbarButton'

interface HistoryGroupProps {
  editor: Editor | null
}

function HistoryGroup({ editor }: HistoryGroupProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        editor={editor}
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={!editor?.can().undo()}
        tooltip="撤销 ⌘Z"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={!editor?.can().redo()}
        tooltip="重做 ⇧⌘Z"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}

export { HistoryGroup }
