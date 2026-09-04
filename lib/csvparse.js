// Minimal CSV parser. RFC4180-ish. Known to be buggy; see issue tracker.
export function parseCsv(text) {
  if (typeof text !== 'string') throw new TypeError('csv must be a string')
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue }
        inQuotes = false; i += 1; continue
      }
      field += ch; i += 1; continue
    }
    if (ch === '"') { inQuotes = true; i += 1; continue }
    if (ch === ',') { row.push(field); field = ''; i += 1; continue }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; i += 1; continue }
    field += ch; i += 1
  }
  row.push(field)
  rows.push(row)
  return rows
}
