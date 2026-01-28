# Task: HQ Menu Changes - Seasonal Menu Button and Add Items Feature

## Changes Required:
1. ✅ Replace "View Cart" with "Seasonal Menu" button for HQ users
2. ✅ Remove "Seasonal" button from header actions
3. ✅ Add functionality to add existing menu items to seasonal menus

## Implementation Summary:

### Step 1: Modify the floating button in menu.tsx ✅
- Changed "View Cart →" to "Seasonal Menu →" for HQ users
- HQ users see "Seasonal Menu →" and clicking opens the seasonal menu list
- Non-HQ users still see "View Cart →" with cart badge

### Step 2: Remove Seasonal button from header actions ✅
- Removed the "Seasonal" button from `renderHeaderActions()` function
- Now accessed via floating button

### Step 3: Add "Add Items" functionality to seasonal menu modal ✅
- Added state for selected seasonal menu and available items
- Added a search bar to filter menu items
- Added a scrollable list showing available menu items
- Each item shows name, category, price, and "Add" button
- Added functionality to assign items to seasonal menus via `assignItemToSeasonalMenu` dispatch
- Added "+ Items" button to each seasonal menu in the list modal

## Files Modified:
- `app/menu.tsx` - Main changes for button text and add items feature

## Status: Completed ✅
All changes have been implemented successfully.

