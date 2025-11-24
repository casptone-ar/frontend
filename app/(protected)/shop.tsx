import { Alert } from "react-native";
import { Separator, Spinner, XStack, YStack, Paragraph } from "tamagui";

import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { Button } from "@/View/core/Button/Button";

import {
  useShopItemsQuery,
  useBuyShopItemMutation,
} from "@/service/inbound/query/useShops";

type ShopItem = any; // ❗️ Swagger 스키마 확정되면 여기부터 제대로 타입 정의

export default function ShopScreen() {
  const { data: items, status, error } = useShopItemsQuery();
  const buyMutation = useBuyShopItemMutation();

  const list: ShopItem[] = Array.isArray(items) ? items : [];

  const handleBuy = async (item: ShopItem) => {
    try {
      await buyMutation.mutateAsync({
        itemId: Number(item.id ?? item.itemId),
        quantity: 1,
      });
      Alert.alert(
        "구매 완료",
        `${item.name ?? `아이템 #${item.id}`}을(를) 구매했습니다.`
      );
    } catch (e) {
      console.error("buy item error", e);
      Alert.alert("구매 실패", "아이템 구매 중 오류가 발생했습니다.");
    }
  };

  if (status === "pending") {
    return (
      <ScreenContainer scrollable={false}>
        <YStack f={1} jc="center" ai="center" space="$2">
          <Spinner />
          <Paragraph>상점 아이템을 불러오는 중...</Paragraph>
        </YStack>
      </ScreenContainer>
    );
  }

  if (status === "error") {
    console.error(error);
    return (
      <ScreenContainer scrollable={false}>
        <YStack f={1} jc="center" ai="center" space="$2" px="$lg">
          <Text type="h3">상점 정보를 불러올 수 없습니다.</Text>
          <Paragraph color="$text2">잠시 후 다시 시도해 주세요.</Paragraph>
        </YStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <YStack f={1} p="$lg" space="$md">
        <YStack space="$xs">
          <Text type="h2">상점</Text>
          <Paragraph color="$text2">
            코인을 사용해서 아이템을 구매할 수 있어요.
          </Paragraph>
        </YStack>

        <Separator my="$md" />

        {list.length === 0 ? (
          <Paragraph>현재 판매 중인 아이템이 없습니다.</Paragraph>
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
                  {item.name ?? `아이템 #${item.id ?? item.itemId ?? idx}`}
                </Text>
                {typeof item.price === "number" && (
                  <Text type="bodyLarge">{item.price} 코인</Text>
                )}
              </XStack>

              <Paragraph color="$text2">{item.description ?? ""}</Paragraph>

              <XStack mt="$2" jc="flex-end">
                <Button
                  size="sm"
                  onPress={() => handleBuy(item)}
                  loading={buyMutation.status === "pending"}
                  disabled={buyMutation.status === "pending"}
                >
                  구매
                </Button>
              </XStack>
            </YStack>
          ))
        )}
      </YStack>
    </ScreenContainer>
  );
}
