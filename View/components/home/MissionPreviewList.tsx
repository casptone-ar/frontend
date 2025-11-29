import { ChevronRight } from "@tamagui/lucide-icons";
import { XStack, YStack } from "tamagui";

import { Button } from "@/View/core/Button/Button";
import { Card } from "@/View/core/Card/Card"; // 섹션 전체를 카드로 감쌀 수 있음
import { Text } from "@/View/core/Text/Text";
import type { MissionPreview } from "@/domain/mission/types";
import { MissionPreviewItem } from "./MissionPreviewItem";

export type MissionPreviewListProps = {
  title?: string;
  missions: MissionPreview[];
  onViewAllPress?: () => void;
  onMissionPress?: (missionId: string) => void;
  isLoading?: boolean;
};

/**
 * @description 홈 화면에 표시될 미션 미리보기 목록입니다.
 */
export const MissionPreviewList = ({
  title = "오늘의 미션",
  missions,
  onViewAllPress,
  onMissionPress,
  isLoading,
}: MissionPreviewListProps) => {
  if (isLoading) {
    // 간단한 로딩 스켈레톤
    return (
      <Card p="$lg" space="$md">
        <XStack jc="space-between" ai="center" mb="$sm">
          <Text type="h3" fontWeight="$bold">
            {title}
          </Text>
          <Text type="button" colorVariant="accent">
            로딩중...
          </Text>
        </XStack>
        {[1, 2].map((i) => (
          <XStack key={i} space="$md" ai="center" p="$sm" opacity={0.5}>
            <YStack
              width="$4"
              height="$4"
              borderRadius="$true"
              backgroundColor="$background3"
            />
            <YStack flex={1} space="$xs">
              <YStack
                height="$2"
                width="80%"
                borderRadius="$sm"
                backgroundColor="$background3"
              />
              <YStack
                height="$2"
                width="50%"
                borderRadius="$sm"
                backgroundColor="$background3"
              />
            </YStack>
          </XStack>
        ))}
      </Card>
    );
  }

  if (!missions || missions.length === 0) {
    return (
      <Card p="$lg" space="$md" ai="center">
        <Text type="h3" fontWeight="$bold" mb="$sm">
          {title}
        </Text>
        <Text type="body" colorVariant="secondary">
          오늘은 완료할 미션이 없어요!
        </Text>
      </Card>
    );
  }

  return (
    // 전체를 Card로 감싸 이미지와 유사한 배경 및 모서리 처리
    <Card
      p="$md"
      px={"$lg"}
      bg={"$background1"}
      shop={0}
      gap={"$md"}
      bw={1}
      boc={"$border1"}
    >
      <XStack w="100%" jc="space-between" ai="center">
        <Text type="h4">{title}</Text>
        {onViewAllPress && (
          <Button
            unstyled
            size="sm"
            onPress={onViewAllPress}
            icon={<ChevronRight size={16} color="$text1" strokeWidth={3} />}
            bg={"$background1"}
            color="$text1"
            px={0}
            pl={"$lg"}
            jc="center"
          />
        )}
      </XStack>
      {/* 
        미션 아이템이 많을 경우 ScrollView 사용 고려.
        홈 화면에서는 보통 2-3개 정도만 보여주므로 FlatList/ScrollView 없이 바로 렌더링도 가능.
        여기서는 일단 YStack으로 직접 렌더링도 가능.
      */}
      <YStack>
        {missions.slice(0, 3).map(
          (
            mission // 최대 3개만 표시
          ) => (
            <MissionPreviewItem
              key={mission.id}
              mission={mission}
              onPress={onMissionPress}
            />
          )
        )}
      </YStack>
    </Card>
  );
};
