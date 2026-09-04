import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ABSOLUTE_ZERO_C,
  ABSOLUTE_ZERO_F,
  celsiusToKelvin,
  kelvinToCelsius,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  fahrenheitToKelvin,
  kelvinToFahrenheit,
} from '../lib/temperature.js'

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !~ ${b}`)

test('known conversion values', () => {
  close(celsiusToKelvin(0), 273.15)
  close(celsiusToKelvin(100), 373.15)
  close(kelvinToCelsius(273.15), 0)
  close(celsiusToFahrenheit(0), 32)
  close(celsiusToFahrenheit(100), 212)
  close(celsiusToFahrenheit(36.6), 97.88)
  close(fahrenheitToCelsius(32), 0)
  close(fahrenheitToCelsius(212), 100)
  close(fahrenheitToKelvin(32), 273.15)
  close(kelvinToFahrenheit(273.15), 32)
})

test('round-trip composition stays within float tolerance', () => {
  for (const x of [-40, 0, 0.1, 36.6, 100, 451]) {
    close(kelvinToCelsius(celsiusToKelvin(x)), x)
    close(fahrenheitToCelsius(celsiusToFahrenheit(x)), x)
    close(kelvinToFahrenheit(fahrenheitToKelvin(x)), x)
  }
})

test('exported absolute-zero constants', () => {
  assert.equal(ABSOLUTE_ZERO_C, -273.15)
  assert.equal(ABSOLUTE_ZERO_F, -459.67)
})

test('exactly absolute zero is valid', () => {
  close(celsiusToKelvin(ABSOLUTE_ZERO_C), 0)
  close(fahrenheitToKelvin(ABSOLUTE_ZERO_F), 0)
  close(kelvinToCelsius(0), ABSOLUTE_ZERO_C)
  close(kelvinToFahrenheit(0), ABSOLUTE_ZERO_F)
  close(celsiusToFahrenheit(ABSOLUTE_ZERO_C), ABSOLUTE_ZERO_F)
  close(fahrenheitToCelsius(ABSOLUTE_ZERO_F), ABSOLUTE_ZERO_C)
})

test('non-finite or non-number input throws TypeError', () => {
  const fns = [
    celsiusToKelvin,
    kelvinToCelsius,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    fahrenheitToKelvin,
    kelvinToFahrenheit,
  ]
  for (const fn of fns) {
    for (const bad of ['20', null, undefined, NaN, Infinity, -Infinity, {}]) {
      assert.throws(() => fn(bad), TypeError)
    }
  }
})

test('below absolute zero throws RangeError', () => {
  assert.throws(() => celsiusToKelvin(-273.16), RangeError)
  assert.throws(() => celsiusToFahrenheit(-274), RangeError)
  assert.throws(() => kelvinToCelsius(-1e-12), RangeError)
  assert.throws(() => kelvinToFahrenheit(-0.5), RangeError)
  assert.throws(() => fahrenheitToCelsius(-459.68), RangeError)
  assert.throws(() => fahrenheitToKelvin(-460), RangeError)
})

test('fahrenheitToKelvin stays finite at Number.MAX_VALUE', () => {
  const k = fahrenheitToKelvin(Number.MAX_VALUE)
  assert.ok(Number.isFinite(k), `expected finite Kelvin, got ${k}`)
  const expected = Number.MAX_VALUE / 9 * 5
  assert.ok(Math.abs(k - expected) / expected < 1e-12, `${k} !~ ${expected}`)
  assert.ok(Number.isFinite(fahrenheitToCelsius(Number.MAX_VALUE)))
})

test('type is checked before range', () => {
  assert.throws(() => kelvinToCelsius(NaN), TypeError)
})
