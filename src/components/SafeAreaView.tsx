import React, { PropsWithChildren, ReactElement } from 'react';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import themes from '../styles/themes';
import { StyleSheet } from 'react-native';

interface Props extends PropsWithChildren<any> {
	children: any;
	style?: any;
}

const SafeAreaView = ({ children, style = {} }: Props): ReactElement => {
	const colors = useSelector(
		(state: Store) => themes[state.settings.theme].colors,
	);

	return (
		<SafeAreaViewRN
			style={{
				backgroundColor: colors.background,
				...styles.container,
				...style,
			}}
			edges={['top']}>
			{children}
		</SafeAreaViewRN>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default SafeAreaView;
