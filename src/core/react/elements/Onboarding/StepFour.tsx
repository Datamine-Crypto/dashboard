import { Box, Button, Grid, Paper, Slider, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { OnboardingProps } from './types';

// Token SVGs
const ShrimpSvg = () => (
	<svg width="80" height="80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="40" height="40" rx="20" fill="#202336" />
		<path d="M12 20C12 20 16 15 25 18C34 21 28 26 28 26" stroke="#0FF" strokeWidth="2" strokeLinecap="round" />
		<path d="M24 22C24 22 28 24 26 27C24 30 20 28 20 28" stroke="#0FF" strokeWidth="2" strokeLinecap="round" />
		<circle cx="12" cy="21" r="2" fill="#0FF" />
		<circle cx="10" cy="24" r="1.5" fill="#0FF" />
		<path d="M14 24C14 24 16 27 12 29" stroke="#0FF" strokeWidth="1.5" strokeLinecap="round" />
		<path d="M18 26C18 26 20 28 18 30" stroke="#0FF" strokeWidth="1.5" strokeLinecap="round" />
		<path d="M15 20C15 20 17 18 20 19" stroke="#0FF" strokeWidth="1.5" strokeLinecap="round" />
	</svg>
);

const NarwhalSvg = () => (
	<svg width="80" height="80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="40" height="40" rx="20" fill="#202336" />
		<ellipse cx="20" cy="22" rx="12" ry="6" fill="#0FF" opacity="0.7" />
		<circle cx="14" cy="22" r="2" fill="#202336" />
		<path d="M8 22C8 22 12 18 20 18C28 18 32 22 32 22" stroke="#0FF" strokeWidth="2" strokeLinecap="round" />
		<path d="M28 19L34 10" stroke="#0FF" strokeWidth="2" strokeLinecap="round" />
		<path d="M20 28C20 28 28 28 30 26" stroke="#0FF" strokeWidth="1.5" strokeLinecap="round" />
		<path d="M12 28C12 28 8 26 10 24" stroke="#0FF" strokeWidth="1.5" strokeLinecap="round" />
	</svg>
);

const WhaleSvg = () => (
	<svg width="80" height="80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="40" height="40" rx="20" fill="#202336" />
		<path d="M6 20C6 20 10 15 20 15C30 15 34 20 34 20" stroke="#0FF" strokeWidth="2" strokeLinecap="round" />
		<ellipse cx="20" cy="24" rx="14" ry="7" fill="#0FF" opacity="0.7" />
		<circle cx="14" cy="22" r="2" fill="#202336" />
		<path d="M28 17L32 12" stroke="#0FF" strokeWidth="2" strokeLinecap="round" />
		<path d="M20 31C20 31 30 31 34 28" stroke="#0FF" strokeWidth="1.5" strokeLinecap="round" />
		<path d="M20 31C20 31 10 31 6 28" stroke="#0FF" strokeWidth="1.5" strokeLinecap="round" />
	</svg>
);

const StepFour: React.FC<OnboardingProps> = ({ handleNext, handleBack, handleSelectSizeOption }) => {
	// Initialize slider value based on selectedOption or default to 10
	const getInitialValue = () => {
		return 10; // default to shrimp
	};

	const [sliderValue, setSliderValue] = useState(getInitialValue());

	// Determine which animal to display based on the slider value
	const getAnimalType = (value: number) => {
		if (value < 30) return 'shrimp';
		if (value < 80) return 'narwhal';
		return 'whale';
	};

	const currentAnimal = getAnimalType(sliderValue);

	// Get appropriate display name for the animal type
	const getAnimalName = (type: string) => {
		switch (type) {
			case 'shrimp':
				return 'Shrimp';
			case 'narwhal':
				return 'Narwhal';
			case 'whale':
				return 'Whale';
			default:
				return 'Shrimp';
		}
	};

	// Get description based on the animal type
	const getAnimalDescription = (type: string) => {
		switch (type) {
			case 'shrimp':
				return 'Start small and test the waters';
			case 'narwhal':
				return 'For medium size validators';
			case 'whale':
				return 'Larger validators that plan to burn more';
			default:
				return 'Start small and test the waters';
		}
	};

	// Get SVG component based on the animal type
	const getAnimalSvg = (type: string) => {
		switch (type) {
			case 'shrimp':
				return <ShrimpSvg />;
			case 'narwhal':
				return <NarwhalSvg />;
			case 'whale':
				return <WhaleSvg />;
			default:
				return <ShrimpSvg />;
		}
	};

	// Slider marks
	const marks = [
		{ value: 10, label: '$10' },
		{ value: 50, label: '$50' },
		{ value: 100, label: '$100' },
	];

	// Handle slider change
	const handleSliderChange = (_event: Event, newValue: number | number[]) => {
		setSliderValue(newValue as number);
	};

	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Grid container spacing={4} sx={{ flexGrow: 1 }}>
				<Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Box sx={{ maxWidth: '100%', height: 'auto' }}>
						<svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
							{/* Gradients */}
							<defs>
								<linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
									<stop offset="0%" stopColor="#004444" />
									<stop offset="40%" stopColor="#008888" />
									<stop offset="60%" stopColor="#00BBBB" />
									<stop offset="80%" stopColor="#00FFFF" />
									<stop offset="100%" stopColor="#CCFFFF" />
								</linearGradient>

								<linearGradient id="innerFireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
									<stop offset="0%" stopColor="#008888" />
									<stop offset="60%" stopColor="#00FFFF" />
									<stop offset="100%" stopColor="#FFFFFF" />
								</linearGradient>
							</defs>

							{/* Base glow */}
							<ellipse cx="150" cy="250" rx="80" ry="20" fill="#004444" opacity="0.5" />

							{/* Main fire shape */}
							<path d="M100,250 C70,220 90,150 150,100 C210,150 230,220 200,250 Z" fill="url(#fireGradient)">
								<animate
									attributeName="d"
									dur="3s"
									repeatCount="indefinite"
									values="
            M100,250 C70,220 90,150 150,100 C210,150 230,220 200,250 Z;
            M110,250 C80,210 100,140 150,90 C200,140 220,210 190,250 Z;
            M95,250 C65,215 85,145 150,95 C215,145 235,215 205,250 Z;
            M100,250 C70,220 90,150 150,100 C210,150 230,220 200,250 Z"
								/>
							</path>

							{/* Middle flame */}
							<path
								d="M120,250 C100,220 130,170 150,140 C170,170 200,220 180,250 Z"
								fill="url(#innerFireGradient)"
								opacity="0.8"
							>
								<animate
									attributeName="d"
									dur="2s"
									repeatCount="indefinite"
									values="
            M120,250 C100,220 130,170 150,140 C170,170 200,220 180,250 Z;
            M125,250 C105,210 135,160 150,130 C165,160 195,210 175,250 Z;
            M115,250 C95,215 125,165 150,135 C175,165 205,215 185,250 Z;
            M120,250 C100,220 130,170 150,140 C170,170 200,220 180,250 Z"
								/>
							</path>

							{/* Inner flame */}
							<path d="M135,250 C125,220 140,180 150,160 C160,180 175,220 165,250 Z" fill="#00FFFF" opacity="0.9">
								<animate
									attributeName="d"
									dur="1.5s"
									repeatCount="indefinite"
									values="
            M135,250 C125,220 140,180 150,160 C160,180 175,220 165,250 Z;
            M140,250 C130,215 145,175 150,155 C155,175 170,215 160,250 Z;
            M130,250 C120,225 135,185 150,165 C165,185 180,225 170,250 Z;
            M135,250 C125,220 140,180 150,160 C160,180 175,220 165,250 Z"
								/>
							</path>

							{/* Embers */}
							<circle cx="140" cy="160" r="2" fill="#00FFFF">
								<animate attributeName="cy" dur="4s" values="160;80" repeatCount="indefinite" />
								<animate attributeName="opacity" dur="4s" values="1;0" repeatCount="indefinite" />
							</circle>

							<circle cx="160" cy="170" r="2" fill="#00FFFF">
								<animate attributeName="cy" dur="3s" values="170;70" repeatCount="indefinite" />
								<animate attributeName="opacity" dur="3s" values="1;0" repeatCount="indefinite" />
							</circle>

							<circle cx="145" cy="180" r="3" fill="#00FFFF">
								<animate attributeName="cy" dur="5s" values="180;60" repeatCount="indefinite" />
								<animate attributeName="opacity" dur="5s" values="1;0" repeatCount="indefinite" />
							</circle>

							<circle cx="155" cy="165" r="2" fill="#00FFFF">
								<animate attributeName="cy" dur="3.5s" values="165;65" repeatCount="indefinite" />
								<animate attributeName="opacity" dur="3.5s" values="1;0" repeatCount="indefinite" />
							</circle>
						</svg>
					</Box>
				</Grid>
				<Grid size={{ xs: 12, md: 7 }}>
					<Box sx={{ p: 3 }}>
						<Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#0FF' }}>
							Buy ArbiFLUX Tokens
						</Typography>
						<Typography variant="body2" paragraph>
							<strong>Select your size:</strong> The amount you select represents the size of your validator in the
							network. Larger validators can burn more LOCK tokens to increase their minting speed.
						</Typography>
						<Typography variant="body2" paragraph>
							Once you start your ArbiFLUX validator your will start generating LOCK tokens. There is a cap of how much
							LOCK you can burn based on your validator size.
						</Typography>
						<Typography variant="body2">
							<strong>Recommendation:</strong> Start small if you&apos;re new to the platform, and you can always
							increase your position as you become more familiar with how the system works. We recommend starting with
							$10 to get familiar with the ecosystem and increasing it later on.
						</Typography>

						<Paper
							elevation={0}
							sx={{
								p: 3,
								my: 3,
								bgcolor: 'rgba(0, 255, 255, 0.05)',
								border: '1px solid rgba(0, 255, 255, 0.2)',
								borderRadius: 2,
							}}
						>
							<Stack spacing={3} alignItems="center">
								<Box
									sx={{
										textAlign: 'center',
										minHeight: '120px',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									{getAnimalSvg(currentAnimal)}

									<Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
										{getAnimalName(currentAnimal)}
									</Typography>
									<Typography variant="body2" sx={{ mt: 0.5 }}>
										{getAnimalDescription(currentAnimal)}
									</Typography>
								</Box>

								<Box sx={{ width: '100%' }}>
									<Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#0FF', mb: 2 }}>
										${sliderValue}
									</Typography>
									<Slider
										value={sliderValue}
										onChange={handleSliderChange}
										min={10}
										max={100}
										step={1}
										marks={marks}
										valueLabelDisplay="off"
										sx={{
											'& .MuiSlider-rail': {
												backgroundColor: 'rgba(0, 255, 255, 0.2)',
												height: 8,
											},
											'& .MuiSlider-track': {
												height: 8,
												backgroundColor: '#0FF',
											},
											'& .MuiSlider-thumb': {
												width: 20,
												height: 20,
												backgroundColor: '#0FF',
												'&:hover, &.Mui-focusVisible': {
													boxShadow: '0 0 0 8px rgba(0, 255, 255, 0.16)',
												},
											},
											'& .MuiSlider-mark': {
												backgroundColor: 'rgba(0, 255, 255, 0.5)',
												height: 12,
												width: 2,
												marginTop: -2,
											},
											'& .MuiSlider-markActive': {
												backgroundColor: '#0FF',
											},
											'& .MuiSlider-markLabel': {
												color: 'rgba(0, 255, 255, 0.7)',
												fontWeight: 'bold',
											},
										}}
									/>
								</Box>
							</Stack>
						</Paper>
					</Box>
				</Grid>
			</Grid>

			<Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
				<Button variant="outlined" color="primary" onClick={handleBack} sx={{ minWidth: 120 }}>
					Back
				</Button>
				<Button variant="outlined" color="secondary" onClick={handleNext} sx={{ minWidth: 120 }}>
					Continue
				</Button>
			</Box>
		</Box>
	);
};

export default StepFour;
