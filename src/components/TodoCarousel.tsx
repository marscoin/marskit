import React, { useCallback, useRef, memo, ReactElement } from 'react';
import { View, Subtitle } from '../styles/components';
import Carousel from 'react-native-snap-carousel';
import CarouselCard from './CarouselCard';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { handleOnPress } from '../utils/todos';

const TodoCarousel = (): ReactElement => {
	const navigation = useNavigation();
	const ref = useRef(null);
	const todos = useSelector((state: Store) => state.todos.todos);

	const renderItem = useCallback(
		({ item }) => (
			<CarouselCard
				id={item.id}
				title={item.title}
				description={item.description}
				onPress={(): void => handleOnPress({ navigation, type: item.type })}
			/>
		),
		//eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
	if (!todos.length) {
		return <></>;
	}
	return (
		<>
			<Subtitle style={styles.content}>Suggestions:</Subtitle>
			<View style={styles.container}>
				<Carousel
					layout="default"
					ref={ref}
					data={todos}
					sliderWidth={180}
					itemWidth={170}
					renderItem={renderItem}
					inactiveSlideScale={1}
					inactiveSlideOpacity={1}
				/>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	content: {
		paddingHorizontal: 20,
	},
});

export default memo(TodoCarousel);
