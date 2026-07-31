import fs from 'fs'
import path from 'path'
import { PROJECT_INDICATORS } from './types'
import type { CandidateDir } from './types'

export function discoverProjects(rootPath: string, scanPathId: string, maxDepth: number = 2): CandidateDir[] {
  const results: CandidateDir[] = []

  if (!fs.existsSync(rootPath) || !fs.statSync(rootPath).isDirectory()) return results

  try {
    const entries = fs.readdirSync(rootPath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (entry.name.startsWith('.') && entry.name !== '.git') continue
      const fullPath = path.join(rootPath, entry.name)
      if (isProjectRoot(fullPath)) {
        results.push({ fullPath, dirName: entry.name, scanPathId })
      } else if (maxDepth > 1) {
        results.push(...discoverProjects(fullPath, scanPathId, maxDepth - 1))
      }
    }
  } catch { /* permission error, skip */ }

  return results
}

function isProjectRoot(dirPath: string): boolean {
  for (const indicator of PROJECT_INDICATORS) {
    if (fs.existsSync(path.join(dirPath, indicator))) return true
  }
  return false
}
