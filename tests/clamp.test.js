import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clamp } from '../lib/clamp.js'

test('returns value when within range', () => {
  assert.equal(clamp(5, 0, 10), 5)
})

test('clamps to min when value is below range', () => {
  assert.equal(clamp(-3, 0, 10), 0)
})

test('clamps to max when value is above range', () => {
  assert.equal(clamp(42, 0, 10), 10)
})

test('handles min === max', () => {
  assert.equal(clamp(7, 3, 3), 3)
})

test('throws TypeError for non-number args', () => {
  assert.throws(() => clamp('5', 0, 10), TypeError)
  assert.throws(() => clamp(5, null, 10), TypeError)
  assert.throws(() => clamp(5, 0, undefined), TypeError)
})

test('throws RangeError when min > max', () => {
  assert.throws(() => clamp(5, 10, 0), RangeError)
})
