module.exports = {
	'src/**/*.{ts,tsx}': ['prettier --write', 'eslint --ext .ts,.tsx'],
	'*.{yml,md}': ['prettier --write'],
};
