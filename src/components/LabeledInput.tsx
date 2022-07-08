import React, { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text, TextInput, View } from '../styles/components';

export const Input = ({
	label,
	multiline,
	value,
	onChange,
	rightIcon,
	onRightIconPress,
}: {
	label: string;
	multiline?: boolean;
	value?: string;
	onChange?: (value: string) => void;
	rightIcon?: ReactElement;
	onRightIconPress?: () => void;
}): JSX.Element => {
	return (
		<View style={styles.inputContainer}>
			<Text style={styles.label}>{label}</Text>
			<View
				style={
					onChange
						? multiline
							? StyleSheet.compose(styles.input, styles.multiline)
							: styles.input
						: styles.readOnlyInput
				}>
				<TextInput
					style={styles.inputText}
					defaultValue={value}
					color={'white'}
					autoCapitalize="none"
					autoCorrect={false}
					placeholder={label}
					onChangeText={onChange}
					multiline={multiline || false}
					editable={!!onChange}
				/>
				{rightIcon && (
					<TouchableOpacity style={styles.rightIcon} onPress={onRightIconPress}>
						{rightIcon}
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	input: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		fontSize: 17,
		padding: 16,
		height: 52,
		borderRadius: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
	},
	multiline: {
		height: 96,
		flexDirection: 'column',
		alignItems: 'baseline',
	},
	readOnlyInput: {
		borderRadius: 8,
		paddingTop: 8,
		paddingBottom: 32,
		borderBottomWidth: 2,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
	label: {
		fontWeight: '500',
		fontSize: 13,
		lineHeight: 18,
		textTransform: 'uppercase',
		color: '#8E8E93',
		marginBottom: 8,
	},
	inputContainer: {
		marginBottom: 16,
		backgroundColor: 'transparent',
	},
	inputText: {
		backgroundColor: 'transparent',
		flex: 1,
		fontSize: 15,
		fontWeight: '600',
	},
	rightIcon: {
		marginLeft: 16,
	},
});

export default Input;
