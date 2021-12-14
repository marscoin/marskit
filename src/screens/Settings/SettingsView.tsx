import React, { memo, ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../../styles/components';

import List, { IListData } from '../../components/List';

import SettingsHeader from '../../components/SettingsHeader';

/**
 * Generic settings view with built in header and scroll triggered overlay shadow
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
	children,
}: {
	title: string;
	listData?: IListData[];
	showBackNavigation: boolean;
	children?: ReactElement | ReactElement[] | undefined;
}): ReactElement => {
	const [hideHeaderShadow, setHideHeaderShadow] = useState(false);

	return (
		<View style={styles.container} color={'onSurface'}>
			<SettingsHeader
				title={title}
				showBackNavigation={showBackNavigation}
				showShadow={hideHeaderShadow}
			/>

			{listData ? (
				<View style={styles.listContent} color={'onSurface'}>
					<List data={listData} onScrollDownChange={setHideHeaderShadow} />
				</View>
			) : null}

			{children ? (
				<View style={styles.childrenContent} color={'onSurface'}>
					{children}
				</View>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 16,
		flex: 1,
	},
	childrenContent: {
		flex: 1,
	},
});

export default memo(SettingsView);
