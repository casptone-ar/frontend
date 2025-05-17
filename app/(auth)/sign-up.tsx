import { Lock, Mail, User } from "@tamagui/lucide-icons"; // 아이콘 예시
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { YStack } from "tamagui";

// 코어 컴포넌트 임포트
import { Button } from "@/View/core/Button/Button";
import { Header } from "@/View/core/Header/Header"; // 회원가입 화면에는 헤더 사용
import { Input } from "@/View/core/Input/Input";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";

/**
 * 회원가입 화면입니다.
 */
export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = () => {
    setIsLoading(true);
    // TODO: 실제 회원가입 로직 구현 (application hook 또는 service 호출)
    console.log("Sign Up:", { fullName, email, password });
    setTimeout(() => {
      setIsLoading(false);
      // 예시: 회원가입 성공 시 온보딩 또는 로그인 화면으로 이동
      router.replace("/(onboarding)/select-pet");
    }, 1500);
  };

  return (
    <ScreenContainer scrollable>
      <Header title="Sign up" leftAction />
      {/* leftAction을 true로 하면 기본 뒤로가기 버튼 표시 */}

      <YStack space="$5" p="$lg" flex={1}>
        {/* flex={1}을 주어 헤더 제외한 나머지 공간 차지 */}
        <YStack space="$1" mb="$md" mt={"$xxl"}>
          <Text type="h3">Hello! Welcome Back 👋</Text>
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
            size={"md"}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail color="$text3" />}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            secureTextEntryToggle
            leftIcon={<Lock color="$text3" size={20} />}
            errorMessage="Invalid email address"
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
      </YStack>
    </ScreenContainer>
  );
}
