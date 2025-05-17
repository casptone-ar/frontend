import { Text } from "@/View/core/Text/Text";
import type { ShopItem } from "@/domain/shop/types";
import { FlatList, type ListRenderItem } from "react-native";
import { Spinner, YStack } from "tamagui";
import { ShopItemCard } from "./ShopItemCard"; // ShopItemCard.tsx로 가정
import type { ShopItemCardProps } from "./ShopItemCard";

export type ShopItemListProps = {
  items: ShopItem[];
  onPurchaseItem: ShopItemCardProps["onPressPurchase"];
  purchasingItemId?: string | null;
  currentCoinBalance?: number;
  isLoading?: boolean;
  // TODO: 필터링 및 정렬 옵션 추가 고려 (예: 카테고리별 필터)
};

/**
 * @description 상점에 판매 중인 아이템 목록을 표시합니다.
 */
export const ShopItemList = ({
  items,
  onPurchaseItem,
  purchasingItemId,
  currentCoinBalance,
  isLoading,
}: ShopItemListProps) => {
  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center" p="$lg" space="$md" mih={200}>
        <Spinner size="large" color="$accent1" />
        <Text type="body" colorVariant="secondary">
          아이템 목록을 불러오는 중...
        </Text>
      </YStack>
    );
  }

  const renderItem: ListRenderItem<ShopItem> = ({ item }) => (
    <ShopItemCard
      item={item}
      onPressPurchase={onPurchaseItem}
      isPurchasing={purchasingItemId === item.id}
      canAfford={(currentCoinBalance ?? 0) >= item.price}
    />
  );

  if (!items || items.length === 0) {
    return (
      <YStack f={1} ai="center" jc="center" p="$lg" space="$md" mih={200}>
        <Text type="h3">🛍️</Text>
        <Text type="body" colorVariant="secondary" ta="center">
          현재 판매 중인 아이템이 없습니다.
        </Text>
      </YStack>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2} // 그리드 레이아웃도 고려 가능
      // columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between', gap: 16 } : undefined}
      ItemSeparatorComponent={() => <YStack h="$lg" />} // 아이템 간 간격
      contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 8 }}
      showsVerticalScrollIndicator={false}
    />
  );
};
