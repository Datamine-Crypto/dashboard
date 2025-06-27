import { Box, Button, Grid, Typography } from '@mui/material';
import React from 'react';
import { OnboardingProps } from './types';

const OperatorSvg = ({ width = '100%', height = '100%', className = '' }) => {
	return (
		<div className={className} style={{ width, height }}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="50 100 700 480" width="100%" height="100%">
				{/* Background gradient */}
				<defs>
					<linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#0D1117" />
						<stop offset="100%" stopColor="#161B22" />
					</linearGradient>

					{/* Glow filters */}
					<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation="5" result="blur" />
						<feComposite in="SourceGraphic" in2="blur" operator="over" />
					</filter>

					<filter id="small-glow" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation="2" result="blur" />
						<feComposite in="SourceGraphic" in2="blur" operator="over" />
					</filter>

					{/* Datamine color gradient */}
					<linearGradient id="datamine-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#59F6F2" />
						<stop offset="100%" stopColor="#2ECECA" />
					</linearGradient>

					{/* User to Contract animation path */}
					<path id="permission-path" d="M200,300 C300,250 500,250 600,300" />

					{/* Lock animation path */}
					<path id="lock-open-path" d="M400,340 C400,320 400,300 400,280" />
				</defs>
				{/* User Wallet */}
				<g transform="translate(120, 280)">
					<rect x="0" y="0" width="160" height="100" rx="15" fill="#1E2530" stroke="#59F6F2" strokeWidth="2" />
					<rect
						x="20"
						y="20"
						width="120"
						height="25"
						rx="5"
						fill="#0D1117"
						stroke="#59F6F2"
						strokeWidth="1"
						opacity="0.8"
					/>
					<rect x="20" y="55" width="60" height="25" rx="5" fill="#59F6F2" opacity="0.8" />
					<circle cx="130" cy="25" r="15" fill="#0D1117" stroke="#59F6F2" strokeWidth="1" />
					<circle cx="130" cy="25" r="7" fill="#59F6F2" opacity="0.8" />
				</g>

				{/* Contract - Datamine */}
				<g transform="translate(520, 280)">
					<rect x="0" y="0" width="160" height="100" rx="15" fill="#1E2530" stroke="#59F6F2" strokeWidth="2" />
					<path d="M40,30 L120,30 L120,70 L40,70 Z" fill="none" stroke="#59F6F2" strokeWidth="2" />
					<path d="M50,40 L110,40" stroke="#59F6F2" strokeWidth="2" />
					<path d="M50,50 L110,50" stroke="#59F6F2" strokeWidth="2" />
					<path d="M50,60 L110,60" stroke="#59F6F2" strokeWidth="2" />
				</g>

				{/* Lock mechanism representing operator access */}
				<g transform="translate(370, 280)">
					{/* Lock body */}
					<rect x="0" y="30" width="60" height="50" rx="10" fill="#1E2530" stroke="#59F6F2" strokeWidth="2" />

					{/* Lock shackle (closed by default) */}
					<path id="shackle" d="M15,30 C15,10 45,10 45,30" fill="none" stroke="#59F6F2" strokeWidth="3" />

					{/* Lock hole */}
					<circle cx="30" cy="55" r="8" fill="#0D1117" stroke="#59F6F2" strokeWidth="1" />

					{/* Key */}
					<g id="key">
						<circle cx="30" cy="55" r="5" fill="#59F6F2" />
						<rect x="30" y="55" width="40" height="3" rx="1" fill="#59F6F2" />
						<rect x="60" y="52" width="10" height="9" rx="2" fill="#59F6F2" />
						<rect x="65" y="48" width="3" height="5" rx="1" fill="#59F6F2" />
						<rect x="70" y="50" width="3" height="3" rx="1" fill="#59F6F2" />

						{/* Key animation */}
						<animateTransform
							attributeName="transform"
							type="rotate"
							values="0 30 55; 90 30 55; 180 30 55; 270 30 55; 360 30 55"
							dur="3s"
							begin="2s"
							fill="freeze"
						/>
					</g>
				</g>

				{/* Permission request animation */}
				<g>
					{/* Connection line */}
					<path
						d="M200,300 C300,250 500,250 600,300"
						fill="none"
						stroke="#59F6F2"
						strokeWidth="2"
						strokeDasharray="6,3"
						opacity="0.6"
					/>

					{/* Animated data packets */}
					<circle r="5" fill="#59F6F2">
						<animateMotion path="M200,300 C300,250 500,250 600,300" dur="2s" begin="0.5s" fill="freeze" />
						<animate attributeName="opacity" values="1;0" dur="0.3s" begin="2.5s" fill="freeze" />
					</circle>

					{/* Access request packet */}
					<g>
						<rect width="30" height="20" rx="5" fill="#59F6F2" opacity="0.9">
							<animateMotion path="M600,300 C500,250 300,250 200,300" dur="1.5s" begin="3s" fill="freeze" />
							<animate attributeName="opacity" values="0;0.9;0" dur="3s" begin="3s" fill="freeze" />
						</rect>
					</g>

					{/* Access granted packet */}
					<g>
						<polygon points="0,0 15,10 0,20" fill="#59F6F2">
							<animateMotion path="M200,300 C300,350 500,350 600,300" dur="1.5s" begin="5s" fill="freeze" />
							<animate attributeName="opacity" values="0;1;0" dur="3s" begin="5s" fill="freeze" />
						</polygon>
					</g>
				</g>

				{/* Lock animation sequence */}
				<g>
					{/* Lock shackle open animation */}
					<animate
						xlinkHref="#shackle"
						attributeName="d"
						values="M15,30 C15,10 45,10 45,30; M15,30 C15,0 45,0 45,30"
						dur="1s"
						begin="4.5s"
						fill="freeze"
					/>

					{/* Connection authorization effect */}
					<circle cx="400" cy="300" r="50" fill="none" stroke="#59F6F2" strokeWidth="2" opacity="0">
						<animate attributeName="r" values="1;80" dur="1.5s" begin="6.5s" fill="freeze" />
						<animate attributeName="opacity" values="0.8;0" dur="1.5s" begin="6.5s" fill="freeze" />
					</circle>
				</g>

				{/* Final established connection */}
				<g>
					<path d="M200,300 C300,350 500,350 600,300" fill="none" stroke="#59F6F2" strokeWidth="2" opacity="0">
						<animate attributeName="opacity" values="0;0.8" dur="0.5s" begin="7s" fill="freeze" />
					</path>

					{/* Animated dots representing active connection */}
					<circle r="4" fill="#59F6F2" opacity="0">
						<animate attributeName="opacity" values="0;0.9" dur="0.5s" begin="7.5s" fill="freeze" />
						<animateMotion path="M200,300 C300,350 500,350 600,300" dur="3s" begin="7.5s" repeatCount="indefinite" />
					</circle>

					<circle r="4" fill="#59F6F2" opacity="0">
						<animate attributeName="opacity" values="0;0.9" dur="0.5s" begin="8.5s" fill="freeze" />
						<animateMotion path="M200,300 C300,350 500,350 600,300" dur="3s" begin="8.5s" repeatCount="indefinite" />
					</circle>

					<circle r="4" fill="#59F6F2" opacity="0">
						<animate attributeName="opacity" values="0;0.9" dur="0.5s" begin="9.5s" fill="freeze" />
						<animateMotion path="M200,300 C300,350 500,350 600,300" dur="3s" begin="9.5s" repeatCount="indefinite" />
					</circle>
				</g>

				{/* Pulsing glow around the contract after connection is established */}
				<circle cx="600" cy="330" r="90" fill="none" stroke="#59F6F2" strokeWidth="1" opacity="0">
					<animate attributeName="opacity" values="0;0.3" dur="0.5s" begin="7s" fill="freeze" />
					<animate attributeName="r" values="90;100;90" dur="3s" begin="7s" repeatCount="indefinite" />
				</circle>

				{/* Abstract blockchain elements in background */}
				<g opacity="0.2">
					<polygon
						points="700,100 730,115 730,145 700,160 670,145 670,115"
						fill="none"
						stroke="#59F6F2"
						strokeWidth="1"
					/>
					<polygon
						points="100,100 130,115 130,145 100,160 70,145 70,115"
						fill="none"
						stroke="#59F6F2"
						strokeWidth="1"
					/>
					<polygon
						points="700,500 730,515 730,545 700,560 670,545 670,515"
						fill="none"
						stroke="#59F6F2"
						strokeWidth="1"
					/>
					<polygon
						points="100,500 130,515 130,545 100,560 70,545 70,515"
						fill="none"
						stroke="#59F6F2"
						strokeWidth="1"
					/>
				</g>
			</svg>
		</div>
	);
};

const StepThree: React.FC<OnboardingProps> = ({ handleBack, handleNext }) => {
	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Grid container spacing={4} sx={{ flexGrow: 1 }}>
				<Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Box sx={{ maxWidth: '100%', height: 'auto' }}>
						<OperatorSvg />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, md: 7 }}>
					<Box sx={{ p: 3 }}>
						<Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#0FF' }}>
							Allow Validator Smart Contract
						</Typography>

						<Typography variant="body1" paragraph>
							Before you can start a validator, you will need to allow access for Datamine Network to interact with it's
							smart contract.
						</Typography>

						<Typography variant="body1" paragraph>
							This is a one-time process that allows your wallet to access the following functionality:
						</Typography>

						<Typography variant="body1" component="div" sx={{ mb: 2 }}>
							<ul>
								<li>Minting tokens</li>
								<li>Burning tokens to increase your minting speed</li>
								<li>Burning tokens to your friends</li>
							</ul>
						</Typography>

						<Typography variant="body1" paragraph>
							When you click "Approve Access" below, MetaMask will open and ask you to confirm this permission. This
							only gives access to the specific functions needed and never allows moving your tokens without your
							explicit approval.
						</Typography>

						<Typography variant="body2" paragraph sx={{ fontStyle: 'italic', mt: 2 }}>
							Note: You'll only need to do this once per wallet. You are only granting permission to Datamine Ecosystem
							tokens.
						</Typography>
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

export default StepThree;
