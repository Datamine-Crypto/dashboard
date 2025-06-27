import { Box } from '@mui/material';
import React, { useContext } from 'react';

import { Web3Context } from '../../web3/Web3Context';
import CallToActionCard from './Cards/CallToActionCard';

import GlobalCard from './Cards/GlobalCard';

import { tss } from 'tss-react/mui';
import { getEcosystemConfig } from '../../../configs/config';
import { Ecosystem } from '../../../configs/config.common';
import AccountBalancesCard from './Cards/AccountBalancesCard';
import LockedLiquidityCard from './Cards/LockedLiquidityCard';
import MintStatsCard from './Cards/MintStatsCard';
import RealtimeLiqudityCard from './Cards/RealtimeLiqudityCard';

/**
 * Props for the Render component.
 */
interface RenderParams {
	/** The dispatch function from the Web3Context. */
	dispatch: React.Dispatch<any>;
	/** The current ecosystem being used. */
	ecosystem: Ecosystem;
}

const useStyles = tss.create(({ theme }) => ({
	cardsContainer: {
		'& .MuiListItemText-primary': {
			color: theme.palette.text.secondary,
			fontSize: theme.typography.body2.fontSize,
			marginBottom: theme.spacing(0.5),
		},
		'& .MuiListItemText-secondary': {
			color: theme.palette.text.primary,
			fontSize: theme.typography.body1.fontSize,
		},
	},
}));

/**
 * A memoized functional component that renders various cards related to the Datamine Network dashboard.
 * It conditionally displays the RealtimeLiquidityCard based on the `isLiquidityPoolsEnabled` flag.
 * @param params - Object containing dispatch function and ecosystem.
 */
const Render: React.FC<RenderParams> = React.memo(({ dispatch, ecosystem }) => {
	const { classes } = useStyles();
	const { isLiquidityPoolsEnabled } = getEcosystemConfig(ecosystem);

	/**
	 * Conditionally renders the RealtimeLiquidityCard based on whether liquidity pools are enabled.
	 * @returns The RealtimeLiquidityCard component or null.
	 */
	const getRealtimeLiqudityCard = () => {
		if (!isLiquidityPoolsEnabled) {
			return null;
		}
		return (
			<Box my={3}>
				<RealtimeLiqudityCard />
			</Box>
		);
	};
	return (
		<>
			<Box my={3}>
				<CallToActionCard />
			</Box>
			<Box className={classes.cardsContainer}>
				{getRealtimeLiqudityCard()}
				<Box my={3}>
					<MintStatsCard />
				</Box>
				<Box my={3}>
					<AccountBalancesCard />
				</Box>
				<Box my={3}>
					<LockedLiquidityCard />
				</Box>
				<Box my={3}>
					<GlobalCard />
				</Box>
			</Box>
		</>
	);
});

/**
 * Web3Account component that displays various cards related to the user's Web3 account and the Datamine Network.
 * It consumes the Web3Context to get the current Web3 state and dispatch function.
 */
const Web3Account: React.FC = () => {
	// This component is responsible for managing and displaying the user's Web3 account connection status.
	// It handles wallet connection (e.g., MetaMask, WalletConnect), displays the connected address,
	// and provides options for disconnecting or switching networks.
	const { state: web3State, dispatch } = useContext(Web3Context);

	const { ecosystem } = web3State;

	return <Render dispatch={dispatch} ecosystem={ecosystem} />;
};

export default Web3Account;
