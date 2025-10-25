// app/_layout.tsx

/**
 * 루트 레이아웃 컴포넌트
 * - InAppUpdates (sp-react-native-in-app-updates) 완전 제거
 * - Expo Go / 웹 / 네이티브 환경 모두 실행 가능
 * - 스플래시 화면 제어 및 서비스 초기화
 */

import initializeServices from "@/service/initialize";
import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Spinner, YStack } from "tamagui";

import { useAppFonts } from "@/View/bootstrap/useFonts";
import { useHydrationStatus } from "@/View/bootstrap/useHydrationStatus";
import { GlobalLoadingSpinner } from "@/View/core/GlobalLoadingSpinner";
import { AppProvider } from "./AppProvider";

import * as SplashScreen from "expo-splash-screen";
import {
  ReanimatedLogLevel,
  configureReanimatedLogger,
} from "react-native-reanimated";

// 스플래시 화면 자동 숨김 방지
SplashScreen.preventAutoHideAsync().catch(() => {});

// Reanimated 로그 설정
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  const [isServiceInitialized, setIsServiceInitialized] = useState(false);

  // 폰트 / 스토어 하이드레이션 상태
  const { isGlobalFontLoaded } = useAppFonts();
  const isHydrated = useHydrationStatus();

  // ✅ 서비스 초기화
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeServices(); // 내부적으로 API 등 초기화
        setIsServiceInitialized(true);

        // 모든 준비 완료 후 스플래시 숨기기
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    initialize();
  }, []);

  // 로딩 상태일 때 스피너 표시
  const Render = useCallback(() => {
    if (!isServiceInitialized || !isGlobalFontLoaded || !isHydrated) {
      return (
        <YStack f={1} jc="center" ai="center">
          <Spinner size="large" color="$blue10" />
        </YStack>
      );
    }

    // 모든 준비 완료 → 라우트 렌더링
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
