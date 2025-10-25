// app/(auth)/sign-in.tsx
import { Lock, Mail } from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Pressable } from "react-native";
import { YStack } from "tamagui";
import { useStore } from "zustand";

// Apple
import * as AppleAuthentication from "expo-apple-authentication";

// Google (expo-auth-session)
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API } from "@/service/lib/Http/adapter";

import { Button } from "@/View/core/Button/Button";
import { Input } from "@/View/core/Input/Input";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { authStore } from "@/View/store/authStore";

// ✅ iOS Safari 인증 세션 자동 닫기
WebBrowser.maybeCompleteAuthSession();

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

  // ---- Google OAuth 설정 ----
  const IOS_CLIENT_ID = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com";
  const ANDROID_CLIENT_ID = "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com";
  const WEB_CLIENT_ID = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";

  // ✅ 프록시 설정은 redirectUri에서 처리
  const redirectUri = makeRedirectUri({
    scheme: "neopets",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    responseType: "code", // 또는 "id_token" (백엔드 전략에 맞게)
    scopes: ["profile", "email"],
    //redirectUri, // 명시적 지정
  });

  // ---- Google 로그인 결과 처리 ----
  useEffect(() => {
    (async () => {
      if (!response) return;
      if (response.type === "success") {
        const { authentication, params } = response;

        const authCode = params.code;
        console.log("[GOOGLE] authCode:", authCode);
        console.log("[GOOGLE] accessToken:", authentication?.accessToken);

        // 서버 연동 예시 (준비 후 활성화)
        // const { accessToken } = await API.post("/auth/google", { code: authCode, redirectUri });
        // await AsyncStorage.setItem("token", accessToken);
        // router.replace("/(protected)/home");
      }
    })();
  }, [response]);

  // ---- Google 로그인 트리거 ----
  const handleGoogleSignIn = async () => {
    try {
      const result = await promptAsync();
      if (result.type === "dismiss" || result.type === "cancel") {
        return;
      }
    } catch (e) {
      console.error("Google 로그인 실패:", e);
    }
  };

  // ---- 이메일/비밀번호 로그인 ----
  const handleSignIn = async () => {
    try {
      const ok = await login(email, password);
      if (ok) router.replace("/(protected)/home");
      else console.warn("로그인 실패:", error);
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
      // router.replace("/(protected)/home");
    } catch (e: any) {
      if (e?.code === "ERR_REQUEST_CANCELED") return;
      console.error("Apple 로그인 실패:", e);
    }
  };

  return (
    <ScreenContainer
      scrollable
      padded
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <YStack space="$6" flex={1} jc="center">
        {/* 로고 & 소개 */}
        <YStack space="$2" ai="center" mb="$xl">
          <Text type="h1" colorVariant="accent">
            NeoPets
          </Text>
          <Text type="h3" colorVariant="secondary" textAlign="center">
            펫과 함께하는 새로운 일상
          </Text>
        </YStack>

        {/* 이메일/비밀번호 입력 */}
        <YStack space="$4">
          <Input
            label="Email address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail color="$text3" size={20} />}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            secureTextEntryToggle
            leftIcon={<Lock color="$text3" size={20} />}
          />
        </YStack>

        {/* 로그인 버튼 영역 */}
        <YStack space="$3" mt="$lg">
          <Button
            variant="primary"
            size="lg"
            onPress={handleSignIn}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            Log In
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onPress={() => router.push("/(auth)/sign-up")}
            disabled={isLoading}
            fullWidth
          >
            Sign Up
          </Button>

          {/* iOS: Apple 로그인 버튼 */}
          {Platform.OS === "ios" && appleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={8}
              style={{ width: "100%", height: 44, marginTop: 8 }}
              onPress={handleAppleSignIn}
            />
          )}

          {/* 공통: Google 로그인 버튼 */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={!request || isLoading}
            style={{
              marginTop: 8,
              height: 44,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#e0e0e0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text type="bodySmall">Continue with Google</Text>
          </Pressable>
        </YStack>

        {/* 비밀번호 재설정 링크 */}
        <YStack jc="center" mt="$md">
          <Text type="caption">Forgot your password? </Text>
          <Link href="/(auth)/forgot-password" asChild>
            <Text type="caption" colorVariant="accent" fontWeight="$semibold">
              Reset here
            </Text>
          </Link>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
