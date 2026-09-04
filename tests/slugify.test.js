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

test('strips combining marks via NFKD normalization', () => {
  assert.equal(slugify('café'), 'cafe')
  assert.equal(slugify('Crème Brûlée'), 'creme-brulee')
})

test('normalizes decomposed input before stripping marks', () => {
  assert.equal(slugify('cafe\u0301'), 'cafe')
  assert.equal(slugify('A\u0308rger'), 'aerger')
})

test('applies German mappings case-insensitively before stripping', () => {
  assert.equal(
    slugify('Ärger Öl Über Straße'),
    'aerger-oel-ueber-strasse'
  )
  assert.equal(slugify('äöüß'), 'aeoeuess')
})

test('removes remaining non-ASCII characters', () => {
  assert.equal(slugify('東京 tower'), 'tower')
  assert.equal(slugify('naïve 漢字 test'), 'naive-test')
})

test('caps result at 80 characters', () => {
  assert.equal(slugify('a'.repeat(100)), 'a'.repeat(80))
  assert.equal(slugify('a'.repeat(80)).length, 80)
})

test('truncation never leaves a trailing dash', () => {
  const slug = slugify('a'.repeat(79) + ' bc')
  assert.equal(slug, 'a'.repeat(79))
  assert.ok(!slug.endsWith('-'))
})

test('returns "n-a" when everything is stripped', () => {
  assert.equal(slugify(''), 'n-a')
  assert.equal(slugify('!!!'), 'n-a')
  assert.equal(slugify('東京'), 'n-a')
  assert.equal(slugify('   '), 'n-a')
})
