import { Box } from '@mui/material';
import React from 'react';
// Web3 context for accessing blockchain state and dispatch functions
import { useAppStore } from '@/react/utils/appStore';
// Call to action card component
import CallToActionCard from '@/react/elements/Cards/CallToActionCard';
// Global statistics card component
import GlobalCard from '@/react/elements/Cards/GlobalCard';
// Styling utility from tss-react
import { tss } from 'tss-react/mui';
// Configuration for the current ecosystem
import { getEcosystemConfig } from '@/app/configs/config';
// Ecosystem enum for type safety

// Account balances card component
import { AccountBalancesCard } from '@/react/elements/Cards/AccountBalancesCard';
// Locked liquidity card component
import LockedLiquidityCard from '@/react/elements/Cards/LockedLiquidityCard';
// Minting statistics card component
import MintStatsCard from '@/react/elements/Cards/MintStatsCard';
// Real-time liquidity card component
import RealtimeLiqudityCard from '@/react/elements/Cards/RealtimeLiqudityCard';
import { useShallow } from 'zustand/react/shallow';

/**
 * Props for the Render component.
 */

/**
 * Web3Account component that displays various cards related to the user's Web3 account and the Datamine Network.
 * It consumes the Web3Context to get the current Web3 state and dispatch function.
 * This component is responsible for managing and displaying the user's Web3 account connection status,
 * handling wallet connection (e.g., MetaMask, WalletConnect), displaying the connected address,
 * and providing options for disconnecting or switching networks.
 */
/**
 * Styles for the Web3Account component, specifically for the cards container.
 * It defines typography and color styles for primary and secondary list item text.
 */
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

const Web3Account: React.FC = () => {
	const { classes } = useStyles();
	const { ecosystem } = useAppStore(
		useShallow((state) => ({
			ecosystem: state.ecosystem,
		}))
	);

	const { isLiquidityPoolsEnabled } = getEcosystemConfig(ecosystem);
	/**
	 * Conditionally renders the RealtimeLiquidityCard based on whether liquidity pools are enabled
	 * in the current ecosystem configuration.
	 * @returns The RealtimeLiquidityCard component or null if disabled.
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
};
export default Web3Account;
