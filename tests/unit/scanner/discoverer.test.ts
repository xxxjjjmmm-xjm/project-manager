// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { discoverProjects } from '@/lib/scanner/discoverer'

describe('discoverer', () => {
  let tmpDir: string
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-disc-')) })
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }) })

  it('detects .git as a project root', () => {
    fs.mkdirSync(path.join(tmpDir, 'my-project', '.git'), { recursive: true })
    const r = discoverProjects(tmpDir, 'scan-1')
    expect(r).toHaveLength(1)
    expect(r[0].dirName).toBe('my-project')
    expect(r[0].scanPathId).toBe('scan-1')
  })

  it('detects package.json as a project root', () => {
    fs.mkdirSync(path.join(tmpDir, 'node-app'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'node-app', 'package.json'), '{}')
    expect(discoverProjects(tmpDir, 'scan-2')).toHaveLength(1)
  })

  it('skips plain directories', () => {
    fs.mkdirSync(path.join(tmpDir, 'not-a-project'))
    expect(discoverProjects(tmpDir, 'scan-3')).toHaveLength(0)
  })

  it('discovers multiple nested projects', () => {
    fs.mkdirSync(path.join(tmpDir, 'app'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'app', 'package.json'), '{}')
    fs.mkdirSync(path.join(tmpDir, 'lib', '.git'), { recursive: true })
    expect(discoverProjects(tmpDir, 'scan-4').length).toBeGreaterThanOrEqual(2)
  })

  it('handles non-existent root', () => {
    expect(discoverProjects(path.join(tmpDir, 'gone'), 'scan-5')).toHaveLength(0)
  })
})
