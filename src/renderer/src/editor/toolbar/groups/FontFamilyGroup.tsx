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

const FONTS = [
  { value: '', label: '默认' },
  { value: '"PingFang SC", "Microsoft YaHei", sans-serif', label: '苹方 / 雅黑' },
  { value: '"Songti SC", "SimSun", serif', label: '宋体' },
  { value: '"Kaiti SC", "KaiTi", serif', label: '楷体' },
  { value: '"FangSong", serif', label: '仿宋' },
  { value: '"SF Mono", Consolas, Monaco, monospace', label: '等宽' },
]

interface FontFamilyGroupProps {
  editor: Editor | null
}

function FontFamilyGroup({ editor }: FontFamilyGroupProps): React.JSX.Element {
  const currentFont = editor?.getAttributes('textStyle').fontFamily || ''

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Select
            value={currentFont}
            onValueChange={(value) => {
              if (value) {
                editor?.chain().focus().setFontFamily(value).run()
              } else {
                editor?.chain().focus().unsetFontFamily().run()
              }
            }}
          >
            <SelectTrigger className="h-8 w-[90px] text-xs">
              <SelectValue placeholder="字体" />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => (
                <SelectItem key={f.value || 'default'} value={f.value || '_default'}>
                  <span style={{ fontFamily: f.value || 'inherit' }}>{f.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">字体</TooltipContent>
    </Tooltip>
  )
}

export { FontFamilyGroup }
