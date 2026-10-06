const lightPalette = {
  background: '#f8f2ee',
  surface: '#f4f4f4',
  text: '#1f2937',
  'text-muted': '#4b5563',
  accent: '#5d3a3a',
  'accent-strong': '#432929',
  'accent-soft': '#f2e5dc',
  'accent-line': 'rgba(93, 58, 58, 0.25)',
  border: 'rgba(31, 41, 55, 0.14)',
  focus: '#5d3a3a',
  'shadow-soft': 'rgba(17, 24, 39, 0.12)',
  'icon-filter': 'none',
  'icon-opacity': '1',
}

export const themePalettes = {
  light: lightPalette,
  dark: {
    background: '#292827',
    surface: '#343232',
    text: '#e1deda',
    'text-muted': '#bcb5b0',
    accent: '#c38f84',
    'accent-strong': '#d3a29a',
    'accent-soft': '#493632',
    'accent-line': 'rgba(195, 143, 132, 0.35)',
    border: 'rgba(225, 222, 218, 0.16)',
    focus: '#d3a29a',
    'shadow-soft': 'rgba(0, 0, 0, 0.24)',
    'icon-filter':
      'brightness(0) saturate(100%) invert(86%) sepia(11%) saturate(488%) hue-rotate(324deg) brightness(106%) contrast(91%)',
    'icon-opacity': '0.72',
  },
} satisfies Record<'light' | 'dark', typeof lightPalette>
