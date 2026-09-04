const isAlnum = (ch) => /[a-zA-Z0-9]/.test(ch)

// W7: split a word into fragments that may soft-break after an interior
// hyphen with alphanumerics on both sides; the hyphen ends its fragment.
function hyphenFragments(word) {
  const frags = []
  let start = 0
  for (let i = 1; i < word.length - 1; i++) {
    if (word[i] === '-' && isAlnum(word[i - 1]) && isAlnum(word[i + 1])) {
      frags.push(word.slice(start, i + 1))
      start = i + 1
    }
  }
  frags.push(word.slice(start))
  return frags
}

// Wrap one hard-break-free segment. `pending` holds whitespace not yet
// committed to the line: it is kept verbatim when the next word fits (W4)
// and consumed entirely when a soft break happens there (W3).
function wrapSegment(segment, width) {
  const out = []
  let cur = ''
  let pending = ''

  let i = 0
  while (i < segment.length) {
    const ch = segment[i]
    if (ch === ' ') {
      let j = i
      while (j < segment.length && segment[j] === ' ') j++
      pending += segment.slice(i, j)
      i = j
    } else if (ch === '\t') {
      // W5: expand at the column the tab would occupy on this line
      const col = cur.length + pending.length
      pending += ' '.repeat(4 - (col % 4))
      i++
    } else {
      let j = i
      while (j < segment.length && segment[j] !== ' ' && segment[j] !== '\t') j++
      const word = segment.slice(i, j)
      i = j
      let first = true
      for (let frag of hyphenFragments(word)) {
        const sep = first ? pending : ''
        if (cur.length + sep.length + frag.length <= width) {
          cur += sep + frag
        } else {
          if (cur !== '') {
            out.push(cur)
            cur = ''
          }
          // W6: hard-break a fragment that cannot fit on a line of its own
          while (frag.length > width) {
            out.push(frag.slice(0, width))
            frag = frag.slice(width)
          }
          cur = frag
        }
        first = false
      }
      pending = ''
    }
  }
  // trailing whitespace in `pending` is stripped (W9)
  out.push(cur)
  return out
}

export function wordWrapLines(text, width) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string')
  }
  if (typeof width !== 'number' || !Number.isInteger(width) || width < 1) {
    throw new RangeError(`invalid width: ${width}`)
  }
  // W2: normalize line endings, then treat each \n as a hard break
  const segments = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const lines = []
  for (const seg of segments) {
    lines.push(...wrapSegment(seg, width))
  }
  return lines
}
