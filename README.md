# Spectrum

### Installation
1. Clone Spectrum & Install Dependencies:
    - `git clone git@github.com:synonymdev/spectrum.git`
   
   
2. Clone the `react-native-lightning` dependency into the same directory:
   - `git clone git@github.com:synonymdev/react-native-lightning`
   

3. Build `react-native-lightning`:
   - `cd react-native-lightning && yarn install && yarn build`
   

3. Install Spectrum Dependencies:
   - `cd ../spectrum && yarn install`
   
   
4. Add Lndmobile libs:
   - iOS: `spectrum/ios/spectrum/lightning/Lndmobile.framework`
   - Android: `spectrum/android/Lndmobile/Lndmobile.aar`


5. Start the project:
    - iOS: `react-native run-ios`
    - Android: `react-native run-android`

### Download APK
 - As testing proceeds, APK's will be added to each release and updated as needed for testing.
   - https://github.com/synonymdev/spectrum/releases/
