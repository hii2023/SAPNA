# 🌸 Sapna's Art Studio — Website Setup Guide

A beautiful, modern artist website for Sapna — macrame, paintings, stitching & DIY kits, based in Ahmedabad.

---

## 🚀 Running the Website

### Requirements
- Node.js (included via the local install at `~/bin/node`)

### Start the Development Server
```bash
cd ~/Desktop/SapnaArtStudio
export PATH="$HOME/bin:$PATH"
npm run dev
```
Then open: **http://localhost:3000**

### Build for Production
```bash
npm run build
```
Files will be in the `dist/` folder — ready to deploy to Vercel, Netlify, or any host.

---

## 🔧 Key Customisations

### 1. WhatsApp Number
Edit `src/data/products.js` — find this line near the top:
```js
export const WHATSAPP_NUMBER = "919876543210"
```
Replace with Sapna's actual number (country code + number, no `+` or spaces).
Example: `"919898123456"` for +91 98981 23456

### 2. Calendly Booking Link
Edit `src/data/workshops.js`:
```js
export const CALENDLY_URL = "https://calendly.com/sapna-art-studio"
```
Replace with Sapna's actual Calendly URL.

To show the live calendar embed on the Workshops page, also open `src/pages/Workshops.jsx`
and uncomment the `<iframe>` block (search for "ACTUAL CALENDLY IFRAME").

### 3. Contact Details
- **Email**: Search for `hello@sapnaart.studio` across all files
- **Instagram**: Search for `@sapnaart.studio` and replace with real handle
- **Phone**: Search for `+91 98765 43210`

### 4. Adding New Products
Edit `src/data/products.js` — copy an existing product object and add to the `products` array:
```js
{
  id: 13,                        // unique number
  name: "New Product Name",
  category: "macrame",           // macrame | painting | stitching | diy
  theme: "homedecor",            // travel | homedecor | nature | abstract | spiritual
  price: 2500,
  originalPrice: null,           // or a number for sale price
  images: ["URL1", "URL2"],      // Unsplash or your own image URLs
  size: "50cm × 80cm",
  sizes: ["50cm × 80cm — ₹2,500"],
  available: true,
  isNew: true,
  isBestseller: false,
  description: "...",
  materials: "...",
  careInstructions: "...",
}
```

### 5. Adding Gallery Items
Edit `src/data/gallery.js` — add a new object to `galleryItems`.

### 6. Adding Blog Posts
Edit `src/data/blog.js` — add a new object to `blogPosts`.

### 7. Updating Workshops
Edit `src/data/workshops.js` — update workshop dates in the `upcoming` array.

---

## 📄 Pages Overview

| Page | Route | File |
|------|-------|------|
| Home | `/` | `src/pages/Home.jsx` |
| About | `/about` | `src/pages/About.jsx` |
| Shop | `/shop` | `src/pages/Shop.jsx` |
| Workshops | `/workshops` | `src/pages/Workshops.jsx` |
| Gallery | `/gallery` | `src/pages/Gallery.jsx` |
| Custom Orders | `/custom-orders` | `src/pages/CustomOrders.jsx` |
| Journal/Blog | `/blog` | `src/pages/Blog.jsx` |

---

## 🎨 Design System (CSS Variables)

Edit `src/styles/global.css` to change colours globally:

```css
--terracotta:   #C4714A;   /* Main brand colour */
--sage:         #8A9E7B;   /* Secondary accent */
--gold:         #C9963A;   /* Golden accent */
--beige-light:  #F5EDD6;   /* Background sections */
--brown-dark:   #3D2B1F;   /* Footer / dark text */
```

---

## 🛒 Shop Features

- **Filter by category**: Macrame, Paintings, Stitching, DIY
- **Filter by theme**: Travel, Home Decor, Nature, Abstract, Spiritual
- **Sort**: Default, Newest, Price Low→High, High→Low
- **Search**: Live search across product names & descriptions
- **Quick View modal**: Large image, size selector, WhatsApp buy button
- **WhatsApp buy**: Opens WhatsApp with product details pre-filled

---

## 📅 Workshop Booking

The Workshops page has a Calendly placeholder. To go live:
1. Create a Calendly account at calendly.com
2. Set up your event types (one per workshop type)
3. Copy your Calendly URL
4. Paste it into `CALENDLY_URL` in `src/data/workshops.js`
5. Uncomment the iframe in `src/pages/Workshops.jsx`

---

## 🚢 Deploying to Vercel (Free)

1. Push code to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Framework: Vite → Deploy
4. Your site will be live at `yoursite.vercel.app`
5. Add a custom domain (sapnaart.studio) in Vercel settings

---

## 📱 Mobile Responsive

All pages are fully responsive:
- Mobile menu with slide-out drawer
- Responsive grids (4→2→1 column)
- Touch-friendly buttons and product cards
- Optimised images for fast loading

---

## 💬 WhatsApp Integration

Every product has a "Buy via WhatsApp" button that opens WhatsApp with a pre-filled message including:
- Product name
- Selected size
- Price

Custom Orders form also sends details directly to WhatsApp.

---

Made with 🧡 for Sapna's Art Studio, Ahmedabad.
