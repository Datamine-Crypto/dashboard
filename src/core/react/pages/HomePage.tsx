import React from 'react';
import { Box, makeStyles } from '@material-ui/core';

import { theme } from '../../styles'

import FooterFragment from '../elements/Fragments/FooterFragment';
import Header from '../elements/Fragments/Header';
import { getEcosystemConfig as getConfig, getEcosystemConfig } from '../../../configs/config';
import { Ecosystem } from '../../../configs/config.common';

interface Props {
	ecosystem: Ecosystem;
}
const HomePage: React.FC<Props> = React.memo(({ ecosystem }) => {
	const { isHomepageVideoVisible } = getEcosystemConfig(ecosystem)
	return <>
		<Box mt={8}>
			<Header isSubPage={false} isVideoVisible={isHomepageVideoVisible} ecosystem={ecosystem} />
		</Box>

		<FooterFragment ecosystem={ecosystem} />
	</>
})

export default HomePage;