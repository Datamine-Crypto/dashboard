import React from 'react';
import { makeStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Check from '@material-ui/icons/Check';
import StepConnector from '@material-ui/core/StepConnector';
import { StepIconProps } from '@material-ui/core/StepIcon';
import { Box, Typography } from '@material-ui/core';
import { CardActionArea } from '@material-ui/core';
import { Link } from '@material-ui/core';
import { Card } from '@material-ui/core';

const QontoConnector = withStyles({
	alternativeLabel: {
		left: 'calc(-50% + 16px)',
		right: 'calc(50% + 16px)',
	},
	active: {
		'& $line': {
			borderColor: '#00ffff',
		},
	},
	completed: {
		'& $line': {
			borderColor: '#00ffff',
		},
	},
	line: {
		borderColor: '#eaeaf0',
		borderTopWidth: 3,
		borderRadius: 1,
	},
})(StepConnector);

const useQontoStepIconStyles = makeStyles({
	root: {
		color: '#eaeaf0',
		display: 'flex',
		height: 22,
		alignItems: 'center',
	},
	active: {
		color: '#00ffff',
	},
	circle: {
		width: 8,
		height: 8,
		borderRadius: '50%',
		backgroundColor: 'currentColor',
	},
	completed: {
		color: '#00ffff',
		zIndex: 1,
		fontSize: 18,
	},
});

function QontoStepIcon(props: StepIconProps) {
	const classes = useQontoStepIconStyles();
	const { active, completed } = props;

	return (
		<div
			className={clsx(classes.root, {
				[classes.active]: active,
			})}
		>
			{completed ? <Check className={classes.completed} /> : <div className={classes.circle} />}
		</div>
	);
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			width: '100%',
		},
		button: {
			marginRight: theme.spacing(1),
		},
		instructions: {
			marginTop: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
		stepper: {
			background: 'transparent',
			padding: 0
		},
		card: {
			background: 'transparent'
		}
	}),
);

export default function Roadmap() {
	const classes = useStyles();
	const [activeStep] = React.useState(3);

	const getSteps = () => {
		const steps = [
			//{ title: 'Ropsten Testnet Launch', date: 'May 23rd, 2020' },
			{ title: 'Mainnet Launch', date: 'June 8th, 2020' },
			//{ title: 'Crex24 BWK to DAM Swap', date: 'June 15th, 2020' },
			//{ title: 'Last BWK to DAM Swap', date: 'June 22nd, 2020' },
			{ title: 'Mint Analytics', date: 'October 1st, 2020', href: 'https://dataminenetwork.medium.com/introducing-datamine-network-real-time-p2p-network-of-data-future-of-smart-contract-analytics-b47365d2abd6' },
			{ title: 'DAM & FLUX Audits', date: 'October 13st, 2020', href: 'https://dataminenetwork.medium.com/datamine-dam-flux-smart-contract-audits-passed-1a13f3621e43' },
			//{ title: 'Open Beta', date: 'October 1st, 2020' },
			//{ title: 'Open Beta v2', date: 'November 1st, 2020' },
			//{ title: 'Open Beta v3', date: 'December 31st, 2020' },
			//{ title: 'Open Beta v4', date: 'April 30th, 2021', href: 'https://dataminenetwork.medium.com/datamine-network-open-beta-v4-release-whats-new-what-s-next-23e1fe124206' },
			{ title: 'ArbiFLUX L2 Launch', date: 'October 21st, 2021', href: 'https://dataminenetwork.medium.com/introducing-datamine-arbiflux-ca04f8912f5f' },
			{ title: 'Open Beta v6', date: 'December 31st, 2021', href: 'https://dataminenetwork.medium.com/datamine-network-open-beta-v5-release-whats-new-what-s-next-e1d05119c671' },
		];

		return steps.map(({ title, date, href }) => {
			const cardContents = <Box my={1}>
				<Box fontWeight={600}><Typography>{title}</Typography></Box>
				<Box mt={2}><Typography color="textSecondary" variant="body2">{date}</Typography></Box>
			</Box>

			if (!href) {
				return cardContents;
			}

			return <>
				<Link href={href} target="_blank" rel="noopener noreferrer">
					<Card elevation={0} className={classes.card}>
						<CardActionArea>
							{cardContents}
						</CardActionArea>
					</Card>
				</Link>
			</>
		});
	}
	const steps = getSteps();

	return (
		<div className={classes.root}>
			<Stepper className={classes.stepper} alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
				{steps.map((label, index) => (
					<Step key={index}>
						<StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
		</div>
	);
}