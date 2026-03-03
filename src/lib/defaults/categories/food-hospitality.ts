import type { CategoryDefaults } from '../category-defaults'

export const foodHospitalityDefaults: Record<string, CategoryDefaults> = {
  bakery: {
    voice_archetype: 'Warm Neighbor',
    voice_characteristics: [
      'Warm and inviting',
      'Uses sensory language',
      'Community-focused',
      'Nostalgic and comforting',
      'Genuinely enthusiastic about craft',
    ],
    typical_services: [
      {
        name: 'Custom Cakes',
        description:
          'Handcrafted cakes designed just for you. From birthdays to weddings, every layer is baked with love.',
        icon: 'cake',
      },
      {
        name: 'Fresh Bread',
        description:
          'Warm loaves baked from scratch each morning. Crusty on the outside, soft and tender within.',
        icon: 'bakery_dining',
      },
      {
        name: 'Pastries & Croissants',
        description:
          'Flaky, buttery pastries made with real butter and patience. Golden on the outside, light as air inside.',
        icon: 'breakfast_dining',
      },
      {
        name: 'Catering Platters',
        description:
          'Beautiful trays of fresh-baked goods for your next gathering. Perfect for meetings, parties, and celebrations.',
        icon: 'brunch_dining',
      },
      {
        name: 'Special Occasion Orders',
        description:
          'Custom orders for holidays, graduations, and milestones. Let us help make your special day even sweeter.',
        icon: 'celebration',
      },
      {
        name: 'Daily Specials',
        description:
          'New treats rotate through our case every day. Stop in to see what just came out of the oven.',
        icon: 'today',
      },
    ],
    typical_hours: {
      monday: '6:00 AM – 3:00 PM',
      tuesday: '6:00 AM – 3:00 PM',
      wednesday: '6:00 AM – 3:00 PM',
      thursday: '6:00 AM – 3:00 PM',
      friday: '6:00 AM – 3:00 PM',
      saturday: '7:00 AM – 4:00 PM',
      sunday: '7:00 AM – 2:00 PM',
    },
    trust_signals: [
      'Made Fresh Daily',
      'Locally Sourced Ingredients',
      'From-Scratch Recipes',
      'Family Owned & Operated',
    ],
    cta_language: {
      primary: 'Order Something Special',
      secondary: 'See Today\'s Menu',
    },
    faq_templates: [
      {
        question: 'How far in advance should I order a custom cake?',
        answer_template:
          'We recommend placing custom cake orders at least one week ahead. For wedding cakes or large events, two to three weeks gives us time to make it perfect.',
      },
      {
        question: 'Does {business_name} offer gluten-free or vegan options?',
        answer_template:
          'We regularly offer a selection of options for different dietary needs. Call us or stop by to ask about what we have available today.',
      },
      {
        question: 'Can I place a catering order for an office event in {city}?',
        answer_template:
          'Absolutely. We put together catering platters for offices, parties, and gatherings throughout {city}. Just give us a call to plan your order.',
      },
      {
        question: 'What time do you start baking each day?',
        answer_template:
          'Our bakers start well before dawn so everything is fresh and ready when we open the doors. The earlier you come in, the wider the selection.',
      },
    ],
    pricing_language:
      'Pricing varies by size and design. Contact us for a custom quote on cakes and catering platters.',
    hero_templates: [
      {
        headline_template: 'Fresh From the Oven to Your Table',
        subheadline_template:
          '{business_name} has been filling {city} with the smell of warm bread and fresh pastries. Come taste the difference homemade makes.',
      },
      {
        headline_template: 'Your Neighborhood Bakery in {city}',
        subheadline_template:
          'Every loaf, every cake, every pastry — baked from scratch with ingredients you can trust. Stop by {business_name} today.',
      },
      {
        headline_template: 'Baked With Love, Shared With {city}',
        subheadline_template:
          'From birthday cakes to morning croissants, {business_name} brings warmth and sweetness to every occasion.',
      },
    ],
  },

  restaurant: {
    voice_archetype: 'Warm Neighbor',
    voice_characteristics: [
      'Warm and welcoming',
      'Uses sensory language',
      'Community-focused',
      'Celebrates gathering and togetherness',
      'Passionate about flavor',
    ],
    typical_services: [
      {
        name: 'Dine-In',
        description:
          'Settle in and enjoy a meal prepared with care. Our dining room is the kind of place where good food meets good company.',
        icon: 'restaurant',
      },
      {
        name: 'Takeout & Delivery',
        description:
          'Enjoy your favorites from the comfort of home. We pack every order with the same care we put into every plate.',
        icon: 'takeout_dining',
      },
      {
        name: 'Catering',
        description:
          'Let us bring the flavor to your next event. Our catering menu feeds crowds without cutting corners.',
        icon: 'local_shipping',
      },
      {
        name: 'Private Events',
        description:
          'Host your next celebration with us. Our space is perfect for birthdays, rehearsal dinners, and team gatherings.',
        icon: 'groups',
      },
      {
        name: 'Daily Specials',
        description:
          'Our chef creates something new each day using the freshest ingredients available. Ask your server what is on special tonight.',
        icon: 'auto_awesome',
      },
      {
        name: 'Happy Hour',
        description:
          'Great drinks and shareable bites at a price that makes your evening even better. Join us for happy hour and unwind.',
        icon: 'local_bar',
      },
    ],
    typical_hours: {
      monday: '11:00 AM – 9:00 PM',
      tuesday: '11:00 AM – 9:00 PM',
      wednesday: '11:00 AM – 9:00 PM',
      thursday: '11:00 AM – 10:00 PM',
      friday: '11:00 AM – 10:00 PM',
      saturday: '11:00 AM – 10:00 PM',
      sunday: '11:00 AM – 8:00 PM',
    },
    trust_signals: [
      'Locally Sourced Ingredients',
      'Scratch-Made Kitchen',
      'Welcoming to All',
      'Proud Part of the {city} Community',
    ],
    cta_language: {
      primary: 'Reserve a Table',
      secondary: 'View Our Menu',
    },
    faq_templates: [
      {
        question: 'Do I need a reservation at {business_name}?',
        answer_template:
          'Walk-ins are always welcome, but reservations help us save you the perfect spot. We recommend booking ahead on weekends and holidays.',
      },
      {
        question: 'Does {business_name} accommodate dietary restrictions?',
        answer_template:
          'We are happy to work with allergies and dietary needs. Let your server know and we will do our best to make your meal just right.',
      },
      {
        question: 'Can I host a private event at {business_name} in {city}?',
        answer_template:
          'Yes, we love hosting celebrations and gatherings. Contact us to learn about our private dining options and event menus.',
      },
      {
        question: 'Does {business_name} offer delivery in {city}?',
        answer_template:
          'We offer takeout and delivery so you can enjoy our food wherever you are in {city}. Call us or order online to get started.',
      },
      {
        question: 'What time is happy hour?',
        answer_template:
          'Happy hour times vary by day. Give us a call or check our website for the latest hours and specials.',
      },
    ],
    pricing_language: null,
    hero_templates: [
      {
        headline_template: 'A Table Is Waiting for You in {city}',
        subheadline_template:
          '{business_name} serves food made with heart and ingredients you can feel good about. Come hungry, leave happy.',
      },
      {
        headline_template: 'Where {city} Comes to Eat',
        subheadline_template:
          'Great meals bring people together. {business_name} is the place where neighbors become friends over something delicious.',
      },
      {
        headline_template: 'Good Food, Good People, Right Here in {city}',
        subheadline_template:
          'From daily specials to long family dinners, {business_name} makes every meal worth savoring.',
      },
    ],
  },

  cafe: {
    voice_archetype: 'Warm Neighbor',
    voice_characteristics: [
      'Warm and inviting',
      'Uses sensory language',
      'Cozy and approachable',
      'Community-oriented',
      'Relaxed yet attentive',
    ],
    typical_services: [
      {
        name: 'Espresso & Coffee',
        description:
          'Carefully crafted espresso drinks and drip coffee made from quality beans. Your morning ritual, done right.',
        icon: 'coffee',
      },
      {
        name: 'Fresh Pastries',
        description:
          'Flaky scones, warm muffins, and buttery pastries baked fresh each morning. The perfect companion to your cup.',
        icon: 'bakery_dining',
      },
      {
        name: 'Breakfast Menu',
        description:
          'Start your day with a satisfying breakfast made from wholesome ingredients. Hearty, fresh, and ready when you are.',
        icon: 'egg_alt',
      },
      {
        name: 'Lunch Menu',
        description:
          'Sandwiches, soups, and salads crafted with fresh, seasonal ingredients. A midday meal that actually feels good.',
        icon: 'lunch_dining',
      },
      {
        name: 'Specialty Drinks',
        description:
          'Seasonal lattes, house-made syrups, and creative blends you will not find anywhere else. Something new to try every visit.',
        icon: 'local_cafe',
      },
      {
        name: 'Event Space',
        description:
          'A cozy, welcoming spot for book clubs, study groups, and small gatherings. Our space is yours to share.',
        icon: 'meeting_room',
      },
    ],
    typical_hours: {
      monday: '6:00 AM – 7:00 PM',
      tuesday: '6:00 AM – 7:00 PM',
      wednesday: '6:00 AM – 7:00 PM',
      thursday: '6:00 AM – 7:00 PM',
      friday: '6:00 AM – 8:00 PM',
      saturday: '7:00 AM – 8:00 PM',
      sunday: '7:00 AM – 5:00 PM',
    },
    trust_signals: [
      'Ethically Sourced Coffee',
      'Made Fresh Every Morning',
      'A Neighborhood Gathering Place',
      'Free Wi-Fi',
    ],
    cta_language: {
      primary: 'Come Say Hello',
      secondary: 'Check Out Our Menu',
    },
    faq_templates: [
      {
        question: 'Does {business_name} have Wi-Fi?',
        answer_template:
          'Yes, we offer free Wi-Fi for all our guests. Grab a coffee, settle in, and stay as long as you like.',
      },
      {
        question: 'Can I host a small event at {business_name}?',
        answer_template:
          'We love hosting small gatherings, book clubs, and meetups. Reach out to learn about reserving our event space.',
      },
      {
        question: 'Where does {business_name} source its coffee beans?',
        answer_template:
          'We work with roasters who source their beans ethically and responsibly. Ask our baristas about the current roast next time you visit.',
      },
      {
        question: 'Does {business_name} offer dairy-free milk options?',
        answer_template:
          'We carry a selection of non-dairy milks including oat, almond, and soy. Let your barista know your preference.',
      },
      {
        question: 'What are {business_name}\'s busiest times?',
        answer_template:
          'Mornings tend to be our liveliest hours. If you prefer a quieter visit, mid-afternoon is a great time to drop by.',
      },
    ],
    pricing_language: null,
    hero_templates: [
      {
        headline_template: 'Your Favorite Spot in {city} Is Waiting',
        subheadline_template:
          '{business_name} is the kind of place where the coffee is always fresh, the pastries are always warm, and you always feel at home.',
      },
      {
        headline_template: 'Slow Down, Sip Something Good',
        subheadline_template:
          'At {business_name}, we believe a great cup of coffee can make the whole day better. Visit us in {city} and see for yourself.',
      },
      {
        headline_template: '{city}\'s Coziest Corner',
        subheadline_template:
          'Good coffee, fresh food, and friendly faces. {business_name} is where your neighborhood gathers.',
      },
    ],
  },

  bar: {
    voice_archetype: 'Warm Neighbor',
    voice_characteristics: [
      'Warm and welcoming',
      'Uses sensory language',
      'Social and spirited',
      'Community-focused',
      'Casually confident',
    ],
    typical_services: [
      {
        name: 'Craft Cocktails',
        description:
          'Handmade cocktails mixed with fresh ingredients and a lot of care. Classic recipes and house originals worth coming back for.',
        icon: 'liquor',
      },
      {
        name: 'Draft Beer',
        description:
          'A rotating selection of local and craft brews on tap. Cold, fresh, and poured the way it should be.',
        icon: 'sports_bar',
      },
      {
        name: 'Wine Selection',
        description:
          'A thoughtfully curated wine list for every palate and occasion. Ask our staff for a recommendation you will love.',
        icon: 'wine_bar',
      },
      {
        name: 'Small Plates',
        description:
          'Shareable bites made to pair with your drink. Bold flavors in small portions that bring the table together.',
        icon: 'tapas',
      },
      {
        name: 'Live Events',
        description:
          'Live music, trivia nights, and events that give you a reason to come out. There is always something happening here.',
        icon: 'music_note',
      },
      {
        name: 'Private Parties',
        description:
          'Book our space for birthdays, milestones, or a night out with your crew. We handle the drinks so you can enjoy the moment.',
        icon: 'celebration',
      },
    ],
    typical_hours: {
      monday: 'Closed',
      tuesday: '4:00 PM – 12:00 AM',
      wednesday: '4:00 PM – 12:00 AM',
      thursday: '4:00 PM – 12:00 AM',
      friday: '3:00 PM – 2:00 AM',
      saturday: '3:00 PM – 2:00 AM',
      sunday: '3:00 PM – 10:00 PM',
    },
    trust_signals: [
      'Locally Owned',
      'Craft Cocktails Made Fresh',
      'Supporting Local Breweries',
      'A Neighborhood Gathering Spot',
    ],
    cta_language: {
      primary: 'Stop By Tonight',
      secondary: 'See What\'s on Tap',
    },
    faq_templates: [
      {
        question: 'Does {business_name} have live music?',
        answer_template:
          'Yes, we host live music and events regularly. Check our schedule or follow us on social media to see what is coming up.',
      },
      {
        question: 'Can I book {business_name} for a private event in {city}?',
        answer_template:
          'We love hosting private parties and celebrations. Reach out to learn about our event packages and availability.',
      },
      {
        question: 'Does {business_name} serve food?',
        answer_template:
          'We offer a menu of small plates and shareable bites designed to pair perfectly with our drinks. Ask your server what is fresh tonight.',
      },
      {
        question: 'What kind of beer does {business_name} have on tap?',
        answer_template:
          'Our draft list rotates regularly and features a mix of local craft brews and favorites. Stop in to see what is pouring today.',
      },
    ],
    pricing_language: null,
    hero_templates: [
      {
        headline_template: 'Your Night Out in {city} Starts Here',
        subheadline_template:
          '{business_name} is where great drinks, good company, and unforgettable evenings come together.',
      },
      {
        headline_template: 'Raise a Glass With {city}',
        subheadline_template:
          'Craft cocktails, cold beer, and a warm welcome. {business_name} is the neighborhood bar you have been looking for.',
      },
      {
        headline_template: 'Come for the Drinks, Stay for the People',
        subheadline_template:
          '{business_name} is more than a bar. It is where {city} gathers to unwind, connect, and enjoy the moment.',
      },
    ],
  },

  florist: {
    voice_archetype: 'Warm Neighbor',
    voice_characteristics: [
      'Warm and caring',
      'Uses sensory language',
      'Emotionally attuned',
      'Creative and expressive',
      'Community-focused',
    ],
    typical_services: [
      {
        name: 'Wedding Flowers',
        description:
          'Bouquets, centerpieces, and floral design for your perfect day. We bring your wedding vision to life with every bloom.',
        icon: 'favorite',
      },
      {
        name: 'Event Arrangements',
        description:
          'Stunning floral pieces for corporate events, galas, and celebrations. Fresh flowers that set the tone for any occasion.',
        icon: 'local_florist',
      },
      {
        name: 'Sympathy & Funeral',
        description:
          'Thoughtful arrangements to honor someone special. We design with care and compassion during life\'s most difficult moments.',
        icon: 'spa',
      },
      {
        name: 'Daily Bouquets',
        description:
          'Beautiful ready-made bouquets crafted each morning. Stop in and grab a burst of color to brighten your day.',
        icon: 'yard',
      },
      {
        name: 'Plant Care',
        description:
          'Healthy houseplants and expert advice to keep them thriving. From succulents to tropicals, we help you grow something beautiful.',
        icon: 'potted_plant',
      },
      {
        name: 'Delivery Service',
        description:
          'Fresh flowers delivered right to their door. Whether it is a surprise or a scheduled gift, we handle it with care.',
        icon: 'local_shipping',
      },
    ],
    typical_hours: {
      monday: '9:00 AM – 6:00 PM',
      tuesday: '9:00 AM – 6:00 PM',
      wednesday: '9:00 AM – 6:00 PM',
      thursday: '9:00 AM – 6:00 PM',
      friday: '9:00 AM – 6:00 PM',
      saturday: '9:00 AM – 5:00 PM',
      sunday: '10:00 AM – 3:00 PM',
    },
    trust_signals: [
      'Locally Grown When Possible',
      'Hand-Arranged With Care',
      'Same-Day Delivery Available',
      'Serving {city} for Years',
    ],
    cta_language: {
      primary: 'Send Something Beautiful',
      secondary: 'Browse Arrangements',
    },
    faq_templates: [
      {
        question: 'Does {business_name} offer same-day delivery in {city}?',
        answer_template:
          'Yes, we offer same-day delivery for orders placed before noon. Contact us early to make sure your flowers arrive fresh and on time.',
      },
      {
        question: 'Can {business_name} do the flowers for my wedding?',
        answer_template:
          'We love designing wedding florals. Schedule a consultation so we can learn about your style, colors, and vision for the day.',
      },
      {
        question: 'What flowers are in season right now?',
        answer_template:
          'Seasonal availability changes throughout the year. Stop by or give us a call and we will walk you through what is fresh and looking its best.',
      },
      {
        question: 'Does {business_name} sell houseplants?',
        answer_template:
          'We carry a selection of houseplants along with pots, soil, and everything you need to keep them happy. Our team can help you find the right plant for your space.',
      },
      {
        question: 'How do I order sympathy flowers from {business_name}?',
        answer_template:
          'You can call us or visit the shop and we will help you choose an arrangement that feels right. We handle sympathy orders with extra care and can deliver directly to the service.',
      },
    ],
    pricing_language:
      'Bouquet pricing starts at $35. Custom arrangements and wedding packages are quoted based on your needs.',
    hero_templates: [
      {
        headline_template: 'Say It With Flowers From {city}\'s Favorite Florist',
        subheadline_template:
          '{business_name} creates beautiful, hand-arranged bouquets and designs for every moment that matters.',
      },
      {
        headline_template: 'Fresh Flowers, Made With Heart',
        subheadline_template:
          'From weddings to everyday surprises, {business_name} brings color and life to every occasion in {city}.',
      },
      {
        headline_template: 'Brighten Someone\'s Day in {city}',
        subheadline_template:
          'Hand-picked, hand-arranged, and delivered with care. {business_name} makes sending flowers personal and effortless.',
      },
    ],
  },
}
