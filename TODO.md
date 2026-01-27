# Errors Found and Fix Plan

## Critical Errors (Red Files):

1. **`app/cart.tsx`** - Uses `router.replace('/')` without importing `router` from `expo-router`
2. **`app/order.tsx`** - Uses `router.replace('/menu')` without importing `router` from `expo-router` (2 occurrences)
3. **`app/_layout.tsx`** - Uses `router.replace('/')` without importing `router` from `expo-router`
4. **`app/(tabs)/index.tsx`** - Contains leftover Expo starter template code with invalid imports (`@/components/...`)

## Fix Plan:

- [ ] Fix `app/cart.tsx` - Add `import { router } from "expo-router";`
- [ ] Fix `app/order.tsx` - Add `import { router } from "expo-router";`
- [ ] Fix `app/_layout.tsx` - Add `import { router } from "expo-router";`
- [ ] Delete `app/(tabs)/index.tsx` - It's unused in the navigation stack
- [ ] Run the app to verify all errors are fixed

