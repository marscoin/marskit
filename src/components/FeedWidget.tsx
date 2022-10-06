import React, { memo, ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';

import { navigate } from '../navigation/root/RootNavigator';
import {
	GearIcon,
	TouchableOpacity,
	View,
	Text01M,
	Caption13M,
} from '../styles/components';
import Button from './Button';
import ProfileImage from './ProfileImage';
import { IWidget } from '../store/types/widgets';
import { useFeedWidget } from '../hooks/widgets';

const DefaultRightComponent = ({ value }: { value?: string }): ReactElement => {
	return <Text01M>{value}</Text01M>;
};

export const FeedWidget = ({
	url,
	widget,
}: {
	url: string;
	widget: IWidget;
}): ReactElement => {
	const { config, value } = useFeedWidget({
		url,
		selectedField: widget.feed.selectedField,
	});

	return (
		<BaseFeedWidget
			url={url}
			name={config?.name}
			label={widget.feed.selectedField}
			right={<DefaultRightComponent value={value} />}
			icon={
				<ProfileImage
					style={styles.icon}
					url={url}
					image={config?.image}
					size={32}
				/>
			}
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
}: {
	url: string;
	name?: string;
	icon?: ReactElement;
	label?: string;
	right?: ReactElement;
	middle?: ReactElement;
}): ReactElement => {
	const [showButtons, setShowButtons] = useState(false);

	const switchShowButtons = (): void => {
		setShowButtons((b) => !b);
	};

	return (
		<TouchableOpacity
			style={styles.root}
			onPress={switchShowButtons}
			activeOpacity={0.9}>
			<View style={styles.infoContainer}>
				<View style={styles.icon}>{icon}</View>
				<View style={styles.labelsContainer}>
					<Text01M>{name}</Text01M>
					<Caption13M color="gray1">{label}</Caption13M>
				</View>
			</View>
			<View style={styles.dataContainer}>
				<View style={styles.middle}>{middle}</View>
				{showButtons ? (
					<Button
						text=""
						icon={<GearIcon width={20} />}
						onPress={(): void => navigate('WidgetFeedEdit', { url })}
					/>
				) : (
					<View style={styles.right}>{right}</View>
				)}
			</View>
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
	icon: {
		marginRight: 8,
		borderRadius: 6.4,
		overflow: 'hidden',
	},
	infoContainer: {
		flex: 1,
		display: 'flex',
		flexDirection: 'row',
	},
	labelsContainer: {
		flex: 1,
	},
	dataContainer: {
		flex: 1,
		display: 'flex',
		flexDirection: 'row',
	},
	middle: {
		flex: 1,
	},
	right: {
		flex: 1,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
});

export default memo(FeedWidget);
