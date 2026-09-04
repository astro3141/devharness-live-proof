export function slugify(input) {
  if (typeof input !== 'string') {
    throw new TypeError('slugify: input must be a string')
  }
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
