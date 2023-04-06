import React, { memo } from 'react';
import { Animated, Easing } from 'react-native';
import { DISABLE_LOOP_ANIMATION } from '@env';

const imageSrc = require('../assets/spinner-gradient.png');

export const LoadingSpinner = memo(({ size = 45 }: { size?: number }) => {
	const spinValue = new Animated.Value(0);

	if (DISABLE_LOOP_ANIMATION === 'true') {
		return (
			<Animated.Image style={{ height: size, width: size }} source={imageSrc} />
		);
	}

	Animated.loop(
		Animated.timing(spinValue, {
			toValue: 360,
			duration: 100000,
			easing: Easing.linear,
			useNativeDriver: true,
		}),
	).start();

	return (
		<Animated.Image
			style={{ height: size, width: size, transform: [{ rotate: spinValue }] }}
			source={imageSrc}
		/>
	);
});
