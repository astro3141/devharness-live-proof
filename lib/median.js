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
  if (sorted.length % 2 === 1) {
    return sorted[mid]
  }
  const lo = sorted[mid - 1]
  const hi = sorted[mid]
  const sum = lo + hi
  // lo + hi can overflow to Infinity even though the true average is finite;
  // halving each operand first is exact for magnitudes large enough to overflow.
  return Number.isFinite(sum) ? sum / 2 : lo / 2 + hi / 2
}
