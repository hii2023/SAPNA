// ============================================================
// SITE IMAGE REGISTRY
// The fixed "section" photos across the website (heroes, banners,
// category cards, etc.) that the admin can change from the
// "Website Photos" tab. Each slot has a stable `key`, a friendly
// `label` (so the admin knows which section it controls), a short
// `desc`, the recommended size `w` x `h` (matches how that section
// is displayed, used for the crop frame and size guide), and the
// built-in default image `url`. A slot may also carry a `textKey`,
// and a `descKey`, which are Website Text keys for the name and blurb
// shown on that card, so the photo and its wording are edited together.
//
// Product, gallery and project photos are NOT here, those are
// managed in their own admin tabs.
// ============================================================

export const SITE_IMAGE_GROUPS = [
  {
    page: 'Home Page',
    items: [
      { key: 'home_hero_1', label: 'Hero slide 1 (Macrame)', desc: 'Big background photo, first rotating slide at the top of the home page.', w: 1600, h: 900, url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85' },
      { key: 'home_hero_2', label: 'Hero slide 2 (Paintings)', desc: 'Big background photo, second rotating slide at the top of the home page.', w: 1600, h: 900, url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1600&q=85' },
      { key: 'home_hero_3', label: 'Hero slide 3 (Stitching)', desc: 'Big background photo, third rotating slide at the top of the home page.', w: 1600, h: 900, url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1600&q=85' },
      { key: 'home_cat_macrame', textKey: 'home_cat_macrame_name', descKey: 'home_cat_macrame_desc', label: 'Category card: Macrame', desc: '"Four Ways to Bring Handmade Art Home" section, Macrame card.', w: 800, h: 800, url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80' },
      { key: 'home_cat_painting', textKey: 'home_cat_painting_name', descKey: 'home_cat_painting_desc', label: 'Category card: Paintings', desc: '"Four Ways to Bring Handmade Art Home" section, Paintings card.', w: 800, h: 800, url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&q=80' },
      { key: 'home_cat_stitching', textKey: 'home_cat_stitching_name', descKey: 'home_cat_stitching_desc', label: 'Category card: Stitching', desc: '"Four Ways to Bring Handmade Art Home" section, Stitching card.', w: 800, h: 800, url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80' },
      { key: 'home_cat_diy', textKey: 'home_cat_diy_name', descKey: 'home_cat_diy_desc', label: 'Category card: DIY Kits', desc: '"Four Ways to Bring Handmade Art Home" section, DIY Kits card.', w: 800, h: 800, url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=500&q=80' },
      { key: 'home_about_main', label: 'Meet Sapna: main photo', desc: '"Hello, I\'m Sapna" section on the home page, large photo.', w: 640, h: 800, url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80' },
      { key: 'home_insta_1', label: 'Instagram strip photo 1', desc: '"Follow the Journey" Instagram grid near the bottom of the home page.', w: 600, h: 600, url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
      { key: 'home_insta_2', label: 'Instagram strip photo 2', desc: '"Follow the Journey" Instagram grid near the bottom of the home page.', w: 600, h: 600, url: 'https://images.unsplash.com/photo-1579703822122-204b92e80d61?w=400&q=80' },
      { key: 'home_insta_3', label: 'Instagram strip photo 3', desc: '"Follow the Journey" Instagram grid near the bottom of the home page.', w: 600, h: 600, url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80' },
      { key: 'home_insta_4', label: 'Instagram strip photo 4', desc: '"Follow the Journey" Instagram grid near the bottom of the home page.', w: 600, h: 600, url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
      { key: 'home_insta_5', label: 'Instagram strip photo 5', desc: '"Follow the Journey" Instagram grid near the bottom of the home page.', w: 600, h: 600, url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&q=80' },
      { key: 'home_insta_6', label: 'Instagram strip photo 6', desc: '"Follow the Journey" Instagram grid near the bottom of the home page.', w: 600, h: 600, url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80' },
    ],
  },
  {
    page: 'About Page',
    items: [
      { key: 'about_hero', label: 'Hero background', desc: 'Big background photo at the top of the About page.', w: 1600, h: 900, url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1600&q=80' },
      { key: 'about_story_main', label: 'My Story: main photo', desc: '"From Tangled Rope to Full-Time Artist" story section, large photo.', w: 640, h: 800, url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=700&q=80' },
      { key: 'about_story_small', label: 'My Story: small photo', desc: '"From Tangled Rope to Full-Time Artist" story section, small overlapping photo.', w: 500, h: 500, url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
      { key: 'about_travel_rajasthan', label: 'Travel card: Rajasthan', desc: '"My Work is My Travel Diary" section, Rajasthan card.', w: 720, h: 480, url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80' },
      { key: 'about_travel_kerala', label: 'Travel card: Kerala', desc: '"My Work is My Travel Diary" section, Kerala card.', w: 720, h: 480, url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80' },
      { key: 'about_travel_himalayas', label: 'Travel card: Himalayas', desc: '"My Work is My Travel Diary" section, Himalayas card.', w: 720, h: 480, url: 'https://images.unsplash.com/photo-1579703822122-204b92e80d61?w=600&q=80' },
    ],
  },
  {
    page: 'Workshops Page',
    items: [
      { key: 'workshops_private', label: 'Private workshop photo', desc: 'Photo next to the "Private / Group Workshop" enquiry section.', w: 760, h: 570, url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=700&q=80' },
    ],
  },
  {
    page: 'Custom Orders Page',
    items: [
      { key: 'custom_example_1', label: 'Example: Wedding Macrame Arch', desc: 'First past-work example card on the Custom Orders page.', w: 640, h: 480, url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&q=80' },
      { key: 'custom_example_2', label: 'Example: Rajasthan Travel Painting', desc: 'Second past-work example card on the Custom Orders page.', w: 640, h: 480, url: 'https://images.unsplash.com/photo-1532664189809-02133fee698d?w=500&q=80' },
      { key: 'custom_example_3', label: 'Example: Ganesha Embroidery Diptych', desc: 'Third past-work example card on the Custom Orders page.', w: 640, h: 480, url: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=500&q=80' },
    ],
  },
]

// Flat { key: defaultUrl } map, derived from the groups above.
export const SITE_IMAGE_DEFAULTS = SITE_IMAGE_GROUPS.reduce((acc, group) => {
  group.items.forEach(item => { acc[item.key] = item.url })
  return acc
}, {})
