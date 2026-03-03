import type { CategoryDefaults } from '../category-defaults'

const STANDARD_PROFESSIONAL_HOURS: Record<string, string> = {
  monday: '9:00 AM – 5:00 PM',
  tuesday: '9:00 AM – 5:00 PM',
  wednesday: '9:00 AM – 5:00 PM',
  thursday: '9:00 AM – 5:00 PM',
  friday: '9:00 AM – 5:00 PM',
  saturday: 'Closed',
  sunday: 'Closed',
}

export const professionalDefaults: Record<string, CategoryDefaults> = {
  lawyer: {
    voice_archetype: 'Trustworthy Expert',
    voice_characteristics: [
      'Measured and credentialed',
      'Professional but accessible',
      'Confidence without arrogance',
      'Empathetic toward client concerns',
      'Clear about process and expectations',
    ],
    typical_services: [
      {
        name: 'Free Consultation',
        description: 'Sit down with an attorney to discuss your situation at no cost. We listen, assess your options, and explain what to expect moving forward.',
        icon: 'forum',
      },
      {
        name: 'Personal Injury',
        description: 'If you were hurt due to someone else\'s negligence, you deserve fair compensation. We handle negotiations and litigation so you can focus on recovery.',
        icon: 'personal_injury',
      },
      {
        name: 'Family Law',
        description: 'Divorce, custody, support, and adoption handled with discretion and care. We protect your interests while keeping the focus on what matters most.',
        icon: 'family_restroom',
      },
      {
        name: 'Criminal Defense',
        description: 'Facing charges is stressful. We build a strong defense, explain your rights at every stage, and fight for the best possible outcome.',
        icon: 'gavel',
      },
      {
        name: 'Estate Planning',
        description: 'Wills, trusts, and powers of attorney that protect your family and your assets. Planning now prevents difficult decisions later.',
        icon: 'description',
      },
      {
        name: 'Business Law',
        description: 'Contracts, formations, disputes, and compliance for businesses of every size. Sound legal guidance helps you grow with confidence.',
        icon: 'account_balance',
      },
    ],
    typical_hours: { ...STANDARD_PROFESSIONAL_HOURS },
    trust_signals: [
      'Licensed & Bar-Certified',
      'Confidential Consultations',
      'No Fee Unless We Win (Injury Cases)',
      'Experienced Trial Attorneys',
    ],
    cta_language: {
      primary: 'Schedule a Consultation',
      secondary: 'Learn More About Our Practice',
    },
    faq_templates: [
      {
        question: 'How much does it cost to speak with an attorney in {city}?',
        answer_template: '{business_name} offers free initial consultations. We review your situation, explain your legal options, and outline potential costs before you commit to anything.',
      },
      {
        question: 'What should I bring to my first meeting?',
        answer_template: 'Bring any documents related to your case — contracts, police reports, correspondence, or court filings. {business_name} will review everything and let you know if anything else is needed.',
      },
      {
        question: 'How long does a typical case take?',
        answer_template: 'Timelines depend on the type of case and its complexity. {business_name} provides a realistic estimate after reviewing the details and keeps you informed at every step.',
      },
      {
        question: 'Do you handle cases outside of {city}?',
        answer_template: '{business_name} is licensed to practice across the state and regularly represents clients in courts beyond {city}. Contact us to confirm coverage for your location.',
      },
      {
        question: 'Will my consultation be kept confidential?',
        answer_template: 'Absolutely. Attorney-client privilege applies from your very first conversation with {business_name}. Everything you share remains strictly confidential.',
      },
    ],
    pricing_language: 'Free initial consultations. Personal injury cases handled on contingency — no fee unless we win. Other matters billed at transparent hourly or flat rates.',
    hero_templates: [
      {
        headline_template: 'Legal Problems Are Easier to Solve Early',
        subheadline_template: '{business_name} provides experienced legal counsel in {city}. Schedule a free consultation and understand your options today.',
      },
      {
        headline_template: 'You Deserve an Attorney Who Actually Listens',
        subheadline_template: '{business_name} takes the time to understand your case and explain your rights. Trusted legal representation in {city}.',
      },
      {
        headline_template: 'Protect What Matters Most to You',
        subheadline_template: '{business_name} helps families, individuals, and businesses in {city} navigate complex legal challenges with confidence.',
      },
    ],
  },

  accounting: {
    voice_archetype: 'Trustworthy Expert',
    voice_characteristics: [
      'Precise and detail-oriented',
      'Professional but accessible',
      'Reassuring about financial concerns',
      'Clear about deadlines and obligations',
    ],
    typical_services: [
      {
        name: 'Tax Preparation',
        description: 'Personal and business tax returns prepared accurately and filed on time. We find every deduction you qualify for and make sure nothing is missed.',
        icon: 'calculate',
      },
      {
        name: 'Bookkeeping',
        description: 'Monthly bookkeeping that keeps your records clean, organized, and ready for tax season. You focus on running your business while we track the numbers.',
        icon: 'menu_book',
      },
      {
        name: 'Payroll Services',
        description: 'Accurate payroll processing, tax withholding, and compliance filings handled on schedule. Your employees get paid correctly, every time.',
        icon: 'payments',
      },
      {
        name: 'Business Advisory',
        description: 'Financial guidance that helps you make better business decisions. From cash flow planning to growth strategy, we translate the numbers into clear direction.',
        icon: 'trending_up',
      },
      {
        name: 'Tax Planning',
        description: 'Year-round strategies to reduce your tax burden legally and effectively. Proactive planning saves far more than last-minute scrambling.',
        icon: 'event_note',
      },
      {
        name: 'Audit Support',
        description: 'If you receive an audit notice, we represent you and handle all communication with the IRS or state agencies. Thorough records are your best defense.',
        icon: 'fact_check',
      },
    ],
    typical_hours: { ...STANDARD_PROFESSIONAL_HOURS },
    trust_signals: [
      'Licensed CPA',
      'Year-Round Availability',
      'IRS Enrolled Agent',
      'Confidential & Secure',
    ],
    cta_language: {
      primary: 'Schedule a Consultation',
      secondary: 'Learn More About Our Services',
    },
    faq_templates: [
      {
        question: 'When should I start preparing for tax season?',
        answer_template: 'The sooner, the better. {business_name} recommends reaching out by early January so we can organize your documents and identify opportunities before the filing deadline.',
      },
      {
        question: 'Do you work with small businesses in {city}?',
        answer_template: 'Yes. {business_name} works with small businesses, freelancers, and startups across {city}. We tailor our services to fit your size and stage of growth.',
      },
      {
        question: 'What happens if I get audited?',
        answer_template: '{business_name} provides full audit representation. We review the notice, prepare your response, and communicate directly with the IRS or state agency on your behalf.',
      },
      {
        question: 'How much does tax preparation cost?',
        answer_template: 'Pricing depends on the complexity of your return. {business_name} provides a clear quote after an initial review — no surprise fees when the work is done.',
      },
      {
        question: 'Can you help me catch up on past-due bookkeeping?',
        answer_template: 'Absolutely. {business_name} regularly helps businesses in {city} clean up months or years of backlogged records. We get you current and set you up to stay organized.',
      },
    ],
    pricing_language: 'Transparent pricing based on the complexity of your return or engagement. No hidden fees. Free initial consultation to scope your needs.',
    hero_templates: [
      {
        headline_template: 'Tax Season Shouldn\'t Keep You Up at Night',
        subheadline_template: '{business_name} handles your taxes, bookkeeping, and financial planning in {city}. Accurate work, clear communication, no surprises.',
      },
      {
        headline_template: 'Your Books Tell a Story — Make Sure It\'s Accurate',
        subheadline_template: '{business_name} provides expert accounting services for individuals and businesses in {city}. Schedule your consultation today.',
      },
      {
        headline_template: 'Focus on Your Business, Not Your Spreadsheets',
        subheadline_template: '{business_name} keeps your finances in order so you can concentrate on growing your {city} business. Year-round support, not just tax season.',
      },
    ],
  },

  real_estate: {
    voice_archetype: 'Trustworthy Expert',
    voice_characteristics: [
      'Knowledgeable about local markets',
      'Professional but accessible',
      'Confidence without arrogance',
      'Patient and consultative',
      'Data-driven but personable',
    ],
    typical_services: [
      {
        name: 'Home Buying',
        description: 'From your first search to the closing table, we guide you through every step of purchasing a home. Your goals set the pace, not ours.',
        icon: 'home',
      },
      {
        name: 'Home Selling',
        description: 'Strategic pricing, professional marketing, and skilled negotiation to sell your home for its full value. We handle the details so you don\'t have to.',
        icon: 'sell',
      },
      {
        name: 'Market Analysis',
        description: 'A detailed look at comparable sales, current listings, and local trends. Solid data leads to better decisions whether you\'re buying or selling.',
        icon: 'query_stats',
      },
      {
        name: 'Property Valuation',
        description: 'An expert assessment of what your property is worth in today\'s market. Essential for pricing, refinancing, or estate planning.',
        icon: 'price_check',
      },
      {
        name: 'Investment Properties',
        description: 'Find and evaluate rental properties, multi-family units, and commercial opportunities. We analyze the numbers so your investment makes sense.',
        icon: 'real_estate_agent',
      },
      {
        name: 'Relocation Services',
        description: 'Moving to a new area can feel overwhelming. We help you learn the neighborhoods, find the right home, and settle in with less stress.',
        icon: 'flight_land',
      },
    ],
    typical_hours: { ...STANDARD_PROFESSIONAL_HOURS },
    trust_signals: [
      'Licensed Realtor',
      'Deep Local Market Knowledge',
      'No-Obligation Consultations',
      'Proven Track Record of Results',
    ],
    cta_language: {
      primary: 'Schedule a Consultation',
      secondary: 'Get a Free Home Valuation',
    },
    faq_templates: [
      {
        question: 'How do I know what my home is worth in {city}?',
        answer_template: '{business_name} provides a free comparative market analysis based on recent sales, active listings, and current conditions in your {city} neighborhood.',
      },
      {
        question: 'What does it cost to work with a buyer\'s agent?',
        answer_template: 'In most transactions, the seller\'s side covers the buyer\'s agent commission. {business_name} will explain exactly how compensation works before you commit to anything.',
      },
      {
        question: 'How long does it take to buy a home in {city}?',
        answer_template: 'From first search to closing, most buyers in {city} spend 30 to 60 days once they find the right property. {business_name} helps you prepare ahead of time so you can move quickly.',
      },
      {
        question: 'Should I buy or rent in {city}?',
        answer_template: 'It depends on your timeline, finances, and goals. {business_name} will walk you through the numbers for {city}\'s current market so you can make a confident decision.',
      },
    ],
    pricing_language: 'Free home valuations and buyer consultations. Commission structures are discussed transparently before any agreement is signed.',
    hero_templates: [
      {
        headline_template: 'Buying or Selling? Start With Someone You Can Trust',
        subheadline_template: '{business_name} brings deep {city} market expertise to every transaction. Schedule a free consultation to discuss your goals.',
      },
      {
        headline_template: 'Your Next Move Deserves Expert Guidance',
        subheadline_template: '{business_name} helps buyers, sellers, and investors make confident real estate decisions in {city}. Let\'s talk about your plans.',
      },
      {
        headline_template: 'The {city} Market Moves Fast — So Should Your Agent',
        subheadline_template: '{business_name} combines local expertise with responsive service to help you reach your real estate goals. Free, no-obligation consultation.',
      },
    ],
  },

  insurance: {
    voice_archetype: 'Trustworthy Expert',
    voice_characteristics: [
      'Reassuring and knowledgeable',
      'Professional but accessible',
      'Clear about coverage details',
      'Patient with questions and concerns',
    ],
    typical_services: [
      {
        name: 'Home Insurance',
        description: 'Coverage that protects your home, belongings, and liability. We shop multiple carriers to find the right balance of protection and price.',
        icon: 'cottage',
      },
      {
        name: 'Auto Insurance',
        description: 'Liability, collision, comprehensive, and specialty vehicle coverage tailored to your driving profile. We compare options so you don\'t overpay.',
        icon: 'directions_car',
      },
      {
        name: 'Life Insurance',
        description: 'Term, whole, and universal life policies that secure your family\'s future. We help you determine the right amount of coverage for your situation.',
        icon: 'shield',
      },
      {
        name: 'Business Insurance',
        description: 'General liability, property, workers\' comp, and professional liability bundled to protect your business. The right policy keeps a setback from becoming a shutdown.',
        icon: 'business_center',
      },
      {
        name: 'Policy Review',
        description: 'A thorough review of your existing coverage to identify gaps, redundancies, or savings opportunities. Circumstances change — your policy should too.',
        icon: 'policy',
      },
      {
        name: 'Claims Assistance',
        description: 'When you need to file a claim, we guide you through the process and advocate on your behalf. Our job is to make sure you get what your policy covers.',
        icon: 'support_agent',
      },
    ],
    typical_hours: { ...STANDARD_PROFESSIONAL_HOURS },
    trust_signals: [
      'Licensed & Certified',
      'Independent Agent — Multiple Carriers',
      'Free Policy Reviews',
      'Claims Advocacy Included',
    ],
    cta_language: {
      primary: 'Get a Free Quote',
      secondary: 'Review Your Current Coverage',
    },
    faq_templates: [
      {
        question: 'How do I know if I have enough coverage?',
        answer_template: '{business_name} offers a free policy review for {city} residents. We look at your current coverage, identify any gaps, and recommend adjustments if needed.',
      },
      {
        question: 'Can you save me money on my current insurance?',
        answer_template: 'Often, yes. {business_name} shops across multiple carriers to find competitive rates. Many clients in {city} save money without reducing their coverage.',
      },
      {
        question: 'What does an independent agent do differently?',
        answer_template: 'Unlike agents tied to a single company, {business_name} compares policies from multiple carriers. That means more options, better prices, and coverage that truly fits your needs.',
      },
      {
        question: 'What should I do if I need to file a claim?',
        answer_template: 'Call {business_name} first. We walk you through the process, help document everything properly, and follow up with the carrier to make sure your claim moves forward.',
      },
      {
        question: 'How much life insurance do I actually need?',
        answer_template: 'It depends on your income, debts, dependents, and long-term goals. {business_name} helps {city} families calculate the right amount — no high-pressure sales, just honest guidance.',
      },
    ],
    pricing_language: 'Free quotes and policy reviews. We are compensated by the carriers we represent, so our guidance costs you nothing.',
    hero_templates: [
      {
        headline_template: 'Are You Sure You\'re Properly Covered?',
        subheadline_template: '{business_name} reviews your policies, compares carriers, and finds the right coverage for your {city} household. Free, no-obligation quote.',
      },
      {
        headline_template: 'Insurance Shouldn\'t Be Confusing',
        subheadline_template: '{business_name} explains your options in plain language and helps you choose coverage that fits your life in {city}. Start with a free review.',
      },
      {
        headline_template: 'Protect Your Family Without Overpaying',
        subheadline_template: '{business_name} shops multiple carriers to find {city} families the best coverage at the best price. Get your free quote today.',
      },
    ],
  },
}
