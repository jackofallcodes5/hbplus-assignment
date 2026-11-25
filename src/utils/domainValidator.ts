import { APP_CONFIG, RESTRICTED_DOMAIN_ERROR_MESSAGE } from './config';
import { DomainValidationResult } from '../types';

/**
 * Validates whether an email belongs exclusively to the allowed domain.
 * 
 * @param email - The email address to validate
 * @param allowedDomain - Optional override for the allowed domain (defaults to APP_CONFIG.ALLOWED_DOMAIN)
 * @returns DomainValidationResult indicating validity and error if restricted
 */
export function validateEmailDomain(
  email: string | null | undefined,
  allowedDomain: string = APP_CONFIG.ALLOWED_DOMAIN
): DomainValidationResult {
  const normalizedAllowed = allowedDomain.trim().toLowerCase().replace(/^@/, '');

  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      domain: '',
      allowedDomain: normalizedAllowed,
      error: 'Invalid email address provided.',
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const parts = cleanEmail.split('@');

  // Must have exactly one @ separating local and domain parts
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      isValid: false,
      domain: '',
      allowedDomain: normalizedAllowed,
      error: 'Malformed email format.',
    };
  }

  const userDomain = parts[1];

  // Exact domain match verification (prevents subdomains or lookalike domains)
  if (userDomain === normalizedAllowed) {
    return {
      isValid: true,
      domain: userDomain,
      allowedDomain: normalizedAllowed,
    };
  }

  // Domain does not match allowed domain -> Access strictly restricted
  return {
    isValid: false,
    domain: userDomain,
    allowedDomain: normalizedAllowed,
    error: RESTRICTED_DOMAIN_ERROR_MESSAGE,
  };
}

/**
 * Helper to extract domain from email
 */
export function extractDomain(email: string): string {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1]?.toLowerCase().trim() || '';
}
