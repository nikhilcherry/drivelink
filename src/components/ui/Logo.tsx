interface LogoMarkProps {
  /** Rendered size in px. For `tile` this is the square edge; otherwise it is the height. */
  size?: number;
  /**
   * `tile`  — the app-icon lockup (mark on the brand gradient tile), matching the favicon.
   * `white` — the mark knocked out in white, for dark or brand-colored surfaces.
   * `color` — the full-color mark, for light surfaces.
   */
  variant?: 'tile' | 'white' | 'color';
  className?: string;
  style?: React.CSSProperties;
}

// Source mark is 1206 x 646.
const ASPECT = 1206 / 646;

const SRC: Record<NonNullable<LogoMarkProps['variant']>, string> = {
  tile: '/logo-tile.png',
  white: '/logo-white.png',
  color: '/logo.png',
};

/**
 * DriveLink mark — the "DL" monogram built from a wheel/tread arc and a road
 * that resolves into a forward arrow, linked by two V2V mesh nodes.
 *
 * next.config.js sets `output: 'export'`, so this uses a plain <img>: a static
 * export ships no /_next/image endpoint for <Image> to hit.
 */
export function LogoMark({ size = 20, variant = 'tile', className, style }: LogoMarkProps) {
  const width = variant === 'tile' ? size : Math.round(size * ASPECT);

  return (
    <img
      src={SRC[variant]}
      width={width}
      height={size}
      className={className}
      style={{ display: 'block', ...style }}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
