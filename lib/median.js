export function median(values) {
  if (!Array.isArray(values)) {
    throw new TypeError('values must be an array')
  }
  if (values.length === 0) {
    throw new RangeError('values must not be empty')
  }
  for (const v of values) {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new RangeError('values must contain only finite numbers')
    }
  }
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
