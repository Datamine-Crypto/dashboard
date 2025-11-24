import { Box } from '@mui/material';
import React from 'react';

import { getEcosystemConfig } from '@/app/configs/config';
import { Ecosystem } from '@/app/configs/config.common';
import FooterFragment from '@/react/elements/Fragments/FooterFragment';
import Header from '@/react/elements/Fragments/Header';

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
