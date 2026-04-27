import { useEditor } from '@/editor/hooks/useEditor'
import { Editor } from '@/editor/Editor'

function EditorPane(): React.JSX.Element {
  const editor = useEditor()

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="shrink-0 border-b border-border px-4 py-2">
        <h2 className="whitespace-nowrap text-xs font-medium text-muted-foreground">
          编辑器
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <Editor editor={editor} />
      </div>
    </div>
  )
}

export { EditorPane }
