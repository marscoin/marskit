import React from 'react';
import {
	Transition,
	Transitioning,
	TransitioningView,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import themes from '../../styles/themes';

interface Props {
	direction: 'up' | 'down';
}

const iconSize = 40;

const AnimatedDragIcon: React.FC<Props> = ({ direction }) => {
	const ref = React.useRef<TransitioningView | null>(null);
	const settings = useSelector((state: Store) => state.settings);
	const theme = themes[settings.theme];

	ref.current?.animateNextTransition();

	const transition = (
		<Transition.Together>
			<Transition.Out type="scale" durationMs={200} delayMs={0} />
			<Transition.Change interpolation="easeInOut" />
			<Transition.In type="scale" durationMs={200} delayMs={100} />
		</Transition.Together>
	);

	return (
		<Transitioning.View
			style={styles.iconContainer}
			ref={ref}
			transition={transition}>
			{direction === 'up' ? (
				<EvilIcons
					name={'chevron-up'}
					size={iconSize}
					color={theme.colors.onBackground}
				/>
			) : (
				<EvilIcons
					name={'chevron-down'}
					size={iconSize}
					color={theme.colors.onBackground}
				/>
			)}
		</Transitioning.View>
	);
};

const styles = StyleSheet.create({
	iconContainer: {
		height: 40,
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		alignContent: 'center',
	},
});

export default AnimatedDragIcon;
