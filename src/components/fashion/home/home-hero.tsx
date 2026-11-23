import { HeroSlider } from '@/components/fashion/home/hero-slider'
import { getCommerce } from '@/lib/commerce'

interface HomeHeroProps {
  /** The department whose campaigns it opens with. Omit for the whole store's. */
  department?: string
}

/** The campaigns a home opens with. Renders nothing where none are merchandised. */
export async function HomeHero({ department }: HomeHeroProps) {
  const campaigns = await getCommerce('fashion').getHeroCampaigns(department)
  if (campaigns.length === 0) return null

  return <HeroSlider campaigns={campaigns} />
}
