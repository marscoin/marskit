import React, { memo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import {
	Feather,
	MaterialIcons,
	View,
	TouchableOpacity,
	Text,
} from '../styles/components';
import { DrawerNavigationProp } from '@react-navigation/drawer';

const BackButton = ({ onPress = () => null }: { onPress: Function }) => {
	try {
		return (
			<TouchableOpacity onPress={onPress} style={styles.iconContainer}>
				<MaterialIcons
					style={styles.leftIcon}
					name="arrow-back-ios"
					size={30}
				/>
				<Text>Back</Text>
			</TouchableOpacity>
		);
	} catch {
		return <View />;
	}
};

const NavigationHeader = ({
	title = '',
	isHome = false,
}: {
	title: string;
	isHome?: boolean;
}) => {
	const navigation = useNavigation<DrawerNavigationProp<any>>();
	return (
		<View style={styles.container}>
			<View style={styles.leftColumn}>
				{!isHome && <BackButton onPress={navigation.goBack} />}
			</View>
			<View style={styles.middleColumn}>
				<Text style={styles.title}>{title}</Text>
			</View>
			<View style={styles.rightColumn}>
				{isHome && (
					<Feather
						style={styles.rightIcon}
						onPress={navigation.openDrawer}
						name="menu"
						size={30}
					/>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		marginTop: 15,
		marginHorizontal: 10,
		marginBottom: 20,
		backgroundColor: 'transparent',
	},
	leftColumn: {
		flex: 1,
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},
	middleColumn: {
		flex: 1.5,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	rightColumn: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-end',
		backgroundColor: 'transparent',
	},
	title: {
		textAlign: 'center',
	},
	iconContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	leftIcon: {},
	rightIcon: {},
});

export default memo(NavigationHeader);
