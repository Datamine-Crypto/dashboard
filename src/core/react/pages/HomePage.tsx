import { Box } from '@mui/material';
import React from 'react';

import { getEcosystemConfig } from '../../../configs/config';
import { Ecosystem } from '../../../configs/config.common';
import FooterFragment from '../elements/Fragments/FooterFragment';
import Header from '../elements/Fragments/Header';

interface Props {
	ecosystem: Ecosystem;
}
/**
 * A memoized functional component that renders the Home Page of the dashboard.
 * It includes a Header (with optional video) and a Footer.
 * @param props - Object containing the current ecosystem.
 */
const HomePage: React.FC<Props> = React.memo(({ ecosystem }) => {
	const { isHomepageVideoVisible } = getEcosystemConfig(ecosystem);
	return (
		<>
			<Box mt={8}>
				<Header isSubPage={false} isVideoVisible={isHomepageVideoVisible} ecosystem={ecosystem} />
			</Box>

			<FooterFragment ecosystem={ecosystem} />
		</>
	);
});

export default HomePage;
