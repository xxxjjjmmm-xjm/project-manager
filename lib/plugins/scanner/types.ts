export interface CandidateDir {
  fullPath: string
  dirName: string
  scanPathId: string
}

export interface ExtractedMeta {
  name: string
  type: string
  techStack: string[]
  description: string
  metadata: Record<string, unknown>
  remoteUrl: string
}

export interface GitInfo {
  remoteUrl: string
  lastCommitHash: string
  lastCommitAt: Date | null
  totalCommits: number
  recentCommits: {
    hash: string
    message: string
    author: string
    date: Date
  }[]
  error?: string
}

export interface ScanEntryResult {
  dirName: string
  status: 'success' | 'skipped' | 'error'
  fileCount: number
  extracted?: ExtractedMeta
  git?: GitInfo
  error?: string
}

export type ProjectRootIndicator =
  | '.git'
  | 'package.json'
  | 'Cargo.toml'
  | 'CMakeLists.txt'
  | 'composer.json'
  | 'pyproject.toml'
  | 'setup.py'
  | 'go.mod'

export const PROJECT_INDICATORS: ProjectRootIndicator[] = [
  '.git', 'package.json', 'Cargo.toml', 'CMakeLists.txt',
  'composer.json', 'pyproject.toml', 'setup.py', 'go.mod',
]
