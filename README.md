# Orrion

Act as an expert UI/UX designer, creative director, and full-stack developer. Design and build Olyon, a premium, futuristic, mobile-first ecommerce application that looks and behaves like a real shopping app, not a conventional website.

1. DESIGN & VISUAL IDENTITY

I have attached reference designs. Study them carefully and reproduce their visual style, layout, spacing, typography, colors, component proportions, and overall composition as closely as possible. Use the references as the primary design authority for the corresponding screens.

The theme is a futuristic forest blended with premium technology. Use dark olive green, deep forest green, matte plum purple, and clean white. Suggested colors: "#303B26", "#18251C", "#392536", and "#FFFFFF".

Create a sophisticated, immersive interface with cinematic gradients, subtle botanical textures, atmospheric lighting, refined shadows, elegant surfaces, and carefully controlled motion. Avoid excessive neon, cheap-looking effects, generic templates, and repetitive card layouts.

Use modern typography such as Manrope or Inter, consistent Lucide icons, precise spacing, excellent contrast, and a cohesive design system. Every element must feel premium, intentional, and professionally designed.

2. REAL APP-LIKE EXPERIENCE

The entire application must feel like a modern mobile shopping app, including its navigation, transitions, animations, typography, controls, and interactions.

Prioritize mobile-first design, comfortable touch targets, a polished app header, bottom navigation where appropriate, smooth screen transitions, subtle micro-interactions, skeleton loading, and responsive layouts for tablets and desktops.

Prevent overlapping elements, excessive empty space, horizontal overflow, and poorly scaled components. Make the application installable as a Progressive Web App (PWA) where supported.

3. BUILD THE COMPLETE APPLICATION

Implement all screens with consistent styling and working navigation:

- Splash screen and loading states.
- Home screen with hero, categories, featured products, promotions, and trending products.
- Product listing, search, filtering, sorting, and category pages.
- Product details with image gallery, variants, prices, stock, wishlist, Add to Cart, and Buy Now.
- Cart with quantity controls, removal, subtotal, shipping, discounts, and total.
- Checkout with customer details, shipping address, validation, and order summary.
- Payment selection supporting Cash on Delivery (COD) initially.
- Order-success screen with a real order number and summary.
- Sign-in, sign-up, profile, saved addresses, and account settings.
- Wishlist, order history, order details, and order-status timeline.
- Protected admin dashboard for product management, inventory, orders, and manual shipping-status updates.

Every visible button, icon, and control must perform its intended action. No dead buttons, disconnected pages, or decorative-only functionality.

4. REAL BACKEND & FUNCTIONALITY

Use a suitable modern stack, preferably React, TypeScript, Tailwind CSS, Framer Motion, and Supabase or an equivalent backend.

Implement genuine authentication, a database-backed product catalogue, persistent carts and wishlists, inventory management, order creation, customer order history, and authorized administrative controls.

Use secure backend authorization, server-side validation, accurate price calculations, and stock checks. Prevent duplicate orders and overselling. Protect customer information and never expose secret keys in frontend code.

COD orders must be genuinely saved in the database. Admins must be able to update inventory, confirm orders, and manually update shipping statuses.

If backend credentials are unavailable, build the integration points and provide setup instructions. Clearly identify any feature that still requires configuration. Never present fake functionality as real.

5. ANIMATIONS & PERFORMANCE

Use smooth, refined animations for navigation, product interactions, wishlist actions, cart updates, modals, loading states, and order confirmation. Add subtle forest-inspired motion without distracting customers or slowing mobile devices.

Optimize images, loading speed, accessibility, keyboard navigation, touch interactions, and reduced-motion preferences.

6. IMPLEMENTATION & QUALITY CONTROL

First analyze the reference images, then establish the design system and build the complete application. Refine every screen to remove generic styling, inconsistent spacing, weak contrast, cheap-looking components, and visual mismatches.

Test registration, login, browsing, search, filters, wishlist, cart, checkout validation, COD order creation, inventory updates, order history, and manual shipping updates.

Ensure the production build works and provide the complete source code, backend setup instructions, environment-variable requirements, and deployment instructions for Vercel or Netlify.

Final objective: Deliver an extraordinary, futuristic forest-inspired Olyon shopping app with reference-matched visuals, premium mobile-app UX, and genuinely functional ecommerce features. Do not stop at a homepage, static prototype, or generic template. Build, test, and refine the complete application. Never claim a feature works unless it has been implemented and verified.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://orrion.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dade56c4-e919-41ae-b235-97399aee1988).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
