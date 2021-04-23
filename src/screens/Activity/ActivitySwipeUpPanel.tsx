import * as React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import BottomSheet from 'reanimated-bottom-sheet';
import AnimatedDragIcon from './AnimatedDragIcon';
import { View as ThemedView, TextInput } from '../../styles/components';
import ActivityList from './ActivityList';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import themes from '../../styles/themes';
import { updateSearchFilter } from '../../store/actions/activity';

const ActivitySwipeUpPanel = (): React.ReactElement => {
	const [showUp, setShowUp] = React.useState(true);
	const settings = useSelector((state: Store) => state.settings);
	const theme = themes[settings.theme];
	const searchFilter = useSelector(
		(state: Store) => state.activity.searchFilter,
	);

	const renderContent = (): React.ReactElement => (
		<View style={styles.container}>
			<View style={styles.dragIconContainer}>
				<AnimatedDragIcon direction={showUp ? 'up' : 'down'} />
			</View>
			<ThemedView color="onSurface" style={styles.panelHeader}>
				<TextInput
					placeholderTextColor={theme.colors.text}
					placeholder={'Search...'}
					style={styles.searchInput}
					onChangeText={(text) => updateSearchFilter(text)}
					value={searchFilter}
				/>
			</ThemedView>
			<ThemedView color="onSurface" style={styles.content}>
				<ActivityList />
			</ThemedView>
		</View>
	);

	const sheetRef = React.useRef<BottomSheet>(null);

	const screenHeight = Dimensions.get('window').height;
	return (
		<BottomSheet
			ref={sheetRef}
			initialSnap={2}
			snapPoints={[screenHeight - 140, screenHeight / 2 - 100, 40]}
			renderContent={renderContent}
			onOpenStart={(): void => setShowUp(false)}
			onCloseEnd={(): void => setShowUp(true)}
		/>
	);
};

const styles = StyleSheet.create({
	dragIconContainer: {
		display: 'flex',
		alignItems: 'center',
	},
	container: {
		height: '100%',
	},
	panelHeader: {
		height: 85,
		display: 'flex',
		justifyContent: 'flex-end',
		borderTopRightRadius: 20,
		borderTopLeftRadius: 20,
		paddingLeft: 15,
		paddingRight: 15,
	},
	searchInput: {
		marginBottom: 20,
		height: 30,
		fontSize: 18,
		borderStyle: 'solid',
		borderBottomWidth: 1,
	},
	content: {
		height: '100%',
		paddingLeft: 15,
		paddingRight: 15,
	},
});

export default ActivitySwipeUpPanel;
