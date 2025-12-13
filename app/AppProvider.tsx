// app/AppProvider.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useStore } from "zustand";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { authStore } from "@/View/store/authStore";
import { petStore } from "@/View/store/petStore";

import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { YStack } from "tamagui";
import { Text } from "@/View/core/Text/Text";
import { API } from "@/service/lib/Http/adapter";

type AppProviderProps = {
  children: React.ReactNode;
  appReady?: boolean;
};

// ✅ 전역 QueryClient 인스턴스 (앱 전체에서 하나만 사용)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProvider({ children }: AppProviderProps) {
  const router = useRouter();

  // auth
  const {
    user,
    accessToken,
    isLoading: authLoading,
    bootstrap,
  } = useStore(authStore);

  // pet
  const {
    activePet,
    isLoading: petLoading,
    fetchActivePet,
  } = useStore(petStore);

  const [bootstrapped, setBootstrapped] = useState(false);

  // ✅ 앱 최초 마운트 시 API 연결 테스트 (한 번만)
  useEffect(() => {
    console.log("API BASE URL =", process.env.EXPO_PUBLIC_API_BASE_URL);
    API.get("/api-docs")
      .then(() => console.log("✅ 서버 연결 성공"))
      .catch((e) => console.error("❌ 서버 연결 실패", e));
  }, []);

  // 1) 앱 부팅: 토큰 복구 + getMe
  useEffect(() => {
    (async () => {
      await bootstrap();
      setBootstrapped(true);
    })();
  }, [bootstrap]);

  // 2) 유저가 있으면 활성 펫 조회
  useEffect(() => {
    if (bootstrapped && user) {
      fetchActivePet().catch(() => {});
    }
  }, [bootstrapped, user, fetchActivePet]);

  // 3) 라우팅 타겟 결정
  const targetRoute = useMemo(() => {
    if (!bootstrapped) return null;

    if (!accessToken || !user) return "/(auth)/sign-in";
    if (!activePet) return "/(onboarding)/select-pet";

    return "/(protected)/home";
  }, [bootstrapped, accessToken, user, activePet]);

  // 4) 준비 중이면 로딩 상태
  const stillLoading =
    !bootstrapped || authLoading || (user ? petLoading && !activePet : false);

  // 5) 준비되면 네비게이션
  useEffect(() => {
    if (!stillLoading && targetRoute) {
      const id = setTimeout(() => {
        router.replace(targetRoute);
      }, 0);
      return () => clearTimeout(id);
    }
  }, [stillLoading, targetRoute, router]);

  return (
    <QueryClientProvider client={queryClient}>
      {stillLoading ? (
        <ScreenContainer padded scrollable>
          <YStack f={1} jc="center" ai="center" space="$2">
            <Text type="h3">준비 중…</Text>
            <Text type="bodySmall" colorVariant="secondary">
              계정을 확인하고 초기 데이터를 불러오고 있어요.
            </Text>
          </YStack>
        </ScreenContainer>
      ) : (
        <>{children}</>
      )}
    </QueryClientProvider>
  );
}

export default AppProvider;
