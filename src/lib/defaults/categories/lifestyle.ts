import type { CategoryDefaults } from '../category-defaults'

const BARBER_SALON_HOURS: Record<string, string> = {
  monday: 'Closed',
  tuesday: '9:00 AM – 7:00 PM',
  wednesday: '9:00 AM – 7:00 PM',
  thursday: '9:00 AM – 7:00 PM',
  friday: '9:00 AM – 7:00 PM',
  saturday: '8:00 AM – 5:00 PM',
  sunday: 'Closed',
}

const NAIL_SALON_HOURS: Record<string, string> = {
  monday: 'Closed',
  tuesday: '9:30 AM – 7:00 PM',
  wednesday: '9:30 AM – 7:00 PM',
  thursday: '9:30 AM – 7:00 PM',
  friday: '9:30 AM – 7:00 PM',
  saturday: '9:00 AM – 6:00 PM',
  sunday: '10:00 AM – 4:00 PM',
}

const GYM_HOURS: Record<string, string> = {
  monday: '5:00 AM – 10:00 PM',
  tuesday: '5:00 AM – 10:00 PM',
  wednesday: '5:00 AM – 10:00 PM',
  thursday: '5:00 AM – 10:00 PM',
  friday: '5:00 AM – 9:00 PM',
  saturday: '7:00 AM – 6:00 PM',
  sunday: '7:00 AM – 4:00 PM',
}

export const lifestyleDefaults: Record<string, CategoryDefaults> = {
  barber: {
    voice_archetype: 'Bold Professional',
    voice_characteristics: [
      'Confident and streetwise',
      'Direct with a bit of swagger',
      'Casual but polished',
      'Community-rooted and loyal',
    ],
    typical_services: [
      {
        name: 'Classic Haircut',
        description:
          'A sharp, clean cut tailored to your style. Includes a hot towel finish and lineup.',
        icon: 'content_cut',
      },
      {
        name: 'Beard Trim & Shape',
        description:
          'Precision beard work with clippers and a straight razor. We sculpt it to match your face shape.',
        icon: 'face_retouching',
      },
      {
        name: 'Hot Towel Shave',
        description:
          'A traditional straight-razor shave with hot lather and warm towels. The closest shave you can get.',
        icon: 'spa',
      },
      {
        name: 'Kids Cut',
        description:
          'Patient, friendly haircuts for the little ones. We keep it fun so they actually look forward to coming back.',
        icon: 'child_care',
      },
      {
        name: 'Hair & Scalp Treatment',
        description:
          'Deep conditioning and scalp care to keep your hair healthy. Great for dry scalp, thinning hair, or just treating yourself.',
        icon: 'healing',
      },
      {
        name: 'Walk-Ins Welcome',
        description:
          'No appointment? No problem. Walk in and grab a seat. We move fast without cutting corners.',
        icon: 'door_open',
      },
    ],
    typical_hours: { ...BARBER_SALON_HOURS },
    trust_signals: [
      'Licensed Barbers',
      'Walk-Ins Welcome',
      'Clean & Sanitized Tools',
      'Community Favorite',
    ],
    cta_language: {
      primary: 'Book Your Cut',
      secondary: 'Walk In Anytime',
    },
    faq_templates: [
      {
        question: 'Do I need an appointment at {business_name}?',
        answer_template:
          'Appointments are recommended but walk-ins are always welcome. {business_name} keeps the chairs moving so you never wait long.',
      },
      {
        question: 'How much is a haircut in {city}?',
        answer_template:
          'Pricing depends on the service. {business_name} keeps rates fair and posts them in the shop. No surprises when you sit down.',
      },
      {
        question: 'Do you cut kids\' hair?',
        answer_template:
          'Absolutely. {business_name} welcomes kids of all ages. Our barbers are patient and make sure every kid leaves looking fresh.',
      },
      {
        question: 'What styles can you do?',
        answer_template:
          'Fades, tapers, lineups, textured crops, classic cuts, and more. {business_name} barbers in {city} stay current on every trend.',
      },
      {
        question: 'How do I find {business_name}?',
        answer_template:
          '{business_name} is located right in {city}. Check our contact section for the address, directions, and parking info.',
      },
    ],
    pricing_language:
      'Service prices posted in the shop. Cash and cards accepted. Tips appreciated.',
    hero_templates: [
      {
        headline_template: 'The Sharpest Cuts in {city}',
        subheadline_template:
          '{business_name} delivers clean fades, tight lineups, and old-school shaves. Walk in or book your chair.',
      },
      {
        headline_template: 'Your Look. Your Barber. Your Neighborhood.',
        subheadline_template:
          '{business_name} has been keeping {city} looking fresh. Stop by for a cut you can count on.',
      },
      {
        headline_template: 'More Than a Haircut — It\'s the Experience',
        subheadline_template:
          'Hot towels, straight razors, and good conversation. {business_name} is {city}\'s go-to barbershop.',
      },
    ],
  },

  hair_salon: {
    voice_archetype: 'Friendly Guide',
    voice_characteristics: [
      'Warm and approachable',
      'Style-savvy and trend-aware',
      'Encouraging and positive',
      'Detail-oriented about client preferences',
      'Inclusive of all hair types and textures',
    ],
    typical_services: [
      {
        name: 'Haircut & Style',
        description:
          'A personalized cut and style that works with your hair texture and lifestyle. Includes a consultation so we get it right.',
        icon: 'content_cut',
      },
      {
        name: 'Color & Highlights',
        description:
          'From subtle highlights to bold full-color transformations. We use professional-grade products that protect your hair.',
        icon: 'palette',
      },
      {
        name: 'Blowout',
        description:
          'A salon-quality blowout that adds volume, smoothness, and shine. Perfect for a special occasion or just because.',
        icon: 'air',
      },
      {
        name: 'Keratin Treatment',
        description:
          'Smooth frizz and cut styling time in half. Keratin treatments leave your hair sleek and manageable for weeks.',
        icon: 'auto_awesome',
      },
      {
        name: 'Bridal & Event Styling',
        description:
          'Updos, half-ups, and special-occasion styles for your big day. We do trial runs so you feel confident walking in.',
        icon: 'celebration',
      },
      {
        name: 'Extensions',
        description:
          'Add length, volume, or both with professional extensions. We match color and texture for a seamless, natural look.',
        icon: 'straighten',
      },
    ],
    typical_hours: { ...BARBER_SALON_HOURS },
    trust_signals: [
      'Licensed Stylists',
      'Complimentary Consultation',
      'Premium Hair Products',
      'All Hair Types Welcome',
    ],
    cta_language: {
      primary: 'Book an Appointment',
      secondary: 'View Our Work',
    },
    faq_templates: [
      {
        question: 'How do I know what hairstyle will look best on me?',
        answer_template:
          'Every appointment at {business_name} starts with a consultation. Your stylist will suggest cuts and colors based on your face shape, hair texture, and personal style.',
      },
      {
        question: 'How often should I get a trim?',
        answer_template:
          'Most people benefit from a trim every six to eight weeks. {business_name} in {city} can recommend a schedule based on your hair goals.',
      },
      {
        question: 'Is hair coloring damaging?',
        answer_template:
          '{business_name} uses professional-grade products and techniques that minimize damage. Your stylist will walk you through aftercare to keep your color vibrant and your hair healthy.',
      },
      {
        question: 'Do you work with curly and textured hair?',
        answer_template:
          'Yes. {business_name} stylists are experienced with all hair types and textures, including curly, coily, and natural hair.',
      },
      {
        question: 'What should I bring to my bridal hair trial?',
        answer_template:
          'Bring photos of styles you like, your veil or headpiece if you have one, and any hair accessories. {business_name} will work with you to find the perfect look.',
      },
    ],
    pricing_language:
      'Pricing varies by service and stylist level. Contact us for a custom quote or visit our website for the full menu.',
    hero_templates: [
      {
        headline_template: 'Hair That Feels Like You in {city}',
        subheadline_template:
          '{business_name} creates custom cuts and colors that match your style and your life. Book your consultation today.',
      },
      {
        headline_template: 'Great Hair Starts With the Right Stylist',
        subheadline_template:
          'Cuts, color, and treatments from the team at {business_name}. Serving {city} with care and creativity.',
      },
      {
        headline_template: 'Your Best Hair Day, Every Day',
        subheadline_template:
          '{business_name} in {city} helps you find a look you love and a routine that works. All hair types welcome.',
      },
    ],
  },

  nail_salon: {
    voice_archetype: 'Friendly Guide',
    voice_characteristics: [
      'Warm and welcoming',
      'Trend-aware and creative',
      'Detail-oriented about hygiene and quality',
      'Fun and upbeat',
      'Inclusive and relaxing',
    ],
    typical_services: [
      {
        name: 'Manicure',
        description:
          'A classic manicure with nail shaping, cuticle care, and your choice of polish. Clean, polished nails in under an hour.',
        icon: 'brush',
      },
      {
        name: 'Pedicure',
        description:
          'Soak, scrub, and polish for happy, healthy feet. Includes a relaxing foot massage you will not want to end.',
        icon: 'spa',
      },
      {
        name: 'Gel & Shellac',
        description:
          'Long-lasting gel polish that stays chip-free for weeks. High-shine finish with no dry time.',
        icon: 'auto_awesome',
      },
      {
        name: 'Nail Art',
        description:
          'Express yourself with custom designs, hand-painted details, and on-trend styles. From subtle to statement, we do it all.',
        icon: 'palette',
      },
      {
        name: 'Acrylic & Dip',
        description:
          'Durable acrylic or dip powder nails for extra length and strength. We shape and finish them so they look completely natural.',
        icon: 'star',
      },
      {
        name: 'Group Bookings',
        description:
          'Bring your crew for birthdays, bridal showers, or a girls\' day out. We set up a private space so your group can relax and have fun.',
        icon: 'groups',
      },
    ],
    typical_hours: { ...NAIL_SALON_HOURS },
    trust_signals: [
      'Licensed Nail Technicians',
      'Hospital-Grade Sanitation',
      'Non-Toxic & Cruelty-Free Options',
      'Walk-Ins Welcome',
    ],
    cta_language: {
      primary: 'Book Your Appointment',
      secondary: 'See Our Nail Gallery',
    },
    faq_templates: [
      {
        question: 'Do I need an appointment or can I walk in?',
        answer_template:
          'Walk-ins are welcome at {business_name}, but appointments guarantee your preferred time. Book ahead for weekends — they fill up fast in {city}.',
      },
      {
        question: 'How long does a gel manicure last?',
        answer_template:
          'A gel manicure from {business_name} typically lasts two to three weeks with no chipping. We recommend a fill or refresh after that.',
      },
      {
        question: 'Are your products safe and non-toxic?',
        answer_template:
          '{business_name} offers non-toxic, cruelty-free polish options. All tools are sterilized between clients for your safety.',
      },
      {
        question: 'Can I book for a group event?',
        answer_template:
          'Absolutely. {business_name} in {city} hosts bridal showers, birthdays, and girls\' nights. Contact us to reserve a group time.',
      },
      {
        question: 'How do I remove gel or acrylic nails safely?',
        answer_template:
          'Never peel them off at home. {business_name} offers professional removal that protects your natural nails. It only takes a few minutes.',
      },
    ],
    pricing_language:
      'Service prices are listed on our website and in-salon. Group and package discounts available.',
    hero_templates: [
      {
        headline_template: 'Nails That Make You Feel Amazing in {city}',
        subheadline_template:
          '{business_name} delivers flawless manicures, pedicures, and nail art in a clean, welcoming space. Walk in or book online.',
      },
      {
        headline_template: 'Treat Yourself — You Deserve It',
        subheadline_template:
          'Gel, acrylic, dip, and classic polish at {business_name}. {city}\'s favorite nail salon for every style.',
      },
      {
        headline_template: 'Beautiful Nails. Relaxing Experience. Every Time.',
        subheadline_template:
          '{business_name} in {city} combines expert nail care with a calming atmosphere. Your hands and feet will thank you.',
      },
    ],
  },

  gym: {
    voice_archetype: 'Energetic Enthusiast',
    voice_characteristics: [
      'High-energy and motivating',
      'Direct and action-oriented',
      'Inclusive of all fitness levels',
      'Results-focused without being pushy',
      'Community-driven and supportive',
    ],
    typical_services: [
      {
        name: 'Personal Training',
        description:
          'One-on-one sessions with a certified trainer who builds a program around your goals. Real coaching, real results.',
        icon: 'fitness_center',
      },
      {
        name: 'Group Fitness',
        description:
          'High-energy classes that push you further than you would go alone. From HIIT to spin to yoga, there is something for everyone.',
        icon: 'groups',
      },
      {
        name: 'Strength Training',
        description:
          'Free weights, machines, and racks for every lift. Our floor is built for beginners and serious lifters alike.',
        icon: 'exercise',
      },
      {
        name: 'Cardio Equipment',
        description:
          'Treadmills, bikes, ellipticals, and rowers to get your heart pumping. Modern equipment with built-in tracking.',
        icon: 'sports_gymnastics',
      },
      {
        name: 'Nutrition Coaching',
        description:
          'Work with a coach to dial in your eating habits. Training is half the battle — nutrition is the other half.',
        icon: 'restaurant',
      },
      {
        name: 'Membership Plans',
        description:
          'Flexible plans that fit your schedule and your budget. No long-term contracts required. Cancel anytime.',
        icon: 'card_membership',
      },
    ],
    typical_hours: { ...GYM_HOURS },
    trust_signals: [
      'Certified Personal Trainers',
      'No Long-Term Contracts',
      'Clean & Well-Maintained Facility',
      'Free Trial Available',
    ],
    cta_language: {
      primary: 'Start Your Free Trial',
      secondary: 'View Membership Plans',
    },
    faq_templates: [
      {
        question: 'Do I need to be in shape to join {business_name}?',
        answer_template:
          'Not at all. {business_name} welcomes every fitness level. Our trainers and staff are here to help you start wherever you are.',
      },
      {
        question: 'What is included in a membership?',
        answer_template:
          'Membership at {business_name} includes full gym access, group classes, and locker rooms. Personal training and nutrition coaching are available as add-ons.',
      },
      {
        question: 'Can I try the gym before I commit?',
        answer_template:
          'Yes. {business_name} in {city} offers a free trial so you can check out the equipment, classes, and vibe before you sign up.',
      },
      {
        question: 'Do you offer group fitness classes?',
        answer_template:
          '{business_name} runs a full class schedule including HIIT, strength, cycling, and more. All classes are included with your membership.',
      },
      {
        question: 'Is there a contract or cancellation fee?',
        answer_template:
          'No long-term contracts at {business_name}. You can cancel your membership anytime with no hidden fees.',
      },
    ],
    pricing_language:
      'Flexible monthly plans with no signup fees. Ask about our free trial to get started.',
    hero_templates: [
      {
        headline_template: 'Your Strongest Self Starts Here in {city}',
        subheadline_template:
          '{business_name} has the equipment, the classes, and the coaches to help you hit your goals. Try us free.',
      },
      {
        headline_template: 'Stop Thinking About It. Start Training.',
        subheadline_template:
          '{business_name} is {city}\'s gym for people who are ready to show up and put in the work. No judgment, just results.',
      },
      {
        headline_template: 'Every Rep Counts. Every Level Welcome.',
        subheadline_template:
          'Personal training, group fitness, and a community that has your back. {business_name} in {city}.',
      },
    ],
  },
}
