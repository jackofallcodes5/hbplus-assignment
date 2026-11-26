import { test } from 'node:test';
import assert from 'node:assert';
import { validateEmailDomain, extractDomain } from './domainValidator.js';
import { RESTRICTED_DOMAIN_ERROR_MESSAGE } from '../config.js';

// Dynamic test domain read from env or test fixture
const TEST_ALLOWED_DOMAIN = process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || 'hbplus.fit';

test('Domain Validator - allows official configured domain', () => {
  const result = validateEmailDomain(`employee@${TEST_ALLOWED_DOMAIN}`, TEST_ALLOWED_DOMAIN);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.error, null);
  assert.strictEqual(result.domain, TEST_ALLOWED_DOMAIN);
});

test('Domain Validator - handles uppercase and whitespace in email', () => {
  const result = validateEmailDomain(`  DOCTOR@${TEST_ALLOWED_DOMAIN.toUpperCase()}  `, TEST_ALLOWED_DOMAIN);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.error, null);
  assert.strictEqual(result.domain, TEST_ALLOWED_DOMAIN);
});

test('Domain Validator - rejects gmail.com with required exact error message', () => {
  const result = validateEmailDomain('example@gmail.com', TEST_ALLOWED_DOMAIN);
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.error, RESTRICTED_DOMAIN_ERROR_MESSAGE);
  assert.strictEqual(result.domain, 'gmail.com');
});

test('Domain Validator - rejects yahoo.com and other public domains', () => {
  const publicDomains = ['yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
  for (const domain of publicDomains) {
    const result = validateEmailDomain(`user@${domain}`, TEST_ALLOWED_DOMAIN);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.error, RESTRICTED_DOMAIN_ERROR_MESSAGE);
    assert.strictEqual(result.domain, domain);
  }
});

test('Domain Validator - rejects domain spoofing attempts', () => {
  const spoofAttempts = [
    `user@fake-${TEST_ALLOWED_DOMAIN}`,
    `user@${TEST_ALLOWED_DOMAIN}.attacker.com`,
    `user@attacker.com/${TEST_ALLOWED_DOMAIN}`,
    `user@not${TEST_ALLOWED_DOMAIN}`,
  ];
  for (const spoof of spoofAttempts) {
    const result = validateEmailDomain(spoof, TEST_ALLOWED_DOMAIN);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.error, RESTRICTED_DOMAIN_ERROR_MESSAGE);
  }
});

test('Domain Validator - rejects malformed emails', () => {
  const badEmails = ['', '   ', 'not-an-email', '@domain.com', 'user@', 'user@@domain.com'];
  for (const email of badEmails) {
    const result = validateEmailDomain(email, TEST_ALLOWED_DOMAIN);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.error !== null);
  }
});

test('Extract Domain - correctly extracts domain part', () => {
  assert.strictEqual(extractDomain('alice@example.com'), 'example.com');
  assert.strictEqual(extractDomain(`bob@${TEST_ALLOWED_DOMAIN}`), TEST_ALLOWED_DOMAIN);
  assert.strictEqual(extractDomain('invalid-email'), '');
  assert.strictEqual(extractDomain(''), '');
});
