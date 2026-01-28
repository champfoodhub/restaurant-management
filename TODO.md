# Code Refactoring Plan

## Goal
- No file above 275 lines
- Modular, reusable components
- Remove unused and repetitive code

## Files to Refactor

### 1. app/menu.tsx (~700 lines)
- [ ] Create `components/MenuList.tsx` - Menu item rendering component
- [ ] Create `components/CategoryFilter.tsx` - Category chips component  
- [ ] Create `components/AddMenuItemModal.tsx` - Add item modal
- [ ] Create `components/SeasonalMenuModal.tsx` - Seasonal menu modal
- [ ] Create `components/SpecialMenuModal.tsx` - Branch special menu modal
- [ ] Refactor `app/menu.tsx` to use new components

### 2. components/ProfileModal.tsx (~500 lines)
- [ ] Create `components/ProfileHeader.tsx` - Avatar and user info
- [ ] Create `components/ProfileField.tsx` - Reusable form field
- [ ] Refactor `components/ProfileModal.tsx` to use new components

### 3. store/menuSlice.ts (~350 lines)
- [ ] Refactor async thunks to reduce duplication
- [ ] Extract common patterns to helpers

### 4. database/db.ts (~340 lines)
- [ ] Create `database/menuDb.ts` - Menu item operations
- [ ] Create `database/seasonalDb.ts` - Seasonal menu operations
- [ ] Create `database/stockDb.ts` - Stock operations
- [ ] Keep `database/db.ts` as entry point

### 5. Cleanup Unused Files
- [ ] Review and remove any unused components/utils

## Progress

### Completed
- [x] Initial analysis complete
- [x] Plan approved by user

### In Progress
- 

### Next Tasks
- Start with menu.tsx modularization

