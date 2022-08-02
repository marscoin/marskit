import React, { memo, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../../styles/components';

import List, { IListData } from '../../components/List';

import NavigationHeader from '../../components/NavigationHeader';
import SafeAreaInsets from '../../components/SafeAreaInsets';

/**
 * Generic settings view
 * @param title
 * @param data
 * @param showBackNavigation
 * @returns {JSX.Element}
 * @constructor
 */
const SettingsView = ({
	title,
	listData,
	showBackNavigation = true,
	fullHeight = true,
	children,
	childrenPosition = 'top',
}: {
	title: string;
	listData?: IListData[];
	showBackNavigation: boolean;
	fullHeight?: boolean;
	children?: ReactElement | ReactElement[] | undefined;
	childrenPosition?: 'top' | 'bottom';
}): ReactElement => {
	return (
		<View style={[fullHeight ? styles.fullHeight : null]} color="black">
			<SafeAreaInsets type="top" />
			<NavigationHeader title={title} displayBackButton={showBackNavigation} />

			{children && childrenPosition === 'top' ? (
				<View color="black">{children}</View>
			) : null}

			{listData ? (
				<View style={styles.listContent} color="black">
					<List data={listData} />
				</View>
			) : null}

			{children && childrenPosition === 'bottom' ? (
				<View style={styles.childrenContent} color="black">
					{children}
				</View>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	listContent: {
		paddingHorizontal: 16,
	},
	childrenContent: {
		flex: 1,
	},
	fullHeight: {
		flex: 1,
	},
});

export default memo(SettingsView);
