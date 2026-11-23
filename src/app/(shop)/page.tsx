import { redirect } from 'next/navigation'
import { Bestsellers } from '@/components/fashion/home/bestsellers'
import { CampaignCategories } from '@/components/fashion/home/campaign-categories'
import { HomeCollections } from '@/components/fashion/home/home-collections'
import { HomeHero } from '@/components/fashion/home/home-hero'
import { HomeJournal } from '@/components/fashion/home/home-journal'
import { NewArrivals } from '@/components/fashion/home/new-arrivals'
import { Sale } from '@/components/fashion/home/sale'
import { ServicePromises } from '@/components/fashion/home/service-promises'
import { getDepartment } from '@/lib/departments'

/** Redirects to the department opened last, else the store's first. A store with no departments has its home here. */
export default async function FashionHomePage() {
  const department = await getDepartment('fashion')
  if (department) redirect(`/${department.slug}`)

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="sr-only">The Avenue 30</h1>
      <HomeHero />
      <CampaignCategories />
      <Bestsellers />
      <HomeCollections />
      <NewArrivals />
      <Sale />
      <ServicePromises />
      <HomeJournal />
    </main>
  )
}
