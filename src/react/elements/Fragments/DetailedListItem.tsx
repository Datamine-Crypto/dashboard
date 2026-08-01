import { Box, Card, Divider, useMediaQuery, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React, { ReactNode } from 'react';
import { tss } from 'tss-react/mui';
import { appPalette } from '@/theme/appTheme';

const useStyles = tss.create(() => ({
	cardMobile: {
		background: appPalette.secondaryBackground,
		overflowX: 'auto',
	},
}));

interface RenderProps {
	title?: ReactNode;
	main: ReactNode;
	sub?: ReactNode;
	description?: ReactNode;
	buttons?: ReactNode[];
}

/**
 * Memoized per Rule 10: this renders once per row across the balances and analytics cards and
 * derives everything from props, so it should not re-render when an unrelated part of the
 * surrounding card updates.
 */
const DetailedListItem = React.memo(function DetailedListItem({ title, main, sub, description, buttons }: RenderProps) {
	const theme = useTheme();
	const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

	const { classes } = useStyles();
	const getMainElement = () => {
		const getSub = () => {
			if (!sub) {
				return null;
			}

			return (
				<>
					<Typography
						component="div"
						color="textSecondary"
						variant="body2"
						sx={{
							display: 'inline',
						}}
					>
						/
					</Typography>{' '}
					{sub}
				</>
			);
		};
		return (
			<>
				<Box sx={{ display: { xs: 'none', md: 'block' } /*smDown*/ }}>
					<Grid>
						<Typography
							component="div"
							sx={{
								display: 'inline',
							}}
						>
							{main}
							{getSub()}
						</Typography>{' '}
						{description}
					</Grid>
				</Box>
				<Box sx={{ display: { xs: 'block', md: 'none' } /*mdUp*/ }}>
					<Grid size={{ xs: 12 }}>
						<Typography
							component="div"
							sx={{
								display: 'inline',
							}}
						>
							{main}
						</Typography>
					</Grid>
				</Box>
			</>
		);
	};
	const getSmSubElement = () => {
		if (!sub) {
			return null;
		}

		return (
			<>
				<Grid>
					<Typography
						component="div"
						sx={{
							display: 'inline',
						}}
					>
						{sub}
					</Typography>
				</Grid>
			</>
		);
	};
	const getSmDescriptionElement = () => {
		if (!description) {
			return null;
		}

		return <Grid>{description}</Grid>;
	};
	const getTitle = () => {
		if (!title) {
			return null;
		}

		const getButtons = () => {
			if (!buttons || buttons.length === 0) {
				return null;
			}
			return buttons.map((button) => {
				return (
					<>
						<Grid>{button}</Grid>
					</>
				);
			});
		};

		return (
			<Grid>
				<Grid container sx={{ alignItems: 'center' }}>
					<Grid>
						<Box
							sx={{
								height: 36,
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<Typography component="div" color="textSecondary" variant="body2">
								{title}
							</Typography>
						</Box>
					</Grid>
					<Box sx={{ display: { xs: 'none', md: 'block' } /*smDown*/ }}>{getButtons()}</Box>
				</Grid>
			</Grid>
		);
	};
	const getSmButtons = () => {
		if (!buttons || buttons.length === 0) {
			return null;
		}

		const getButtonElements = () => {
			return buttons.map((button) => {
				return (
					<>
						<Grid>
							<Box
								sx={{
									my: 1,
								}}
							>
								{button}
							</Box>
						</Grid>
					</>
				);
			});
		};

		return (
			<>
				<Box
					sx={{
						width: '100%',
						my: 1,
					}}
				>
					<Divider />
				</Box>
				<Box
					sx={{
						width: '100%',
					}}
				>
					<Grid container sx={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						{getButtonElements()}
					</Grid>
				</Box>
			</>
		);
	};
	const getLayout = () => {
		return (
			<>
				{getTitle()}
				{getMainElement()}
				<Box sx={{ display: { xs: 'block', md: 'none' } /*mdUp*/ }}>
					{getSmSubElement()}
					{getSmDescriptionElement()}
					{getSmButtons()}
				</Box>
			</>
		);
	};
	return (
		<>
			<Box
				sx={{
					mb: isSmDown ? 2 : 0,
				}}
			>
				<Card elevation={isSmDown ? 1 : 0} className={isSmDown ? classes.cardMobile : undefined}>
					<Box
						sx={{
							p: 1,
						}}
					>
						<Grid container spacing={isSmDown ? 1 : 0} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
							{getLayout()}
						</Grid>
					</Box>
				</Card>
			</Box>
		</>
	);
});

export default DetailedListItem;
