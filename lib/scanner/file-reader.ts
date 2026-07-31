import fs from 'fs'
import path from 'path'

const MAX_README_SIZE = 5 * 1024 * 1024 // 5MB

export function readFileWithLimit(filePath: string, limit: number): string {
  try {
    const stat = fs.statSync(filePath)
    if (stat.size > limit) {
      return `[File exceeds size limit: ${stat.size} > ${limit} bytes]`
    }
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return `[Error reading file: ${filePath}]`
  }
}

export function findReadme(dirPath: string): string | null {
  try {
    const entries = fs.readdirSync(dirPath)
    const readmeFile = entries.find((f) => f.toLowerCase() === 'readme.md')
    if (!readmeFile) return null
    return readFileWithLimit(path.join(dirPath, readmeFile), MAX_README_SIZE)
  } catch {
    return null
  }
}

export function findClaudeMd(dirPath: string): string | null {
  const claudePath = path.join(dirPath, 'CLAUDE.md')
  if (!fs.existsSync(claudePath)) return null
  return readFileWithLimit(claudePath, MAX_README_SIZE)
}

export interface PackageJsonInfo {
  name: string
  description: string
  techStack: string[]
  metadata: Record<string, unknown>
}

export function readPackageJson(dirPath: string): PackageJsonInfo | null {
  const pkgPath = path.join(dirPath, 'package.json')
  if (!fs.existsSync(pkgPath)) return null
  try {
    const raw = fs.readFileSync(pkgPath, 'utf-8')
    const pkg = JSON.parse(raw)
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    return {
      name: pkg.name || '',
      description: pkg.description || '',
      techStack: Object.keys(deps || {}),
      metadata: { scripts: pkg.scripts || {}, version: pkg.version || '' },
    }
  } catch {
    return null
  }
}
