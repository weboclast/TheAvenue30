/**
 * A clip with an alpha channel, encoded twice: HEVC for Safari, which plays
 * transparency in no other codec, and VP9 for every other browser.
 */
export interface TransparentClip {
  /** HEVC with alpha in a QuickTime file. */
  hevc: string
  /** VP9 with alpha in a WebM file. */
  webm: string
}

/**
 * The `<source>` elements for a clip: 1 MP4, or both encodes of a
 * {@link TransparentClip}. The QuickTime goes first because only Safari claims
 * that type, so every other browser falls through to the WebM.
 */
export function ClipSources({ src }: { src: string | TransparentClip }) {
  if (typeof src === 'string') return <source src={src} type="video/mp4" />

  return (
    <>
      <source src={src.hevc} type="video/quicktime" />
      <source src={src.webm} type="video/webm" />
    </>
  )
}
