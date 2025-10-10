import {
	ArrowForward as ArrowForwardIcon,
	BarChart as BarChartIcon,
	Lock as LockIcon,
	Shield as ShieldIcon,
	Sync as SyncIcon,
	TrendingUp as TrendingUpIcon,
	PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { Box, Button, Card, CardContent, Divider, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Ecosystem } from '../../../configs/config.common';
import arbiFluxLogo from '../../../svgs/arbiFluxLogo.svg';
import fluxLogo from '../../../svgs/fluxLogo.svg';
import lockquidityLogo from '../../../svgs/lockquidity.svg';
import damLogo from '../../../svgs/logo.svg';

import Grid from '@mui/system/Grid';
import { useWeb3Context } from '../../web3/Web3Context';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from '../elements/Fragments/ExploreLiquidityPools';
import FooterFragment from '../elements/Fragments/FooterFragment';

// Color palette
const palette = {
	highlight: '#0FF',
	background: '#272936',
	secondaryBackground: '#202336',
};

// Main component
interface RenderParams {
	dispatch: React.Dispatch<any>;
	ecosystem: Ecosystem;
}
// Main component
/**
 * A memoized functional component that renders the main content of the Token Page.
 * It displays information about DAM, FLUX, ArbiFLUX, and LOCK tokens, including their roles, uses, and ecosystem flow.
 * It also features security audit links and an integration flow section.
 * @param params - Object containing dispatch function and ecosystem.
 */
const Render: React.FC<RenderParams> = React.memo(({ dispatch, ecosystem }) => {
	// Animation states
	const [animateDAM, setAnimateDAM] = useState(false);
	const [animateFLUX, setAnimateFLUX] = useState(false);
	const [animateArbiFLUX, setAnimateArbiFLUX] = useState(false);
	const [animateLOCK, setAnimateLOCK] = useState(false);

	/**
	 * Navigates the user to the dashboard page.
	 */
	const navigateDashboard = () => {
		window.location.href = '#dashboard'; // @todo
	};
	/**
	 * Renders a button to explore liquidity pools.
	 * @returns A Grid component containing the ExploreLiquidityPools button.
	 */
	const getLiqudityPoolsButton = () => {
		return (
			<Grid>
				<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.ExtraLargeButton} ecosystem={ecosystem} />
			</Grid>
		);
	};
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
					<Box mb={2}>
						<Grid container spacing={4} justifyContent="center" alignItems="center">
							{getLiqudityPoolsButton()}
							<Grid>
								<Button
									variant="outlined"
									color="secondary"
									size="large"
									style={{ fontSize: '1.1rem' }}
									onClick={navigateDashboard}
									startIcon={<PlayArrowIcon />}
								>
									Go to Liquidity Dashboard
								</Button>
							</Grid>
						</Grid>
					</Box>

					{/* Introduction Card */}
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
						<Typography sx={{ fontSize: '1.25rem', mb: 2 }}>
							Datamine Network is a decentralized system designed to:
						</Typography>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
							<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
								<ShieldIcon sx={{ color: palette.highlight, mr: 2, mt: 0.5 }} />
								<Typography>
									<Box component="span" sx={{ fontWeight: 'bold', color: palette.highlight }}>
										Manage Inflation:
									</Box>{' '}
									Keeps token supply balanced to maintain value.
								</Typography>
							</Box>

							<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
								<BarChartIcon sx={{ color: palette.highlight, mr: 2, mt: 0.5 }} />
								<Typography>
									<Box component="span" sx={{ fontWeight: 'bold', color: palette.highlight }}>
										Promote Stability:
									</Box>{' '}
									Reduces market swings and increases liquidity.
								</Typography>
							</Box>

							<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
								<TrendingUpIcon sx={{ color: palette.highlight, mr: 2, mt: 0.5 }} />
								<Typography>
									<Box component="span" sx={{ fontWeight: 'bold', color: palette.highlight }}>
										Reward Participation:
									</Box>{' '}
									Offers incentives for contributing to the ecosystem.
								</Typography>
							</Box>
						</Box>

						<Typography sx={{ fontSize: '1.125rem' }}>
							Our ecosystem revolves around four tokens—DAM, FLUX, ArbiFLUX, and LOCK—each playing a unique role.
						</Typography>
					</Paper>

					{/* Token Flow Diagram */}
					<Box
						sx={{
							maxWidth: '1152px',
							mx: 'auto',
							mb: 6,
							p: 3,
							bgcolor: palette.secondaryBackground,
							borderRadius: 2,
						}}
					>
						<Typography
							variant="h3"
							sx={{
								fontSize: '1.5rem', // text-2xl
								fontWeight: 'bold',
								mb: 4,
								textAlign: 'center',
							}}
						>
							Datamine Ecosystem Flow
						</Typography>

						<svg viewBox="0 0 800 200" width="100%" height="200">
							{/* DAM */}
							<g transform="translate(62, 106)">
								<image href={damLogo} x="-44" y="-44" width="76" height="76" />
								<text x="-4" y="45" textAnchor="middle" fill="white" fontSize="10">
									DAM
								</text>
							</g>

							{/* Arrow 1 */}
							<g transform="translate(100, 100)">
								<line x1="0" y1="0" x2="120" y2="0" stroke="#4b5563" strokeWidth="2" strokeDasharray="5,5" />
								<polygon
									points="120,0 110,-5 110,5"
									fill="#4b5563"
									style={{ animation: animateDAM ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }}
								/>
								<text x="60" y="-10" textAnchor="middle" fill="#9ca3af" fontSize="12">
									Lock
								</text>
							</g>

							{/* FLUX */}
							<g transform="translate(266, 106)">
								<image href={fluxLogo} x="-44" y="-44" width="76" height="76" />
								<text x="-4" y="45" textAnchor="middle" fill="white" fontSize="10">
									FLUX
								</text>
							</g>

							{/* Arrow 2 */}
							<g transform="translate(300, 100)">
								<line x1="0" y1="0" x2="120" y2="0" stroke="#4b5563" strokeWidth="2" strokeDasharray="5,5" />
								<polygon
									points="120,0 110,-5 110,5"
									fill="#4b5563"
									style={{ animation: animateFLUX ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }}
								/>
								<text x="60" y="-10" textAnchor="middle" fill="#9ca3af" fontSize="12">
									Bridge & Lock
								</text>
							</g>

							{/* ArbiFLUX */}
							<g transform="translate(464, 106)">
								<image href={arbiFluxLogo} x="-44" y="-44" width="76" height="76" />
								<text x="-4" y="45" textAnchor="middle" fill="white" fontSize="10">
									ArbiFLUX
								</text>
							</g>

							{/* Arrow 3 */}
							<g transform="translate(500, 100)">
								<line x1="0" y1="0" x2="120" y2="0" stroke="#4b5563" strokeWidth="2" strokeDasharray="5,5" />
								<polygon
									points="120,0 110,-5 110,5"
									fill="#4b5563"
									style={{ animation: animateArbiFLUX ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }}
								/>
								<text x="60" y="-10" textAnchor="middle" fill="#9ca3af" fontSize="12">
									Lock
								</text>
							</g>

							{/* LOCK */}
							<g transform="translate(666, 106)">
								<image href={lockquidityLogo} x="-44" y="-44" width="76" height="76" />
								<text x="-4" y="45" textAnchor="middle" fill="white" fontSize="10">
									Lockquidity
								</text>
							</g>
						</svg>
					</Box>

					{/* Token Sections */}
					<Grid container spacing={4} sx={{ maxWidth: '1152px', mx: 'auto' }}>
						{/* DAM Section */}
						<Grid size={{ xs: 12, md: 6 }}>
							<Card
								sx={{
									height: '100%',
									bgcolor: palette.secondaryBackground,
									borderLeft: `4px solid ${palette.highlight}`,
									borderRadius: 2,
									boxShadow: 3,
								}}
							>
								<CardContent sx={{ p: 3 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
										<Box
											sx={{
												p: 1.5,
												borderRadius: '50%',
												mr: 2,
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
											}}
										>
											<img src={damLogo} width={40} height={40} style={{ verticalAlign: 'middle' }} />
										</Box>
										<Typography
											variant="h4"
											sx={{
												fontSize: '1.5rem',
												fontWeight: 'bold',
												color: palette.highlight,
											}}
										>
											DAM: The Foundation Token
										</Typography>
									</Box>
									<Divider sx={{ my: 2, borderColor: '#374151' }} /> {/* border-gray-700 */}
									<Box sx={{ ml: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
										<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
											<ArrowForwardIcon
												sx={{ color: palette.highlight, mr: 1, mt: 0.5, flexShrink: 0 }}
												fontSize="small"
											/>
											<Typography sx={{ color: '#e5e7eb' }}>
												{' '}
												{/* text-gray-200 */}
												<Box component="span" sx={{ fontWeight: 'bold' }}>
													Role:
												</Box>{' '}
												DAM anchors the system and has a capped supply of 16,876,779 tokens.
											</Typography>
										</Box>

										<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
											<ArrowForwardIcon sx={{ color: '#60a5fa', mr: 1, mt: 0.5, flexShrink: 0 }} fontSize="small" />
											<Typography sx={{ color: '#e5e7eb' }}>
												{' '}
												{/* text-gray-200 */}
												<Box component="span" sx={{ fontWeight: 'bold' }}>
													Use:
												</Box>{' '}
												Lock DAM on Layer 1 (Ethereum) to mint FLUX, which drives participation and value stability.
											</Typography>
										</Box>
									</Box>
									<Box
										sx={{
											mt: 3,
											bgcolor: palette.background,
											p: 2,
											borderRadius: 1,
										}}
									>
										<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<Typography sx={{ color: '#9ca3af' }}>Supply Cap</Typography> {/* text-gray-400 */}
											<Typography sx={{ fontWeight: 'bold' }}>16,876,779 DAM</Typography>
										</Box>

										<Box sx={{ mt: 1, pt: 0.5, position: 'relative' }}>
											<Box
												sx={{
													height: '8px', // h-2
													borderRadius: '4px',
													bgcolor: '#374151', // bg-gray-700
													overflow: 'hidden',
													display: 'flex',
												}}
											>
												<Box
													sx={{
														width: '75%', // w-3/4
														bgcolor: '#3b82f6', // bg-blue-500
														display: 'flex',
														flexDirection: 'column',
														justifyContent: 'center',
														textAlign: 'center',
														whiteSpace: 'nowrap',
														color: 'white',
													}}
												></Box>
											</Box>
										</Box>
									</Box>
								</CardContent>
							</Card>
						</Grid>

						{/* FLUX Section */}
						<Grid size={{ xs: 12, md: 6 }}>
							<Card
								sx={{
									height: '100%',
									bgcolor: palette.secondaryBackground,
									borderLeft: `4px solid ${palette.highlight}`,
									borderRadius: 2,
									boxShadow: 3,
								}}
							>
								<CardContent sx={{ p: 3 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
										<Box
											sx={{
												p: 1.5,
												borderRadius: '50%',
												mr: 2,
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
											}}
										>
											<img src={fluxLogo} width={40} height={40} style={{ verticalAlign: 'middle' }} />
										</Box>
										<Typography
											variant="h4"
											sx={{
												fontSize: '1.5rem',
												fontWeight: 'bold',
												color: palette.highlight,
											}}
										>
											FLUX: The Layer 1 Utility Token
										</Typography>
									</Box>
									<Divider sx={{ my: 2, borderColor: '#374151' }} /> {/* border-gray-700 */}
									<Box sx={{ ml: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
										<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
											<ArrowForwardIcon
												sx={{ color: palette.highlight, mr: 1, mt: 0.5, flexShrink: 0 }}
												fontSize="small"
											/>
											<Typography sx={{ color: '#e5e7eb' }}>
												{' '}
												{/* text-gray-200 */}
												<Box component="span" sx={{ fontWeight: 'bold' }}>
													Role:
												</Box>{' '}
												FLUX is minted when DAM is locked. It&apos;s used for rewards and transactions.
											</Typography>
										</Box>

										<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
											<ArrowForwardIcon sx={{ color: '#a855f7', mr: 1, mt: 0.5, flexShrink: 0 }} fontSize="small" />
											<Typography sx={{ color: '#e5e7eb' }}>
												{' '}
												{/* text-gray-200 */}
												<Box component="span" sx={{ fontWeight: 'bold' }}>
													Use:
												</Box>{' '}
												Validators can burn FLUX to boost minting rewards and reduce its supply. FLUX can also be
												bridged to Layer 2, where it can be locked to create ArbiFLUX.
											</Typography>
										</Box>
									</Box>
									<Box
										sx={{
											mt: 3,
											bgcolor: '#111827', // bg-gray-900
											p: 2,
											borderRadius: 1,
										}}
									>
										<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
											<LockIcon sx={{ color: palette.highlight, mr: 1 }} fontSize="small" />
											<Typography sx={{ color: '#e5e7eb' }}>Lock DAM</Typography>
											<ArrowForwardIcon sx={{ color: '#6b7280', mx: 1 }} fontSize="small" />
											<Typography sx={{ color: palette.highlight, fontWeight: 'bold' }}>Mint FLUX</Typography>
										</Box>

										<Box sx={{ display: 'flex', alignItems: 'center' }}>
											<SyncIcon sx={{ color: palette.highlight, mr: 1 }} fontSize="small" />
											<Typography sx={{ color: '#e5e7eb' }}>Burn FLUX</Typography>
											<ArrowForwardIcon sx={{ color: '#6b7280', mx: 1 }} fontSize="small" />
											<Typography sx={{ color: palette.highlight, fontWeight: 'bold' }}>Boost APY</Typography>
										</Box>
									</Box>
								</CardContent>
							</Card>
						</Grid>

						{/* ArbiFLUX Section */}
						<Grid size={{ xs: 12, md: 6 }}>
							<Card
								sx={{
									height: '100%',
									bgcolor: palette.secondaryBackground,
									borderLeft: `4px solid ${palette.highlight}`,
									borderRadius: 2,
									boxShadow: 3,
								}}
							>
								<CardContent sx={{ p: 3 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
										<Box
											sx={{
												p: 1.5,
												borderRadius: '50%',
												mr: 2,
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
											}}
										>
											<img src={arbiFluxLogo} width={40} height={40} style={{ verticalAlign: 'middle' }} />
										</Box>
										<Typography
											variant="h4"
											sx={{
												fontSize: '1.5rem',
												fontWeight: 'bold',
												color: palette.highlight,
											}}
										>
											ArbiFLUX: The Layer 2 Efficiency Token
										</Typography>
									</Box>
									<Divider sx={{ my: 2, borderColor: '#374151' }} /> {/* border-gray-700 */}
									<Box sx={{ ml: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
										<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
											<ArrowForwardIcon
												sx={{ color: palette.highlight, mr: 1, mt: 0.5, flexShrink: 0 }}
												fontSize="small"
											/>
											<Typography sx={{ color: '#e5e7eb' }}>
												{' '}
												{/* text-gray-200 */}
												<Box component="span" sx={{ fontWeight: 'bold' }}>
													Role:
												</Box>{' '}
												ArbiFLUX operates on Arbitrum (Layer 2) and is created by locking FLUX.
											</Typography>
										</Box>

										<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
											<ArrowForwardIcon sx={{ color: '#f472b6', mr: 1, mt: 0.5, flexShrink: 0 }} fontSize="small" />
											<Typography sx={{ color: '#e5e7eb' }}>
												{' '}
												{/* text-gray-200 */}
												<Box component="span" sx={{ fontWeight: 'bold' }}>
													Use:
												</Box>{' '}
												Lower Costs & Faster Transactions: Designed for scalability and efficiency. Validators can burn
												ArbiFLUX to boost minting rewards on Layer 2, or lock ArbiFLUX to create LOCK.
											</Typography>
										</Box>
									</Box>
									<Box
										sx={{
											mt: 3,
											bgcolor: '#111827', // bg-gray-900
											p: 2,
											borderRadius: 1,
										}}
									>
										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
											<Typography sx={{ color: '#9ca3af' }}>Transaction Cost</Typography>
											<Box sx={{ display: 'flex', alignItems: 'center' }}>
												<Box
													sx={{
														px: 1,
														py: 0.5,
														bgcolor: '#581c87', // bg-purple-900
														borderTopLeftRadius: '4px',
														borderBottomLeftRadius: '4px',
														fontSize: '0.75rem',
														fontWeight: 'bold',
													}}
												>
													Layer 1
												</Box>
												<Box
													sx={{
														px: 1,
														py: 0.5,
														bgcolor: '#831843', // bg-pink-900
														borderTopRightRadius: '4px',
														borderBottomRightRadius: '4px',
														fontSize: '0.75rem',
														fontWeight: 'bold',
														color: palette.highlight, // Cyan highlight color
													}}
												>
													Layer 2 ↓98%
												</Box>
											</Box>
										</Box>

										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
											<Typography sx={{ color: '#9ca3af' }}>Transaction Speed</Typography>
											<Box sx={{ display: 'flex', alignItems: 'center' }}>
												<Box
													sx={{
														px: 1,
														py: 0.5,
														bgcolor: '#581c87', // bg-purple-900
														borderTopLeftRadius: '4px',
														borderBottomLeftRadius: '4px',
														fontSize: '0.75rem',
														fontWeight: 'bold',
													}}
												>
													Layer 1
												</Box>
												<Box
													sx={{
														px: 1,
														py: 0.5,
														bgcolor: '#831843', // bg-pink-900
														borderTopRightRadius: '4px',
														borderBottomRightRadius: '4px',
														fontSize: '0.75rem',
														fontWeight: 'bold',
														color: palette.highlight,
													}}
												>
													Layer 2 ↑50x
												</Box>
											</Box>
										</Box>
									</Box>
								</CardContent>
							</Card>
						</Grid>

						{/* LOCK Section */}
						<Grid size={{ xs: 12, md: 6 }}>
							<Card
								sx={{
									height: '100%',
									bgcolor: palette.secondaryBackground,
									borderLeft: `4px solid ${palette.highlight}`,
									borderRadius: 2,
									boxShadow: 3,
								}}
							>
								<CardContent sx={{ p: 3 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
										<Box
											sx={{
												p: 1.5,
												borderRadius: '50%',
												mr: 2,
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
											}}
										>
											<img src={lockquidityLogo} width={40} height={40} style={{ verticalAlign: 'middle' }} />
										</Box>
										<Typography
											variant="h4"
											sx={{
												fontSize: '1.5rem',
												fontWeight: 'bold',
												color: palette.highlight,
											}}
										>
											LOCK: The Stability and Liquidity Token
										</Typography>
									</Box>
									<Divider sx={{ my: 2, borderColor: '#374151' }} /> {/* border-gray-700 */}
									<Box sx={{ ml: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
										<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
											<ArrowForwardIcon
												sx={{ color: palette.highlight, mr: 1, mt: 0.5, flexShrink: 0 }}
												fontSize="small"
											/>
											<Typography sx={{ color: '#e5e7eb' }}>
												{' '}
												{/* text-gray-200 */}
												<Box component="span" sx={{ fontWeight: 'bold' }}>
													Role:
												</Box>{' '}
												LOCK enhances stability by contributing to a permanent liquidity pool.
											</Typography>
										</Box>

										<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
											<ArrowForwardIcon sx={{ color: '#4ade80', mr: 1, mt: 0.5, flexShrink: 0 }} fontSize="small" />
											<Typography sx={{ color: '#e5e7eb' }}>
												{' '}
												{/* text-gray-200 */}
												<Box component="span" sx={{ fontWeight: 'bold' }}>
													Use:
												</Box>{' '}
												Minted by locking ArbiFLUX. Can also be burned, but instead of reducing supply, this redirects
												value to the liquidity pool, ensuring long-term stability.
											</Typography>
										</Box>
									</Box>
									<Box
										sx={{
											mt: 3,
											bgcolor: '#111827', // bg-gray-900
											p: 2,
											borderRadius: 1,
										}}
									>
										<Typography sx={{ color: '#e5e7eb', mb: 1 }}>
											<Box component="span" sx={{ fontWeight: 'bold', color: palette.highlight }}>
												Permanent Liquidity Pool
											</Box>
										</Typography>

										<svg viewBox="0 0 200 60" width="100%" height="60">
											<rect
												x="10"
												y="10"
												width="180"
												height="40"
												rx="5"
												fill="#064e3b"
												stroke="#10b981"
												strokeWidth="1"
											/>
											<circle cx="50" cy="30" r="15" fill="#831843" opacity="0.7" />
											<circle cx="70" cy="30" r="15" fill="#4c1d95" opacity="0.7" />
											<circle cx="90" cy="30" r="15" fill="#1e3a8a" opacity="0.7" />
											<text x="130" y="35" fill="#d1d5db" fontSize="12" textAnchor="middle">
												Reduced Volatility
											</text>
										</svg>
									</Box>
								</CardContent>
							</Card>
						</Grid>
					</Grid>

					{/* Security Section */}
					<Paper
						sx={{
							maxWidth: '1152px',
							mx: 'auto',
							mt: 6,
							mb: 6,
							p: 3,
							bgcolor: palette.secondaryBackground,
							borderRadius: 2,
						}}
					>
						<Typography
							variant="h3"
							sx={{
								fontSize: '1.5rem', // text-2xl
								fontWeight: 'bold',
								mb: 3,
								textAlign: 'center',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<svg viewBox="0 0 24 24" width="24" height="24" style={{ marginRight: '8px' }}>
								<path
									fill={palette.highlight}
									d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4c1.86 0 3.41 1.28 3.86 3H8.14c.45-1.72 2-3 3.86-3zm0 14c-3.08-1.39-5.39-4.39-5.92-8h11.84c-.53 3.61-2.84 6.61-5.92 8z"
								/>
							</svg>
							Security Audits
						</Typography>

						<Box
							sx={{
								display: 'flex',
								flexDirection: { xs: 'column', md: 'row' },
								gap: 3,
								justifyContent: 'center',
								alignItems: 'stretch',
								mb: 2,
							}}
						>
							<Card
								sx={{
									flex: 1,
									bgcolor: palette.background,
									border: `1px solid ${palette.highlight}`,
									borderRadius: 2,
								}}
							>
								<CardContent>
									<Typography sx={{ fontWeight: 'bold', color: palette.highlight, mb: 2, textAlign: 'center' }}>
										DAM Token Audit
									</Typography>

									<Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
										<svg width="80" height="80" viewBox="480 480 1040 1040">
											<circle cx="1000" cy="1000" r="500" fill="#202336" />
											<path
												fill="#fff"
												d="M806.39 855.43L695 919.9V790.96zM807.01 1000L695 1064.47V935.53zM806.39 1144.57L695 1209.04V1080.1zM810.92 1007.82v128.94l-112.01-64.47zM810.92 718.67l.65 128.94-112.04-64.47zM810.92 863.24l.65 128.95-112.04-64.47zM810.92 1152.39l.65 128.94-112.04-64.47zM820.69 847.61V718.67l111.35 64.47z"
											/>
											<path fill="#0ff" d="M820.69 1152.39l111.35 64.47-111.35 64.47z" />
											<path
												fill="#fff"
												d="M825.25 855.43l111.35-64.47V919.9zM945.72 919.9V790.96l111.36 64.47zM945.72 935.53l111.36 64.47-111.36 64.47zM945.72 1080.1l111.36 64.47-111.36 64.47zM950.28 927.72l111.36-64.48v128.95zM1061.64 1007.82v128.94l-111.36-64.47zM1179.96 795.85v128.94l-111.35-64.47zM1300.47 860.32l-111.39 64.47-.5-128.94zM1189.08 1084.99l111.39 64.47-111.89 64.47zM1301.09 1004.89l-112.01 64.47V940.42zM1305 1012.7v128.94l-112.01-64.47zM1305 1157.94v128.95l-112.01-64.47zM1193.61 788.03L1305 723.56V852.5zM1305 868.13v128.94l-111.39-64.47z"
											/>
											<path
												fill="#0ff"
												d="M1367.77 632.23c-94.09-94.1-224.18-152.34-367.77-152.33-143.59-.01-273.68 58.23-367.77 152.33-94.1 94.09-152.34 224.18-152.33 367.77-.01 143.59 58.23 273.68 152.33 367.77 94.09 94.1 224.18 152.34 367.77 152.33 143.59.01 273.68-58.23 367.77-152.33 94.1-94.09 152.34-224.18 152.33-367.77.01-143.59-58.23-273.68-152.33-367.77zm-14.07 721.47c-90.55 90.53-215.54 146.5-353.7 146.51-138.16-.01-263.15-55.97-353.7-146.51-90.54-90.55-146.5-215.54-146.51-353.7.01-138.16 55.97-263.15 146.51-353.7 90.55-90.54 215.54-146.5 353.7-146.51 138.16.01 263.15 55.97 353.7 146.51 90.53 90.55 146.5 215.54 146.51 353.7-.01 138.16-55.98 263.15-146.51 353.7z"
											/>
										</svg>
									</Box>

									<Typography sx={{ color: '#e5e7eb', mb: 2, textAlign: 'center' }}>
										The DAM token contract has been audited by SlowMist, a leading blockchain security firm.
									</Typography>

									<Box sx={{ display: 'flex', justifyContent: 'center' }}>
										<Button
											component="a"
											href="https://github.com/Datamine-Crypto/white-paper/blob/master/audits/SlowMist%20-%20Smart%20Contract%20Security%20Audit%20Report%20-%20DamToken.pdf"
											target="_blank"
											rel="noopener noreferrer"
											sx={{
												bgcolor: palette.highlight,
												color: 'black',
												'&:hover': {
													bgcolor: '#00CCCC',
												},
											}}
										>
											View Audit Report
										</Button>
									</Box>
								</CardContent>
							</Card>

							<Card
								sx={{
									flex: 1,
									bgcolor: palette.background,
									border: `1px solid ${palette.highlight}`,
									borderRadius: 2,
								}}
							>
								<CardContent>
									<Typography sx={{ fontWeight: 'bold', color: palette.highlight, mb: 2, textAlign: 'center' }}>
										FLUX Token Audit
									</Typography>

									<Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
										<svg width="80" height="80" viewBox="480 480 1040 1040">
											<path
												d="M1345.58 654.42c-88.41-88.43-210.65-143.15-345.58-143.14-134.93 0-257.17 54.72-345.58 143.14-88.43 88.41-143.15 210.65-143.14 345.58 0 134.93 54.72 257.17 143.14 345.58 88.41 88.43 210.65 143.15 345.58 143.14 134.93 0 257.17-54.72 345.58-143.14 88.43-88.41 143.15-210.65 143.14-345.58.01-134.93-54.71-257.17-143.14-345.58z"
												fill="#202336"
											/>
											<path
												fill="#0ff"
												d="M1345.58 654.42c-88.41-88.43-210.65-143.15-345.58-143.14-134.93 0-257.17 54.72-345.58 143.14-88.43 88.41-143.15 210.65-143.14 345.58 0 134.93 54.72 257.17 143.14 345.58 88.41 88.43 210.65 143.15 345.58 143.14 134.93 0 257.17-54.72 345.58-143.14 88.43-88.41 143.15-210.65 143.14-345.58.01-134.93-54.71-257.17-143.14-345.58zm-13.22 677.94c-85.09 85.07-202.54 137.66-332.36 137.67-129.82 0-247.27-52.6-332.36-137.67-85.07-85.09-137.66-202.54-137.67-332.36 0-129.82 52.6-247.27 137.67-332.36 85.09-85.07 202.54-137.66 332.36-137.67 129.82 0 247.27 52.6 332.36 137.67 85.07 85.09 137.66 202.54 137.67 332.36-.01 129.82-52.6 247.27-137.67 332.36z"
											/>
											<path
												fill="#fff"
												d="M933.75 896.55l112.67 65.22.51-130.43zM933.75 752.36l112.67 65.22.51-130.43zM1058.63 823.44l112.67 65.21.51-130.42zM1046.42 1123.81l-112.67 65.22 113.18 65.21z"
											/>
											<path
												fill="#0ff"
												d="M933.12 1042.79l113.3 65.21V977.58zM1058.57 1120.04l113.3 65.21v-130.43zM808.39 972.98l113.29 65.22V907.77zM687.08 899.29l113.3 65.22V834.08z"
											/>
											<path
												fill="#fff"
												d="M929.17 1050.69v130.43l113.3-65.21zM929.17 1197.61v130.42l113.3-65.21zM1041.84 823.44l-112.67-65.21v130.42zM1168.87 749.62l-112.67-65.21v130.43zM1296.32 823.44l-112.67-65.21v130.42z"
											/>
											<path
												fill="#0ff"
												d="M929.17 904.46v130.43l112.67-65.22zM1052.76 980.56v130.43l112.68-65.22zM1179.79 1054.82v130.43l112.67-65.21zM808.7 834.08v130.43l112.67-65.22z"
											/>
										</svg>
									</Box>

									<Typography sx={{ color: '#e5e7eb', mb: 2, textAlign: 'center' }}>
										The FLUX token contract has been thoroughly audited by SlowMist to ensure security and reliability.
									</Typography>

									<Box sx={{ display: 'flex', justifyContent: 'center' }}>
										<Button
											component="a"
											href="https://github.com/Datamine-Crypto/white-paper/blob/master/audits/SlowMist%20-%20Smart%20Contract%20Security%20Audit%20Report%20-%20FluxToken.pdf"
											target="_blank"
											rel="noopener noreferrer"
											sx={{
												bgcolor: palette.highlight,
												color: 'black',
												'&:hover': {
													bgcolor: '#00CCCC',
												},
											}}
										>
											View Audit Report
										</Button>
									</Box>
								</CardContent>
							</Card>
						</Box>

						<Typography sx={{ color: '#e5e7eb', textAlign: 'center' }}>
							Security is a priority in the Datamine ecosystem, with audited contracts for the foundation tokens.
						</Typography>
					</Paper>

					{/* Integration Flow */}
					<Paper
						sx={{
							maxWidth: '1152px',
							mx: 'auto',
							mt: 6,
							mb: 6,
							p: 3,
							bgcolor: palette.secondaryBackground,
							borderRadius: 2,
						}}
					>
						<Typography
							variant="h3"
							sx={{
								fontSize: '1.5rem', // text-2xl
								fontWeight: 'bold',
								mb: 3,
								textAlign: 'center',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<SyncIcon sx={{ mr: 1, mb: 0.5 }} />
							Integration Flow
						</Typography>

						<Grid container spacing={4} sx={{ height: '100%' }}>
							<Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
								<Box
									sx={{
										bgcolor: palette.background,
										p: 2,
										borderRadius: 1,
										mb: 2,
										flex: 1, // Use flex to fill available space
									}}
								>
									<Typography sx={{ fontWeight: 'bold', color: palette.highlight, mb: 1 }}>
										Locking & Minting:
									</Typography>
									<Box sx={{ ml: 2 }}>
										<Typography sx={{ color: '#d1d5db', mb: 0.5 }}>• Lock DAM to mint FLUX (Layer 1).</Typography>
										<Typography sx={{ color: '#d1d5db', mb: 0.5 }}>
											• Transfer FLUX to Layer 2 and lock it to mint ArbiFLUX.
										</Typography>
										<Typography sx={{ color: '#d1d5db' }}>• Lock ArbiFLUX to mint LOCK.</Typography>
									</Box>
								</Box>

								<Box
									sx={{
										bgcolor: palette.background,
										p: 2,
										borderRadius: 1,
										flex: 1, // Use flex to fill available space
									}}
								>
									<Typography sx={{ fontWeight: 'bold', color: palette.highlight, mb: 1 }}>
										Burning & Rewards:
									</Typography>
									<Typography sx={{ color: '#d1d5db', ml: 2 }}>
										Validators can burn FLUX, ArbiFLUX, or LOCK to boost minting rewards (APY), reduce supply, and
										stabilize the system.
									</Typography>
								</Box>
							</Grid>

							<Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
								<Box
									sx={{
										bgcolor: palette.background,
										p: 2,
										borderRadius: 1,
										mb: 2,
										flex: 1, // Use flex to fill available space
									}}
								>
									<Typography sx={{ fontWeight: 'bold', color: palette.highlight, mb: 1 }}>
										Liquidity & Stability:
									</Typography>
									<Typography sx={{ color: '#d1d5db', ml: 2 }}>
										LOCK ensures market stability by contributing to a permanent liquidity pool, mitigating price swings
										and increasing depth.
									</Typography>
								</Box>

								<Box
									sx={{
										bgcolor: palette.background,
										p: 2,
										borderRadius: 1,
										flex: 1, // Use flex to fill available space
									}}
								>
									<Typography sx={{ fontWeight: 'bold', color: palette.highlight, mb: 1 }}>
										Dynamic Monetary Policy:
									</Typography>
									<Typography sx={{ color: '#d1d5db', ml: 2 }}>
										Tokens interact dynamically, balancing inflation and deflation to adapt to market conditions.
									</Typography>
								</Box>
							</Grid>
						</Grid>
					</Paper>

					{/* Why Join */}
					<Paper
						sx={{
							maxWidth: '1152px',
							mx: 'auto',
							mt: 6,
							mb: 6,
							p: 3,
							bgcolor: palette.secondaryBackground,
							borderRadius: 2,
						}}
					>
						<Typography
							variant="h3"
							sx={{
								fontSize: '1.5rem', // text-2xl
								fontWeight: 'bold',
								mb: 3,
								textAlign: 'center',
							}}
						>
							💪 Why Join Datamine?
						</Typography>

						<Grid container spacing={4}>
							<Grid size={{ xs: 12, md: 4 }}>
								<Card
									sx={{
										height: '100%',
										bgcolor: palette.background,
										borderRadius: 1,
									}}
								>
									<CardContent sx={{ p: 2 }}>
										<Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
											<svg viewBox="0 0 100 100" width="80" height="80">
												<circle
													cx="50"
													cy="50"
													r="40"
													fill={palette.secondaryBackground}
													stroke={palette.highlight}
													strokeWidth="2"
												/>
												<path d="M30,65 L45,50 L55,60 L70,35" stroke={palette.highlight} strokeWidth="4" fill="none" />
												<circle cx="30" cy="65" r="5" fill={palette.highlight} />
												<circle cx="45" cy="50" r="5" fill={palette.highlight} />
												<circle cx="55" cy="60" r="5" fill={palette.highlight} />
												<circle cx="70" cy="35" r="5" fill={palette.highlight} />
											</svg>
										</Box>
										<Typography
											sx={{
												fontWeight: 'bold',
												color: palette.highlight,
												textAlign: 'center',
												mb: 1,
											}}
										>
											Hedge Against Inflation
										</Typography>
										<Typography
											sx={{
												color: '#d1d5db', // text-gray-300
												textAlign: 'center',
											}}
										>
											Dynamic tokenomics adjust supply and demand to preserve purchasing power and stabilize value.
										</Typography>
									</CardContent>
								</Card>
							</Grid>

							<Grid size={{ xs: 12, md: 4 }}>
								<Card
									sx={{
										height: '100%',
										bgcolor: palette.background,
										borderRadius: 1,
									}}
								>
									<CardContent sx={{ p: 2 }}>
										<Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
											<svg viewBox="0 0 100 100" width="80" height="80">
												<circle
													cx="50"
													cy="50"
													r="40"
													fill={palette.secondaryBackground}
													stroke={palette.highlight}
													strokeWidth="2"
												/>
												<rect x="35" y="40" width="30" height="30" fill={palette.highlight} />
												<path d="M50,30 L50,10" stroke={palette.highlight} strokeWidth="4" />
												<path d="M50,30 L50,40" stroke={palette.highlight} strokeWidth="4" />
												<circle cx="50" cy="30" r="5" fill={palette.highlight} />
											</svg>
										</Box>
										<Typography
											sx={{
												fontWeight: 'bold',
												color: palette.highlight,
												textAlign: 'center',
												mb: 1,
											}}
										>
											Generate Yield
										</Typography>
										<Typography
											sx={{
												color: '#d1d5db', // text-gray-300
												textAlign: 'center',
											}}
										>
											Validators and participants are rewarded for locking and burning tokens, driving efficient
											ecosystem participation.
										</Typography>
									</CardContent>
								</Card>
							</Grid>

							<Grid size={{ xs: 12, md: 4 }}>
								<Card
									sx={{
										height: '100%',
										bgcolor: palette.background,
										borderRadius: 1,
									}}
								>
									<CardContent sx={{ p: 2 }}>
										<Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
											<svg viewBox="0 0 100 100" width="80" height="80">
												<circle
													cx="50"
													cy="50"
													r="40"
													fill={palette.secondaryBackground}
													stroke={palette.highlight}
													strokeWidth="2"
												/>
												<rect x="30" y="60" width="10" height="20" fill={palette.highlight} />
												<rect x="45" y="50" width="10" height="30" fill={palette.highlight} />
												<rect x="60" y="40" width="10" height="40" fill={palette.highlight} />
												<path d="M30,60 L70,40" stroke={palette.highlight} strokeWidth="2" strokeDasharray="5,3" />
											</svg>
										</Box>
										<Typography
											sx={{
												fontWeight: 'bold',
												color: palette.highlight,
												textAlign: 'center',
												mb: 1,
											}}
										>
											Enhance Market Resilience
										</Typography>
										<Typography
											sx={{
												color: '#d1d5db', // text-gray-300
												textAlign: 'center',
											}}
										>
											The permanent liquidity pool strengthens market depth, reducing volatility and supporting
											sustainable growth.
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						</Grid>
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
 * TokenPage component that serves as the entry point for displaying token-related information.
 * It provides the necessary Web3 context (dispatch and ecosystem) to its child components.
 * @param props - Component props (currently empty).
 */
const TokenPage: React.FC<Props> = () => {
	const { state: web3State, dispatch } = useWeb3Context();
	const { ecosystem } = web3State;

	return <Render dispatch={dispatch} ecosystem={ecosystem} />;
};

export default TokenPage;
