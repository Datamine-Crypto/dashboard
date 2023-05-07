import React from 'react';
import { Box, makeStyles } from '@material-ui/core';

import { theme } from '../../styles'

import FooterFragment from '../elements/Fragments/FooterFragment';
import Header from '../elements/Fragments/Header';
import { getConfig } from '../../../config';

const HomePage: React.FC = React.memo(() => {
	const { isHomepageVideoVisible } = getConfig()
	return <>
		<Box mt={8}>
			<Header isSubPage={false} isVideoVisible={isHomepageVideoVisible} />
		</Box>

		<FooterFragment />
	</>
})

export default HomePage;