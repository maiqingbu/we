import { BubbleMenu } from '@tiptap/react/menus'
import { EditorContent as TipTapEditorContent } from '@tiptap/react'
import type { Editor as TipTapEditor } from '@tiptap/react'
import { TableBubbleMenuContent } from './toolbar/TableBubbleMenu'
import { Toolbar } from './toolbar/Toolbar'

interface EditorProps {
  editor: TipTapEditor | null
}

function Editor({ editor }: EditorProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <Toolbar editor={editor} />
      <TipTapEditorContent editor={editor} className="editor-wrapper" />
      {editor && (
        <BubbleMenu
          editor={editor}
          appendTo={() => document.body}
          shouldShow={({ editor }) => editor.isActive('table')}
          updateDelay={100}
          className="z-50"
        >
          <TableBubbleMenuContent editor={editor} />
        </BubbleMenu>
      )}
    </div>
  )
}

export { Editor }
