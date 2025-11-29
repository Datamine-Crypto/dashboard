import { Box, CardMedia, Link } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { getEcosystemConfig } from '@/app/configs/config';
import metamaskIcon from '@/react/svgs/metamask.svg';
import { DialogType } from '@/app/interfaces';
import { addToMetamask } from '@/web3/utils/web3Helpers';
import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import { commonLanguage } from '@/app/state/commonLanguage';
import LightTooltip from '@/react/elements/LightTooltip';
import { useShallow } from 'zustand/react/shallow';

const AddToFirefoxFragment: React.FC = () => {
	const { ecosystem } = useAppStore(
		useShallow((state) => ({
			ecosystem: state.ecosystem,
		}))
	);

	const { mintableTokenShortName, lockableTokenShortName, navigation } = getEcosystemConfig(ecosystem);
	const { isHelpPageEnabled } = navigation;

	const handleAddToMetamask = (e: React.MouseEvent) => {
		e.preventDefault();
		try {
			addToMetamask(ecosystem);
			appDispatch({
				type: commonLanguage.commands.Dialog.Show,
				payload: {
					dialog: DialogType.TitleMessage,
					dialogParams: {
						title: 'Continue In Metamask...',
						message: (
							<>
								To display {lockableTokenShortName} &amp; {mintableTokenShortName} balances in Metamask, click Add
								Tokens in Metamask window/popup to add our tokens to your Metamask as in the example below:
								<Box mt={3}>
									<Grid container alignItems="center" justifyContent="center" alignContent="center">
										<Grid>
											<CardMedia component="img" image="./images/addTokens.png" style={{ maxWidth: 343 }} />
										</Grid>
									</Grid>
								</Box>
							</>
						),
					},
				},
			});
		} catch (err) {
			// Silently fail if adding tokens fails
		}
		return false;
	};

	const addTokensToMetamaskLink = isHelpPageEnabled ? '#help/onboarding/addTokensToMetamask' : '#';

	return (
		<LightTooltip
			title={`Click to display ${lockableTokenShortName} & ${mintableTokenShortName} token balances in Metamask assets list.`}
		>
			<Link
				href={addTokensToMetamaskLink}
				target="_blank"
				rel="noopener noreferrer"
				onClick={handleAddToMetamask}
				color="textSecondary"
			>
				<img src={metamaskIcon} alt="Metamask" width="24" height="24" style={{ verticalAlign: 'middle' }} /> Add Tokens
				To Metamask
			</Link>
		</LightTooltip>
	);
};

export default AddToFirefoxFragment;
