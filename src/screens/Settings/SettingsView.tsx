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
	data,
	showBackNavigation = true,
}: {
	title: string;
	data: IListData[];
	showBackNavigation: boolean;
}): ReactElement => {
	const [hideHeaderShadow, setHideHeaderShadow] = useState(false);

	return (
		<View style={styles.container} color={'onSurface'}>
			<SettingsHeader
				title={title}
				showBackNavigation={showBackNavigation}
				showShadow={hideHeaderShadow}
			/>
			<View style={styles.content} color={'onSurface'}>
				<List data={data} onScrollDownChange={setHideHeaderShadow} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 16,
	},
});

export default memo(SettingsView);
