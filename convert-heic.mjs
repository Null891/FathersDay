import { readdir, readFile, writeFile } from 'fs/promises'
import { join, basename, extname } from 'path'
import convert from 'heic-convert'

const SRC = new URL('.', import.meta.url).pathname.slice(1).replace(/\/$/, '')
const DST = join(SRC, 'public')

const files = (await readdir(SRC)).filter(f => /\.heic$/i.test(f))

console.log(`Converting ${files.length} HEIC files…`)

for (const file of files) {
  const outName = basename(file, extname(file)) + '.jpg'
  const outPath = join(DST, outName)
  try {
    const input  = await readFile(join(SRC, file))
    const output = await convert({ buffer: input, format: 'JPEG', quality: 0.92 })
    await writeFile(outPath, Buffer.from(output))
    console.log(`  ✓ ${file} → ${outName}`)
  } catch (e) {
    console.error(`  ✗ ${file}: ${e.message}`)
  }
}

console.log('Done.')
