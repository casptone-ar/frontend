import { Separator, Spinner, XStack, YStack, Paragraph } from "tamagui";

import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";

import { useMyInventoryQuery } from "@/service/inbound/query/useInventory";

type InventoryItem = any; // ❗️ 나중에 Swagger 보고 정확히 정의

export default function InventoryScreen() {
  const { data: items, status, error } = useMyInventoryQuery();
  const list: InventoryItem[] = Array.isArray(items) ? items : [];

  if (status === "pending") {
    return (
      <ScreenContainer scrollable={false}>
        <YStack f={1} jc="center" ai="center" space="$2">
          <Spinner />
          <Paragraph>인벤토리를 불러오는 중...</Paragraph>
        </YStack>
      </ScreenContainer>
    );
  }

  if (status === "error") {
    console.error(error);
    return (
      <ScreenContainer scrollable={false}>
        <YStack f={1} jc="center" ai="center" space="$2" px="$lg">
          <Text type="h3">인벤토리 정보를 불러올 수 없습니다.</Text>
          <Paragraph color="$text2">잠시 후 다시 시도해 주세요.</Paragraph>
        </YStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <YStack f={1} p="$lg" space="$md">
        <YStack space="$xs">
          <Text type="h2">인벤토리</Text>
          <Paragraph color="$text2">내가 보유한 아이템 목록이에요.</Paragraph>
        </YStack>

        <Separator my="$md" />

        {list.length === 0 ? (
          <Paragraph>보유한 아이템이 없습니다.</Paragraph>
        ) : (
          list.map((item, idx) => (
            <YStack
              key={item.id ?? idx}
              p="$md"
              bg="$backgroundSoft"
              br="$4"
              space="$2"
              mb="$3"
            >
              <XStack jc="space-between" ai="center">
                <Text type="bodyLarge">
                  {item.name ?? `아이템 #${item.itemId ?? item.id ?? idx}`}
                </Text>
                {typeof item.quantity === "number" && (
                  <Text type="bodyLarge">x {item.quantity}</Text>
                )}
              </XStack>
            </YStack>
          ))
        )}
      </YStack>
    </ScreenContainer>
  );
}
