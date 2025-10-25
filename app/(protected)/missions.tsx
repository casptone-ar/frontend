// app/(protected)/missions.tsx

import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { SegmentedTabs } from "@/View/core/SegmentedTabs";
import { Text } from "@/View/core/Text/Text";
import type {
  BaseMission,
  Mission,
  MissionFilter,
  MissionStatus,
} from "@/domain/mission/types";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { XStack } from "tamagui";
import { MissionList } from "./components/missions/MissionList";
import { useRouter } from "expo-router";

// --- Mock Data & Service ---
// 목록 렌더링은 BaseMission 기반(MOCK_ALL_MISSIONS)
// 일/주간 상세/별도 사용은 Mission 기반(MOCK_DAILY/ WEEKLY)

const MOCK_DAILY_MISSIONS: Mission[] = [
  {
    id: "d001",
    type: "daily",
    title: "5000보 걷기",
    description: "오늘 하루 활기차게 걸어보세요!",
    goal: 5000,
    currentProgress: 2500,
    unit: "보",
    rewardCoin: 10,
    status: "in-progress",
    rewards: [{ type: "coin", amount: 10 }],
    targetValue: 5000,
    currentValue: 2500,
    iconUrl: "https://via.placeholder.com/50/A0E0FF/000000?Text=DD1",
  },
  {
    id: "d002",
    type: "daily",
    title: "애완동물과 3번 놀아주기",
    description: "애완동물과의 유대감을 높여요.",
    goal: 3,
    currentProgress: 1,
    unit: "회",
    rewardCoin: 5,
    status: "in-progress",
    rewards: [{ type: "coin", amount: 5 }],
    targetValue: 3,
    currentValue: 1,
    iconUrl: "https://via.placeholder.com/50/A0FFFF/000000?Text=DD2",
  },
  {
    id: "d003",
    type: "daily",
    title: "상점 방문하기",
    description: "새로운 아이템이 있는지 확인해보세요.",
    goal: 1,
    currentProgress: 0,
    unit: "회",
    rewardCoin: 2,
    status: "pending",
    rewards: [{ type: "coin", amount: 2 }],
    targetValue: 1,
    currentValue: 0,
    iconUrl: "https://via.placeholder.com/50/D0FFD0/000000?Text=DD3",
  },
];

const MOCK_WEEKLY_MISSIONS: Mission[] = [
  {
    id: "w001",
    type: "weekly",
    title: "일주일 동안 35000보 걷기",
    description: "이번 주 꾸준히 건강을 챙겨요.",
    goal: 35000,
    currentProgress: 12000,
    unit: "보",
    rewardCoin: 50,
    status: "in-progress",
    rewards: [{ type: "coin", amount: 50 }],
    targetValue: 35000,
    currentValue: 12000,
    iconUrl: "https://via.placeholder.com/50/D0A0FF/000000?Text=WW1",
  },
  {
    id: "w002",
    type: "weekly",
    title: "일일 미션 5회 완료하기",
    description: "매일의 작은 성공이 큰 보상으로!",
    goal: 5,
    currentProgress: 2,
    unit: "회",
    rewardCoin: 30,
    status: "in-progress",
    rewards: [{ type: "coin", amount: 30 }],
    targetValue: 5,
    currentValue: 2,
    iconUrl: "https://via.placeholder.com/50/FFD0A0/000000?Text=WW2",
  },
];

const MOCK_ALL_MISSIONS: BaseMission[] = [
  {
    id: "d1",
    title: "일일 미션 1: 아침 조깅하기",
    description: "공원에서 30분 이상 조깅하세요.",
    type: "daily",
    status: "pending",
    rewards: [{ type: "coin", amount: 10 }],
    targetValue: 1,
    currentValue: 0,
    iconUrl: "https://via.placeholder.com/50/A0E0FF/000000?Text=D1",
  },
  {
    id: "d2",
    title: "일일 미션 2: 물 2L 마시기",
    description: "건강을 위해 충분한 수분을 섭취하세요.",
    type: "daily",
    status: "in-progress",
    rewards: [{ type: "experience", amount: 50 }],
    targetValue: 2000,
    currentValue: 1200,
    iconUrl: "https://via.placeholder.com/50/A0FFFF/000000?Text=D2",
  },
  {
    id: "w1",
    title: "주간 미션 1: 친구와 함께 운동 3회",
    description: "친구와 함께 즐겁게 운동하고 건강도 챙기세요.",
    type: "weekly",
    status: "completed",
    rewards: [
      { type: "coin", amount: 50 },
      { type: "experience", amount: 100 },
    ],
    targetValue: 3,
    currentValue: 3,
    iconUrl: "https://via.placeholder.com/50/D0A0FF/000000?Text=W1",
  },
  {
    id: "d3",
    title: "일일 미션 3: 건강한 식단 기록",
    description: "오늘 먹은 건강한 식단을 사진으로 기록하세요.",
    type: "daily",
    status: "completed",
    rewards: [{ type: "coin", amount: 5 }],
    targetValue: 1,
    currentValue: 1,
    iconUrl: "https://via.placeholder.com/50/D0FFD0/000000?Text=D3",
  },
  {
    id: "w2",
    title: "주간 미션 2: 새로운 장소 탐험하기",
    description: "이번 주에 한 번도 가보지 않은 새로운 장소를 방문해보세요.",
    type: "weekly",
    status: "failed",
    rewards: [{ type: "experience", amount: 200 }],
    iconUrl: "https://via.placeholder.com/50/FFD0A0/000000?Text=W2",
  },
];

const fetchMissions = async (filter: MissionFilter): Promise<BaseMission[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (filter === "all") {
        resolve(MOCK_ALL_MISSIONS);
      } else if (filter === "daily") {
        resolve(MOCK_ALL_MISSIONS.filter((m) => m.type === "daily"));
      } else if (filter === "weekly") {
        resolve(MOCK_ALL_MISSIONS.filter((m) => m.type === "weekly"));
      } else if (filter === "completed") {
        resolve(MOCK_ALL_MISSIONS.filter((m) => m.status === "completed"));
      } else {
        resolve([]);
      }
    }, 300);
  });
};

// BaseMission 기준의 간단 목 API
const claimMissionRewardAPI = async (
  missionId: string
): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      // 여기서는 'completed' 상태면 수령 가능으로 가정
      const m = MOCK_ALL_MISSIONS.find((x) => x.id === missionId);
      if (m && m.status === "completed") {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: "보상을 수령할 수 없는 미션입니다." });
      }
    }, 600)
  );
};
// --- End Mock Data & Service ---

const TABS: { label: string; value: MissionFilter }[] = [
  { label: "전체", value: "all" },
  { label: "일일 미션", value: "daily" },
  { label: "주간 미션", value: "weekly" },
  { label: "완료된 미션", value: "completed" },
];

export default function MissionsScreen() {
  const router = useRouter();
  const [currentFilter, setCurrentFilter] = useState<MissionFilter>("all");
  const [missions, setMissions] = useState<BaseMission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMissions = useCallback(async (filter: MissionFilter) => {
    setIsLoading(true);
    try {
      const fetchedMissions = await fetchMissions(filter);
      setMissions(fetchedMissions);
    } catch (error) {
      console.error("Failed to load missions:", error);
      Alert.alert("오류", "미션 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFilterChange = (value: string) => {
    const newFilter = value as MissionFilter;
    setCurrentFilter(newFilter);
    loadMissions(newFilter);
  };

  const handleMissionAction = async (
    missionId: string,
    action?: "claim" | "details"
  ) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    if (action === "claim") {
      // 스펙상 'completed' 상태에서 수령 가능으로 가정
      if (mission.status !== "completed") {
        Alert.alert("보상 수령 불가", "아직 보상을 수령할 수 없는 상태입니다.");
        return;
      }

      const snapshot = missions.map((m) => ({ ...m }));
      try {
        const res = await claimMissionRewardAPI(missionId);
        if (!res.success) {
          setMissions(snapshot);
          Alert.alert(
            "보상 수령 실패",
            res.error ?? "알 수 없는 오류가 발생했습니다."
          );
          return;
        }
        Alert.alert(
          "보상 수령 완료",
          `${mission.title} 미션의 보상을 수령했습니다.`
        );
      } catch {
        setMissions(snapshot);
        Alert.alert(
          "보상 수령 실패",
          "네트워크 오류가 발생했습니다. 다시 시도해 주세요."
        );
      }
    } else {
      // 상세 화면으로 이동 (라우트 준비 필요)
      router.push(`/(protected)/missions/${missionId}`);
    }
  };

  useEffect(() => {
    loadMissions(currentFilter);
  }, [currentFilter, loadMissions]);

  return (
    <ScreenContainer scrollable padded="horizontal">
      <XStack p="$lg" jc="space-between" ai="center" pb="$md">
        <Text type="h2">미션 목록</Text>
      </XStack>

      <SegmentedTabs
        tabs={TABS}
        currentTab={currentFilter}
        onTabChange={handleFilterChange}
      />

      <MissionList
        missions={missions}
        isLoading={isLoading}
        onMissionAction={handleMissionAction}
        emptyListText={
          currentFilter === "completed"
            ? "완료한 미션이 아직 없어요!"
            : "해당 조건의 미션이 없습니다."
        }
      />
    </ScreenContainer>
  );
}
