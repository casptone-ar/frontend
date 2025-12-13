import { Stack } from "expo-router";

/**
 * 미션 관련 화면들의 네비게이션 스택 레이아웃입니다.
 * - 미션 메인(목록)
 * - 진행중 미션 전용
 * - 미션 상세
 */
export default function MissionsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="in-progress" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
