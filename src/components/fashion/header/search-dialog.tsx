'use client'

import { type SubmitEvent, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Camera, Search } from '@appica/icons-react'
import { Button, buttonVariants } from '@appica/ui-react/button'
import { Input } from '@appica/ui-react/input'
import { Spinner } from '@appica/ui-react/spinner'
import { COLUMN_HEADING, LinkColumn } from '@/components/fashion/link-column'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import { type DepartmentLink, useCurrentDepartment } from '@/components/fashion/use-current-department'
import {
  Overlay,
  OverlayBody,
  OverlayContent,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
  OverlayTrigger,
} from '@/components/overlay-sheet'
import { useCloseOnNavigate } from '@/components/use-close-on-navigate'
import { useLazyPanel } from '@/components/use-lazy-panel'
import { SearchResultCard } from './search-result-card'
import { searchHref, searchStatus, splitMatch } from '@/lib/search/constants'
import { useSearchSuggestions } from '@/lib/search/use-search-suggestions'
import { useTermPicker } from '@/lib/search/use-term-picker'
import { cn } from '@/lib/utils'

/** Products previewed: 2 rows of 4 on a wide screen, 4 rows of 2 on a phone. */
const PRODUCT_LIMIT = 8

/** A fixed height, so the field holds still while the results under it come and go, and the panel fills it. */
const DIALOG_SIZE = 'h-224 w-260 *:flex-1'

/** The sheet takes the whole screen: the keyboard covers half of it, and the field has to stay above that. */
const SHEET_SIZE = '[--drawer-height:100%]'

/**
 * The library's input with its frame taken off, set as large as a title. The
 * `!` beats the pill `globals.css` gives every input: with no padding, a round
 * corner clips the caret to a sliver until the first letter moves it inward.
 */
const FIELD = cn(
  'text-foreground-intense h-auto rounded-none! border-0 bg-transparent p-0 text-2xl font-medium',
  'pointer-coarse:text-2xl focus-visible:ring-0',
)

/** A department, with the categories listed under it before a search. */
interface SearchDepartment extends DepartmentLink {
  links: { label: string; href: string }[]
}

interface SearchDialogProps {
  /** The store's departments, which the dialog lists until there are results. */
  departments: SearchDepartment[]
  /** The department opened last, searched where the URL names none. */
  remembered?: string
}

/** The photo search's code, loaded after the page: it brings a file picker few searches need. */
const loadPhotoSearch = () => import('./photo-search').then((module) => module.PhotoSearch)

/**
 * The header's search button and what it opens: a dialog, or a sheet on a
 * phone, holding the field, suggested terms, and the products matching so far.
 * It searches the department on screen, or the whole store where there are
 * none, and Enter opens that listing for the term. The arrow keys walk the
 * terms only; the cards are reached by Tab. The Photo button beside the field
 * turns the body into the photo search, and typing turns it back.
 */
export function SearchDialog({ departments, remembered }: SearchDialogProps) {
  const router = useRouter()
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useCloseOnNavigate(false)
  const [term, setTerm] = useState('')
  const [byPhoto, setByPhoto] = useState(false)
  const { Panel: PhotoSearch, whenLoaded: whenPhotoSearchLoaded } = useLazyPanel(loadPhotoSearch)

  const { current: department } = useCurrentDepartment(departments, remembered)
  const departmentName = departments.find(({ slug }) => slug === department)?.name
  const { suggestions, pending } = useSearchSuggestions('fashion', term, PRODUCT_LIMIT, department)
  const query = term.trim()
  const found = suggestions && suggestions.total > 0 ? suggestions : null
  const terms = found?.terms ?? []
  const { active, setActive, onKeyDown: keyDown, termFor } = useTermPicker(terms)

  // A search from its own results page changes no pathname, so links close the dialog themselves.
  const close = () => setOpen(false)

  const openChange = (next: boolean) => {
    setOpen(next)
    // Opens clean, rather than emptying on the way out.
    if (next) {
      setTerm('')
      setActive(-1)
      setByPhoto(false)
    }
  }

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const chosen = termFor(query)
    if (!chosen) return

    close()
    router.push(searchHref('fashion', chosen, department))
  }

  return (
    <Overlay open={open} onOpenChange={openChange}>
      {/* Triggers rename the slot; these take it back for `globals.css`. */}
      <OverlayTrigger
        render={
          <Button data-slot="button" variant="ghost" size="icon-md" aria-label="Search" className="sm:hidden">
            <Search />
          </Button>
        }
      />
      <OverlayTrigger
        render={
          <Button data-slot="button" variant="ghost" className="max-sm:hidden">
            <Search data-icon="start" />
            Search
          </Button>
        }
      />

      <OverlayContent
        className={DIALOG_SIZE}
        sheetClassName={SHEET_SIZE}
        closeLabel="Close search"
        closeOnPage
        sheetCloseButton={false}
        initialFocus={inputRef}
      >
        <OverlayHeader className="border-b">
          <OverlayTitle className="sr-only">Search</OverlayTitle>
          <form role="search" onSubmit={submit} className="flex items-center gap-3">
            <Input
              ref={inputRef}
              // Not `type="search"`: WebKit draws a clear button of its own.
              enterKeyHint="search"
              value={term}
              placeholder="Search"
              aria-label="Search products"
              role="combobox"
              aria-expanded={terms.length > 0}
              aria-controls={terms.length > 0 ? listId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => {
                setTerm(event.target.value)
                setActive(-1)
                setByPhoto(false)
              }}
              onKeyDown={keyDown}
              className={FIELD}
            />
            {pending ? <Spinner variant="dots" currentColor aria-hidden className="shrink-0 text-xl" /> : null}
            {term ? (
              <Button
                variant="ghost"
                size="sm"
                className={TEXT_ACTION}
                onClick={() => {
                  setTerm('')
                  setActive(-1)
                  inputRef.current?.focus()
                }}
              >
                Clear
              </Button>
            ) : null}
            <Button
              variant={byPhoto ? 'primary' : 'soft'}
              aria-pressed={byPhoto}
              onClick={() => {
                if (byPhoto) setByPhoto(false)
                else whenPhotoSearchLoaded(() => setByPhoto(true))
                setTerm('')
                setActive(-1)
              }}
              // Square below `sm`, where the field needs the room. The `!` beats the padding `data-icon` sets.
              className="shrink-0 max-sm:size-12 max-sm:p-0!"
            >
              <Camera data-icon="start" />
              <span className="max-sm:sr-only">Photo</span>
            </Button>
            <p role="status" className="sr-only">
              {byPhoto ? null : searchStatus(suggestions, pending, query, departmentName)}
            </p>
          </form>
        </OverlayHeader>

        <OverlayBody className="flex flex-col gap-6 py-6">
          {byPhoto && PhotoSearch ? (
            <PhotoSearch department={department} departmentName={departmentName} onNavigate={close} />
          ) : (
            <>
              {suggestions && !found ? (
                <div className="flex flex-col gap-1">
                  <p className="text-foreground-intense text-lg font-medium">
                    No results for &ldquo;{query}&rdquo;{departmentName ? ` in ${departmentName}` : null}
                  </p>
                  <p>Check the spelling, or try a shorter word.</p>
                </div>
              ) : null}

              {found ? (
                <>
                  {terms.length > 0 ? (
                    <section className="flex flex-col gap-0.5">
                      <h3 className={COLUMN_HEADING}>Suggestions</h3>
                      <ul
                        id={listId}
                        role="listbox"
                        aria-label="Search suggestions"
                        className="-mx-3 flex flex-col pt-1"
                      >
                        {terms.map((suggestion, index) => (
                          <li key={suggestion} role="presentation">
                            <Link
                              id={`${listId}-${index}`}
                              role="option"
                              aria-selected={index === active}
                              href={searchHref('fashion', suggestion, department)}
                              onClick={close}
                              onMouseEnter={() => setActive(index)}
                              tabIndex={-1}
                              className={cn(
                                'flex w-fit max-w-full items-center gap-2 rounded-full px-3 py-1.5',
                                'transition-colors duration-250 ease-out motion-reduce:transition-none',
                                index === active && 'bg-background-muted',
                              )}
                            >
                              <Search className="text-foreground-intense size-3.5 shrink-0" />
                              <Highlight label={suggestion} term={query} />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  <section className="flex flex-col gap-3">
                    <h3 className={COLUMN_HEADING}>Products</h3>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-7 md:grid-cols-3 lg:grid-cols-4">
                      {found.products.map((product) => (
                        <SearchResultCard key={product.slug} product={product} onNavigate={close} />
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-x-2 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
                  {departments.map(({ slug, name, links }) => (
                    <LinkColumn key={slug} column={{ heading: name, links }} onNavigate={close} />
                  ))}
                </div>
              )}
            </>
          )}
        </OverlayBody>

        {/* The listing Enter opens. */}
        {found && !byPhoto ? (
          <OverlayFooter>
            <Link
              href={searchHref('fashion', query, department)}
              onClick={close}
              data-slot="button"
              className={buttonVariants({ size: 'lg', className: 'w-full' })}
            >
              View all results{pending ? null : ` (${found.total})`}
            </Link>
          </OverlayFooter>
        ) : null}
      </OverlayContent>
    </Overlay>
  )
}

/** A suggestion with the typed part picked out, and a capital: tags are authored lowercase. */
function Highlight({ label, term }: { label: string; term: string }) {
  const { before, match, after } = splitMatch(label, term)

  return (
    <span className="text-foreground-muted min-w-0 truncate first-letter:uppercase">
      {before}
      <span className="text-foreground-intense font-medium">{match}</span>
      {after}
    </span>
  )
}
