import React, { memo, ReactElement, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import {
	Canvas,
	Paint,
	RadialGradient,
	Rect,
	runTiming,
	useValue,
	vec,
} from '@shopify/react-native-skia';

import { View } from '../styles/components';
import Store from '../store/types';
import themes from '../styles/themes';

const DURATION = 1000;

const Glow = memo(
	({
		top,
		color,
		fadeout,
		width,
		height,
	}: {
		top?: boolean;
		color: string;
		fadeout: boolean;
		width: number;
		height: number;
	}) => {
		const opacity = useValue(0);

		useEffect(() => {
			runTiming(opacity, fadeout ? 0 : 1, { duration: DURATION });
		}, [opacity, fadeout]);

		return (
			<>
				<Paint>
					{top ? (
						<RadialGradient
							c={vec(-270, 100)}
							r={600}
							colors={[color, 'transparent']}
						/>
					) : (
						<RadialGradient
							c={vec(width, height)}
							r={width}
							colors={[color, 'transparent']}
						/>
					)}
				</Paint>
				<Rect x={0} y={0} width={width} height={height} opacity={opacity} />
			</>
		);
	},
);

const GlowingBackground = ({
	children,
	topLeft,
	bottomRight,
}: {
	children: ReactElement | ReactElement[];
	topLeft?: string;
	bottomRight?: string;
}): ReactElement => {
	const colors = useSelector(
		(state: Store) => themes[state.settings.theme].colors,
	);
	topLeft = topLeft ?? colors.background;
	bottomRight = bottomRight ?? colors.background;
	const [size, setSize] = useState({ width: 0, height: 0 });
	const [topLeftItems, setTopLeftItems] = useState([{ color: topLeft, id: 0 }]);
	const [bottomRightItems, setBottomRightItems] = useState([
		{ color: bottomRight, id: 0 },
	]);

	const onLayout = (event): void => {
		setSize({
			width: event.nativeEvent.layout.width,
			height: event.nativeEvent.layout.height,
		});
	};

	useEffect(() => {
		setTopLeftItems((items) => {
			if (items[items.length - 1].color === topLeft) {
				return items;
			}
			const id = items[items.length - 1].id + 1;
			return [...items.splice(-4), { color: topLeft, id }];
		});
	}, [topLeft]);

	useEffect(() => {
		setBottomRightItems((items) => {
			if (items[items.length - 1].color === bottomRight) {
				return items;
			}
			const id = items[items.length - 1].id + 1;
			return [...items.splice(-4), { color: bottomRight, id }];
		});
	}, [bottomRight]);

	return (
		<View style={styles.container}>
			<View style={styles.overlay} onLayout={onLayout}>
				<Canvas style={styles.container}>
					{topLeftItems.map(({ id, color }, index, arr) => (
						<Glow
							key={id}
							top={true}
							color={color}
							fadeout={index !== arr.length - 1}
							width={size.width}
							height={size.height}
						/>
					))}

					{bottomRightItems.map(({ id, color }, index, arr) => (
						<Glow
							key={id}
							color={color}
							fadeout={index !== arr.length - 1}
							width={size.width}
							height={size.height}
						/>
					))}
				</Canvas>
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
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
});

export default memo(GlowingBackground);
