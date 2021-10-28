import React, { memo, ReactElement, useEffect, useState } from 'react';
import SettingsView from '../../SettingsView';
import { getMnemonicPhrase } from '../../../../utils/wallet';
import { getKeychainValue } from '../../../../utils/helpers';

type Seed = {
	title: string;
	words: string[];
};

const Seeds = ({ navigation }): ReactElement => {
	const [seeds, setSeeds] = useState<Seed[]>([]);

	const setupComponent = async (): Promise<void> => {
		let seedTypes: Seed[] = [];
		const btcRes = await getMnemonicPhrase();
		if (btcRes.isOk()) {
			seedTypes.push({
				title: 'Bitcoin',
				words: btcRes.value.split(' '),
			});
		}

		let seedStr = (await getKeychainValue({ key: 'lndMnemonic' })).data;
		if (seedStr) {
			seedTypes.push({
				title: 'Lightning',
				words: seedStr.split(' '),
			});
		}

		//TODO OmniBolt and Slashtag seeds
		let dummyWords: string[] = [];
		for (let index = 1; index <= 24; index++) {
			dummyWords.push('todo');
		}
		seedTypes.push({ title: 'OmniBOLT', words: dummyWords });
		seedTypes.push({ title: 'Slashtags', words: dummyWords });

		setSeeds(seedTypes);
	};

	useEffect(() => {
		setupComponent().then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<SettingsView
			title={'Seeds'}
			listData={[
				{
					data: seeds.map(({ title, words }) => ({
						title,
						type: 'button',
						onPress: (): void =>
							navigation.navigate('ViewSeed', { title, words }),
						hide: false,
					})),
				},
			]}
			showBackNavigation
		/>
	);
};

export default memo(Seeds);
