import type { ProductDrawings, ProductImage, ProductMedia } from '@/lib/commerce/types'

/*
 * A demo product's photography, looked up in its store's `photos.json`: every
 * photo under that store's `products/` folder, with its pixel size. The files
 * themselves load from the media server, or from `public/demo/` once
 * `pnpm download-media` has saved them (see `next.config.ts`), so the list is
 * the single source of truth for what a product has.
 *
 * Shots are numbered, and the number is the whole convention. Position carries
 * the role:
 *
 *     products/<slug>/1.webp          the card and gallery lead shot
 *     products/<slug>/2.webp          revealed while the pointer rests on the card
 *     products/<slug>/3.webp …        further product-page shots
 *
 * A product with color variants puts each color in its own subfolder, named
 * after the color, numbered the same way. Colors need not be symmetric: one
 * can carry 4 shots and another 2:
 *
 *     products/<slug>/cosmic-orange/1.webp
 *     products/<slug>/deep-blue/1.webp
 *     products/<slug>/shared/1.webp   color-agnostic shots, appended to every color
 *
 * `shared` is reserved, and so is `drawings`, which holds a piece's line
 * drawings as `front.webp` and `side.webp` (see {@link readProductDrawings}).
 * Anything else is read as a color, and a color folder may hold a
 * `swatch.webp` beside its shots (see {@link readColorSwatch}).
 *
 * Only the shot size is declared: list `4.webp` and it joins the gallery, drop
 * `2.webp` and the card stops swapping on hover. A card that never swaps
 * (Fashion's does not) still shows shot 2, in the gallery.
 */

/** Subfolder holding shots that belong to every color rather than to one. */
const SHARED_FOLDER = 'shared'

/**
 * A store's `photos.json`: each photo's path under `products/`, and its width
 * and height. A photo that is not listed does not exist, whatever the folder holds.
 */
export type PhotoList = Record<string, number[]>

/**
 * Numbered `.webp` files in a folder, in numeric order. A gap in the sequence is
 * skipped rather than shifting the shots after it. A folder with none reads as
 * empty, because `shared` is optional and most products have none.
 */
function listShots(photos: PhotoList, folder: string): string[] {
  return Object.keys(photos)
    .flatMap((path) => {
      const numbered = path.startsWith(`${folder}/`) ? path.slice(folder.length + 1).match(/^(\d+)\.webp$/) : null
      return numbered ? [{ file: numbered[0], index: Number(numbered[1]) }] : []
    })
    .sort((a, b) => a.index - b.index)
    .map(({ file }) => file)
}

/** Slugify a color name into its subfolder name, e.g. `'Cosmic Orange'` → `'cosmic-orange'`. */
function colorFolder(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** How a demo shoots its catalog: every shot in it is rendered at this size. */
export interface ShotSize {
  width: number
  height: number
}

interface ReadProductMediaOptions {
  /** Alt text for the lead shot; the rest are numbered from it. */
  alt: string
  /**
   * The pixel size every shot in this demo is exported at. Declared rather than
   * read from the list, so a shot saved at the wrong size shows up as a crooked
   * image instead of a silent layout shift. Electronics shoots square,
   * Fashion 4:5.
   */
  size: ShotSize
  /** Color name, for a product with variants. Omit for a single-color product. */
  color?: string
  /** Folder under `products/` holding the product's own, e.g. a department: `products/women/<slug>/`. */
  group?: string
  /** The number of the shot showing the piece on its own, which becomes {@link ProductMedia.packshot}. */
  packshot?: number
}

/** Assemble the media for one product, or for one color, from the photos its store lists. */
export function readProductMedia(
  photos: PhotoList,
  demo: string,
  slug: string,
  { alt, size, color, group, packshot }: ReadProductMediaOptions,
): ProductMedia {
  const productPath = group ? `${group}/${slug}` : slug
  const folder = color ? `${productPath}/${colorFolder(color)}` : productPath

  const shots = listShots(photos, folder)
  if (shots.length === 0) {
    throw new Error(
      `Demo product "${slug}" lists no shots under ${folder}/ in photos.json. Every product needs 1.webp.`,
    )
  }

  // Shared shots trail every color's own. A single-color product's shots live in
  // the product folder itself, so there is nothing extra to append.
  const sharedShots = color
    ? listShots(photos, `${productPath}/${SHARED_FOLDER}`).map((file) => `${SHARED_FOLDER}/${file}`)
    : []

  const productUrl = `/demo/${demo}/products/${productPath}`
  const publicPath = color ? `${productUrl}/${colorFolder(color)}` : productUrl
  const toImage = (file: string, imageAlt: string): ProductImage => ({
    // Shared shots sit one level up from a color folder.
    src: file.startsWith(`${SHARED_FOLDER}/`) ? `${productUrl}/${file}` : `${publicPath}/${file}`,
    alt: imageAlt,
    ...size,
  })

  // A packshot is optional, so a number naming no photo drops it rather than the store.
  const packshotFile = packshot ? shots.find((file) => file === `${packshot}.webp`) : undefined
  if (packshot && !packshotFile) {
    console.warn(
      `Demo product "${slug}" names packshot ${packshot}, but photos.json lists no ${folder}/${packshot}.webp.`,
    )
  }

  const [lead, hover, ...rest] = shots

  return {
    image: toImage(lead, alt),
    hoverImage: hover ? toImage(hover, `${alt}, alternate view`) : undefined,
    gallery: [...rest, ...sharedShots].map((file, position) => toImage(file, `${alt}, view ${position + 2}`)),
    packshot: packshotFile ? toImage(packshotFile, alt) : undefined,
  }
}

/** A listed photo as an image, at the size the list records, or nothing where it is not listed. */
function listedImage(photos: PhotoList, demo: string, path: string, alt: string): ProductImage | undefined {
  const size = photos[path]
  if (!size) return undefined
  return { src: `/demo/${demo}/products/${path}`, alt, width: size[0], height: size[1] }
}

/**
 * A color's material up close, `products/<slug>/<color>/swatch.webp`, or
 * nothing where the list holds none. Not numbered, so it never joins the gallery.
 */
export function readColorSwatch(
  photos: PhotoList,
  demo: string,
  slug: string,
  color: string,
  alt: string,
): ProductImage | undefined {
  return listedImage(photos, demo, `${slug}/${colorFolder(color)}/swatch.webp`, alt)
}

/**
 * A product's line drawings, `products/<slug>/drawings/front.webp` and
 * `side.webp`, or nothing unless the list holds both. One pair per product: a
 * color changes what a piece looks like, never its outline. Drawings are cropped
 * to the piece they show, so each keeps the size the list records.
 */
export function readProductDrawings(
  photos: PhotoList,
  demo: string,
  slug: string,
  title: string,
): ProductDrawings | undefined {
  const front = listedImage(photos, demo, `${slug}/drawings/front.webp`, `${title}, front view drawing`)
  const side = listedImage(photos, demo, `${slug}/drawings/side.webp`, `${title}, side view drawing`)
  return front && side ? { front, side } : undefined
}
