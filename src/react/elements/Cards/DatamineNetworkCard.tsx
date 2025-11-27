import { Alert, Box, Button, Card, CardContent, Chip, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useAppStore } from '@/react/utils/appStore';
import { Visibility, Whatshot } from '@mui/icons-material';
import { commonLanguage } from '@/app/state/commonLanguage';
import LightTooltip from '@/react/elements/LightTooltip';
import { useShallow } from 'zustand/react/shallow';
import { dispatch as appDispatch } from '@/react/utils/appStore';

const DatamineNetworkCard: React.FC = () => {
	const { addressLock, address, selectedAddress } = useAppStore(
		useShallow((state) => ({
			addressLock: state.addressLock,
			address: state.address,
			selectedAddress: state.selectedAddress,
		}))
	);
	const dispatch = appDispatch;

	if (!addressLock || !selectedAddress) {
		return null;
	}
	const displayedAddress = address ?? selectedAddress;

	const getButton = () => {
		const disabledText = false; //!isCurrentAddress ? <>Select the <Box fontWeight="bold" display="inline">Delegated Minter Address</Box> account in your wallet to mint for this address.</> : null;
		const button = (
			<Button
				color="secondary"
				disabled={!!disabledText}
				size="large"
				variant="outlined"
				onClick={() => dispatch({ type: commonLanguage.commands.DisplayAccessLinks })}
				startIcon={
					<Box display="flex" style={{ color: '#0ff' }}>
						<Visibility />
					</Box>
				}
			>
				Display Access Links
			</Button>
		);
		if (disabledText) {
			return (
				<LightTooltip title={disabledText}>
					<Box display="inline-block">{button}</Box>
				</LightTooltip>
			);
		}
		return (
			<LightTooltip title="Gain instant access to Datamine Network Pro and gain 2 additional 'Buddy' passes to share with your friends.">
				<Box display="inline-block">{button}</Box>
			</LightTooltip>
		);
	};

	return (
		<Card>
			<CardContent>
				<Grid container justifyContent="space-between" alignItems="center">
					<Grid>
						<Typography variant="h5" component="h2">
							Datamine Network Pro
						</Typography>
					</Grid>
				</Grid>
				<Box mt={1} mb={2}>
					<Divider />
				</Box>
				<Alert severity="info">
					Every Ethereum Address can generate up to 3 Access Codes to Datamine Network Pro for FREE!
				</Alert>
				<Box mx={2} mt={3}>
					In 2019 we&apos;ve showed the world our take on creating monetary velocity through burn incentives. As one of
					the first deflation-resistant tokens in cryptocurrency space we&apos;ve paved the way for others to follow.
				</Box>
				<Box mx={2} mt={3}>
					In 2023 we want to demonstrate how on-chain burn velocity can provide an alternative to costly &quot;Software
					as a service (SaaS)&quot; business expenses. Our solution will demonstrate how startups with free product
					offerings can scale through on-chain burning without resorting to advertising to scale!
				</Box>
				<Box mx={2} mt={3}>
					Introducing our fresh take on &quot;as a service&quot; market segment:{' '}
					<strong style={{ color: '#ff9b00' }}>
						<Whatshot style={{ color: '#ff9b00', verticalAlign: 'middle' }} />
						Burn-As-A-Service
					</strong>{' '}
					<Chip label="@todo add 'get more info' button here" variant="outlined" />
				</Box>
				<Box mx={2} mt={3}>
					We&apos;ve already finished the feature but don&apos;t have much time to explain it yet (Datamine way of
					working backwards). Click the &apos;Display Access Links&apos; below to start (they&apos;re free!).
					<Box my={3}>{getButton()}</Box>
				</Box>
			</CardContent>
		</Card>
	);
};

export default DatamineNetworkCard;
