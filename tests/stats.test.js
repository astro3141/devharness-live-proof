import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mean } from '../lib/stats.js'

test('mean of a single value', () => {
  assert.equal(mean([42]), 42)
})

test('mean of several values', () => {
  assert.equal(mean([1, 2, 3, 4]), 2.5)
})

test('mean handles negative and fractional values', () => {
  assert.equal(mean([-1, 1, 0.5, -0.5]), 0)
})

test('mean throws TypeError for non-array input', () => {
  assert.throws(() => mean('1,2,3'), TypeError)
  assert.throws(() => mean(null), TypeError)
  assert.throws(() => mean(undefined), TypeError)
  assert.throws(() => mean(5), TypeError)
})

test('mean throws RangeError for empty array', () => {
  assert.throws(() => mean([]), RangeError)
})

test('mean throws RangeError for non-finite entries', () => {
  assert.throws(() => mean([1, Infinity]), RangeError)
  assert.throws(() => mean([1, -Infinity]), RangeError)
  assert.throws(() => mean([1, NaN]), RangeError)
})

test('mean throws RangeError for non-number entries', () => {
  assert.throws(() => mean([1, '2']), RangeError)
})
