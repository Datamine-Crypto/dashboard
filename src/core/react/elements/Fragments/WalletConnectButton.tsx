import { Box, Button, Divider, Menu, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React, { useContext } from 'react';

import Arbitrum from '../../../../svgs/arbitrum.svg';
import EthereumPurple from '../../../../svgs/ethereumPurple.svg';
import walletconnectIcon from '../../../../svgs/walletconnect.svg';

import { getEcosystemConfig } from '../../../../configs/config';
import { Ecosystem } from '../../../../configs/config.common';
import { Web3Context } from '../../../web3/Web3Context';
import { commonLanguage as web3CommonLanguage } from '../../../web3/web3Reducer';

interface RenderParams {
	dispatch: React.Dispatch<any>;
	ecosystem: Ecosystem;
}
const Render: React.FC<RenderParams> = React.memo(({ dispatch, ecosystem }) => {
	const { isArbitrumOnlyToken } = getEcosystemConfig(ecosystem)

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleClick = (event: React.MouseEvent<any>) => {
		event.preventDefault();
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const getButton = () => {
		// We can show L1/L2 dropdowns with onClick={handleClick}
		// This used to be necessary for WalletConnect v1
		return <Button variant="outlined" color="secondary" size="large" onClick={() => dispatch({ type: web3CommonLanguage.commands.ShowWalletConnectRpc, payload: { isArbitrumMainnet: true } })}>
			<Box mr={1} display="inline"><img src={walletconnectIcon} alt="WalletConnect" width="24" height="24" style={{ verticalAlign: 'middle' }} /></Box>
			Use WalletConnect
		</Button>
	}

	const getMenuItems = () => {
		const getL1MenuItem = () => {
			if (isArbitrumOnlyToken) {
				return null;
			}

			return (
				<MenuItem onClick={() => dispatch({ type: web3CommonLanguage.commands.ShowWalletConnectRpc, payload: { isArbitrumMainnet: false } })}>
					<Grid container>
						<Grid>
							<Box pl={1} pr={2} display="inline">
								<img src={EthereumPurple} width="24" height="24" />
							</Box>
						</Grid>
						<Grid>
							Ethereum (L1)
						</Grid>
					</Grid>
				</MenuItem>
			)
		}
		return <>
			{getL1MenuItem()}
			<MenuItem onClick={() => dispatch({ type: web3CommonLanguage.commands.ShowWalletConnectRpc, payload: { isArbitrumMainnet: true } })}>
				<Grid container>
					<Grid>
						<Box pl={1} pr={2} display="inline">
							<img src={Arbitrum} width="24" height="24" />
						</Box>
					</Grid>
					<Grid>
						Arbitrum (L2)
					</Grid>
				</Grid>
			</MenuItem>
		</>
	}

	return <>
		{getButton()}
		<Menu
			id="liquidity-pools-menu"
			anchorEl={anchorEl}
			keepMounted
			open={Boolean(anchorEl)}
			onClose={handleClose}
			anchorOrigin={{ vertical: 0, horizontal: "left" }}
			transformOrigin={{ vertical: -50, horizontal: "left" }}
		>
			<Box mx={2} my={2}>
				WalletConnect To Network:
			</Box>
			<Box my={1}>
				<Divider />
			</Box>
			{getMenuItems()}
		</Menu>

	</>
})

interface Props { }

const WalletConnectButton: React.FC<Props> = ({ }) => {
	const { state: web3State, dispatch: web3Dispatch, } = useContext(Web3Context)
	const { ecosystem } = web3State

	return <Render
		dispatch={web3Dispatch}
		ecosystem={ecosystem}
	/>
}

export default WalletConnectButton;