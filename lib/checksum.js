const CRC_TABLE = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC_TABLE[n] = c
}

export function crc32(input) {
  let bytes
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input)
  } else if (input instanceof Uint8Array) {
    bytes = input
  } else {
    const type = input === null ? 'null' : typeof input
    throw new TypeError(`crc32 expects a string or Uint8Array, received ${type}`)
  }
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}
