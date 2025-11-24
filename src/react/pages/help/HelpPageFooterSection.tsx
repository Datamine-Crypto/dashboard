import { Box, Container, Link, Typography } from '@mui/material';
import React from 'react';

import { Ecosystem } from '@/app/configs/config.common';
import { getEcosystemConfig } from '@/app/configs/config';

interface HelpPageFooterSectionProps {
	ecosystem: Ecosystem;
}

const HelpPageFooterSection: React.FC<HelpPageFooterSectionProps> = ({ ecosystem }) => {
	const { navigation } = getEcosystemConfig(ecosystem);
	const { discordInviteLink } = navigation;

	const getAdditionalHelpText = () => {
		if (!discordInviteLink) {
			return <>If you need to chat with someone please reach out to our community for assistance.</>;
		}
		return (
			<>
				If you need to chat with someone check out our{' '}
				<Link href={discordInviteLink} target="_blank" rel="noopener noreferrer" color="textSecondary">
					Discord
				</Link>{' '}
				for community assistance.
			</>
		);
	};

	return (
		<Box my={6}>
			<Container>
				<Typography component="div" variant="h6" align="left" color="textSecondary" paragraph>
					<Typography component="div" display="inline" variant="h6" color="textPrimary">
						Still can&apos;t find what you are looking for? {getAdditionalHelpText()}
					</Typography>
				</Typography>
			</Container>
		</Box>
	);
};

export default HelpPageFooterSection;
