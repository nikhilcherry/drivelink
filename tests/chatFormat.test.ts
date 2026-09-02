import { describe, it, expect } from 'vitest';
import { formatMessageHtml } from '../src/lib/chatFormat';

/**
 * This function's output is handed to dangerouslySetInnerHTML, and its input
 * is a language model's reply. The escaping is therefore the only thing
 * between a prompt-injected or simply confused model and script execution in
 * a visitor's browser — so most of what follows is adversarial input, not
 * formatting cases.
 */
describe('escaping', () => {
  it('neutralises a script tag', () => {
    const html = formatMessageHtml('<script>alert(1)</script>');
    expect(html).not.toContain('<script');
    expect(html).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes ampersands before angle brackets, so entities cannot be reassembled', () => {
    // Escaping < first would turn "&lt;script&gt;" into "&amp;lt;..." — but
    // escaping & first and then < is what stops "&lt;" in the input from
    // surviving as a live bracket.
    expect(formatMessageHtml('&lt;script&gt;')).toBe('&amp;lt;script&amp;gt;');
  });

  it('cannot inject an attribute into the tags it generates', () => {
    const html = formatMessageHtml('**bold" onmouseover="alert(1)**');
    expect(html).toContain('<strong>');
    expect(html).not.toContain('onmouseover="alert(1)"');
    // The quote survives as text inside the element, not as markup.
    expect(html).toMatch(/<strong>bold" onmouseover="alert\(1\)<\/strong>/);
  });

  it('escapes an img with an onerror handler', () => {
    const html = formatMessageHtml('<img src=x onerror=alert(1)>');
    expect(html).not.toMatch(/<img/);
    expect(html).toContain('&lt;img');
  });
});

describe('links', () => {
  it('renders a same-origin path', () => {
    expect(formatMessageHtml('you can [apply here](/hiring)')).toContain('<a href="/hiring"');
  });

  it.each([
    ['javascript:alert(1)', 'javascript: URL'],
    ['https://evil.example/x', 'absolute URL'],
    ['//evil.example/x', 'protocol-relative URL'],
    ['data:text/html,<script>alert(1)</script>', 'data URL'],
    ['/path" onclick="alert(1)', 'attribute break-out'],
    ['/\\\\evil.example', 'backslash-prefixed path some browsers normalise to //'],
  ])('refuses %s (%s)', (target) => {
    const html = formatMessageHtml(`[click](${target})`);
    expect(html).not.toContain('<a ');
  });

  it('leaves a rejected link as visible text rather than dropping it', () => {
    expect(formatMessageHtml('[click](https://evil.example)')).toContain('click');
  });
});

describe('formatting', () => {
  it('renders bold and inline code', () => {
    const html = formatMessageHtml('**DriveLink** uses `drv-mesh`');
    expect(html).toContain('<strong>DriveLink</strong>');
    expect(html).toContain('<code');
    expect(html).toContain('drv-mesh');
  });

  it('turns newlines into breaks', () => {
    expect(formatMessageHtml('one\ntwo')).toBe('one<br />two');
  });

  it('returns empty string for empty input', () => {
    expect(formatMessageHtml('')).toBe('');
  });

  it('leaves an unclosed marker alone instead of eating the rest of the reply', () => {
    expect(formatMessageHtml('**unclosed bold')).toBe('**unclosed bold');
    expect(formatMessageHtml('`unclosed code')).toBe('`unclosed code');
  });
});
