// Config for the non-place sections. The generic list / detail / form pages
// are driven entirely by these definitions, so adding a new section is just a
// new entry here (+ a matching security-rules block).
//
// field.type: text | textarea | url | select | tags | price
// A section with hasRating:false hides the star rating UI.

export const SECTIONS = {
  market: {
    key: 'market',
    collection: 'market',
    label: 'Marketplace',
    navLabel: 'Market',
    singular: 'listing',
    emoji: '🧺',
    tagline: "Coworker side-hustles — home baking, preserves, books, crafts, and more.",
    addCta: 'List something',
    hasRating: true,
    titleField: 'title',
    categories: [
      { value: 'baked-goods', label: 'Baked goods', emoji: '🍪' },
      { value: 'preserves', label: 'Jam & preserves', emoji: '🍓' },
      { value: 'books', label: 'Books', emoji: '📚' },
      { value: 'crafts', label: 'Crafts', emoji: '🧶' },
      { value: 'art', label: 'Art & prints', emoji: '🎨' },
      { value: 'clothing', label: 'Clothing', emoji: '👕' },
      { value: 'other', label: 'Other', emoji: '🛍️' },
    ],
    fields: [
      { key: 'title', label: 'What are you sharing?', type: 'text', required: true, placeholder: 'e.g. Homemade strawberry jam' },
      { key: 'category', label: 'Category', type: 'select', useCategories: true },
      { key: 'price', label: 'Price', type: 'price', placeholder: 'e.g. $6 / jar', hint: 'Free text — say however you price it.' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Ingredients, batch size, how to order, pickup at the office…' },
      { key: 'link', label: 'Order / contact link', type: 'url', placeholder: 'https://… (optional)' },
      { key: 'tags', label: 'Tags', type: 'tags', suggestions: ['vegan', 'gluten-free', 'nut-free', 'made-to-order', 'preorder', 'limited'] },
      { key: 'photoUrl', label: 'Photo URL', type: 'url', hint: 'A photo you took / have rights to. No copyrighted images.' },
    ],
  },

  software: {
    key: 'software',
    collection: 'tools',
    label: 'Software & Skills',
    navLabel: 'Software',
    singular: 'tool',
    emoji: '🧠',
    tagline: 'Apps, tools, and agent skills your coworkers swear by.',
    addCta: 'Share a tool',
    hasRating: true,
    titleField: 'title',
    categories: [
      { value: 'app', label: 'App', emoji: '📱' },
      { value: 'web-app', label: 'Web app', emoji: '🌐' },
      { value: 'cli', label: 'CLI', emoji: '⌨️' },
      { value: 'library', label: 'Library', emoji: '📦' },
      { value: 'agent-skill', label: 'Agent skill', emoji: '🤖' },
      { value: 'other', label: 'Other', emoji: '🧩' },
    ],
    fields: [
      { key: 'title', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Raycast, or my /deploy skill' },
      { key: 'category', label: 'Type', type: 'select', useCategories: true },
      { key: 'description', label: 'What it does / why it is good', type: 'textarea', placeholder: 'What problem it solves, how you use it…' },
      { key: 'link', label: 'Link', type: 'url', placeholder: 'https://… repo, site, or marketplace' },
      { key: 'tags', label: 'Tags', type: 'tags', suggestions: ['free', 'paid', 'open-source', 'mac', 'windows', 'web', 'claude-code', 'productivity', 'dev'] },
    ],
  },

  news: {
    key: 'news',
    collection: 'news',
    label: 'News',
    navLabel: 'News',
    singular: 'post',
    emoji: '📰',
    tagline: 'Announcements, finds, and things worth sharing with the team.',
    addCta: 'Post news',
    hasRating: false,
    titleField: 'title',
    categories: [
      { value: 'announcement', label: 'Announcement', emoji: '📣' },
      { value: 'event', label: 'Event', emoji: '📅' },
      { value: 'article', label: 'Article / link', emoji: '🔗' },
      { value: 'tip', label: 'Tip', emoji: '💡' },
      { value: 'other', label: 'Other', emoji: '🗞️' },
    ],
    fields: [
      { key: 'title', label: 'Headline', type: 'text', required: true, placeholder: 'e.g. New espresso machine in the 4th-floor kitchen' },
      { key: 'category', label: 'Kind', type: 'select', useCategories: true },
      { key: 'body', label: 'Details', type: 'textarea', required: true, placeholder: 'Share the details…' },
      { key: 'link', label: 'Source link', type: 'url', placeholder: 'https://… (optional)' },
      { key: 'tags', label: 'Tags', type: 'tags', suggestions: ['office', 'team', 'perks', 'tech', 'social'] },
    ],
  },
}

export const SECTION_LIST = Object.values(SECTIONS)

export function getSection(key) {
  return SECTIONS[key] || null
}

export function categoryMeta(section, value) {
  return (
    section.categories?.find((c) => c.value === value) ||
    section.categories?.[section.categories.length - 1] || { label: value, emoji: section.emoji }
  )
}

export const SORT_OPTIONS = [
  { value: 'rating', label: '⭐ Top rated' },
  { value: 'votes', label: '👍 Most upvoted' },
  { value: 'newest', label: '🆕 Newest' },
]
