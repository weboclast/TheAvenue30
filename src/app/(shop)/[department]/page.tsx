import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Bestsellers } from '@/components/fashion/home/bestsellers'
import { CampaignCategories } from '@/components/fashion/home/campaign-categories'
import { HomeCollections } from '@/components/fashion/home/home-collections'
import { HomeHero } from '@/components/fashion/home/home-hero'
import { HomeJournal } from '@/components/fashion/home/home-journal'
import { NewArrivals } from '@/components/fashion/home/new-arrivals'
import { Sale } from '@/components/fashion/home/sale'
import { ServicePromises } from '@/components/fashion/home/service-promises'
import { findDepartment } from '@/lib/departments'
import { RememberDepartment } from '@/lib/departments/remember-department'

export async function generateMetadata({ params }: PageProps<'/[department]'>): Promise<Metadata> {
  const department = await findDepartment('fashion', (await params).department)
  if (!department) notFound()
  return { title: department.name }
}

/** A department's home, `/women` or `/men`. */
export default async function FashionDepartmentPage({ params }: PageProps<'/[department]'>) {
  const department = await findDepartment('fashion', (await params).department)
  if (!department) notFound()

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="sr-only">The Avenue 30: {department.name}</h1>
      <RememberDepartment demo="fashion" slug={department.slug} />
      <HomeHero department={department.slug} />
      <CampaignCategories department={department.slug} />
      <Bestsellers department={department.slug} />
      <HomeCollections department={department.slug} />
      <NewArrivals department={department.slug} />
      <Sale department={department.slug} />
      <ServicePromises />
      <HomeJournal />
    </main>
  )
}
