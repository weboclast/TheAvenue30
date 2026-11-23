import { BrandAppleFilled } from '@appica/icons-react'
import { Button } from '@appica/ui-react/button'
import { GoogleMark } from '@/components/social-marks'

/** The Google/Apple pair shared by the sign-in forms. Demo-only: a real store starts each provider's sign-in from its auth backend. */
export function SocialSignInButtons() {
  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" className="flex-1">
        <GoogleMark aria-hidden data-icon="start" />
        Google
      </Button>
      <Button type="button" variant="outline" className="flex-1">
        <BrandAppleFilled data-icon="start" />
        Apple
      </Button>
    </div>
  )
}
