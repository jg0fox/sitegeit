import type { CategoryDefaults } from '../category-defaults'

const STANDARD_TRADE_HOURS: Record<string, string> = {
  monday: '8:00 AM – 5:30 PM',
  tuesday: '8:00 AM – 5:30 PM',
  wednesday: '8:00 AM – 5:30 PM',
  thursday: '8:00 AM – 5:30 PM',
  friday: '8:00 AM – 5:30 PM',
  saturday: '9:00 AM – 2:00 PM',
  sunday: 'Closed',
}

const TWENTY_FOUR_SEVEN_HOURS: Record<string, string> = {
  monday: 'Open 24 Hours',
  tuesday: 'Open 24 Hours',
  wednesday: 'Open 24 Hours',
  thursday: 'Open 24 Hours',
  friday: 'Open 24 Hours',
  saturday: 'Open 24 Hours',
  sunday: 'Open 24 Hours',
}

export const tradeDefaults: Record<string, CategoryDefaults> = {
  plumber: {
    voice_archetype: 'Bold Professional',
    voice_characteristics: [
      'Direct and practical',
      'Emphasizes reliability and honesty',
      'Uses trade terminology comfortably',
      'Confident without being boastful',
    ],
    typical_services: [
      {
        name: 'Drain Cleaning',
        description: 'Clogged sinks, showers, and main lines cleared fast. We use professional-grade tools to restore full flow without damaging your pipes.',
        icon: 'plumbing',
      },
      {
        name: 'Water Heater',
        description: 'Repair or replacement of tank and tankless water heaters. We help you pick the right size and type for your household.',
        icon: 'water_drop',
      },
      {
        name: 'Leak Repair',
        description: 'Pinpoint and fix leaks in walls, ceilings, and under slabs. Early repair prevents mold and costly water damage.',
        icon: 'water_damage',
      },
      {
        name: 'Sewer Line',
        description: 'Camera inspection and repair of cracked, clogged, or collapsed sewer lines. We find the problem before we start digging.',
        icon: 'valve',
      },
      {
        name: 'Fixture Installation',
        description: 'Install new faucets, toilets, sinks, and garbage disposals. We make sure everything fits right and passes code.',
        icon: 'countertops',
      },
      {
        name: 'Emergency Plumbing',
        description: 'Burst pipes, overflowing toilets, and major leaks handled fast. We respond quickly to stop the damage and fix the source.',
        icon: 'emergency',
      },
    ],
    typical_hours: { ...STANDARD_TRADE_HOURS },
    trust_signals: [
      'Licensed & Insured',
      'Free Estimates',
      'Same-Day Service Available',
      '24/7 Emergency Line',
    ],
    cta_language: {
      primary: 'Schedule a Plumber',
      secondary: 'Get a Free Estimate',
    },
    faq_templates: [
      {
        question: 'How quickly can a plumber get to my home in {city}?',
        answer_template: '{business_name} offers same-day service for most calls in {city}. For emergencies like burst pipes or sewage backups, we prioritize rapid response.',
      },
      {
        question: 'How much does it cost to fix a leak?',
        answer_template: 'The cost depends on the location and severity of the leak. {business_name} provides free estimates before starting any work so there are no surprises.',
      },
      {
        question: 'Should I repair or replace my water heater?',
        answer_template: 'If your water heater is over 10 years old or needs frequent repairs, replacement usually saves money in the long run. {business_name} will inspect your unit and give you an honest recommendation.',
      },
      {
        question: 'Do you handle sewer line problems?',
        answer_template: 'Yes. {business_name} uses camera inspection to find the exact issue in your sewer line before recommending a repair plan. No guesswork, no unnecessary digging.',
      },
    ],
    pricing_language: 'Upfront pricing on every job. No overtime charges, no hidden fees. We quote before we start.',
    hero_templates: [
      {
        headline_template: 'A Leaky Pipe Won\'t Fix Itself',
        subheadline_template: '{business_name} provides fast, honest plumbing service in {city}. Call today for a free estimate.',
      },
      {
        headline_template: 'Stop Worrying About That Drip',
        subheadline_template: '{city}\'s trusted plumbers. {business_name} gets it fixed right the first time.',
      },
      {
        headline_template: 'Your Plumbing Problem Ends Here',
        subheadline_template: '{business_name} delivers same-day plumbing service across {city}. Licensed, insured, and upfront.',
      },
    ],
  },

  electrician: {
    voice_archetype: 'Bold Professional',
    voice_characteristics: [
      'Direct and practical',
      'Emphasizes safety and code compliance',
      'Uses trade terminology comfortably',
      'Confident and reassuring about electrical work',
    ],
    typical_services: [
      {
        name: 'Panel Upgrade',
        description: 'Upgrade your electrical panel to handle modern power demands safely. Older panels with outdated breakers are a fire risk.',
        icon: 'electrical_services',
      },
      {
        name: 'Outlet & Wiring',
        description: 'Install new outlets, fix faulty wiring, and add circuits where you need them. All work meets current electrical code.',
        icon: 'power',
      },
      {
        name: 'Lighting Installation',
        description: 'Recessed lights, ceiling fans, and exterior fixtures installed properly. We handle the wiring so everything works safely.',
        icon: 'lightbulb',
      },
      {
        name: 'Generator Installation',
        description: 'Whole-home and portable generator setup with transfer switches. Keep your power on when the grid goes down.',
        icon: 'bolt',
      },
      {
        name: 'Electrical Inspection',
        description: 'Thorough inspection of your home\'s wiring, panels, and connections. Ideal before buying a house or after storm damage.',
        icon: 'search_check',
      },
      {
        name: 'Emergency Electrical',
        description: 'Sparking outlets, power outages, and burning smells need immediate attention. We respond fast to keep your family safe.',
        icon: 'emergency',
      },
    ],
    typical_hours: { ...STANDARD_TRADE_HOURS },
    trust_signals: [
      'Licensed & Insured',
      'Free Estimates',
      'Code-Compliant Work',
      'Background-Checked Electricians',
    ],
    cta_language: {
      primary: 'Schedule an Electrician',
      secondary: 'Request a Free Quote',
    },
    faq_templates: [
      {
        question: 'How do I know if my electrical panel needs upgrading?',
        answer_template: 'If your breakers trip often, your lights flicker, or your panel still uses fuses, it\'s time for an upgrade. {business_name} inspects your panel and recommends the right size for your {city} home.',
      },
      {
        question: 'Is it safe to do electrical work myself?',
        answer_template: 'Electrical work is dangerous and often requires permits. {business_name} handles all electrical jobs to code, keeping your home safe and your insurance valid.',
      },
      {
        question: 'What does an electrical inspection cover?',
        answer_template: '{business_name} checks your panel, wiring, outlets, grounding, and safety devices. We give you a clear report of anything that needs attention.',
      },
      {
        question: 'Do you install whole-home generators in {city}?',
        answer_template: 'Yes. {business_name} installs and services whole-home generators with automatic transfer switches. We help you choose the right size for your needs.',
      },
    ],
    pricing_language: 'Clear pricing before work begins. No charge for estimates on standard projects.',
    hero_templates: [
      {
        headline_template: 'Flickering Lights Are Telling You Something',
        subheadline_template: '{business_name} provides safe, code-compliant electrical work throughout {city}. Book your free estimate today.',
      },
      {
        headline_template: 'Your Home\'s Wiring Should Never Be a Guess',
        subheadline_template: 'Licensed electricians from {business_name} serving {city}. Every job inspected. Every wire to code.',
      },
      {
        headline_template: 'Electrical Problems Don\'t Get Better on Their Own',
        subheadline_template: '{business_name} keeps {city} homes safe with fast, reliable electrical service. Free estimates, honest pricing.',
      },
    ],
  },

  hvac: {
    voice_archetype: 'Bold Professional',
    voice_characteristics: [
      'Direct and practical',
      'Emphasizes comfort and energy savings',
      'Uses trade terminology comfortably',
      'Confident about system recommendations',
      'Straightforward about maintenance benefits',
    ],
    typical_services: [
      {
        name: 'AC Repair',
        description: 'Diagnose and fix air conditioning problems fast. We work on all major brands and carry common parts on our trucks.',
        icon: 'ac_unit',
      },
      {
        name: 'Heating Repair',
        description: 'Furnace not firing, heat pump not heating, or uneven temperatures fixed quickly. No one should be cold in their own home.',
        icon: 'local_fire_department',
      },
      {
        name: 'System Installation',
        description: 'New AC, furnace, or heat pump installed right. We size your system to your home so you get even comfort and lower energy bills.',
        icon: 'heat_pump',
      },
      {
        name: 'Duct Cleaning',
        description: 'Remove dust, allergens, and debris from your ductwork. Clean ducts mean better air quality and more efficient heating and cooling.',
        icon: 'air',
      },
      {
        name: 'Maintenance Plans',
        description: 'Seasonal tune-ups that catch small problems before they become big ones. Members get priority scheduling and discounted repairs.',
        icon: 'event_repeat',
      },
      {
        name: 'Thermostat Installation',
        description: 'Smart and programmable thermostats installed and configured. Save energy without sacrificing comfort.',
        icon: 'thermostat',
      },
    ],
    typical_hours: { ...STANDARD_TRADE_HOURS },
    trust_signals: [
      'Licensed & Insured',
      'Free Estimates on Replacements',
      'Financing Available',
      'Satisfaction Guaranteed',
    ],
    cta_language: {
      primary: 'Schedule HVAC Service',
      secondary: 'Get a Free Estimate',
    },
    faq_templates: [
      {
        question: 'How often should I have my HVAC system serviced?',
        answer_template: 'At least twice a year — once before summer and once before winter. {business_name} offers maintenance plans that make scheduling easy for {city} homeowners.',
      },
      {
        question: 'How do I know if I need a new AC unit?',
        answer_template: 'If your system is over 12 years old, runs constantly, or needs frequent repairs, replacement usually makes more sense. {business_name} provides free estimates on new systems.',
      },
      {
        question: 'Why are some rooms hotter or colder than others?',
        answer_template: 'Uneven temperatures usually mean duct problems, poor insulation, or a system that\'s the wrong size. {business_name} can diagnose the issue and fix it.',
      },
      {
        question: 'Do you offer emergency HVAC service in {city}?',
        answer_template: 'Yes. {business_name} handles after-hours heating and cooling emergencies in {city}. Call our emergency line anytime.',
      },
      {
        question: 'Is a smart thermostat worth it?',
        answer_template: 'Most homeowners save 10–15% on energy bills with a properly set up smart thermostat. {business_name} installs and configures them so you get the full benefit.',
      },
    ],
    pricing_language: 'Free estimates on system replacements. Flat-rate repair pricing with no surprise charges.',
    hero_templates: [
      {
        headline_template: 'Your Home Should Be Comfortable Year-Round',
        subheadline_template: '{business_name} keeps {city} homes cool in summer and warm in winter. Schedule your service today.',
      },
      {
        headline_template: 'Don\'t Sweat a Broken AC',
        subheadline_template: 'Fast, reliable HVAC repair from {business_name}. Serving {city} with same-day appointments available.',
      },
      {
        headline_template: 'That Strange Noise From Your Furnace? We\'ll Handle It',
        subheadline_template: '{business_name} diagnoses and fixes heating and cooling problems across {city}. Free estimates, honest answers.',
      },
    ],
  },

  roofer: {
    voice_archetype: 'Bold Professional',
    voice_characteristics: [
      'Direct and practical',
      'Emphasizes durability and protection',
      'Uses trade terminology comfortably',
      'Confident about materials and workmanship',
    ],
    typical_services: [
      {
        name: 'Roof Repair',
        description: 'Fix leaks, missing shingles, and damaged flashing before small problems become big ones. We repair all roof types.',
        icon: 'roofing',
      },
      {
        name: 'Roof Replacement',
        description: 'Full tear-off and replacement with materials built to last. We help you choose the right shingles, metal, or tile for your budget.',
        icon: 'home',
      },
      {
        name: 'Leak Detection',
        description: 'Track down hard-to-find leaks using thermal imaging and visual inspection. Knowing the source saves you time and money.',
        icon: 'water_damage',
      },
      {
        name: 'Storm Damage',
        description: 'Hail, wind, and fallen branches take a toll. We assess the damage, document it for your insurance, and get your roof back in shape.',
        icon: 'thunderstorm',
      },
      {
        name: 'Gutter Service',
        description: 'Gutter cleaning, repair, and replacement to keep water flowing away from your foundation. Clogged gutters cause more damage than most people realize.',
        icon: 'filter_alt',
      },
      {
        name: 'Roof Inspection',
        description: 'Detailed inspection with photos and a written report. Ideal before buying a home or after a major storm.',
        icon: 'search_check',
      },
    ],
    typical_hours: { ...STANDARD_TRADE_HOURS },
    trust_signals: [
      'Licensed & Insured',
      'Free Roof Inspections',
      'Manufacturer-Certified Installers',
      'Workmanship Warranty',
    ],
    cta_language: {
      primary: 'Schedule a Roof Inspection',
      secondary: 'Get a Free Estimate',
    },
    faq_templates: [
      {
        question: 'How do I know if my roof needs replacing?',
        answer_template: 'Curling shingles, granule loss, daylight through the attic, and age over 20 years are common signs. {business_name} offers free inspections for {city} homeowners.',
      },
      {
        question: 'Will you work with my insurance company?',
        answer_template: 'Yes. {business_name} documents storm damage thoroughly and works directly with your insurance adjuster to make the claims process easier.',
      },
      {
        question: 'How long does a roof replacement take?',
        answer_template: 'Most residential roofs in {city} take 1–3 days depending on size and weather. {business_name} gives you a clear timeline before work begins.',
      },
      {
        question: 'What kind of warranty do you offer?',
        answer_template: '{business_name} provides a workmanship warranty on top of the manufacturer\'s material warranty. We stand behind every roof we install.',
      },
    ],
    pricing_language: 'Free inspections and estimates. Financing available on full replacements. We work with all major insurance carriers.',
    hero_templates: [
      {
        headline_template: 'That Ceiling Stain Won\'t Go Away on Its Own',
        subheadline_template: '{business_name} finds and fixes roof leaks across {city}. Free inspection, honest assessment.',
      },
      {
        headline_template: 'Your Roof Takes the Hit So Your Home Doesn\'t',
        subheadline_template: '{business_name} provides expert roofing service in {city}. Licensed, insured, and warranty-backed.',
      },
      {
        headline_template: 'Storm Damage? Let\'s Get Your Roof Right',
        subheadline_template: '{business_name} handles insurance claims and repairs for {city} homeowners. Free damage assessment.',
      },
    ],
  },

  general_contractor: {
    voice_archetype: 'Bold Professional',
    voice_characteristics: [
      'Direct and practical',
      'Emphasizes craftsmanship and project management',
      'Uses trade terminology comfortably',
      'Confident about timelines and budgets',
      'Detail-oriented and organized',
    ],
    typical_services: [
      {
        name: 'Kitchen Remodel',
        description: 'Full kitchen renovations from layout to finish. We handle cabinets, countertops, plumbing, electrical, and flooring as one project.',
        icon: 'countertops',
      },
      {
        name: 'Bathroom Remodel',
        description: 'Update your bathroom with new tile, fixtures, and layout. We manage every trade so you don\'t have to.',
        icon: 'bathroom',
      },
      {
        name: 'Room Addition',
        description: 'Add square footage to your home with a bedroom, office, or in-law suite. We handle permits, plans, and construction.',
        icon: 'add_home',
      },
      {
        name: 'Deck & Patio',
        description: 'Custom decks, patios, and outdoor living spaces built to last. We work with wood, composite, and concrete.',
        icon: 'deck',
      },
      {
        name: 'Foundation Repair',
        description: 'Cracks, settling, and water intrusion fixed at the source. A solid foundation protects everything above it.',
        icon: 'foundation',
      },
      {
        name: 'General Renovation',
        description: 'Whole-home updates, structural changes, and multi-room projects managed from start to finish. One contractor, one point of contact.',
        icon: 'construction',
      },
    ],
    typical_hours: { ...STANDARD_TRADE_HOURS },
    trust_signals: [
      'Licensed & Insured',
      'Free Consultations',
      'References Available',
      'Detailed Written Estimates',
    ],
    cta_language: {
      primary: 'Schedule a Consultation',
      secondary: 'See Our Work',
    },
    faq_templates: [
      {
        question: 'How long does a kitchen remodel take?',
        answer_template: 'Most kitchen remodels in {city} take 6–10 weeks depending on scope. {business_name} gives you a detailed timeline before work starts.',
      },
      {
        question: 'Do you handle permits?',
        answer_template: 'Yes. {business_name} pulls all required permits for your {city} project and schedules inspections. You don\'t have to deal with the city.',
      },
      {
        question: 'How do you handle budget and change orders?',
        answer_template: '{business_name} provides a detailed written estimate before starting. If anything changes, we discuss it with you and get approval before moving forward.',
      },
      {
        question: 'Can I live in my home during a renovation?',
        answer_template: 'In most cases, yes. {business_name} plans the work to minimize disruption and keeps the job site clean and safe throughout the project.',
      },
      {
        question: 'Do you do the work yourself or use subcontractors?',
        answer_template: '{business_name} has its own crew for core work and uses trusted, vetted subcontractors for specialized trades like electrical and plumbing.',
      },
    ],
    pricing_language: 'Free consultations and detailed written estimates. No work starts until you approve the full scope and price.',
    hero_templates: [
      {
        headline_template: 'That Kitchen Renovation You Keep Putting Off? Let\'s Go',
        subheadline_template: '{business_name} manages your remodel from permits to punch list in {city}. One contractor, zero headaches.',
      },
      {
        headline_template: 'Your Home Should Work for the Way You Live Now',
        subheadline_template: '{business_name} builds, remodels, and renovates homes across {city}. Free consultation, detailed estimates.',
      },
      {
        headline_template: 'Big Project? One Contractor Handles It All',
        subheadline_template: '{business_name} takes your {city} renovation from idea to finished product. Licensed, insured, and on schedule.',
      },
    ],
  },

  handyman: {
    voice_archetype: 'Bold Professional',
    voice_characteristics: [
      'Direct and practical',
      'Emphasizes versatility and convenience',
      'Uses plain, everyday language',
      'Friendly and approachable',
    ],
    typical_services: [
      {
        name: 'Drywall Repair',
        description: 'Patch holes, fix cracks, and retexture damaged walls. We match the existing finish so repairs blend in.',
        icon: 'wall_lamp',
      },
      {
        name: 'Door & Window',
        description: 'Repair sticking doors, replace hardware, and fix drafty windows. Small fixes that make a big difference in comfort.',
        icon: 'door_open',
      },
      {
        name: 'Furniture Assembly',
        description: 'We assemble flat-pack furniture, mount TVs, and install shelving. Save your weekend for something you actually enjoy.',
        icon: 'chair',
      },
      {
        name: 'Painting',
        description: 'Interior and exterior painting for single rooms or whole houses. Clean lines, proper prep, and no mess left behind.',
        icon: 'format_paint',
      },
      {
        name: 'Plumbing Fixes',
        description: 'Leaky faucets, running toilets, and slow drains handled without calling a full plumbing crew. Quick fixes, fair prices.',
        icon: 'plumbing',
      },
      {
        name: 'Odd Jobs',
        description: 'Got a to-do list you never get to? We handle the small stuff — caulking, weather stripping, fixture swaps, and more.',
        icon: 'handyman',
      },
    ],
    typical_hours: { ...STANDARD_TRADE_HOURS },
    trust_signals: [
      'Insured',
      'No Job Too Small',
      'Free Estimates',
      'Same-Day Appointments Available',
    ],
    cta_language: {
      primary: 'Book a Handyman',
      secondary: 'Get a Free Estimate',
    },
    faq_templates: [
      {
        question: 'What kind of jobs do you handle?',
        answer_template: '{business_name} handles everything from drywall repair and painting to furniture assembly and minor plumbing. If it\'s on your to-do list, we can probably help.',
      },
      {
        question: 'Is there a minimum charge?',
        answer_template: '{business_name} has a small minimum service fee that covers travel and setup. Most jobs in {city} are charged by the hour with no hidden costs.',
      },
      {
        question: 'Do I need to buy the materials?',
        answer_template: 'You can, or {business_name} can pick up what\'s needed and include it in the estimate. Either way, you only pay actual material cost.',
      },
      {
        question: 'Can I schedule multiple small jobs in one visit?',
        answer_template: 'Absolutely. {business_name} encourages customers to bundle their to-do lists into one appointment. It saves you time and money.',
      },
    ],
    pricing_language: 'Hourly rates with a small minimum. Free estimates for bigger projects. No hidden fees.',
    hero_templates: [
      {
        headline_template: 'That To-Do List Isn\'t Going to Fix Itself',
        subheadline_template: '{business_name} tackles your home repairs and odd jobs in {city}. Fast, affordable, and done right.',
      },
      {
        headline_template: 'One Call Crosses Everything Off Your List',
        subheadline_template: '{business_name} handles the small stuff so you don\'t have to. Serving {city} with same-day availability.',
      },
      {
        headline_template: 'Stop Putting Off Those Home Repairs',
        subheadline_template: '{business_name} provides reliable handyman service across {city}. No job too small, no list too long.',
      },
    ],
  },

  auto_repair: {
    voice_archetype: 'Bold Professional',
    voice_characteristics: [
      'Direct and practical',
      'Emphasizes honesty and transparency',
      'Uses trade terminology comfortably',
      'Confident about diagnostics and recommendations',
    ],
    typical_services: [
      {
        name: 'Brake Service',
        description: 'Brake pads, rotors, calipers, and fluid replaced or repaired. Squealing or grinding means it\'s time — don\'t wait.',
        icon: 'car_crash',
      },
      {
        name: 'Engine Diagnostics',
        description: 'Check engine light on? We read codes and perform hands-on diagnostics to find the real problem, not just clear the warning.',
        icon: 'engineering',
      },
      {
        name: 'Oil Change',
        description: 'Conventional, synthetic blend, and full synthetic oil changes. We also check your filters, fluids, and tire pressure while you wait.',
        icon: 'oil_barrel',
      },
      {
        name: 'Tire Service',
        description: 'Tire rotation, balancing, flat repair, and new tire installation. Properly maintained tires last longer and keep you safer.',
        icon: 'tire_repair',
      },
      {
        name: 'AC & Heating',
        description: 'Recharge refrigerant, fix leaks, and repair blower motors. Stay comfortable behind the wheel all year.',
        icon: 'ac_unit',
      },
      {
        name: 'General Repair',
        description: 'Belts, hoses, starters, alternators, suspension, and more. We fix what needs fixing and leave the rest alone.',
        icon: 'car_repair',
      },
    ],
    typical_hours: { ...STANDARD_TRADE_HOURS },
    trust_signals: [
      'ASE-Certified Mechanics',
      'Free Diagnostics with Repair',
      'Written Estimates Before Work',
      '12-Month / 12,000-Mile Warranty',
    ],
    cta_language: {
      primary: 'Schedule Service',
      secondary: 'Get a Free Diagnostic',
    },
    faq_templates: [
      {
        question: 'How do I know if my brakes need replacing?',
        answer_template: 'Squealing, grinding, vibration when braking, or a soft pedal are all warning signs. {business_name} offers free brake inspections in {city}.',
      },
      {
        question: 'What does the check engine light mean?',
        answer_template: 'It could be anything from a loose gas cap to a serious engine issue. {business_name} uses professional diagnostic tools to read the codes and find the real problem.',
      },
      {
        question: 'Do you work on all car brands?',
        answer_template: '{business_name} services all major domestic and import brands. Our ASE-certified mechanics have experience with everything from daily drivers to trucks.',
      },
      {
        question: 'How often should I change my oil?',
        answer_template: 'Every 3,000–7,500 miles depending on your oil type and driving habits. {business_name} checks your records and reminds you when it\'s time.',
      },
      {
        question: 'Do I need an appointment?',
        answer_template: 'Appointments are preferred so we can have a bay ready. Walk-ins are welcome for quick services like oil changes when space allows.',
      },
    ],
    pricing_language: 'Written estimates before any work starts. Free diagnostics when you approve the repair. No surprises on your bill.',
    hero_templates: [
      {
        headline_template: 'Your Check Engine Light Deserves a Straight Answer',
        subheadline_template: '{business_name} diagnoses the real problem and fixes it right. Honest auto repair in {city}.',
      },
      {
        headline_template: 'Stop Guessing What\'s Wrong With Your Car',
        subheadline_template: '{business_name} provides clear diagnostics and upfront pricing for every repair in {city}.',
      },
      {
        headline_template: 'Your Car Runs Better When Your Mechanic Is Honest',
        subheadline_template: 'ASE-certified auto repair from {business_name} in {city}. Written estimates, no upselling, warranty on every job.',
      },
    ],
  },

  towing: {
    voice_archetype: 'Bold Professional',
    voice_characteristics: [
      'Direct and reassuring',
      'Emphasizes speed and availability',
      'Uses clear, simple language',
      'Calm under pressure',
    ],
    typical_services: [
      {
        name: 'Emergency Towing',
        description: 'Broke down on the side of the road? We dispatch a truck to your location fast. Available around the clock, every day.',
        icon: 'towing',
      },
      {
        name: 'Roadside Assistance',
        description: 'Flat tire changes, fuel delivery, and minor trailside repairs to get you moving again without a tow.',
        icon: 'car_crash',
      },
      {
        name: 'Flatbed Towing',
        description: 'Flatbed trucks carry your vehicle without putting miles on the drivetrain. Best for luxury, lowered, or AWD vehicles.',
        icon: 'local_shipping',
      },
      {
        name: 'Long-Distance Towing',
        description: 'Need your vehicle moved across town or across the state? We offer safe, reliable long-distance transport at competitive rates.',
        icon: 'route',
      },
      {
        name: 'Lockout Service',
        description: 'Locked your keys in the car? We get you back in without damage. Fast response times across the service area.',
        icon: 'lock_open',
      },
      {
        name: 'Jump Start',
        description: 'Dead battery? We bring the power to you. A quick jump start gets you back on the road in minutes.',
        icon: 'battery_charging_full',
      },
    ],
    typical_hours: { ...TWENTY_FOUR_SEVEN_HOURS },
    trust_signals: [
      'Available 24/7',
      'Fast Response Times',
      'Licensed & Insured',
      'All Vehicle Types',
    ],
    cta_language: {
      primary: 'Call for a Tow',
      secondary: 'Get Roadside Help Now',
    },
    faq_templates: [
      {
        question: 'How fast can you get to me in {city}?',
        answer_template: '{business_name} aims for 30-minute response times within {city}. Times vary based on traffic and distance, but we keep you updated from dispatch.',
      },
      {
        question: 'Do you tow all types of vehicles?',
        answer_template: 'Yes. {business_name} tows cars, trucks, SUVs, motorcycles, and light commercial vehicles. We have flatbed and wheel-lift trucks to handle any situation.',
      },
      {
        question: 'How much does a tow cost?',
        answer_template: 'Pricing depends on distance, time of day, and vehicle type. {business_name} gives you a clear quote over the phone before dispatching so there are no surprises.',
      },
      {
        question: 'Do you offer roadside assistance without towing?',
        answer_template: 'Yes. {business_name} handles jump starts, lockouts, flat tires, and fuel delivery. Sometimes you just need a quick fix to get back on the road.',
      },
    ],
    pricing_language: 'Upfront quotes over the phone. No hidden hookup fees. Competitive rates 24/7.',
    hero_templates: [
      {
        headline_template: 'Stranded? Help Is Already on the Way',
        subheadline_template: '{business_name} provides 24/7 towing and roadside assistance in {city}. Call now for fast dispatch.',
      },
      {
        headline_template: 'Breakdowns Don\'t Wait for Business Hours',
        subheadline_template: '{business_name} is on call around the clock in {city}. Towing, lockouts, jump starts — whatever you need.',
      },
      {
        headline_template: 'Locked Out, Dead Battery, or Stuck? We\'ve Got You',
        subheadline_template: '{business_name} responds fast across {city}. Upfront pricing, no surprises, 24/7 availability.',
      },
    ],
  },
}
