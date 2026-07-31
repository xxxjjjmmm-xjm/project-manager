'use client'
import { useState } from 'react'

export function ProjectDetailClaude({ projectId }: { projectId: string }) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (content !== null) return
    setLoading(true)
    try {
      const res = await fetch('/api/projects/' + projectId + '/claude-md')
      const json = await res.json()
      if (json.success) setContent(json.data.content)
      else setError(json.error?.message || 'Not found')
    } catch { setError('Failed to load') }
    finally { setLoading(false) }
  }

  return (
    <div>
      {content === null && !loading && (
        <button onClick={load} className="text-sm text-blue-600 hover:underline">Load CLAUDE.md</button>
      )}
      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {content != null && (
        <div className="border rounded-lg p-4 bg-muted/20 max-h-96 overflow-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono">{content || '(empty)'}</pre>
        </div>
      )}
    </div>
  )
}
