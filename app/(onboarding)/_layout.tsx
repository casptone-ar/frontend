import { Stack } from "expo-router";

/**
 * 온보딩 프로세스(예: 애완동물 선택)를 위한 레이아웃입니다.
 */
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="select-pet" />
      {/* 추가 온보딩 단계가 있다면 여기에 정의 */}
    </Stack>
  );
}
