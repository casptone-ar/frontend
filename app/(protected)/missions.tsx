import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { SegmentedTabs } from "@/View/core/SegmentedTabs";
import { Text } from "@/View/core/Text/Text";
import type {
  BaseMission,
  Mission,
  MissionFilter,
  MissionStatus,
} from "@/domain/mission/types";
import { useCallback, useEffect, useState } from "react"; // React import
import { Alert } from "react-native";
import { XStack } from "tamagui";
import { MissionList } from "./components/missions/MissionList";

// --- Mock Data & Service ---
// 실제로는 service/application 레이어에서 zustand 스토어 또는 react-query 훅을 통해 가져옵니다.
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
    status: "in_progress",
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
    status: "in_progress",
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
    status: "incomplete",
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
    status: "in_progress",
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
    status: "in_progress",
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

const claimMissionRewardAPI = async (
  missionId: string
): Promise<{ success: boolean; updatedMission?: Mission; error?: string }> => {
  console.log(`Claiming reward for mission: ${missionId}`);
  return new Promise((resolve) =>
    setTimeout(() => {
      // 모킹: 해당 미션 상태를 'completed'로 변경하고 반환
      const allMissions = [...MOCK_DAILY_MISSIONS, ...MOCK_WEEKLY_MISSIONS];
      const missionToUpdate = allMissions.find((m) => m.id === missionId);
      if (missionToUpdate && missionToUpdate.status === "achieved") {
        const updated = {
          ...missionToUpdate,
          status: "completed" as MissionStatus,
        };
        // 실제라면 MOCK_DAILY_MISSIONS 또는 MOCK_WEEKLY_MISSIONS 배열도 업데이트
        resolve({ success: true, updatedMission: updated });
      } else {
        resolve({ success: false, error: "보상을 수령할 수 없는 미션입니다." });
      }
    }, 700)
  );
};
// --- End Mock Data & Service ---

const TABS: { label: string; value: MissionFilter }[] = [
  { label: "전체", value: "all" },
  { label: "일일 미션", value: "daily" },
  { label: "주간 미션", value: "weekly" },
  { label: "완료된 미션", value: "completed" },
];

/**
 * 미션 목록 화면입니다.
 * 사용자는 일일 미션과 주간 미션을 탭으로 전환하여 볼 수 있으며,
 * 각 미션의 진행 상황을 확인하고 완료된 미션의 보상을 수령할 수 있습니다.
 */
export default function MissionsScreen() {
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

  const handleMissionAction = (
    missionId: string,
    action?: "claim" | "details"
  ) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    if (action === "claim") {
      Alert.alert(
        "보상 수령!",
        `${mission.title} 미션의 보상을 수령합니다. (구현 필요)`
      );
      // TODO: 실제 보상 수령 로직 호출 및 상태 업데이트
      // 예: MOCK_ALL_MISSIONS에서 해당 미션 상태 변경 후 loadMissions(currentFilter) 재호출
    } else {
      // "details" 또는 undefined
      Alert.alert(
        "미션 상세",
        `${mission.title} 미션의 상세 정보를 표시합니다. (구현 필요)`
      );
      // TODO: 미션 상세 화면으로 이동 또는 모달 표시
    }
  };

  useEffect(() => {
    loadMissions(currentFilter);
  }, [currentFilter]);

  return (
    <ScreenContainer padded={"horizontal"}>
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
