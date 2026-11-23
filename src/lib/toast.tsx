import { CircleCheckFilled, CircleXFilled, InfoCircleFilled } from '@appica/icons-react'

/*
 * The 3 things a toast says in this store. Each builds the options object
 * `toast.add` takes, so the icon and the token carrying a meaning are settled
 * here instead of at every call site:
 *
 *   toast.add(errorToast('Could not add to cart', result.error))
 *
 * `Toaster` renders `data.icon` into its own slot, which is why the icon travels
 * in `data` rather than beside the title.
 */

type ToastOptions = {
  title: React.ReactNode
  description?: string
  priority?: 'low' | 'high'
  data: { icon: React.ReactNode }
}

function options(icon: React.ReactNode, title: string, description?: string): ToastOptions {
  return {
    // With nothing under it, a title is a sentence rather than a heading, so it
    // gives back the weight `ToastTitle` puts on it.
    title: description ? title : <span className="font-normal">{title}</span>,
    description,
    data: { icon },
  }
}

/** A change the shopper asked for went through. */
export const successToast = (title: string, description?: string) =>
  options(<CircleCheckFilled className="text-success-emphasis" />, title, description)

/** Nothing failed and nothing changed: the store saying why. */
export const infoToast = (title: string, description?: string) =>
  options(<InfoCircleFilled className="text-info-emphasis" />, title, description)

/** The store refused a change or could not carry it out. Announced urgently. */
export const errorToast = (title: string, description?: string): ToastOptions => ({
  ...options(<CircleXFilled className="text-error-emphasis" />, title, description),
  priority: 'high',
})
