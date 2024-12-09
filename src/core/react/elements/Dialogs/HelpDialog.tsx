import { Box, Button, Card, CardActions, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, Link, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import { makeStyles } from '@mui/styles';
import ReactMarkdown from 'react-markdown';
import { NetworkType } from '../../../../configs/config.common';
import { HelpArticle, SearchCategoryText, SearchCategoryTextL2 } from '../../../helpArticles';
import { DatamineTheme } from '../../../styles';
import { Web3Context } from '../../../web3/Web3Context';
import { commonLanguage } from '../../../web3/web3Reducer';
import AddToFirefoxFragment from '../Fragments/AddToFirefoxFragment';
import LightTooltip from '../LightTooltip';

interface RenderParams {
	dispatch: React.Dispatch<any>;

	helpArticle: HelpArticle;
	helpArticlesNetworkType: NetworkType;
}
enum ImageOption {
	MaxWidth = '_maxWidth',
	ClassName = '_className'
}
const useStyles = makeStyles<DatamineTheme>((theme) => {
	return {
		markdownContainer: {
			'& a': {
				color: '#00FFFF'
			},
			'& .MuiTypography-gutterBottom': {
				marginBottom: '0.75em'
			},
			'& strong': {
				color: theme.palette.text.primary
			},
			/*'&.rightImages img': {
				float: 'right'
			},*/
			'& .MuiTypography-h1': {
				fontSize: '1.5rem',
				lineHeight: '1.334',
				color: theme.palette.secondary.main
			},
			'& .MuiTypography-h2': {
				fontSize: '1.25rem',
				lineHeight: '1.6',
				color: theme.palette.secondary.main
			},
			'& .MuiTypography-h3': {
				fontSize: '1.2rem',
				lineHeight: '1.5',
				color: theme.palette.secondary.main
			},
			'& .MuiTypography-h4': {
				fontSize: '1.1rem',
				lineHeight: '1.5',
				color: theme.palette.secondary.main
			},
			'& code': {
				background: '#212438',
				fontSize: '0.8rem',
				padding: theme.spacing(1),
			},
			'& pre': {
				background: '#212438',
				padding: theme.spacing(2),
				overflow: 'auto',
			},
			'& pre code': {
				background: 'none',
				padding: theme.spacing(0),
			},

			// Right aligned icons on core values
			'& .rightIcon': {
				float: 'right',
				maxWidth: 64,
				border: 0,
				margin: '0 0 0 8px'
			}

			/*'& h1': {
				...theme.mixins.toolbar

			},
			'& .MuiListItemText-secondary': {
				color: theme.palette.text.primary,
				fontSize: theme.typography.body1.fontSize
			}*/
		},
		image: {
			verticalAlign: 'middle',
			width: '100%',
			maxWidth: 912,
			display: 'block',
			margin: '16px auto',
			border: '1px solid #00FFFF',
			borderRadius: 5
		}
	}
});

interface CodeParams {
	language: string;
	value: string;
	children: any;
}
interface LanguageComponentParams {
	type: string;
	props: any;
}
enum ComponentType {
	AddToMetamask = 'AddToMetamask'
}

const Render: React.FC<RenderParams> = React.memo(({ dispatch, helpArticle, helpArticlesNetworkType }) => {
	const classes = useStyles();

	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const isArbitrumMainnet = helpArticlesNetworkType === NetworkType.Arbitrum;

	const onClose = () => {
		//dispatch({ type: commonLanguage.commands.CloseDialog });
	}

	const slugify = (text: string) => {
		return text.toString().toLowerCase()
			.replace(/\s+/g, '-')           // Replace spaces with -
			.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
			//.replace(/\-\-+/g, '-')         // Replace multiple - with single -
			.replace(/^-+/, '')             // Trim - from start of text
			.replace(/-+$/, '');            // Trim - from end of text
	}

	const heading = (props: any) => {
		const variant = `h${props.level}` as any

		const getId = () => {

			if (props.node.children.length > 0) {
				return slugify(props.node.children[0].value);
			}
			return;
		}
		const id = getId();

		return <Typography component="div" variant={variant} gutterBottom color="textSecondary" id={id}>{props.children}</Typography>
	}
	const paragraph = (props: any) => {
		return <Typography component="div" variant="body1" gutterBottom>{props.children}</Typography>
	}
	const listItem = (props: any) => {
		return <li><Typography component="div" variant="body1">{props.children}</Typography></li>
	}


	const thematicBreak = (props: any) => {
		return <Box my={2}><Divider /></Box>
	}

	const link = (props: any) => {
		const isRelativeElement = props.href.indexOf('#') === 0;

		const onClick = (e: React.MouseEvent<HTMLElement>) => {
			// For focusing elements on page
			if (isRelativeElement) {
				const elementId = props.href.replace('#', '');
				const documentToFocus = document.getElementById(elementId);
				if (documentToFocus) {
					documentToFocus.scrollIntoView();
				} else {
					console.log('Could not find element:', elementId);
				}

				e.preventDefault();
				return false;
			}

			return true;
		}
		const getIcon = () => {
			if (isRelativeElement) {
				return null;
			}

			return <LaunchIcon style={{ fontSize: 20, verticalAlign: 'sub', marginRight: 2 }} />
		}

		return <Link href={props.href} title={props.href} target="_blank" rel="noopener noreferrer" onClick={onClick}>{getIcon()}{props.children}</Link>
	}

	const image = (props: any) => {
		const src = props.src as string;
		const alt = props.alt as string;

		const getImageOverrides = () => {
			const style = {} as any
			let className = classes.image; // Default class for all images

			// Add custom styles
			const imageHash = src.split('#')
			if (imageHash.length === 2) {
				const imageOptions = imageHash[1].split('&');
				for (const imageOption of imageOptions) {
					const singleImageOption = imageOption.split('=');
					if (singleImageOption.length === 2) {
						const optionValue = singleImageOption[1]
						switch (singleImageOption[0]) {
							case ImageOption.MaxWidth:
								style.maxWidth = parseInt(optionValue)
								break;
							case ImageOption.ClassName:
								className += ` ${optionValue}`;
						}
					}
				}

			}
			return {
				style,
				className
			}
		}
		const { style, className } = getImageOverrides();

		const clearSrc = src.replace(/\.\.\//g, '');

		return <img src={clearSrc} alt={alt} title={alt} className={className} style={style} />
	}
	const code = ({ language, value, children }: CodeParams) => {

		const getComponent = ({ type, props }: LanguageComponentParams) => {
			switch (type) {
				case ComponentType.AddToMetamask:
					return <Box my={3}>
						<Card>
							<CardActions>
								<Box>

									<AddToFirefoxFragment {...props} />
								</Box>
							</CardActions>
						</Card>
					</Box>
			}
			return <code>Unexpected component: {type}</code>
		}

		if (language) {
			switch (language) {
				case 'component':
					const componentParams = JSON.parse(value);
					return getComponent(componentParams)
			}
		}

		return <pre><code>{value}</code></pre>
	}

	const getTitle = () => {
		if (isArbitrumMainnet && !!helpArticle.titleL2) {
			return helpArticle.titleL2
		}

		return helpArticle.title
	}
	const title = getTitle()

	const getCategoryHeader = () => {
		if (isArbitrumMainnet) {
			return SearchCategoryTextL2[helpArticle.category as keyof typeof SearchCategoryTextL2]
		}
		return SearchCategoryText[helpArticle.category as keyof typeof SearchCategoryText]
	}
	const categoryHeader = getCategoryHeader()

	return <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title" scroll={'body'} maxWidth={'md'} fullScreen={fullScreen}>
		<DialogTitle id="form-dialog-title">
			<Box style={{ float: 'right' }}>
				<LightTooltip title="Open Help Article In New Tab">
					<IconButton href={`#help/${helpArticle.id}`} target="_blank" rel="noopener noreferrer"  >
						<LaunchIcon />
					</IconButton>
				</LightTooltip>
				<IconButton aria-label="close" onClick={() => dispatch({ type: commonLanguage.commands.CloseHelpArticle })}>
					<CloseIcon />
				</IconButton>
			</Box>
			<Box display="flex" alignItems="center" alignContent="center">
				{title}
			</Box>
			<Box pt={1}>
				<Typography component="div" variant="body2" color="textSecondary">
					Category: <Box display="inline" fontWeight="fontWeightBold">{categoryHeader}</Box>
				</Typography>
			</Box>

		</DialogTitle>
		<DialogContent dividers={true}>

			<DialogContentText>
				<Box py={1}>
					<ReactMarkdown components={{ heading, paragraph, thematicBreak, link, listItem, code, image }} className={`${classes.markdownContainer} ${helpArticle.className}`}>
						{helpArticle.body as string}
					</ReactMarkdown>
				</Box>
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Box my={1} mr={2}>
				<Button type="button" color="secondary" size="large" variant="outlined" onClick={() => dispatch({ type: commonLanguage.commands.CloseHelpArticle })}  >
					Close
				</Button>
			</Box>
		</DialogActions>
	</Dialog>
});

interface DialogProps {
	helpArticle: HelpArticle;
	helpArticlesNetworkType: NetworkType;
}
const HelpDialog: React.FC<DialogProps> = ({ helpArticle, helpArticlesNetworkType }) => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	return <Render
		helpArticle={helpArticle}
		dispatch={web3Dispatch}
		helpArticlesNetworkType={helpArticlesNetworkType}
	/>
}

export default HelpDialog;