import type { MissionPreview } from "@/domain/mission/types"; // 경로 수정 필요
import type { CurrentPetStatus, PetStats } from "@/domain/pet/types"; // 경로는 실제 타입 위치에 맞게 조정
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react"; // React import
import { Alert } from "react-native"; // Alert는 react-native에서 계속 사용
import { Paragraph, Spinner, XStack, YStack } from "tamagui"; // Tamagui 컴포넌트 사용
import { MissionPreviewList } from "./components/home/MissionPreviewList";
import { PetInteractionArea } from "./components/home/PetInteractionArea";
import { PetStatusBar } from "./components/home/PetStatusBar";

// 코어 컴포넌트 임포트
import { Button } from "@/View/core/Button/Button"; // 예시, 필요시 사용
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { Settings } from "@tamagui/lucide-icons";

// --- Mock Data & Service ---
// 실제로는 service/application 레이어에서 zustand 스토어 또는 react-query 훅을 통해 가져옵니다.
const MOCK_PET_STATUS: CurrentPetStatus & { stats: PetStats } = {
  id: "my_cat_01",
  name: "집사껌딱지 야옹이",
  level: 3,
  experience: 75,
  experienceToNextLevel: 150,
  imageUrl: "https://placekitten.com/300/300?image=5",
  stats: {
    level: 3,
    experience: 75,
    health: 90,
    happiness: 85,
  },
};

// CurrentMissionProgress는 DailyStepMissionProgress 타입을 사용하므로 유지
// const MOCK_DAILY_STEP_MISSION: DailyStepMissionProgress = {
//   currentSteps: 1250,
//   goalSteps: 6000,
//   rewardCoin: 15,
//   isCompletedToday: false,
// };

// MissionPreviewList를 위한 새로운 목업 데이터
const MOCK_MISSION_PREVIEWS: MissionPreview[] = [
  {
    id: "daily_walk_1",
    title: "오늘의 산책: 5000보 걷기",
    statusText: "진행 중: 1250 / 5000보",
    iconUrl: "https://via.placeholder.com/50/A0E0FF/000000?Text=Walk", // 예시 아이콘
    category: "daily",
    isCompleted: false,
  },
  {
    id: "weekly_total_walk_1",
    title: "주간 목표: 총 35000보 달성하기",
    statusText: "3일 남음",
    iconUrl: "https://via.placeholder.com/50/FFDDA0/000000?Text=Week",
    category: "weekly",
  },
  {
    id: "daily_feed_pet_1",
    title: "애완동물에게 맛있는 간식 주기",
    statusText: "완료!",
    iconUrl: "https://via.placeholder.com/50/D0FFD0/000000?Text=Food",
    category: "daily",
    isCompleted: true,
  },
];

const fetchCurrentPetStatus = async (): Promise<CurrentPetStatus | null> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_PET_STATUS), 300)
  );
};

// fetchDailyStepMissionProgress는 CurrentMissionProgress에서 사용될 수 있으므로 유지 가능
// const fetchDailyStepMissionProgress =
//   async (): Promise<DailyStepMissionProgress | null> => {
//     return new Promise((resolve) =>
//       setTimeout(() => resolve(MOCK_DAILY_STEP_MISSION), 400)
//     );
//   };

// MissionPreviewList를 위한 데이터 fetch 함수 (목업)
const fetchMissionPreviews = async (): Promise<MissionPreview[]> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_MISSION_PREVIEWS), 500)
  );
};

const handlePetInteraction = () => {
  Alert.alert("야옹!", "애완동물이 당신을 바라봅니다.");
  // TODO: 실제 인터랙션 로직 (애니메이션, 사운드 등)
};
// --- End Mock Data & Service ---

/**
 * @description 홈 화면입니다. 애완동물 상태, 현재 미션 진행도, AR 진입 버튼 등을 표시합니다.
 * @returns {JSX.Element} 홈 화면 컴포넌트
 */
export default function HomeScreen() {
  const router = useRouter();
  const [petStatus, setPetStatus] = useState<CurrentPetStatus | null>(
    MOCK_PET_STATUS
  );
  // DailyStepMissionProgress는 CurrentMissionProgress 컴포넌트가 직접 사용할 수 있음
  // const [dailyStepMission, setDailyStepMission] = useState<DailyStepMissionProgress | null>(MOCK_DAILY_STEP_MISSION);
  const [missionPreviews, setMissionPreviews] = useState<MissionPreview[]>(
    MOCK_MISSION_PREVIEWS
  ); // 초기값 빈 배열
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMissions, setIsLoadingMissions] = useState(true); // 미션 목록 로딩 상태

  const loadHomeScreenData = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingMissions(true);
    try {
      // Promise.all로 여러 데이터를 동시에 가져옴
      const [
        fetchedPetStatus,
        fetchedMissionPreviews /*, fetchedDailyStepMission*/,
      ] = await Promise.all([
        fetchCurrentPetStatus(),
        fetchMissionPreviews(),
        // fetchDailyStepMissionProgress(), // 필요하다면 이것도 함께 로드
      ]);

      if (fetchedPetStatus) setPetStatus(fetchedPetStatus);
      setMissionPreviews(fetchedMissionPreviews || []); // null일 경우 빈 배열
      // if (fetchedDailyStepMission) setDailyStepMission(fetchedDailyStepMission);
    } catch (error) {
      console.error("Failed to load home screen data:", error);
      Alert.alert("오류", "홈 화면 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false); // 전체 로딩 완료
      setIsLoadingMissions(false); // 미션 로딩 완료
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeScreenData();
      return () => {
        // 화면을 벗어날 때 정리할 작업 (예: 구독 해제)이 있다면 여기에 작성
      };
    }, [loadHomeScreenData])
  );

  const handleNavigateToAR = () => {
    router.push("/(protected)/ar");
  };

  const handleNavigateToMissions = () => {
    router.push("/(protected)/missions"); // 전체 미션 화면으로
  };

  const handleMissionPreviewPress = (missionId: string) => {
    // TODO: 특정 미션 상세 화면으로 이동하거나, 팝업 표시 등
    console.log("Pressed mission:", missionId);
    Alert.alert("미션 선택됨", `미션 ID: ${missionId} (상세보기 구현 필요)`);
  };

  if (isLoading && !petStatus && missionPreviews.length === 0) {
    // 초기 데이터 로딩 중
    return (
      <ScreenContainer scrollable={false} safeAreaTop={false}>
        <YStack f={1} jc="center" ai="center" space>
          <Spinner size="large" color="$accent1" />
          <Paragraph color="$text2">데이터를 불러오는 중...</Paragraph>
        </YStack>
      </ScreenContainer>
    );
  }

  const petName = petStatus?.name ?? "애완동물";
  const petExpToNextLevel = petStatus?.experienceToNextLevel ?? 1;
  const currentPetStats = petStatus?.stats ?? {
    level: 0,
    experience: 0,
    health: 0,
    happiness: 0,
  };

  return (
    <ScreenContainer scrollable safeAreaTop={false}>
      <YStack space="$md" p="$lg">
        <XStack py={"$xl"} px={0} jc="space-between" ai="center" pb={"$sm"}>
          <Text type="h2">Home</Text>
          <Button
            boc={"$border1"}
            bg={"transparent"}
            color={"$text1"}
            px={"$3"}
            iconAfter={<Settings size={24} color="$text2" />}
            onPress={() => router.push("/(protected)/settings")}
          />
        </XStack>

        <PetInteractionArea
          petStatus={petStatus}
          isLoading={!petStatus && isLoading}
          onPetInteract={handlePetInteraction}
        />

        <PetStatusBar
          name={petName}
          stats={currentPetStats}
          experienceToNextLevel={petExpToNextLevel}
          isLoading={!petStatus && isLoading}
        />

        {/* 기존 CurrentMissionProgress (단일 일일 미션 진행도) 대신 MissionPreviewList 사용 */}
        {/* 또는 두 개 모두 표시할 수도 있음. 여기서는 MissionPreviewList로 대체 또는 추가 */}
        <MissionPreviewList
          title="진행 중인 미션"
          missions={missionPreviews}
          isLoading={isLoadingMissions}
          onViewAllPress={handleNavigateToMissions}
          onMissionPress={handleMissionPreviewPress}
        />

        {/* <CurrentMissionProgress
          missionProgress={{
            currentSteps: 1250,
            goalSteps: 6000,
            rewardCoin: 15,
            isCompletedToday: true,
          }} // 이 상태를 관리해야 함
          isLoading={isLoading}
        /> */}

        <YStack gap="$xs" bg={"$accent5"} p="$md" borderRadius="$md">
          <Text type="bodyLarge">오늘의 팁!</Text>
          <Text type="bodySmall" colorVariant="secondary">
            꾸준한 걸음으로 애완동물과 함께 건강해지세요!
          </Text>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
