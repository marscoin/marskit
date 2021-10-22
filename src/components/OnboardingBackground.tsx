import React, { memo, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import RadialGradient from 'react-native-radial-gradient';
import { View } from '../styles/components';
import Store from '../store/types';
import themes from '../styles/themes';

const OnboardingBackground = ({
	children,
}: {
	children: ReactElement | ReactElement[];
}): ReactElement => {
	const colors = useSelector(
		(state: Store) => themes[state.settings.theme].colors,
	);

	const color = 'background';

	return (
		<View color={color} style={styles.container}>
			<View style={styles.overlay}>
				<RadialGradient
					style={styles.glowyThing1}
					colors={['#F37DC0', colors[color]]}
					stops={[0, 1]}
					center={[0, 0]}
					radius={400}
				/>
				<RadialGradient
					style={styles.glowyThing2}
					colors={['#FA9F61', colors[color]]}
					stops={[0, 1]}
					center={[10, 500]}
					radius={400}
				/>
				<RadialGradient
					style={styles.glowyThing3}
					colors={['#57A5FC', colors[color]]}
					stops={[0, 1]}
					center={[480, 400]}
					radius={420}
				/>
			</View>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	overlay: {
		height: '100%',
		position: 'absolute',
	},
	glowyThing1: {
		width: 500,
		height: 500,
		opacity: 0.8,
		top: -150,
		left: -150,
		position: 'absolute',
	},
	glowyThing2: {
		width: 500,
		height: 500,
		opacity: 0.8,
		bottom: -100,
		left: -200,
		position: 'absolute',
	},
	glowyThing3: {
		width: 500,
		height: 500,
		opacity: 0.8,
		bottom: 0,
		left: 200,
		position: 'absolute',
	},
});

export default memo(OnboardingBackground);
