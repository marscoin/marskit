import React, { memo, PropsWithChildren, ReactElement, useMemo } from 'react';
import {
	Edge,
	SafeAreaView as SafeAreaViewRN,
} from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { StyleSheet } from 'react-native';
import { themeColorsSelector } from '../store/reselect/settings';

interface Props extends PropsWithChildren<any> {
	children: any;
	style?: any;
}

const SafeAreaView = ({
	children,
	style = {},
	...props
}: Props): ReactElement => {
	const colors = useSelector(themeColorsSelector);

	const safeAreaStyles = useMemo(() => {
		return {
			backgroundColor: colors.background,
			...styles.container,
			...style,
		};
	}, [colors.background, style]);

	const edges: readonly Edge[] = useMemo(() => ['top'], []);

	return (
		<SafeAreaViewRN style={safeAreaStyles} edges={edges} {...props}>
			{children}
		</SafeAreaViewRN>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default memo(SafeAreaView);
