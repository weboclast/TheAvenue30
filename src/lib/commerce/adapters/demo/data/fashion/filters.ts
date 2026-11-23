import type { FilterGroup, FilterSource } from '../dataset'

/**
 * The color filter's families, in order. Dye names like 'Oatmeal' are too fine
 * to filter on; a print files under its main color.
 */
const COLOR_FAMILIES: FilterGroup[] = [
  { label: 'Black', hex: '#1C1C1C', members: ['Black'] },
  { label: 'White', hex: '#F5F4F0', members: ['White', 'Ivory', 'Cream', 'Ecru'] },
  {
    label: 'Beige',
    hex: '#D6C3A1',
    members: ['Beige', 'Sand', 'Oat', 'Oatmeal', 'Natural', 'Stone', 'Champagne', 'Wildflower'],
  },
  {
    label: 'Brown',
    hex: '#6A4A33',
    members: [
      'Brown',
      'Dark Brown',
      'Chocolate',
      'Brown Melange',
      'Camel',
      'Taupe',
      'Tan',
      'Tobacco',
      'Cognac',
      'Tortoiseshell',
    ],
  },
  { label: 'Gray', hex: '#9A9A98', members: ['Gray', 'Heather Gray', 'Gray Melange', 'Charcoal'] },
  {
    label: 'Blue',
    hex: '#5E7FA8',
    members: [
      'Navy',
      'Navy Stripe',
      'Indigo',
      'Rinse',
      'Mid Wash',
      'Light Wash',
      'Light Blue',
      'Sky Blue',
      'Powder Blue',
      'Dusty Blue',
      'Blue Stripe',
      'Blue Check',
    ],
  },
  {
    label: 'Green',
    hex: '#6B7446',
    members: ['Olive', 'Khaki', 'Moss', 'Sage', 'Bottle Green', 'Forest Green', 'Green Stripe'],
  },
  { label: 'Red', hex: '#9B3A32', members: ['Burgundy', 'Burgundy Stripe', 'Red Check', 'Terracotta'] },
  { label: 'Pink', hex: '#E7C3C7', members: ['Pink'] },
  { label: 'Yellow', hex: '#E9CF78', members: ['Butter', 'Gold'] },
]

/**
 * Refinements the Fashion catalog offers, in drawer order; each shows only where
 * it offers a choice. Sizes count stock, and a department mixes its runs, so
 * `38` finds trousers and shoes alike.
 */
export const fashionFilters: FilterSource[] = [
  { id: 'category', label: 'Category', from: 'category' },
  { id: 'price', label: 'Price', from: 'price' },
  { id: 'color', label: 'Color', from: 'color', groups: COLOR_FAMILIES },
  { id: 'size', label: 'Size', from: 'size', order: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { id: 'material', label: 'Material' },
  { id: 'fit', label: 'Fit' },
  { id: 'sleeve', label: 'Sleeve' },
]
