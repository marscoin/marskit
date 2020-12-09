module.exports = {
	"parser": "@typescript-eslint/parser",
	"env": {
		"es6": true,
		"node": true,
		"jest": true,
		"browser": true,
		"react-native/react-native": true
	},
	"plugins": [
		"react",
		"react-native",
		"jsx-a11y",
		"react-hooks",
		"@typescript-eslint"
	],
	"parserOptions": {
		"ecmaFeatures": {
			"jsx": true
		}
	},
	"extends": [
		"eslint:recommended",
		"plugin:jsx-a11y/recommended",
		"plugin:react/recommended"
	],
	"rules": {
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
		"no-console": 0,
		"no-empty": ["error", { "allowEmptyCatch": true }],
		"no-buffer-constructor": 0,
		"no-case-declarations": 0,
		"no-useless-escape": 0,
		"react/jsx-no-duplicate-props": [2, { "ignoreCase": true }],
		"react-native/no-unused-styles": 1,
		"react-native/no-raw-text": 2,
		"react/jsx-equals-spacing": [2, "never"],
		"react/no-unsafe": [2, { "checkAliases": true }],
		"react/jsx-curly-spacing": [2, {
			"when": "never",
			"attributes": { "allowMultiline": true },
			"children": true,
		}],
		"indent": [2, "tab"],
		"object-curly-spacing": ["error", "always", {
			"objectsInObjects": true,
		}],
		"react/jsx-uses-vars": 2,
		"react/jsx-wrap-multilines": 2,
		"react/jsx-tag-spacing": [2,
			{
				"closingSlash": "never",
				"beforeSelfClosing": "always",
				"afterOpening": "never",
				"beforeClosing": "never"
			}
		],
		"react/jsx-indent": [2, "tab", { indentLogicalExpressions: false }],
		"react/jsx-closing-bracket-location": 2,
		"react/jsx-child-element-spacing": 2,
		"react/no-unused-prop-types": 2,
		"react/prop-types": 0,
		"no-undef": 0,
		"react/display-name": 0,
		"require-atomic-updates": 0,
		"no-async-promise-executor": 0,
		"brace-style": [2, "1tbs", { "allowSingleLine": true }]
	},
	"globals": {
		"fetch": false
	},
	"settings": {
		"react": {
			"version": "detect"
		}
	}
};
