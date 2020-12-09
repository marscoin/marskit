/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const { getDefaultConfig } = require("metro-config");
const blacklist = require('metro-config/src/defaults/blacklist');

module.exports = (async () => {
	const {
		resolver: { sourceExts, assetExts }
	} = await getDefaultConfig();
	return {
		transformer: {
			getTransformOptions: async () => ({
				transform: {
					experimentalImportSupport: false,
					inlineRequires: false,
				},
			}),
			babelTransformerPath: require.resolve("react-native-svg-transformer")
		},
		resolver: {
			blacklistRE: blacklist([/nodejs-assets\/.*/, /android\/.*/, /ios\/.*/]),
			assetExts: assetExts.filter(ext => ext !== "svg"),
			sourceExts: [...sourceExts, "svg"]
		}
	};
})();
