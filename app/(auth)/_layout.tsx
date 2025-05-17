import { Stack } from "expo-router";

/**
 * 인증 관련 화면(로그인, 회원가입 등)을 위한 레이아웃입니다.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
