import { Button } from "@/View/core/Button/Button";
import { Card } from "@/View/core/Card/Card";
import { Text } from "@/View/core/Text/Text";
import type { ShopItem } from "@/domain/shop/types";
import { AlertTriangle, Coins, ShoppingCart } from "@tamagui/lucide-icons"; // 아이콘
import { Image, Spinner, XStack, YStack } from "tamagui"; // Tamagui 컴포넌트

export type ShopItemCardProps = {
  item: ShopItem;
  onPressPurchase: (item: ShopItem) => void;
  isPurchasing?: boolean;
  canAfford?: boolean;
};

/**
 * @description 상점 목록에 표시될 개별 아이템 카드입니다.
 * 아이템 정보와 구매 버튼을 포함합니다.
 */
export const ShopItemCard = ({
  item,
  onPressPurchase,
  isPurchasing = false,
  canAfford = true,
}: ShopItemCardProps) => {
  const { name, description, price, iconUrl, category } = item;

  // 간단한 카테고리별 태그 스타일
  const getCategoryTag = () => {
    let tagText = "";
    let tagBg = "$background3";
    switch (category) {
      case "cosmetic":
        tagText = "치장";
        tagBg = "$blue200";
        break;
      case "pose":
        tagText = "자세";
        tagBg = "$purple200";
        break;
      case "consumable":
        tagText = "소모품";
        tagBg = "$blue200";
        break;
      default:
        tagText = "기타";
        tagBg = "$background3";
        break;
    }
    return (
      <Text
        type="caption"
        fontWeight="$bold"
        color="$color1"
        bg={tagBg}
        px="$sm"
        py="$xxs"
        br="$md"
        shop={0}
        alignSelf="flex-start"
      >
        {tagText}
      </Text>
    );
  };

  return (
    <Card
      overflow="hidden" // 내부 Image가 Card 경계를 넘지 않도록
      gap="$xs"
      bw={1}
      boc={"$border1"}
      bg={"$background1"}
      w={"50%"}
      p={"$sm"}
    >
      {/* 아이템 이미지 영역 - 비율 유지하며 카드 상단 채우기 */}
      {iconUrl ? (
        <Image
          source={{ uri: iconUrl, width: 120, height: 90 }} // 적절한 크기 지정 필요
          aspectRatio={4 / 3} // 이미지 비율
          width="100%"
          // bg="$background2" // 로딩 중 배경색
        />
      ) : (
        <YStack h={150} bg="$background3" ai="center" jc="center">
          <ShoppingCart size="$4" color="$color8" />
        </YStack>
      )}

      <YStack pt="$sm" gap="$xxs" f={1}>
        <YStack gap="$xs" f={1}>
          <XStack jc="space-between" ai="flex-start">
            <Text type="body" fontWeight="$bold" flex={1} numberOfLines={2}>
              {name}
            </Text>
          </XStack>
          <Text
            type="bodySmall"
            numberOfLines={3}
            color="$text4"
            minHeight={36}
          >
            {description}
          </Text>
        </YStack>

        <YStack pt={"$xxs"}>
          {getCategoryTag()}
          <XStack ai="center" gap="$xxs" py={"$xs"}>
            <Text type="h4" fontWeight="$bold" color="$accent1">
              {price}
            </Text>
            <Coins size="$2" color="$accent1" />
          </XStack>
          <Button
            variant={canAfford ? "secondary" : "secondary"}
            size="md"
            onPress={() => onPressPurchase(item)}
            disabled={isPurchasing || !canAfford}
            icon={
              isPurchasing ? (
                <Spinner
                  size="small"
                  color={canAfford ? "$color1" : "$color1"}
                />
              ) : canAfford ? (
                <ShoppingCart size="$1" color="$color1" />
              ) : (
                <AlertTriangle size="$1" color="$color8" />
              )
            }
            // bg={!canAfford ? "$background1" : undefined}
            // borderColor={!canAfford ? "$border" : undefined}
            // color={!canAfford ? "$text1" : undefined}
          >
            {isPurchasing ? "구매중..." : canAfford ? "구매하기" : "코인부족"}
          </Button>
        </YStack>
      </YStack>
    </Card>
  );
};
