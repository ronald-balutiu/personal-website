import { describe, expect, it } from 'vitest'

import { siteConfig } from '../../src/config/site'
import { buildSeo, toAbsoluteUrl } from '../../src/lib/seo'

describe('seo helpers', () => {
  it('converts relative paths to absolute urls', () => {
    expect(toAbsoluteUrl('/assets/laptop.svg')).toBe('https://ronaldbalutiu.com/assets/laptop.svg')
  })

  it('builds homepage seo metadata with website open graph type', () => {
    const seo = buildSeo({
      pageType: 'home',
      path: '/',
      title: siteConfig.defaultTitle,
    })

    expect(seo.og.type).toBe('website')
    expect(seo.canonical).toBe('https://ronaldbalutiu.com/')
    expect(seo.og.image).toBe('https://ronaldbalutiu.com/assets/og-default.png')
  })

  it('builds project seo metadata with article open graph type and title template', () => {
    const seo = buildSeo({
      pageType: 'project',
      path: '/sudoku-creator-solver',
      title: 'Sudoku Creator Solver',
    })

    expect(seo.og.type).toBe('article')
    expect(seo.title).toBe('Sudoku Creator Solver | Ronald Balutiu')
  })

  it('uses project-level og image override for both open graph and twitter', () => {
    const seo = buildSeo({
      pageType: 'project',
      path: '/sudoku-creator-solver',
      ogImage: '/assets/sudoku.svg',
    })

    expect(seo.og.image).toBe('https://ronaldbalutiu.com/assets/sudoku.svg')
    expect(seo.twitter.image).toBe('https://ronaldbalutiu.com/assets/sudoku.svg')
  })

  it('sets noindex robots directive when requested', () => {
    const seo = buildSeo({
      pageType: 'generic',
      path: '/private',
      noindex: true,
    })

    expect(seo.robots).toBe('noindex,nofollow')
  })
})
