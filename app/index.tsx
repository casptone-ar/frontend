/**
 * 루트 인덱스 페이지
 *
 * 이 페이지는 보호된 라우트로 리다이렉트합니다.
 */

import { Redirect, useRootNavigationState } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native"; // 또는 Tamagui 컴포넌트 사용

// TODO: 실제 인증 상태를 확인하는 로직으로 교체해야 합니다.
// 예를 들어, service/lib/Auth/store.ts 에서 인증 상태를 가져옵니다.
const useAuth = () => {
  // 임시 인증 상태 훅
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    // 여기서 실제 인증 상태 및 온보딩 완료 여부를 비동기적으로 확인합니다.
    // 예시: const authStore = useAuthStore(); setIsAuthenticated(authStore.isLoggedIn);
    // 예시: const userStore = useUserStore(); setHasCompletedOnboarding(userStore.profile.hasCompletedOnboarding);
    setTimeout(() => {
      setIsAuthenticated(false); // 테스트용: false로 설정하여 로그인 화면으로 유도
      setHasCompletedOnboarding(false); // 테스트용: false로 설정
    }, 1000);
  }, []);

  return {
    isAuthenticated,
    hasCompletedOnboarding,
    isLoading: isAuthenticated === null || hasCompletedOnboarding === null,
  };
};

/**
 * 앱의 초기 진입점입니다.
 * 인증 상태 및 온보딩 완료 여부에 따라 적절한 화면으로 리다이렉션합니다.
 */
export default function AppRoot() {
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useAuth();
  const navigationState = useRootNavigationState();

  if (isLoading || !navigationState?.key) {
    // TODO: 스플래시 스크린 또는 로딩 인디케이터 표시
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    if (hasCompletedOnboarding) {
      return <Redirect href="/(protected)/home" />;
    }
    return <Redirect href="/(onboarding)/select-pet" />;
  }
  return <Redirect href="/(auth)/sign-in" />;
}
