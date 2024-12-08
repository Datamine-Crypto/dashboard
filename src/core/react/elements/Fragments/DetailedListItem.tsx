import React from 'react';
import Typography from '@mui/material/Typography';
import { Box, Hidden, Card, Divider, Grid, useMediaQuery, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
	return {
		cardMobile: {
			background: '#202336',
			overflowX: 'auto'
		}
	}
});

interface RenderProps {
	title?: React.ReactFragment;
	main: React.ReactFragment;
	sub?: React.ReactFragment;
	description?: React.ReactFragment;
	buttons?: React.ReactFragment[];
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
				<Grid item><Typography display="inline">{main}{getSub()}</Typography> {description}</Grid>
			</Hidden>
			<Hidden mdUp>
				<Grid item xs={12}>
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
			<Grid item><Typography display="inline">{sub}</Typography></Grid>
		</>
	}
	const getSmDescriptionElement = () => {
		if (!description) {
			return null;
		}

		return <Grid item>{description}</Grid>
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
					<Grid item>
						{button}
					</Grid>
				</>
			})
		}

		return <Grid item>
			<Grid container alignItems="center">
				<Grid item>
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
					<Grid item>
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
					justify="center"
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