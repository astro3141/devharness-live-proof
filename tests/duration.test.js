import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseDuration } from '../lib/duration.js'

const MAX = Number.MAX_SAFE_INTEGER

const invalid = { name: 'RangeError', message: /^invalid duration:/ }
const rejects = (input) => assert.throws(() => parseDuration(input), invalid)

test('single-unit components', () => {
  assert.equal(parseDuration('1h'), 3600000)
  assert.equal(parseDuration('1m'), 60000)
  assert.equal(parseDuration('1s'), 1000)
  assert.equal(parseDuration('1ms'), 1)
  assert.equal(parseDuration('250ms'), 250)
})

test('multi-unit components in descending order', () => {
  assert.equal(parseDuration('1h30m15s'), 5415000)
  assert.equal(parseDuration('2h5ms'), 7200005)
  assert.equal(parseDuration('1h2m3s4ms'), 3723004)
  assert.equal(parseDuration('1m30s'), 90000)
  assert.equal(parseDuration('1s500ms'), 1500)
  assert.equal(parseDuration('1m3ms'), 60003)
})

test('bare integer string means seconds', () => {
  assert.equal(parseDuration('90'), 90000)
  assert.equal(parseDuration('1'), 1000)
  assert.equal(parseDuration('0'), 0)
})

test('zero-valued components', () => {
  assert.equal(parseDuration('0h0m0s0ms'), 0)
  assert.equal(parseDuration('0ms'), 0)
  assert.equal(parseDuration('0h5s'), 5000)
})

test('leading zeros in digits are accepted', () => {
  assert.equal(parseDuration('007'), 7000)
  assert.equal(parseDuration('01h'), 3600000)
})

test('m means minutes, never months', () => {
  assert.equal(parseDuration('2m'), 120000)
})

test('ms is not lexed as m followed by s', () => {
  assert.equal(parseDuration('1ms'), 1)
  // If "1ms" were lexed as 1m + s, "1ms1s" would look like m,s,s or fail
  // differently; s after ms is out of order and must be rejected.
  rejects('1ms1s')
  // m followed by s as separate components is fine.
  assert.equal(parseDuration('2m3s'), 123000)
  // Trailing bare unit after a valid ms component has no digits.
  rejects('1mss')
  rejects('1msms')
})

test('non-string input throws TypeError', () => {
  for (const bad of [90, 0, null, undefined, true, {}, ['1h'], 90n]) {
    assert.throws(() => parseDuration(bad), TypeError)
  }
})

test('empty string is rejected', () => {
  rejects('')
})

test('whitespace anywhere is rejected', () => {
  rejects(' ')
  rejects(' 1h')
  rejects('1h ')
  rejects('1 h')
  rejects('1h 30m')
  rejects('\t1s')
  rejects('1s\n')
  rejects(' 90')
  rejects('90 ')
})

test('signs are rejected', () => {
  rejects('+1h')
  rejects('-1h')
  rejects('+90')
  rejects('-90')
  rejects('1h-30m')
  rejects('1h+30m')
})

test('decimals are rejected', () => {
  rejects('1.5h')
  rejects('0.5s')
  rejects('90.0')
  rejects('.5s')
})

test('unit repetition is rejected', () => {
  rejects('1h2h')
  rejects('1m1m')
  rejects('5s5s')
  rejects('5ms5ms')
  rejects('1h2m3h')
})

test('out-of-order units are rejected', () => {
  rejects('30m1h')
  rejects('5s1m')
  rejects('10ms5s')
  rejects('1ms1h')
  rejects('1s1h30m')
})

test('unknown units are rejected', () => {
  rejects('1d')
  rejects('1x')
  rejects('5min')
  rejects('1H')
  rejects('1sec')
  rejects('1hh')
})

test('missing digits before a unit are rejected', () => {
  rejects('h')
  rejects('ms')
  rejects('h30m')
  rejects('1hm')
  rejects('1hms')
})

test('results at the MAX_SAFE_INTEGER bound are accepted', () => {
  assert.equal(parseDuration(`${MAX}ms`), MAX)
  // 9007199254740 s = 9007199254740000 ms <= MAX_SAFE_INTEGER
  assert.equal(parseDuration('9007199254740'), 9007199254740000)
  // 2501999792h + 3540991ms = exactly MAX_SAFE_INTEGER ms
  assert.equal(parseDuration('2501999792h3540991ms'), MAX)
})

test('results exceeding MAX_SAFE_INTEGER milliseconds are rejected', () => {
  rejects('9007199254740992ms') // MAX_SAFE_INTEGER + 1
  rejects('9007199254741') // bare seconds overflowing when scaled to ms
  rejects('2501999793h') // hours overflowing when scaled to ms
  rejects('2501999792h3540992ms') // one ms past MAX via combined components
  rejects('99999999999999999999999999h') // far beyond any safe integer
})
