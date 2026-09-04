export const ABSOLUTE_ZERO_C = -273.15
export const ABSOLUTE_ZERO_F = -459.67

function check(fnName, value, bound, unit) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${fnName}: expected a finite number, received ${String(value)}`)
  }
  if (value < bound) {
    throw new RangeError(`${fnName}: ${value} is below absolute zero (${bound} ${unit})`)
  }
}

export function celsiusToKelvin(c) {
  check('celsiusToKelvin', c, ABSOLUTE_ZERO_C, '°C')
  return c - ABSOLUTE_ZERO_C
}

export function kelvinToCelsius(k) {
  check('kelvinToCelsius', k, 0, 'K')
  return k + ABSOLUTE_ZERO_C
}

export function fahrenheitToKelvin(f) {
  check('fahrenheitToKelvin', f, ABSOLUTE_ZERO_F, '°F')
  // Divide before multiplying so finite extremes (e.g. Number.MAX_VALUE)
  // don't overflow in the intermediate product.
  return (f - ABSOLUTE_ZERO_F) / 9 * 5
}

export function kelvinToFahrenheit(k) {
  check('kelvinToFahrenheit', k, 0, 'K')
  return k * 9 / 5 + ABSOLUTE_ZERO_F
}

export function celsiusToFahrenheit(c) {
  check('celsiusToFahrenheit', c, ABSOLUTE_ZERO_C, '°C')
  return kelvinToFahrenheit(celsiusToKelvin(c))
}

export function fahrenheitToCelsius(f) {
  check('fahrenheitToCelsius', f, ABSOLUTE_ZERO_F, '°F')
  return kelvinToCelsius(fahrenheitToKelvin(f))
}
