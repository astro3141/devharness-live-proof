const MAX_MS = BigInt(Number.MAX_SAFE_INTEGER)

// Descending order; index doubles as the ordering rank. 'ms' must be listed
// before 'm' in the lexer alternation so "1ms" never lexes as "1m" + "s".
const UNITS = ['h', 'm', 's', 'ms']
const UNIT_MS = { h: 3600000n, m: 60000n, s: 1000n, ms: 1n }
const COMPONENT = /^(\d+)(ms|h|m|s)/

export function parseDuration(input) {
  if (typeof input !== 'string') {
    throw new TypeError('parseDuration: input must be a string')
  }
  const fail = () => {
    throw new RangeError(`invalid duration: ${JSON.stringify(input)}`)
  }

  if (/^\d+$/.test(input)) {
    const ms = BigInt(input) * 1000n
    if (ms > MAX_MS) fail()
    return Number(ms)
  }

  if (input === '') fail()

  let rest = input
  let lastRank = -1
  let total = 0n
  while (rest.length > 0) {
    const match = COMPONENT.exec(rest)
    if (match === null) fail()
    const rank = UNITS.indexOf(match[2])
    if (rank <= lastRank) fail()
    lastRank = rank
    total += BigInt(match[1]) * UNIT_MS[match[2]]
    if (total > MAX_MS) fail()
    rest = rest.slice(match[0].length)
  }
  return Number(total)
}
