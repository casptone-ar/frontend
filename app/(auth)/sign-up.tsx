import { Lock, Mail, User } from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { YStack } from "tamagui";
import { useStore } from "zustand";

// 코어 컴포넌트
import { Button } from "@/View/core/Button/Button";
import { Header } from "@/View/core/Header/Header";
import { Input } from "@/View/core/Input/Input";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";

// zustand auth store
import { authStore } from "@/View/store/authStore";
import { ENV } from "@/View/config/env";

export default function SignUpScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useStore(authStore);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    const ok = await register(email.trim(), password, fullName.trim());
    if (ok) {
      if (ENV.SIGNUP_RETURNS_TOKEN) {
        router.replace("/(onboarding)/select-pet");
      } else {
        router.replace("/(auth)/sign-in"); // ✅ 토큰 없으니 로그인으로
      }
    }
  };

  return (
    <ScreenContainer scrollable>
      <Header title="Sign up" leftAction />

      <YStack space="$5" p="$lg" flex={1}>
        <YStack space="$1" mb="$md" mt="$xxl">
          <Text type="h3">Hello! Welcome 👋</Text>
        </YStack>

        <YStack space="$4">
          <Input
            label="Full name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={<User color="$text3" size={20} />}
          />
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

        <YStack space="$3" mt="$lg">
          <Button
            variant="primary"
            size="lg"
            onPress={handleSignUp}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            Sign Up
          </Button>
        </YStack>

        <YStack ai="center" space="$xs" mt="$md">
          <Text type="caption" colorVariant="secondary" textAlign="center">
            By clicking Sign Up, you agree to the
          </Text>
          <YStack flexDirection="row" jc="center" space="$xs">
            <Link href="/terms-of-service" asChild>
              <Text type="caption" colorVariant="accent" fontWeight="$semibold">
                Terms of Services
              </Text>
            </Link>
            <Text type="caption" colorVariant="secondary">
              and
            </Text>
            <Link href="/privacy-policy" asChild>
              <Text type="caption" colorVariant="accent" fontWeight="$semibold">
                Privacy Policy
              </Text>
            </Link>
          </YStack>
        </YStack>

        <YStack flexDirection="row" jc="center" mt="$xl" space="$xs">
          <Text type="bodySmall" colorVariant="secondary">
            Already a member?
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Text type="bodySmall" colorVariant="accent" fontWeight="$semibold">
              Sign In
            </Text>
          </Link>
        </YStack>

        {/* 에러 메시지 표시 */}
        {!!error && (
          <YStack mt="$sm" ai="center">
            <Text type="caption" colorVariant="error">
              {error}
            </Text>
          </YStack>
        )}
      </YStack>
    </ScreenContainer>
  );
}
