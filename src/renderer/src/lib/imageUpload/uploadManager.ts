import pLimit from 'p-limit'
import type { UploadTask } from './types'
import { generateId } from './providers/base'

type Listener = (tasks: UploadTask[]) => void

class UploadManager {
  private tasks: Map<string, UploadTask> = new Map()
  private limit = pLimit(3)
  private listeners: Set<Listener> = new Set()

  async upload(
    file: File,
    placeholderId: string,
    uploadFn: (file: File) => Promise<string>
  ): Promise<string> {
    const id = generateId()
    const task: UploadTask = {
      id,
      filename: file.name,
      size: file.size,
      status: 'queued',
      placeholderId,
    }
    this.tasks.set(id, task)
    this.notify()

    return this.limit(async () => {
      try {
        this.update(id, { status: 'uploading' })
        const url = await uploadFn(file)
        this.update(id, { status: 'success', url })
        setTimeout(() => {
          this.tasks.delete(id)
          this.notify()
        }, 3000)
        return url
      } catch (e: any) {
        this.update(id, { status: 'failed', error: e.message })
        // Auto-remove failed tasks after 8 seconds
        setTimeout(() => {
          this.tasks.delete(id)
          this.notify()
        }, 8000)
        throw e
      }
    })
  }

  retry(id: string, uploadFn: (file: File) => Promise<string>): void {
    const task = this.tasks.get(id)
    if (!task || task.status !== 'failed') return
    this.tasks.delete(id)

    const file = this.reconstructFile(task)
    if (!file) return

    this.limit(async () => {
      const newId = generateId()
      const retryTask: UploadTask = {
        id: newId,
        filename: task.filename,
        size: task.size,
        status: 'uploading',
        placeholderId: task.placeholderId,
      }
      this.tasks.set(newId, retryTask)
      this.notify()
      try {
        const url = await uploadFn(file)
        this.update(newId, { status: 'success', url })
        setTimeout(() => {
          this.tasks.delete(newId)
          this.notify()
        }, 3000)
        return url
      } catch (e: any) {
        this.update(newId, { status: 'failed', error: e.message })
        throw e
      }
    })
  }

  removeTask(id: string): void {
    this.tasks.delete(id)
    this.notify()
  }

  getTasks(): UploadTask[] {
    return Array.from(this.tasks.values())
  }

  hasActiveTasks(): boolean {
    return this.getTasks().some((t) => t.status === 'uploading' || t.status === 'queued')
  }

  hasFailedTasks(): boolean {
    return this.getTasks().some((t) => t.status === 'failed')
  }

  subscribe(cb: Listener): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  private update(id: string, patch: Partial<UploadTask>): void {
    const task = this.tasks.get(id)
    if (task) {
      Object.assign(task, patch)
      this.notify()
    }
  }

  private notify(): void {
    const tasks = this.getTasks()
    this.listeners.forEach((cb) => cb(tasks))
  }

  private reconstructFile(_task: UploadTask): File | null {
    // Retry needs the original file; caller should store it separately
    // For simplicity, we return null — retry from editor extension handles this
    return null
  }
}

export const uploadManager = new UploadManager()
