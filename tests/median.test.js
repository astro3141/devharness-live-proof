import assert from 'node:assert/strict'
import { test } from 'node:test'
import { median } from '../lib/median.js'

test('odd length returns middle value', () => {
  assert.equal(median([3, 1, 2]), 2)
})

test('even length returns average of middle two', () => {
  assert.equal(median([4, 1, 3, 2]), 2.5)
})

test('single element', () => {
  assert.equal(median([7]), 7)
})

test('negative and unsorted values', () => {
  assert.equal(median([-5, 10, 0]), 0)
})

test('does not mutate input', () => {
  const input = [3, 1, 2]
  median(input)
  assert.deepEqual(input, [3, 1, 2])
})

test('even length does not overflow for large finite values', () => {
  assert.equal(median([Number.MAX_VALUE, Number.MAX_VALUE]), Number.MAX_VALUE)
  assert.equal(median([-Number.MAX_VALUE, -Number.MAX_VALUE]), -Number.MAX_VALUE)
  assert.equal(median([Number.MAX_VALUE, Number.MAX_VALUE / 2]), Number.MAX_VALUE * 0.75)
})

test('throws TypeError for non-array', () => {
  assert.throws(() => median('1,2,3'), TypeError)
  assert.throws(() => median(null), TypeError)
})

test('throws RangeError for empty array', () => {
  assert.throws(() => median([]), RangeError)
})

test('throws RangeError for non-finite entries', () => {
  assert.throws(() => median([1, Infinity]), RangeError)
  assert.throws(() => median([1, NaN]), RangeError)
  assert.throws(() => median([1, '2']), RangeError)
})
