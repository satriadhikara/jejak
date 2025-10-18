export default {
  expo: {
    name: 'jejak',
    slug: 'jejak',
    version: '1.0.0',
    scheme: 'jejak',
    platforms: ['ios', 'android'],
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'cover',
      backgroundColor: '#161B50',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.jejak.app',
      splash: {
        image: './assets/splash.png',
        resizeMode: 'cover',
        backgroundColor: '#161B50',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.jejak.app',
      splash: {
        image: './assets/splash.png',
        resizeMode: 'cover',
        backgroundColor: '#161B50',
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        },
      },
    },
    plugins: [
      'expo-router',
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/Inter_28pt-Thin.ttf',
            './assets/fonts/Inter_28pt-ExtraLight.ttf',
            './assets/fonts/Inter_28pt-Light.ttf',
            './assets/fonts/Inter_28pt-Regular.ttf',
            './assets/fonts/Inter_28pt-Medium.ttf',
            './assets/fonts/Inter_28pt-SemiBold.ttf',
            './assets/fonts/Inter_28pt-Bold.ttf',
            './assets/fonts/Inter_28pt-ExtraBold.ttf',
            './assets/fonts/Inter_28pt-Black.ttf',
          ],
        },
      ],
      'expo-secure-store',
      'expo-web-browser',
      [
        'expo-maps',
        {
          requestLocationPermission: true,
          locationPermission: 'Allow $(PRODUCT_NAME) to use your location',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
          microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
          recordAudioAndroid: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    assetBundlePatterns: ['**/*'],
  },
};
