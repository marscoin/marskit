import React, { memo, ReactElement } from 'react';
import { PanGestureHandler } from 'react-native-gesture-handler';

export interface IDetectSwipe {
	onSwipeLeft?: Function | undefined;
	onSwipeRight?: Function | undefined;
	onSwipeUp?: Function | undefined;
	onSwipeDown?: Function | undefined;
	swipeLeftSensitivity?: number;
	swipeRightSensitivity?: number;
	swipeUpSensitivity?: number;
	swipeDownSensitivity?: number;
	onEvent?: Function;
	children?: ReactElement;
}
const DetectSwipe = ({
	onSwipeLeft,
	onSwipeRight,
	onSwipeUp,
	onSwipeDown,
	swipeLeftSensitivity = 600,
	swipeRightSensitivity = 600,
	swipeUpSensitivity = 600,
	swipeDownSensitivity = 600,
	onEvent,
	children,
}: IDetectSwipe): ReactElement => {
	const onPanGestureEvent = (event): void => {
		if (onSwipeLeft && event.nativeEvent.velocityX <= -swipeLeftSensitivity) {
			//Swiping left
			onSwipeLeft();
		}
		if (onSwipeRight && event.nativeEvent.velocityX >= swipeRightSensitivity) {
			//Swiping right.
			onSwipeRight();
		}
		if (onSwipeUp && event.nativeEvent.velocityY <= -swipeUpSensitivity) {
			//Swiping up
			onSwipeUp();
		}
		if (onSwipeDown && event.nativeEvent.velocityY >= swipeDownSensitivity) {
			//Swiping down.
			onSwipeDown();
		}
		if (onEvent) {
			onEvent(event);
		}
	};

	return (
		<PanGestureHandler onGestureEvent={onPanGestureEvent}>
			{children}
		</PanGestureHandler>
	);
};

export default memo(DetectSwipe);
