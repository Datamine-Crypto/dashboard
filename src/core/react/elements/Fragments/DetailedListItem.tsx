import { Box, Card, Divider, Hidden, useMediaQuery, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import React, { ReactNode } from 'react';
import { DatamineTheme } from '../../../styles';

const useStyles = makeStyles<DatamineTheme>(() => {
	return {
		cardMobile: {
			background: '#202336',
			overflowX: 'auto'
		}
	}
});

interface RenderProps {
	title?: ReactNode;
	main: ReactNode;
	sub?: ReactNode;
	description?: ReactNode;
	buttons?: ReactNode[];
}
const Render: React.FC<RenderProps> = React.memo(({ title, main, sub, description, buttons }) => {
	const theme = useTheme();
	const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

	const classes = useStyles();
	const getMainElement = () => {
		const getSub = () => {
			if (!sub) {
				return null
			}

			return <>&nbsp;<Typography color="textSecondary" variant="body2" display="inline">/</Typography> {sub}</>
		}
		return <>
			<Hidden smDown>
				<Grid><Typography display="inline">{main}{getSub()}</Typography> {description}</Grid>
			</Hidden>
			<Hidden mdUp>
				<Grid size={{ xs: 12 }}>
					<Typography display="inline">{main}</Typography>
				</Grid>
			</Hidden>
		</>
	}
	const getSmSubElement = () => {
		if (!sub) {
			return null;
		}

		return <>
			<Grid><Typography display="inline">{sub}</Typography></Grid>
		</>
	}
	const getSmDescriptionElement = () => {
		if (!description) {
			return null;
		}

		return <Grid>{description}</Grid>
	}
	const getTitle = () => {
		if (!title) {
			return null;
		}

		const getButtons = () => {
			if (!buttons || buttons.length === 0) {
				return null;
			}
			return buttons.map(button => {
				return <>
					<Grid>
						{button}
					</Grid>
				</>
			})
		}

		return <Grid>
			<Grid container alignItems="center">
				<Grid>
					<Box height={36} display="flex" alignItems="center">
						<Typography color="textSecondary" variant="body2">{title}</Typography>
					</Box>

				</Grid>
				<Hidden smDown>
					{getButtons()}
				</Hidden>
			</Grid>
		</Grid>
	}
	const getSmButtons = () => {
		if (!buttons || buttons.length === 0) {
			return null;
		}

		const getButtonElements = () => {
			return buttons.map(button => {
				return <>
					<Grid>
						<Box my={1}>
							{button}
						</Box>
					</Grid>
				</>
			})
		}

		return <>
			<Box width="100%" my={1}>
				<Divider />
			</Box>
			<Box width="100%">
				<Grid
					container
					direction="column"
					justifyContent="center"
					alignItems="center">
					{getButtonElements()}
				</Grid>
			</Box>
		</>
	}
	const getLayout = () => {
		return <>
			{getTitle()}
			{getMainElement()}
			<Hidden mdUp>
				{getSmSubElement()}
				{getSmDescriptionElement()}
				{getSmButtons()}
			</Hidden>
		</>
	}
	return <>
		<Box mb={isSmDown ? 2 : 0}>
			<Card elevation={isSmDown ? 1 : 0} className={isSmDown ? classes.cardMobile : undefined} >
				<Box p={1}>
					<Grid container spacing={isSmDown ? 1 : 0} direction={'column'} alignItems="stretch">
						{getLayout()}
					</Grid>
				</Box>
			</Card>
		</Box>
	</>

})

const DetailedListItem: React.FC<RenderProps> = (props) => {
	return <Render
		{...props}
	/>
}

export default DetailedListItem