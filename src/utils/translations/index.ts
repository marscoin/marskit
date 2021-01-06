import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';
import resources from './locales';

const getDeviceLanguage = (): string => {
	if (Platform.OS === 'ios') {
		return (
			NativeModules.SettingsManager.settings.AppleLocale ||
			NativeModules.SettingsManager.settings.AppleLanguages[0]
		);
	}

	return NativeModules.I18nManager.localeIdentifier;
};

console.warn(getDeviceLanguage());

i18n
	.use(initReactI18next)
	.init({
		lng: getDeviceLanguage(),
		fallbackLng: 'en',
		resources,
		ns: Object.keys(resources),
		defaultNS: 'common',
		debug: __DEV__,
		cache: {
			enabled: true,
		},
		interpolation: {
			escapeValue: false,
		},
	})
	.then();

export default i18n;
