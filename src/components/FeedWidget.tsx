import React, { memo, ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { rootNavigation } from '../navigation/root/RootNavigator';
import { TouchableOpacity, View } from '../styles/components';
import { Caption13M, Text01M } from '../styles/text';
import { SettingsIcon, ListIcon, TrashIcon } from '../styles/icons';
import ProfileImage from './ProfileImage';
import { IWidget } from '../store/types/widgets';
import { useFeedWidget } from '../hooks/widgets';
import { deleteWidget } from '../store/actions/widgets';
import Dialog from './Dialog';

const DefaultRightComponent = ({ value }: { value?: string }): ReactElement => {
	return <Text01M numberOfLines={1}>{value}</Text01M>;
};

const FeedWidget = ({
	url,
	widget,
	icon,
	name,
	isEditing = false,
	onLongPress,
	testID,
}: {
	url: string;
	widget: IWidget;
	icon?: ReactElement;
	name?: string;
	isEditing?: boolean;
	onLongPress?: () => void;
	testID?: string;
}): ReactElement => {
	const { value } = useFeedWidget({ url, feed: widget.feed });

	return (
		<BaseFeedWidget
			url={url}
			name={name || widget.feed.name}
			label={widget.feed.field?.name}
			isEditing={isEditing}
			onLongPress={onLongPress}
			right={<DefaultRightComponent value={value?.toString()} />}
			icon={
				icon || (
					<ProfileImage
						style={styles.icon}
						url={url}
						image={widget.feed.icon}
						size={32}
					/>
				)
			}
			testID={testID}
		/>
	);
};

export const BaseFeedWidget = ({
	url,
	name,
	icon,
	label,
	right = <View />,
	middle,
	isEditing,
	onLongPress,
	onPressIn,
	testID,
}: {
	url: string;
	name?: string;
	icon?: ReactElement;
	label?: string;
	right?: ReactElement;
	middle?: ReactElement;
	isEditing?: boolean;
	onLongPress?: () => void;
	onPressIn?: () => void;
	testID?: string;
}): ReactElement => {
	const { t } = useTranslation('slashtags');
	const [showDialog, setShowDialog] = useState(false);

	const onEdit = (): void => {
		rootNavigation.navigate('WidgetFeedEdit', { url });
	};

	const onDelete = (): void => {
		setShowDialog(true);
	};

	return (
		<TouchableOpacity
			style={styles.root}
			activeOpacity={0.9}
			onLongPress={onLongPress}
			onPressIn={onPressIn}
			testID={testID}>
			<View style={styles.infoContainer}>
				<View style={styles.icon}>{icon}</View>
				<View style={styles.labelsContainer}>
					<Text01M style={styles.name}>{name}</Text01M>
					<Caption13M color="gray1" style={styles.label}>
						{label}
					</Caption13M>
				</View>
			</View>

			{isEditing ? (
				<>
					<TouchableOpacity style={styles.actionButton} onPress={onDelete}>
						<TrashIcon width={22} />
					</TouchableOpacity>
					<TouchableOpacity style={styles.actionButton} onPress={onEdit}>
						<SettingsIcon width={22} />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.actionButton}
						onLongPress={onLongPress}
						onPressIn={onPressIn}
						activeOpacity={0.9}>
						<ListIcon color="white" width={24} />
					</TouchableOpacity>
				</>
			) : (
				<View style={styles.dataContainer}>
					{middle && <View style={styles.middle}>{middle}</View>}
					<View style={styles.right}>{right}</View>
				</View>
			)}

			<Dialog
				visible={showDialog}
				title={t('widget_delete_title')}
				description={t('widget_delete_desc', { name })}
				confirmText={t('widget_delete_yes')}
				onCancel={(): void => {
					setShowDialog(false);
				}}
				onConfirm={(): void => {
					deleteWidget(url);
					setShowDialog(false);
				}}
			/>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	root: {
		height: 88,
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
		borderBottomWidth: 1,
	},
	infoContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	icon: {
		marginRight: 16,
		borderRadius: 6.4,
		overflow: 'hidden',
		height: 32,
		width: 32,
	},
	labelsContainer: {
		flex: 1,
	},
	name: {
		lineHeight: 22,
	},
	label: {
		lineHeight: 18,
	},
	dataContainer: {
		flex: 1,
		flexDirection: 'row',
	},
	middle: {
		flex: 5,
	},
	right: {
		flex: 6,
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	actionButton: {
		paddingHorizontal: 10,
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default memo(FeedWidget);
