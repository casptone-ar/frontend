import type { PetAscensionResult } from "@/domain/pet/types"; // Pet 도메인에 추가했다고 가정
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { H1, Paragraph, Separator, Spinner, YStack } from "tamagui";
import { AscensionSummary } from "./components/ascension/AscensionSummary";
import { NextStepButtons } from "./components/ascension/NextStepButtons";

// --- Mock Data & Service ---
// 실제로는 이전 화면(예: 펫 상태 화면에서 승천 버튼 클릭)에서 API 호출 후
// 그 결과(PetAscensionResult)를 네비게이션 파라미터로 받아옵니다.
// 여기서는 useLocalSearchParams를 통해 직접 값을 받는 것으로 모킹합니다.

const fetchAscensionDetailsFromParams = (
  params: Record<string, string | string[] | undefined> // params의 값은 undefined일 수 있음
): PetAscensionResult | null => {
  // 예시: router.push({ pathname: '/ascension-complete', params: { petName: '댕댕이', bonusCoins: '100' }})
  const petName = params.petName?.toString();
  const bonusCoinsStr = params.bonusCoins?.toString();

  if (petName && bonusCoinsStr) {
    const bonusCoins = Number.parseInt(bonusCoinsStr, 10);
    if (!Number.isNaN(bonusCoins)) {
      return {
        ascendedPetName: petName,
        bonusCoinsAwarded: bonusCoins,
        message: `${petName}이(가) 성공적으로 승천했습니다! 새로운 모험을 시작하세요.`,
      };
    }
  }
  // For testing if params are not passed, provide a default mock
  // console.warn("Ascension details not found in params, using default mock.");
  // return {
  //   ascendedPetName: "테스트 펫",
  //   bonusCoinsAwarded: 100,
  //   message: "테스트 펫이 성공적으로 승천했습니다! (모의 데이터)",
  // };
  return null; // 파라미터가 없거나 유효하지 않으면 null 반환
};
// --- End Mock Data & Service ---

/**
 * 애완동물 승천 완료 후 보여지는 화면입니다.
 * 승천한 애완동물의 이름, 획득한 보상 등을 요약하여 보여주고,
 * 사용자에게 다음 행동(홈 화면으로 돌아가기 또는 새 애완동물 선택하기)을 선택하도록 안내합니다.
 */
export default function AscensionCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // 네비게이션으로 전달된 파라미터

  const [ascensionResult, setAscensionResult] =
    useState<PetAscensionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 파라미터에서 승천 결과 데이터를 파싱하여 상태에 설정합니다.
    // 실제 앱에서는 이전 화면에서 API 호출 후 성공 시 이 화면으로 네비게이트하며 결과 전달.
    setIsLoading(true);
    const result = fetchAscensionDetailsFromParams(params);
    if (result) {
      setAscensionResult(result);
    } else {
      // 필수 파라미터가 없는 경우 오류 처리 또는 홈으로 리다이렉트
      Alert.alert(
        "오류",
        "승천 정보를 제대로 받아오지 못했습니다. 홈 화면으로 이동합니다.",
        [{ text: "확인", onPress: () => router.replace("/home") }]
      );
      // router.replace('/home'); // 또는 다른 적절한 처리
    }
    setIsLoading(false);
  }, [params, router]);

  const handleGoHome = () => {
    router.replace("/home"); // 홈 화면으로 돌아가고, 뒤로가기 스택에서 현재 화면 제거
  };

  const handleSelectNewPet = () => {
    router.replace("/(onboarding)/select-pet"); // 새 애완동물 선택 화면으로 이동
  };

  if (isLoading || !ascensionResult) {
    return (
      <YStack f={1} jc="center" ai="center" space="$2">
        <Spinner />
        <Paragraph>승천 결과 확인 중...</Paragraph>
      </YStack>
    );
  }

  return (
    <YStack f={1} p="$4" space="$4" jc="center" ai="center">
      <YStack ai="center" space="$2">
        <H1>🎉 승천 완료! 🎉</H1>
        <Paragraph size="$5" ta="center">
          {ascensionResult.message ||
            `${ascensionResult.ascendedPetName}이(가) 성공적으로 승천했습니다!`}
        </Paragraph>
      </YStack>

      <Separator />

      <AscensionSummary result={ascensionResult} />

      <Separator />

      <NextStepButtons
        onGoHome={handleGoHome}
        onSelectNewPet={handleSelectNewPet}
      />
    </YStack>
  );
}
