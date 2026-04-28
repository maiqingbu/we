import type { ImageUploader } from '../types'

export const CustomUploader: ImageUploader = {
  id: 'custom',
  name: '自定义图床',
  configSchema: [
    {
      key: 'apiUrl',
      label: '上传接口 URL',
      type: 'url',
      required: true,
      placeholder: 'https://your-domain.com/api/upload',
    },
    {
      key: 'method',
      label: '请求方法',
      type: 'select',
      options: [
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
      ],
    },
    {
      key: 'fieldName',
      label: '文件字段名',
      type: 'text',
      placeholder: 'file',
    },
    {
      key: 'authType',
      label: '鉴权方式',
      type: 'select',
      options: [
        { value: 'none', label: '无' },
        { value: 'bearer', label: 'Bearer Token' },
        { value: 'header', label: '自定义 Header' },
      ],
    },
    {
      key: 'authValue',
      label: '鉴权值',
      type: 'password',
      placeholder: 'Token 或 Header 值',
    },
    {
      key: 'authHeader',
      label: '鉴权 Header 名',
      type: 'text',
      placeholder: '例：X-API-Key（authType=header 时必填）',
    },
    {
      key: 'urlField',
      label: '响应中 URL 字段路径',
      type: 'text',
      placeholder: 'data.url 或 url',
    },
  ],
  async upload(file, filename, config) {
    const form = new FormData()
    form.append(config.fieldName || 'file', file instanceof Blob ? file : new Blob([file as unknown as BlobPart]), filename)
    const headers: Record<string, string> = {}
    if (config.authType === 'bearer') {
      headers['Authorization'] = `Bearer ${config.authValue}`
    } else if (config.authType === 'header' && config.authHeader) {
      headers[config.authHeader] = config.authValue
    }
    const response = await fetch(config.apiUrl, {
      method: config.method || 'POST',
      headers,
      body: form,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    const urlField = config.urlField || 'url'
    const url = urlField.split('.').reduce((obj: any, key: string) => obj?.[key], data)
    if (!url) throw new Error(`响应中未找到 URL（路径：${urlField}）`)
    return { url }
  },
  async testConnection(config) {
    const tinyPng = new Uint8Array(
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
        0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x02,
        0x00, 0x01, 0xe5, 0x27, 0xde, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42,
        0x60, 0x82]
    )
    try {
      await this.upload(tinyPng, 'test.png', config)
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  },
}
