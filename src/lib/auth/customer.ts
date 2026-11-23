import type { Customer } from './types'

/** The shopper's first and last name as 1 string, empty when the backend holds neither. */
export function fullName(customer: Customer): string {
  return [customer.firstName, customer.lastName].filter(Boolean).join(' ')
}
