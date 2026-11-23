'use client'

import { createContext, use, useCallback, useMemo, useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toHref } from '@/lib/catalog-filters'

interface CatalogFiltersState {
  /** The query string, including refinements still in flight. */
  params: URLSearchParams
  /** True while a refinement is in flight. */
  pending: boolean
  /** Load the listing for `next` without scrolling. */
  navigate: (next: URLSearchParams) => void
}

const CatalogFiltersContext = createContext<CatalogFiltersState | null>(null)

interface CatalogFiltersProviderProps {
  /** The path the listing lives at. */
  pathname: string
  /** The query string the listing was rendered for. */
  query: string
  children: React.ReactNode
}

/**
 * The query string a listing's toolbar, filter drawer, and results share. It
 * updates optimistically, so an option fills on press and a second press builds
 * on the first.
 */
export function CatalogFiltersProvider({ pathname, query, children }: CatalogFiltersProviderProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useOptimistic(query)

  const params = useMemo(() => new URLSearchParams(search), [search])
  const navigate = useCallback(
    (next: URLSearchParams) =>
      startTransition(() => {
        setSearch(next.toString())
        // `push`, so Back undoes a filter.
        router.push(toHref(pathname, next), { scroll: false })
      }),
    [pathname, router, setSearch],
  )

  const value = useMemo(() => ({ params, pending, navigate }), [params, pending, navigate])

  return <CatalogFiltersContext value={value}>{children}</CatalogFiltersContext>
}

/** Read the listing's shared query string. Throws outside {@link CatalogFiltersProvider}. */
export function useCatalogFilters(): CatalogFiltersState {
  const state = use(CatalogFiltersContext)
  if (!state) throw new Error('useCatalogFilters must be used inside <CatalogFiltersProvider>.')
  return state
}
