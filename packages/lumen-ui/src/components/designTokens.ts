import { cn } from './classNames';

export const radiusTokens = {
  tag: 'rounded-[var(--lumen-radius-tag)]',
  control: 'rounded-[var(--lumen-radius-control)]',
  button: 'rounded-[var(--lumen-radius-control)]',
  icon: 'rounded-[var(--lumen-radius-icon)]',
  card: 'rounded-[var(--lumen-radius-card)]',
  modal: 'rounded-[var(--lumen-radius-modal)]',
  pill: 'rounded-[var(--lumen-radius-pill)]',
} as const;

export const radiusNormalizationMap = {
  'rounded-[2px]': radiusTokens.tag,
  'rounded-[3px]': radiusTokens.tag,
  'rounded-[10px]': radiusTokens.card,
  'rounded-[11px]': radiusTokens.icon,
  'rounded-[14px]': radiusTokens.card,
  'rounded-[16px]': radiusTokens.card,
  'rounded-[20px]': radiusTokens.modal,
  'rounded-[22px]': radiusTokens.modal,
  'rounded-[24px]': radiusTokens.modal,
  'rounded-xl': radiusTokens.card,
  'rounded-2xl': radiusTokens.modal,
} as const;

export const buttonSizeTokens = {
  sm: 'h-[var(--lumen-control-height-sm)] px-3 text-[12px]',
  md: 'h-[34px] px-3.5 text-[13px]',
  lg: 'h-[var(--lumen-control-height-lg)] px-5 text-[14px]',
} as const;

export const buttonIconSizeTokens = {
  sm: 'h-8 w-8',
  md: 'h-[34px] w-[34px]',
  lg: 'h-10 w-10',
} as const;

export const buttonVariantTokens = {
  primary: 'border border-transparent bg-[var(--lumen-color-primary)] text-[var(--lumen-color-on-primary)] shadow-sm shadow-[var(--lumen-color-primary)]/20 hover:bg-[var(--lumen-color-primary-hover)]',
  secondary: 'border border-transparent bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary)] hover:bg-[var(--lumen-color-primary-soft-hover)]',
  accent: 'border border-[var(--lumen-color-info-border)] bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary-hover)] hover:border-[var(--lumen-color-info-border)] hover:bg-[var(--lumen-color-primary-soft-hover)]',
  outline: 'border border-[var(--lumen-color-border-strong)] bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text-secondary)] hover:border-[var(--lumen-color-info-border)] hover:bg-[var(--lumen-color-surface-hover)] hover:text-[var(--lumen-color-primary)]',
  ghost: 'border border-transparent bg-transparent text-[var(--lumen-color-text-muted)] hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-text)]',
  destructive: 'border border-transparent bg-[var(--lumen-color-danger)] text-[var(--lumen-color-on-primary)] shadow-sm shadow-[var(--lumen-color-danger)]/20 hover:bg-[var(--lumen-color-danger-hover)]',
} as const;

export type ButtonVariant = keyof typeof buttonVariantTokens;
export type ButtonSize = keyof typeof buttonSizeTokens;

const buttonBase =
  'inline-flex shrink-0 items-center justify-center gap-1.5 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50';

export const getButtonClassNames = ({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  className?: string;
}) =>
  cn(
    buttonBase,
    radiusTokens.button,
    buttonVariantTokens[variant],
    iconOnly ? buttonIconSizeTokens[size] : buttonSizeTokens[size],
    className,
  );

export const rawButtonPresets = {
  iconSm: getButtonClassNames({ variant: 'ghost', size: 'sm', iconOnly: true }),
  iconMd: getButtonClassNames({ variant: 'ghost', size: 'md', iconOnly: true }),
  outlineSm: getButtonClassNames({ variant: 'outline', size: 'sm' }),
  outlineMd: getButtonClassNames({ variant: 'outline', size: 'md' }),
  subtleSm: getButtonClassNames({ variant: 'secondary', size: 'sm' }),
  dangerSm: getButtonClassNames({ variant: 'destructive', size: 'sm' }),
  segment:
    'inline-flex items-center justify-center h-[32px] px-3 text-[12px] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 rounded-[6px] border border-transparent text-[var(--lumen-color-text-muted)] hover:bg-[var(--lumen-color-surface)] hover:text-[var(--lumen-color-text)]',
  pagination:
    'inline-flex items-center justify-center h-8 min-w-8 px-2 text-[12px] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 rounded-[6px] text-[var(--lumen-color-text-muted)] hover:bg-[var(--lumen-color-primary-soft)] hover:text-[var(--lumen-color-primary)]',
  dashedUpload:
    'inline-flex items-center justify-center gap-1.5 h-[36px] px-4 text-[12px] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 rounded-[6px] border border-dashed border-[var(--lumen-color-border-hover)] bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text-muted)] hover:border-[var(--lumen-color-info-border)] hover:bg-[var(--lumen-color-surface-hover)] hover:text-[var(--lumen-color-primary)]',
} as const;

export const headerActionButtonClassNames = {
  primary:
    'group relative isolate inline-flex h-[38px] items-center justify-center gap-1.5 overflow-hidden rounded-[8px] border border-[var(--lumen-color-primary-hover)] bg-[var(--lumen-color-primary)] px-4 text-[13px] font-medium tracking-[0.01em] text-[var(--lumen-color-on-primary)] shadow-[0_8px_18px_var(--lumen-color-focus-ring)] transition-all duration-200 hover:-translate-y-[1px] hover:border-[var(--lumen-color-primary-active)] hover:bg-[var(--lumen-color-primary-hover)] hover:shadow-[0_12px_24px_var(--lumen-color-focus-ring)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50',
  outline:
    'group relative isolate inline-flex h-[38px] items-center justify-center gap-1.5 overflow-hidden rounded-[8px] border border-[var(--lumen-color-border-strong)] bg-[var(--lumen-color-surface-glass)] px-4 text-[13px] font-medium tracking-[0.01em] text-[var(--lumen-color-text-secondary)] shadow-[0_6px_14px_var(--lumen-color-shadow)] transition-all duration-200 hover:-translate-y-[1px] hover:border-[var(--lumen-color-border-hover)] hover:bg-[var(--lumen-color-surface-glass)] hover:text-[var(--lumen-color-primary-active)] hover:shadow-[0_10px_20px_var(--lumen-color-shadow)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50',
} as const;

export const headerActionButtonSurfaceClassNames = {
  primary:
    'pointer-events-none absolute inset-[1px] rounded-[7px] bg-[radial-gradient(circle_at_50%_0%,var(--lumen-color-surface-glass),transparent_52%),linear-gradient(180deg,var(--lumen-color-surface-glass),transparent_54%)]',
  outline:
    'pointer-events-none absolute inset-[1px] rounded-[7px] bg-[linear-gradient(180deg,var(--lumen-color-surface-glass),var(--lumen-color-surface-glass))]',
} as const;

export const tabContainerClassNames =
  'rounded-[18px] border border-[var(--lumen-color-surface)]/70 bg-[var(--lumen-color-surface)]/92 p-4 shadow-[0_12px_36px_var(--lumen-color-shadow)]';

export const tabVariantClassNames = {
  default: {
    container: 'bg-[var(--lumen-color-surface)] px-1',
    base:
      'group relative inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap px-3 py-3 text-[13px] font-medium transition-colors duration-200 after:absolute after:bottom-[-1px] after:left-2 after:right-2 after:h-[2px] after:origin-center after:scale-x-0 after:rounded-full after:bg-[var(--lumen-color-primary)] after:opacity-0 after:transition-all after:duration-150 after:ease-out',
    active:
      'text-[var(--lumen-color-primary)] after:scale-x-100 after:opacity-100',
    inactive:
      'text-[var(--lumen-color-text-muted)] hover:text-[var(--lumen-color-primary)]',
    iconBase: '',
    iconActive: 'text-[var(--lumen-color-primary)]',
    iconInactive: 'text-[var(--lumen-color-text-placeholder)] group-hover:text-[var(--lumen-color-primary)]',
    badgeBase:
      'inline-flex min-w-[24px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition-all',
    badgeActive: 'bg-[var(--lumen-color-primary-soft-hover)] text-[var(--lumen-color-primary)]',
    badgeInactive: 'bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text-muted)]',
  },
  pill: {
    container:
      'rounded-[16px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-subtle)] px-5 py-4 shadow-[0_6px_18px_var(--lumen-color-shadow)]',
    base:
      'group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] transition-all',
    active:
      'border-[var(--lumen-color-primary)] bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary)]',
    inactive:
      'border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text-muted)] hover:border-[var(--lumen-color-border-hover)] hover:text-[var(--lumen-color-primary)]',
    iconBase: '',
    iconActive: '',
    iconInactive: '',
    badgeBase:
      'inline-flex min-w-[28px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all',
    badgeActive: 'bg-[var(--lumen-color-surface)] text-[var(--lumen-color-primary)]',
    badgeInactive: 'bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text-muted)]',
  },
  card: {
    container:
      'rounded-[12px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] px-4 py-4 shadow-sm',
    base:
      'group inline-flex min-h-[46px] items-center gap-2.5 rounded-[8px] border px-4 py-2 text-[14px] font-medium tracking-[0.01em] transition-all duration-200',
    active:
      'border-[var(--lumen-color-info-border)] bg-[linear-gradient(180deg,var(--lumen-color-info-soft)_0%,var(--lumen-color-surface)_100%)] text-[var(--lumen-color-primary-active)] shadow-[0_8px_18px_var(--lumen-color-focus-ring)]',
    inactive:
      'border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-subtle)] text-[var(--lumen-color-text-muted)] hover:border-[var(--lumen-color-info-border)] hover:bg-[var(--lumen-color-surface)] hover:text-[var(--lumen-color-primary-active)]',
    iconBase:
      'inline-flex h-7 w-7 items-center justify-center rounded-[6px] border transition-colors duration-200',
    iconActive:
      'border-[var(--lumen-color-info-border)] bg-[var(--lumen-color-primary-soft-hover)] text-[var(--lumen-color-primary)]',
    iconInactive:
      'border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text-placeholder)] group-hover:border-[var(--lumen-color-info-border)] group-hover:text-[var(--lumen-color-primary)]',
    badgeBase:
      'inline-flex min-w-[30px] items-center justify-center rounded-[6px] px-2 py-0.5 text-[12px] font-semibold transition-all duration-200',
    badgeActive:
      'bg-[var(--lumen-color-primary)] text-[var(--lumen-color-on-primary)] shadow-[0_6px_12px_var(--lumen-color-focus-ring)]',
    badgeInactive:
      'bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text-muted)]',
  },
} as const;

export const tabClassNames = {
  base:
    'inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-medium transition-all duration-200',
  active:
    'bg-[var(--lumen-color-primary)] text-[var(--lumen-color-on-primary)] shadow-[0_10px_20px_var(--lumen-color-focus-ring)]',
  inactive:
    'bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text-muted)] hover:bg-[var(--lumen-color-info-soft)] hover:text-[var(--lumen-color-primary)]',
} as const;

export const tabBadgeClassNames = {
  base: 'rounded-full px-2 py-0.5 text-[11px] font-semibold',
  active: 'bg-[var(--lumen-color-surface)]/20 text-[var(--lumen-color-on-primary)]',
  inactive: 'bg-[var(--lumen-color-surface)] text-[var(--lumen-color-primary)]',
} as const;

export const statCardToneClassNames = {
  blue: 'border-[var(--lumen-color-info-border)] bg-[linear-gradient(180deg,var(--lumen-color-surface)_0%,var(--lumen-color-info-soft)_100%)]',
  emerald: 'border-[var(--lumen-color-success-border)] bg-[linear-gradient(180deg,var(--lumen-color-surface)_0%,var(--lumen-color-success-soft)_100%)]',
  amber: 'border-[var(--lumen-color-warning-border)] bg-[linear-gradient(180deg,var(--lumen-color-surface)_0%,var(--lumen-color-warning-soft)_100%)]',
  slate: 'border-[var(--lumen-color-border)] bg-[linear-gradient(180deg,var(--lumen-color-surface)_0%,var(--lumen-color-surface-muted)_100%)]',
} as const;

export const semanticBadgeToneClassNames = {
  neutral: 'bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text-secondary)]',
  info: 'bg-[var(--lumen-color-primary-soft-hover)] text-[var(--lumen-color-primary-hover)]',
  success: 'bg-[var(--lumen-color-success-soft)] text-[var(--lumen-color-success-text)]',
  warning: 'bg-[var(--lumen-color-warning-soft)] text-[var(--lumen-color-warning-text)]',
  danger: 'bg-[var(--lumen-color-danger-soft)] text-[var(--lumen-color-danger-text)]',
} as const;

export const semanticSurfaceToneClassNames = {
  neutral: 'border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text-secondary)]',
  info: 'border-[var(--lumen-color-info-border)] bg-[var(--lumen-color-info-soft)] text-[var(--lumen-color-primary-hover)]',
  success: 'border-[var(--lumen-color-success-border)] bg-[var(--lumen-color-success-soft)] text-[var(--lumen-color-success-text)]',
  warning: 'border-[var(--lumen-color-warning-border)] bg-[var(--lumen-color-warning-soft)] text-[var(--lumen-color-warning-text)]',
  danger: 'border-[var(--lumen-color-danger-border)] bg-[var(--lumen-color-danger-soft)] text-[var(--lumen-color-danger-text)]',
} as const;

export const selectionPickerClassNames = {
  summary: 'rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] p-3',
  summaryTrail: 'text-[12px] text-[var(--lumen-color-text-muted)]',
  summaryTitle: 'text-[13px] font-medium leading-5 text-[var(--lumen-color-text)]',
  summaryHint: 'text-[12px] text-[var(--lumen-color-text-placeholder)]',
  neutralBadge: 'border-[var(--lumen-color-info-border)] bg-[var(--lumen-color-surface)] text-[var(--lumen-color-primary-hover)]',
  infoBadge: 'border-[var(--lumen-color-info-border)] bg-[var(--lumen-color-primary-soft-hover)] text-[var(--lumen-color-primary-hover)]',
  modalPanel:
    'flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[980px] flex-col overflow-hidden rounded-[12px] bg-[var(--lumen-color-surface)] shadow-[0_18px_60px_var(--lumen-color-shadow)] pad:max-h-[86vh] pad:rounded-[16px] l:rounded-[18px]',
  modalHeader: 'border-[var(--lumen-color-border)]',
  modalTitle: 'text-[16px] font-semibold text-[var(--lumen-color-text-strong)]',
  modalDescription: 'text-[12px] text-[var(--lumen-color-text-muted)]',
  navigation:
    'border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)]',
  navigationTitle: 'text-[12px] font-semibold text-[var(--lumen-color-text-muted)]',
  categoryActive: 'bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary-hover)]',
  categoryInactive: 'text-[var(--lumen-color-text-secondary)] hover:!bg-[var(--lumen-color-info-soft)]',
  subCategoryActive: 'bg-[var(--lumen-color-primary-soft-hover)] text-[var(--lumen-color-primary-hover)]',
  subCategoryInactive: 'text-[var(--lumen-color-text-muted)] hover:!bg-[var(--lumen-color-info-soft)] hover:text-[var(--lumen-color-primary-hover)]',
  mutedText: 'text-[12px] text-[var(--lumen-color-text-placeholder)]',
  loadingIcon: 'text-[var(--lumen-color-primary)]',
  contentTitle: 'text-[14px] font-semibold text-[var(--lumen-color-text)]',
  emptyState:
    'rounded-[8px] border border-dashed border-[var(--lumen-color-info-border)] bg-[var(--lumen-color-surface)] px-4 py-12 text-center text-[13px] text-[var(--lumen-color-text-placeholder)]',
  itemBase:
    '!h-auto w-full items-start justify-start gap-3 rounded-[8px] px-3 py-3 text-left',
  itemActive: 'border-[var(--lumen-color-primary)] bg-[var(--lumen-color-info-soft)] hover:bg-[var(--lumen-color-info-soft)]',
  itemInactive:
    'border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] hover:border-[var(--lumen-color-info-border)] hover:bg-[var(--lumen-color-surface-hover)]',
  itemSequence: 'bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary-hover)]',
  itemText: 'text-[13px] font-normal leading-5 text-[var(--lumen-color-text-secondary)]',
  selectedIcon: 'text-[var(--lumen-color-primary)]',
} as const;
