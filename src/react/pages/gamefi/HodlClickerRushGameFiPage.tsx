import { Box, Button, CardMedia, Paper, Typography } from '@mui/material';
import React from 'react';
import { Ecosystem } from '@/app/configs/config.common';
import Grid from '@mui/material/Grid';
import { useAppStore, dispatch as appDispatch } from '@/react/utils/appStore';
import {
	Autorenew as AutorenewIcon,
	Bolt as BoltIcon,
	EmojiEvents as EmojiEventsIcon,
	PhoneAndroid as PhoneAndroidIcon,
	Public as PublicIcon,
	RocketLaunch as RocketLaunchIcon,
} from '@mui/icons-material';
import { alpha, Avatar, Container, styled, useTheme } from '@mui/material'; // Assuming MUI v7 imports are similar
import FooterFragment from '@/react/elements/Fragments/FooterFragment';
import { useShallow } from 'zustand/react/shallow';
import { ReducerDispatch } from '@/utils/reducer/sideEffectReducer';
// Color palette
const palette = {
	highlight: '#0FF',
	background: '#272936',
	secondaryBackground: '#202336',
}; // For constant APY stream
// Define Props for the component, including the new onClick handler
interface HodlClickerRushGameFiPageProps {
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
 * Renders the landing page for HODL Clicker: Rush, a GameFi experience.
 * It showcases features and the impact of the game on the ecosystem.
 * @param props - Component props, including an optional onStartGameClick handler.
 */
const HodlClickerRushLandingPage: React.FC<HodlClickerRushGameFiPageProps> = ({ onStartGameClick }) => {
	const theme = useTheme(); // Hook to access theme properties
	// Array of features for the landing page
	const features = [
		{
			icon: <RocketLaunchIcon fontSize="large" />,
			title: 'Start Earning with 0 Tokens!',
			description:
				'Anyone can play and earn rewards, even if you start with a balance of 0 LOCK. Tokens are supplied from a collective rewards pool.',
		},
		{
			icon: <EmojiEventsIcon fontSize="large" />,
			title: 'Dynamic Jackpots',
			description:
				'Be the fastest to click! The first player to act within the 12-second window claims the entire jackpot.',
		},
		{
			icon: <AutorenewIcon fontSize="large" />,
			title: 'LOCK Staking',
			description: 'Earn extra rewards based on your LOCK staking ownership percentage.',
		},
		{
			icon: <BoltIcon fontSize="large" />,
			title: 'Atomic Batch Burning',
			description: 'The "Collect All Gems" button allows for multiple burns in a single, efficient transaction.',
		},
		{
			icon: <PhoneAndroidIcon fontSize="large" />,
			title: 'Mobile-Friendly',
			description: 'Enjoy the full HODL clicking experience on the go. Optimized for all your devices.',
		},
		{
			icon: <PublicIcon fontSize="large" />,
			title: 'Global Competition',
			description: 'Accessible to everyone, everywhere. Join the worldwide quest for the highest score.',
		},
	];
	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			<CardMedia component="img" height="455" image="./images/hodlClicker.png" alt="HODL Clicker Rush" />
			{/* Header Section: Title, Subtitle, and Start Game Button */}
			<Box textAlign="center" mb={6}>
				<Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 3, mt: 3 }}>
					Click your way to victory! The ultimate #GameFi experience where every click counts.
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
					onClick={onStartGameClick || (() => console.log('Start Game Clicked! (HODL Clicker Rush)'))} // Use passed prop or default console log
				>
					Start Game
				</Button>
			</Box>
			{/* Introduction Section: "What is HODL Clicker: Rush?" */}
			<Section>
				<Typography variant="h4" gutterBottom textAlign="center" sx={{ fontWeight: 'bold' }}>
					What is{' '}
					<GradientText as="span" variant="h4" sx={{ display: 'inline' }}>
						HODL Clicker
					</GradientText>
					?
				</Typography>
				<Typography
					variant="body1"
					color="text.secondary"
					textAlign="center"
					sx={{ maxWidth: '750px', margin: '0 auto 20px auto' }}
				>
					HODL Clicker is a revolutionary GameFi experience where you can start earning rewards with zero initial
					tokens. It&apos;s a true play-to-earn model that&apos;s fun, engaging, and rewards participation.
				</Typography>
			</Section>
			{/* Key Features Section */}
			<Section>
				<Typography variant="h4" gutterBottom textAlign="center" sx={{ fontWeight: 'bold', mb: 5 }}>
					Why You&apos;ll Love HODL Clicker
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
								HODL Clicker isn&apos;t just about fun; it&apos;s a catalyst for enhancing the entire Datamine Network.
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
								More on-chain interactions from the game mean better, more consistent rewards for our valued validators.
								HODL Clicker provides a constant stream of activity, boosting APY and reinforcing the health of our
								decentralized monetary system.
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
interface RenderParams {
	dispatch: ReducerDispatch;
	ecosystem: Ecosystem;
}
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
						<HodlClickerRushLandingPage
							onStartGameClick={() => {
								window.location.hash = '#hodlclicker';
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
const HodlClickerRushGameFiPage: React.FC<Props> = () => {
	const { ecosystem } = useAppStore(
		useShallow((state) => ({
			ecosystem: state.ecosystem,
		}))
	);

	return <Render dispatch={appDispatch} ecosystem={ecosystem} />;
};
export default HodlClickerRushGameFiPage;
