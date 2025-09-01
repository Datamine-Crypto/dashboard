import { Box, Button, CardMedia, Paper, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { Ecosystem } from '../../../configs/config.common';

import Grid from '@mui/system/Grid';
import { useWeb3Context } from '../../web3/Web3Context';

import {
	Autorenew as AutorenewIcon,
	Bolt as BoltIcon,
	EmojiEvents as EmojiEventsIcon,
	LocalGasStation as LocalGasStationIcon,
	PhoneAndroid as PhoneAndroidIcon,
	Public as PublicIcon,
	RocketLaunch as RocketLaunchIcon,
	Speed as SpeedIcon,
	VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { alpha, Avatar, Container, styled, useTheme } from '@mui/material'; // Assuming MUI v7 imports are similar
import { DialogType } from '../../interfaces';
import { commonLanguage } from '../../web3/web3Reducer';
import FooterFragment from '../elements/Fragments/FooterFragment';

// Color palette
const palette = {
	highlight: '#0FF',
	background: '#272936',
	secondaryBackground: '#202336',
}; // For constant APY stream

// Define Props for the component, including the new onClick handler
interface DatamineGemsLandingPageProps {
	onStartGameClick?: () => void; // Optional onClick handler for the Start Game button
}

// Styled component for consistent section padding
const Section = styled(Box)(({ theme }) => ({
	paddingTop: theme.spacing(6),
	paddingBottom: theme.spacing(6),
}));

// Styled component for feature cards with glassmorphism effect
const FeatureCard = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(3),
	textAlign: 'center',
	height: '100%', // Ensures cards in the same row have the same height
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: alpha(theme.palette.background.paper, 0.6), // Semi-transparent background for glass effect
	backdropFilter: 'blur(10px)', // Blur effect for the background
	border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`, // Subtle border
	borderRadius: (theme.shape.borderRadius as number) * 2, // More rounded corners
	transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
	'&:hover': {
		transform: 'translateY(-5px)', // Slight lift on hover
		boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.2)}`, // Enhanced shadow on hover
	},
}));

// Styled component for the icons within feature cards
const FeatureIconWrapper = styled(Avatar)(({ theme }) => ({
	backgroundColor: theme.palette.background.default,
	color: theme.palette.primary.light,
	width: theme.spacing(8), // Larger icon avatar
	height: theme.spacing(8),
	marginBottom: theme.spacing(2),
	boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.4)}`, // Shadow for depth
}));

// Styled Typography for gradient text effect
const GradientText = styled(Typography)(({ theme }) => ({
	background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main || theme.palette.primary.light} 90%)`,
	WebkitBackgroundClip: 'text',
	WebkitTextFillColor: 'transparent',
	fontWeight: 700, // Bold gradient text
}));

/**
 * Renders the landing page for Datamine Gems, a GameFi experience.
 * It showcases features and the impact of the game on the ecosystem.
 * @param props - Component props, including an optional onStartGameClick handler.
 */
const DatamineGemsLandingPage: React.FC<DatamineGemsLandingPageProps> = ({ onStartGameClick }) => {
	const theme = useTheme(); // Hook to access theme properties

	// Array of features for the landing page
	const features = [
		{
			icon: <SpeedIcon fontSize="large" />,
			title: 'Real-Time Updates',
			description: 'Gems appear dynamically! Engage in a fast-paced hunt for instant rewards.',
		},
		{
			icon: <PublicIcon fontSize="large" />,
			title: 'Global Gem Hunt',
			description: 'Accessible to everyone, everywhere. Join the worldwide quest for Datamine Gems.',
		},
		{
			icon: <VisibilityOffIcon fontSize="large" />,
			title: 'Anonymous Participation',
			description: 'Click and collect with privacy. Your identity remains yours in our decentralized arena.',
		},
		{
			icon: <LocalGasStationIcon fontSize="large" />,
			title: 'Ultra-Low Gas Fees',
			description: 'Collect your gem rewards without worrying about exorbitant transaction costs.',
		},
		{
			icon: <PhoneAndroidIcon fontSize="large" />,
			title: 'Mobile-Friendly Gem Hunter',
			description: 'Enjoy the full gem-clicking experience on the go. Optimized for all your devices.',
		},
		{
			icon: <EmojiEventsIcon fontSize="large" />,
			title: 'The Strategic Clicker',
			description: 'It’s not just about speed! Click strategically to maximize your gem rewards and climb the ranks.',
		},
	];

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			<CardMedia component="img" height="194" image="./images/datamineGems.png" alt="Paella dish" />
			{/* Header Section: Title, Subtitle, and Start Game Button */}
			<Box textAlign="center" mb={6}>
				<Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 3, mt: 3 }}>
					Unearth valuable rewards! Click gems in real-time in the ultimate #GameFi experience.
				</Typography>
				<Button
					variant="contained"
					color="success" // Changed color to success
					size="large"
					startIcon={<RocketLaunchIcon />} // Changed icon to RocketLaunchIcon
					sx={{
						padding: '12px 30px',
						fontSize: '1.2rem',
						borderRadius: '50px', // Pill-shaped button
						// Assuming theme.palette.primary.default is valid in your theme; typically it's theme.palette.primary.main
						boxShadow: `0 8px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
						transition: 'all 0.3s ease',
						'&:hover': {
							transform: 'translateY(-3px)',
							// Update hover boxShadow if needed, e.g., using success color
							boxShadow: `0 12px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
							background: '#0FF',
						},
					}}
					onClick={onStartGameClick || (() => console.log('Start Game Clicked! (Datamine Gems)'))} // Use passed prop or default console log
				>
					Start Game {/* Changed button text */}
				</Button>
			</Box>

			{/* Introduction Section: "What is Datamine Gems?" */}
			<Section>
				<Typography variant="h4" gutterBottom textAlign="center" sx={{ fontWeight: 'bold' }}>
					What is{' '}
					<GradientText as="span" variant="h4" sx={{ display: 'inline' }}>
						Datamine Gems
					</GradientText>
					?
				</Typography>
				<Typography
					variant="body1"
					color="text.secondary"
					textAlign="center"
					sx={{ maxWidth: '750px', margin: '0 auto 20px auto' }}
				>
					Datamine Gems is a thrilling GameFi experience where you click on dynamically spawning gems to earn real
					rewards. It combines the excitement of discovery with the power of decentralized finance. Simple, engaging,
					and rewarding – get ready to click your way to success!
				</Typography>
			</Section>

			{/* Key Features Section */}
			<Section>
				<Typography variant="h4" gutterBottom textAlign="center" sx={{ fontWeight: 'bold', mb: 5 }}>
					Why You&apos;ll Love Collecting Gems
				</Typography>
				{/* Grid layout for features - using MUI v7.10 <Grid size={{...}}> syntax */}
				<Grid container spacing={4} alignItems="stretch">
					{' '}
					{/* alignItems="stretch" makes cards in a row same height */}
					{features.map((feature, index) => (
						<Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
							{' '}
							{/* Responsive grid item sizing */}
							<FeatureCard elevation={6}>
								{' '}
								{/* Using styled FeatureCard */}
								<FeatureIconWrapper>{feature.icon}</FeatureIconWrapper>
								<Typography
									variant="h6"
									component="h3"
									gutterBottom
									sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
								>
									{feature.title}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{feature.description}
								</Typography>
							</FeatureCard>
						</Grid>
					))}
				</Grid>
			</Section>

			{/* Ecosystem Impact Section */}
			<Section>
				<Typography variant="h4" gutterBottom textAlign="center" sx={{ fontWeight: 'bold', mb: 1 }}>
					<GradientText as="span" variant="h4" sx={{ display: 'inline' }}>
						Powering the Ecosystem:
					</GradientText>
				</Typography>
				<Typography variant="h5" gutterBottom textAlign="center" sx={{ mb: 4 }}>
					The Drive for Unmatched Efficiency
				</Typography>
				{/* alignItems changed from "center" to "start" */}
				<Grid container spacing={4} alignItems="start">
					<Grid size={{ xs: 12, md: 6 }}>
						{' '}
						{/* Responsive grid item */}
						<Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
							{' '}
							{/* Responsive text alignment */}
							<BoltIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
							<Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
								Boosting Monetary Velocity
							</Typography>
							<Typography variant="body1" color="text.secondary" paragraph>
								Datamine Gems isn&apos;t just about fun; it&apos;s a catalyst for enhancing the entire Datamine Network.
								Our efficiency updates, including a new smart contract for autonomous multi-address minting, are
								designed to significantly increase monetary velocity.
							</Typography>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						{' '}
						{/* Responsive grid item */}
						<Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
							{' '}
							{/* Responsive text alignment */}
							<AutorenewIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
							<Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
								Maximizing Validator Rewards
							</Typography>
							<Typography variant="body1" color="text.secondary" paragraph>
								More on-chain interactions from gem collections mean better, more consistent rewards for our valued
								validators. Datamine Gems provides a constant stream of activity, boosting APY and reinforcing the
								health of our decentralized monetary system.
							</Typography>
							<Typography variant="body1" color="text.secondary" paragraph sx={{ fontStyle: 'italic' }}>
								This is GameFi with a purpose: driving efficiency, stability, and rewards throughout the Datamine
								ecosystem.
							</Typography>
						</Box>
					</Grid>
				</Grid>
			</Section>
		</Container>
	);
};

// Main component
interface RenderParams {
	dispatch: React.Dispatch<any>;
	ecosystem: Ecosystem;
}
// Main component
/**
 * Main component for the Realtime Rewards GameFi Page.
 * It renders the DatamineGemsLandingPage and the FooterFragment.
 * @param params - Object containing dispatch function and ecosystem.
 */
const Render: React.FC<RenderParams> = React.memo(({ dispatch, ecosystem }) => {
	return (
		<Box>
			<Box mt={6} pt={4}>
				<Box
					sx={{
						minHeight: '100vh',
						bgcolor: palette.background,
						color: '#f3f4f6',
						p: 3,
					}}
				>
					<Paper
						sx={{
							maxWidth: '1152px',
							mx: 'auto',
							mb: 6,
							p: 3,
							bgcolor: palette.secondaryBackground,
							borderRadius: 2,
						}}
					>
						<DatamineGemsLandingPage
							onStartGameClick={() => {
								dispatch({
									type: commonLanguage.commands.ShowDialog,
									payload: { dialog: DialogType.MarketCollectRewards },
								});
							}}
						/>
					</Paper>
				</Box>
				{/* Footer */}
				<FooterFragment ecosystem={ecosystem} />
			</Box>
		</Box>
	);
});

interface Props {}
/**
 * RealtimeRewardsGameFiPage component that serves as the entry point for the Datamine Gems GameFi experience.
 * It provides the necessary Web3 context (dispatch and ecosystem) to its child components.
 * @param props - Component props (currently empty).
 */
const RealtimeRewardsGameFiPage: React.FC<Props> = ({}) => {
	const { state: web3State, dispatch } = useWeb3Context();
	const { ecosystem } = web3State;

	return <Render dispatch={dispatch} ecosystem={ecosystem} />;
};

export default RealtimeRewardsGameFiPage;
