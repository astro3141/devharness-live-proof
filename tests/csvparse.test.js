import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { parseCsv } from '../lib/csvparse.js'

test('defect: CRLF and lone CR were not treated as row terminators, leaking \\r into fields', () => {
  assert.deepEqual(parseCsv('a,b\r\nc,d\re,f\ng,h'), [
    ['a', 'b'],
    ['c', 'd'],
    ['e', 'f'],
    ['g', 'h'],
  ])
  for (const row of parseCsv('x\r\ny\rz')) {
    for (const field of row) assert.ok(!field.includes('\r'), `no \\r in field ${JSON.stringify(field)}`)
  }
})

test('defect: CRLF inside a quoted field kept the \\r instead of normalizing newlines to \\n', () => {
  assert.deepEqual(parseCsv('"line1\r\nline2",b\n"c\rd","e\nf"'), [
    ['line1\nline2', 'b'],
    ['c\nd', 'e\nf'],
  ])
  // quoted commas and escaped quotes stay intact alongside the newlines
  assert.deepEqual(parseCsv('"a,""q""\r\nz"'), [['a,"q"\nz']])
})

test('defect: trailing newline produced a spurious final empty row and "" produced [[""]] instead of []', () => {
  assert.deepEqual(parseCsv(''), [])
  assert.deepEqual(parseCsv('a,b\n'), [['a', 'b']])
  assert.deepEqual(parseCsv('a,b\r\n'), [['a', 'b']])
  // a genuinely empty last field is still kept
  assert.deepEqual(parseCsv('a,\n'), [['a', '']])
  assert.deepEqual(parseCsv('""\n'), [['']])
})

test('defect: UTF-8 BOM at start of input was not stripped', () => {
  assert.deepEqual(parseCsv('﻿a,b\nc,d'), [
    ['a', 'b'],
    ['c', 'd'],
  ])
  // BOM only stripped at the very start, not inside fields
  assert.deepEqual(parseCsv('a,﻿b'), [['a', '﻿b']])
})

test('defect: a quote in the middle of an unquoted field entered quote mode instead of staying literal', () => {
  assert.deepEqual(parseCsv('a"b,c'), [['a"b', 'c']])
  assert.deepEqual(parseCsv('a"b"c\nd'), [['a"b"c'], ['d']])
})

test('defect: characters after a closing quote were silently accepted instead of throwing malformed csv', () => {
  assert.throws(() => parseCsv('"a"b,c'), /^SyntaxError: malformed csv:/)
  assert.throws(() => parseCsv('x,"a" ,y'), /^SyntaxError: malformed csv:/)
  // comma and terminators right after the closing quote are fine
  assert.deepEqual(parseCsv('"a",b\n"c"\r\n"d"'), [['a', 'b'], ['c'], ['d']])
})

test('defect: unterminated quoted field at end of input was silently accepted instead of throwing malformed csv', () => {
  assert.throws(() => parseCsv('"abc'), /^SyntaxError: malformed csv:/)
  assert.throws(() => parseCsv('a,"b\nc'), /^SyntaxError: malformed csv:/)
  assert.throws(() => parseCsv('"a""'), /^SyntaxError: malformed csv:/)
})

test('defect: exported parseCsv carried no JSDoc for parameters, return value, and @throws', () => {
  const src = readFileSync(new URL('../lib/csvparse.js', import.meta.url), 'utf8')
  const jsdoc = src.match(/\/\*\*[\s\S]*?\*\/(?=\s*export function parseCsv)/)
  assert.ok(jsdoc, 'JSDoc block must directly precede export function parseCsv')
  assert.match(jsdoc[0], /@param \{string\} text/)
  assert.match(jsdoc[0], /@returns \{string\[\]\[\]\}/)
  assert.match(jsdoc[0], /@throws \{TypeError\}/)
  assert.match(jsdoc[0], /@throws \{SyntaxError\}/)
})
