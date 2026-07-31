import fs from 'fs'
import { prisma } from '@/lib/db'
import { discoverProjects } from './discoverer'
import { extractMetadata } from './extractor'
import { getGitInfo } from './git-reader'
import type { ScanEntryResult } from './types'

const MAX_COMMITS_TO_KEEP = 50

export class Scanner {
  async scanAll(): Promise<ScanEntryResult[]> {
    const scanPaths = await prisma.scanPath.findMany({ where: { enabled: true } })
    const results: ScanEntryResult[] = []
    for (const sp of scanPaths) {
      results.push(...await this.scanPath(sp.id))
    }
    return results
  }

  async scanPath(scanPathId: string): Promise<ScanEntryResult[]> {
    const scanPath = await prisma.scanPath.findUnique({ where: { id: scanPathId } })
    if (!scanPath) return []
    const candidates = discoverProjects(scanPath.path, scanPathId)
    const results: ScanEntryResult[] = []
    for (const candidate of candidates) {
      try {
        results.push(await this.processCandidate(candidate))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        results.push({ dirName: candidate.dirName, status: 'error', fileCount: 0, error: errorMessage })
        try {
          const existing = await prisma.project.findUnique({ where: { path: candidate.fullPath.toLowerCase() } })
          if (existing) {
            await prisma.scanRecord.create({
              data: { projectId: existing.id, scanPathId: candidate.scanPathId, status: 'error', fileCount: 0, errorMessage },
            })
          }
        } catch { /* DB may be unavailable */ }
      }
    }
    return results
  }

  private async processCandidate(candidate: { fullPath: string; dirName: string; scanPathId: string }): Promise<ScanEntryResult> {
    const extracted = extractMetadata(candidate.fullPath, candidate.dirName)
    const git = getGitInfo(candidate.fullPath)
    let fileCount = 0
    try {
      fileCount = fs.readdirSync(candidate.fullPath, { withFileTypes: true }).filter((e) => e.isFile()).length
    } catch { fileCount = 0 }
    extracted.remoteUrl = git.remoteUrl

    const normalizedPath = candidate.fullPath.toLowerCase()
    const projectData = {
      name: extracted.name, path: normalizedPath, type: extracted.type,
      techStack: JSON.stringify(extracted.techStack), description: extracted.description,
      totalCommits: git.totalCommits, lastScannedAt: new Date(),
      lastCommitAt: git.lastCommitAt, lastCommitHash: git.lastCommitHash,
      remoteUrl: git.remoteUrl, metadata: JSON.stringify(extracted.metadata),
    }

    let project
    const existing = await prisma.project.findUnique({ where: { path: normalizedPath } })
    if (existing) {
      project = await prisma.project.update({ where: { id: existing.id }, data: projectData })
    } else {
      project = await prisma.project.create({ data: { ...projectData, firstSeenAt: new Date() } })
    }

    await prisma.scanRecord.create({
      data: { projectId: project.id, scanPathId: candidate.scanPathId, status: 'success', fileCount, errorMessage: '' },
    })

    if (git.recentCommits.length > 0) {
      for (const commit of git.recentCommits) {
        await prisma.gitCommit.upsert({
          where: { projectId_hash: { projectId: project.id, hash: commit.hash } },
          create: { projectId: project.id, hash: commit.hash, message: commit.message, author: commit.author, date: commit.date },
          update: { message: commit.message, author: commit.author, date: commit.date },
        })
      }
      const oldCommits = await prisma.gitCommit.findMany({
        where: { projectId: project.id }, orderBy: { date: 'desc' }, skip: MAX_COMMITS_TO_KEEP,
      })
      if (oldCommits.length > 0) {
        await prisma.gitCommit.deleteMany({ where: { id: { in: oldCommits.map((c) => c.id) } } })
      }
    }

    return { dirName: candidate.dirName, status: 'success', fileCount, extracted, git }
  }
}
