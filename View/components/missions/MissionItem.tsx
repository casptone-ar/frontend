// View/components/missions/MissionItem.tsx
import { Avatar, XStack, YStack } from "tamagui";

import { Card } from "@/View/core/Card/Card";
import { Text } from "@/View/core/Text/Text";
import type { Mission } from "@/domain/mission/types";

export type MissionItemProps = {
  mission: Mission;
  onPress?: (id: string) => void;
};

export const MissionItem = ({ mission, onPress }: MissionItemProps) => {
  const handlePress = () => {
    onPress?.(mission.id);
  };

  const firstChar = mission.title?.[0] ?? "?";

  return (
    <Card p="$md" mb="$sm" backgroundColor="$background1" onPress={handlePress}>
      <XStack ai="center" space="$md">
        <Avatar circular size="$3" bg="$accent5">
          {mission.iconUrl ? (
            <Avatar.Image
              src={mission.iconUrl}
              accessibilityLabel={mission.title}
            />
          ) : (
            <Avatar.Fallback>
              {/* ❗ 여기 꼭 Text로 감싸줘야 함 */}
              <Text type="caption">{firstChar}</Text>
            </Avatar.Fallback>
          )}
        </Avatar>

        <YStack flex={1} space="$xs">
          <Text type="body" fontWeight="$semibold" numberOfLines={1}>
            {mission.title}
          </Text>

          {mission.description ? (
            <Text type="caption" colorVariant="secondary" numberOfLines={2}>
              {mission.description}
            </Text>
          ) : null}
        </YStack>
      </XStack>
    </Card>
  );
};
