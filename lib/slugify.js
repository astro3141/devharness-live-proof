const GERMAN = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }

export function slugify(input) {
  if (typeof input !== 'string') {
    throw new TypeError('slugify: input must be a string')
  }
  const slug = input
    .normalize('NFC')
    .toLowerCase()
    .replace(/[äöüß]/g, (ch) => GERMAN[ch])
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
  return slug === '' ? 'n-a' : slug
}
