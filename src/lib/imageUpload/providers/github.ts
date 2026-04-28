import type { ImageUploader } from '../types'

export const GitHubUploader: ImageUploader = {
  id: 'github',
  name: 'GitHub + jsDelivr CDN',
  configSchema: [
    {
      key: 'token',
      label: 'Personal Access Token',
      type: 'password',
      required: true,
      helpUrl: 'https://github.com/settings/tokens',
      placeholder: 'ghp_...，需要 repo 权限',
    },
    {
      key: 'owner',
      label: '用户名 / 组织名',
      type: 'text',
      required: true,
      placeholder: 'your-username',
    },
    {
      key: 'repo',
      label: '仓库名',
      type: 'text',
      required: true,
      placeholder: 'images（建议公开仓库）',
    },
    {
      key: 'branch',
      label: '分支',
      type: 'text',
      placeholder: 'main',
    },
    {
      key: 'path',
      label: '存储路径',
      type: 'text',
      placeholder: 'images/（可选，默认根目录）',
    },
    {
      key: 'cdn',
      label: 'CDN 加速',
      type: 'select',
      options: [
        { value: 'jsdelivr', label: 'jsDelivr（推荐，国内可访问）' },
        { value: 'github', label: 'GitHub Raw（国内可能被墙，不推荐用于公众号）' },
      ],
    },
  ],
  async upload(file, filename, config) {
    const timestamp = Date.now()
    const safeFilename = filename.replace(/[^\w.\-]/g, '_')
    const fullPath = `${config.path || ''}${timestamp}-${safeFilename}`.replace(/^\//, '')
    const buffer = file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file
    const base64 = buffer.toString('base64')
    const branch = config.branch || 'main'
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fullPath}`

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Upload ${safeFilename}`,
        content: base64,
        branch,
      }),
    })

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error('GitHub API 速率限制，请稍后再试')
      }
      const err = await response.json()
      throw new Error(err.message || `GitHub 上传失败 (${response.status})`)
    }
    const data = await response.json()

    let url: string
    if (config.cdn === 'jsdelivr') {
      url = `https://cdn.jsdelivr.net/gh/${config.owner}/${config.repo}@${branch}/${fullPath}`
    } else {
      url = data.content.download_url
    }
    return { url }
  },
  async testConnection(config) {
    try {
      const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
        headers: { Authorization: `token ${config.token}` },
      })
      if (response.status === 404) return { ok: false, error: '仓库不存在或 Token 无访问权限' }
      if (response.status === 401) return { ok: false, error: 'Token 无效' }
      return response.ok ? { ok: true } : { ok: false, error: `HTTP ${response.status}` }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  },
}
