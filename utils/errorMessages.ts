/**
 * Centralized Error Messages
 * All application error, warning, and info messages should be defined here
 */

// Auth-related messages
export const AuthMessages = {
  errors: {
    loadUserFailed: "Failed to load user data. Please try again.",
    saveUserFailed: "Failed to save user data. Please try again.",
    clearUserFailed: "Failed to clear user data. Please try again.",
    notLoggedIn: "You are not logged in. Please sign in first.",
    sessionExpired: "Your session has expired. Please sign in again.",
  },
  validation: {
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required",
    phoneRequired: "Phone number is required",
    phoneInvalid: "Please enter a valid phone number",
    addressRequired: "Address is required",
    dobRequired: "Date of birth is required",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email address",
  },
  success: {
    loginSuccess: "Welcome back!",
    logoutSuccess: "You have been logged out successfully.",
    profileUpdated: "Profile updated successfully.",
  },
};

// Cart-related messages
export const CartMessages = {
  errors: {
    addItemFailed: "Failed to add item to cart. Please try again.",
    removeItemFailed: "Failed to remove item from cart. Please try again.",
    clearCartFailed: "Failed to clear cart. Please try again.",
    checkoutFailed: "Checkout failed. Please try again.",
  },
  warnings: {
    cartEmpty: "Your cart is empty. Add some items first!",
    itemOutOfStock: "Sorry, this item is currently out of stock.",
    maxQuantityReached: "You've reached the maximum quantity for this item.",
  },
  success: {
    itemAdded: "Item added to cart!",
    itemRemoved: "Item removed from cart.",
    orderPlaced: "Your order has been placed successfully!",
  },
};

// Form-related messages
export const FormMessages = {
  errors: {
    requiredField: "This field is required",
    invalidInput: "Please enter a valid input",
    submissionFailed: "Form submission failed. Please try again.",
  },
  success: {
    submitted: "Form submitted successfully!",
  },
};

// General application messages
export const AppMessages = {
  errors: {
    networkError: "Network error. Please check your internet connection.",
    unknownError: "An unexpected error occurred. Please try again.",
    operationFailed: "Operation failed. Please try again.",
    loadingFailed: "Failed to load data. Please try again.",
  },
  warnings: {
    confirmAction: "Are you sure you want to proceed?",
    unsavedChanges: "You have unsaved changes. Discard them?",
  },
  info: {
    noData: "No data available",
    loading: "Loading...",
    updated: "Updated successfully",
  },
};

// Navigation messages
export const NavigationMessages = {
  warnings: {
    cannotGoBack: "Cannot go back. You are at the first screen.",
    navigationFailed: "Navigation failed. Please try again.",
  },
};

// Theme-related messages
export const ThemeMessages = {
  warnings: {
    themeNotSupported: "This theme mode is not supported.",
  },
}

