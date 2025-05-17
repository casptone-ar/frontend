import { Lock, Mail } from "@tamagui/lucide-icons"; // 아이콘 예시
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { YStack } from "tamagui";

// 코어 컴포넌트 임포트
import { Button } from "@/View/core/Button/Button";
import { Input } from "@/View/core/Input/Input";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
// import { Header } from '@/View/core/Header/Header'; // 로그인 화면에는 헤더가 없을 수 있음

/**
 * 로그인 화면입니다.
 */
export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    setIsLoading(true);
    // TODO: 실제 로그인 로직 구현 (application hook 또는 service 호출)
    console.log("Sign In:", { email, password });
    setTimeout(() => {
      setIsLoading(false);
      // 예시: 로그인 성공 시 홈으로 이동
      router.replace("/(protected)/home");
    }, 1500);
  };

  return (
    <ScreenContainer
      scrollable // 내용이 길어질 경우 스크롤 가능하도록
      padded // 전체 화면에 패딩 적용
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} // 컨텐츠 중앙 정렬 (scrollable 시)
    >
      {/* <Header title="로그인" /> // 필요시 헤더 추가 */}
      <YStack space="$6" flex={1} jc="center">
        <YStack space="$2" ai="center" mb="$xl">
          {/* 로고 이미지 또는 앱 이름 */}
          {/* <Image source={require('@/assets/images/logo.png')} width={100} height={100} /> */}
          <Text type="h1" colorVariant="accent">
            NeoPets
          </Text>
          <Text type="h3" colorVariant="secondary" textAlign="center">
            펫과 함께하는 새로운 일상
          </Text>
        </YStack>

        <YStack space="$4">
          <Input
            label="Email address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail color="$text3" size={20} />} // 아이콘 크기 및 색상 조정
            // size="lg" // 필요시 Input 크기 조정
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            secureTextEntryToggle // 비밀번호 보이기/숨기기 토글 추가
            leftIcon={<Lock color="$text3" size={20} />}
            // size="lg"
          />
        </YStack>

        <YStack space="$3" mt="$lg">
          <Button
            variant="primary"
            size="lg" // 버튼 크기를 크게
            onPress={handleSignIn}
            loading={isLoading}
            disabled={isLoading}
            fullWidth // 버튼 너비 100%
          >
            Log In
          </Button>
          <Button
            variant="secondary" // 또는 "outline", "ghost"
            size="lg"
            onPress={() => router.push("/(auth)/sign-up")}
            disabled={isLoading}
            fullWidth
          >
            Sign Up
          </Button>
        </YStack>

        {/* "Already a member? Sign In" 스타일의 링크 (SignUp 화면용) */}
        {/* SignIn 화면에서는 "Forgot Password?" 등이 더 적절할 수 있음 */}
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
