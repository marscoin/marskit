import React, { memo, ReactElement } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import {
	View,
	Pressable,
	Text02M,
	Text02S,
	DismissIcon,
} from '../styles/components';
import Card from './Card';
import BitcoinLogo from '../assets/bitcoin-logo.svg';
import { dismissTodo } from '../store/actions/todos';

const Icon = memo(({ id }: { id: string }): ReactElement => {
	//TODO: Swap out BitcoinLogo with the relevant image based on the provided id.
	switch (id) {
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
	children = <View />,
}: {
	id: string;
	title: string;
	description?: string;
	onPress?: Function;
	children?: ReactElement | false;
}): ReactElement => {
	LayoutAnimation.easeInEaseOut();

	return (
		<Card style={styles.container}>
			<>
				<Pressable onPress={onPress} color="transparent" style={styles.row}>
					<View color="transparent" style={styles.col1}>
						<Icon id={id} />
					</View>
					<View color="transparent" style={styles.col2}>
						<>
							<Text02M>{title}</Text02M>
							{description ? (
								<Text02S color="lightGray" style={styles.description}>
									{description}
								</Text02S>
							) : null}
						</>
						<Pressable
							color={'transparent'}
							style={styles.dismiss}
							onPress={(): any => dismissTodo(id)}>
							<DismissIcon />
						</Pressable>
					</View>
				</Pressable>
				{children}
			</>
		</Card>
	);
};

const styles = StyleSheet.create({
	container: {
		width: 276,
		height: 74,
		borderRadius: 10,
	},
	description: {
		fontSize: 12,
	},
	col1: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	col2: {
		flex: 4,
		justifyContent: 'center',
		alignItems: 'flex-start',
		left: 20,
	},
	row: {
		flex: 1,
		flexDirection: 'row',
	},
	dismiss: {
		position: 'absolute',
		top: 0,
		right: 13,
	},
});

export default memo(CarouselCard);
