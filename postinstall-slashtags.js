const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'node_modules/@synonymdev/slashtags-sdk');
const index = path.join(root, './index.js');
const old = path.join(root, './index.old.js');

module.exports = async function postInstallSlashtags() {
	console.log('== postInstallSlashtags.js');
	// 1- keep a copy of the original index.js file
	if (fs.readdirSync(root).includes('index.old.js')) {
		console.log('   skip: sdk seemingly already transformed');
		return;
	}
	fs.copyFileSync(index, old);

	// 2- bundle the SDK with "esbuild" to avoid import shenanigans
	await bundle();
	console.log('   esbuild: bundled slashtags-sdk in place...');

	// 3- Fix the stream async iterator problem in a very hacky but working way.
	await transform();
	console.log('   hack: transformed problematic for await of stream');
};

/** Find all instances of for await (let __entry__ of __stream__) {__block__}
 *  to:
 *  Promise.(resolve => {stream.on('data')}) thingy.
 */
async function transform() {
	const bundled = path.join(root, './index.bundled.js');
	fs.copyFileSync(index, bundled);

	let src = fs.readFileSync(bundled).toString();

	const disector = 'for await(';

	let current = src;
	let start = 0;

	while (true) {
		const offset = src.slice(start).indexOf(disector);
		if (offset < 0) {
			break;
		}
		start = start + offset + disector.length;

		current = src.slice(start);

		const parts = current.split(' ');
		const entry = parts[1];
		const _stream = parts[3];
		const streamParenCount = (_stream.split(')')[0].match(/\(/g) || []).length;
		const stream = _stream.split(')')[0] + ')'.repeat(streamParenCount);

		const startBlockAt = current.indexOf(stream) + stream.length + 1; // 1 for closing paren

		const rest = current.slice(startBlockAt);
		const closeBlockAt = findEndOfBlock(rest);

		const block = rest.slice(0, closeBlockAt);

		const transformed = `
  await new Promise((resolve, reject) => {
    const s = ${stream};
    s.on('data', async (${entry}) => {${block.replace(/continue/g, 'return')}});
    s.on('end', resolve);
    s.on('error', reject);
  })
`;

		src =
			src.slice(0, start - disector.length) +
			transformed +
			src.slice(start + startBlockAt + closeBlockAt);
	}

	fs.writeFileSync(index, src);

	function findEndOfBlock(rest) {
		if (rest.startsWith('{')) {
			const brackets = [];
			let offset = 0;

			for (const char of rest) {
				offset = offset + 1;
				if (char === '{') {
					brackets.push(char);
				} else if (char === '}') {
					brackets.pop();
				}

				if (brackets.length === 0) {
					return offset;
				}
			}
		} else {
			return Math.min(rest.indexOf('}'), rest.indexOf(';'));
		}
	}
}

function bundle() {
	const globalName = 'SynonymdevSlashtagsSdk';
	const umdPre = `(function (root, factory) {(typeof module === 'object' && module.exports) ? module.exports = factory() : root.${globalName} = factory()}(typeof self !== 'undefined' ? self : this, function () {`;
	const umdPost = `return ${globalName}}));`;

	return require('esbuild').build({
		entryPoints: [old],
		format: 'iife',
		bundle: true,
		globalName,
		banner: { js: umdPre },
		footer: { js: umdPost },
		outfile: index,
		minify: true,
	});
}
