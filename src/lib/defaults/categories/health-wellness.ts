import type { CategoryDefaults } from '../category-defaults'

export const healthWellnessDefaults: Record<string, CategoryDefaults> = {
  dentist: {
    voice_archetype: 'Calm Authority',
    voice_characteristics: [
      'Reassuring and patient',
      'Uses plain language for medical topics',
      'Warm but professional',
      'Emphasizes comfort and gentle care',
    ],
    typical_services: [
      {
        name: 'General Checkup',
        description:
          'A thorough exam to catch small issues before they become big ones. We check your teeth, gums, and overall oral health.',
        icon: 'dentistry',
      },
      {
        name: 'Teeth Cleaning',
        description:
          'A professional cleaning that removes plaque and tartar your toothbrush can\'t reach. Leaves your smile feeling fresh.',
        icon: 'health_and_safety',
      },
      {
        name: 'Fillings & Restorations',
        description:
          'Gentle, modern fillings that look and feel natural. We use tooth-colored materials for a seamless result.',
        icon: 'healing',
      },
      {
        name: 'Teeth Whitening',
        description:
          'Safe, effective whitening treatments that brighten your smile. Results you can see after just one visit.',
        icon: 'auto_awesome',
      },
      {
        name: 'Emergency Dental',
        description:
          'Fast care when you need it most. We handle toothaches, broken teeth, and other urgent dental needs.',
        icon: 'emergency',
      },
      {
        name: 'Pediatric Dentistry',
        description:
          'Kid-friendly dental care in a calm, welcoming space. We help children build healthy habits early.',
        icon: 'child_care',
      },
    ],
    typical_hours: {
      monday: '8:00 AM – 5:00 PM',
      tuesday: '8:00 AM – 5:00 PM',
      wednesday: '8:00 AM – 5:00 PM',
      thursday: '8:00 AM – 5:00 PM',
      friday: '8:00 AM – 3:00 PM',
      saturday: '9:00 AM – 1:00 PM',
      sunday: 'Closed',
    },
    trust_signals: [
      'Licensed Dental Professionals',
      'Gentle & Comfortable Care',
      'Family-Friendly Practice',
      'Modern Equipment & Techniques',
    ],
    cta_language: {
      primary: 'Book an Appointment',
      secondary: 'Meet Our Team',
    },
    faq_templates: [
      {
        question: 'Do you accept dental insurance?',
        answer_template:
          '{business_name} works with most major dental insurance plans. Contact us to confirm your coverage before your visit.',
      },
      {
        question: 'What should I expect at my first visit?',
        answer_template:
          'Your first visit includes a full exam, X-rays, and a cleaning. We take time to understand your dental history and answer your questions.',
      },
      {
        question: 'Is teeth whitening safe?',
        answer_template:
          'Yes. {business_name} uses professional-grade whitening treatments that are safe for your enamel and supervised by licensed dentists.',
      },
      {
        question: 'Do you see children?',
        answer_template:
          'Absolutely. {business_name} in {city} welcomes patients of all ages, including young children. We make every visit calm and positive.',
      },
      {
        question: 'What if I have a dental emergency?',
        answer_template:
          'Call {business_name} right away. We reserve time each day for urgent cases and will get you in as quickly as possible.',
      },
    ],
    pricing_language:
      'We accept most insurance plans and offer flexible payment options. Contact us for details.',
    hero_templates: [
      {
        headline_template: 'A Healthier Smile Starts Here in {city}',
        subheadline_template:
          '{business_name} provides gentle, thorough dental care for your whole family. Schedule your visit today.',
      },
      {
        headline_template: 'Dental Care You Can Feel Good About',
        subheadline_template:
          'Your comfort comes first at {business_name}. Modern care in a calm, welcoming {city} office.',
      },
      {
        headline_template: 'Your {city} Dentist for Every Stage of Life',
        subheadline_template:
          'From first teeth to lifelong care, {business_name} is here for your family.',
      },
    ],
  },

  chiropractor: {
    voice_archetype: 'Calm Authority',
    voice_characteristics: [
      'Reassuring and patient',
      'Uses plain language for medical topics',
      'Confident but never pushy',
      'Focuses on long-term wellness',
    ],
    typical_services: [
      {
        name: 'Spinal Adjustment',
        description:
          'Precise, gentle adjustments to restore proper alignment. Helps relieve pain and improve how your body moves.',
        icon: 'accessibility_new',
      },
      {
        name: 'Sports Injury',
        description:
          'Targeted care for strains, sprains, and overuse injuries. We help athletes recover and prevent future problems.',
        icon: 'sports',
      },
      {
        name: 'Posture Correction',
        description:
          'A personalized plan to improve your posture over time. Better posture means less pain and more energy.',
        icon: 'straighten',
      },
      {
        name: 'Pain Management',
        description:
          'Drug-free relief for back pain, neck pain, and headaches. We find the source of your pain and treat it naturally.',
        icon: 'healing',
      },
      {
        name: 'Wellness Plans',
        description:
          'Ongoing care to keep your body balanced and feeling its best. Regular visits help prevent problems before they start.',
        icon: 'monitor_heart',
      },
      {
        name: 'Prenatal Care',
        description:
          'Safe, gentle adjustments for expecting mothers. Eases back pain and supports a more comfortable pregnancy.',
        icon: 'pregnant_woman',
      },
    ],
    typical_hours: {
      monday: '8:00 AM – 6:00 PM',
      tuesday: '8:00 AM – 6:00 PM',
      wednesday: '8:00 AM – 6:00 PM',
      thursday: '8:00 AM – 6:00 PM',
      friday: '8:00 AM – 5:00 PM',
      saturday: '9:00 AM – 12:00 PM',
      sunday: 'Closed',
    },
    trust_signals: [
      'Licensed Chiropractor',
      'Drug-Free Pain Relief',
      'Personalized Treatment Plans',
      'Family-Friendly Practice',
    ],
    cta_language: {
      primary: 'Schedule Your Visit',
      secondary: 'Learn About Our Approach',
    },
    faq_templates: [
      {
        question: 'Is chiropractic care safe?',
        answer_template:
          'Yes. Chiropractic care is a safe, non-invasive approach to pain relief. {business_name} uses gentle techniques suited to your comfort level.',
      },
      {
        question: 'Do I need a referral to see a chiropractor?',
        answer_template:
          'No referral is needed. You can book directly with {business_name} in {city}. We welcome new patients every day.',
      },
      {
        question: 'How many visits will I need?',
        answer_template:
          'Every patient is different. After your first exam, {business_name} will recommend a treatment plan tailored to your goals.',
      },
      {
        question: 'Do you treat children?',
        answer_template:
          'Yes. {business_name} offers gentle adjustments for patients of all ages, including children and teens.',
      },
    ],
    pricing_language:
      'We accept most insurance plans and offer affordable self-pay options. Ask about our new patient special.',
    hero_templates: [
      {
        headline_template: 'Move Better. Feel Better. Live Better in {city}.',
        subheadline_template:
          '{business_name} offers gentle, effective chiropractic care to help you get back to doing what you love.',
      },
      {
        headline_template: 'Natural Pain Relief Without Medication',
        subheadline_template:
          '{business_name} in {city} helps you find lasting relief through hands-on chiropractic care.',
      },
      {
        headline_template: 'Your Path to a Pain-Free Life Starts Here',
        subheadline_template:
          'Personalized chiropractic treatment from {business_name}. Serving families across {city}.',
      },
    ],
  },

  veterinarian: {
    voice_archetype: 'Calm Authority',
    voice_characteristics: [
      'Reassuring and patient',
      'Uses plain language for medical topics',
      'Compassionate and empathetic toward pet owners',
      'Warm and gentle in tone',
    ],
    typical_services: [
      {
        name: 'Wellness Exams',
        description:
          'A nose-to-tail checkup to keep your pet healthy. We catch small issues early so your pet stays happy longer.',
        icon: 'pets',
      },
      {
        name: 'Vaccinations',
        description:
          'Up-to-date vaccines to protect your pet from common diseases. We follow a schedule tailored to their age and lifestyle.',
        icon: 'vaccines',
      },
      {
        name: 'Surgery',
        description:
          'Safe surgical care with modern equipment and close monitoring. We keep you informed every step of the way.',
        icon: 'surgical',
      },
      {
        name: 'Dental Care',
        description:
          'Professional cleanings and dental exams for your pet. Good oral health means a healthier, happier companion.',
        icon: 'dentistry',
      },
      {
        name: 'Emergency Care',
        description:
          'Urgent care when your pet needs it most. Call us right away and we will be ready when you arrive.',
        icon: 'emergency',
      },
      {
        name: 'Senior Pet Care',
        description:
          'Specialized support for older pets. We manage age-related conditions to keep them comfortable and active.',
        icon: 'elderly',
      },
    ],
    typical_hours: {
      monday: '8:00 AM – 6:00 PM',
      tuesday: '8:00 AM – 6:00 PM',
      wednesday: '8:00 AM – 6:00 PM',
      thursday: '8:00 AM – 6:00 PM',
      friday: '8:00 AM – 5:00 PM',
      saturday: '9:00 AM – 1:00 PM',
      sunday: 'Closed',
    },
    trust_signals: [
      'Licensed Veterinary Team',
      'Compassionate Pet Care',
      'Modern Diagnostic Equipment',
      'Fear-Free Certified',
    ],
    cta_language: {
      primary: 'Book an Appointment',
      secondary: 'Meet Our Veterinarians',
    },
    faq_templates: [
      {
        question: 'What should I bring to my pet\'s first visit?',
        answer_template:
          'Bring any medical records, a list of medications, and your pet\'s favorite treat. {business_name} will take care of the rest.',
      },
      {
        question: 'Do you handle emergencies?',
        answer_template:
          'Yes. {business_name} in {city} treats urgent cases during business hours. Call us right away if your pet needs immediate care.',
      },
      {
        question: 'How often does my pet need a checkup?',
        answer_template:
          'We recommend annual wellness exams for most pets. Senior pets may benefit from visits every six months.',
      },
      {
        question: 'Do you see exotic pets?',
        answer_template:
          'Contact {business_name} to ask about the species we treat. Our {city} team is happy to help.',
      },
      {
        question: 'What vaccines does my pet need?',
        answer_template:
          '{business_name} creates a vaccination plan based on your pet\'s age, breed, and lifestyle. We only recommend what your pet truly needs.',
      },
    ],
    pricing_language:
      'We provide clear pricing before any procedure. Ask about our wellness plans for predictable monthly costs.',
    hero_templates: [
      {
        headline_template: 'Compassionate Care for Your Best Friend in {city}',
        subheadline_template:
          '{business_name} treats every pet like family. Trusted veterinary care from a team that truly cares.',
      },
      {
        headline_template: 'Healthy Pets. Happy Families.',
        subheadline_template:
          'From puppy shots to senior wellness, {business_name} is your partner in your pet\'s health.',
      },
      {
        headline_template: 'Your {city} Vet for Every Wag and Purr',
        subheadline_template:
          '{business_name} provides gentle, thorough veterinary care you and your pet can count on.',
      },
    ],
  },

  spa: {
    voice_archetype: 'Calm Authority',
    voice_characteristics: [
      'Calming and centered',
      'Inviting without being over the top',
      'Emphasizes relaxation and self-care',
      'Warm and unhurried',
    ],
    typical_services: [
      {
        name: 'Massage Therapy',
        description:
          'Therapeutic massage to ease tension and restore balance. Choose from Swedish, deep tissue, or hot stone.',
        icon: 'spa',
      },
      {
        name: 'Facials',
        description:
          'Customized facials that cleanse, hydrate, and refresh your skin. Tailored to your unique skin type.',
        icon: 'face_retouching_natural',
      },
      {
        name: 'Body Treatments',
        description:
          'Wraps, scrubs, and soaks designed to nourish your skin from head to toe. Pure relaxation for your body.',
        icon: 'self_improvement',
      },
      {
        name: 'Nail Services',
        description:
          'Manicures and pedicures in a clean, relaxing setting. We use high-quality products you can feel good about.',
        icon: 'brush',
      },
      {
        name: 'Couples Packages',
        description:
          'Share a calming experience with someone special. Side-by-side treatments in a private, peaceful room.',
        icon: 'favorite',
      },
      {
        name: 'Gift Cards',
        description:
          'Give the gift of relaxation. Gift cards are available in any amount and never expire.',
        icon: 'card_giftcard',
      },
    ],
    typical_hours: {
      monday: '9:00 AM – 7:00 PM',
      tuesday: '9:00 AM – 7:00 PM',
      wednesday: '9:00 AM – 7:00 PM',
      thursday: '9:00 AM – 8:00 PM',
      friday: '9:00 AM – 8:00 PM',
      saturday: '9:00 AM – 6:00 PM',
      sunday: '10:00 AM – 5:00 PM',
    },
    trust_signals: [
      'Licensed Therapists',
      'Clean & Tranquil Space',
      'Premium Products',
      'Personalized Treatments',
    ],
    cta_language: {
      primary: 'Book Your Treatment',
      secondary: 'View Our Menu',
    },
    faq_templates: [
      {
        question: 'What should I do before my appointment?',
        answer_template:
          'Arrive 10 to 15 minutes early to relax and fill out a brief intake form. {business_name} will handle everything else.',
      },
      {
        question: 'How do I choose the right treatment?',
        answer_template:
          'Not sure where to start? {business_name} in {city} offers a complimentary consultation to match you with the perfect service.',
      },
      {
        question: 'Do you offer gift cards?',
        answer_template:
          'Yes. {business_name} gift cards are available in any amount and can be purchased in person or online.',
      },
      {
        question: 'What is your cancellation policy?',
        answer_template:
          'We ask for at least 24 hours notice if you need to cancel or reschedule. This helps us serve all of our {city} guests.',
      },
    ],
    pricing_language:
      'View our full service menu for current pricing. Package discounts are available.',
    hero_templates: [
      {
        headline_template: 'Your Moment of Calm in {city}',
        subheadline_template:
          '{business_name} is your escape from the everyday. Expert treatments in a peaceful, welcoming space.',
      },
      {
        headline_template: 'Relax. Restore. Renew.',
        subheadline_template:
          'Personalized spa treatments at {business_name}. You deserve this.',
      },
      {
        headline_template: 'The {city} Spa Experience You Have Been Looking For',
        subheadline_template:
          'Step into {business_name} and leave your stress at the door. Your well-being is our priority.',
      },
    ],
  },

  yoga: {
    voice_archetype: 'Calm Authority',
    voice_characteristics: [
      'Calming and centered',
      'Encouraging without pressure',
      'Inclusive and welcoming to all levels',
      'Grounded and mindful',
    ],
    typical_services: [
      {
        name: 'Group Classes',
        description:
          'Join a supportive community for guided practice. Classes for every level, from first-timers to experienced yogis.',
        icon: 'groups',
      },
      {
        name: 'Private Sessions',
        description:
          'One-on-one instruction tailored to your body and goals. Move at your own pace with personal guidance.',
        icon: 'person',
      },
      {
        name: 'Beginner Programs',
        description:
          'A welcoming introduction to yoga. Learn the basics in a supportive, judgment-free space.',
        icon: 'school',
      },
      {
        name: 'Advanced Workshops',
        description:
          'Deepen your practice with focused workshops. Explore new techniques and refine your skills.',
        icon: 'auto_awesome',
      },
      {
        name: 'Meditation',
        description:
          'Guided meditation sessions to quiet the mind. Find stillness, clarity, and a sense of inner peace.',
        icon: 'self_improvement',
      },
      {
        name: 'Teacher Training',
        description:
          'A comprehensive program for aspiring yoga teachers. Gain the skills and confidence to lead your own classes.',
        icon: 'menu_book',
      },
    ],
    typical_hours: {
      monday: '6:00 AM – 8:00 PM',
      tuesday: '6:00 AM – 8:00 PM',
      wednesday: '6:00 AM – 8:00 PM',
      thursday: '6:00 AM – 8:00 PM',
      friday: '6:00 AM – 7:00 PM',
      saturday: '8:00 AM – 4:00 PM',
      sunday: '8:00 AM – 2:00 PM',
    },
    trust_signals: [
      'Certified Yoga Instructors',
      'All Levels Welcome',
      'Inclusive & Supportive Community',
      'Clean, Peaceful Studio',
    ],
    cta_language: {
      primary: 'View Class Schedule',
      secondary: 'Try Your First Class',
    },
    faq_templates: [
      {
        question: 'Do I need experience to start?',
        answer_template:
          'Not at all. {business_name} welcomes complete beginners. Our instructors guide you through every pose.',
      },
      {
        question: 'What should I bring to class?',
        answer_template:
          'Wear comfortable clothing and bring water. {business_name} provides mats and props for your convenience.',
      },
      {
        question: 'What styles of yoga do you offer?',
        answer_template:
          '{business_name} in {city} offers a variety of styles including Vinyasa, Hatha, and Restorative. Check our schedule for details.',
      },
      {
        question: 'Do you offer drop-in classes?',
        answer_template:
          'Yes. Drop-ins are always welcome at {business_name}. We also offer class packs and unlimited memberships.',
      },
      {
        question: 'Is yoga right for me if I am not flexible?',
        answer_template:
          'Absolutely. Yoga builds flexibility over time. {business_name} instructors offer modifications so every body can participate.',
      },
    ],
    pricing_language:
      'Drop-in rates, class packs, and monthly memberships available. New students get a special introductory rate.',
    hero_templates: [
      {
        headline_template: 'Find Your Balance in {city}',
        subheadline_template:
          '{business_name} offers yoga for every body. Step onto the mat and discover what your practice can do for you.',
      },
      {
        headline_template: 'Breathe. Move. Grow.',
        subheadline_template:
          'A welcoming yoga studio in {city}. {business_name} meets you exactly where you are.',
      },
      {
        headline_template: 'Your Practice. Your Pace. Your {city} Studio.',
        subheadline_template:
          '{business_name} is a space to slow down, reconnect, and move with intention.',
      },
    ],
  },

  cleaning: {
    voice_archetype: 'Friendly Guide',
    voice_characteristics: [
      'Organized and detail-oriented',
      'Trustworthy and reliable',
      'Upbeat but professional',
      'Clear about what to expect',
    ],
    typical_services: [
      {
        name: 'Residential Cleaning',
        description:
          'A thorough clean for every room in your home. We leave your space fresh, tidy, and ready to enjoy.',
        icon: 'home',
      },
      {
        name: 'Deep Cleaning',
        description:
          'An extra-detailed clean that reaches every corner. Perfect for seasonal refreshes or first-time bookings.',
        icon: 'cleaning_services',
      },
      {
        name: 'Move-In/Move-Out',
        description:
          'Start fresh in your new space or leave your old one spotless. We handle the heavy cleaning so you do not have to.',
        icon: 'local_shipping',
      },
      {
        name: 'Office Cleaning',
        description:
          'Reliable cleaning for your workplace. A clean office means a healthier, more productive team.',
        icon: 'corporate_fare',
      },
      {
        name: 'Regular Maintenance',
        description:
          'Scheduled weekly or biweekly visits to keep your space consistently clean. One less thing on your to-do list.',
        icon: 'event_repeat',
      },
      {
        name: 'Green Cleaning',
        description:
          'Eco-friendly products that are safe for your family, pets, and the planet. A spotless home without harsh chemicals.',
        icon: 'eco',
      },
    ],
    typical_hours: {
      monday: '8:00 AM – 6:00 PM',
      tuesday: '8:00 AM – 6:00 PM',
      wednesday: '8:00 AM – 6:00 PM',
      thursday: '8:00 AM – 6:00 PM',
      friday: '8:00 AM – 6:00 PM',
      saturday: '9:00 AM – 3:00 PM',
      sunday: 'Closed',
    },
    trust_signals: [
      'Bonded & Insured',
      'Background-Checked Team',
      'Satisfaction Guaranteed',
      'Eco-Friendly Options',
    ],
    cta_language: {
      primary: 'Get a Free Estimate',
      secondary: 'See Our Services',
    },
    faq_templates: [
      {
        question: 'Do I need to be home during the cleaning?',
        answer_template:
          'It is up to you. Many {city} clients give {business_name} a key or access code. Your home is always treated with care.',
      },
      {
        question: 'What products do you use?',
        answer_template:
          '{business_name} uses professional-grade cleaning products. We also offer eco-friendly options on request.',
      },
      {
        question: 'How do you price your services?',
        answer_template:
          'Pricing depends on the size of your space and the service you need. {business_name} provides a free estimate before any work begins.',
      },
      {
        question: 'Are your cleaners background-checked?',
        answer_template:
          'Yes. Every member of the {business_name} team is background-checked, bonded, and insured for your peace of mind.',
      },
      {
        question: 'Can I schedule recurring cleanings?',
        answer_template:
          'Absolutely. {business_name} offers weekly, biweekly, and monthly plans. Regular clients enjoy priority scheduling in {city}.',
      },
    ],
    pricing_language:
      'Free estimates with no obligation. Pricing based on home size and service type.',
    hero_templates: [
      {
        headline_template: 'A Cleaner Home Without the Hassle in {city}',
        subheadline_template:
          '{business_name} handles the cleaning so you can spend your time on what matters most.',
      },
      {
        headline_template: 'Come Home to Clean',
        subheadline_template:
          'Reliable, thorough cleaning from {business_name}. Trusted by families across {city}.',
      },
      {
        headline_template: 'Your {city} Cleaning Team Is Ready',
        subheadline_template:
          '{business_name} delivers a spotless space, every time. Book your first clean today.',
      },
    ],
  },

  pet_groomer: {
    voice_archetype: 'Calm Authority',
    voice_characteristics: [
      'Reassuring and patient',
      'Warm and genuine love for animals',
      'Calming and centered',
      'Knowledgeable about breeds and coat care',
    ],
    typical_services: [
      {
        name: 'Full Grooming',
        description:
          'A complete grooming session: bath, haircut, nails, ears, and finishing touches. Your pet leaves looking and feeling great.',
        icon: 'content_cut',
      },
      {
        name: 'Bath & Brush',
        description:
          'A refreshing bath followed by a thorough brush-out. Keeps your pet\'s coat clean, soft, and tangle-free.',
        icon: 'water_drop',
      },
      {
        name: 'Nail Trimming',
        description:
          'Quick, gentle nail trims to keep paws healthy and comfortable. Walk-ins welcome for this service.',
        icon: 'pet_supplies',
      },
      {
        name: 'Breed-Specific Styling',
        description:
          'Grooming cuts tailored to your pet\'s breed standard. Our groomers know what looks and feels best for every coat type.',
        icon: 'star',
      },
      {
        name: 'Puppy\'s First Groom',
        description:
          'A gentle introduction to grooming for young pups. We take it slow so your puppy builds positive associations.',
        icon: 'pets',
      },
      {
        name: 'De-Shedding Treatment',
        description:
          'Reduces loose fur and keeps shedding under control. Great for heavy-coated breeds and allergy-prone households.',
        icon: 'air',
      },
    ],
    typical_hours: {
      monday: '8:00 AM – 5:00 PM',
      tuesday: '8:00 AM – 5:00 PM',
      wednesday: '8:00 AM – 5:00 PM',
      thursday: '8:00 AM – 5:00 PM',
      friday: '8:00 AM – 5:00 PM',
      saturday: '9:00 AM – 4:00 PM',
      sunday: 'Closed',
    },
    trust_signals: [
      'Certified Pet Groomers',
      'Gentle & Patient Handling',
      'Clean, Safe Salon',
      'Breed-Specific Expertise',
    ],
    cta_language: {
      primary: 'Book a Grooming Appointment',
      secondary: 'See Our Services',
    },
    faq_templates: [
      {
        question: 'How often should my pet be groomed?',
        answer_template:
          'Most dogs benefit from grooming every four to six weeks. {business_name} can recommend a schedule based on your pet\'s breed and coat.',
      },
      {
        question: 'What if my pet is anxious about grooming?',
        answer_template:
          '{business_name} specializes in gentle, patient handling. We take our time and never rush a nervous pet.',
      },
      {
        question: 'Do you groom cats?',
        answer_template:
          'Contact {business_name} in {city} to ask about cat grooming availability. We are happy to discuss your pet\'s needs.',
      },
      {
        question: 'How long does a full groom take?',
        answer_template:
          'A full groom typically takes one to two hours, depending on your pet\'s size and coat. {business_name} will give you an estimate at drop-off.',
      },
      {
        question: 'Does my pet need to be up to date on vaccines?',
        answer_template:
          'Yes. For the safety of all pets in our care, {business_name} requires current vaccinations. Please bring records to your first visit.',
      },
    ],
    pricing_language:
      'Pricing varies by breed, size, and coat condition. Contact us for a quote.',
    hero_templates: [
      {
        headline_template: 'Where Every Pet Gets the Royal Treatment in {city}',
        subheadline_template:
          '{business_name} keeps your pet looking great and feeling comfortable. Gentle grooming from people who truly love animals.',
      },
      {
        headline_template: 'A Grooming Experience Your Pet Will Enjoy',
        subheadline_template:
          'Patient, skilled groomers at {business_name} in {city}. Your pet is in caring hands.',
      },
      {
        headline_template: 'Happy Pets. Proud Pet Parents.',
        subheadline_template:
          '{business_name} delivers breed-perfect grooming with a gentle touch. Book your pet\'s appointment today.',
      },
    ],
  },
}
