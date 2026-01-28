# TODO: Stock and Menu Layout Update

## Task Summary
Position stock indicator and stock toggle horizontally next to each other at the right-bottom corner of the menu card.

## Changes Required

### 1. Update `renderMenuItem` in `app/menu.tsx`
- [x] Remove stock indicator from absolute top-right position
- [x] Create a new stock container with horizontal layout at bottom-right
- [x] Move stock toggle to the stock container
- [x] Add stock indicator next to the toggle horizontally

### 2. Update Styles in `app/menu.tsx`
- [x] Add `stockControlsContainer` style (position absolute, bottom: 10, right: 10, flexDirection: row, alignItems: center, gap)
- [x] Update `itemContent` style to remove right padding for controls (since stock controls are now absolute)
- [x] Keep `stockIndicator` style but remove absolute positioning from top-right

### 3. Add Light/Dark Mode Toggle for Branch Users
- [x] Import `toggleTheme` from themeSlice
- [x] Add theme toggle button in header actions (only visible for branch users)
- [x] Button shows moon icon for light mode, sun icon for dark mode

## Implementation Plan

1. Read the current menu.tsx file to understand the structure
2. Modify the renderMenuItem function to restructure the stock controls
3. Update the StyleSheet to add new styles for the bottom-right stock container
4. Add theme toggle button for branch users
5. Test the changes

## Files to Modify
- `app/menu.tsx` - Update renderMenuItem function, styles, and add theme toggle

## Status: ✅ COMPLETED

