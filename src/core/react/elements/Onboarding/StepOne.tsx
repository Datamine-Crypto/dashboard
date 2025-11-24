import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	FormControlLabel,
	Grid,
	Radio,
	RadioGroup,
	Typography,
} from '@mui/material';
import React from 'react';
import arbiFluxLogo from '@/core/react/svgs/arbiFluxLogo.svg';
import lockquidityLogo from '@/core/react/svgs/lockquidity.svg';
import fluxLogo from '@/core/react/svgs/logo.svg';
import { OnboardingProps } from '@/core/react/elements/Onboarding/types';

// Corporate Memphis style illustration
const CorporateMemphisSvg = ({ width = '100%', height = '100%', className = '' }) => {
	return (
		<div className={className} style={{ width, height }}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 0 680 1150" width="100%" height="100%">
				{/* Background gradient */}
				<defs>
					<linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#0D1117" />
						<stop offset="100%" stopColor="#161B22" />
					</linearGradient>

					{/* Glow filter */}
					<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation="5" result="blur" />
						<feComposite in="SourceGraphic" in2="blur" operator="over" />
					</filter>
				</defs>

				{/* Central node (representing Datamine Network) */}
				<circle cx="400" cy="600" r="80" fill="#59F6F2" opacity="0.8" filter="url(#glow)" />

				{/* Web3 connection nodes */}
				<circle cx="250" cy="300" r="40" fill="#F6B859" opacity="0.7" />
				<circle cx="550" cy="300" r="40" fill="#F6B859" opacity="0.7" />
				<circle cx="200" cy="800" r="40" fill="#F6B859" opacity="0.7" />
				<circle cx="600" cy="800" r="40" fill="#F6B859" opacity="0.7" />
				<circle cx="400" cy="200" r="40" fill="#F65959" opacity="0.7" />
				<circle cx="400" cy="1000" r="40" fill="#F65959" opacity="0.7" />

				{/* Additional nodes for taller design */}
				<circle cx="300" cy="450" r="35" fill="#F6B859" opacity="0.6" />
				<circle cx="500" cy="450" r="35" fill="#F6B859" opacity="0.6" />
				<circle cx="250" cy="900" r="35" fill="#F6B859" opacity="0.6" />
				<circle cx="550" cy="900" r="35" fill="#F6B859" opacity="0.6" />

				{/* Connection lines */}
				<line x1="400" y1="600" x2="250" y2="300" stroke="#59F6F2" strokeWidth="3" opacity="0.5" />
				<line x1="400" y1="600" x2="550" y2="300" stroke="#59F6F2" strokeWidth="3" opacity="0.5" />
				<line x1="400" y1="600" x2="200" y2="800" stroke="#59F6F2" strokeWidth="3" opacity="0.5" />
				<line x1="400" y1="600" x2="600" y2="800" stroke="#59F6F2" strokeWidth="3" opacity="0.5" />
				<line x1="400" y1="600" x2="400" y2="200" stroke="#59F6F2" strokeWidth="3" opacity="0.5" />
				<line x1="400" y1="600" x2="400" y2="1000" stroke="#59F6F2" strokeWidth="3" opacity="0.5" />

				{/* Additional connection lines */}
				<line x1="400" y1="600" x2="300" y2="450" stroke="#59F6F2" strokeWidth="3" opacity="0.5" />
				<line x1="400" y1="600" x2="500" y2="450" stroke="#59F6F2" strokeWidth="3" opacity="0.5" />
				<line x1="400" y1="600" x2="250" y2="900" stroke="#59F6F2" strokeWidth="3" opacity="0.5" />
				<line x1="400" y1="600" x2="550" y2="900" stroke="#59F6F2" strokeWidth="3" opacity="0.5" />

				{/* Small connecting nodes */}
				<circle cx="325" cy="450" r="12" fill="#59F6F2" opacity="0.9" />
				<circle cx="475" cy="450" r="12" fill="#59F6F2" opacity="0.9" />
				<circle cx="300" cy="700" r="12" fill="#59F6F2" opacity="0.9" />
				<circle cx="500" cy="700" r="12" fill="#59F6F2" opacity="0.9" />
				<circle cx="400" cy="400" r="12" fill="#59F6F2" opacity="0.9" />
				<circle cx="400" cy="800" r="12" fill="#59F6F2" opacity="0.9" />

				{/* Additional small nodes */}
				<circle cx="350" cy="350" r="8" fill="#59F6F2" opacity="0.9" />
				<circle cx="450" cy="350" r="8" fill="#59F6F2" opacity="0.9" />
				<circle cx="350" cy="850" r="8" fill="#59F6F2" opacity="0.9" />
				<circle cx="450" cy="850" r="8" fill="#59F6F2" opacity="0.9" />
				<circle cx="350" cy="500" r="8" fill="#59F6F2" opacity="0.9" />
				<circle cx="450" cy="500" r="8" fill="#59F6F2" opacity="0.9" />
				<circle cx="350" cy="700" r="8" fill="#59F6F2" opacity="0.9" />
				<circle cx="450" cy="700" r="8" fill="#59F6F2" opacity="0.9" />

				{/* Additional blockchain blocks */}

				{/* Data flow animation */}
				<circle cx="400" cy="600" r="100" fill="none" stroke="#F6B859" strokeWidth="1" opacity="0.3">
					<animate attributeName="r" values="100;180;100" dur="4s" repeatCount="indefinite" />
					<animate attributeName="opacity" values="0.3;0.1;0.3" dur="4s" repeatCount="indefinite" />
				</circle>

				<circle cx="400" cy="600" r="150" fill="none" stroke="#F65959" strokeWidth="1" opacity="0.2">
					<animate attributeName="r" values="150;240;150" dur="5s" repeatCount="indefinite" />
					<animate attributeName="opacity" values="0.2;0.05;0.2" dur="5s" repeatCount="indefinite" />
				</circle>

				<circle cx="400" cy="600" r="200" fill="none" stroke="#59F6F2" strokeWidth="1" opacity="0.15">
					<animate attributeName="r" values="200;300;200" dur="6s" repeatCount="indefinite" />
					<animate attributeName="opacity" values="0.15;0.03;0.15" dur="6s" repeatCount="indefinite" />
				</circle>

				{/* Small data particles moving along connection lines */}
				<circle r="5" fill="#59F6F2" opacity="0.8">
					<animateMotion path="M400,600 L250,300" dur="3.5s" repeatCount="indefinite" />
				</circle>

				<circle r="5" fill="#59F6F2" opacity="0.8">
					<animateMotion path="M400,600 L550,300" dur="3s" repeatCount="indefinite" />
				</circle>

				<circle r="5" fill="#59F6F2" opacity="0.8">
					<animateMotion path="M400,600 L200,800" dur="4s" repeatCount="indefinite" />
				</circle>

				<circle r="5" fill="#59F6F2" opacity="0.8">
					<animateMotion path="M400,600 L600,800" dur="4.5s" repeatCount="indefinite" />
				</circle>

				<circle r="5" fill="#59F6F2" opacity="0.8">
					<animateMotion path="M400,600 L400,200" dur="3.2s" repeatCount="indefinite" />
				</circle>

				<circle r="5" fill="#59F6F2" opacity="0.8">
					<animateMotion path="M400,600 L400,1000" dur="4.2s" repeatCount="indefinite" />
				</circle>

				{/* Additional data particles */}
				<circle r="4" fill="#F6B859" opacity="0.7">
					<animateMotion path="M400,600 L300,450" dur="2.8s" repeatCount="indefinite" />
				</circle>

				<circle r="4" fill="#F6B859" opacity="0.7">
					<animateMotion path="M400,600 L500,450" dur="2.5s" repeatCount="indefinite" />
				</circle>

				<circle r="4" fill="#F6B859" opacity="0.7">
					<animateMotion path="M400,600 L250,900" dur="3.8s" repeatCount="indefinite" />
				</circle>

				<circle r="4" fill="#F6B859" opacity="0.7">
					<animateMotion path="M400,600 L550,900" dur="3.6s" repeatCount="indefinite" />
				</circle>

				{/* Hexagonal pattern elements (blockchain/web3 symbolism) */}
				<polygon
					points="100,200 130,175 130,125 100,100 70,125 70,175"
					fill="none"
					stroke="#F6B859"
					strokeWidth="1"
					opacity="0.5"
				/>
				<polygon
					points="700,200 730,175 730,125 700,100 670,125 670,175"
					fill="none"
					stroke="#F6B859"
					strokeWidth="1"
					opacity="0.5"
				/>
				<polygon
					points="150,1050 180,1025 180,975 150,950 120,975 120,1025"
					fill="none"
					stroke="#F6B859"
					strokeWidth="1"
					opacity="0.5"
				/>
				<polygon
					points="650,1050 680,1025 680,975 650,950 620,975 620,1025"
					fill="none"
					stroke="#F6B859"
					strokeWidth="1"
					opacity="0.5"
				/>

				{/* Additional hexagons for taller design */}
				<polygon
					points="120,500 150,475 150,425 120,400 90,425 90,475"
					fill="none"
					stroke="#F65959"
					strokeWidth="1"
					opacity="0.4"
				/>
				<polygon
					points="680,500 710,475 710,425 680,400 650,425 650,475"
					fill="none"
					stroke="#F65959"
					strokeWidth="1"
					opacity="0.4"
				/>
				<polygon
					points="250,100 280,75 280,25 250,0 220,25 220,75"
					fill="none"
					stroke="#59F6F2"
					strokeWidth="1"
					opacity="0.3"
				/>
				<polygon
					points="550,100 580,75 580,25 550,0 520,25 520,75"
					fill="none"
					stroke="#59F6F2"
					strokeWidth="1"
					opacity="0.3"
				/>
				<polygon
					points="250,1150 280,1125 280,1075 250,1050 220,1075 220,1125"
					fill="none"
					stroke="#59F6F2"
					strokeWidth="1"
					opacity="0.3"
				/>
				<polygon
					points="550,1150 580,1125 580,1075 550,1050 520,1075 520,1125"
					fill="none"
					stroke="#59F6F2"
					strokeWidth="1"
					opacity="0.3"
				/>
			</svg>
		</div>
	);
};

// Token SVGs
const LockquiditySvg = () => <img src={lockquidityLogo} width={40} height={40} style={{ verticalAlign: 'middle' }} />;

const ArbiFluxSvg = () => <img src={arbiFluxLogo} width={40} height={40} style={{ verticalAlign: 'middle' }} />;

const FluxSvg = () => <img src={fluxLogo} width={40} height={40} style={{ verticalAlign: 'middle' }} />;

const StepOne: React.FC<OnboardingProps> = ({ handleNext, handleBack, handleSelectOption, selectedOption }) => {
	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Grid container spacing={4} sx={{ flexGrow: 1 }}>
				<Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Box sx={{ maxWidth: '100%', height: 'auto' }}>
						<CorporateMemphisSvg />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, md: 7 }}>
					<Box sx={{ p: 3 }}>
						<Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#0FF' }}>
							Select your Ecosystem
						</Typography>
						<Typography variant="body1" paragraph>
							Datamine Network consists of multiple ecosystems. We recommend starting with Lockquidity which features
							the latest and greatest features. You can switch between ecosystems any time.
						</Typography>
						<RadioGroup value={selectedOption} onChange={(e) => handleSelectOption(e.target.value)}>
							<Card
								sx={{
									mb: 2,
									bgcolor: selectedOption === 'lockquidity' ? 'rgba(0, 255, 255, 0.1)' : 'background.paper',
									borderColor: selectedOption === 'lockquidity' ? '#0FF' : 'transparent',
									borderWidth: 1,
									borderStyle: 'solid',
									position: 'relative',
									cursor: 'pointer',
									transition: 'all 0.2s ease-in-out',
									'&:hover': {
										bgcolor: selectedOption === 'lockquidity' ? 'rgba(0, 255, 255, 0.15)' : 'rgba(0, 255, 255, 0.05)',
										transform: 'translateY(-2px)',
										boxShadow: '0px 4px 8px rgba(0, 255, 255, 0.1)',
									},
								}}
								onClick={() => handleSelectOption('lockquidity')}
							>
								<Chip
									label="Recommended"
									size="small"
									sx={{
										position: 'absolute',
										top: 10,
										right: 10,
										bgcolor: '#0FF',
										color: '#202336',
										fontWeight: 'bold',
									}}
								/>
								<CardContent>
									<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
										<FormControlLabel
											value="lockquidity"
											control={<Radio sx={{ color: '#0FF', '&.Mui-checked': { color: '#0FF' } }} />}
											label=""
											sx={{ m: 0 }}
											onClick={(e) => e.stopPropagation()}
											checked={selectedOption === 'lockquidity'}
										/>
										<Avatar sx={{ ml: 1, bgcolor: 'transparent', width: 40, height: 40 }}>
											<LockquiditySvg />
										</Avatar>
										<Box sx={{ ml: 2 }}>
											<Typography variant="h6">Lockquidity</Typography>
											<Typography variant="body2">
												Cutting-edge features: Permanent Liquidity, Low Volatility, Instant Transactions, Cheap Fees,
												Large Liquidity Pool
											</Typography>
										</Box>
									</Box>
								</CardContent>
							</Card>

							<Card
								sx={{
									mb: 2,
									bgcolor: selectedOption === 'arbiflux' ? 'rgba(0, 255, 255, 0.1)' : 'background.paper',
									borderColor: selectedOption === 'arbiflux' ? '#0FF' : 'transparent',
									borderWidth: 1,
									borderStyle: 'solid',
									cursor: 'pointer',
									transition: 'all 0.2s ease-in-out',
									'&:hover': {
										bgcolor: selectedOption === 'arbiflux' ? 'rgba(0, 255, 255, 0.15)' : 'rgba(0, 255, 255, 0.05)',
										transform: 'translateY(-2px)',
										boxShadow: '0px 4px 8px rgba(0, 255, 255, 0.1)',
									},
								}}
								onClick={() => handleSelectOption('arbiflux')}
							>
								<CardContent>
									<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
										<FormControlLabel
											value="arbiflux"
											control={<Radio sx={{ color: '#0FF', '&.Mui-checked': { color: '#0FF' } }} />}
											label=""
											sx={{ m: 0 }}
											onClick={(e) => e.stopPropagation()}
											checked={selectedOption === 'arbiflux'}
										/>
										<Avatar sx={{ ml: 1, bgcolor: 'transparent', width: 40, height: 40 }}>
											<ArbiFluxSvg />
										</Avatar>
										<Box sx={{ ml: 2 }}>
											<Typography variant="h6">ArbiFLUX</Typography>
											<Typography variant="body2">
												Generates tokens for Lockquidity ecosystem. High volatility, Instant Transactions, Cheap Fees.
												Warning: Low liquidity.
											</Typography>
										</Box>
									</Box>
								</CardContent>
							</Card>

							<Card
								sx={{
									mb: 2,
									bgcolor: selectedOption === 'flux' ? 'rgba(0, 255, 255, 0.1)' : 'background.paper',
									borderColor: selectedOption === 'flux' ? '#0FF' : 'transparent',
									borderWidth: 1,
									borderStyle: 'solid',
									cursor: 'pointer',
									transition: 'all 0.2s ease-in-out',
									'&:hover': {
										bgcolor: selectedOption === 'flux' ? 'rgba(0, 255, 255, 0.15)' : 'rgba(0, 255, 255, 0.05)',
										transform: 'translateY(-2px)',
										boxShadow: '0px 4px 8px rgba(0, 255, 255, 0.1)',
									},
								}}
								onClick={() => handleSelectOption('flux')}
							>
								<CardContent>
									<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
										<FormControlLabel
											value="flux"
											control={<Radio sx={{ color: '#0FF', '&.Mui-checked': { color: '#0FF' } }} />}
											label=""
											sx={{ m: 0 }}
											onClick={(e) => e.stopPropagation()}
											checked={selectedOption === 'flux'}
										/>
										<Avatar sx={{ ml: 1, bgcolor: 'transparent', width: 40, height: 40 }}>
											<FluxSvg />
										</Avatar>
										<Box sx={{ ml: 2 }}>
											<Typography variant="h6">FLUX</Typography>
											<Typography variant="body2">
												Generates tokens for ArbiFLUX ecosystem. Low volatility. Warning: Expensive Fees & Slow
												Transactions.
											</Typography>
										</Box>
									</Box>
								</CardContent>
							</Card>
						</RadioGroup>
					</Box>
				</Grid>
			</Grid>

			<Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
				<Button variant="outlined" color="primary" onClick={handleBack} sx={{ minWidth: 120 }}>
					Skip
				</Button>
				<Button variant="outlined" color="secondary" onClick={handleNext} sx={{ minWidth: 120 }}>
					Continue
				</Button>
			</Box>
		</Box>
	);
};
export default StepOne;
