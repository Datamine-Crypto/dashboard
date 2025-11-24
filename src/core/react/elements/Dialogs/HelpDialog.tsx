import {
	Box,
	Button,
	Card,
	CardActions,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	IconButton,
	Link,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import React, { Suspense, lazy } from 'react';

import { Close, Launch } from '@mui/icons-material';
import { tss } from 'tss-react/mui';
import { HelpArticle, SearchCategoryText } from '@/core/app/helpArticles';
import { dispatch as appDispatch } from '@/core/react/utils/appStore';
import { commonLanguage } from '@/core/app/state/commonLanguage';
import AddToFirefoxFragment from '@/core/react/elements/Fragments/AddToFirefoxFragment';
import CenteredLoading from '@/core/react/elements/Fragments/CenteredLoading'; // Assuming you have a loading component
import LightTooltip from '@/core/react/elements/LightTooltip';

/**
 * Props for the Render component within HelpDialog.
 */
interface RenderParams {
	/** The dispatch function from the Web3Context. */
	dispatch: ReducerDispatch;
	/** The help article to display. */
	helpArticle: HelpArticle;
}

// Dynamically import ReactMarkdown
import { ReducerDispatch } from '@/core/utils/reducer/sideEffectReducer';
const ReactMarkdown = lazy(() => import('react-markdown'));

enum ImageOption {
	MaxWidth = '_maxWidth',
	ClassName = '_className',
}
const useStyles = tss.create(({ theme }) => ({
	markdownContainer: {
		'& a': {
			color: '#00FFFF',
		},
		'& .MuiTypography-gutterBottom': {
			marginBottom: '0.75em',
		},
		'& strong': {
			color: theme.palette.text.primary,
		},
		/*'&.rightImages img': {
			float: 'right'
		},*/
		'& .MuiTypography-h1': {
			fontSize: '1.5rem',
			lineHeight: '1.334',
			color: theme.palette.secondary.main,
		},
		'& .MuiTypography-h2': {
			fontSize: '1.25rem',
			lineHeight: '1.6',
			color: theme.palette.secondary.main,
		},
		'& .MuiTypography-h3': {
			fontSize: '1.2rem',
			lineHeight: '1.5',
			color: theme.palette.secondary.main,
		},
		'& .MuiTypography-h4': {
			fontSize: '1.1rem',
			lineHeight: '1.5',
			color: theme.palette.secondary.main,
		},
		'& code': {
			background: theme.palette.primary.main,
			color: theme.palette.secondary.main,
			fontSize: '0.8rem',
			padding: theme.spacing(1),
		},
		'& pre': {
			background: theme.palette.primary.main,
			color: theme.palette.secondary.main,
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
			margin: '0 0 0 8px',
		},

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
		borderRadius: 5,
	},
}));

interface CodeParams {
	className: string;
	value: string;
	children: any;
}
interface LanguageComponentParams {
	type: string;
	props: any;
}
enum ComponentType {
	AddToMetamask = 'AddToMetamask',
}

/**
 * A memoized functional component that renders the Help Dialog.
 * This dialog displays help articles formatted with Markdown, including dynamic content and styling.
 * @param params - Object containing dispatch function, helpArticle, and helpArticlesNetworkType.
 */
const Render: React.FC<RenderParams> = React.memo(({ dispatch, helpArticle }) => {
	const { classes } = useStyles();

	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const onClose = () => {
		//dispatch({ type: commonLanguage.commands.CloseDialog });
	};

	const slugify = (text: string) => {
		return (
			text
				.toString()
				.toLowerCase()
				.replace(/\s+/g, '-') // Replace spaces with -
				.replace(/[^\w-]+/g, '') // Remove all non-word chars
				//.replace(/\-\-+/g, '-')         // Replace multiple - with single -
				.replace(/^-+/, '') // Trim - from start of text
				.replace(/-+$/, '')
		); // Trim - from end of text
	};

	const heading = (props: any, level: number) => {
		const variant = `h${level}` as any;

		const getId = () => {
			if (props.node.children.length > 0) {
				return slugify(props.node.children[0].value);
			}
			return;
		};
		const id = getId();

		return (
			<Typography component="div" variant={variant} gutterBottom color="textSecondary" id={id}>
				{props.children}
			</Typography>
		);
	};
	const paragraph = (props: any) => {
		return (
			<Typography component="div" variant="body1" gutterBottom>
				{props.children}
			</Typography>
		);
	};
	const listItem = (props: any) => {
		return (
			<li>
				<Typography component="div" variant="body1">
					{props.children}
				</Typography>
			</li>
		);
	};

	const thematicBreak = (props: any) => {
		return (
			<Box my={2}>
				<Divider />
			</Box>
		);
	};

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
		};
		const getIcon = () => {
			if (isRelativeElement) {
				return null;
			}

			return <Launch style={{ fontSize: 20, verticalAlign: 'sub', marginRight: 2 }} />;
		};

		return (
			<Link href={props.href} title={props.href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
				{getIcon()}
				{props.children}
			</Link>
		);
	};

	const image = (props: any) => {
		const src = props.src as string;
		const alt = props.alt as string;

		const getImageOverrides = () => {
			const style = {} as any;
			let className = classes.image; // Default class for all images

			// Add custom styles
			const imageHash = src.split('#');
			if (imageHash.length === 2) {
				const imageOptions = imageHash[1].split('&');
				for (const imageOption of imageOptions) {
					const singleImageOption = imageOption.split('=');
					if (singleImageOption.length === 2) {
						const optionValue = singleImageOption[1];
						switch (singleImageOption[0]) {
							case ImageOption.MaxWidth:
								style.maxWidth = parseInt(optionValue);
								break;
							case ImageOption.ClassName:
								className += ` ${optionValue}`;
						}
					}
				}
			}
			return {
				style,
				className,
			};
		};
		const { style, className } = getImageOverrides();

		const clearSrc = src.replace(/\.\.\//g, '');

		return <img src={clearSrc} alt={alt} title={alt} className={className} style={style} />;
	};
	const code = (props: CodeParams) => {
		const { className, value, children } = props;

		const getComponent = ({ type, props }: LanguageComponentParams) => {
			switch (type) {
				case ComponentType.AddToMetamask:
					return (
						<Box my={3}>
							<Card>
								<CardActions>
									<Box>
										<AddToFirefoxFragment {...props} />
									</Box>
								</CardActions>
							</Card>
						</Box>
					);
			}
			return <code>Unexpected component: {type}</code>;
		};

		if (className) {
			switch (className) {
				case 'language-component': {
					const componentParams = JSON.parse(children);
					return getComponent(componentParams);
				}
			}
		}

		return <code>{children}</code>;
	};

	const getTitle = () => {
		return helpArticle.title;
	};
	const title = getTitle();

	const getCategoryHeader = () => {
		return SearchCategoryText[helpArticle.category as keyof typeof SearchCategoryText];
	};
	const categoryHeader = getCategoryHeader();

	return (
		<Dialog
			open={true}
			onClose={onClose}
			aria-labelledby="form-dialog-title"
			scroll={'body'}
			maxWidth={'md'}
			fullScreen={fullScreen}
		>
			<DialogTitle id="form-dialog-title">
				<Box style={{ float: 'right' }}>
					<LightTooltip title="Open Help Article In New Tab">
						<IconButton href={`#help/${helpArticle.id}`} target="_blank" rel="noopener noreferrer">
							<Launch />
						</IconButton>
					</LightTooltip>
					<IconButton aria-label="close" onClick={() => dispatch({ type: commonLanguage.commands.CloseHelpArticle })}>
						<Close />
					</IconButton>
				</Box>
				<Box display="flex" alignItems="center" alignContent="center">
					{title}
				</Box>
				<Box pt={1}>
					<Typography component="div" variant="body2" color="textSecondary">
						Category:{' '}
						<Box display="inline" fontWeight="fontWeightBold">
							{categoryHeader}
						</Box>
					</Typography>
				</Box>
			</DialogTitle>
			<DialogContent dividers={true}>
				<DialogContentText>
					<Box py={1} className={`${classes.markdownContainer} ${helpArticle.className}`}>
						<Suspense fallback={<CenteredLoading />}>
							{' '}
							{/* Or any other suitable fallback */}
							<ReactMarkdown
								components={{
									// From https://github.com/remarkjs/react-markdown?tab=readme-ov-file#appendix-b-components
									h1: (props) => heading(props, 1),
									h2: (props) => heading(props, 2),
									p: paragraph,
									hr: thematicBreak,
									a: link,
									li: listItem,
									code: code as any,
									img: image,
								}}
							>
								{helpArticle.body as string}
							</ReactMarkdown>
						</Suspense>
					</Box>
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Box my={1} mr={2}>
					<Button
						type="button"
						color="secondary"
						size="large"
						variant="outlined"
						onClick={() => dispatch({ type: commonLanguage.commands.CloseHelpArticle })}
					>
						Close
					</Button>
				</Box>
			</DialogActions>
		</Dialog>
	);
});

interface DialogProps {
	helpArticle: HelpArticle;
}
const HelpDialog: React.FC<DialogProps> = ({ helpArticle }) => {
	return <Render helpArticle={helpArticle} dispatch={appDispatch} />;
};

export default HelpDialog;
