import React, { memo, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity, View, Switch } from '../styles/components';

const SwitchRow = ({
	onPress,
	isEnabled,
	children,
}: {
	onPress: (previousState: boolean) => any;
	isEnabled: boolean;
	children: ReactElement;
}): ReactElement => {
	return (
		<>
			<TouchableOpacity
				onPress={onPress}
				activeOpacity={1}
				color="onSurface"
				style={styles.container}>
				<View color="onSurface" style={styles.leftColumn}>
					{children}
				</View>
				<View color="transparent" style={styles.rightColumn}>
					<Switch onValueChange={onPress} value={isEnabled} />
				</View>
			</TouchableOpacity>
			<View color={'gray4'} style={styles.divider} />
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingVertical: 8,
		justifyContent: 'flex-start',
	},
	divider: {
		height: 1,
		marginVertical: 5,
	},
	leftColumn: {
		flex: 1,
		justifyContent: 'center',
		paddingLeft: 16,
	},
	rightColumn: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-end',
		alignSelf: 'center',
		paddingRight: 10,
	},
});

export default memo(SwitchRow);
