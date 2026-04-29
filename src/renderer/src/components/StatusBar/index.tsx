import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Type,
  AlignLeft,
  Clock,
  Link,
  Image,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Terminal,
} from 'lucide-react'
import type { ArticleStats } from '@/lib/linter/statistics'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface LintIssue {
  word: string
  suggestion: string
  reason: string
  start: number
  end: number
  level?: string
}

interface StatusBarProps {
  stats: ArticleStats | null
  typos: LintIssue[]
  sensitive: LintIssue[]
  onJump: (start: number, end: number) => void
  onIgnoreTypo: (word: string) => void
  onIgnoreSensitive: (word: string) => void
  onLinkRefresh: () => void
  linkBrokenCount: number
  linkChecking: boolean
  linkResults: Array<{ url: string; ok: boolean; status?: number; error?: string }>
}

function StatusBar({
  stats,
  typos,
  sensitive,
  onJump,
  onIgnoreTypo,
  onIgnoreSensitive,
  onLinkRefresh,
  linkBrokenCount,
  linkChecking,
  linkResults,
}: StatusBarProps): React.JSX.Element {
  const typoCount = typos.length
  const sensitiveCount = sensitive.length
  const sensitiveHighCount = sensitive.filter((s) => s.level === 'high').length

  // 开发者右键菜单
  const [devMenuPos, setDevMenuPos] = useState<{ x: number; y: number } | null>(null)
  const devMenuRef = useRef<HTMLDivElement>(null)

  const handleStatusBarContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDevMenuPos({ x: e.clientX, y: e.clientY - 80 })
  }, [])

  // 点击外部关闭菜单
  useEffect(() => {
    if (!devMenuPos) return
    const handler = (e: MouseEvent) => {
      if (devMenuRef.current && !devMenuRef.current.contains(e.target as Node)) {
        setDevMenuPos(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [devMenuPos])

  // F12 快捷键切换开发者工具
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault()
        window.api?.toggleDevTools()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div
      className="h-9 shrink-0 border-t border-border bg-muted/30 px-3 flex items-center justify-between text-xs text-muted-foreground"
      onContextMenu={handleStatusBarContextMenu}
    >
      {/* Left side: article statistics */}
      <div className="flex items-center gap-4">
        {stats ? (
          <>
            <StatItem icon={<Type className="h-3.5 w-3.5" />} label={`${stats.totalChars.toLocaleString()} 字`} />
            <StatItem icon={<AlignLeft className="h-3.5 w-3.5" />} label={`${stats.paragraphs.toLocaleString()} 段`} />
            <StatItem icon={<Clock className="h-3.5 w-3.5" />} label={`${stats.readingMinutes} 分钟`} />

            {/* Links with optional refresh */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-accent transition-colors cursor-pointer"
                  disabled={stats.links === 0}
                >
                  <Link className="h-3.5 w-3.5" />
                  <span>
                    {linkBrokenCount > 0
                      ? `${linkBrokenCount}/${stats.links.toLocaleString()} 链接`
                      : `${stats.links.toLocaleString()} 链接`}
                  </span>
                </button>
              </PopoverTrigger>
              {stats.links > 0 && (
                <PopoverContent align="end" side="top" className="w-80 p-0">
                  <div className="border-b border-border px-3 py-2 text-sm font-medium">
                    链接检测
                    <button
                      type="button"
                      className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={onLinkRefresh}
                      disabled={linkChecking}
                    >
                      <RefreshCw className={cn('h-3 w-3', linkChecking && 'animate-spin')} />
                      {linkChecking ? '检测中…' : '刷新'}
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {linkResults.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                        点击"刷新"检测链接可用性
                      </div>
                    ) : (
                      <ul className="divide-y divide-border">
                        {linkResults.map((r, i) => (
                          <li key={`${r.url}-${i}`} className="px-3 py-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className={r.ok ? 'text-green-600' : 'text-red-600'}>
                                {r.ok ? '✓' : '✗'}
                              </span>
                              <span className="min-w-0 flex-1 truncate">{r.url}</span>
                              {!r.ok && (
                                <span className="shrink-0 text-muted-foreground">
                                  {r.status ? `HTTP ${r.status}` : r.error ? '超时' : '失败'}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </PopoverContent>
              )}
            </Popover>

            <StatItem icon={<Image className="h-3.5 w-3.5" />} label={`${stats.images.toLocaleString()} 图`} />
          </>
        ) : (
          <span className="text-muted-foreground/60">暂无内容</span>
        )}
      </div>

      {/* Right side: lint badges */}
      <div className="flex items-center gap-2">
        {/* Typo badge with popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors cursor-pointer',
                typoCount > 0
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{typoCount} 错别字</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" className="w-80 p-0">
            <LintPopoverContent
              title={`错别字（${typoCount} 个）`}
              issues={typos}
              onJump={onJump}
              onIgnore={onIgnoreTypo}
            />
          </PopoverContent>
        </Popover>

        {/* Sensitive badge with popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors cursor-pointer',
                sensitiveCount > 0
                  ? sensitiveHighCount > 0
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-orange-600 hover:bg-orange-50'
                  : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{sensitiveCount} 敏感词</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" className="w-80 p-0">
            <LintPopoverContent
              title={`敏感词（${sensitiveCount} 个）`}
              issues={sensitive}
              onJump={onJump}
              onIgnore={onIgnoreSensitive}
              showLevel
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* 开发者右键菜单 */}
      {devMenuPos && (
        <div
          ref={devMenuRef}
          className="fixed z-[9999] bg-popover border border-border rounded-md shadow-lg py-1 min-w-[160px]"
          style={{ left: devMenuPos.x, top: devMenuPos.y }}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setDevMenuPos(null)
              window.api?.toggleDevTools()
            }}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>开发者工具</span>
            <span className="ml-auto text-[10px] text-muted-foreground">F12</span>
          </button>
        </div>
      )}
    </div>
  )
}

function LintPopoverContent({
  title,
  issues,
  onJump,
  onIgnore,
  showLevel = false,
}: {
  title: string
  issues: LintIssue[]
  onJump: (start: number, end: number) => void
  onIgnore: (word: string) => void
  showLevel?: boolean
}): React.JSX.Element {
  function getLevelBadge(level?: string): React.ReactNode {
    if (!level) return null
    const config: Record<string, { label: string; className: string }> = {
      high: { label: '高', className: 'bg-red-100 text-red-700' },
      medium: { label: '中', className: 'bg-orange-100 text-orange-700' },
      low: { label: '低', className: 'bg-gray-100 text-gray-600' },
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
    <>
      <div className="border-b border-border px-3 py-2 text-sm font-medium">{title}</div>
      <div className="max-h-60 overflow-y-auto">
        {issues.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">没有问题 🎉</div>
        ) : (
          <ul className="divide-y divide-border">
            {issues.map((issue, index) => (
              <li key={`${issue.word}-${issue.start}-${index}`} className="px-3 py-2">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-[10px] text-muted-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-red-600">{issue.word}</span>
                      <span className="mx-1 text-muted-foreground">&rarr;</span>
                      <span className="font-medium text-green-600">{issue.suggestion}</span>
                      {showLevel && getLevelBadge(issue.level)}
                    </div>
                    {issue.reason && (
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{issue.reason}</p>
                    )}
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
    </>
  )
}

function StatItem({ icon, label }: { icon: React.ReactNode; label: string }): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {label}
    </span>
  )
}

export { StatusBar }
export type { StatusBarProps }
