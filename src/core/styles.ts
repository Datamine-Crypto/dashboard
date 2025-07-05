import { createTheme } from '@mui/material/styles';

/**
 * @file styles.ts
 * @description This file defines the Material-UI theme and custom styles for the Datamine Network Dashboard.
 * It centralizes color palettes, typography, and component overrides to ensure a consistent look and feel
 * across the application.
 */

/**
 * @constant palette
 * @description Defines the core color palette used across the application.
 * These colors are then integrated into the Material-UI theme.
 */
const palette = {
	highlight: '#0FF',
	background: '#272936',
	secondaryBackground: '#202336',
};

/**
 * @constant classes
 * @description A utility object that exposes the defined `palette` for direct use in JSS styles
 * or other styling mechanisms that might need direct access to color values.
 */
const classes = {
	palette,
};

/**
 * @constant muiTheme
 * @description Creates a Material-UI theme instance. This theme is configured with:
 * - A dark mode palette, setting primary, secondary, and text colors.
 * - Custom component style overrides for `MuiButton`, `MuiBackdrop`, `MuiPaper`,
 *   `MuiFormLabel`, and `MuiOutlinedInput` to match the application's design system.
 *   Notably, it overrides the default Paper overlay to ensure consistent background colors.
 */
const muiTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			// light: will be calculated from palette.primary.main,
			main: '#fff',
			contrastText: '#0ff',

			// dark: will be calculated from palette.primary.main,
			// contrastText: will be calculated to contrast with palette.primary.main
		},
		secondary: {
			main: '#00FFFF',
			// dark: will be calculated from palette.secondary.main,
			contrastText: '#fff',
		},
		text: {},
		// Used by `getContrastText()` to maximize the contrast between
		// the background and the text.
		contrastThreshold: 3,
		// Used by the functions below to shift a color's luminance by approximately
		// two indexes within its tonal palette.
		// E.g., shift from Red 500 to Red 300 or Red 700.
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
					backgroundColor: 'rgba(0, 0, 0, 0.50)',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundColor: classes.palette.background,
					'--Paper-overlay': 'none !important', // Overrides the extra overlay on top of all the papers (which adds extra bright color)
				},
			},
		},

		MuiFormLabel: {
			styleOverrides: {
				root: {
					'&.Mui-focused': {
						color: '#0FF',
					},
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					'&$focused $notchedOutline': {
						borderColor: '#0FF',
						borderWidth: 1,
					},
				},
			},
		},
	},
});
export type DatamineTheme = typeof muiTheme;

/**
 * @constant theme
 * @description The main theme object to be exported and used throughout the application.
 * It bundles the Material-UI theme (`muiTheme`) and custom classes (`classes`).
 */
const theme = {
	muiTheme,
	classes,
};

export { theme };
