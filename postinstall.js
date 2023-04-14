const exec = require('child_process').exec;
const fs = require('fs');
const os = require('os');

const devEnvFile = './.env.development';
const createDevEnvFile = 'cp .env.development.template .env.development';

//Create development environment file if it doesn't exist
fs.access(devEnvFile, fs.constants.F_OK, (err) => {
	if (err) {
		console.log(`File '${devEnvFile}' not found, running createDevEnv...`);
		exec(createDevEnvFile);
	}
});

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
