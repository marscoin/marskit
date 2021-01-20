#!/usr/bin/env bash

#Used for Travis CI

echo "***Start of temporary hack for building react-native-lightning. TODO: remove this once published to npm.***"
cd node_modules/react-native-lightning/
rm -rf dist
mkdir dist
yarn protobuf
cd ../../
cp node_modules/react-native-lightning/dist/rpc.js node_modules/react-native-lightning/src/lightning
sed -i -e "s/dist\/index.js/src\/lightning\/index.ts/g" node_modules/react-native-lightning/package.json
echo "***End of temporary hack.***"
