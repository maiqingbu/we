import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LintIssue {
  word: string
  suggestion: string
  reason: string
  start: number
  end: number
  level?: string
}

interface LintDetailPopoverProps {
  type: 'typo' | 'sensitive'
  issues: LintIssue[]
  onJump: (start: number, end: number) => void
  onIgnore: (word: string) => void
  children: React.ReactNode
}

function LintDetailPopover({
  type,
  issues,
  onJump,
  onIgnore,
  children,
}: LintDetailPopoverProps): React.JSX.Element {
  const title = type === 'typo' ? `错别字（${issues.length} 个）` : `敏感词（${issues.length} 个）`

  function getLevelBadge(level?: string): React.ReactNode {
    if (!level) return null

    const config: Record<string, { label: string; className: string }> = {
      high: { label: '高', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      medium: { label: '中', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      low: { label: '低', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    }

    const c = config[level]
    if (!c) return null

    return (
      <span className={cn('ml-1.5 inline-flex items-center rounded px-1 py-0.5 text-[10px] font-medium', c.className)}>
        {c.label}
      </span>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-80 p-0">
        {/* Header */}
        <div className="border-b border-border px-3 py-2 text-sm font-medium">
          {title}
        </div>

        {/* Scrollable issue list */}
        <div className="max-h-60 overflow-y-auto">
          {issues.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              没有问题
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {issues.map((issue, index) => (
                <li key={`${issue.word}-${issue.start}-${index}`} className="px-3 py-2">
                  <div className="flex items-start gap-2">
                    {/* Index */}
                    <span className="mt-0.5 shrink-0 text-[10px] text-muted-foreground tabular-nums">
                      {index + 1}
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center text-sm">
                        <span className="text-red-600 font-medium">{issue.word}</span>
                        <span className="mx-1 text-muted-foreground">&rarr;</span>
                        <span className="text-green-600 font-medium">{issue.suggestion}</span>
                        {type === 'sensitive' && getLevelBadge(issue.level)}
                      </div>
                      {issue.reason && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                          {issue.reason}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="mt-1 flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-1.5 text-[11px]"
                          onClick={() => onJump(issue.start, issue.end)}
                        >
                          跳转
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-1.5 text-[11px]"
                          onClick={() => onIgnore(issue.word)}
                        >
                          忽略
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { LintDetailPopover }
export type { LintDetailPopoverProps, LintIssue }
