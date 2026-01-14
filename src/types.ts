/**
 * Column definition for CSV mapping
 */
export interface CsvColumn {
  /** Unique identifier for the column */
  key: string;
  /** Display label for the column */
  label: string;
  /** Whether the column is required */
  required?: boolean;
  /** Custom validation function */
  validate?: (value: string) => true | string;
  /** Whether the column should be selected by default */
  default?: boolean;
}

/**
 * Options for the CSV mapper
 */
export interface CsvMapperOptions {
  /** Array of column definitions */
  columns: CsvColumn[];
  /** Callback when data is submitted */
  onSubmit: (data: Record<string, string>[]) => void;
  /** Optional pool of available fields for dynamic selection */
  availableFields?: CsvColumn[];
}

/**
 * Available theme color names
 */
export type ThemeColor =
  | 'blue' | 'indigo' | 'purple' | 'pink'
  | 'red' | 'orange' | 'amber' | 'yellow'
  | 'lime' | 'green' | 'emerald' | 'teal'
  | 'cyan' | 'sky' | 'slate' | 'gray'
  | 'zinc' | 'neutral' | 'stone';

/**
 * Props for the CsvMapper component
 */
export interface CsvMapperProps extends CsvMapperOptions {
  /** Custom trigger element (optional) */
  trigger?: React.ReactElement;
  /** Container selector (defaults to 'body') */
  container?: string;
  /** Primary theme color - named color or hex code */
  theme?: ThemeColor | string;
  /** Enable dark mode */
  isDark?: boolean;
}

/**
 * Return type for useCsvMapper hook
 */
export interface UseCsvMapperReturn {
  /** Initialize and open the CSV mapper */
  init: () => void;
  /** Destroy the CSV mapper instance */
  destroy: () => void;
}
