import { Box, CardMedia, Link } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { getEcosystemConfig } from '@/core/app/configs/config';
import { Ecosystem } from '@/core/app/configs/config.common';
import metamaskIcon from '@/core/react/svgs/metamask.svg';
import { DialogType } from '@/core/app/interfaces';
import { addToMetamask } from '@/core/web3/utils/web3Helpers';
import { useAppStore, dispatch as appDispatch } from '@/core/react/utils/appStore';
import { commonLanguage } from '@/core/app/state/commonLanguage';
import { ReducerDispatch, ConnectionMethod } from '@/core/app/state/stateInterfaces';
import LightTooltip from '@/core/react/elements/LightTooltip';
import { useShallow } from 'zustand/react/shallow';
interface RenderParams {
	dispatch: ReducerDispatch;
	connectionMethod: ConnectionMethod;
	ecosystem: Ecosystem;
}
const Render: React.FC<RenderParams> = React.memo(({ dispatch, connectionMethod, ecosystem }) => {
	const { mintableTokenShortName, lockableTokenShortName, navigation } = getEcosystemConfig(ecosystem);
	const { isHelpPageEnabled } = navigation;
	// Hide "Add To Metamask" button if we're not connected to MetaMask
	if (connectionMethod === ConnectionMethod.WalletConnect) {
		return null;
	}
	const handleAddToMetamask = (e: React.MouseEvent) => {
		e.preventDefault();
		try {
			addToMetamask(ecosystem);
			dispatch({
				type: commonLanguage.commands.ShowDialog,
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
});
interface Props {}
const AddToFirefoxFragment: React.FC<Props> = () => {
	const { connectionMethod, ecosystem } = useAppStore(
		useShallow((state) => ({
			connectionMethod: state.connectionMethod,
			ecosystem: state.ecosystem,
		}))
	);
	return <Render dispatch={appDispatch} connectionMethod={connectionMethod} ecosystem={ecosystem} />;
};
export default AddToFirefoxFragment;
