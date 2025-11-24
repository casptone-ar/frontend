// View/components/missions/MissionList.tsx
import {
  FlatList,
  type ListRenderItem,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Spinner, YStack } from "tamagui";

import { Card } from "@/View/core/Card/Card";
import { Text } from "@/View/core/Text/Text";
import type { Mission } from "@/domain/mission/types";
import { MissionItem } from "./MissionItem";

export type MissionListProps = {
  missions: Mission[];
  isLoading?: boolean;
  onMissionAction?: (id: string) => void;
  ListHeaderComponent?: React.ReactElement | null;
  emptyListText?: string;
  /** FlatList contentContainerStyle 그대로 스타일 오브젝트 */
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export const MissionList = ({
  missions,
  isLoading = false,
  onMissionAction,
  ListHeaderComponent,
  emptyListText = "표시할 미션이 없습니다.",
  contentContainerStyle,
}: MissionListProps) => {
  // ⏳ 로딩 상태
  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center" p="$lg" space="$md" mih={200}>
        <Spinner size="large" />
        <Text type="body" colorVariant="secondary">
          미션 목록을 불러오는 중...
        </Text>
      </YStack>
    );
  }

  const renderItem: ListRenderItem<Mission> = ({ item }) => (
    <MissionItem mission={item} onPress={(id) => onMissionAction?.(id)} />
  );

  // 😕 빈 목록 상태
  if (!missions || missions.length === 0) {
    return (
      <YStack f={1} ai="center" jc="center" p="$lg" space="$md" mih={200}>
        {ListHeaderComponent}
        <Card p="$xl" ai="center" gap="$sm">
          <Text type="h3">😕</Text>
          <Text type="body" colorVariant="secondary" ta="center">
            {emptyListText}
          </Text>
        </Card>
      </YStack>
    );
  }

  // 📋 실제 목록
  return (
    <FlatList
      data={missions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={() => <YStack h="$md" />}
      contentContainerStyle={
        contentContainerStyle ?? {
          paddingVertical: 16,
          paddingHorizontal: 8,
        }
      }
      showsVerticalScrollIndicator={false}
    />
  );
};
