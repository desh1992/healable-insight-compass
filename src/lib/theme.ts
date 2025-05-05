/**
 * Theme Configuration
 * 
 * Implements the design system principles in practical styling choices.
 * Form follows function - colors and spacing are chosen for clarity and usability.
 * Invisible design - consistent, intuitive spacing and subtle color choices.
 */

export const colors = {
  // Primary colors - used sparingly for key interactive elements
  primary: {
    light: '#a5c0e6',
    main: '#3a72c4',
    dark: '#2851a3',
    contrast: '#ffffff',
  },
  // Secondary colors - used for supporting elements and accents
  secondary: {
    light: '#e9f0f9',
    main: '#90b3e0',
    dark: '#5f87c0',
    contrast: '#000000',
  },
  // Neutral colors - used for most UI elements to create a calm, focused experience
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Functional colors - clear meaning for consistent user understanding
  functional: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  }
};

// Spacing scale - consistent, human-centered spacing for rhythm and harmony
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  xxl: '3rem',   // 48px
};

// Typography - readable, accessible, and hierarchical
export const typography = {
  fontFamily: {
    base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'Courier New', monospace",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '1rem',      // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    xxl: '1.5rem',   // 24px
    xxxl: '2rem',    // 32px
  },
  lineHeight: {
    compact: 1.2,
    default: 1.5,
    relaxed: 1.75,
  },
};

// Shadows - subtle, functional depth cues
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

// Border radius - consistent rounding for a friendly, approachable UI
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  md: '0.25rem',  // 4px
  lg: '0.5rem',   // 8px
  full: '9999px',
};

// Motion - intentional, helpful animations that guide the user
export const motion = {
  duration: {
    fast: '150ms',
    medium: '300ms',
    slow: '500ms',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Breakpoints - responsive design for all devices
export const breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px',
}; 