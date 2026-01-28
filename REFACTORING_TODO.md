# Refactoring TODO List

## Goal
- Ensure no files are above 275 lines
- Make the code modular
- Build small components and reuse them
- Remove all unused and repetitive code

## Progress: 9/12 Files Refactored

### Phase 1: Utility Files Refactoring

- [x] 1. utils/validation.ts (498 lines) - Split into coreValidations.ts, formValidators.ts, sanitization.ts
- [x] 2. utils/seasonalMenu.ts (331 lines) - Extracted dateTime.ts (180 lines), SeasonalMenuManager (191 lines)
- [x] 3. theme/index.ts (303 lines) - Split into colors.ts (87 lines), content.ts (225 lines)

### Phase 2: Database Layer Refactoring

- [x] 4. database/db.ts (559 lines) - Split into menuItems.ts (211), seasonalMenus.ts (169), stock.ts (118), db.ts (152)

### Phase 3: Redux Store Refactoring

- [x] 5. store/menuSlice.ts (570 lines) → Split into menuThunks.ts (252), menuSlice.ts (248), menuSelectors.ts (113)
- [x] 6. store/stockSlice.ts (363 lines) → Split into stockThunks.ts (168), stockSlice.ts (151), stockSelectors.ts

### Phase 4: Component Refactoring

- [ ] 7. components/MenuItemCard.tsx (280 lines) - Extract StockToggle, PriceDisplay
- [ ] 8. components/SeasonalMenuModal.tsx (386 lines) - Extract create/edit/list to separate files
- [ ] 9. components/ProfileModal.tsx (796 lines) - Extract ProfileForm, ProfileFields
- [ ] 10. app/order-success.tsx (302 lines) - Extract SuccessView, Confetti components
- [ ] 11. app/order.tsx (521 lines) - Extract FormInput, OrderForm into reusable components

### Phase 5: Main App Page Refactoring

- [ ] 12. app/menu.tsx (1068 lines) - Break into: MenuHeader, CategoryFilter, MenuItemCard integration, Modals

## Notes

### File Size Targets
- All TypeScript/TSX files should be ≤ 275 lines
- Use index files for clean imports
- Extract reusable UI components to `components/ui/`
- Extract business logic to `utils/` subdirectories

### Modularization Patterns
1. **UI Components**: Extract to separate files with clear responsibilities
2. **Form Components**: Create reusable FormInput, FormField components
3. **Database**: Split by entity (menu_items, seasonal_menus, stock)
4. **Redux**: Separate async thunks, reducers, and selectors
5. **Utils**: Group related functions into modules

