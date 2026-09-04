# Design: `lib/temperature.js`

Status: decided (issue #14). Design only — no implementation in this lane.

## 1. Internal unit representation

**Kelvin.** All conversions route through kelvin internally.

- Kelvin is the SI base unit with an absolute zero at 0, which makes the
  physical-validity check a single non-negativity test in one place.
- With one canonical unit, supporting N scales needs 2N conversion steps
  (to/from kelvin) instead of N×(N−1) pairwise formulas, and any future
  scale (e.g. Rankine) slots in without touching existing code.
- Celsius was rejected as the pivot: its zero point is arbitrary, so the
  absolute-zero bound (−273.15) would be a magic constant in every check.

## 2. Public API

ESM named exports (matching `lib/greet.js` style). All functions take a
single `number` and return a `number`.

```js
export function celsiusToKelvin(c)     // number -> number
export function kelvinToCelsius(k)     // number -> number
export function celsiusToFahrenheit(c) // number -> number
export function fahrenheitToCelsius(f) // number -> number
export function fahrenheitToKelvin(f)  // number -> number
export function kelvinToFahrenheit(k)  // number -> number

export const ABSOLUTE_ZERO_C = -273.15 // exported constants for callers
export const ABSOLUTE_ZERO_F = -459.67
```

All six pairwise directions are exported for caller convenience; the
F↔C and F↔K functions are internally composed via kelvin (§1).

## 3. Error semantics

Fail fast with thrown errors; never return `NaN` or `null` sentinels.

- **Invalid type** — argument is not a finite number (`typeof !== 'number'`,
  `NaN`, `±Infinity`): throw `TypeError` with a message naming the function
  and the received value.
- **Physically impossible** — input below absolute zero in the input scale
  (K < 0, C < −273.15, F < −459.67): throw `RangeError`, message includes
  the offending value and the applicable bound.
- Type is checked before range. Exactly absolute zero is valid.
- Plain built-in error classes; no custom error subclasses for a module
  this small.

## 4. Rounding / precision policy

**No rounding inside the module.** Functions return full IEEE 754 double
precision; presentation-layer rounding is the caller's responsibility.

- Rounding in the library destroys information and breaks round-trip
  composition (`kelvinToCelsius(celsiusToKelvin(x))` should be as close
  to `x` as floats allow).
- Consequence for tests: comparisons must use a tolerance (e.g.
  `assert.ok(Math.abs(a - b) < 1e-9)`), not strict equality, since
  results like `36.6°C -> 97.88°F` are not exact in binary floating point.
- The absolute-zero range check uses exact comparison against the
  constants in §2 — no epsilon slack on the physical bound.
