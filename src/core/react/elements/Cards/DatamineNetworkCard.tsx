import { Alert, Box, Button, Card, CardContent, Chip, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useContext } from 'react';

import { Web3Context } from '../../../web3/Web3Context';

import { Visibility, Whatshot }  from '@mui/icons-material';
import { FluxAddressLock } from '../../../interfaces';
import { commonLanguage } from '../../../web3/web3Reducer';
import LightTooltip from '../LightTooltip';

interface RenderParams {
	addressLock: FluxAddressLock;
	displayedAddress: string;
	selectedAddress: string;
	dispatch: React.Dispatch<any>;
}

/**
 * A memoized functional component that renders the Datamine Network Pro card.
 * This card provides information about the Datamine Network's burn-as-a-service concept
 * and allows users to display access links.
 * @param params - Object containing dispatch function.
 */
const Render: React.FC<RenderParams> = React.memo(({ dispatch }) => {
	const getButton = () => {
		const disabledText = false //!isCurrentAddress ? <>Select the <Box fontWeight="bold" display="inline">Delegated Minter Address</Box> account in your wallet to mint for this address.</> : null;

		const button = <Button color="secondary" disabled={!!disabledText} size="large" variant="outlined" onClick={() => dispatch({ type: commonLanguage.commands.DisplayAccessLinks })} startIcon={<Box display="flex" style={{ color: '#0ff' }}><Visibility /></Box>}>
			Display Access Links
		</Button>

		if (disabledText) {
			return <LightTooltip title={disabledText}><Box display="inline-block">{button}</Box></LightTooltip>
		}

		return <LightTooltip title="Gain instant access to Datamine Network Pro and gain 2 additional 'Buddy' passes to share with your friends."><Box display="inline-block">{button}</Box></LightTooltip>
	}

	return <Card >
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

			<Alert severity="info">Every Ethereum Address can generate up to 3 Access Codes to Datamine Network Pro for FREE!</Alert>


			<Box mx={2} mt={3}>
				In 2019 we've showed the world our take on creating monetary velocity through burn incentives. As one of the first deflation-resistant tokens in cryptocurrency space we've paved the way for others to follow.
			</Box>
			<Box mx={2} mt={3}>
				In 2023 we want to demonstrate how on-chain burn velocity can provide an alternative to costly "Software as a service (SaaS)" business expenses.
				Our solution will demonstrate how startups with free product offerings can scale through on-chain burning without resorting to advertising to scale!
			</Box>
			<Box mx={2} mt={3}>
				Introducing our fresh take on "as a service" market segment: <strong style={{ color: '#ff9b00' }} >
					<Whatshot style={{ color: '#ff9b00', verticalAlign: 'middle' }} />Burn-As-A-Service</strong>  <Chip label="@todo add 'get more info' button here" variant="outlined" />
			</Box>
			<Box mx={2} mt={3}>
				We've already finished the feature but don't have much time to explain it yet (Datamine way of working backwards). Click the 'Display Access Links' below to start (they're free!).

				<Box my={3}>
					{getButton()}
				</Box>
			</Box>
		</CardContent>
	</Card>
});

const DatamineNetworkCard: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const { addressLock, address, selectedAddress } = web3State;
	if (!addressLock || !selectedAddress) {
		return null;
	}

	const displayedAddress = address ?? selectedAddress

	return <Render
		addressLock={addressLock}
		selectedAddress={selectedAddress}
		displayedAddress={displayedAddress}
		dispatch={web3Dispatch}
	/>
}

export default DatamineNetworkCard;