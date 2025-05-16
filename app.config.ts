import type { ConfigContext, ExpoConfig } from "expo/config";

/** @change 앱 슬러그 수정 필요 */
const APP_SLUG = "neopets";

// 환경 타입 정의
type Environment = "development" | "staging" | "production";

// 광고 ID 타입 정의
interface AdMobConfig {
  androidAppId: string;
  iosAppId: string;
  banner: string;
  interstitial: string;
  rewarded: string;
  rewardedInterstitial: string;
  appOpen: string;
}

// 환경별 설정 타입 정의
interface EnvConfig {
  appName: string;
  icon: string;
  adaptiveIcon: {
    foregroundImage: string;
    backgroundColor: string;
  };
  bundleIdentifier: string;
  googleServicesFile: string;
}

// 환경별 설정
const ENV: Record<Environment, EnvConfig> = {
  development: {
    /** @change 앱 이름 수정 필요 */
    appName: "[DEV] Neopets",
    icon: "./assets/icon.png",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    /** @change 번들 식별자 수정 필요 */
    bundleIdentifier: "com.inlee.neopets",
    /** @change 파일 경로 수정 필요 */
    googleServicesFile: "./GoogleService-Info.plist",
    /** @change 광고 ID 수정 필요 */
    adMob: {
      androidAppId: "ca-app-pub-2037720801514821~1560566748",
      iosAppId: "ca-app-pub-2037720801514821~7798672033",
      banner: "ca-app-pub-xxxxxxxxxxxxxxxx/dev-banner",
      interstitial: "ca-app-pub-xxxxxxxxxxxxxxxx/dev-interstitial",
      rewarded: "ca-app-pub-xxxxxxxxxxxxxxxx/dev-rewarded",
      rewardedInterstitial:
        "ca-app-pub-xxxxxxxxxxxxxxxx/dev-rewarded-interstitial",
      appOpen: "ca-app-pub-xxxxxxxxxxxxxxxx/dev-app-open",
    },
  },
  staging: {
    /** @change 앱 이름 수정 필요 */
    appName: "[STG] Neopets",
    icon: "./assets/icon.png",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    /** @change 번들 식별자 수정 필요 */
    bundleIdentifier: "com.inlee.neopets",
    /** @change 파일 경로 수정 필요 */
    googleServicesFile: "./GoogleService-Info.plist",
  },
  production: {
    /** @change 앱 이름 수정 필요 */
    appName: "Neopets",
    icon: "./assets/icon.png",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    /** @change 번들 식별자 수정 필요 */
    bundleIdentifier: "com.inlee.neopets",
    /** @change 파일 경로 수정 필요 */
    googleServicesFile: "./GoogleService-Info.plist",
  },
};

// 플러그인 타입 정의
type Plugin = string | [string, any] | [] | [string];

// 라우터 플러그인
const EXPO_ROUTER_PLUGIN: Plugin = "expo-router";

const DEV_CLIENT_PLUGIN: Plugin = [
  "expo-dev-client",
  {
    launchMode: "most-recent",
  },
];

const EXPO_CAMERA_PLUGIN: Plugin = [
  "expo-camera",
  {
    cameraPermission: "Allow to access your camera",
    microphonePermission: "Allow to access your microphone",
    recordAudioAndroid: true,
  },
];

const EXPO_ASSETS_PLUGIN: Plugin = [
  "expo-asset",
  {
    assets: ["./assets"],
  },
];

const FIREBASE_APP_PLUGIN: Plugin = ["@react-native-firebase/app"];

const FIREBASE_AUTH_PLUGIN: Plugin = ["@react-native-firebase/auth"];

const FIREBASE_CRASHLYTICS_PLUGIN: Plugin = [
  "@react-native-firebase/crashlytics",
];

const BUILD_PROPERTIES_PLUGIN: Plugin = [
  "expo-build-properties",
  {
    ios: {
      useFrameworks: "static",
    },
  },
];

const EXPO_CALENDAR_PLUGIN: Plugin = [
  "expo-calendar",
  {
    calendarPermission:
      "The app needs to access your calendar to sync your events",
  },
];

const EXPO_IMAGE_PICKER_PLUGIN: Plugin = [
  "expo-image-picker",
  {
    photosPermission: "Allow App to access your photos.",
  },
];

const EXPO_MEDIA_LIBRARY_PLUGIN: Plugin = [
  "expo-media-library",
  {
    photosPermission: "Allow App to access your photos.",
    savePhotosPermission: "Allow App to save photos.",
    isAccessMediaLocationEnabled: true,
  },
];

const EXPO_TRACKING_TRANSPARENCY_PLUGIN: Plugin = [
  "expo-tracking-transparency",
  {
    userTrackingPermission:
      "This identifier will be used to deliver personalized ads to you.",
  },
];

export default ({ config }: ConfigContext): ExpoConfig => {
  // 현재 환경 설정 (기본값: development)
  const appVariant = process.env.APP_VARIANT || "development";
  const environment = appVariant as Environment;
  const envConfig = ENV[environment];

  return {
    ...config,
    name: envConfig.appName,
    scheme: APP_SLUG,
    slug: APP_SLUG,
    version: "1.0.0",
    orientation: "portrait",
    icon: envConfig.icon,
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: envConfig.bundleIdentifier,
      appleTeamId: "3MNYG65CXY",
    },
    android: {
      adaptiveIcon: envConfig.adaptiveIcon,
      package: envConfig.bundleIdentifier,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      EXPO_ROUTER_PLUGIN,
      DEV_CLIENT_PLUGIN,
      EXPO_CAMERA_PLUGIN,
      EXPO_ASSETS_PLUGIN,
      FIREBASE_APP_PLUGIN,
      FIREBASE_AUTH_PLUGIN,
      FIREBASE_CRASHLYTICS_PLUGIN,
      BUILD_PROPERTIES_PLUGIN,
      EXPO_MEDIA_LIBRARY_PLUGIN,
      EXPO_IMAGE_PICKER_PLUGIN,
      EXPO_TRACKING_TRANSPARENCY_PLUGIN,
    ],
    extra: {
      APP_VARIANT: environment,
      eas: {
        projectId: "fb5964f8-bbc4-40ce-840b-1ddb68179ce5",
      },
    },

    owner: "neopetscapstone",
  };
};
