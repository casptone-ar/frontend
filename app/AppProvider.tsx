import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useStore } from "zustand";

import { authStore } from "@/View/store/authStore";
import { petStore } from "@/View/store/petStore";

import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { YStack } from "tamagui";
import { Text } from "@/View/core/Text/Text";
import { API } from "@/service/lib/Http/adapter"; // ✅ 추가: API 어댑터

/**
 * 앱 전역 Provider + 네비게이션 가드
 * - 토큰/유저/펫 상태를 보고 초기 진입 라우트를 결정
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
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
    console.log("API BASE URL =", process.env.EXPO_PUBLIC_API_BASE_URL); // (선택) 확인용
    API.get("/api-docs")
      .then(() => console.log("✅ 서버 연결 성공"))
      .catch((e) => console.error("❌ 서버 연결 실패", e));
  }, []);

  // 1) 앱 부팅: 토큰 복구 + getMe
  useEffect(() => {
    (async () => {
      await bootstrap(); // accessToken/refreshToken 복구 + /me 시도
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

    // 토큰/유저가 없으면 → 로그인
    if (!accessToken || !user) return "/(auth)/sign-in";

    // 유저는 있으나 활성 펫이 없으면 → 온보딩(펫 선택)
    if (!activePet) return "/(onboarding)/select-pet";

    // 둘 다 있으면 → 홈
    return "/(protected)/home";
  }, [bootstrapped, accessToken, user, activePet]);

  // 4) 준비 중이면 로딩 화면
  const stillLoading =
    !bootstrapped || authLoading || (user ? petLoading && !activePet : false);

  useEffect(() => {
    if (!stillLoading && targetRoute) {
      router.replace(targetRoute);
    }
  }, [stillLoading, targetRoute, router]);

  if (stillLoading) {
    return (
      <ScreenContainer padded scrollable>
        <YStack f={1} jc="center" ai="center" space="$2">
          <Text type="h3">준비 중…</Text>
          <Text type="bodySmall" colorVariant="secondary">
            계정을 확인하고 초기 데이터를 불러오고 있어요.
          </Text>
        </YStack>
      </ScreenContainer>
    );
  }

  return <>{children}</>;
}
