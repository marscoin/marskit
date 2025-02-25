import React, {
	ReactElement,
	memo,
	useCallback,
	useMemo,
	useRef,
	useState,
	useEffect,
} from 'react';
import { StyleSheet, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import DraggableFlatList, {
	RenderItemParams,
	ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { useIsFocused } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { __DISABLE_SLASHTAGS__ } from '../constants/env';
import { rootNavigation } from '../navigation/root/RootNavigator';
import Store from '../store/types';
import { AnimatedView, TouchableOpacity, View } from '../styles/components';
import { Caption13Up, Text, Text01M } from '../styles/text';
import { PlusIcon, SortAscendingIcon, Checkmark } from '../styles/icons';
import { SUPPORTED_FEED_TYPES } from '../utils/widgets';
import { setWidgetsSortOrder } from '../store/actions/widgets';
import PriceWidget from './PriceWidget';
import AuthWidget from './AuthWidget';
import FeedWidget from './FeedWidget';
import HeadlinesWidget from './HeadlinesWidget';
import BlocksWidget from './BlocksWidget';
import FactsWidget from './FactsWidget';

type WCM = {
	x: number;
	y: number;
	width: number;
	height: number;
	pageX: number;
	pageY: number;
};

const Widgets = (): ReactElement => {
	const { t } = useTranslation('slashtags');
	const widgets = useSelector((state: Store) => state.widgets.widgets);
	const sortOrder = useSelector((state: Store) => state.widgets.sortOrder);
	const [editing, setEditing] = useState(false);
	const widgetsContainer = useRef<any>(null);
	const [wcm, setwcm] = useState<undefined | WCM>();
	const isFocused = useIsFocused();

	const widgetsArray = useMemo(() => {
		return Object.entries(widgets).sort(
			([a], [b]) => sortOrder.indexOf(a) - sortOrder.indexOf(b),
		);
	}, [widgets, sortOrder]);

	const handleEditStart = useCallback(async (): Promise<void> => {
		const res: WCM = await new Promise((resolve) => {
			widgetsContainer.current?.measure((x, y, width, height, pageX, pageY) => {
				resolve({ x, y, width, height, pageX, pageY });
			});
		});
		setwcm(res);
		setEditing(true);
	}, []);
	const handleEditEnd = useCallback((): void => {
		setEditing(false);
	}, []);

	useEffect(() => {
		if (isFocused) {
			return;
		}
		handleEditEnd();
	}, [isFocused, handleEditEnd]);

	const handleDragEnd = useCallback(({ data }) => {
		const order = data.map((i): string => i[0]);
		setWidgetsSortOrder(order);
	}, []);

	const renderEditing = useCallback(
		({ item, drag }: RenderItemParams<Array<any>>): ReactElement => {
			const [url, widget] = item;

			if (!widget.feed) {
				return (
					<ScaleDecorator>
						<AuthWidget
							url={url}
							widget={widget}
							isEditing={true}
							onLongPress={drag}
							onPressIn={drag}
						/>
					</ScaleDecorator>
				);
			}

			let Component;
			switch (widget.feed.type) {
				case SUPPORTED_FEED_TYPES.PRICE_FEED:
					Component = PriceWidget;
					break;
				case SUPPORTED_FEED_TYPES.HEADLINES_FEED:
					Component = HeadlinesWidget;
					break;
				case SUPPORTED_FEED_TYPES.BLOCKS_FEED:
					Component = BlocksWidget;
					break;
				case SUPPORTED_FEED_TYPES.FACTS_FEED:
					Component = FactsWidget;
					break;
				default:
					Component = FeedWidget;
			}

			return (
				<ScaleDecorator>
					<Component
						url={url}
						widget={widget}
						isEditing={true}
						onLongPress={drag}
						onPressIn={drag}
					/>
				</ScaleDecorator>
			);
		},
		[],
	);

	const renderFlat = useCallback(
		(item): ReactElement => {
			const [url, widget] = item;
			let testID;

			if (!widget.feed) {
				return (
					<AuthWidget
						key={url}
						url={url}
						widget={widget}
						isEditing={false}
						onLongPress={handleEditStart}
						testID="AuthWidget"
					/>
				);
			}

			let Component;
			switch (widget.feed.type) {
				case SUPPORTED_FEED_TYPES.PRICE_FEED:
					Component = PriceWidget;
					testID = 'PriceWidget';
					break;
				case SUPPORTED_FEED_TYPES.HEADLINES_FEED:
					Component = HeadlinesWidget;
					testID = 'HeadlinesWidget';
					break;
				case SUPPORTED_FEED_TYPES.BLOCKS_FEED:
					Component = BlocksWidget;
					testID = 'BlocksWidget';
					break;
				case SUPPORTED_FEED_TYPES.FACTS_FEED:
					Component = FactsWidget;
					testID = 'FactsWidget';
					break;
				default:
					Component = FeedWidget;
					testID = 'FeedWidget';
			}

			return (
				<Component
					key={url}
					url={url}
					widget={widget}
					isEditing={false}
					onLongPress={handleEditStart}
					testID={testID}
				/>
			);
		},
		[handleEditStart],
	);

	const onAdd = useCallback((): void => {
		rootNavigation.navigate('WidgetsRoot');
	}, []);

	if (__DISABLE_SLASHTAGS__) {
		return (
			<>
				<View style={styles.titleRow}>
					<Caption13Up color="gray1">{t('widgets')}</Caption13Up>
				</View>
				<Text color="gray">{t('disabled')}</Text>
			</>
		);
	}

	return (
		<>
			<View style={styles.titleRow} testID="WidgetsTitle">
				<Caption13Up color="gray1">{t('widgets')}</Caption13Up>
				{widgetsArray.length > 0 && (
					<TouchableOpacity
						style={styles.edit}
						onPress={editing ? handleEditEnd : handleEditStart}>
						{editing ? (
							<Checkmark width={24} height={24} color="gray1" />
						) : (
							<SortAscendingIcon color="gray1" />
						)}
					</TouchableOpacity>
				)}
			</View>
			<View ref={widgetsContainer}>{widgetsArray.map(renderFlat)}</View>
			<TouchableOpacity style={styles.add} onPress={onAdd} testID="WidgetsAdd">
				<View color="green16" style={styles.iconCircle}>
					<PlusIcon height={16} color="green" />
				</View>
				<Text01M>{t('widget_add')}</Text01M>
			</TouchableOpacity>
			<View style={styles.divider} />
			<Modal
				transparent={true}
				visible={editing}
				onRequestClose={handleEditEnd}>
				<TouchableOpacity
					style={styles.backdrop}
					onPress={handleEditEnd}
					activeOpacity={0}
				/>
				{editing && wcm && (
					<AnimatedView
						entering={FadeIn}
						exiting={FadeOut}
						style={[
							styles.absolute,
							{
								left: wcm.pageX,
								top: wcm.pageY,
								width: wcm.width,
							},
						]}>
						{/* we need to wrap DraggableFlatList with GestureHandlerRootView, otherwise Gestures are not working in <Modal for Android */}
						<GestureHandlerRootView>
							<DraggableFlatList
								data={widgetsArray}
								keyExtractor={(item): string => item[0]}
								renderItem={renderEditing}
								onDragEnd={handleDragEnd}
								activationDistance={1}
							/>
						</GestureHandlerRootView>
					</AnimatedView>
				)}
			</Modal>
		</>
	);
};

const styles = StyleSheet.create({
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingTop: 30,
	},
	edit: {
		// increase hitbox
		paddingTop: 10,
		marginTop: -10,
		paddingBottom: 10,
		marginBottom: -10,
		paddingRight: 16,
		marginRight: -16,
		paddingLeft: 16,
		marginLeft: -16,
	},
	add: {
		marginTop: 27,
		flexDirection: 'row',
		alignItems: 'center',
	},
	divider: {
		paddingBottom: 27,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
		borderBottomWidth: 1,
	},
	iconCircle: {
		borderRadius: 20,
		width: 32,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	backdrop: {
		width: '100%',
		height: '100%',
		opacity: 0,
	},
	absolute: {
		position: 'absolute',
	},
});

export default memo(Widgets);
