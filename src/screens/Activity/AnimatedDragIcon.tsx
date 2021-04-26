import React from 'react';
import {
	Transition,
	Transitioning,
	TransitioningView,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

import UpIcon from '../../assets/icons/chevron-up.svg';
import DownIcon from '../../assets/icons/chevron-down.svg';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import themes from '../../styles/themes';

interface Props {
	direction: 'up' | 'down';
}

const iconSize = 22;

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
				<UpIcon
					fill={theme.colors.onBackground}
					height={iconSize}
					width={iconSize}
				/>
			) : (
				<DownIcon
					fill={theme.colors.onBackground}
					height={iconSize}
					width={iconSize}
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
