import { APP_CONFIG, RESTRICTED_DOMAIN_ERROR_MESSAGE } from '../config.js';

/**
 * Validates whether an email belongs to the configured official domain.
 * Strictly adheres to dynamic domain comparison loaded from environment variables.
 *
 * @param {string} email - The email address to validate
 * @param {string} [allowedDomainOverride] - Optional override for testing
 * @returns {{ isValid: boolean, error: string | null, domain: string | null }}
 */
export function validateEmailDomain(email, allowedDomainOverride = null) {
  const allowedDomain = (
    allowedDomainOverride !== null ? allowedDomainOverride : APP_CONFIG.ALLOWED_DOMAIN
  )
    .trim()
    .toLowerCase();

  // 1. Ensure email is a non-empty string
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a valid email address.',
      domain: null,
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  // 2. Validate email structure
  const atIndex = cleanEmail.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === cleanEmail.length - 1) {
    return {
      isValid: false,
      error: 'Please enter a valid email address format.',
      domain: null,
    };
  }

  // 3. Extract the domain part
  const domain = cleanEmail.substring(atIndex + 1);

  // 4. Check if an allowed domain has been configured
  if (!allowedDomain) {
    return {
      isValid: false,
      error: 'Official allowed domain is not configured. Please set EXPO_PUBLIC_ALLOWED_DOMAIN in .env',
      domain,
    };
  }

  // 5. Strict equality check on the domain
  if (domain !== allowedDomain) {
    return {
      isValid: false,
      error: RESTRICTED_DOMAIN_ERROR_MESSAGE,
      domain,
    };
  }

  return {
    isValid: true,
    error: null,
    domain,
  };
}

/**
 * Extracts domain portion of an email.
 * @param {string} email
 * @returns {string}
 */
export function extractDomain(email) {
  if (!email || typeof email !== 'string') return '';
  const atIndex = email.lastIndexOf('@');
  return atIndex !== -1 ? email.substring(atIndex + 1).toLowerCase().trim() : '';
}
