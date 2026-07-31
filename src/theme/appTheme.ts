import { createTheme } from '@mui/material/styles';

/**
 * ============================================================================
 * appTheme.ts — THE SINGLE SOURCE OF TRUTH FOR ALL COLORS AND THEME STYLES
 * ============================================================================
 *
 * Per Rule 9 of our code standards (see AGENTS.md):
 *
 *   - Zero color hexes or style literals are permitted inside components.
 *   - Chart code imports its hexes from this file rather than defining its own.
 *   - This file itself uses NAMED COLOR CONSTANTS composed into a semantic
 *     palette, so a color is defined exactly once and described by what it IS
 *     before it is assigned to what it DOES.
 *
 * The two-layer structure matters:
 *
 *   Layer 1 — `colors`:      raw values, named by appearance (CYAN, GRAY_400).
 *   Layer 2 — `appPalette`:  semantic roles, named by purpose (textMuted).
 *
 * Components should import from Layer 2 wherever a semantic role exists, and
 * only reach for Layer 1 for genuinely decorative values (e.g. medal tiers,
 * chart series). Changing the brand color should mean editing ONE constant.
 */

// ============================================================================
// LAYER 1 — Named color constants (raw values, named by appearance)
// ============================================================================

/**
 * Every raw color value used anywhere in the application.
 *
 * Naming follows a lightness scale where a family has multiple shades: a higher
 * number is darker for neutrals (GRAY_700 is darker than GRAY_200), matching the
 * convention most of this palette was originally drawn from.
 *
 * NOTE: `#0FF` and `#00FFFF` are the same color. They were previously used
 * interchangeably across the codebase; both now resolve to `CYAN`.
 */
export const colors = {
	// --- Brand -------------------------------------------------------------
	/** Primary brand accent. The Datamine cyan used for highlights and CTAs. */
	CYAN: '#00FFFF',
	/** Darker cyan, used for hover states on cyan-filled surfaces. */
	CYAN_DARK: '#00CCCC',

	// --- Core neutrals -----------------------------------------------------
	WHITE: '#FFFFFF',
	BLACK: '#000000',

	// --- Gray scale (light to dark) ---------------------------------------
	GRAY_100: '#F3F4F6',
	GRAY_200: '#E5E7EB',
	GRAY_300: '#D1D5DB',
	/** Neutral used for disabled and de-emphasised chrome. */
	GRAY_350: '#BFBFC3',
	GRAY_400: '#9CA3AF',
	GRAY_500: '#6B7280',
	GRAY_600: '#4B5563',
	GRAY_700: '#374151',
	GRAY_900: '#111827',

	// --- Application surfaces (the dark navy family) ----------------------
	/** Default page/card surface. */
	NAVY_800: '#272936',
	/** Recessed surface, used behind the default surface for contrast. */
	NAVY_900: '#202336',
	/** Slightly lifted surface used by some dialogs and inner panels. */
	NAVY_850: '#22242E',
	/** Muted border/divider tone that reads against the navy surfaces. */
	NAVY_600: '#40486C',

	/** Muted teal used for outlined call-to-action borders. */
	TEAL_DARK: '#187A82',
	/** MUI teal, used for the active-gems icon state. */
	TEAL: '#009688',
	/** Neutral dark surface used by call-to-action cards. */
	NEUTRAL_800: '#303030',
	/** Border tone sitting just above the navy surfaces. */
	NAVY_750: '#32333D',
	/** Raised navy used by the drawer background. */
	NAVY_700: '#333851',
	/** Near-black gradient stops used by the stats panel. */
	BLACK_900: '#1A1A1A',
	BLACK_950: '#0D0D0D',

	// --- Accents -----------------------------------------------------------
	GOLD: '#FFD700',
	SILVER: '#C0C0C0',
	BRONZE: '#CD7F32',
	ORANGE: '#FF9B00',
	ORANGE_DARK: '#FF8C00',
	GREEN: '#4ADE80',
	/** Desaturated green used for inline lock/secure icons. */
	GREEN_MUTED: '#3FB57F',
	/** Deep green used as the dark end of success-themed surfaces. */
	GREEN_900: '#064E3B',
	EMERALD: '#10B981',
	BLUE: '#60A5FA',
	BLUE_600: '#3B82F6',
	/** Deep blue used as the dark end of info-themed surfaces. */
	BLUE_900: '#1E3A8A',
	PURPLE: '#A855F7',
	PURPLE_DARK: '#581C87',
	PURPLE_DEEP: '#4C1D95',
	MAGENTA: '#E040FB',
	PINK: '#F472B6',
	PINK_DARK: '#831843',
} as const;

/** Semi-transparent values that cannot be expressed as a plain hex constant. */
export const overlays = {
	/** Backdrop scrim behind modals and dialogs. */
	MODAL_SCRIM: 'rgba(0, 0, 0, 0.50)',
} as const;

// ============================================================================
// LAYER 2 — Semantic palette (roles, named by purpose)
// ============================================================================

/**
 * Semantic color roles. Components should prefer these over raw `colors`,
 * because a role can be re-pointed at a different constant without touching
 * a single component.
 */
export const appPalette = {
	/** Primary brand accent used for highlights, icons and emphasis. */
	highlight: colors.CYAN,
	/** Hover state for surfaces filled with `highlight`. */
	highlightHover: colors.CYAN_DARK,

	/** Default surface color for cards, papers and page background. */
	background: colors.NAVY_800,
	/** Recessed surface, sits behind `background` for layered contrast. */
	secondaryBackground: colors.NAVY_900,
	/** Lifted surface for inner panels and some dialogs. */
	elevatedBackground: colors.NAVY_850,

	/** Highest-contrast body text. */
	textPrimary: colors.WHITE,
	/** Standard body copy on dark surfaces. */
	textSecondary: colors.GRAY_200,
	/** Supporting copy, captions and secondary detail. */
	textMuted: colors.GRAY_400,
	/** De-emphasised or disabled text. */
	textDisabled: colors.GRAY_500,

	/** Standard divider and outline color. */
	border: colors.GRAY_700,
	/** Divider tone tuned for the navy surfaces. */
	borderSubtle: colors.NAVY_600,

	/** Positive/success state. */
	success: colors.GREEN,
	/** Informational state. */
	info: colors.BLUE,
	/** Warning/attention state. */
	warning: colors.ORANGE,
} as const;

/**
 * Ranking tiers used by leaderboards and any other placement display.
 * Kept separate from `appPalette` because these are decorative rather than
 * semantic UI roles.
 */
export const rankTierColors = {
	first: colors.GOLD,
	second: colors.SILVER,
	third: colors.BRONZE,
} as const;

// ============================================================================
// Backwards-compatible palette shape
// ============================================================================

/**
 * The original three-key palette that existing components consume via
 * `theme.classes.palette`. Preserved verbatim so no consumer breaks, but now
 * sourced from the semantic palette above rather than defining its own hexes.
 */
const legacyPalette = {
	highlight: appPalette.highlight,
	background: appPalette.background,
	secondaryBackground: appPalette.secondaryBackground,
};

const classes = {
	palette: legacyPalette,
};

// ============================================================================
// Material-UI theme
// ============================================================================

/**
 * The Material-UI theme instance. Configured with a dark palette and component
 * overrides that match our design system. Every color below is drawn from the
 * constants above — no literals.
 */
const muiTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: colors.WHITE,
			contrastText: colors.CYAN,
		},
		secondary: {
			main: colors.CYAN,
			contrastText: colors.WHITE,
		},
		text: {},
		// Used by `getContrastText()` to maximize contrast between background and text.
		contrastThreshold: 3,
		// Shifts a color's luminance by roughly two indexes within its tonal palette.
		tonalOffset: 0.2,
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					fontWeight: 400,
				},
			},
		},
		MuiBackdrop: {
			styleOverrides: {
				root: {
					backgroundColor: overlays.MODAL_SCRIM,
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundColor: appPalette.background,
					// Removes MUI's extra elevation overlay, which otherwise brightens our surfaces.
					'--Paper-overlay': 'none !important',
				},
			},
		},
		MuiFormLabel: {
			styleOverrides: {
				root: {
					'&.Mui-focused': {
						color: appPalette.highlight,
					},
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					'&$focused $notchedOutline': {
						borderColor: appPalette.highlight,
						borderWidth: 1,
					},
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				// Selected help-article category chips.
				colorPrimary: {
					backgroundColor: appPalette.textPrimary,
					color: colors.BLACK,
				},
				// Unselected help-article category chips.
				colorDefault: {
					backgroundColor: appPalette.background,
					color: appPalette.textPrimary,
				},
			},
		},
	},
});

export type DatamineTheme = typeof muiTheme;

/**
 * Bundled theme object consumed by `ThemeProvider` and by components that need
 * direct palette access.
 */
const theme = {
	muiTheme,
	classes,
};

export { theme, muiTheme, classes };
