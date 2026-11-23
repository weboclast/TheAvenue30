import { LoopingVideo } from '@/components/looping-video'

/** The 404's sock, hung out to dry without its pair, fluttering in a loop. */
export function SockArtwork() {
  return (
    <div className="bg-background-muted relative aspect-4/3 w-full max-w-sm overflow-hidden rounded-sm md:max-w-md">
      <LoopingVideo
        src={{ hevc: '/demo/shared/not-found/sock.mov', webm: '/demo/shared/not-found/sock.webm' }}
        poster="/demo/shared/not-found/sock.webp"
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  )
}
