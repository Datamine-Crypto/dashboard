import { createTheme } from '@mui/material/styles';

const palette = {
	highlight: '#0FF',
	background: '#272936',
	secondaryBackground: '#202336'
}
const classes = {
	palette
}

const muiTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			// light: will be calculated from palette.primary.main,
			main: '#262b4a',
			contrastText: '#fff',


			// dark: will be calculated from palette.primary.main,
			// contrastText: will be calculated to contrast with palette.primary.main
		},
		secondary: {
			main: '#00FFFF',
			// dark: will be calculated from palette.secondary.main,
			contrastText: '#fff',
		},
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
					fontWeight: 400
				}
			}
		},
		MuiBackdrop: {
			styleOverrides: {
				root: {
					backgroundColor: 'rgba(0, 0, 0, 0.50)'
				}
			}
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundColor: classes.palette.background,
					'--Paper-overlay': 'none !important' // Overrides the extra overlay on top of all the papers (which adds extra bright color)
				}
			}
		},

		MuiFormLabel: {
			styleOverrides: {
				root: {
					'&.Mui-focused': {
						color: '#0FF'
					}
				}
			}
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					'&$focused $notchedOutline': {
						borderColor: '#0FF',
						borderWidth: 1,
					},
				}
			}
		},
	}

});
export type DatamineTheme = typeof muiTheme


/**
 * This is a theme only for making buttons white
 * @todo remove this theme completely and fix the buttons properly so we don't have two themes
 * This is only used for <Button variant="text"
 */
const muiWhiteButtonsTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#fff',
			contrastText: '#fff',
		},
	},
});

const muiTealButtonsTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#fff',
			contrastText: '#0ff',
		},
		secondary: {
			main: '#00FFFF',
			// dark: will be calculated from palette.secondary.main,
			contrastText: '#fff',
		},
	},
});

const theme = {
	muiTheme,
	classes
}

export { muiTealButtonsTheme, muiWhiteButtonsTheme, theme };

