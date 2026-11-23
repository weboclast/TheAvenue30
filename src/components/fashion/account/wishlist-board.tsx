'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CaretDownFilled, HeartPlus, Pencil, Plus, Trash } from '@appica/icons-react'
import { Badge } from '@appica/ui-react/badge'
import { Button, buttonVariants } from '@appica/ui-react/button'
import { Checkbox } from '@appica/ui-react/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@appica/ui-react/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@appica/ui-react/select'
import { DeleteWishlistDialog } from '@/components/account/delete-wishlist-dialog'
import { useWishlistBoard } from '@/components/account/use-wishlist-board'
import { WishlistFormDialog } from '@/components/account/wishlist-form-dialog'
import { ROTATING_CARET } from '@/components/fashion/caret-swap'
import { ProductCard } from '@/components/fashion/product/product-card'
import { TEXT_ACTION } from '@/components/fashion/text-action'
import type { Product } from '@/lib/commerce/types'
import { WISHLIST_SORTS, type WishlistSort } from '@/lib/wishlist/lists'
import { AddToBagDialog } from './add-to-bag-dialog'

/** 2 cards across on phones, 3 in the account's column from `md`. */
const CARD_SIZES = '(min-width: 768px) 25vw, 50vw'

interface WishlistBoardProps {
  /** The list this visitor last had open. `null`, or one since deleted, opens the first. */
  viewedId: string | null
  /** Where an empty list sends the shopper. */
  shopHref: string
}

/**
 * Everything the shopper saved, 1 list at a time, on the catalog's own cards.
 * Each card goes into the bag through a size, since a list keeps pieces rather
 * than sizes; a selection moves between lists or goes. The behavior is the
 * shared `useWishlistBoard`, so this file is only how Fashion draws it.
 */
export function WishlistBoard({ viewedId, shopHref }: WishlistBoardProps) {
  const board = useWishlistBoard('fashion', viewedId)
  const { active, items, chosen, allSelected, elsewhere, working } = board
  // The color each card shows, so the size dialog opens on the one the shopper was looking at.
  const [colors, setColors] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState<Product | null>(null)

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-foreground-intense text-xl font-medium">Nothing saved yet</p>
        <p className="max-w-80">Tap the heart on anything you like and it waits here for you.</p>
        <Link href={shopHref} data-slot="button" className={buttonVariants({ size: 'lg' })}>
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DropdownMenu size="lg">
          <DropdownMenuTrigger
            className="group/trigger"
            render={
              // The trigger renames the slot; this takes it back for `globals.css`.
              <Button data-slot="button" variant="outline">
                {active.name}
                <span className="text-foreground-muted">({active.items.length})</span>
                <CaretDownFilled data-icon="end" className={ROTATING_CARET} />
              </Button>
            }
          />
          {/* Its own width, not the trigger's, which is as wide as the name showing. */}
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuRadioGroup value={active.id} onValueChange={(next) => board.showList(String(next))}>
              <DropdownMenuGroupLabel>Your wishlists</DropdownMenuGroupLabel>
              {board.wishlists.map((list) => (
                <DropdownMenuRadioItem key={list.id} value={list.id} className="*:first:min-w-0 *:first:grow">
                  <span className="truncate">{list.name}</span>
                  <span className="ms-auto flex shrink-0 items-center gap-2 ps-2">
                    {list.default ? (
                      <Badge variant="outline" size="sm">
                        Saves here
                      </Badge>
                    ) : null}
                    <span className="text-foreground-subtle text-sm">{list.items.length}</span>
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => board.setForm({ mode: 'create' })}>
              <Plus data-icon="start" />
              New wishlist
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => board.setForm({ mode: 'edit', wishlist: active })}>
              <Pencil data-icon="start" />
              Edit this wishlist
            </DropdownMenuItem>
            {/* Nothing to do on the list that already takes them. */}
            {active.default ? null : (
              <DropdownMenuItem onClick={board.saveNewItemsHere}>
                <HeartPlus data-icon="start" />
                Save new items here
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => board.setDeleting(true)}
              className="text-error-emphasis! data-highlighted:before:bg-error-subtle!"
            >
              <Trash data-icon="start" />
              Delete this wishlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Select
          variant="outline"
          value={board.sort}
          onValueChange={(next) => board.setSort(next as WishlistSort)}
          items={WISHLIST_SORTS.map(({ value, label }) => ({ value, label }))}
        >
          <SelectTrigger aria-label="Sort this wishlist" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WISHLIST_SORTS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {active.description ? <p className="-mt-3 sm:-mt-4">{active.description}</p> : null}

      {items.length === 0 ? (
        <div className="border-border-strong flex flex-col items-center gap-5 rounded-sm border border-dashed px-6 py-12 text-center">
          <p className="text-foreground-intense text-xl font-medium">Nothing in {active.name} yet</p>
          {/* Only the list a heart saves into can honestly point at one. */}
          <p className="-mt-2">
            {active.default
              ? 'Tap the heart on anything you like and it waits here.'
              : 'Move pieces into it from another list.'}
          </p>
          <Link href={shopHref} data-slot="button" className={buttonVariants()}>
            Browse the collection
          </Link>
        </div>
      ) : (
        <>
          {/* Keeps its height unpicked, so a selection doesn't push the grid down. */}
          <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-2 border-b pb-3">
            <label className="text-foreground-intense flex cursor-pointer items-center gap-2 text-sm select-none">
              <Checkbox
                checked={allSelected}
                indeterminate={chosen.length > 0 && !allSelected}
                onCheckedChange={(next) => board.selectAll(Boolean(next))}
              />
              {allSelected ? 'Unselect all' : 'Select all'}
            </label>

            {chosen.length > 0 ? (
              <>
                {elsewhere.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button data-slot="button" variant="ghost" size="sm" disabled={working} className={TEXT_ACTION}>
                          Move to
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="start" className="w-56">
                      {elsewhere.map((list) => (
                        <DropdownMenuItem key={list.id} onClick={() => board.moveSelected(list.id)}>
                          {list.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={working}
                  className={TEXT_ACTION}
                  onClick={board.removeSelected}
                >
                  Remove
                </Button>

                <span className="text-foreground-subtle ms-auto text-sm">{chosen.length} selected</span>
              </>
            ) : null}
          </div>

          <ul className="grid grid-cols-2 gap-x-2 gap-y-8 md:grid-cols-3 md:gap-y-10">
            {items.map(({ id, product }) => {
              const soldOut = product.availability === 'out-of-stock'

              return (
                <li key={id} className="flex flex-col gap-4">
                  <ProductCard
                    product={product}
                    sizes={CARD_SIZES}
                    color={colors[product.slug]}
                    onColorChange={(color) => setColors((current) => ({ ...current, [product.slug]: color }))}
                    className="flex-1"
                    action={
                      // The heart's square, so the box sits as far off the top as off the side.
                      <span className="grid size-8 place-items-center">
                        {/* A Checkbox is 1em square, so the font size is its size. */}
                        <Checkbox
                          checked={board.isSelected(id)}
                          onCheckedChange={(next) => board.toggleSelected(id, Boolean(next))}
                          aria-label={`Select ${product.title}`}
                          className="bg-background text-lg"
                        />
                      </span>
                    }
                  />
                  <div className="mx-4 flex flex-col items-center gap-3 max-sm:mx-2">
                    <Button size="sm" disabled={soldOut} onClick={() => setAdding(product)} className="w-full">
                      {soldOut ? 'Sold out' : 'Add to bag'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${product.title} from ${active.name}`}
                      disabled={working}
                      onClick={() => board.removeItem(id)}
                      className={TEXT_ACTION}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <WishlistFormDialog
        target={board.form}
        onOpenChange={() => board.setForm(null)}
        onSaved={(list) => board.showList(list.id)}
        fieldVariant="outline"
      />

      <DeleteWishlistDialog
        name={active.name}
        open={board.deleting}
        onOpenChange={board.setDeleting}
        onConfirm={board.deleteActive}
      />

      <AddToBagDialog
        product={adding}
        color={adding ? colors[adding.slug] : undefined}
        onOpenChange={() => setAdding(null)}
      />
    </>
  )
}
