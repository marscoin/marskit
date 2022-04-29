import React, { memo, ReactElement } from 'react';
import { LayoutAnimation, StyleSheet, Image } from 'react-native';
import {
	View,
	Pressable,
	Caption13Up,
	DismissIcon,
} from '../styles/components';
import Card from './Card';
import BitcoinLogo from '../assets/bitcoin-logo.svg';
import { dismissTodo } from '../store/actions/todos';

const Icon = memo(({ id }: { id: string }): ReactElement => {
	//TODO: Swap out BitcoinLogo with the relevant image based on the provided id.
	switch (id) {
		case 'lightning':
			return <Image source={require('../assets/todo/ln.png')} />;
		case 'pin':
			return <Image source={require('../assets/todo/shield.png')} />;
		case 'backupSeedPhrase':
			return <Image source={require('../assets/todo/book.png')} />;
		case 'activateBackup':
			return (
				<BitcoinLogo viewBox="0 0 70 70" height={'32.54px'} width={'45.52px'} />
			);
		default:
			return (
				<BitcoinLogo viewBox="0 0 70 70" height={'32.54px'} width={'45.52px'} />
			);
	}
});

const CarouselCard = ({
	id = '',
	title = '',
	description = '',
	onPress = (): null => null,
}: {
	id: string;
	title: string;
	description: string;
	onPress?: Function;
}): ReactElement => {
	LayoutAnimation.easeInEaseOut();

	return (
		<Card style={styles.container}>
			<Pressable onPress={onPress} color="transparent" style={styles.pressable}>
				<View color="transparent" style={styles.iconContainer}>
					<Icon id={id} />
				</View>
				<View color="transparent">
					<Caption13Up color="brand">{title}</Caption13Up>
					<Caption13Up color="lightGray">{description}</Caption13Up>
				</View>
			</Pressable>
			<Pressable
				color={'transparent'}
				style={styles.dismiss}
				onPress={(): any => dismissTodo(id)}>
				<DismissIcon />
			</Pressable>
		</Card>
	);
};

const styles = StyleSheet.create({
	container: {
		width: 160,
		height: 160,
		borderRadius: 10,
		paddingHorizontal: 16,
	},
	pressable: {
		flex: 1,
	},
	iconContainer: {
		flex: 1,
		justifyContent: 'center',
	},
	dismiss: {
		position: 'absolute',
		top: 3,
		right: 3,
		padding: 10,
	},
});

export default memo(CarouselCard);
