import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react'
import type { UploadTask } from '@/lib/imageUpload'
import { uploadManager, formatFileSize } from '@/lib/imageUpload'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function UploadStatus(): React.JSX.Element {
  const [tasks, setTasks] = useState<UploadTask[]>([])
  const [visible, setVisible] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeCount = tasks.filter(
    (t) => t.status === 'queued' || t.status === 'uploading'
  ).length
  const failedCount = tasks.filter((t) => t.status === 'failed').length
  const successCount = tasks.filter((t) => t.status === 'success').length
  const hasActive = activeCount > 0
  const hasFailed = failedCount > 0
  const allDone = !hasActive && tasks.length > 0

  // Subscribe to task changes
  useEffect(() => {
    const currentTasks = uploadManager.getTasks()
    setTasks(currentTasks)
    if (currentTasks.length > 0) {
      setVisible(true)
    }

    const unsubscribe = uploadManager.subscribe((updatedTasks) => {
      setTasks([...updatedTasks])
      if (updatedTasks.length > 0) {
        setVisible(true)
        // Clear any pending hide timer when new tasks appear
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current)
          hideTimerRef.current = null
        }
      }
    })

    return () => {
      unsubscribe()
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

  // Auto-hide: success tasks → 3s, failed tasks → 8s, all done → hide
  useEffect(() => {
    if (tasks.length === 0) {
      setVisible(false)
      return
    }

    // Auto-remove failed tasks after 8 seconds
    if (hasFailed) {
      const timer = setTimeout(() => {
        const failed = uploadManager.getTasks().filter((t) => t.status === 'failed')
        failed.forEach((t) => uploadManager.removeTask(t.id))
      }, 8000)
      return () => clearTimeout(timer)
    }

    // Auto-hide when all done (no active, no failed)
    if (allDone && !hasFailed) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => {
        setVisible(false)
      }, 3000)
    }

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [allDone, hasFailed, tasks.length])

  const handleRetry = useCallback((task: UploadTask) => {
    // The retry is handled by the editor extension which stores the original file.
    // We emit a custom event so the editor can pick it up.
    window.dispatchEvent(
      new CustomEvent('upload-retry', {
        detail: { taskId: task.id, placeholderId: task.placeholderId },
      })
    )
  }, [])

  // Don't render anything if not visible
  if (!visible) {
    return <></>
  }

  // Determine button style
  const buttonBg = hasFailed
    ? 'bg-red-500 hover:bg-red-600'
    : hasActive
      ? 'bg-blue-500 hover:bg-blue-600'
      : 'bg-green-500 hover:bg-green-600'

  const totalBadge = hasActive ? activeCount : hasFailed ? failedCount : successCount

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-colors cursor-pointer',
              buttonBg
            )}
          >
            {hasActive ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : hasFailed ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            {totalBadge > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-gray-900 shadow">
                {totalBadge}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-80 p-0">
          <div className="border-b border-border px-3 py-2 text-sm font-medium">
            上传任务
            {hasActive && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {activeCount} 张上传中
              </span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                暂无上传任务
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {tasks.map((task) => (
                  <li key={task.id} className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {/* Status icon */}
                      <span className="shrink-0">
                        {task.status === 'queued' && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {task.status === 'uploading' && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                        {task.status === 'success' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {task.status === 'failed' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </span>

                      {/* File info */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">{task.filename}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span>{formatFileSize(task.size)}</span>
                          <span>&middot;</span>
                          <span>
                            {task.status === 'queued' && '排队中'}
                            {task.status === 'uploading' && '上传中'}
                            {task.status === 'success' && '上传成功'}
                            {task.status === 'failed' && '上传失败'}
                          </span>
                        </div>
                        {task.status === 'failed' && task.error && (
                          <div className="mt-0.5 truncate text-[11px] text-red-500">
                            {task.error}
                          </div>
                        )}
                      </div>

                      {/* Retry button for failed tasks */}
                      {task.status === 'failed' && (
                        <button
                          type="button"
                          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRetry(task)
                          }}
                          title="重试"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Footer summary */}
          {tasks.length > 0 && (
            <div className="border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
              共 {tasks.length} 个任务
              {successCount > 0 && `，${successCount} 个成功`}
              {failedCount > 0 && `，${failedCount} 个失败`}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { UploadStatus }
