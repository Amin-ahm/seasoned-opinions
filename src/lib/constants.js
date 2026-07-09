// Shared vocabulary used across forms, filters and cards.

export const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant', emoji: '🍜' },
  { value: 'coffee', label: 'Coffee', emoji: '☕' },
  { value: 'bakery', label: 'Bakery', emoji: '🥐' },
  { value: 'mechanic', label: 'Mechanic', emoji: '🔧' },
  { value: 'fishing', label: 'Fishing spot', emoji: '🎣' },
  { value: 'flowers', label: 'Flower shop', emoji: '💐' },
  { value: 'farmer', label: 'Farmer / market', emoji: '🌾' },
  { value: 'grocery', label: 'Grocery', emoji: '🛒' },
  { value: 'services', label: 'Services', emoji: '🛠️' },
  { value: 'other', label: 'Other', emoji: '📍' },
]

// Food places show menu-style fields (what's good/skip) and food ordering
// options; other place types hide those.
export const FOOD_CATEGORIES = ['restaurant', 'coffee', 'bakery']

export function isFoodCategory(value) {
  return FOOD_CATEGORIES.includes(value)
}

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c])
)

export const AVAILABILITY = [
  { value: 'dine-in', label: 'Dine-in', emoji: '🪑' },
  { value: 'pickup', label: 'Pickup', emoji: '🥡' },
  { value: 'doordash', label: 'DoorDash', emoji: '🚗' },
  { value: 'ubereats', label: 'Uber Eats', emoji: '🛵' },
  { value: 'delivery', label: 'Delivery', emoji: '📦' },
]

export const AVAILABILITY_MAP = Object.fromEntries(
  AVAILABILITY.map((a) => [a.value, a])
)

// Suggested tags - users may also type their own.
export const SUGGESTED_TAGS = [
  'vegan',
  'vegetarian',
  'gluten-free',
  'quiet',
  'team-lunch',
  'cash-only',
  'quick',
  'healthy',
  'cozy',
  'outdoor-seating',
  'spicy',
  'budget',
  'date-spot',
  'group-friendly',
]

export const PRICE_LABELS = ['$', '$$', '$$$', '$$$$']

export const SORT_OPTIONS = [
  { value: 'rating', label: '⭐ Top rated' },
  { value: 'votes', label: '👍 Most upvoted' },
  { value: 'newest', label: '🆕 Newest' },
  { value: 'priceLow', label: '💵 Price: low → high' },
  { value: 'priceHigh', label: '💸 Price: high → low' },
]

export function priceString(scale) {
  const n = Math.max(1, Math.min(4, Number(scale) || 1))
  return '$'.repeat(n)
}
