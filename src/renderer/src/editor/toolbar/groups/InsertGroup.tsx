import { Link, Image, Upload } from 'lucide-react'
import { useState, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface InsertGroupProps {
  editor: Editor | null
}

function InsertGroup({ editor }: InsertGroupProps): React.JSX.Element {
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertLink = (): void => {
    if (!linkUrl) return
    const { from, to } = editor!.state.selection
    const hasSelection = from !== to

    if (hasSelection && !linkText) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    } else if (linkText) {
      editor?.chain().focus().insertContent({
        type: 'text',
        text: linkText,
        marks: [{ type: 'link', attrs: { href: linkUrl } }],
      }).run()
    } else {
      // No selection and no custom text: insert URL as both href and display text
      editor?.chain().focus().insertContent({
        type: 'text',
        text: linkUrl,
        marks: [{ type: 'link', attrs: { href: linkUrl } }],
      }).run()
    }
    setLinkUrl('')
    setLinkText('')
  }

  const insertImage = (): void => {
    if (!imageUrl) return
    editor?.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl('')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      editor?.chain().focus().setImage({ src: dataUrl }).run()
    }
    reader.readAsDataURL(file)
    // 重置 input 以便重复选择同一文件
    e.target.value = ''
  }

  const hasSelection = editor ? editor.state.selection.from !== editor.state.selection.to : false

  return (
    <div className="flex items-center gap-0.5">
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Link className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">插入链接</TooltipContent>
        </Tooltip>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <Input placeholder="URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') insertLink() }} />
            {!hasSelection && (
              <Input placeholder="显示文字（可选）" value={linkText} onChange={(e) => setLinkText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') insertLink() }} />
            )}
            <Button size="sm" className="w-full" onClick={insertLink}>插入</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Image className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">插入图片</TooltipContent>
        </Tooltip>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <Input placeholder="图片 URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') insertImage() }} />
            <Button size="sm" className="w-full" onClick={insertImage}>插入</Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-popover px-2 text-muted-foreground">或</span>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            <Button size="sm" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1" />
              选择本地图片
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { InsertGroup }
