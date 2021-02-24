var exec = require('child_process').exec;
var os = require('os');

function postInstallMac() {
	exec(
		'rn-nodeify --install buffer,stream,assert,events,crypto,vm,process --hack && cd ios && pod install && cd ..',
	);
}
function postInstallLinWin() {
	exec(
		'rn-nodeify --install buffer,stream,assert,events,crypto,vm,process --hack',
	);
}

//TODO: remove this once react-native-lightning is published to npm
function buildRnLightning() {
	console.log("***Start of temporary hack for building react-native-lightning. TODO: remove this once published to npm.***\"\n")
	exec(
		'cd node_modules/react-native-lightning/\n' +
		'rm -rf dist\n' +
		'mkdir dist\n' +
		'yarn install\n' +
		'yarn protobuf\n' +
		'cd ../../\n' +
		'cp node_modules/react-native-lightning/dist/rpc.js node_modules/react-native-lightning/src\n' +
		'sed -i -e "s/dist\\/index.js/src\\/index.ts/g" node_modules/react-native-lightning/package.json\n' +
		'sed -i -e "s/\\"types\\": \\".\\/dist\\/index.d.ts\\",//g" node_modules/react-native-lightning/package.json\n'
	)
	console.log("***End of temporary hack.***\"")
}

if (os.type() === 'Darwin') {
	postInstallMac();
	buildRnLightning();
} else {
	postInstallLinWin();
}
