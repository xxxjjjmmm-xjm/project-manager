import { execSync } from 'child_process'
import type { GitInfo } from './types'

export function getGitInfo(dirPath: string, timeoutMs: number = 10000): GitInfo {
  const result: GitInfo = {
    remoteUrl: '', lastCommitHash: '', lastCommitAt: null,
    totalCommits: 0, recentCommits: [],
  }

  const execOpts = { cwd: dirPath, timeout: timeoutMs, encoding: 'utf-8' as const }

  try { execSync('git rev-parse --git-dir', { ...execOpts, stdio: 'ignore' }) }
  catch { return result }

  try { result.remoteUrl = execSync('git remote get-url origin', execOpts).trim() }
  catch { /* no remote */ }

  try {
    result.lastCommitHash = execSync('git rev-parse HEAD', execOpts).trim()
    const dateStr = execSync('git log -1 --format=%aI', execOpts).trim()
    result.lastCommitAt = dateStr ? new Date(dateStr) : null
  } catch { /* no commits */ }

  try {
    result.totalCommits = parseInt(execSync('git rev-list --count HEAD', execOpts).trim(), 10) || 0
  } catch { /* no commits */ }

  try {
    const log = execSync('git log --oneline -50 --format="%H|||%s|||%an|||%aI"', execOpts).trim()
    if (log) {
      result.recentCommits = log.split('\n').map((line) => {
        const [hash, message, author, date] = line.split('|||')
        return { hash: hash || '', message: message || '', author: author || '', date: new Date(date || Date.now()) }
      })
    }
  } catch { /* no commits */ }

  return result
}
