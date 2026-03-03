import { tradeDefaults } from './categories/trades'
import { foodHospitalityDefaults } from './categories/food-hospitality'
import { healthWellnessDefaults } from './categories/health-wellness'
import { professionalDefaults } from './categories/professional'
import { lifestyleDefaults } from './categories/lifestyle'
import { creativeDefaults } from './categories/creative'

export interface CategoryDefaults {
  voice_archetype: string
  voice_characteristics: string[]
  typical_services: { name: string; description: string; icon: string }[]
  typical_hours: Record<string, string>
  trust_signals: string[]
  cta_language: { primary: string; secondary: string }
  faq_templates: { question: string; answer_template: string }[]
  pricing_language: string | null
  hero_templates: { headline_template: string; subheadline_template: string }[]
}

const CATEGORY_DEFAULTS_REGISTRY: Record<string, CategoryDefaults> = {
  ...tradeDefaults,
  ...foodHospitalityDefaults,
  ...healthWellnessDefaults,
  ...professionalDefaults,
  ...lifestyleDefaults,
  ...creativeDefaults,
}

const GENERIC_DEFAULTS: CategoryDefaults = {
  voice_archetype: 'Friendly Guide',
  voice_characteristics: [
    'Approachable and helpful',
    'Clear and straightforward',
    'Professional but not stiff',
  ],
  typical_services: [
    { name: 'Consultation', description: 'A one-on-one consultation to understand your needs and recommend the right solution.', icon: 'forum' },
    { name: 'Core Service', description: 'Our primary service, delivered with care and attention to detail.', icon: 'verified' },
    { name: 'Follow-Up Support', description: 'Ongoing support to make sure everything works the way it should.', icon: 'support_agent' },
  ],
  typical_hours: {
    monday: '9:00 AM – 5:00 PM',
    tuesday: '9:00 AM – 5:00 PM',
    wednesday: '9:00 AM – 5:00 PM',
    thursday: '9:00 AM – 5:00 PM',
    friday: '9:00 AM – 5:00 PM',
    saturday: 'Closed',
    sunday: 'Closed',
  },
  trust_signals: ['Locally Owned', 'Serving the Community'],
  cta_language: { primary: 'Get in Touch', secondary: 'Learn More' },
  faq_templates: [
    { question: 'What areas do you serve?', answer_template: 'We proudly serve {city} and the surrounding area.' },
    { question: 'How do I get started?', answer_template: 'Give us a call or fill out our contact form. We\'ll get back to you within one business day.' },
  ],
  pricing_language: 'Contact us for a free estimate.',
  hero_templates: [
    { headline_template: 'Trusted Local Service in {city}', subheadline_template: '{business_name} is here to help. Reach out today.' },
  ],
}

export function getCategoryDefaults(categorySlug: string): CategoryDefaults {
  return CATEGORY_DEFAULTS_REGISTRY[categorySlug] || GENERIC_DEFAULTS
}
