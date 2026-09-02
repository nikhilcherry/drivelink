import { describe, it, expect } from 'vitest';
import {
  validateName,
  validateNote,
  validateWhyJoin,
  validatePhone,
  parseLink,
  LINK_FIELDS,
} from '../src/lib/applicantValidation';

/**
 * These rules sit in front of a job application, so the expensive failure is
 * a *false rejection* — a real candidate told their own name isn't a name.
 * Most of what follows is therefore "this unusual but real input is accepted",
 * not "this junk is caught".
 */

describe('validateName', () => {
  it.each([
    'Nikhil',
    "O'Brien",
    'Jean-Luc Picard',
    'Ana María de la Cruz',
    'श्रेयस राजशेखर',
    '李伟',
    'Николай',
    'Dr. Harish L',
    'Anne-Marie O’Neill-Smith',
  ])('accepts %s', (name) => {
    expect(validateName(name)).toBeUndefined();
  });

  it.each([
    ['', 'empty'],
    ['A', 'single character'],
    ['Nikhil2', 'digits'],
    ['asdfghjk', 'keyboard run'],
    ['aaaaaaa', 'one repeated character'],
    ['abcabcabcabc', 'repeated unit'],
    ['<script>x</script>', 'markup'],
  ])('rejects %s (%s)', (name) => {
    expect(validateName(name)).toBeTypeOf('string');
  });

  it('rejects a name over the column limit', () => {
    expect(validateName('Ana '.repeat(40))).toBeTypeOf('string');
  });
});

describe('validateNote', () => {
  it('accepts an empty note — the field is optional', () => {
    expect(validateNote('')).toBeUndefined();
    expect(validateNote('   ')).toBeUndefined();
  });

  it('does not judge a note too short to judge fairly', () => {
    expect(validateNote('ok')).toBeUndefined();
  });

  it('rejects long filler', () => {
    expect(validateNote('hehehehehehehehe')).toBeTypeOf('string');
  });

  it('rejects a note over 2000 characters', () => {
    expect(validateNote('a real sentence. '.repeat(200))).toBeTypeOf('string');
  });
});

describe('validateWhyJoin', () => {
  it('is required, unlike the note', () => {
    expect(validateWhyJoin('')).toBeTypeOf('string');
  });

  it('rejects a one-word shrug', () => {
    expect(validateWhyJoin('interesting')).toBeTypeOf('string');
  });

  it('accepts a genuine short answer at the boundary', () => {
    const answer = 'V2V is the part of autonomy nobody has solved yet.';
    expect(answer.length).toBeGreaterThanOrEqual(20);
    expect(validateWhyJoin(answer)).toBeUndefined();
  });

  it('rejects padded filler that clears the length floor', () => {
    expect(validateWhyJoin('abcabcabcabcabcabcabcabc')).toBeTypeOf('string');
  });
});

describe('validatePhone', () => {
  it.each([
    '+91 98765 43210',
    '9876543210',
    '+1 (415) 555-0132',
    '020-7946-0018',
  ])('accepts %s', (phone) => {
    expect(validatePhone(phone)).toBeUndefined();
  });

  it.each([
    ['', 'empty'],
    ['12345', 'too few digits'],
    ['1234567890123456', 'too many digits'],
    ['call me', 'letters'],
    ['+91 98765 43210 ext. 4', 'letters in an extension'],
  ])('rejects %s (%s)', (phone) => {
    expect(validatePhone(phone)).toBeTypeOf('string');
  });
});

describe('parseLink', () => {
  const { github, linkedin, portfolio } = LINK_FIELDS;

  it('returns a null url with no error for a blank field', () => {
    expect(parseLink('', github)).toEqual({ url: null });
  });

  it('expands a bare handle', () => {
    expect(parseLink('nikhilcherry', github).url).toBe('https://github.com/nikhilcherry');
  });

  it('strips a leading @', () => {
    expect(parseLink('@nikhilcherry', github).url).toBe('https://github.com/nikhilcherry');
  });

  it('inserts the LinkedIn /in/ prefix', () => {
    expect(parseLink('hruday', linkedin).url).toBe('https://linkedin.com/in/hruday');
  });

  it('accepts a full URL and keeps it', () => {
    expect(parseLink('https://github.com/nikhilcherry', github).url).toBe('https://github.com/nikhilcherry');
  });

  it('accepts a host-only paste and adds the scheme', () => {
    expect(parseLink('github.com/nikhilcherry', github).url).toBe('https://github.com/nikhilcherry');
  });

  it('accepts a subdomain of the canonical host', () => {
    expect(parseLink('https://gist.github.com/nikhilcherry', github).url).toBeTypeOf('string');
  });

  it('rejects a lookalike domain', () => {
    expect(parseLink('https://github.com.evil.tld/nikhilcherry', github).error).toBeTypeOf('string');
    expect(parseLink('https://notgithub.com/nikhilcherry', github).error).toBeTypeOf('string');
  });

  it('rejects the bare canonical host with no username', () => {
    expect(parseLink('https://github.com', github).error).toBeTypeOf('string');
    expect(parseLink('https://github.com/', github).error).toBeTypeOf('string');
  });

  it('does not turn free text into a plausible handle', () => {
    // The bug this guards: internal spaces were once collapsed, so
    // "random junk here" became https://github.com/randomjunkhere.
    expect(parseLink('random junk here', github).url).toBeNull();
    expect(parseLink('random junk here', github).error).toBeTypeOf('string');
  });

  it('rejects a handle GitHub itself would reject', () => {
    expect(parseLink('-leading-hyphen', github).error).toBeTypeOf('string');
    expect(parseLink('double--hyphen', github).error).toBeTypeOf('string');
    expect(parseLink('a'.repeat(40), github).error).toBeTypeOf('string');
  });

  it('accepts any real hostname for a portfolio', () => {
    expect(parseLink('nikhil.dev', portfolio).url).toBe('https://nikhil.dev/');
    expect(parseLink('https://nikhil.dev/work', portfolio).url).toBe('https://nikhil.dev/work');
  });

  it('rejects a bare word for a portfolio — there is no host to expand it to', () => {
    expect(parseLink('myportfolio', portfolio).error).toBeTypeOf('string');
  });

  it('rejects a hostname with no real TLD', () => {
    expect(parseLink('http://localhost/me', portfolio).error).toBeTypeOf('string');
  });
});
