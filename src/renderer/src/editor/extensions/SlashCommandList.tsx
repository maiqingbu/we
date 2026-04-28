import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { SLASH_COMMANDS, COMMAND_GROUPS } from '@/lib/slashCommands'
import type { SlashCommand } from '@/lib/slashCommands'
import type { LucideIcon } from 'lucide-react'

interface SlashCommandListProps {
  items: SlashCommand[]
  command: (item: SlashCommand) => void
}

interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev + 1) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        if (items[selectedIndex]) {
          command(items[selectedIndex])
        }
        return true
      }
      return false
    },
  }), [items, selectedIndex, command])

  // Group items
  const grouped: { group: string; items: SlashCommand[] }[] = []
  for (const group of COMMAND_GROUPS) {
    const groupItems = items.filter((item) => item.group === group)
    if (groupItems.length > 0) {
      grouped.push({ group, items: groupItems })
    }
  }

  // Flatten index mapping for keyboard navigation
  let flatIndex = 0

  return (
    <div className="w-80 max-h-[380px] overflow-y-auto rounded-lg border border-border bg-background shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-1">
      {grouped.map(({ group, items: groupItems }) => (
        <div key={group}>
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">{group}</div>
          {groupItems.map((item) => {
            const idx = flatIndex++
            const Icon = item.icon as LucideIcon
            const isSelected = idx === selectedIndex
            const isAI = item.group === 'AI'

            return (
              <button
                key={item.id}
                type="button"
                className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#e7f1ff]' : 'hover:bg-accent/50'
                } ${isAI ? 'opacity-60' : ''}`}
                onClick={() => command(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isAI ? 'bg-muted' : 'bg-purple-50'}`}>
                  <Icon className={`h-4 w-4 ${isAI ? 'text-muted-foreground' : 'text-purple-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                </div>
                {isAI && (
                  <span className="text-[10px] text-muted-foreground shrink-0">需配置 AI</span>
                )}
              </button>
            )
          })}
        </div>
      ))}
      {items.length === 0 && (
        <div className="px-2 py-4 text-center text-sm text-muted-foreground">没有匹配的命令</div>
      )}
    </div>
  )
})

SlashCommandList.displayName = 'SlashCommandList'

export default SlashCommandList
