/**
 * Renders **bold**, `code`, and [label](/path) from a model reply.
 *
 * The output goes through dangerouslySetInnerHTML, so the escaping below is
 * the only thing standing between a model (or a canned string someone edits
 * later) and script injection.
 *
 * It lives here rather than beside the widget so it can be tested directly —
 * and because escaping rules deserve to be read on their own.
 */
export function formatMessageHtml(text: string): string {
  if (!text) return '';
  
  // Replace HTML tag brackets to prevent raw injection
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Replace line breaks
  formatted = formatted.replace(/\n/g, '<br />');

  // Replace bold syntax **text** with strong tags
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Replace inline code syntax `text` with code tags
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-black/5 text-[#0f4c81] px-1 py-0.5 rounded text-xs font-mono">$1</code>');

  // Links: [label](/path). Applied after the escaping above and restricted to
  // same-origin paths, so a canned string can point at a page without turning
  // this into an HTML injection hole.
  //
  // The negative lookahead is load-bearing: without it "//evil.example" and
  // "/\\evil.example" both match, and a protocol-relative URL sends the
  // visitor off-site through a link styled as one of ours. Anything that
  // fails this is left as plain text, not dropped.
  formatted = formatted.replace(
    /\[([^\]]+)\]\((\/(?![/\\])[A-Za-z0-9\-._~/]*)\)/g,
    '<a href="$2" class="text-[#0f4c81] font-semibold underline underline-offset-2">$1</a>',
  );

  return formatted;
}
