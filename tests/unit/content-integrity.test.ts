import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type ProjectFrontmatter = {
  title: string
  description: string
  details: string
  link: string
  icon: string
}

type ProjectEntry = {
  fileName: string
  slug: string
  frontmatter: ProjectFrontmatter
}

const requiredKeys = ['title', 'description', 'details', 'link', 'icon'] as const
const requiredKeySet = new Set<string>(requiredKeys)
const projectSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

const projectsDir = path.resolve(import.meta.dirname, '../../src/content/projects')
const srcDir = path.resolve(import.meta.dirname, '../../src')
const publicDir = path.resolve(import.meta.dirname, '../../public')
const assetsDir = path.resolve(publicDir, 'assets')
const assetReferencePattern = /\/assets\/[^"'`\s)>\]}]+/g
const unusedAssetAllowlist = new Set([
  // TODO: Remove once dark mode is implemented and these assets are actively referenced.
  '/assets/email-white.svg',
  '/assets/github-mark-white.svg',
  '/assets/instagram-white.svg',
  '/assets/linkedin-white.svg',
])
const textFileExtensions = new Set([
  '.astro',
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mdx',
  '.mjs',
  '.svg',
  '.ts',
  '.tsx',
  '.txt',
  '.webmanifest',
  '.xml',
  '.yaml',
  '.yml',
])

const stripQuotes = (value: string) => {
  const isDoubleQuoted = value.startsWith('"') && value.endsWith('"')
  const isSingleQuoted = value.startsWith("'") && value.endsWith("'")
  return isDoubleQuoted || isSingleQuoted ? value.slice(1, -1) : value
}

const parseFrontmatter = (markdown: string, fileName: string): Record<string, string> => {
  const match = frontmatterPattern.exec(markdown)
  expect(match, `Expected ${fileName} to include a top-level frontmatter block`).not.toBeNull()

  const block = match?.[1] ?? ''
  const frontmatter: Record<string, string> = {}

  for (const [index, line] of block.split(/\r?\n/).entries()) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const lineMatch = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line)
    expect(
      lineMatch,
      `Could not parse frontmatter line ${index + 1} in ${fileName}: "${line}"`
    ).not.toBeNull()

    const key = lineMatch?.[1] ?? ''
    const rawValue = (lineMatch?.[2] ?? '').trim()
    const value = stripQuotes(rawValue).trim()

    expect(value, `Frontmatter key "${key}" in ${fileName} must be non-empty`).not.toBe('')
    frontmatter[key] = value
  }

  return frontmatter
}

const loadProjectEntries = (): ProjectEntry[] => {
  const fileNames = readdirSync(projectsDir)
    .filter((name) => name.endsWith('.md'))
    .sort()
  expect(fileNames.length, 'Expected at least one project markdown file').toBeGreaterThan(0)

  return fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '')
    const filePath = path.join(projectsDir, fileName)
    const markdown = readFileSync(filePath, 'utf8')
    const frontmatter = parseFrontmatter(markdown, fileName) as ProjectFrontmatter
    return { fileName, slug, frontmatter }
  })
}

const toPosixPath = (filePath: string) => filePath.split(path.sep).join('/')

const readTextFilesRecursively = (rootDir: string): string[] => {
  const stack = [rootDir]
  const files: string[] = []

  while (stack.length > 0) {
    const currentDir = stack.pop()
    if (!currentDir) continue

    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const entryPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        stack.push(entryPath)
        continue
      }

      const extension = path.extname(entry.name).toLowerCase()
      if (!textFileExtensions.has(extension)) continue
      files.push(entryPath)
    }
  }

  return files
}

const listAllAssetPaths = (): string[] => {
  const stack = [assetsDir]
  const paths: string[] = []

  while (stack.length > 0) {
    const currentDir = stack.pop()
    if (!currentDir) continue

    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const entryPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        stack.push(entryPath)
        continue
      }

      if (!entry.isFile()) continue
      const publicRelativePath = toPosixPath(path.relative(publicDir, entryPath))
      paths.push(`/${publicRelativePath}`)
    }
  }

  return paths.sort()
}

const normalizeAssetReference = (reference: string) =>
  reference.split(/[?#]/, 1)[0].replace(/[),.;:]+$/, '')

const collectAssetReferences = (): Set<string> => {
  const references = new Set<string>()
  const filesToScan = [...readTextFilesRecursively(srcDir), ...readTextFilesRecursively(publicDir)]

  for (const filePath of filesToScan) {
    const isAssetFile = filePath.startsWith(`${assetsDir}${path.sep}`)
    if (isAssetFile) continue

    const content = readFileSync(filePath, 'utf8')
    for (const match of content.matchAll(assetReferencePattern)) {
      const rawReference = match[0]
      const normalizedReference = normalizeAssetReference(rawReference)
      if (normalizedReference.startsWith('/assets/')) {
        references.add(normalizedReference)
      }
    }
  }

  return references
}

describe('project content integrity', () => {
  const entries = loadProjectEntries()

  it('uses unique kebab-case slugs', () => {
    const seenSlugs = new Set<string>()

    for (const { fileName, slug } of entries) {
      expect(slug, `Slug from ${fileName} must be kebab-case`).toMatch(projectSlugPattern)
      expect(seenSlugs.has(slug), `Duplicate project slug found: ${slug}`).toBe(false)
      seenSlugs.add(slug)
    }
  })

  it('contains required frontmatter keys only', () => {
    for (const { fileName, frontmatter } of entries) {
      const keys = Object.keys(frontmatter)
      const keySet = new Set(keys)

      for (const key of requiredKeys) {
        expect(keySet.has(key), `${fileName} is missing required frontmatter key "${key}"`).toBe(
          true
        )
      }

      for (const key of keys) {
        expect(
          requiredKeySet.has(key),
          `${fileName} contains unsupported frontmatter key "${key}"`
        ).toBe(true)
      }
    }
  })

  it('uses valid non-empty text values and HTTPS/HTTP links', () => {
    const seenTitles = new Set<string>()
    const seenLinks = new Set<string>()

    for (const { fileName, frontmatter } of entries) {
      expect(frontmatter.title.trim(), `${fileName} title must be non-empty`).not.toBe('')
      expect(frontmatter.description.trim(), `${fileName} description must be non-empty`).not.toBe(
        ''
      )
      expect(frontmatter.details.trim(), `${fileName} details must be non-empty`).not.toBe('')

      let parsedLink: URL | undefined
      try {
        parsedLink = new URL(frontmatter.link)
      } catch {
        parsedLink = undefined
      }

      expect(parsedLink, `${fileName} link must be a valid URL`).toBeDefined()
      expect(
        parsedLink && (parsedLink.protocol === 'https:' || parsedLink.protocol === 'http:'),
        `${fileName} link must use http or https`
      ).toBe(true)

      expect(
        seenTitles.has(frontmatter.title),
        `Duplicate project title found: "${frontmatter.title}"`
      ).toBe(false)
      expect(
        seenLinks.has(frontmatter.link),
        `Duplicate project link found: "${frontmatter.link}"`
      ).toBe(false)

      seenTitles.add(frontmatter.title)
      seenLinks.add(frontmatter.link)
    }
  })

  it('references icons that exist under public/assets', () => {
    for (const { fileName, frontmatter } of entries) {
      expect(
        frontmatter.icon.startsWith('/assets/'),
        `${fileName} icon must start with "/assets/"`
      ).toBe(true)
      expect(
        frontmatter.icon.includes('..'),
        `${fileName} icon must not contain parent traversals`
      ).toBe(false)

      const iconFilePath = path.resolve(publicDir, frontmatter.icon.replace(/^\//, ''))
      expect(existsSync(iconFilePath), `${fileName} icon does not exist: ${frontmatter.icon}`).toBe(
        true
      )
      expect(statSync(iconFilePath).isFile(), `${fileName} icon path must resolve to a file`).toBe(
        true
      )
    }
  })

  it('does not contain unreferenced files under public/assets', () => {
    const allAssetPaths = listAllAssetPaths()
    expect(allAssetPaths.length, 'Expected at least one file under public/assets').toBeGreaterThan(
      0
    )

    const referencedAssetPaths = collectAssetReferences()
    const unreferencedAssetPaths = allAssetPaths.filter(
      (assetPath) => !referencedAssetPaths.has(assetPath) && !unusedAssetAllowlist.has(assetPath)
    )

    expect(
      unreferencedAssetPaths,
      `Found unreferenced files under public/assets:\n${unreferencedAssetPaths.join('\n')}`
    ).toEqual([])
  })
})
