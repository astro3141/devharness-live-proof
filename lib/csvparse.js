// Minimal CSV parser. RFC4180-ish.

/**
 * Parse CSV text into rows of string fields.
 *
 * Row terminators are `\n`, `\r\n`, and lone `\r`; terminator characters
 * never appear in field data. A field starting with `"` is quoted and may
 * contain commas, escaped quotes (`""`), and newlines (kept in the field,
 * normalized to `\n`). A leading UTF-8 BOM is stripped. A trailing row
 * terminator does not produce a final empty row; empty input yields no rows.
 *
 * @param {string} text - The CSV source text.
 * @returns {string[][]} Rows, each an array of field strings.
 * @throws {TypeError} If `text` is not a string.
 * @throws {SyntaxError} `malformed csv: ...` if a quoted field is followed by
 *   characters other than a comma or row terminator, or if a quoted field is
 *   unterminated at end of input.
 */
export function parseCsv(text) {
  if (typeof text !== 'string') throw new TypeError('csv must be a string')
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  let fieldStart = true
  let afterClose = false
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue }
        inQuotes = false; afterClose = true; i += 1; continue
      }
      if (ch === '\r') { field += '\n'; i += text[i + 1] === '\n' ? 2 : 1; continue }
      field += ch; i += 1; continue
    }
    if (ch === ',') {
      row.push(field); field = ''; fieldStart = true; afterClose = false; i += 1; continue
    }
    if (ch === '\n' || ch === '\r') {
      row.push(field); rows.push(row); row = []; field = ''; fieldStart = true; afterClose = false
      i += ch === '\r' && text[i + 1] === '\n' ? 2 : 1
      continue
    }
    if (afterClose) {
      throw new SyntaxError(`malformed csv: unexpected character ${JSON.stringify(ch)} after closing quote at index ${i}`)
    }
    if (ch === '"' && fieldStart) { inQuotes = true; fieldStart = false; i += 1; continue }
    field += ch; fieldStart = false; i += 1
  }
  if (inQuotes) throw new SyntaxError('malformed csv: unterminated quoted field at end of input')
  if (field !== '' || row.length > 0 || afterClose) {
    row.push(field)
    rows.push(row)
  }
  return rows
}
