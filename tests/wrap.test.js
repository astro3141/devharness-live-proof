import assert from 'node:assert/strict'
import { test } from 'node:test'
import { wordWrapLines } from '../lib/wrap.js'

test('W1: no returned line exceeds width columns', () => {
  const text = 'the quick brown fox jumps over supercalifragilisticexpialidocious lazy dogs'
  for (const width of [1, 3, 7, 12, 80]) {
    for (const line of wordWrapLines(text, width)) {
      assert.ok(line.length <= width, `line ${JSON.stringify(line)} exceeds width ${width}`)
    }
  }
})

test('W2: CRLF and lone CR normalize to LF; hard breaks are preserved', () => {
  assert.deepEqual(wordWrapLines('a\r\nb\rc\nd', 80), ['a', 'b', 'c', 'd'])
})

test('W2: an empty segment between hard breaks yields an empty line', () => {
  assert.deepEqual(wordWrapLines('a\n\nb', 80), ['a', '', 'b'])
})

test('W3: soft breaks happen at spaces and consume them on both sides', () => {
  assert.deepEqual(wordWrapLines('hello world', 5), ['hello', 'world'])
  assert.deepEqual(wordWrapLines('aa   bb', 3), ['aa', 'bb'])
})

test('W4: interior space runs not consumed by a soft break are preserved exactly', () => {
  assert.deepEqual(wordWrapLines('a  b   c', 20), ['a  b   c'])
  assert.deepEqual(wordWrapLines('x    y z', 6), ['x    y', 'z'])
})

test('W5: tabs expand to the next multiple of 4 columns and never appear in output', () => {
  assert.deepEqual(wordWrapLines('\tx', 20), ['    x'])
  assert.deepEqual(wordWrapLines('a\tb\tc', 20), ['a   b   c'])
  for (const line of wordWrapLines('ab\tcd\tef ghij\tk', 9)) {
    assert.ok(!line.includes('\t'), 'tab leaked into output')
  }
})

test('W5: tab columns reset after a hard break', () => {
  assert.deepEqual(wordWrapLines('ab\ncd\te', 20), ['ab', 'cd  e'])
})

test('W6: a word longer than width is hard-broken at exactly width columns, repeatedly', () => {
  assert.deepEqual(wordWrapLines('abcdefghij', 3), ['abc', 'def', 'ghi', 'j'])
  assert.deepEqual(wordWrapLines('xx abcdefgh', 4), ['xx', 'abcd', 'efgh'])
})

test('W7: a hyphenated word may break after the hyphen, hyphen staying on the first line', () => {
  assert.deepEqual(wordWrapLines('foo-bar', 5), ['foo-', 'bar'])
  assert.deepEqual(wordWrapLines('foo-bar', 4), ['foo-', 'bar'])
  // no alphanumerics on both sides -> not a break opportunity
  assert.deepEqual(wordWrapLines('a--b', 3), ['a--', 'b'])
})

test('W8: non-string text throws TypeError; bad width throws RangeError "invalid width:"', () => {
  assert.throws(() => wordWrapLines(42, 5), TypeError)
  assert.throws(() => wordWrapLines(null, 5), TypeError)
  for (const bad of [0, -1, 2.5, '10', NaN, Infinity]) {
    assert.throws(() => wordWrapLines('x', bad), (err) => {
      assert.ok(err instanceof RangeError)
      assert.match(err.message, /^invalid width:/)
      return true
    })
  }
})

test('W9: empty text and space-only text both yield [""]', () => {
  assert.deepEqual(wordWrapLines('', 10), [''])
  assert.deepEqual(wordWrapLines('     ', 10), [''])
})
