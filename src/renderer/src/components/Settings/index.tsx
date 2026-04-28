import { useState } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { AISettings } from './AISettings'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SECTIONS = [
  { id: 'ai', label: 'AI 配置' },
]

function SettingsDialog({ open, onOpenChange }: SettingsDialogProps): React.JSX.Element {
  const [activeSection, setActiveSection] = useState('ai')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[560px] max-w-3xl gap-0 overflow-hidden p-0">
        {/* Sidebar */}
        <div className="w-48 shrink-0 border-r border-border bg-muted/30 p-3">
          <h2 className="mb-3 px-2 text-sm font-semibold">设置</h2>
          <nav className="space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                  activeSection === section.id
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'ai' && <AISettings />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { SettingsDialog }
