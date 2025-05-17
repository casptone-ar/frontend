/**
 * 루트 레이아웃
 */

import initializeServices from "@/service/initialize";
import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Spinner, YStack } from "tamagui";

import { useAppFonts } from "@/View/bootstrap/useFonts";
import { useHydrationStatus } from "@/View/bootstrap/useHydrationStatus";
import { GlobalLoadingSpinner } from "@/View/core/GlobalLoadingSpinner";
import { AppProvider } from "@/View/store/AppProvider";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import {
  ReanimatedLogLevel,
  configureReanimatedLogger,
} from "react-native-reanimated";
import SpInAppUpdates, {
  type IosStartUpdateOptions,
} from "sp-react-native-in-app-updates";

const inAppUpdates = new SpInAppUpdates(
  true // isDebug
);

inAppUpdates.checkNeedsUpdate().then((result) => {
  const isDifferentMinorVersion =
    result.storeVersion.split(".")[1] !==
    Constants.expoConfig?.version?.split(".")[1];

  const isDifferentMajorVersion =
    result.storeVersion.split(".")[0] !==
    Constants.expoConfig?.version?.split(".")[0];

  if (result.shouldUpdate) {
    const updateOptions: IosStartUpdateOptions = {
      forceUpgrade: isDifferentMajorVersion || isDifferentMinorVersion,
      title: "New Version Available",
      message: "Please update to the latest version",
      buttonUpgradeText: "Update",
      buttonCancelText: "Later",
    };

    inAppUpdates.startUpdate(updateOptions); // https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L78
  }
});

SplashScreen.preventAutoHideAsync();

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

/**
 * 루트 레이아웃 컴포넌트
 */
export default function RootLayout() {
  const [isServiceInitialized, setIsServiceInitialized] = useState(false);

  // 폰트 로드 상태
  const { isGlobalFontLoaded, hasGlobalFontLoadingError } = useAppFonts();
  // 스토어 하이드레이션 상태
  const isHydrated = useHydrationStatus();

  /**
   * 서비스 초기화
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        // 서비스 초기화
        await initializeServices();

        setIsServiceInitialized(true);

        // 초기화 완료 후 스플래시 화면 숨기기
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    initialize();
  }, []);

  const Render = useCallback(() => {
    if (!isServiceInitialized && !isGlobalFontLoaded && !isHydrated) {
      return (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$blue10" />
        </YStack>
      );
    }

    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
        <Stack.Screen name="(protected)" />
        <Stack.Screen name="(onboarding)" />
      </Stack>
    );
  }, [isServiceInitialized, isGlobalFontLoaded, isHydrated]);

  return (
    <AppProvider>
      <Render />
      <GlobalLoadingSpinner />
    </AppProvider>
  );
}
