import { Card } from "@/View/core/Card/Card"; // 코어 컴포넌트
import { Text } from "@/View/core/Text/Text"; // 코어 컴포넌트
import type { BaseMission } from "@/domain/mission/types";
import { FlatList, type ListRenderItem } from "react-native"; // FlatList 사용
import { type GetProps, Spinner, YStack } from "tamagui";
import { MissionItem } from "./MissionItem";
import type { MissionItemProps } from "./MissionItem";

export type MissionListProps = {
  missions: BaseMission[];
  isLoading?: boolean;
  /** MissionItem에서 발생하는 onPress 이벤트를 그대로 전달받습니다. */
  onMissionAction?: MissionItemProps["onPress"];
  ListHeaderComponent?: React.ReactElement | null;
  emptyListText?: string;
  contentContainerStyle?: GetProps<typeof YStack>; // FlatList의 contentContainerStyle과 유사
};

/**
 * @description 미션 목록을 표시하는 컴포넌트입니다.
 * 로딩 상태 및 빈 목록 상태를 처리합니다.
 */
export const MissionList = ({
  missions,
  isLoading,
  onMissionAction,
  ListHeaderComponent,
  emptyListText = "표시할 미션이 없습니다.",
  contentContainerStyle,
}: MissionListProps) => {
  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center" p="$lg" space="$md" mih={200}>
        <Spinner size="large" color="$accent1" />
        <Text type="body" colorVariant="secondary">
          미션 목록을 불러오는 중...
        </Text>
      </YStack>
    );
  }

  const renderItem: ListRenderItem<BaseMission> = ({ item }) => (
    <MissionItem mission={item} onPress={onMissionAction} />
  );

  if (!missions || missions.length === 0) {
    return (
      <YStack f={1} ai="center" jc="center" p="$lg" space="$md" mih={200}>
        {ListHeaderComponent}
        <Card p="$xl" ai="center" gap="$sm">
          {" "}
          {/* 간단한 카드 UI 추가 */}
          <Text type="h3">😕</Text>
          <Text type="body" colorVariant="secondary" ta="center">
            {emptyListText}
          </Text>
        </Card>
      </YStack>
    );
  }

  return (
    <FlatList
      data={missions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={() => <YStack h="$md" />} // 아이템 간 간격
      contentContainerStyle={{
        paddingVertical: 16,
        paddingHorizontal: 8,
      }} // Tamagui 토큰 사용 가능하도록
      showsVerticalScrollIndicator={false}
    />
  );
};
