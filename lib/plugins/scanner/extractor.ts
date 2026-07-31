import { readPackageJson, findReadme } from './file-reader'
import type { ExtractedMeta } from './types'

export function extractMetadata(dirPath: string, dirName: string): ExtractedMeta {
  const pkgInfo = readPackageJson(dirPath)

  if (pkgInfo) {
    return {
      name: pkgInfo.name || dirName,
      type: classifyType(pkgInfo.techStack, pkgInfo.metadata),
      techStack: pkgInfo.techStack,
      description: pkgInfo.description || extractFirstParagraph(findReadme(dirPath)),
      metadata: pkgInfo.metadata,
      remoteUrl: '',
    }
  }

  return {
    name: dirName, type: 'other', techStack: [],
    description: extractFirstParagraph(findReadme(dirPath)),
    metadata: {}, remoteUrl: '',
  }
}

function extractFirstParagraph(readme: string | null): string {
  if (!readme) return ''
  const lines = readme.split('\n')
  let para = ''
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```')) {
      if (para) break
      continue
    }
    para += (para ? ' ' : '') + trimmed
  }
  return para.slice(0, 500)
}

function classifyType(techStack: string[], metadata: Record<string, unknown>): string {
  const lower = techStack.map((s) => s.toLowerCase())
  const webFrameworks = ['next', 'react', 'vue', 'svelte', 'angular', 'nuxt', 'remix', 'astro']
  if (lower.some((s) => webFrameworks.includes(s))) return 'web'
  const cliLibs = ['commander', 'yargs', 'oclif', 'inquirer', 'enquirer']
  if (lower.some((s) => cliLibs.includes(s))) return 'cli'
  if (metadata.scripts && typeof metadata.scripts === 'object') {
    const scripts = Object.keys(metadata.scripts as Record<string, unknown>)
    if (scripts.includes('build') && !scripts.some((s) => ['dev', 'start', 'serve'].includes(s)))
      return 'library'
  }
  return 'other'
}
