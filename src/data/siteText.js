// ============================================================
// SITE TEXT REGISTRY
// Editable headings, labels and taglines across the website,
// managed from the admin "Website Text" tab. Pages read each
// value via getSiteText(key); the built-in wording here is the
// default until the admin changes it.
// ============================================================

export const SITE_TEXT_GROUPS = [
  {
    page: 'Home Page',
    items: [
      { key: 'home_hero1_label', label: 'Hero slide 1: small label', def: 'Macrame Art' },
      { key: 'home_hero1_heading', label: 'Hero slide 1: big heading', def: "Threads of a\nWanderer's Soul", multiline: true },
      { key: 'home_hero1_sub', label: 'Hero slide 1: subtitle', def: 'Handcrafted macrame wall hangings, paintings & stitching, each piece a journey', multiline: true },
      { key: 'home_hero2_label', label: 'Hero slide 2: small label', def: 'Watercolour Paintings' },
      { key: 'home_hero2_heading', label: 'Hero slide 2: big heading', def: 'Colours Collected\nAcross India', multiline: true },
      { key: 'home_hero2_sub', label: 'Hero slide 2: subtitle', def: "Travel-inspired watercolours & acrylics that bring the world's beauty into your home", multiline: true },
      { key: 'home_hero3_label', label: 'Hero slide 3: small label', def: 'Embroidery & Stitching' },
      { key: 'home_hero3_heading', label: 'Hero slide 3: big heading', def: 'Stories Stitched\nStitch by Stitch', multiline: true },
      { key: 'home_hero3_sub', label: 'Hero slide 3: subtitle', def: 'Botanical embroidery hoops and stitching art, handmade with love in Ahmedabad', multiline: true },
      { key: 'home_cats_label', label: 'Categories: small label', def: 'Find Your Art' },
      { key: 'home_cats_title', label: 'Categories: heading', def: 'Four Ways to Bring Handmade Art Home' },
      { key: 'home_cat_macrame_name', label: 'Category card 1: name', def: 'Macrame' },
      { key: 'home_cat_macrame_desc', label: 'Category card 1: description', def: 'Handknotted wall hangings in natural cotton', multiline: true },
      { key: 'home_cat_painting_name', label: 'Category card 2: name', def: 'Paintings' },
      { key: 'home_cat_painting_desc', label: 'Category card 2: description', def: 'Travel watercolours & textured acrylics', multiline: true },
      { key: 'home_cat_stitching_name', label: 'Category card 3: name', def: 'Stitching' },
      { key: 'home_cat_stitching_desc', label: 'Category card 3: description', def: 'Botanical embroidery & stitched hoop art', multiline: true },
      { key: 'home_cat_diy_name', label: 'Category card 4: name', def: 'DIY Kits' },
      { key: 'home_cat_diy_desc', label: 'Category card 4: description', def: 'Make your own, complete craft kits', multiline: true },
      { key: 'home_featured_label', label: 'Featured: small label', def: 'Fresh Arrivals & Bestsellers' },
      { key: 'home_featured_title', label: 'Featured: heading', def: 'Handpicked Just for You' },
      { key: 'home_featured_sub', label: 'Featured: subtitle', def: 'Every piece is one-of-a-kind, made with care and shipped with love from Ahmedabad.', multiline: true },
      { key: 'home_about_label', label: 'Meet Sapna: small label', def: 'The Artist Behind the Art' },
      { key: 'home_about_title', label: 'Meet Sapna: heading', def: "Hello, I'm Sapna 🌿" },
      { key: 'home_services_label', label: 'Services: small label', def: 'What I Offer' },
      { key: 'home_services_title', label: 'Services: heading', def: 'More Ways to Create With Me' },
      { key: 'home_videos_label', label: 'Videos: small label', def: 'Watch & Learn' },
      { key: 'home_videos_title', label: 'Videos: heading', def: 'See the Craft in Motion' },
      { key: 'home_videos_sub', label: 'Videos: subtitle', def: 'Tutorials, studio moments and a peek behind every piece.', multiline: true },
      { key: 'home_reviews_label', label: 'Reviews: small label', def: 'Happy Customers' },
      { key: 'home_reviews_title', label: 'Reviews: heading', def: 'Made with Love, Received with Joy' },
      { key: 'home_cta_label', label: 'Bottom banner: small label', def: "Let's Create Together" },
      { key: 'home_cta_title', label: 'Bottom banner: heading', def: 'Have Something Special in Mind?' },
      { key: 'home_cta_sub', label: 'Bottom banner: text', def: 'Custom commissions, bulk orders, event installations, or workshop bookings, just say hello!', multiline: true },
    ],
  },
  {
    page: 'About Page',
    items: [
      { key: 'about_story_label', label: 'Story: small label', def: 'My Story' },
      { key: 'about_story_title', label: 'Story: heading', def: 'From Tangled Rope to Full-Time Artist' },
      { key: 'about_practice_label', label: 'Practice: small label', def: 'Practice & Collaborations' },
      { key: 'about_practice_title', label: 'Practice: heading', def: 'Art, Spaces & Creative Direction' },
      { key: 'about_travel_label', label: 'Travel: small label', def: 'What Fuels the Art' },
      { key: 'about_travel_title', label: 'Travel: heading', def: 'My Work is My Travel Diary' },
      { key: 'about_travel_sub', label: 'Travel: subtitle', def: 'Every piece I create carries a memory, a colour I saw, a texture I touched, a moment of quiet beauty on the road.', multiline: true },
      { key: 'about_values_label', label: 'Values: small label', def: 'What I Believe In' },
      { key: 'about_values_title', label: 'Values: heading', def: 'Art Made with Intention' },
      { key: 'about_cta_label', label: 'Bottom: small label', def: "Let's Connect" },
      { key: 'about_cta_title', label: 'Bottom: heading', def: 'Ready to Bring Handmade Art Into Your Home?' },
    ],
  },
  {
    page: 'Shop Page',
    items: [
      { key: 'shop_hero_label', label: 'Hero: small label', def: 'Every Piece, Made by Hand' },
      { key: 'shop_hero_title', label: 'Hero: title', def: 'The Shop' },
      { key: 'shop_hero_sub', label: 'Hero: subtitle', def: 'Macrame · Paintings · Stitching · DIY Kits, handcrafted in Ahmedabad with love & wanderlust', multiline: true },
    ],
  },
  {
    page: 'Workshops Page',
    items: [
      { key: 'workshops_hero_label', label: 'Hero: small label', def: 'Learn, Create, Take Home' },
      { key: 'workshops_hero_title', label: 'Hero: title', def: 'Workshops & Classes' },
      { key: 'workshops_hero_sub', label: 'Hero: subtitle', def: 'In-person in Ahmedabad & online worldwide, all skill levels welcome 🎨', multiline: true },
      { key: 'workshops_cards_label', label: 'Workshops list: small label', def: "What's On Offer" },
      { key: 'workshops_cards_title', label: 'Workshops list: heading', def: 'Choose Your Creative Adventure' },
      { key: 'workshops_private_label', label: 'Private events: small label', def: 'Private Events' },
      { key: 'workshops_private_title', label: 'Private events: heading', def: 'Want the Whole Experience Just for Your Group?' },
      { key: 'workshops_faq_label', label: 'FAQ: small label', def: 'Got Questions?' },
      { key: 'workshops_faq_title', label: 'FAQ: heading', def: 'Frequently Asked' },
    ],
  },
  {
    page: 'Second Life Page',
    items: [
      { key: 'recycle_hero_label', label: 'Hero: small label', def: 'Recycled & Upcycled' },
      { key: 'recycle_hero_title', label: 'Hero: title', def: 'Second Life' },
      { key: 'recycle_hero_sub', label: 'Hero: subtitle', def: 'Beautiful pieces given a new beginning, handcrafted from reclaimed, recycled, and upcycled materials. Kind to the planet, one-of-a-kind for your home.', multiline: true },
    ],
  },
  {
    page: 'Journal Page',
    items: [
      { key: 'blog_hero_label', label: 'Hero: small label', def: 'Stories, Tips & Travels' },
      { key: 'blog_hero_title', label: 'Hero: title', def: "Sapna's Journal" },
      { key: 'blog_hero_sub', label: 'Hero: subtitle', def: 'Behind the art, inside the studio, across India & beyond, come along for the journey ✨', multiline: true },
    ],
  },
  {
    page: 'Projects Page',
    items: [
      { key: 'projects_hero_label', label: 'Hero: small label', def: 'Concept to Model' },
      { key: 'projects_hero_title', label: 'Hero: title', def: 'Projects' },
      { key: 'projects_hero_sub', label: 'Hero: subtitle', def: 'Diorama · Model Making · Educational Displays · Mixed Media Builds', multiline: true },
    ],
  },
]

// Flat { key: default } map.
export const SITE_TEXT_DEFAULTS = SITE_TEXT_GROUPS.reduce((acc, g) => {
  g.items.forEach(it => { acc[it.key] = it.def })
  return acc
}, {})
