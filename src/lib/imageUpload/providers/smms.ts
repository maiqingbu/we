import type { ImageUploader } from '../types'

export const SmmsUploader: ImageUploader = {
  id: 'smms',
  name: 'SM.MS',
  configSchema: [
    {
      key: 'token',
      label: 'API Token',
      type: 'password',
      placeholder: '在 SM.MS 用户中心 → API 令牌获取',
      required: true,
      helpUrl: 'https://smms.app/home/apitoken',
    },
  ],
  async upload(file, filename, config) {
    const form = new FormData()
    form.append('smfile', file instanceof Blob ? file : new Blob([file]), filename)
    const response = await fetch('https://sm.ms/api/v2/upload', {
      method: 'POST',
      headers: { Authorization: config.token },
      body: form,
    })
    const data = await response.json()
    if (!data.success) {
      if (data.code === 'image_repeated' && data.images) {
        return { url: data.images }
      }
      throw new Error(data.message || '上传失败')
    }
    return {
      url: data.data.url,
      deleteHash: data.data.hash,
      width: data.data.width,
      height: data.data.height,
    }
  },
  async testConnection(config) {
    try {
      const response = await fetch('https://sm.ms/api/v2/profile', {
        method: 'POST',
        headers: { Authorization: config.token },
      })
      const data = await response.json()
      return data.success ? { ok: true } : { ok: false, error: data.message }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  },
}
