import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmailDomain, extractDomain } from './domainValidator';
import { RESTRICTED_DOMAIN_ERROR_MESSAGE } from './config';

test('Domain Validator - allows official @hbplus.fit domain', () => {
  const result = validateEmailDomain('employee@hbplus.fit');
  assert.equal(result.isValid, true);
  assert.equal(result.domain, 'hbplus.fit');
  assert.equal(result.error, undefined);
});

test('Domain Validator - handles uppercase and whitespace in email', () => {
  const result = validateEmailDomain('  SARAH.CONNOR@HBPLUS.FIT  ');
  assert.equal(result.isValid, true);
  assert.equal(result.domain, 'hbplus.fit');
  assert.equal(result.error, undefined);
});

test('Domain Validator - rejects gmail.com with required error message', () => {
  const result = validateEmailDomain('example@gmail.com');
  assert.equal(result.isValid, false);
  assert.equal(result.domain, 'gmail.com');
  assert.equal(result.error, RESTRICTED_DOMAIN_ERROR_MESSAGE);
  assert.equal(
    result.error,
    'Access restricted. Please login using your official domain email.'
  );
});

test('Domain Validator - rejects yahoo.com and other external domains', () => {
  const result = validateEmailDomain('attacker@yahoo.com');
  assert.equal(result.isValid, false);
  assert.equal(result.domain, 'yahoo.com');
  assert.equal(result.error, RESTRICTED_DOMAIN_ERROR_MESSAGE);
});

test('Domain Validator - rejects domain spoofing attempts', () => {
  // Subdomain attempts
  const res1 = validateEmailDomain('user@hbplus.fit.evil.com');
  assert.equal(res1.isValid, false);

  // Prefix matching attempts
  const res2 = validateEmailDomain('user@fakehbplus.fit');
  assert.equal(res2.isValid, false);

  // Suffix matching attempts
  const res3 = validateEmailDomain('user@hbplus.fit.co');
  assert.equal(res3.isValid, false);
});

test('Domain Validator - rejects malformed emails', () => {
  assert.equal(validateEmailDomain('').isValid, false);
  assert.equal(validateEmailDomain(null as any).isValid, false);
  assert.equal(validateEmailDomain(undefined as any).isValid, false);
  assert.equal(validateEmailDomain('plainaddress').isValid, false);
  assert.equal(validateEmailDomain('a@b@hbplus.fit').isValid, false);
  assert.equal(validateEmailDomain('@hbplus.fit').isValid, false);
});

test('Extract Domain - correctly extracts domain part', () => {
  assert.equal(extractDomain('user@hbplus.fit'), 'hbplus.fit');
  assert.equal(extractDomain('USER@GMAIL.COM'), 'gmail.com');
  assert.equal(extractDomain('invalid'), '');
});
