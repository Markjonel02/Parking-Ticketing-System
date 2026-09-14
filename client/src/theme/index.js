// client/src/theme/index.js
/**
 * Chakra UI inspired Design Token System
 * Provides color schemes, typography, spacing, component variants, and interactive states.
 */

export const theme = {
  colors: {
    brand: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A'
    },
    teal: {
      50: '#F0FDFA',
      100: '#CCFBF1',
      500: '#14B8A6',
      600: '#0D9488',
      700: '#0F766E'
    },
    red: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C'
    },
    amber: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309'
    },
    purple: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      500: '#A855F7',
      600: '#9333EA',
      700: '#7E22CE'
    },
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A'
    }
  },
  radii: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
  }
};

/**
 * Chakra button style generator
 */
export function getButtonClasses({
  colorScheme = 'brand',
  variant = 'solid',
  size = 'md',
  isDisabled = false,
  isLoading = false
}) {
  const sizeMap = {
    xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-md min-h-[28px]',
    sm: 'px-3 py-1.5 text-sm gap-2 rounded-md min-h-[34px]',
    md: 'px-4 py-2 text-sm font-medium gap-2 rounded-lg min-h-[40px]',
    lg: 'px-5 py-2.5 text-base font-medium gap-2.5 rounded-lg min-h-[46px]'
  };

  const schemeColors = {
    brand: {
      solid: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
      ghost: 'text-blue-600 hover:bg-blue-50 active:bg-blue-100',
      subtle: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
    },
    red: {
      solid: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
      outline: 'border border-red-600 text-red-600 hover:bg-red-50 active:bg-red-100',
      ghost: 'text-red-600 hover:bg-red-50 active:bg-red-100',
      subtle: 'bg-red-50 text-red-700 hover:bg-red-100'
    },
    teal: {
      solid: 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 shadow-sm',
      outline: 'border border-teal-600 text-teal-600 hover:bg-teal-50 active:bg-teal-100',
      ghost: 'text-teal-600 hover:bg-teal-50 active:bg-teal-100',
      subtle: 'bg-teal-50 text-teal-700 hover:bg-teal-100'
    },
    gray: {
      solid: 'bg-slate-800 text-white hover:bg-slate-900 active:bg-slate-950 shadow-sm',
      outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100 active:bg-slate-200',
      ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
      subtle: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    }
  };

  const currentScheme = schemeColors[colorScheme] || schemeColors.brand;
  const currentVariant = currentScheme[variant] || currentScheme.solid;
  const currentSize = sizeMap[size] || sizeMap.md;

  const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer';
  const disabled = isDisabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return `${base} ${currentSize} ${currentVariant} ${disabled}`;
}

/**
 * Chakra badge style generator
 */
export function getBadgeClasses({ colorScheme = 'gray', variant = 'subtle', size = 'md' }) {
  const sizeMap = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-0.5 text-xs font-semibold',
    lg: 'px-3 py-1 text-sm font-semibold'
  };

  const schemes = {
    blue: {
      solid: 'bg-blue-600 text-white',
      subtle: 'bg-blue-50 text-blue-700 border border-blue-200',
      outline: 'border border-blue-500 text-blue-600'
    },
    teal: {
      solid: 'bg-teal-600 text-white',
      subtle: 'bg-teal-50 text-teal-700 border border-teal-200',
      outline: 'border border-teal-500 text-teal-600'
    },
    red: {
      solid: 'bg-red-600 text-white',
      subtle: 'bg-red-50 text-red-700 border border-red-200',
      outline: 'border border-red-500 text-red-600'
    },
    yellow: {
      solid: 'bg-amber-500 text-white',
      subtle: 'bg-amber-50 text-amber-800 border border-amber-200',
      outline: 'border border-amber-500 text-amber-700'
    },
    purple: {
      solid: 'bg-purple-600 text-white',
      subtle: 'bg-purple-50 text-purple-700 border border-purple-200',
      outline: 'border border-purple-500 text-purple-600'
    },
    gray: {
      solid: 'bg-slate-600 text-white',
      subtle: 'bg-slate-100 text-slate-700 border border-slate-200',
      outline: 'border border-slate-400 text-slate-600'
    }
  };

  const scheme = schemes[colorScheme] || schemes.gray;
  const variantClass = scheme[variant] || scheme.subtle;
  const sizeClass = sizeMap[size] || sizeMap.md;

  return `inline-flex items-center rounded-full tracking-wide uppercase ${sizeClass} ${variantClass}`;
}
