# Design: `lib/checksum.js`

Status: decided (issue #18). Design only — no implementation in this lane.

## 1. Algorithm: CRC-32

**CRC-32** (IEEE polynomial, reflected, `0xEDB88320`, init/xorout
`0xFFFFFFFF`) — the zlib/gzip/PNG variant.

- Strictly stronger detection than Fletcher-16: catches all single-bit
  and double-bit errors and all burst errors up to 32 bits; a 32-bit
  space also collides far less often than Fletcher's 16 bits.
- Interoperable: results can be checked against zlib, `cksum`-style
  tools, and countless existing implementations. Fletcher-16 has no
  comparable ecosystem.
- Fletcher-16's only advantage is speed on constrained hardware, which
  is irrelevant for a Node library; a table-driven CRC-32 is plenty
  fast in JS.

## 2. Public API

ESM named export (matching `lib/greet.js` / `lib/temperature.js` style):

```js
export function crc32(input) // string | Uint8Array -> number
```

- `Uint8Array` is checksummed byte-for-byte as given.
- A `string` is first encoded as UTF-8 (via `TextEncoder`), so
  `crc32("abc")` equals `crc32(new TextEncoder().encode("abc"))`.
  UTF-8 is the only encoding offered; callers needing another encoding
  pass bytes themselves.
- One function, no options object. Streaming/incremental hashing is
  out of scope until a caller needs it.

## 3. Error semantics

Fail fast with thrown errors; never return `NaN` or sentinel values.

- Input that is neither a `string` nor a `Uint8Array` (including
  `Buffer`-free `ArrayBuffer`, `null`, `undefined`, numbers): throw
  `TypeError` with a message naming the function and the received type.
  (`Buffer` is accepted implicitly since it is a `Uint8Array` subclass.)
- Empty input is valid, not an error: `crc32("")` returns `0`, the
  standard CRC-32 of zero bytes.
- Plain built-in error classes; no custom subclasses (same rationale
  as `lib/temperature.js` §3).

## 4. Output format: unsigned number

**Return a `number`** — the unsigned 32-bit value (`crc >>> 0`,
range `0 … 2³²−1`), never a signed/negative result.

- A number composes: callers can compare, store, or serialize it
  without parsing, and hex is one expression away
  (`crc32(x).toString(16).padStart(8, "0")`).
- Returning hex would bake in presentation choices (case, padding,
  `0x` prefix) the library shouldn't own — mirroring the "no rounding
  in the library" policy of `lib/temperature.js` §4.
