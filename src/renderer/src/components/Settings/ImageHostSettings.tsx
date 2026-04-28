import { useState, useEffect, useCallback } from 'react'
import {
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Check,
  Trash2,
  Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  getAllProviders,
  getSchemaDefaults,
  type ConfigField,
} from '@/lib/imageUpload'

// ── Types ──────────────────────────────────────────────────────────────────

interface ProviderCardState {
  configured: boolean
  testing: boolean
  saving: boolean
  testResult: null | { ok: boolean; error?: string }
}

// ── Component ──────────────────────────────────────────────────────────────

function ImageHostSettings(): React.JSX.Element {
  const providers = getAllProviders()

  // Current active provider
  const [activeProviderId, setActiveProviderId] = useState<string>('')
  const [configuredIds, setConfiguredIds] = useState<string[]>([])

  // Per-provider card state
  const [cardStates, setCardStates] = useState<Record<string, ProviderCardState>>({})
  // Per-provider form values (keyed by providerId -> fieldKey -> value)
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({})
  // Password visibility (providerId -> fieldKey -> boolean)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, Record<string, boolean>>>({})

  // Upload behavior settings
  const [autoUpload, setAutoUpload] = useState(true)
  const [maxFileSize, setMaxFileSize] = useState('5')
  const [compressEnabled, setCompressEnabled] = useState(false)

  // Active provider test
  const [testingActive, setTestingActive] = useState(false)

  const { toast } = useToast()

  // ── Load initial data ──────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [ids, activeId] = await Promise.all([
        window.api.imageHostListConfigured(),
        window.api.imageHostGetSetting('active_provider'),
      ])
      setConfiguredIds(ids)
      setActiveProviderId(activeId || '')

      // Load upload behavior settings
      const [autoVal, sizeVal, compressVal] = await Promise.all([
        window.api.imageHostGetSetting('auto_upload'),
        window.api.imageHostGetSetting('max_file_size'),
        window.api.imageHostGetSetting('compress'),
      ])
      setAutoUpload(autoVal !== 'false')
      setMaxFileSize(sizeVal || '5')
      setCompressEnabled(compressVal === 'true')

      // Load config for each configured provider
      const newFormValues: Record<string, Record<string, string>> = {}
      const newCardStates: Record<string, ProviderCardState> = {}

      for (const provider of providers) {
        const defaults = getSchemaDefaults(provider.configSchema)
        newFormValues[provider.id] = { ...defaults }
        newCardStates[provider.id] = {
          configured: ids.includes(provider.id),
          testing: false,
          saving: false,
          testResult: null,
        }

        if (ids.includes(provider.id)) {
          const config = await window.api.imageHostGetConfig(provider.id)
          if (config) {
            newFormValues[provider.id] = { ...defaults, ...config }
          }
        }
      }

      setFormValues(newFormValues)
      setCardStates(newCardStates)
    } catch (err) {
      console.error('Failed to load image host settings:', err)
    }
  }, [providers])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleActiveProviderChange = async (value: string) => {
    const newId = value === '__none__' ? '' : value
    setActiveProviderId(newId)
    try {
      await window.api.imageHostSetSetting('active_provider', newId)
    } catch {
      toast({ title: '保存失败', variant: 'destructive' })
    }
  }

  const handleTestActive = async () => {
    if (!activeProviderId) return
    setTestingActive(true)
    try {
      const config = await window.api.imageHostGetConfig(activeProviderId)
      if (!config) {
        toast({ title: '未找到配置', variant: 'destructive' })
        return
      }
      const result = await window.api.imageTestConnection(activeProviderId, config)
      if (result.ok) {
        toast({ title: '连接成功' })
      } else {
        toast({ title: '连接失败', description: result.error, variant: 'destructive' })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '测试失败'
      toast({ title: '连接失败', description: msg, variant: 'destructive' })
    } finally {
      setTestingActive(false)
    }
  }

  const handleFieldChange = (providerId: string, fieldKey: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [providerId]: { ...prev[providerId], [fieldKey]: value },
    }))
  }

  const handleTogglePassword = (providerId: string, fieldKey: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [fieldKey]: !prev[providerId]?.[fieldKey],
      },
    }))
  }

  const handleTest = async (providerId: string) => {
    const config = formValues[providerId]
    if (!config) return

    setCardStates((prev) => ({
      ...prev,
      [providerId]: { ...prev[providerId], testing: true, testResult: null },
    }))
    try {
      const result = await window.api.imageTestConnection(providerId, config)
      setCardStates((prev) => ({
        ...prev,
        [providerId]: { ...prev[providerId], testing: false, testResult: result },
      }))
      if (result.ok) {
        toast({ title: '连接成功' })
      } else {
        toast({ title: '连接失败', description: result.error, variant: 'destructive' })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '测试失败'
      setCardStates((prev) => ({
        ...prev,
        [providerId]: { ...prev[providerId], testing: false, testResult: { ok: false, error: msg } },
      }))
    }
  }

  const handleSave = async (providerId: string) => {
    const config = formValues[providerId]
    if (!config) return

    setCardStates((prev) => ({
      ...prev,
      [providerId]: { ...prev[providerId], saving: true },
    }))
    try {
      await window.api.imageHostSaveConfig(providerId, config)
      await loadData()
      toast({ title: '已保存' })
    } catch (err) {
      toast({ title: '保存失败', variant: 'destructive' })
    } finally {
      setCardStates((prev) => ({
        ...prev,
        [providerId]: { ...prev[providerId], saving: false },
      }))
    }
  }

  const handleDelete = async (providerId: string) => {
    try {
      await window.api.imageHostDeleteConfig(providerId)
      // If the deleted provider was active, clear it
      if (activeProviderId === providerId) {
        setActiveProviderId('')
        await window.api.imageHostSetSetting('active_provider', '')
      }
      await loadData()
      toast({ title: '已删除' })
    } catch {
      toast({ title: '删除失败', variant: 'destructive' })
    }
  }

  const handleAutoUploadChange = async (checked: boolean) => {
    setAutoUpload(checked)
    try {
      await window.api.imageHostSetSetting('auto_upload', String(checked))
    } catch {
      toast({ title: '保存失败', variant: 'destructive' })
    }
  }

  const handleMaxFileSizeChange = async (value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 1 || num > 20) return
    setMaxFileSize(value)
    try {
      await window.api.imageHostSetSetting('max_file_size', value)
    } catch {
      toast({ title: '保存失败', variant: 'destructive' })
    }
  }

  const handleCompressChange = async (checked: boolean) => {
    setCompressEnabled(checked)
    try {
      await window.api.imageHostSetSetting('compress', String(checked))
    } catch {
      toast({ title: '保存失败', variant: 'destructive' })
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  const getProviderName = (id: string): string => {
    return providers.find((p) => p.id === id)?.name || id
  }

  const getHelpUrl = (provider: (typeof providers)[0]): string | undefined => {
    return provider.configSchema[0]?.helpUrl
  }

  const isPasswordVisible = (providerId: string, fieldKey: string): boolean => {
    return !!visiblePasswords[providerId]?.[fieldKey]
  }

  // ── Render: Config field ───────────────────────────────────────────────

  const renderField = (providerId: string, field: ConfigField) => {
    const value = formValues[providerId]?.[field.key] ?? ''

    if (field.type === 'select' && field.options) {
      return (
        <Select
          value={value}
          onValueChange={(v) => handleFieldChange(providerId, field.key, v)}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.type === 'password') {
      const visible = isPasswordVisible(providerId, field.key)
      return (
        <div className="flex items-center gap-2">
          <Input
            type={visible ? 'text' : 'password'}
            className="h-8 text-sm"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(providerId, field.key, e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => handleTogglePassword(providerId, field.key)}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      )
    }

    // text / url
    return (
      <Input
        type={field.type === 'url' ? 'url' : 'text'}
        className="h-8 text-sm"
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => handleFieldChange(providerId, field.key, e.target.value)}
      />
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">图床配置</h2>

      {/* ── 1. Current image host selection ───────────────────────────── */}
      <div className="rounded-lg border border-border p-4">
        <label className="mb-2 block text-sm font-medium text-foreground">当前图床</label>
        <div className="flex items-center gap-3">
          <Select
            value={activeProviderId || '__none__'}
            onValueChange={handleActiveProviderChange}
          >
            <SelectTrigger size="sm" className="w-64">
              <SelectValue placeholder="未启用" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">未启用</SelectItem>
              {configuredIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {getProviderName(id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeProviderId && configuredIds.includes(activeProviderId) && (
            <>
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check className="h-3.5 w-3.5" />
                已配置
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                disabled={testingActive}
                onClick={handleTestActive}
              >
                {testingActive && <Loader2 className="h-3 w-3 animate-spin" />}
                测试连接
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── 2. Provider config cards ──────────────────────────────────── */}
      {providers.map((provider) => {
        const state = cardStates[provider.id] || {
          configured: false,
          testing: false,
          saving: false,
          testResult: null,
        }
        const helpUrl = getHelpUrl(provider)

        return (
          <div key={provider.id} className="rounded-lg border border-border p-4">
            {/* Title row */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-medium">
                <span className="inline-block h-4 w-1 rounded-full bg-primary" />
                {provider.name}
              </h3>
              {helpUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs text-muted-foreground"
                  onClick={() => window.open(helpUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                  文档
                </Button>
              )}
            </div>

            {/* Config fields */}
            <div className="mb-4 space-y-3">
              {provider.configSchema.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-500">*</span>}
                  </label>
                  {renderField(provider.id, field)}
                </div>
              ))}
            </div>

            {/* Test result */}
            {state.testResult && (
              <div
                className={`mb-3 text-xs ${state.testResult.ok ? 'text-green-600' : 'text-red-600'}`}
              >
                {state.testResult.ok
                  ? '\u2713 连接成功'
                  : `\u2717 ${state.testResult.error}`}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                disabled={state.testing || state.saving}
                onClick={() => handleTest(provider.id)}
              >
                {state.testing && <Loader2 className="h-3 w-3 animate-spin" />}
                测试
              </Button>
              <Button
                size="sm"
                className="h-7 gap-1 text-xs"
                disabled={state.testing || state.saving}
                onClick={() => handleSave(provider.id)}
              >
                {state.saving && <Loader2 className="h-3 w-3 animate-spin" />}
                保存
              </Button>
              {state.configured && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(provider.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  删除
                </Button>
              )}
            </div>
          </div>
        )
      })}

      {/* ── 3. Upload behavior settings ───────────────────────────────── */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
          <Settings2 className="h-4 w-4" />
          上传行为
        </h3>

        <div className="space-y-4">
          {/* Auto upload toggle */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-primary"
              checked={autoUpload}
              onChange={(e) => handleAutoUploadChange(e.target.checked)}
            />
            <span className="text-sm">拖拽 / 粘贴图片自动上传</span>
          </label>

          {/* Max file size */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">单图大小限制：</span>
            <Input
              type="number"
              className="h-8 w-20 text-sm"
              min={1}
              max={20}
              value={maxFileSize}
              onChange={(e) => handleMaxFileSizeChange(e.target.value)}
            />
            <span className="text-sm text-muted-foreground">MB</span>
          </div>

          {/* Compress toggle */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-primary"
              checked={compressEnabled}
              onChange={(e) => handleCompressChange(e.target.checked)}
            />
            <span className="text-sm">上传前压缩到 80% 质量</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export { ImageHostSettings }
