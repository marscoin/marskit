import React, { memo, ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { View } from '../../styles/components';
import SearchInput from '../../components/SearchInput';
import List, { IListData } from '../../components/List';
import NavigationHeader from '../../components/NavigationHeader';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import { SettingsScreenProps } from '../../navigation/types';
import { SettingsStackParamList } from '../../navigation/settings/SettingsNavigator';

/**
 * Generic settings view
 * @param title
 * @param data
 * @param showBackNavigation
 * @returns {JSX.Element}
 * @constructor
 */
const SettingsView = ({
	title = ' ',
	listData,
	showBackNavigation = true,
	showSearch = false,
	fullHeight = true,
	children,
	childrenPosition = 'top',
}: {
	title?: string;
	listData?: IListData[];
	showBackNavigation: boolean;
	showSearch?: boolean;
	fullHeight?: boolean;
	children?: ReactElement | ReactElement[] | undefined;
	childrenPosition?: 'top' | 'bottom';
}): ReactElement => {
	const navigation =
		useNavigation<
			SettingsScreenProps<keyof SettingsStackParamList>['navigation']
		>();

	const [search, setSearch] = useState('');
	const filteredListData =
		listData?.map((section) => {
			const filteredSectionData = section.data.filter((item) => {
				return item.title.toLowerCase().includes(search.toLowerCase());
			});

			const filteredSection = filteredSectionData.length > 0 ? section : null;

			return { ...filteredSection, data: filteredSectionData };
		}) ?? [];

	return (
		<View style={fullHeight && styles.fullHeight} color="black">
			<SafeAreaInsets type="top" />
			<NavigationHeader
				title={title}
				displayBackButton={showBackNavigation}
				onClosePress={(): void => {
					navigation.navigate('Tabs');
				}}
			/>

			{showSearch ? (
				<SearchInput
					style={styles.searchInput}
					value={search}
					onChangeText={setSearch}
				/>
			) : null}

			{children && childrenPosition === 'top' ? (
				<View color="black">{children}</View>
			) : null}

			{listData ? (
				<View
					style={[
						styles.listContent,
						fullHeight && styles.listContentFullHeight,
					]}
					color="black">
					<List
						style={fullHeight && styles.listFullHeight}
						data={filteredListData}
						bounces={!!fullHeight}
					/>
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
	searchInput: {
		marginHorizontal: 16,
	},
	listContent: {
		paddingHorizontal: 16,
	},
	listContentFullHeight: {
		flex: 1,
	},
	listFullHeight: {
		paddingBottom: 55,
	},
	childrenContent: {
		flex: 1,
	},
	fullHeight: {
		flex: 1,
	},
});

export default memo(SettingsView);
