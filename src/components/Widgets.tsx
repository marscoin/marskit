import React, {
	memo,
	ReactElement,
	useCallback,
	useMemo,
	useState,
} from 'react';
import { Linking, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Client } from '@synonymdev/slashtags-auth';

import { useProfile, useSelectedSlashtag } from '../hooks/slashtags';
import { navigate } from '../navigation/root/RootNavigator';
import Store from '../store/types';
import {
	PlusIcon,
	Subtitle,
	Text01M,
	TouchableOpacity,
	View,
} from '../styles/components';
import { showErrorNotification } from '../utils/notifications';
import BitfinexWidget from './BitfinexWidget';
import Button from './Button';
import ProfileImage from './ProfileImage';

const WidgetItem = ({ url }: { url: string }): ReactElement => {
	const [showButtons, setShowButtons] = useState(false);
	const widget = useSelector((state: Store) => state.widgets.widgets[url]);

	const { profile } = useProfile(url);
	const { slashtag } = useSelectedSlashtag();

	const switchShowButtons = (): void => {
		setShowButtons((b) => !b);
	};

	const client = useMemo(() => {
		return new Client(slashtag);
	}, [slashtag]);

	const openMagicLink = useCallback(async () => {
		const magiclink = await client.magiclink(url).catch((e: Error) => {
			showErrorNotification({
				title: 'Failed to get login link',
				message:
					e.message === 'channel closed'
						? 'Could not connect to peer'
						: e.message,
			});
		});

		Linking.openURL(magiclink.url).catch((e) => {
			showErrorNotification({
				title: 'Error opening login link',
				message: e.message,
			});
		});
	}, [client, url]);

	return (
		<TouchableOpacity
			style={widgetStyles.container}
			onPress={switchShowButtons}
			activeOpacity={0.9}>
			<View style={widgetStyles.left}>
				<ProfileImage
					style={widgetStyles.icon}
					url={url}
					image={profile?.image}
					size={32}
				/>
				<Text01M>{profile?.name || ' '}</Text01M>
			</View>
			<View style={widgetStyles.right}>
				{showButtons ? (
					<View style={widgetStyles.buttonsContainer}>
						{widget.magiclink && (
							<Button text="Log in" onPress={openMagicLink} />
						)}
					</View>
				) : (
					<View />
				)}
			</View>
		</TouchableOpacity>
	);
};

const Widgets = (): ReactElement => {
	const widgets = useSelector((state: Store) => state.widgets?.widgets || {});

	return (
		<>
			<Subtitle style={styles.title}>Widgets</Subtitle>
			<View>
				<BitfinexWidget />
				{Object.keys(widgets).map((url) => (
					<WidgetItem key={url} url={url} />
				))}
				<TouchableOpacity
					onPress={(): void => {
						navigate('Scanner', {});
					}}
					style={styles.add}>
					<View color="green16" style={styles.iconCircle}>
						<PlusIcon height={13} color="green" />
					</View>
					<Text01M>Add Widget</Text01M>
				</TouchableOpacity>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	title: {
		marginTop: 32,
		marginBottom: 8,
	},
	add: {
		height: 88,
		flexDirection: 'row',
		alignItems: 'center',
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
});

const widgetStyles = StyleSheet.create({
	container: {
		height: 88,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
		borderBottomWidth: 1,
	},
	left: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	right: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	icon: {
		marginRight: 16,
		borderRadius: 6.4,
		overflow: 'hidden',
	},
	buttonsContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
});

export default memo(Widgets);
