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
					backgroundColor: classes.palette.background
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

const theme = {
	muiTheme,
	classes
}

export {
	theme
};

