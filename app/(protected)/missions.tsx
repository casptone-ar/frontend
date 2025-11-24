// app/(protected)/missions.tsx

import { useMemo, useState } from "react";
import { XStack } from "tamagui";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { SegmentedTabs } from "@/View/core/SegmentedTabs";
import { Text } from "@/View/core/Text/Text";
import { MissionList } from "@/View/components/missions/MissionList";

import type { Mission, MissionFilter } from "@/domain/mission/types";

/* ---------------------------------------------
 *  🔥 완전 Mock 데이터 (일일 3, 주간 3, 완료 3 = 총 9개)
 * -------------------------------------------*/

const MOCK_MISSIONS: Mission[] = [
  // --- Daily (3) ---
  {
    id: "daily_1",
    title: "오늘 3,000보 걷기",
    description: "펫과 함께 산책하며 3,000보를 걸어보세요.",
    type: "daily",
    status: "in-progress",
    rewards: [{ type: "coin", amount: 50 }],
    targetValue: 3000,
    currentValue: 1200,
  },
  {
    id: "daily_2",
    title: "상점에서 아이템 구매하기",
    description: "상점에서 아이템을 구매해보세요.",
    type: "daily",
    status: "pending",
    rewards: [{ type: "coin", amount: 30 }],
    targetValue: 1,
    currentValue: 0,
  },
  {
    id: "daily_3",
    title: "펫과 3번 상호작용",
    description: "펫을 3번 터치해 놀아주세요.",
    type: "daily",
    status: "pending",
    rewards: [{ type: "experience", amount: 20 }],
    targetValue: 3,
    currentValue: 0,
  },

  // --- Weekly (3) ---
  {
    id: "weekly_1",
    title: "총 2만 보 걷기",
    description: "일주일 동안 누적 20,000보 걷기.",
    type: "weekly",
    status: "in-progress",
    rewards: [{ type: "coin", amount: 200 }],
    targetValue: 20000,
    currentValue: 1200,
  },
  {
    id: "weekly_2",
    title: "펫 레벨 올리기",
    description: "펫의 레벨을 올려보세요.",
    type: "weekly",
    status: "pending",
    rewards: [{ type: "experience", amount: 100 }],
  },
  {
    id: "weekly_3",
    title: "상점에서 아이템 3개 구매",
    description: "상점에서 아이템을 3개 구매하세요.",
    type: "weekly",
    status: "pending",
    rewards: [{ type: "coin", amount: 150 }],
    targetValue: 3,
    currentValue: 0,
  },

  // --- Completed (3) ---
  {
    id: "completed_1",
    title: "매일 접속하기",
    description: "어플에 접속을 해주세요.",
    type: "daily",
    status: "completed",
    rewards: [{ type: "coin", amount: 20 }],
  },
  {
    id: "completed_2",
    title: "첫 펫 생성",
    description: "나만의 첫 펫을 만들었습니다.",
    type: "weekly",
    status: "completed",
    rewards: [{ type: "experience", amount: 100 }],
  },
  {
    id: "completed_3",
    title: "첫 상점 방문",
    description: "상점을 방문했습니다.",
    type: "weekly",
    status: "completed",
    rewards: [{ type: "coin", amount: 20 }],
  },
];

/* ---------------------------------------------
 * UI용 탭
 * -------------------------------------------*/

const TABS = [
  { label: "전체", value: "all" },
  { label: "일일 미션", value: "daily" },
  { label: "주간 미션", value: "weekly" },
  { label: "완료된 미션", value: "completed" },
];

/* ---------------------------------------------
 * 화면 컴포넌트
 * -------------------------------------------*/

export default function MissionsScreen() {
  const router = useRouter();
  const [currentFilter, setCurrentFilter] = useState<MissionFilter>("all");

  // 화면에서 보여줄 미션 필터링
  const visibleMissions = useMemo(() => {
    switch (currentFilter) {
      case "daily":
        return MOCK_MISSIONS.filter((m) => m.type === "daily");
      case "weekly":
        return MOCK_MISSIONS.filter((m) => m.type === "weekly");
      case "completed":
        return MOCK_MISSIONS.filter((m) => m.status === "completed");
      default:
        return MOCK_MISSIONS;
    }
  }, [currentFilter]);

  const handleMissionAction = (id: string) => {
    router.push(`/(protected)/missions/${id}`);
  };

  return (
    <ScreenContainer scrollable={false} padded="horizontal">
      <XStack p="$lg" jc="space-between" ai="center">
        <Text type="h2">미션 목록</Text>
      </XStack>

      <SegmentedTabs
        tabs={TABS}
        currentTab={currentFilter}
        onTabChange={(v) => setCurrentFilter(v as MissionFilter)}
      />

      <MissionList
        missions={visibleMissions}
        isLoading={false}
        onMissionAction={handleMissionAction}
        emptyListText="해당 조건의 미션이 없습니다."
      />
    </ScreenContainer>
  );
}
