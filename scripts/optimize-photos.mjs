import { readdir, mkdir, stat } from 'fs/promises'
import { join, extname, basename } from 'path'
import sharp from 'sharp'

const ROOT = join(process.cwd(), 'public')
const OUT  = join(ROOT, 'thumbs')

// Max long-edge in px. Wall photos are ~1.8 world-units wide; 1280 is ample
// with anisotropic filtering and slashes texture memory / decode time.
const MAX_EDGE = 1280
const QUALITY  = 80

await mkdir(OUT, { recursive: true })

const files = (await readdir(ROOT)).filter(
  (f) => /\.(jpe?g)$/i.test(f) && !f.startsWith('thumbs'),
)

let before = 0
let after  = 0
console.log(`Optimizing ${files.length} photos → ${MAX_EDGE}px / q${QUALITY}…`)

for (const file of files) {
  const inPath  = join(ROOT, file)
  const outPath = join(OUT, basename(file, extname(file)) + '.jpg')
  try {
    before += (await stat(inPath)).size
    await sharp(inPath)
      .rotate() // honour EXIF orientation
      .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(outPath)
    after += (await stat(outPath)).size
  } catch (e) {
    console.error(`  ✗ ${file}: ${e.message}`)
  }
}

const mb = (b) => (b / 1024 / 1024).toFixed(1)
console.log(`Done. ${mb(before)} MB → ${mb(after)} MB (${Math.round((1 - after / before) * 100)}% smaller)`)
