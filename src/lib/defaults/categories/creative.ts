import type { CategoryDefaults } from '../category-defaults'

const LANDSCAPER_HOURS: Record<string, string> = {
  monday: '7:00 AM – 5:00 PM',
  tuesday: '7:00 AM – 5:00 PM',
  wednesday: '7:00 AM – 5:00 PM',
  thursday: '7:00 AM – 5:00 PM',
  friday: '7:00 AM – 5:00 PM',
  saturday: '8:00 AM – 12:00 PM',
  sunday: 'Closed',
}

const PHOTOGRAPHY_HOURS: Record<string, string> = {
  monday: 'Closed',
  tuesday: 'By Appointment',
  wednesday: 'By Appointment',
  thursday: 'By Appointment',
  friday: 'By Appointment',
  saturday: 'By Appointment',
  sunday: 'Closed',
}

export const creativeDefaults: Record<string, CategoryDefaults> = {
  landscaper: {
    voice_archetype: 'Calm Authority',
    voice_characteristics: [
      'Detail-oriented',
      'Nature-connected',
      'Patient and knowledgeable',
      'Grounded and dependable',
      'Quietly confident',
    ],
    typical_services: [
      {
        name: 'Lawn Maintenance',
        description: 'Regular mowing, edging, and fertilizing to keep your yard healthy and looking its best all season long.',
        icon: 'grass',
      },
      {
        name: 'Landscape Design',
        description: 'Custom plans that match your property, lifestyle, and budget. We design with native plants that thrive in your area.',
        icon: 'park',
      },
      {
        name: 'Tree & Shrub Care',
        description: 'Pruning, shaping, and disease treatment to keep your trees and shrubs strong. Healthy plants add value and beauty to your property.',
        icon: 'forest',
      },
      {
        name: 'Irrigation Systems',
        description: 'Install, repair, and maintain sprinkler systems so your lawn gets the right amount of water without waste.',
        icon: 'water_drop',
      },
      {
        name: 'Hardscaping',
        description: 'Patios, walkways, retaining walls, and fire pits built to last. We blend stone and structure with your natural landscape.',
        icon: 'yard',
      },
      {
        name: 'Seasonal Cleanup',
        description: 'Spring and fall cleanup to clear leaves, prep beds, and get your yard ready for the next season.',
        icon: 'eco',
      },
    ],
    typical_hours: { ...LANDSCAPER_HOURS },
    trust_signals: [
      'Licensed & Insured',
      'Free On-Site Estimates',
      'Locally Owned & Operated',
      'Satisfaction Guaranteed',
    ],
    cta_language: {
      primary: 'Get a Free Estimate',
      secondary: 'View Our Work',
    },
    faq_templates: [
      {
        question: 'How often should my lawn be mowed in {city}?',
        answer_template: 'During the growing season, most {city} lawns need mowing once a week. {business_name} adjusts the schedule based on grass type, weather, and your preferences.',
      },
      {
        question: 'Do you use plants that grow well in {city}?',
        answer_template: 'Yes. {business_name} designs with native and climate-adapted plants that thrive in {city}. They need less water, resist local pests, and look great year-round.',
      },
      {
        question: 'How much does landscaping cost?',
        answer_template: 'Every property is different. {business_name} provides a free on-site estimate so you know the exact cost before any work starts. No surprises.',
      },
      {
        question: 'Can you fix my sprinkler system?',
        answer_template: '{business_name} repairs and maintains all types of irrigation systems. We find leaks, replace heads, and adjust zones so your lawn gets even coverage.',
      },
      {
        question: 'When is the best time to start a landscaping project in {city}?',
        answer_template: 'Spring and early fall are ideal for most planting projects in {city}. {business_name} can plan your project around the best planting windows for your area.',
      },
    ],
    pricing_language: 'Free on-site estimates. Weekly and seasonal service plans available. No contracts required for maintenance.',
    hero_templates: [
      {
        headline_template: 'Your Yard Deserves More Than Just a Mow',
        subheadline_template: '{business_name} designs and maintains outdoor spaces that make {city} homes stand out. Get your free estimate today.',
      },
      {
        headline_template: 'Curb Appeal That Lasts All Season',
        subheadline_template: '{business_name} brings expert landscaping to {city} — from lawn care to full landscape design. Locally owned, fully insured.',
      },
      {
        headline_template: 'The Outdoor Space You\'ve Been Picturing',
        subheadline_template: '{business_name} turns {city} yards into something worth coming home to. Custom design, reliable maintenance, real results.',
      },
    ],
  },

  photography: {
    voice_archetype: 'Friendly Guide',
    voice_characteristics: [
      'Creative and expressive',
      'Personable and collaborative',
      'Warm and encouraging',
      'Detail-oriented with an artistic eye',
    ],
    typical_services: [
      {
        name: 'Portrait Sessions',
        description: 'Individual portraits that capture your personality in natural or studio light. Perfect for personal branding or just because.',
        icon: 'portrait',
      },
      {
        name: 'Wedding Photography',
        description: 'Full-day coverage from getting ready to the last dance. You get every real moment without missing one yourself.',
        icon: 'photo_camera',
      },
      {
        name: 'Event Coverage',
        description: 'Corporate events, parties, fundraisers, and celebrations captured as they happen. Natural photos that tell the story of the day.',
        icon: 'celebration',
      },
      {
        name: 'Headshots',
        description: 'Professional headshots for your website, LinkedIn, or team page. Quick sessions with polished results you can use right away.',
        icon: 'camera_alt',
      },
      {
        name: 'Family Sessions',
        description: 'Relaxed sessions that let your family be themselves. We capture real moments, not stiff poses — kids and pets welcome.',
        icon: 'group',
      },
      {
        name: 'Photo Editing',
        description: 'Color correction, retouching, and creative edits for your existing photos. We bring out the best in every image.',
        icon: 'auto_fix_high',
      },
    ],
    typical_hours: { ...PHOTOGRAPHY_HOURS },
    trust_signals: [
      'Published & Award-Winning',
      'Flexible Booking Options',
      'Fast Turnaround on Edits',
    ],
    cta_language: {
      primary: 'Book a Session',
      secondary: 'View the Portfolio',
    },
    faq_templates: [
      {
        question: 'How far in advance should I book a session?',
        answer_template: 'For weddings and large events, 3–6 months is ideal. For portraits and headshots, {business_name} can often schedule within a week or two depending on {city} availability.',
      },
      {
        question: 'How long until I get my photos?',
        answer_template: '{business_name} delivers edited galleries within 2–3 weeks for most sessions. Weddings typically take 4–6 weeks. Rush delivery is available if you need photos sooner.',
      },
      {
        question: 'What should I wear to my photo session?',
        answer_template: '{business_name} sends a style guide with your booking confirmation. We help you pick outfits and colors that look great on camera and fit the setting.',
      },
      {
        question: 'Do you travel outside {city} for shoots?',
        answer_template: 'Yes. {business_name} is based in {city} but regularly travels for weddings and events. Travel fees apply for locations beyond a certain distance.',
      },
      {
        question: 'Can I print the photos myself?',
        answer_template: 'Absolutely. {business_name} delivers high-resolution digital files with a print release. You can print anywhere you like, and we also offer professional print services.',
      },
    ],
    pricing_language: 'Session fees vary by type and duration. Custom packages available for weddings and events. Contact us for a personalized quote.',
    hero_templates: [
      {
        headline_template: 'Moments Worth Holding Onto',
        subheadline_template: '{business_name} captures the real, unscripted moments that matter most. {city} portrait, wedding, and event photography.',
      },
      {
        headline_template: 'You\'ll Forget the Camera Was There',
        subheadline_template: '{business_name} blends into your day and comes back with photos that feel exactly like the moment did. Serving {city} and beyond.',
      },
      {
        headline_template: 'Your Story, Told in Photos',
        subheadline_template: '{business_name} brings a natural, relaxed approach to every session in {city}. Real expressions, beautiful light, lasting images.',
      },
    ],
  },
}
