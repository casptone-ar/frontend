// app/_layout.tsx

import initializeServices from "@/service/initialize";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { TamaguiProvider } from "tamagui";

import { useAppFonts } from "@/View/bootstrap/useFonts";
import { useHydrationStatus } from "@/View/bootstrap/useHydrationStatus";
import { GlobalLoadingSpinner } from "@/View/core/GlobalLoadingSpinner";
import { AppProvider } from "./AppProvider";

import * as SplashScreen from "expo-splash-screen";
import {
  ReanimatedLogLevel,
  configureReanimatedLogger,
} from "react-native-reanimated";
import config from "../tamagui/tamagui.config";

SplashScreen.preventAutoHideAsync().catch(() => {});

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  const [isServiceInitialized, setIsServiceInitialized] = useState(false);

  const { isGlobalFontLoaded } = useAppFonts();
  const isHydrated = useHydrationStatus();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeServices();
        setIsServiceInitialized(true);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    initialize();
  }, []);

  const ready = isServiceInitialized && isGlobalFontLoaded && isHydrated;

  console.log("RootLayout flags =>", {
    isGlobalFontLoaded,
    isHydrated,
    isServiceInitialized,
    ready,
  });

  return (
    <TamaguiProvider config={config}>
      {/* 👇 준비 여부는 AppProvider에 넘겨서 거기서 로딩 처리 */}
      <AppProvider appReady={ready}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
          <Stack.Screen name="(protected)" />
          <Stack.Screen name="(onboarding)" />
        </Stack>
        <GlobalLoadingSpinner />
      </AppProvider>
    </TamaguiProvider>
  );
}
