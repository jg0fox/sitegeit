/**
 * Sanitize AI-generated icon names to valid Material Symbols Outlined names.
 *
 * The AI sometimes generates verbose descriptions like "A round loaf of artisan bread"
 * instead of valid icon identifiers like "bakery_dining". This function normalizes
 * the input to a valid icon name or returns a category-appropriate fallback.
 */

// Common keyword → valid Material Symbol mappings
const KEYWORD_MAP: Record<string, string> = {
  // Food & bakery
  bread: 'bakery_dining',
  bakery: 'bakery_dining',
  cake: 'cake',
  cookie: 'cookie',
  pastry: 'bakery_dining',
  coffee: 'coffee',
  restaurant: 'restaurant',
  food: 'restaurant',
  dining: 'restaurant',
  menu: 'menu_book',
  kitchen: 'kitchen',
  // Trades
  plumbing: 'plumbing',
  pipe: 'plumbing',
  water: 'water_drop',
  faucet: 'faucet',
  drain: 'plumbing',
  electric: 'electrical_services',
  wiring: 'electrical_services',
  power: 'bolt',
  bolt: 'bolt',
  hvac: 'hvac',
  heating: 'thermostat',
  cooling: 'ac_unit',
  air: 'ac_unit',
  roof: 'roofing',
  hammer: 'hardware',
  tool: 'build',
  build: 'build',
  wrench: 'build',
  repair: 'build',
  fix: 'build',
  car: 'directions_car',
  auto: 'directions_car',
  vehicle: 'directions_car',
  engine: 'settings',
  brake: 'speed',
  tire: 'tire_repair',
  oil: 'oil_barrel',
  tow: 'local_shipping',
  // Health & wellness
  dental: 'dentistry',
  tooth: 'dentistry',
  medical: 'medical_services',
  health: 'health_and_safety',
  heart: 'favorite',
  pet: 'pets',
  animal: 'pets',
  dog: 'pets',
  cat: 'pets',
  spa: 'spa',
  massage: 'spa',
  yoga: 'self_improvement',
  fitness: 'fitness_center',
  gym: 'fitness_center',
  clean: 'cleaning_services',
  cleaning: 'cleaning_services',
  // Professional
  law: 'gavel',
  legal: 'gavel',
  court: 'gavel',
  accounting: 'calculate',
  tax: 'calculate',
  finance: 'account_balance',
  insurance: 'shield',
  protect: 'shield',
  home: 'home',
  house: 'home',
  real_estate: 'home',
  property: 'home',
  // Lifestyle & creative
  hair: 'content_cut',
  barber: 'content_cut',
  scissors: 'content_cut',
  nail: 'spa',
  beauty: 'face',
  camera: 'photo_camera',
  photo: 'photo_camera',
  landscape: 'yard',
  garden: 'yard',
  tree: 'park',
  plant: 'local_florist',
  flower: 'local_florist',
  // General
  star: 'star',
  check: 'check_circle',
  verified: 'verified',
  phone: 'phone',
  email: 'email',
  location: 'location_on',
  time: 'schedule',
  clock: 'schedule',
  money: 'payments',
  price: 'payments',
  payment: 'payments',
  dollar: 'payments',
  people: 'group',
  person: 'person',
  team: 'group',
  family: 'family_restroom',
  safety: 'health_and_safety',
  security: 'security',
  lock: 'lock',
  key: 'key',
  award: 'emoji_events',
  trophy: 'emoji_events',
  certificate: 'workspace_premium',
  license: 'workspace_premium',
  speed: 'speed',
  fast: 'bolt',
  quality: 'workspace_premium',
  truck: 'local_shipping',
  delivery: 'local_shipping',
  shipping: 'local_shipping',
  store: 'storefront',
  shop: 'storefront',
  paint: 'format_paint',
  brush: 'brush',
  design: 'design_services',
  emergency: 'emergency',
  warning: 'warning',
  info: 'info',
  support: 'support_agent',
  help: 'help',
  search: 'search',
  map: 'map',
  calendar: 'calendar_today',
  schedule: 'schedule',
  eco: 'eco',
  recycle: 'recycling',
}

/** A valid Material Symbol name: 1-3 lowercase word segments joined by underscores, under 25 chars */
function looksLikeValidIconName(value: string): boolean {
  return /^[a-z][a-z0-9]*(_[a-z][a-z0-9]*){0,2}$/.test(value) && value.length <= 25
}

/**
 * Sanitize an AI-generated icon name to a valid Material Symbols Outlined name.
 *
 * @param raw - The AI-generated icon value (may be a valid name or a verbose description)
 * @param fallback - Fallback icon if nothing matches (default: 'star')
 * @returns A valid Material Symbols Outlined icon name
 */
export function sanitizeIconName(raw: string, fallback = 'star'): string {
  if (!raw || typeof raw !== 'string') return fallback

  // Normalize: lowercase, trim
  const cleaned = raw.toLowerCase().trim()

  // If it already looks like a valid icon name (no conversion needed), pass it through
  if (looksLikeValidIconName(cleaned)) return cleaned

  // If it contains hyphens but NO spaces (e.g., "check-circle"), try underscore conversion
  if (!cleaned.includes(' ') && cleaned.includes('-')) {
    const underscored = cleaned.replace(/-+/g, '_').replace(/[^a-z0-9_]/g, '')
    if (looksLikeValidIconName(underscored)) return underscored
  }

  // Search for keyword matches in the raw text
  const words = cleaned.split(/[\s,._-]+/)
  for (const word of words) {
    if (KEYWORD_MAP[word]) return KEYWORD_MAP[word]
  }

  // Try whole-word matches (keyword appears as a complete word boundary)
  for (const [keyword, icon] of Object.entries(KEYWORD_MAP)) {
    const re = new RegExp(`\\b${keyword}\\b`)
    if (re.test(cleaned)) return icon
  }

  return fallback
}
