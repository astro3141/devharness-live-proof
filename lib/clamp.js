export function clamp(value, min, max) {
  if (typeof value !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('clamp: value, min, and max must be numbers')
  }
  if (min > max) {
    throw new RangeError('clamp: min must not be greater than max')
  }
  return Math.min(Math.max(value, min), max)
}
