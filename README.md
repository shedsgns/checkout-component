# Merge Max Checkout

A polished checkout interaction for choosing a Merge Max plan and entering payment details. Built as a focused React component with responsive light and dark themes.

## Highlights

- Two plan variants with smoothly animated pricing
- A focused dark horizontal checkout variant
- Expandable order and payment sections
- Automatic card-number formatting
- Accessible keyboard, focus, pressed, and disabled states
- Reduced-motion support
- Local Inter typography
- Responsive, dependency-light implementation

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The dark horizontal variant is available at
[http://localhost:3000/dark](http://localhost:3000/dark).

## Component

```tsx
<MergePlanCheckout
  onSubscribe={(plan) => console.log(plan)}
  disabled={false}
/>
```

Built with Next.js, React, TypeScript, and CSS Modules.
