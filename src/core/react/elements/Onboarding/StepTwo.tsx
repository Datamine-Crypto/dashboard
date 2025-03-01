import {
	Box,
	Button,
	Grid,
	Typography,
} from '@mui/material';
import { OnboardingProps } from './types';


const MetamaskSvg = ({ width = '100%', height = '100%', className = '' }) => {
	return (
		<div className={className} style={{ width, height }}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="90 180 630 920" width="100%" height="100%">
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

					{/* Metamask branding color gradient */}
					<linearGradient id="metamask-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#F6851B" />
						<stop offset="100%" stopColor="#E2761B" />
					</linearGradient>
				</defs>

				{/* MetaMask hexagon logo (abstracted) */}
				<g transform="translate(0, 200)">
					{/* Central hexagon representing MetaMask */}
					<polygon
						points="400,230 470,270 470,350 400,390 330,350 330,270"
						fill="url(#metamask-gradient)"
						fillOpacity="0.8"
						stroke="#F6851B"
						strokeWidth="3"
						filter="url(#glow)" />

					{/* Animated connection lines from central hexagon */}
					<line x1="400" y1="390" x2="400" y2="500" stroke="#F6851B" strokeWidth="4" opacity="0.8">
						<animate attributeName="strokeDasharray" values="0,30;15,15;30,0" dur="1.5s" repeatCount="indefinite" />
					</line>

					{/* ETH logo abstracted inside a circle */}
					<circle cx="400" cy="550" r="50" fill="#0D1117" stroke="#F6851B" strokeWidth="3" opacity="0.9" />
					<path
						d="M400,520 L370,550 L400,580 L430,550 Z"
						fill="#F6851B"
						opacity="0.9" />
					<path
						d="M400,510 L370,550 L400,570 L430,550 Z"
						fill="#FFFFFF"
						opacity="0.5" />
				</g>

				{/* Wallet interface abstraction */}
				<g transform="translate(250, 650)">
					{/* Wallet container */}
					<rect x="0" y="0" width="300" height="200" rx="15" fill="#1E2530" stroke="#F6851B" strokeWidth="2" opacity="0.9" />

					{/* Wallet header */}
					<rect x="0" y="0" width="300" height="40" rx="15" fill="#F6851B" opacity="0.8" />
					<rect x="0" y="40" width="300" height="1" fill="#F6851B" opacity="0.5" />

					{/* Wallet content */}
					<rect x="20" y="60" width="260" height="30" rx="5" fill="#0D1117" stroke="#F6851B" strokeWidth="1" opacity="0.7" />
					<rect x="20" y="110" width="260" height="20" rx="5" fill="#0D1117" stroke="#F6851B" strokeWidth="1" opacity="0.7" />
					<rect x="20" y="150" width="120" height="30" rx="5" fill="#F6851B" opacity="0.8" />
					<rect x="160" y="150" width="120" height="30" rx="5" fill="#E2761B" opacity="0.8" />
				</g>

				{/* Connecting Web3 elements */}
				<g>
					{/* Blockchain nodes */}
					<circle cx="200" cy="300" r="30" fill="#E2761B" opacity="0.7" filter="url(#small-glow)" />
					<circle cx="600" cy="300" r="30" fill="#E2761B" opacity="0.7" filter="url(#small-glow)" />
					<circle cx="150" cy="500" r="25" fill="#F6851B" opacity="0.7" />
					<circle cx="650" cy="500" r="25" fill="#F6851B" opacity="0.7" />
					<circle cx="200" cy="950" r="30" fill="#E2761B" opacity="0.7" filter="url(#small-glow)" />
					<circle cx="600" cy="950" r="30" fill="#E2761B" opacity="0.7" filter="url(#small-glow)" />

					{/* Connection lines */}
					<line x1="400" y1="300" x2="200" y2="300" stroke="#F6851B" strokeWidth="2" opacity="0.5" />
					<line x1="400" y1="300" x2="600" y2="300" stroke="#F6851B" strokeWidth="2" opacity="0.5" />
					<line x1="400" y1="300" x2="150" y2="500" stroke="#F6851B" strokeWidth="2" opacity="0.5" />
					<line x1="400" y1="300" x2="650" y2="500" stroke="#F6851B" strokeWidth="2" opacity="0.5" />
					<line x1="400" y1="850" x2="200" y2="950" stroke="#F6851B" strokeWidth="2" opacity="0.5" />
					<line x1="400" y1="850" x2="600" y2="950" stroke="#F6851B" strokeWidth="2" opacity="0.5" />

					{/* Data flow animation particles */}
					<circle r="5" fill="#F6851B" opacity="0.8">
						<animateMotion path="M400,300 L200,300" dur="2s" repeatCount="indefinite" />
					</circle>
					<circle r="5" fill="#F6851B" opacity="0.8">
						<animateMotion path="M400,300 L600,300" dur="2.2s" repeatCount="indefinite" />
					</circle>
					<circle r="5" fill="#F6851B" opacity="0.8">
						<animateMotion path="M400,850 L200,950" dur="2.5s" repeatCount="indefinite" />
					</circle>
					<circle r="5" fill="#F6851B" opacity="0.8">
						<animateMotion path="M400,850 L600,950" dur="2.3s" repeatCount="indefinite" />
					</circle>

					{/* ETH transactions */}
					<circle r="4" fill="#FFFFFF" opacity="0.7">
						<animateMotion path="M400,650 L400,850" dur="3s" repeatCount="indefinite" />
					</circle>
					<circle r="4" fill="#FFFFFF" opacity="0.7">
						<animateMotion path="M400,850 L400,650" dur="3.5s" repeatCount="indefinite" />
					</circle>
				</g>

				{/* Digital asset representations */}
				<g>
					{/* Token/NFT abstract symbols */}
					<rect x="130" y="1000" width="40" height="40" rx="5" fill="#0D1117" stroke="#F6851B" strokeWidth="2" />
					<circle cx="150" cy="1020" r="12" fill="#F6851B" opacity="0.8" />

					<rect x="190" y="1000" width="40" height="40" rx="5" fill="#0D1117" stroke="#E2761B" strokeWidth="2" />
					<polygon points="210,1010 220,1020 210,1030 200,1020" fill="#E2761B" opacity="0.8" />

					<rect x="570" y="1000" width="40" height="40" rx="5" fill="#0D1117" stroke="#F6851B" strokeWidth="2" />
					<circle cx="590" cy="1020" r="12" fill="#F6851B" opacity="0.8" />

					<rect x="630" y="1000" width="40" height="40" rx="5" fill="#0D1117" stroke="#E2761B" strokeWidth="2" />
					<polygon points="650,1010 660,1020 650,1030 640,1020" fill="#E2761B" opacity="0.8" />
				</g>

				{/* Connecting dApp icon abstraction */}
				<g transform="translate(250, 200)">
					<rect x="0" y="0" width="60" height="60" rx="10" fill="#0D1117" stroke="#F6851B" strokeWidth="2" opacity="0.8" />
					<circle cx="30" cy="30" r="15" fill="#F6851B" opacity="0.7" />
				</g>

				<g transform="translate(490, 200)">
					<rect x="0" y="0" width="60" height="60" rx="10" fill="#0D1117" stroke="#F6851B" strokeWidth="2" opacity="0.8" />
					<rect x="15" y="15" width="30" height="30" fill="#F6851B" opacity="0.7" />
				</g>

				{/* Connection lines to dApps */}
				<line x1="310" y1="230" x2="400" y2="300" stroke="#F6851B" strokeWidth="2" opacity="0.5" />
				<line x1="490" y1="230" x2="400" y2="300" stroke="#F6851B" strokeWidth="2" opacity="0.5" />

				{/* Animated data particles to dApps */}
				<circle r="4" fill="#F6851B" opacity="0.8">
					<animateMotion path="M400,300 L310,230" dur="1.8s" repeatCount="indefinite" />
				</circle>
				<circle r="4" fill="#F6851B" opacity="0.8">
					<animateMotion path="M400,300 L490,230" dur="1.5s" repeatCount="indefinite" />
				</circle>

				{/* Web3 network pulsing */}
				<circle cx="400" cy="650" r="120" fill="none" stroke="#F6851B" strokeWidth="1" opacity="0.2">
					<animate attributeName="r" values="120;150;120" dur="4s" repeatCount="indefinite" />
					<animate attributeName="opacity" values="0.2;0.1;0.2" dur="4s" repeatCount="indefinite" />
				</circle>

				<circle cx="400" cy="650" r="180" fill="none" stroke="#E2761B" strokeWidth="1" opacity="0.1">
					<animate attributeName="r" values="180;220;180" dur="5s" repeatCount="indefinite" />
					<animate attributeName="opacity" values="0.1;0.05;0.1" dur="5s" repeatCount="indefinite" />
				</circle>

				{/* Hexagonal blockchain elements */}
				<polygon points="150,150 180,135 180,105 150,90 120,105 120,135" fill="none" stroke="#E2761B" strokeWidth="1" opacity="0.5" />
				<polygon points="650,150 680,135 680,105 650,90 620,105 620,135" fill="none" stroke="#E2761B" strokeWidth="1" opacity="0.5" />
				<polygon points="150,1100 180,1085 180,1055 150,1040 120,1055 120,1085" fill="none" stroke="#E2761B" strokeWidth="1" opacity="0.5" />
				<polygon points="650,1100 680,1085 680,1055 650,1040 620,1055 620,1085" fill="none" stroke="#E2761B" strokeWidth="1" opacity="0.5" />
			</svg>
		</div>
	);
};

const StepTwo: React.FC<OnboardingProps> = ({
	handleNext,
	handleBack,
}) => {
	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Grid container spacing={4} sx={{ flexGrow: 1 }}>
				<Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Box sx={{ maxWidth: '100%', height: 'auto' }}>
						<MetamaskSvg />
					</Box>
				</Grid>
				<Grid item xs={12} md={7}>
					<Box sx={{ p: 3 }}>
						<Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#0FF' }}>
							Connect Your Wallet
						</Typography>

						<Typography variant="body1" paragraph>
							You'll need MetaMask to interact with the Datamine Network. MetaMask is a secure digital wallet that lets you safely store your tokens and interact with websites.
						</Typography>

						<Typography variant="body1" paragraph>
							If you already have MetaMask installed, click "Connect" below. If not, you'll need to:
						</Typography>

						<Typography variant="body1" component="div" sx={{ mb: 2 }}>
							<ol>
								<li>Install the MetaMask browser extension from metamask.io</li>
								<li>Create a new wallet or import an existing one</li>
								<li>Make sure you're on Ethereum Mainnet network</li>
								<li>Return to this page and click "Connect"</li>
							</ol>
						</Typography>

						<Typography variant="body1" paragraph>
							Don't worry — your wallet information stays secure and private. We only connect to perform actions you approve.
						</Typography>
					</Box>
				</Grid>
			</Grid>

			<Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
				<Button
					variant="outlined"
					color="primary"
					onClick={handleBack}
					sx={{ minWidth: 120 }}
				>
					Back
				</Button>
				<Button

					variant="outlined" color="secondary"
					onClick={handleNext}
					sx={{ minWidth: 120 }}
				>
					Continue
				</Button>
			</Box>
		</Box>
	);
};

export default StepTwo;