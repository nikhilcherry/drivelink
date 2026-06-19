interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * DriveLink mark — two vehicle nodes (on a faint "road") linking up through a
 * mesh node above them: the V2V / decentralized-backbone idea in one glyph.
 * Uses currentColor so it inherits the badge's color (white on the gradient tile).
 */
export function LogoMark({ size = 20, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* road */}
      <line x1="6" y1="16.5" x2="18" y2="16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
      {/* V2V links up to the mesh node */}
      <path d="M6 16.5 L12 7 L18 16.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* mesh node */}
      <circle cx="12" cy="7" r="2.2" fill="currentColor" />
      {/* vehicle nodes */}
      <circle cx="6" cy="16.5" r="2.7" fill="currentColor" />
      <circle cx="18" cy="16.5" r="2.7" fill="currentColor" />
    </svg>
  );
}
