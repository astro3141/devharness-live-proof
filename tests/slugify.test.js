import assert from 'node:assert/strict'
import { test } from 'node:test'
import { slugify } from '../lib/slugify.js'

test('lowercases input', () => {
  assert.equal(slugify('Hello World'), 'hello-world')
})

test('collapses runs of whitespace into a single dash', () => {
  assert.equal(slugify('foo \t\n  bar'), 'foo-bar')
})

test('removes ASCII characters outside [a-z0-9-]', () => {
  assert.equal(slugify('hello, world!'), 'hello-world')
  assert.equal(slugify('a_b.c/d'), 'abcd')
})

test('keeps digits and existing dashes', () => {
  assert.equal(slugify('item-42'), 'item-42')
})

test('collapses repeated dashes', () => {
  assert.equal(slugify('a -- b'), 'a-b')
  assert.equal(slugify('a---b'), 'a-b')
})

test('strips leading and trailing dashes', () => {
  assert.equal(slugify('  hello  '), 'hello')
  assert.equal(slugify('-hello-'), 'hello')
})

test('throws TypeError on non-string input', () => {
  for (const bad of [null, undefined, 42, {}, [], Symbol('x')]) {
    assert.throws(() => slugify(bad), TypeError)
  }
})
