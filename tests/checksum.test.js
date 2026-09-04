import assert from 'node:assert/strict'
import { test } from 'node:test'
import { crc32 } from '../lib/checksum.js'

test('known vectors match zlib crc32', () => {
  assert.equal(crc32('abc'), 0x352441c2)
  assert.equal(crc32('123456789'), 0xcbf43926)
  assert.equal(crc32('The quick brown fox jumps over the lazy dog'), 0x414fa339)
})

test('empty input returns 0', () => {
  assert.equal(crc32(''), 0)
  assert.equal(crc32(new Uint8Array(0)), 0)
})

test('string input is UTF-8 encoded', () => {
  assert.equal(crc32('héllo ✓'), crc32(new TextEncoder().encode('héllo ✓')))
})

test('Uint8Array is checksummed byte-for-byte', () => {
  assert.equal(crc32(new Uint8Array([0x61, 0x62, 0x63])), crc32('abc'))
})

test('Buffer is accepted as a Uint8Array subclass', () => {
  assert.equal(crc32(Buffer.from('abc')), crc32('abc'))
})

test('result is unsigned', () => {
  const crc = crc32('a')
  assert.equal(crc, 0xe8b7be43)
  assert.ok(crc >= 0)
  assert.ok(crc <= 0xffffffff)
})

test('invalid input throws TypeError naming the function and type', () => {
  for (const bad of [null, undefined, 42, {}, [1, 2], new ArrayBuffer(4)]) {
    assert.throws(
      () => crc32(bad),
      (err) => err instanceof TypeError && /crc32/.test(err.message),
    )
  }
})
