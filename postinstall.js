var exec = require('child_process').exec;
var os = require('os');

const baseCommand = `
cd nodejs-assets/nodejs-project &&
yarn install &&
cd ../../ &&
rn-nodeify --install buffer,stream,assert,events,crypto,vm,process --hack`;

function postInstallMac() {
	exec(`${baseCommand} && cd ios && pod install && cd ..`);
}
function postInstallLinWin() {
	exec(baseCommand);
}

if (os.type() === 'Darwin') {
	postInstallMac();
} else {
	postInstallLinWin();
}
