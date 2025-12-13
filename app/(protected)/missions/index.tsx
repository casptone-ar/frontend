// app/(protected)/missions/index.tsx

import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  Coins,
  MoreVertical,
  Sparkles,
  TrendingUp,
} from "@tamagui/lucide-icons";
import { Separator, Button as TamaguiButton, XStack, YStack } from "tamagui";
import type { GetProps } from "tamagui";

import { Card } from "@/View/core/Card/Card";
import { Header } from "@/View/core/Header/Header";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { SegmentedTabs } from "@/View/core/SegmentedTabs";
import { Text } from "@/View/core/Text/Text";
import { MissionList } from "@/View/components/missions/MissionList";
import { useMissionStore } from "@/View/store/missionStore";

import type { MissionFilter } from "@/domain/mission/types";

/* ---------------------------------------------
 * UI용 탭
 * -------------------------------------------*/
const TABS = [
  { label: "전체", value: "all" },
  { label: "일일 미션", value: "daily" },
  { label: "주간 미션", value: "weekly" },
  { label: "완료된 미션", value: "completed" },
];

const PERIODS = ["D", "W", "M", "Y"] as const;
type Period = (typeof PERIODS)[number];

const PERIOD_LABELS: Record<Period, string> = {
  D: "D",
  W: "W",
  M: "M",
  Y: "Y",
};

const getChartData = (period: Period) => {
  switch (period) {
    case "D":
      return {
        labels: ["월", "화", "수", "목", "금", "토"],
        values: [6, 10, 12, 8, 14, 9],
        activeIndex: 4,
      };
    case "W":
      return {
        labels: ["1주", "2주", "3주", "4주", "5주", "6주"],
        values: [12, 14, 10, 18, 16, 11],
        activeIndex: 3,
      };
    case "Y":
      return {
        labels: ["'20", "'21", "'22", "'23", "'24", "'25"],
        values: [8, 10, 12, 9, 14, 11],
        activeIndex: 4,
      };
    case "M":
    default:
      return {
        labels: ["1월", "2월", "3월", "4월", "5월", "6월"],
        values: [12, 16, 30, 18, 24, 20],
        activeIndex: 2,
      };
  }
};

type HeaderIconButtonProps = {
  icon: GetProps<typeof TamaguiButton>["icon"];
  onPress?: () => void;
};

const HeaderIconButton = ({ icon, onPress }: HeaderIconButtonProps) => {
  return (
    <TamaguiButton
      chromeless
      circular
      size="$3"
      backgroundColor="$background3"
      pressStyle={{ backgroundColor: "$color4", opacity: 0.9 }}
      onPress={onPress}
      icon={icon}
    />
  );
};

export default function MissionsScreen() {
  const router = useRouter();
  const { missions } = useMissionStore();
  const [currentFilter, setCurrentFilter] = useState<MissionFilter>("all");
  const [period, setPeriod] = useState<Period>("M");

  const { totalCoin, totalExp, inProgressCount, completedCount } =
    useMemo(() => {
      const completed = missions.filter((m) => m.status === "completed");
      const totalCoin = completed.reduce((sum, m) => {
        return (
          sum +
          (m.rewards ?? []).reduce((rewardSum, r) => {
            return rewardSum + (r.type === "coin" ? r.amount : 0);
          }, 0)
        );
      }, 0);
      const totalExp = completed.reduce((sum, m) => {
        return (
          sum +
          (m.rewards ?? []).reduce((rewardSum, r) => {
            return rewardSum + (r.type === "experience" ? r.amount : 0);
          }, 0)
        );
      }, 0);

      const inProgressCount = missions.filter(
        (m) => m.status === "in-progress"
      ).length;
      const completedCount = completed.length;

      return { totalCoin, totalExp, inProgressCount, completedCount };
    }, [missions]);

  // 화면에서 보여줄 미션 필터링
  const visibleMissions = useMemo(() => {
    switch (currentFilter) {
      case "daily":
        return missions.filter((m) => m.type === "daily");
      case "weekly":
        return missions.filter((m) => m.type === "weekly");
      case "completed":
        return missions.filter((m) => m.status === "completed");
      default:
        return missions;
    }
  }, [currentFilter, missions]);

  const handleMissionPress = (id: string) => {
    router.push(`/(protected)/missions/${id}`);
  };

  const handleNavigateToInProgress = () => {
    router.push("/(protected)/missions/in-progress");
  };

  const chart = useMemo(() => getChartData(period), [period]);
  const chartMax = Math.max(...chart.values);

  return (
    <ScreenContainer scrollable={false} safeAreaBottom>
      <Header
        title="미션"
        leftAction={null}
        rightAction={
          <HeaderIconButton
            icon={<MoreVertical size={20} color="$text1" />}
            onPress={handleNavigateToInProgress}
          />
        }
        borderBottom={false}
      />

      <YStack px="$md" gap="$md" flex={1}>
        <Text type="caption" colorVariant="secondary">
          화정역 주변 스팟에서 AR 주행하고, 미디어를 업로드해 리워드를 받아보세요.
        </Text>

        <SegmentedTabs
          tabs={TABS}
          currentTab={currentFilter}
          onTabChange={(v) => setCurrentFilter(v as MissionFilter)}
        />

        <YStack flex={1}>
          <MissionList
            missions={visibleMissions}
            isLoading={false}
            onMissionAction={handleMissionPress}
            emptyListText="해당 조건의 미션이 없습니다."
            contentContainerStyle={{ paddingVertical: 16, paddingBottom: 28 }}
            ListHeaderComponent={
              <YStack gap="$md" pb="$md">
                {/* ✅ 큰 통계 카드(스크린샷 톤) */}
                <Card
                  bg="$background2"
                  borderCurve="continuous"
                  br="$xxl"
                  p="$lg"
                  shop={0}
                  gap="$md"
                >
                  <XStack jc="space-between" ai="flex-start">
                    <YStack gap="$xs" flex={1}>
                      <Text type="caption" colorVariant="tertiary">
                        Total
                      </Text>
                      <Text type="h2">{totalCoin.toLocaleString()} 코인</Text>
                      <Text type="caption" colorVariant="secondary">
                        완료 {completedCount} · 진행중 {inProgressCount}
                      </Text>
                    </YStack>

                    <YStack
                      width={44}
                      height={44}
                      borderRadius="$circular"
                      bg="$background3"
                      ai="center"
                      jc="center"
                    >
                      <TrendingUp size={20} color="$accent1" />
                    </YStack>
                  </XStack>

                  {/* ✅ 미니 세그먼트(D/W/M/Y) */}
                  <XStack
                    borderCurve="continuous"
                    bg="$background3"
                    br="$lg"
                    p="$xs"
                    gap="$xs"
                    alignSelf="flex-start"
                    boc="$color3"
                  >
                    {PERIODS.map((p) => {
                      const active = period === p;
                      return (
                        <TamaguiButton
                          key={p}
                          unstyled
                          onPress={() => setPeriod(p)}
                          px="$md"
                          py="$xs"
                          borderRadius="$circular"
                          backgroundColor={active ? "$accent1" : "transparent"}
                          pressStyle={{
                            backgroundColor: active ? "$accent2" : "$color4",
                          }}
                        >
                          <Text
                            type="caption"
                            fontWeight="$semibold"
                            color={active ? "$color1" : "$text2"}
                          >
                            {PERIOD_LABELS[p]}
                          </Text>
                        </TamaguiButton>
                      );
                    })}
                  </XStack>

                  {/* ✅ 간단 바 차트(목 데이터) */}
                  <XStack gap="$sm" ai="flex-end" jc="space-between" mt="$xs">
                    {chart.values.map((v, idx) => {
                      const active = idx === chart.activeIndex;
                      const h =
                        chartMax > 0
                          ? Math.round((v / chartMax) * 120) + 16
                          : 16;
                      return (
                        <YStack
                          key={`${chart.labels[idx]}-${idx}`}
                          ai="center"
                          gap="$xs"
                        >
                          <YStack
                            width={18}
                            height={h}
                            borderRadius="$circular"
                            backgroundColor={active ? "$accent1" : "$color4"}
                            opacity={active ? 1 : 0.55}
                          />
                          <Text type="caption" colorVariant="secondary">
                            {chart.labels[idx]}
                          </Text>
                        </YStack>
                      );
                    })}
                  </XStack>
                </Card>

                {/* ✅ 하단 2개 카드(스크린샷의 작은 카드 느낌) */}
                <XStack gap="$md">
                  <Card
                    borderCurve="continuous"
                    flex={1}
                    bg="$background2"
                    br="$xxl"
                    p="$lg"
                    shop={0}
                    gap="$sm"
                  >
                    <XStack ai="center" gap="$sm">
                      <YStack
                        width={38}
                        height={38}
                        borderRadius="$circular"
                        bg="$background3"
                        ai="center"
                        jc="center"
                      >
                        <Coins size={18} color="$accent1" />
                      </YStack>
                      <Text type="body" fontWeight="$semibold">
                        Total Coin
                      </Text>
                    </XStack>
                    <Text type="h3">{totalCoin.toLocaleString()}</Text>
                  </Card>

                  <Card
                    borderCurve="continuous"
                    flex={1}
                    bg="$background2"
                    br="$xxl"
                    p="$lg"
                    shop={0}
                    gap="$sm"
                  >
                    <XStack ai="center" gap="$sm">
                      <YStack
                        width={38}
                        height={38}
                        borderRadius="$circular"
                        bg="$background3"
                        ai="center"
                        jc="center"
                      >
                        <Sparkles size={18} color="$accent1" />
                      </YStack>
                      <Text type="body" fontWeight="$semibold">
                        Total EXP
                      </Text>
                    </XStack>
                    <Text type="h3">{totalExp.toLocaleString()}</Text>
                  </Card>
                </XStack>
                <Separator
                  my="$md"
                  marginHorizontal={"$sm"}
                  backgroundColor="$color3"
                  height={1}
                  borderColor="$color3"
                />
              </YStack>
            }
          />
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
