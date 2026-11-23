#!/usr/bin/env node
/*
 * Downloads the Fontshare fonts the code uses, before `pnpm dev` and `pnpm build`.
 * Fontshare's license forbids sharing the font files, so they are not in the
 * download: each copy of the project fetches its own from Fontshare, once, and
 * `next/font/local` serves it from there like any other local font.
 *
 * Code asks for a font by its path: `./fonts/fontshare/<font>/<file>.woff2`,
 * where `<font>` is the font's name in its Fontshare address
 * (fontshare.com/fonts/satoshi is `satoshi`), and the file saved is its
 * variable version. A file already there is left alone, so after the first run
 * this needs no connection.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LICENSE = 'https://www.fontshare.com/licenses/itf-ffl'

/** A relative path to a `.woff2` under a `fontshare/<font>/` folder, quoted in source. */
const FONT_PATH = /['"`](\.{1,2}\/[^'"`]*?fontshare\/([a-z0-9-]+)\/[^'"`/]+\.woff2)['"`]/g

/** Every `.ts` and `.tsx` file under `dir`. */
function sources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : sources(path)
    return /\.tsx?$/.test(entry.name) ? [path] : []
  })
}

/** The URL of a font's variable upright `.woff2`, read from the stylesheet Fontshare serves for it. */
async function fontUrl(font) {
  const response = await fetch(`https://api.fontshare.com/v2/css?f[]=${font}@1&display=swap`)
  if (!response.ok) throw new Error(`Fontshare answered ${response.status}`)
  const face = (await response.text()).split('@font-face').find((block) => /font-style:\s*normal/.test(block))
  const url = face?.match(/url\('([^']+\.woff2)'\)/)?.[1]
  if (!url) throw new Error(`Fontshare has no variable version of "${font}"`)
  return url.startsWith('//') ? `https:${url}` : url
}

const wanted = new Map()
for (const file of sources(join(ROOT, 'src'))) {
  const text = readFileSync(file, 'utf8')
  if (!text.includes('fontshare/')) continue
  for (const [, path, font] of text.matchAll(FONT_PATH)) wanted.set(resolve(dirname(file), path), font)
}

for (const [target, font] of wanted) {
  if (existsSync(target)) continue
  try {
    const response = await fetch(await fontUrl(font))
    if (!response.ok) throw new Error(`Fontshare answered ${response.status}`)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, Buffer.from(await response.arrayBuffer()))
    process.stdout.write(
      `Saved ${font} from Fontshare to ${relative(ROOT, target)}, under the ITF Free Font License: ${LICENSE}\n`,
    )
  } catch (error) {
    // Not fatal: pages that don't use the font still work, and the next run tries again.
    process.stderr.write(
      `Could not download ${font} from Fontshare (${error.message}). Pages that use it fail until it is saved, so connect to the internet and run the command again.\n`,
    )
  }
}
