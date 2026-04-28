import { useState, useEffect, useCallback } from 'react'
import { Eye, EyeOff, ExternalLink, Loader2, Check, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PROVIDERS, getProvider } from '@/lib/ai'
import { useToast } from '@/hooks/use-toast'

interface ProviderState {
  hasKey: boolean
  maskedKey: string
  modelId: string
  testing: boolean
  saving: boolean
  testResult: null | { ok: boolean; error?: string }
}

function AISettings(): React.JSX.Element {
  const [states, setStates] = useState<Record<string, ProviderState>>({})
  const [inputKeys, setInputKeys] = useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // Load configured providers on mount
  useEffect(() => {
    loadStates()
  }, [])

  const loadStates = async () => {
    const configured = await window.api.aiListConfigured()
    const newStates: Record<string, ProviderState> = {}
    for (const provider of PROVIDERS) {
      const id = provider.config.id
      const found = configured.find((c: any) => c.provider_id === id)
      newStates[id] = {
        hasKey: !!found,
        maskedKey: found ? '••••••••' : '',
        modelId: found?.model_id || provider.config.defaultModel,
        testing: false,
        saving: false,
        testResult: null,
      }
      setSelectedModels((prev) => ({ ...prev, [id]: found?.model_id || provider.config.defaultModel }))
    }
    setStates(newStates)
  }

  const handleTest = async (providerId: string) => {
    const key = inputKeys[providerId]
    if (!key) {
      toast({ title: '请先输入 API Key', variant: 'destructive' })
      return
    }
    setStates((prev) => ({ ...prev, [providerId]: { ...prev[providerId], testing: true, testResult: null } }))
    try {
      const result = await window.api.aiTestConnection(providerId, key)
      setStates((prev) => ({ ...prev, [providerId]: { ...prev[providerId], testing: false, testResult: result } }))
      if (result.ok) {
        toast({ title: '连接成功' })
      } else {
        toast({ title: '连接失败', description: result.error, variant: 'destructive' })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '测试失败'
      setStates((prev) => ({ ...prev, [providerId]: { ...prev[providerId], testing: false, testResult: { ok: false, error: msg } } }))
    }
  }

  const handleSave = async (providerId: string) => {
    const key = inputKeys[providerId]
    if (!key) return
    const model = selectedModels[providerId]
    setStates((prev) => ({ ...prev, [providerId]: { ...prev[providerId], saving: true } }))
    try {
      await window.api.aiSaveKey(providerId, key, model)
      setInputKeys((prev) => ({ ...prev, [providerId]: '' }))
      await loadStates()
      toast({ title: '已保存' })
    } catch (err) {
      toast({ title: '保存失败', variant: 'destructive' })
    } finally {
      setStates((prev) => ({ ...prev, [providerId]: { ...prev[providerId], saving: false } }))
    }
  }

  const handleDelete = async (providerId: string) => {
    await window.api.aiDeleteKey(providerId)
    setInputKeys((prev) => ({ ...prev, [providerId]: '' }))
    await loadStates()
    toast({ title: '已删除' })
  }

  const handleShowKey = async (providerId: string) => {
    try {
      const result = await window.api.aiGetKey(providerId)
      if (result) {
        setShowKeys((prev) => ({ ...prev, [providerId]: true }))
        setTimeout(() => {
          setShowKeys((prev) => ({ ...prev, [providerId]: false }))
        }, 3000)
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">AI 配置</h2>

      {PROVIDERS.map((provider) => {
        const id = provider.config.id
        const state = states[id] || { hasKey: false, maskedKey: '', modelId: provider.config.defaultModel, testing: false, saving: false, testResult: null }
        const inputKey = inputKeys[id] || ''
        const showKey = showKeys[id] || false

        return (
          <div key={id} className="rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">{provider.config.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground"
                onClick={() => window.api.aiOpenExternal(provider.config.docsUrl)}
              >
                <ExternalLink className="h-3 w-3" />
                文档
              </Button>
            </div>

            {/* Model selector */}
            <div className="mb-3">
              <label className="mb-1 block text-xs text-muted-foreground">模型</label>
              <select
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={selectedModels[id] || provider.config.defaultModel}
                onChange={(e) => setSelectedModels((prev) => ({ ...prev, [id]: e.target.value }))}
              >
                {provider.config.models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* API Key input */}
            <div className="mb-3">
              <label className="mb-1 block text-xs text-muted-foreground">API Key</label>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                  placeholder={provider.config.keyHint}
                  value={state.hasKey && !inputKey ? (showKey ? '' : state.maskedKey) : inputKey}
                  onChange={(e) => setInputKeys((prev) => ({ ...prev, [id]: e.target.value }))}
                />
                {state.hasKey && !inputKey && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShowKey(id)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>

            {/* Status + actions */}
            <div className="flex items-center gap-2">
              {state.hasKey ? (
                <>
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="h-3.5 w-3.5" />
                    已配置
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    删除
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground">未配置</span>
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={!inputKey || state.testing}
                    onClick={() => handleTest(id)}
                  >
                    {state.testing ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    测试
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={!inputKey || state.saving}
                    onClick={() => handleSave(id)}
                  >
                    {state.saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    保存
                  </Button>
                </>
              )}
            </div>

            {/* Test result */}
            {state.testResult && !state.hasKey && (
              <div className={`mt-2 text-xs ${state.testResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                {state.testResult.ok ? '✓ 连接成功' : `✗ ${state.testResult.error}`}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { AISettings }
