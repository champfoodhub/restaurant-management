/**
 * Centralized Validation Utilities
 * Reusable validation functions for form inputs, data sanitization, and business logic validation
 */

import { CartMessages } from "./errorMessages";

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldValidation {
  value: string;
  label: string;
  validations: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  message?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => boolean;
}

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be less than ${max} characters`,
  invalid: (field: string) => `Invalid ${field}`,
};

// ============================================================================
// Core Validation Functions
// ============================================================================

/**
 * Check if a value is empty (null, undefined, or empty string after trim)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Validate that a field is required
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (isEmpty(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.required(fieldName) };
  }
  return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(value: string, fieldName: string = 'Email'): ValidationResult {
  if (isEmpty(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.required(fieldName) };
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.email };
  }
  return { isValid: true };
}

/**
 * Validate phone number (supports various formats)
 */
export function validatePhone(
  value: string,
  fieldName: string = 'Phone number',
  minLength: number = 10
): ValidationResult {
  if (isEmpty(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.required(fieldName) };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = value.replace(/\D/g, '');
  
  if (digitsOnly.length < minLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.phone };
  }
  return { isValid: true };
}

/**
 * Validate minimum length
 * Note: We do NOT trim the value to allow trailing/leading spaces in fields like address
 */
export function validateMinLength(
  value: string,
  fieldName: string,
  minLength: number
): ValidationResult {
  if (value.length < minLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.minLength(fieldName, minLength) };
  }
  return { isValid: true };
}

/**
 * Validate maximum length
 * Note: We do NOT trim the value to allow trailing/leading spaces in fields like address
 */
export function validateMaxLength(
  value: string,
  fieldName: string,
  maxLength: number
): ValidationResult {
  if (value.length > maxLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.maxLength(fieldName, maxLength) };
  }
  return { isValid: true };
}

/**
 * Validate against a custom regex pattern
 */
export function validatePattern(
  value: string,
  fieldName: string,
  pattern: RegExp,
  errorMessage?: string
): ValidationResult {
  if (!pattern.test(value)) {
    return { isValid: false, error: errorMessage || VALIDATION_MESSAGES.invalid(fieldName) };
  }
  return { isValid: true };
}

/**
 * Custom validator function
 */
export function validateCustom(
  value: string,
  validator: (val: string) => boolean,
  errorMessage: string
): ValidationResult {
  if (!validator(value)) {
    return { isValid: false, error: errorMessage };
  }
  return { isValid: true };
}

// ============================================================================
// Composite Validation
// ============================================================================

/**
 * Validate a field with multiple rules
 */
export function validateField(
  value: string,
  label: string,
  rules: ValidationRule[]
): ValidationResult {
  for (const rule of rules) {
    let result: ValidationResult;

    switch (rule.type) {
      case 'required':
        result = validateRequired(value, label);
        break;
      case 'email':
        result = validateEmail(value, label);
        break;
      case 'phone':
        result = validatePhone(value, label, rule.minLength || 10);
        break;
      case 'minLength':
        result = validateMinLength(value, label, rule.minLength || 0);
        break;
      case 'maxLength':
        result = validateMaxLength(value, label, rule.maxLength || 100);
        break;
      case 'pattern':
        result = validatePattern(value, label, rule.pattern!, rule.message);
        break;
      case 'custom':
        result = validateCustom(value, rule.customValidator!, rule.message || 'Invalid value');
        break;
      default:
        continue;
    }

    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
}

/**
 * Validate multiple fields and return all errors
 */
export function validateForm(fields: FieldValidation[]): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const result = validateField(field.value, field.label, field.validations);
    if (!result.isValid && result.error) {
      errors[field.label.toLowerCase()] = result.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// Form-Specific Validators
// ============================================================================

/**
 * Validate order form data
 */
export function validateOrderForm(formData: {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  email: string;
}): ValidationResult {
  // First name validation
  const firstNameResult = validateRequired(formData.firstName.trim(), 'First name');
  if (!firstNameResult.isValid) return firstNameResult;

  // Last name validation
  const lastNameResult = validateRequired(formData.lastName.trim(), 'Last name');
  if (!lastNameResult.isValid) return lastNameResult;

  // Phone validation
  const phoneResult = validatePhone(formData.phone.trim(), 'Phone number', 10);
  if (!phoneResult.isValid) return phoneResult;

  // Address validation - NOT trimmed to allow spaces after words
  const addressResult = validateMinLength(formData.address, 'Address', 10);
  if (!addressResult.isValid) return addressResult;

  // DOB validation
  const dobResult = validateRequired(formData.dob.trim(), 'Date of birth');
  if (!dobResult.isValid) return dobResult;

  // Email validation
  const emailResult = validateEmail(formData.email.trim(), 'Email');
  if (!emailResult.isValid) return emailResult;

  return { isValid: true };
}

/**
 * Validate profile form data
 */
export function validateProfileForm(formData: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}): ValidationResult {
  // First name validation
  const firstNameResult = validateRequired(formData.firstName.trim(), 'First name');
  if (!firstNameResult.isValid) return firstNameResult;

  // Last name validation
  const lastNameResult = validateRequired(formData.lastName.trim(), 'Last name');
  if (!lastNameResult.isValid) return lastNameResult;

  // Phone validation
  const phoneResult = validatePhone(formData.phone.trim(), 'Phone number', 10);
  if (!phoneResult.isValid) return phoneResult;

  // Email validation
  const emailResult = validateEmail(formData.email.trim(), 'Email');
  if (!emailResult.isValid) return emailResult;

  return { isValid: true };
}

/**
 * Validate cart before checkout
 */
export function validateCartForCheckout(
  items: Array<{ id: string; name: string; quantity: number; price: number }>,
  total: number
): ValidationResult {
  if (!items || items.length === 0) {
    return { isValid: false, error: CartMessages.warnings.cartEmpty };
  }

  // Check for invalid quantities
  const invalidItems = items.filter(item => item.quantity <= 0 || !item.id);
  if (invalidItems.length > 0) {
    return { isValid: false, error: 'Some items have invalid quantities' };
  }

  // Check for negative prices
  const negativePriceItems = items.filter(item => item.price < 0);
  if (negativePriceItems.length > 0) {
    return { isValid: false, error: 'Some items have invalid prices' };
  }

  // Validate total
  if (total < 0) {
    return { isValid: false, error: 'Invalid cart total' };
  }

  return { isValid: true };
}

// ============================================================================
// Sanitization Utilities
// ============================================================================

/**
 * Sanitize string input to prevent XSS attacks
 * Note: We intentionally do NOT trim the value to allow users to enter
 * trailing/leading spaces in fields like address
 * Note: We do NOT replace '/' to preserve date formats like DOB (DD/MM/YYYY)
 */
export function sanitizeInput(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize all string values in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

/**
 * Validate date of birth format (DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY)
 */
export function validateDOB(value: string): ValidationResult {
  if (isEmpty(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.required('Date of birth') };
  }

  // Basic format check - accepts /, -, or . as separators
  const dobRegex = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/;
  if (!dobRegex.test(value)) {
    return { isValid: false, error: 'Please enter DOB in DD/MM/YYYY format' };
  }

  // Split using the separator that was used
  const separator = value.match(/[\/\-\.]/)?.[0] || '/';
  const [day, month, year] = value.split(separator).map(Number);

  // Validate ranges
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Invalid month in date of birth' };
  }

  if (day < 1 || day > 31) {
    return { isValid: false, error: 'Invalid day in date of birth' };
  }

  if (year < 1900 || year > new Date().getFullYear()) {
    return { isValid: false, error: 'Invalid year in date of birth' };
  }

  return { isValid: true };
}

// ============================================================================
// Real-time Validation Helpers
// ============================================================================

/**
 * Get validation state for an input field
 */
export function getInputValidationState(
  value: string,
  rules: ValidationRule[]
): 'valid' | 'invalid' | 'default' {
  if (value === '') return 'default';
  
  const result = validateField(value, 'Field', rules);
  return result.isValid ? 'valid' : 'invalid';
}

/**
 * Debounced validation for real-time input
 */
export function createDebouncedValidator(
  validator: (value: string) => ValidationResult,
  delay: number = 300
): (value: string) => ValidationResult {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (value: string): ValidationResult => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (value === '') {
      return { isValid: true };
    }

    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        const result = validator(value);
        resolve(result);
      }, delay);
    }) as unknown as ValidationResult;
  };
}

// ============================================================================
// Export all utilities
// ============================================================================

export default {
  // Core functions
  isEmpty,
  validateRequired,
  validateEmail,
  validatePhone,
  validateMinLength,
  validateMaxLength,
  validatePattern,
  validateCustom,

  // Composite
  validateField,
  validateForm,

  // Form-specific
  validateOrderForm,
  validateProfileForm,
  validateCartForCheckout,

  // Sanitization
  sanitizeInput,
  sanitizeObject,
  formatPhoneNumber,
  validateDOB,

  // Real-time helpers
  getInputValidationState,
  createDebouncedValidator,
};

