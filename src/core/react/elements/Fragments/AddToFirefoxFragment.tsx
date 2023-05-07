import { Box, CardMedia, Grid, Link } from '@material-ui/core';
import React, { useContext } from 'react';

import metamaskIcon from '../../../../svgs/metamask.svg';
import { DialogType } from '../../../interfaces';
import { addToMetamask } from '../../../web3/helpers';
import { Web3Context } from '../../../web3/Web3Context';
import { commonLanguage, ConnectionMethod } from '../../../web3/web3Reducer';
import LightTooltip from '../LightTooltip';

interface RenderParams {
	dispatch: React.Dispatch<any>;
	connectionMethod: ConnectionMethod;
	isArbitrumMainnet: boolean;
}
const Render: React.FC<RenderParams> = React.memo(({ dispatch, connectionMethod, isArbitrumMainnet }) => {
	// Hide "Add To Metamask" button if we're not connected to MetaMask
	if (connectionMethod === ConnectionMethod.WalletConnect) {
		return null;
	}

	const handleAddToMetamask = (e: React.MouseEvent) => {
		e.preventDefault();

		try {
			addToMetamask(isArbitrumMainnet);
			dispatch({
				type: commonLanguage.commands.ShowDialog, payload: {
					dialog: DialogType.TitleMessage, dialogParams: {
						title: 'Continue In Metamask...', message: <>
							To display {isArbitrumMainnet ? 'FLUX (L2)' : 'DAM'} &amp; {isArbitrumMainnet ? 'Arbi' : ''}FLUX balances in Metamask, click Add Tokens in Metamask window/popup to add our tokens to your Metamask as in the example below:
							<Box mt={3}>
								<Grid container alignItems="center" justify="center" alignContent="center">
									<Grid item>
										<CardMedia component="img" image="./images/addTokens.png" style={{ maxWidth: 343 }} />
									</Grid>
								</Grid>
							</Box>
						</>
					}
				}
			})
		} catch (err) {

		}
		return false;
	}
	return <LightTooltip title={`Click to display ${isArbitrumMainnet ? 'FLUX (L2)' : 'Datamine (DAM)'} & ${isArbitrumMainnet ? 'Arbi' : ''}FLUX token balances in Metamask assets list.`}>
		<Link href="https://support.datamine.network/hc/en-us/articles/360049129794-How-to-add-DAM-FLUX-to-MetaMask" target="_blank" rel="noopener noreferrer" onClick={handleAddToMetamask} color="textSecondary">
			<img src={metamaskIcon} alt="Metamask" width="24" height="24" style={{ verticalAlign: 'middle' }} /> Add Tokens To Metamask
		</Link>
	</LightTooltip>
})

interface Props { }

const AddToFirefoxFragment: React.FC<Props> = ({ }) => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const { connectionMethod, isArbitrumMainnet } = web3State;

	return <Render
		dispatch={web3Dispatch}
		connectionMethod={connectionMethod}
		isArbitrumMainnet={isArbitrumMainnet}
	/>
}

export default AddToFirefoxFragment;