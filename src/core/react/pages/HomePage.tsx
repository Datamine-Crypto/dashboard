import React from 'react';
import { Box, makeStyles } from '@material-ui/core';

import { theme } from '../../styles'

import FooterFragment from '../elements/Fragments/FooterFragment';
import Header from '../elements/Fragments/Header';

const useStyles = makeStyles(() => ({
	logoContainer: {
		[theme.muiTheme.breakpoints.down('sm')]: {
			flexGrow: '1',
			textAlign: 'center'
		},
	},
	title: {
		fontSize: '2.8rem',
		'& .MuiGrid-item': {
			display: 'flex',
			alignItems: 'center'
		},

		[theme.muiTheme.breakpoints.down('md')]: {
			fontSize: '2rem',
		},
		[theme.muiTheme.breakpoints.down('sm')]: {
			fontSize: '1.5rem',
			textAlign: 'center',
			'& .MuiGrid-container': {
				justifyContent: 'center'
			},
			marginBottom: theme.muiTheme.spacing(3)
		},
	},
	titleSlogan: {
		[theme.muiTheme.breakpoints.down('sm')]: {
			textAlign: 'center',
		}
	},
	arrow: {
		color: '#0ff',
		fontSize: '2rem',
		verticalAlign: 'middle',
		[theme.muiTheme.breakpoints.down('md')]: {
			fontSize: '1.5rem',
		},
		[theme.muiTheme.breakpoints.down('sm')]: {
			fontSize: '1rem',
		},
	},
	heroContent: {
	},
	cardHeader: {
		border: `1px solid ${theme.classes.palette.highlight}`,
		color: theme.muiTheme.palette.secondary.contrastText
	},
	cardPricing: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'baseline',
		marginBottom: theme.muiTheme.spacing(2),
	},
	paperBorders: {
		borderTop: `1px solid ${theme.classes.palette.highlight}`,
		borderBottom: `1px solid ${theme.classes.palette.highlight}`,
	},
	paperBottom: {
		borderTop: `1px solid ${theme.classes.palette.highlight}`,
	},
	comparisonTable: {
		'& .MuiTableCell-head': {
			background: theme.classes.palette.secondaryBackground,
			color: theme.classes.palette.highlight,
			fontSize: '1.3rem'
		},
		'& [role=cell]': {
			color: theme.classes.palette.highlight,
		}
	},
	point: {
		[theme.muiTheme.breakpoints.down('sm')]: {
			textAlign: "center"
		}
	},
	poolDiagram: {
		maxWidth: 800,
		margin: '0 auto',
		display: 'block'
	},
	ecosystemDiagram: {
		maxWidth: 1000,
		margin: '0 auto',
		display: 'block'
	},
	featurePoint: {
		marginBottom: 0
	}
}));

const HomePage: React.FC = React.memo(() => {
	return <>
		<Box mt={8}>
			<Header isSubPage={false} isVideoVisible={true} />
		</Box>

		<FooterFragment />
	</>
})

export default HomePage;