// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { readFileWithLimit, findReadme, findClaudeMd, readPackageJson } from '@/lib/scanner/file-reader'

describe('file-reader', () => {
  let tmpDir: string

  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-test-')) })
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }) })

  it('reads file within size limit', () => {
    fs.writeFileSync(path.join(tmpDir, 'small.txt'), 'hello world')
    expect(readFileWithLimit(path.join(tmpDir, 'small.txt'), 1024)).toBe('hello world')
  })

  it('warns when file exceeds limit', () => {
    fs.writeFileSync(path.join(tmpDir, 'big.txt'), 'x'.repeat(100))
    expect(readFileWithLimit(path.join(tmpDir, 'big.txt'), 50)).toContain('exceeds')
  })

  it('returns error string for missing file', () => {
    expect(readFileWithLimit(path.join(tmpDir, 'nope.txt'), 1024)).toContain('Error reading')
  })

  it('finds README.md case-insensitive', () => {
    fs.writeFileSync(path.join(tmpDir, 'Readme.MD'), '# My Project')
    expect(findReadme(tmpDir)).toBe('# My Project')
  })

  it('returns null when no README found', () => {
    expect(findReadme(tmpDir)).toBeNull()
  })

  it('finds CLAUDE.md', () => {
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Instructions')
    expect(findClaudeMd(tmpDir)).toBe('# Instructions')
  })

  it('returns null when no CLAUDE.md found', () => {
    expect(findClaudeMd(tmpDir)).toBeNull()
  })

  it('parses package.json with all fields', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      name: 'my-app', dependencies: { react: '^18', next: '^14' },
      devDependencies: { vitest: '^1' }, description: 'A test app',
      scripts: { dev: 'next dev' },
    }))
    const r = readPackageJson(tmpDir)
    expect(r).not.toBeNull()
    expect(r!.name).toBe('my-app')
    expect(r!.description).toBe('A test app')
    expect(r!.techStack).toContain('react')
    expect(r!.techStack).toContain('next')
    expect(r!.techStack).toContain('vitest')
  })

  it('returns null for missing package.json', () => {
    expect(readPackageJson(tmpDir)).toBeNull()
  })
})
