/**
 * Category Image Registry
 *
 * Maps business category slugs to stock image paths in the Supabase
 * `category-images` storage bucket. Each category has:
 *   - hero: wide landscape image for the homepage hero section
 *   - about: portrait/square image for the about page float layout
 *
 * Image paths are relative to the bucket root. The full public URL is
 * constructed by `getCategoryImageUrl()`.
 *
 * File naming convention: {category}/{purpose}.webp
 * e.g., plumber/hero.webp, plumber/about.webp
 */

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()

export interface CategoryImageSet {
  hero: string
  about: string
}

/**
 * Registry of image paths per category, relative to the bucket root.
 * Every category that has images seeded should have an entry here.
 */
const CATEGORY_IMAGE_REGISTRY: Record<string, CategoryImageSet> = {
  // Trades
  plumber: { hero: 'plumber/hero.webp', about: 'plumber/about.webp' },
  electrician: { hero: 'electrician/hero.webp', about: 'electrician/about.webp' },
  hvac: { hero: 'hvac/hero.webp', about: 'hvac/about.webp' },
  roofer: { hero: 'roofer/hero.webp', about: 'roofer/about.webp' },
  general_contractor: { hero: 'general_contractor/hero.webp', about: 'general_contractor/about.webp' },
  handyman: { hero: 'handyman/hero.webp', about: 'handyman/about.webp' },
  auto_repair: { hero: 'auto_repair/hero.webp', about: 'auto_repair/about.webp' },
  towing: { hero: 'towing/hero.webp', about: 'towing/about.webp' },
  // Food & Hospitality
  bakery: { hero: 'bakery/hero.webp', about: 'bakery/about.webp' },
  restaurant: { hero: 'restaurant/hero.webp', about: 'restaurant/about.webp' },
  cafe: { hero: 'cafe/hero.webp', about: 'cafe/about.webp' },
  bar: { hero: 'bar/hero.webp', about: 'bar/about.webp' },
  florist: { hero: 'florist/hero.webp', about: 'florist/about.webp' },
  // Health & Wellness
  dentist: { hero: 'dentist/hero.webp', about: 'dentist/about.webp' },
  chiropractor: { hero: 'chiropractor/hero.webp', about: 'chiropractor/about.webp' },
  veterinarian: { hero: 'veterinarian/hero.webp', about: 'veterinarian/about.webp' },
  spa: { hero: 'spa/hero.webp', about: 'spa/about.webp' },
  yoga: { hero: 'yoga/hero.webp', about: 'yoga/about.webp' },
  cleaning: { hero: 'cleaning/hero.webp', about: 'cleaning/about.webp' },
  pet_groomer: { hero: 'pet_groomer/hero.webp', about: 'pet_groomer/about.webp' },
  // Professional
  lawyer: { hero: 'lawyer/hero.webp', about: 'lawyer/about.webp' },
  accounting: { hero: 'accounting/hero.webp', about: 'accounting/about.webp' },
  real_estate: { hero: 'real_estate/hero.webp', about: 'real_estate/about.webp' },
  insurance: { hero: 'insurance/hero.webp', about: 'insurance/about.webp' },
  // Lifestyle
  barber: { hero: 'barber/hero.webp', about: 'barber/about.webp' },
  hair_salon: { hero: 'hair_salon/hero.webp', about: 'hair_salon/about.webp' },
  nail_salon: { hero: 'nail_salon/hero.webp', about: 'nail_salon/about.webp' },
  gym: { hero: 'gym/hero.webp', about: 'gym/about.webp' },
  // Creative
  landscaper: { hero: 'landscaper/hero.webp', about: 'landscaper/about.webp' },
  photography: { hero: 'photography/hero.webp', about: 'photography/about.webp' },
}

/**
 * Get the image set for a given category slug.
 * Returns null if no images are registered for this category.
 */
export function getCategoryImages(categorySlug: string): CategoryImageSet | null {
  return CATEGORY_IMAGE_REGISTRY[categorySlug] ?? null
}

/**
 * Construct the full public URL for a category image.
 * Uses Supabase Storage public URL format.
 */
export function getCategoryImageUrl(imagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/category-images/${imagePath}`
}

/**
 * Get resolved image URLs for a category.
 * Returns null if no images are registered.
 */
export function getCategoryImageUrls(categorySlug: string): { heroUrl: string; aboutUrl: string } | null {
  const images = getCategoryImages(categorySlug)
  if (!images) return null
  return {
    heroUrl: getCategoryImageUrl(images.hero),
    aboutUrl: getCategoryImageUrl(images.about),
  }
}
