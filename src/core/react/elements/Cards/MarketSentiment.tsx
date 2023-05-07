import React, { useContext } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, TableContainer, TableBody, Table, TableCell, TableRow, makeStyles, LinearProgress } from '@material-ui/core';

import { Web3Context } from '../../../web3/Web3Context'

import { getBNPercent } from '../../../web3/helpers';
import { FluxAddressDetails, FluxAddressTokenDetails, FluxAddressLock } from '../../../interfaces';
import { Balances } from '../../../web3/web3Reducer';
import LightTooltip from '../LightTooltip';

import WhatshotIcon from '@material-ui/icons/Whatshot';
import AlarmIcon from '@material-ui/icons/Alarm';
import NavigationIcon from '@material-ui/icons/Navigation';
import SankeyFlowFragment from '../Fragments/SankeyFlowFragment';

const useStyles = makeStyles(() => ({
	progressBarLeft: {
		height: '15px',
		borderTopLeftRadius: '5px',
		borderBottomLeftRadius: '5px',
		'& .MuiLinearProgress-dashedColorSecondary': {
			backgroundSize: '10px 12px',
		},
		'& .MuiLinearProgress-bar1Buffer': {
			borderRight: '2px solid #272936'
		},
		'& .MuiLinearProgress-bar2Buffer': {
			borderTopRightRadius: '5px',
			borderBottomRightRadius: '5px',
		}
	},
	progressBarSurplus: {
		'& .MuiLinearProgress-bar2Buffer': {
			//backgroundColor: '#3cff00'
		}
	},
	progressBarDefecit: {
		'& .MuiLinearProgress-bar2Buffer': {
			backgroundColor: '#ff9b00'
		}
	},
	progressBarRight: {
		height: '15px',
		borderTopRightRadius: '5px',
		borderBottomRightRadius: '5px'
	},
	formCell: {
		paddingTop: 0,
		paddingBottom: 0
	},
	largeSlider: {
		'& .MuiSlider-rail': {
			height: 15,
			borderRadius: 5
		},
		'& .MuiSlider-track': {
			height: 15,
			borderRadius: 5
		},
		'& .MuiSlider-thumb': {
			width: 26,
			height: 26,
			border: '2px solid #187a82'
		}
	},
	halfWayPoint: {
		left: '50%',
		position: 'relative',
		marginLeft: -12,
		color: '#0ff'
	},
	table: {
		'& .MuiTableCell-root': {
			borderBottom: 'none'
		}
	}
}))
interface RenderParams {
	balances: Balances;
	addressTokenDetails: FluxAddressTokenDetails;
	addressDetails: FluxAddressDetails;
	addressLock: FluxAddressLock;
	isArbitrumMainnet: boolean;
}
const Render: React.FC<RenderParams> = React.memo(({ balances, addressDetails, addressLock, isArbitrumMainnet }) => {
	const classes = useStyles();

	const burnPercent = parseFloat(getBNPercent(addressDetails.globalBurnedAmount, balances.fluxTotalSupply))
	const lockedPercent = parseFloat(getBNPercent(addressDetails.globalLockedAmount, balances.damTotalSupply, false))

	const getBurnMultiplierText = (abs: boolean = false) => {
		const prePercent = (((burnPercent - 50) / 50) * 100);
		const percent = (abs ? Math.abs(prePercent) : prePercent).toFixed(2);
		return <>{percent}%</>
	}
	const getLockedMultiplierText = (abs: boolean = false) => {
		const prePercent = (((lockedPercent - 50) / 50) * 100);
		const percent = (abs ? Math.abs(prePercent) : prePercent).toFixed(2);
		return <>{percent}%</>
	}

	const getFluxTooltipText = () => {
		if (burnPercent < 50) {
			return <>There is currently <Box display="inline" fontWeight="bold">{getBurnMultiplierText(true)}</Box> less {isArbitrumMainnet ? 'Arbi' : ''}FLUX burned than the current circulating supply, proving on-chain excess supply</>
		}
		return <>There is currently <Box display="inline" fontWeight="bold">{getBurnMultiplierText()}</Box> more {isArbitrumMainnet ? 'Arbi' : ''}FLUX burned than the current circulating supply, proving on-chain excess demand</>
	}
	const getDamTooltipText = () => {
		if (lockedPercent < 50) {
			return <>There is currently <Box display="inline" fontWeight="bold">{getLockedMultiplierText(true)}</Box> less {isArbitrumMainnet ? 'FLUX (L2)' : 'DAM'} locked-in than the current circulating supply, proving on-chain excess supply</>
		}
		return <>There is currently <Box display="inline" fontWeight="bold">{getLockedMultiplierText()}</Box> more {isArbitrumMainnet ? 'FLUX (L2)' : 'DAM'} locked-in than the current circulating supply, proving on-chain excess demand</>
	}

	const getFluxText = () => {
		return <>
			<LightTooltip title={getFluxTooltipText()}>
				<Box display="inline">
					{burnPercent >= 50 ? 'Excess Market Demand' : 'Excess Market Supply'}
				</Box>
			</LightTooltip>
		</>
	}
	const getDamText = () => {
		return <>
			<LightTooltip title={getDamTooltipText()}>
				<Box display="inline">
					{lockedPercent >= 50 ? 'Excess Market Demand' : 'Excess Market Supply'}
				</Box>
			</LightTooltip>
		</>
	}
	const getBurnSlider = () => {

		const getValue = () => {
			if (burnPercent >= 50) {
				return 50;
			}
			return burnPercent;
		}
		const value = getValue()

		const getValueBuffer = () => {
			if (burnPercent >= 50) {
				return burnPercent;
			}
			return 50;
		}
		const valueBuffer = getValueBuffer()

		return <Box mt={0.5}>
			<LightTooltip title={getFluxTooltipText()}>
				<LinearProgress variant="buffer" value={value} valueBuffer={valueBuffer} color="secondary" className={`${classes.progressBarLeft} ${burnPercent > 50 ? classes.progressBarSurplus : classes.progressBarDefecit}`} />
			</LightTooltip>
			<NavigationIcon className={classes.halfWayPoint} />
		</Box>
	}

	const getTimeSlider = () => {

		const getValue = () => {
			if (lockedPercent >= 50) {
				return 50;
			}
			return lockedPercent;
		}
		const value = getValue()

		const getValueBuffer = () => {
			if (lockedPercent >= 50) {
				return lockedPercent;
			}
			return 50;
		}
		const valueBuffer = getValueBuffer()

		return <Box mt={0.5}>
			<LightTooltip title={getDamTooltipText()}>
				<LinearProgress variant="buffer" value={value} valueBuffer={valueBuffer} color="secondary" className={`${classes.progressBarLeft} ${lockedPercent > 50 ? classes.progressBarSurplus : classes.progressBarDefecit}`} />
			</LightTooltip>
			<NavigationIcon className={classes.halfWayPoint} />
		</Box>
	}

	const sankeyDiagram = <SankeyFlowFragment balances={balances} addressDetails={addressDetails} isArbitrumMainnet={isArbitrumMainnet} />

	const getSankeyDescription = () => {

		return <TableRow>
			<TableCell align="left">
				<Typography color="textSecondary" variant="body1">
					Datamine Ecosystem Known Money Supply
				</Typography>
			</TableCell>
			<TableCell align="left">
			</TableCell>
			<TableCell component="th" scope="row" align="left">
			</TableCell>
		</TableRow>
	}

	return <Card >
		<CardContent>
			<Grid container justify="space-between" alignItems="center">
				<Grid item>
					<LightTooltip title="Our realtime global liquidity is fetched from Uniswap on-chain data through a smart contract">
						<Typography variant="h5" component="h2">
							Realtime On-Chain Market Sentiment
						</Typography>
					</LightTooltip>
				</Grid>
			</Grid>
			<Box mt={1} mb={2}>
				<Divider />
			</Box>
			<Grid container>
				<Box mt={2} width="100%">
					<TableContainer >
						<Table aria-label={`${isArbitrumMainnet ? 'Arbi' : ''}FLUX Token Breakdown`} style={{ minWidth: 450 }} size="small" className={classes.table}>
							<TableBody>
								<TableRow>
									<TableCell align="left">
										<Typography color="textSecondary" variant="body1">
											Burned {isArbitrumMainnet ? 'Arbi' : ''}FLUX: {getFluxText()}
										</Typography>

										{getBurnSlider()}
									</TableCell>
									<TableCell align="left" style={{ width: 25 }}>
										<WhatshotIcon style={{ color: '#ff9b00' }} />
									</TableCell>
									<TableCell component="th" scope="row" align="left" style={{ width: 100 }}>
										{getBurnMultiplierText()}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell align="left">
										<Typography color="textSecondary" variant="body1">
											{isArbitrumMainnet ? 'FLUX (L2)' : 'DAM'} Powering Validators: {getDamText()}
										</Typography>

										{getTimeSlider()}
									</TableCell>
									<TableCell align="left">
										<AlarmIcon style={{ color: '#0ff' }} />
									</TableCell>
									<TableCell component="th" scope="row" align="left">
										{getLockedMultiplierText()}
									</TableCell>
								</TableRow>
								{getSankeyDescription()}


							</TableBody>
						</Table>
					</TableContainer>

					{sankeyDiagram}
				</Box>
			</Grid>
		</CardContent>
	</Card>
});

const MarketSentiment: React.FC = () => {
	const { state: web3State } = useContext(Web3Context)

	const { balances, addressTokenDetails, addressDetails, addressLock, isArbitrumMainnet } = web3State;
	if (!balances || !addressTokenDetails || !addressDetails || !addressLock) {
		return null;
	}


	return <Render
		balances={balances}
		addressTokenDetails={addressTokenDetails}
		addressDetails={addressDetails}
		addressLock={addressLock}
		isArbitrumMainnet={isArbitrumMainnet}
	/>
}

export default MarketSentiment;