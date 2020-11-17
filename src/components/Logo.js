import React, { useState, useEffect, memo } from "react";
import {
	Animated as RNAnimated,
} from "react-native";
import Icon from "react-native-vector-icons/dist/Entypo";
import Animated, { Easing } from "react-native-reanimated";
import colors from "../styles/colors";

const Logo = () => {
	const [circleOpacity] = useState(new Animated.Value(0));

	useEffect(() => {
		RNAnimated.parallel([
			Animated.timing(
				circleOpacity,
				{
					toValue: 1,
					duration: 1500,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				},
			),
		]).start();
	}, []);

	return (
		<Animated.View style={{ opacity: circleOpacity }}>
			<Icon name="circle" size={80} color={colors.orange} />
		</Animated.View>
	);
};

export default memo(Logo);
