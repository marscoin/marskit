# Development

Make sure you have [setup your environment for React Native](https://reactnative.dev/docs/environment-setup).

## Installation

1. Clone the repository

```shell
git clone git@github.com:marscoin/marskit.git && cd marskit
```

2. Switch Node version

Switch to the Node.js version defined in `.nvmrc`. If `nvm` (or similiar) is installed on your system you can run `nvm use`.

3. Install dependencies

```shell
yarn install
yarn add react-native-permissions
```

4. Setup iOS or Android dependencies

```shell
brew install cocoapods
pod install
yarn setup-ios
```

or

```shell
yarn setup-android
```

You may have to go into the nodes-assets folder and do a yarn install in there to get the missing node-modules folder

5. Start the project

On iOS Simulator:

```shell
yarn ios
```

On Android Emulator:

```shell
yarn android
```

## Testing

Marskit uses two types of testing: unit and end-to-end (E2E) tests.

### 1. Unit tests

Before running unit tests, you need to install Docker and run marscoind and the electrum server in regtest mode. You can do this by using the docker-compose.yml file from the **tests** directory:

```sh
cd __tests__
docker compose up
```

After that, you are ready to run the tests:

```sh
yarn test
```

### 2. End-to-end (E2E) tests

End-to-end tests are powered by [Detox](https://github.com/wix/Detox). Currently, only the iOS Simulator is supported.

To build the tests:

```shell
yarn e2e:build:ios-release
```

To run them:

```shell
yarn e2e:test:ios-release
```

## Troubleshooting

When running into issues there are a couple things to check.

- Clean caches & build folders: `yarn clean`
- Clean simulator cache (iOS): `xcrun simctl erase all`
- Increase emulated device storage (Android): `Android Studio -> Virtual Device Manager -> Edit Device -> Show Advanced Settings -> increase RAM, VM heap and Internal Storage sizes`
