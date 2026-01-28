# CSS Consolidation Plan

## Objective
Remove all inline CSS from components and app files, consolidating them into a single file under `styles/` folder with no repetition.

## Files to Update

### Components (10 files)
- [ ] `components/themed-text.tsx` - text styles (5 styles)
- [ ] `components/MenuItemCard.tsx` - card, controls, badges (21 styles)
- [ ] `components/CategoryFilter.tsx` - category chips (6 styles)
- [ ] `components/ProfileModal.tsx` - modal, forms, actions (32 styles)
- [ ] `components/AddMenuItemModal` - modal, inputs, buttons (8 styles)
- [ ] `components/SeasonalMenuModal.tsx` - modal, list items (17 styles)
- [ ] `components/SpecialMenuModal.tsx` - modal, inputs, buttons (7 styles)
- [ ] `components/ErrorBoundary.tsx` - error UI, buttons (13 styles)
- [ ] `components/parallax-scroll-view.tsx` - header, content (4 styles)
- [ ] `components/ui/collapsible.tsx` - heading, content (2 styles)

### App Pages (6 files)
- [ ] `app/menu.tsx` - largest file (59 styles)
- [ ] `app/cart.tsx` - cards, controls, checkout (14 styles)
- [ ] `app/order.tsx` - forms, inputs, buttons (22 styles)
- [ ] `app/order-success.tsx` - success UI, animations (18 styles)
- [ ] `app/index.tsx` - hero, CTA, flavor selector (18 styles)
- [ ] `app/_layout.tsx` - profile icons (2 styles)

## Style Categories (for organization)
1. **Shared** - Common styles (buttons, cards, inputs, modals, text)
2. **Components** - Component-specific styles
3. **App** - Page-specific styles

## Progress
- [ ] Create `styles/` folder
- [ ] Create consolidated `styles/index.ts`
- [ ] Update all component imports
- [ ] Verify no style repetition
- [ ] Test application functionality

