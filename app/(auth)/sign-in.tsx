// app/(auth)/sign-in.tsx
import { Lock, Mail } from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Pressable } from "react-native";
import { YStack } from "tamagui";
import { useStore } from "zustand";

// Apple
import * as AppleAuthentication from "expo-apple-authentication";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API } from "@/service/lib/Http/adapter";

import { Button } from "@/View/core/Button/Button";
import { Input } from "@/View/core/Input/Input";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { authStore } from "@/View/store/authStore";

export default function SignInScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useStore(authStore);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ---- Apple 로그인 사용 가능 여부 확인 ----
  const [appleAvailable, setAppleAvailable] = useState(false);
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  // ---- 이메일/비밀번호 로그인 ----
  const handleSignIn = async () => {
    try {
      const ok = await login(email, password);
      if (!ok) {
        console.warn("로그인 실패:", error);
      }
    } catch (e) {
      console.error("로그인 중 에러:", e);
    }
  };

  // ---- Apple 로그인 ----
  const handleAppleSignIn = async () => {
    try {
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log("[APPLE] user:", cred.user);
      console.log("[APPLE] identityToken length:", cred.identityToken?.length);

      // 서버 준비 후:
      // const { accessToken } = await API.post("/auth/apple", {
      //   identityToken: cred.identityToken,
      //   user: cred.user,
      // });
      // await AsyncStorage.setItem("token", accessToken);
      router.replace("/(protected)/home");
    } catch (e: any) {
      if (e?.code === "ERR_REQUEST_CANCELED") return;
      console.error("Apple 로그인 실패:", e);
    }
  };

  return (
    <ScreenContainer scrollable={false} safeAreaBottom={true}>
      <YStack gap="$2" flex={1} jc="center">
        {/* 로고 & 소개 */}
        <YStack space="$2" ai="center" jc="center" mb="$xl" flex={1}>
          <Text type="h1" colorVariant="accent">
            NeoPets
          </Text>
          <Text type="h3" colorVariant="secondary" textAlign="center">
            AR 기반 펫 시뮬레이터
          </Text>
        </YStack>

        {/* 로그인 버튼 영역 */}
        <YStack
          space="$3"
          mt="$lg"
          flex={1}
          jc="flex-end"
          paddingHorizontal={"$5"}
        >
          {/* iOS: Apple 로그인 버튼 */}
          {Platform.OS === "ios" && appleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE
              }
              cornerRadius={24}
              style={{ width: "100%", height: 64, marginTop: 8 }}
              onPress={handleAppleSignIn}
            />
          )}
        </YStack>

        {/* 비밀번호 재설정 링크 */}
        <YStack jc="center" mt="$md" ai="center">
          <Text type="caption">Forgot your password? </Text>
          <Link href="/(auth)/forgot-password" asChild>
            <Text
              type="caption"
              colorVariant="accent"
              fontWeight="$semibold"
              mt={"$2"}
            >
              Reset here
            </Text>
          </Link>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
