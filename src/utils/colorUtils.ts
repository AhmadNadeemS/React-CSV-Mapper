/**
 * Predefined color palettes
 */
const COLOR_PALETTES: Record<string, { primary: string; primaryHover: string; primaryLight: string; primaryDark: string }> = {
  blue: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryLight: '#eff6ff',
    primaryDark: '#1e40af',
  },
  indigo: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryLight: '#eef2ff',
    primaryDark: '#4338ca',
  },
  purple: {
    primary: '#a855f7',
    primaryHover: '#9333ea',
    primaryLight: '#faf5ff',
    primaryDark: '#7e22ce',
  },
  pink: {
    primary: '#ec4899',
    primaryHover: '#db2777',
    primaryLight: '#fdf2f8',
    primaryDark: '#be185d',
  },
  red: {
    primary: '#ef4444',
    primaryHover: '#dc2626',
    primaryLight: '#fef2f2',
    primaryDark: '#b91c1c',
  },
  orange: {
    primary: '#f97316',
    primaryHover: '#ea580c',
    primaryLight: '#fff7ed',
    primaryDark: '#c2410c',
  },
  amber: {
    primary: '#f59e0b',
    primaryHover: '#d97706',
    primaryLight: '#fffbeb',
    primaryDark: '#b45309',
  },
  yellow: {
    primary: '#eab308',
    primaryHover: '#ca8a04',
    primaryLight: '#fefce8',
    primaryDark: '#a16207',
  },
  lime: {
    primary: '#84cc16',
    primaryHover: '#65a30d',
    primaryLight: '#f7fee7',
    primaryDark: '#4d7c0f',
  },
  green: {
    primary: '#22c55e',
    primaryHover: '#16a34a',
    primaryLight: '#f0fdf4',
    primaryDark: '#15803d',
  },
  emerald: {
    primary: '#10b981',
    primaryHover: '#059669',
    primaryLight: '#ecfdf5',
    primaryDark: '#047857',
  },
  teal: {
    primary: '#14b8a6',
    primaryHover: '#0d9488',
    primaryLight: '#f0fdfa',
    primaryDark: '#0f766e',
  },
  cyan: {
    primary: '#06b6d4',
    primaryHover: '#0891b2',
    primaryLight: '#ecfeff',
    primaryDark: '#0e7490',
  },
  sky: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    primaryLight: '#f0f9ff',
    primaryDark: '#075985',
  },
  slate: {
    primary: '#64748b',
    primaryHover: '#475569',
    primaryLight: '#f8fafc',
    primaryDark: '#334155',
  },
  gray: {
    primary: '#6b7280',
    primaryHover: '#4b5563',
    primaryLight: '#f9fafb',
    primaryDark: '#374151',
  },
  zinc: {
    primary: '#71717a',
    primaryHover: '#52525b',
    primaryLight: '#fafafa',
    primaryDark: '#3f3f46',
  },
  neutral: {
    primary: '#737373',
    primaryHover: '#525252',
    primaryLight: '#fafafa',
    primaryDark: '#404040',
  },
  stone: {
    primary: '#78716c',
    primaryHover: '#57534e',
    primaryLight: '#fafaf9',
    primaryDark: '#44403c',
  },
};

/**
 * Utility to convert hex to RGBA
 */
export function hexToRgba(hex: string, alpha: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Handle shorthand hex (e.g. #f00)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Utility to adjust color brightness
 * @param hex - Hex color code (e.g., '#6366f1')
 * @param percent - Percentage to lighten (positive) or darken (negative)
 */
export function adjustColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust brightness
  const adjust = (value: number) => {
    const adjusted = value + (value * percent) / 100;
    return Math.min(255, Math.max(0, Math.round(adjusted)));
  };

  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Generate theme colors from a primary color or named palette
 * @param colorOrName - Hex color code (e.g., '#6366f1') or named color (e.g., 'blue', 'indigo')
 */
export function generateThemeColors(colorOrName: string) {
  // Check if it's a named color
  const normalizedName = colorOrName.toLowerCase();
  const palette = COLOR_PALETTES[normalizedName];

  const primary = palette ? palette.primary : colorOrName;

  return {
    primary,
    primaryHover: palette ? palette.primaryHover : adjustColor(primary, -10),
    primaryLight: hexToRgba(primary, 0.1), // Use 10% opacity for primaryLight
    primaryDark: palette ? palette.primaryDark : adjustColor(primary, -20),
  };
}
