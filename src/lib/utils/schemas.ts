import { z } from 'zod'

export const searchFiltersSchema = z.object({
  min_rating: z.number().min(0).max(5).optional(),
  min_reviews: z.number().min(0).optional(),
  website_status: z
    .array(z.enum(['none', 'dead', 'parked', 'social_only', 'outdated']))
    .optional(),
  has_phone: z.boolean().optional(),
})

export const searchParamsSchema = z.object({
  region: z.string().min(1, 'Region is required'),
  category: z.string().min(1, 'Category is required'),
  radius_km: z.number().min(1).max(80).default(10),
  filters: searchFiltersSchema.optional(),
})

export const addToPipelineSchema = z.object({
  results: z
    .array(
      z.object({
        place_id: z.string(),
        name: z.string(),
        formatted_address: z.string(),
        geometry: z.object({ lat: z.number(), lng: z.number() }),
        rating: z.number().optional(),
        user_ratings_total: z.number().optional(),
        types: z.array(z.string()).optional(),
        formatted_phone_number: z.string().optional(),
        website: z.string().optional(),
        email: z.string().email().optional(),
        emails: z.array(z.string().email()).optional(),
        website_status: z.enum([
          'none',
          'dead',
          'parked',
          'social_only',
          'outdated',
          'active',
        ]),
      })
    )
    .min(1, 'At least one result is required'),
  category: z.string(),
  skipEmailSearch: z.boolean().optional(),
})

export type SearchParamsInput = z.infer<typeof searchParamsSchema>
export type AddToPipelineInput = z.infer<typeof addToPipelineSchema>
