import React, { memo, ReactElement } from 'react';
import {
	Canvas,
	LinearGradient,
	Rect,
	rect,
	useCanvas,
	useComputedValue,
	vec,
} from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';

import { AnimatedView, View as ThemedView } from '../styles/components';

const Gradient = (): ReactElement => {
	const { size } = useCanvas();

	const rct = useComputedValue(
		() => rect(0, 0, size.current.width, size.current.height),
		[size],
	);
	const end = useComputedValue(() => vec(0, size.current.height), [size]);

	return (
		<Rect x={0} y={0} rect={rct}>
			<LinearGradient
				start={vec(0, 0)}
				end={end}
				colors={['#101010', 'black']}
			/>
		</Rect>
	);
};

const GradientWrapper = ({ animatedContentHeight, style }): ReactElement => {
	const animatedStyle = useAnimatedStyle(
		() => ({ height: animatedContentHeight.value + 32 }),
		[animatedContentHeight],
	);

	return (
		<ThemedView style={[styles.root, style]}>
			<AnimatedView style={animatedStyle}>
				<Canvas style={styles.canvas}>
					<Gradient />
				</Canvas>
			</AnimatedView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	root: {
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
		overflow: 'hidden',
	},
	canvas: {
		flex: 1,
	},
});

export default memo(GradientWrapper);
