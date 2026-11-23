#!/usr/bin/env node
/*
 * `pnpm download-media` saves the sample photos and videos into `public/demo/`,
 * so the stores work offline. It is optional: without these files, the same
 * paths load from Appica's media server (see `next.config.ts`).
 *
 * It saves only what the project still uses: a store's files while its sample
 * data is here, and the landing page's while the showcase is, so it works the
 * same before and after `pnpm use-demo`. Files already saved are skipped, so a
 * second run after an update fetches only what is new.
 */

import { createWriteStream, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'

/** Keep in step with `DEMO_MEDIA_URL` in `next.config.ts`. */
const MEDIA_URL = 'https://media.appica.dev/appica-store'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Downloads at a time. */
const PARALLEL = 8

const storeKept = (slug) => existsSync(join(ROOT, 'src/lib/commerce/adapters/demo/data', slug))
const showcaseKept = existsSync(join(ROOT, 'src/components/demo-showcase'))

/** Whether the project still uses a file from the media server, judged by the folder it belongs to. */
function inUse(file) {
  const [, owner, name] = file.match(/^demo\/([^/]+)\/(.+)$/) ?? []
  if (owner === 'shared') return true
  if (owner === 'landing') return showcaseKept
  // A store's previews belong to the showcase's store cards.
  if (/^preview(-dark)?\.webp$/.test(name ?? '')) return showcaseKept && storeKept(owner)
  return owner !== undefined && storeKept(owner)
}

function fail(message) {
  process.stderr.write(`\n${message}\n`)
  process.exit(1)
}

let index
try {
  const response = await fetch(`${MEDIA_URL}/index.json`)
  if (!response.ok) throw new Error(`it answered ${response.status}`)
  index = await response.json()
} catch (error) {
  fail(`Could not reach Appica's media server (${error.message}). Check your connection and run it again.`)
}

const wanted = index.files.filter(inUse)
const missing = wanted.filter((file) => !existsSync(join(ROOT, 'public', file)))
if (missing.length === 0) {
  process.stdout.write(`All ${wanted.length} sample files are already in public/demo/.\n`)
  process.exit(0)
}

process.stdout.write(`Saving ${missing.length} of ${wanted.length} sample files into public/demo/...\n`)

/** Saves 1 file, through a partial file renamed at the end, so an interrupted run never leaves a broken one. */
async function download(file) {
  const target = join(ROOT, 'public', file)
  const partial = `${target}.part`
  const response = await fetch(`${MEDIA_URL}/${file}`)
  if (!response.ok || !response.body) throw new Error(`the server answered ${response.status}`)
  mkdirSync(dirname(target), { recursive: true })
  try {
    await pipeline(Readable.fromWeb(response.body), createWriteStream(partial))
    renameSync(partial, target)
  } catch (error) {
    rmSync(partial, { force: true })
    throw error
  }
}

const queue = [...missing]
const failures = []
let saved = 0

async function worker() {
  for (let file = queue.shift(); file; file = queue.shift()) {
    try {
      await download(file)
      saved += 1
      if (saved % 100 === 0) process.stdout.write(`  ${saved} saved\n`)
    } catch (error) {
      failures.push(`  ${file}: ${error.message}`)
    }
  }
}

await Promise.all(Array.from({ length: PARALLEL }, worker))

if (failures.length) {
  fail(`Saved ${saved} files, but ${failures.length} failed:\n${failures.join('\n')}\nRun it again to retry them.`)
}
process.stdout.write(`Saved ${saved} files. The stores now work offline.\n`)
