import { Box, Container, Link, Paper } from '@mui/material';
import React from 'react';

import { theme as datamineTheme } from '../../styles';

import { getEcosystemConfig as getConfig } from '../../../configs/config';
import { Ecosystem } from '../../../configs/config.common';
import FooterFragment from '../elements/Fragments/FooterFragment';
import Header from '../elements/Fragments/Header';

import { tss } from 'tss-react/mui';
const useStyles = tss.create(({ theme }) => ({
	logoContainer: {
		[theme.breakpoints.down('sm')]: {
			flexGrow: '1',
			textAlign: 'center',
		},
	},
	title: {
		fontSize: '2.8rem',
		'& .MuiGrid-item': {
			display: 'flex',
			alignItems: 'center',
		},

		[theme.breakpoints.down('md')]: {
			fontSize: '2rem',
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.5rem',
			textAlign: 'center',
			'& .MuiGrid-container': {
				justifyContent: 'center',
			},
			marginBottom: theme.spacing(3),
		},
	},
	titleSlogan: {
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
		},
	},
	arrow: {
		color: '#0ff',
		fontSize: '2rem',
		verticalAlign: 'middle',
		[theme.breakpoints.down('md')]: {
			fontSize: '1.5rem',
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1rem',
		},
	},
	paperBorders: {
		borderTop: `1px solid ${datamineTheme.classes.palette.highlight}`,
		borderBottom: `1px solid ${datamineTheme.classes.palette.highlight}`,
	},
	paperBottom: {
		borderTop: `1px solid ${datamineTheme.classes.palette.highlight}`,
	},
}));

interface Props {
	ecosystem: Ecosystem;
}
/**
 * A memoized functional component that displays the MIT License and information about the dashboard build.
 * It retrieves ecosystem-specific configuration details like the dashboard URL and copyright year.
 * @param props - Object containing the current ecosystem.
 */
const Terms: React.FC<Props> = React.memo(({ ecosystem }) => {
	const { classes } = useStyles();
	const { ecosystemName, dashboardAbsoluteUrl, mitCopyrightYear } = getConfig(ecosystem);

	return (
		<>
			<Box mt={8}>
				<Header isSubPage={true} ecosystem={ecosystem} />

				<Paper className={classes.paperBorders}>
					<Box py={6}>
						<Container style={{ lineHeight: '2rem' }}>
							<p>
								You are browsing a build of {ecosystemName} Decentralized Dashboard:{' '}
								<Link href={dashboardAbsoluteUrl} rel="noopener noreferrer" target="_blank" color="secondary">
									{dashboardAbsoluteUrl}
								</Link>
							</p>
							<p>MIT License</p>

							<p>
								Copyright (c) {mitCopyrightYear} {ecosystemName}
							</p>

							<p>
								Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
								associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction,
								including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
								and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
								subject to the following conditions:
							</p>

							<p>
								The above copyright notice and this permission notice shall be included in all copies or substantial
								portions of the Software.
							</p>

							<p>
								THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
								BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
								NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
								OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
								CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
							</p>
						</Container>
					</Box>
				</Paper>
			</Box>

			<FooterFragment ecosystem={ecosystem} />
		</>
	);
});

export default Terms;
