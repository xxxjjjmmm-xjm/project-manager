// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { extractMetadata } from '@/lib/plugins/scanner/extractor'

describe('extractor', () => {
  let tmpDir: string
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-extr-')) })
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }) })

  it('detects web type from react/next deps', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      name: 'my-app', description: 'A great app',
      dependencies: { react: '^18', next: '^14' },
    }))
    const r = extractMetadata(tmpDir, 'my-app')
    expect(r.name).toBe('my-app')
    expect(r.type).toBe('web')
    expect(r.techStack).toContain('next')
    expect(r.techStack).toContain('react')
  })

  it('detects cli type from commander + bin', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      name: 'my-cli', dependencies: { commander: '^11' },
      bin: { mycli: './cli.js' },
    }))
    expect(extractMetadata(tmpDir, 'my-cli').type).toBe('cli')
  })

  it('defaults type to other for unknown', () => {
    const r = extractMetadata(tmpDir, 'unknown-project')
    expect(r.type).toBe('other')
    expect(r.name).toBe('unknown-project')
  })

  it('falls back to dirname when no package.json', () => {
    expect(extractMetadata(tmpDir, 'bare-folder').name).toBe('bare-folder')
  })

  it('returns empty techStack for non-NPM projects', () => {
    expect(extractMetadata(tmpDir, 'empty').techStack).toEqual([])
  })
})
