import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import type {
  ConsumableShopItem,
  CosmeticShopItem,
  PoseShopItem,
  ShopItem,
  UserCoinBalance,
} from "@/domain/shop/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { Separator, Spinner, XStack, YStack } from "tamagui";
import { CoinBalanceDisplay } from "./components/shop/CoinBalanceDisplay";
import { ShopItemList } from "./components/shop/ShopItemList";

// --- Mock Data & Service ---
// 실제로는 service/application 레이어에서 zustand 스토어 또는 react-query 훅을 통해 가져옵니다.
const MOCK_COSMETIC_ITEMS: CosmeticShopItem[] = [
  {
    id: "cosmetic001",
    name: "빨간 모자",
    description: "멋진 빨간색 모자입니다. 펫에게 씌워주세요!",
    price: 20,
    category: "cosmetic",
    iconUrl: "icons/red_hat.png", // 실제 아이콘 경로로 대체 필요
  },
  {
    id: "cosmetic002",
    name: "파란 스카프",
    description: "시원한 파란색 스카프입니다.",
    price: 15,
    category: "cosmetic",
    iconUrl: "icons/blue_scarf.png",
  },
];

const MOCK_POSE_ITEMS: PoseShopItem[] = [
  {
    id: "pose001",
    name: "춤추기 자세",
    description: "펫이 신나게 춤을 춥니다!",
    price: 25,
    category: "pose",
    animationName: "dance", // PetAnimationType과 연관
    iconUrl: "icons/dance_pose.png",
  },
  {
    id: "pose002",
    name: "앉기 자세",
    description: "펫이 예쁘게 앉는 자세를 배웁니다.",
    price: 20,
    category: "pose",
    animationName: "sit",
    iconUrl: "icons/sit_pose.png",
  },
];

const MOCK_CONSUMABLE_ITEMS: ConsumableShopItem[] = [
  {
    id: "consumable001",
    name: "성장 부스터 (24시간)",
    description: "24시간 동안 애완동물의 성장 속도가 2배로 증가합니다.",
    price: 30,
    category: "consumable",
    durationHours: 24,
    effectMultiplier: 2,
    iconUrl: "icons/growth_boost.png",
  },
];

const MOCK_ALL_ITEMS: ShopItem[] = [
  ...MOCK_COSMETIC_ITEMS,
  ...MOCK_POSE_ITEMS,
  ...MOCK_CONSUMABLE_ITEMS,
];

const MOCK_USER_COIN_BALANCE: UserCoinBalance = {
  currentCoins: 150,
};

const fetchShopItems = async (): Promise<ShopItem[]> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_ALL_ITEMS), 500)
  );
};

const fetchUserCoinBalance = async (): Promise<UserCoinBalance> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_USER_COIN_BALANCE), 200)
  );
};

const purchaseShopItemAPI = async (
  itemId: string,
  currentCoins: number
): Promise<{
  success: boolean;
  newCoinBalance?: number;
  purchasedItem?: ShopItem;
  error?: string;
}> => {
  console.log(`Attempting to purchase item: ${itemId}`);
  return new Promise((resolve) =>
    setTimeout(() => {
      const item = MOCK_ALL_ITEMS.find((i) => i.id === itemId);
      if (!item) {
        return resolve({
          success: false,
          error: "존재하지 않는 아이템입니다.",
        });
      }
      if (currentCoins < item.price) {
        return resolve({ success: false, error: "코인이 부족합니다." });
      }
      // 모킹: 구매 성공 처리
      const newBalance = currentCoins - item.price;
      MOCK_USER_COIN_BALANCE.currentCoins = newBalance; // 실제라면 DB 업데이트 후 새 잔액 반환
      // TODO: 실제로는 사용자의 인벤토리에 아이템 추가 로직 필요
      console.log(
        `Item ${itemId} purchased. New balance: ${newBalance}. User inventory should be updated.`
      );
      resolve({
        success: true,
        newCoinBalance: newBalance,
        purchasedItem: item,
      });
    }, 700)
  );
};
// --- End Mock Data & Service ---

/**
 * 상점 화면입니다.
 * 사용자는 이 화면에서 다양한 아이템(치장, 자세, 소모품)을 코인으로 구매할 수 있습니다.
 * 현재 보유 코인이 표시되며, 아이템을 선택하여 상세 정보를 보고 구매할 수 있습니다.
 */
export default function ShopScreen() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [coinBalance, setCoinBalance] = useState<UserCoinBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingItemId, setPurchasingItemId] = useState<string | null>(null);

  const loadShopData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedItems, fetchedBalance] = await Promise.all([
        fetchShopItems(),
        fetchUserCoinBalance(),
      ]);
      setItems(fetchedItems);
      setCoinBalance(fetchedBalance);
    } catch (error) {
      console.error("Failed to load shop data:", error);
      Alert.alert("오류", "상점 정보를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadShopData();
    }, [loadShopData])
  );

  const handlePurchaseItem = async (item: ShopItem) => {
    if (!coinBalance) {
      Alert.alert("오류", "코인 정보를 불러올 수 없습니다.");
      return;
    }
    if (coinBalance.currentCoins < item.price) {
      Alert.alert("코인 부족", "아이템을 구매하기 위한 코인이 부족합니다.");
      return;
    }

    setPurchasingItemId(item.id);
    Alert.alert(
      "구매 확인",
      `'${item.name}' 아이템을 ${item.price}코인으로 구매하시겠습니까?`,
      [
        {
          text: "취소",
          style: "cancel",
          onPress: () => setPurchasingItemId(null),
        },
        {
          text: "구매",
          onPress: async () => {
            try {
              const result = await purchaseShopItemAPI(
                item.id,
                coinBalance.currentCoins
              );
              if (
                result.success &&
                result.newCoinBalance !== undefined &&
                result.purchasedItem
              ) {
                Alert.alert(
                  "구매 완료!",
                  `'${result.purchasedItem.name}' 아이템을 구매했습니다.`
                );
                setCoinBalance({ currentCoins: result.newCoinBalance });
                // TODO: 구매한 아이템에 따라 추가 로직 (예: 인벤토리 업데이트, 펫 상태 변경 등)
                // 예: if (result.purchasedItem.category === 'cosmetic') { updateUserPetAppearance(...) }
              } else {
                Alert.alert(
                  "구매 실패",
                  result.error || "아이템 구매에 실패했습니다."
                );
              }
            } catch (error) {
              console.error("Error purchasing item:", error);
              Alert.alert("오류", "아이템 구매 중 문제가 발생했습니다.");
            } finally {
              setPurchasingItemId(null);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer scrollable={false} safeAreaTop>
        <YStack f={1} jc="center" ai="center" space="$md">
          <Spinner size="large" color="$accent1" />
          <Text type="body" colorVariant="secondary">
            상점 정보를 불러오는 중...
          </Text>
        </YStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false} padded={"horizontal"}>
      <XStack p="$lg" jc="space-between" ai="center" pb="$lg">
        <Text type="h2">상점</Text>
      </XStack>

      <YStack px="$lg" pb="$md">
        <CoinBalanceDisplay
          balance={coinBalance}
          isLoading={isLoading && !coinBalance}
        />
      </YStack>

      <Separator mx="$lg" bg={"$border1"} boc={"$border1"} />

      <YStack f={1} pt="$md" p="$md">
        {!items.length && !isLoading ? (
          <YStack f={1} ai="center" jc="center" p="$lg" space="$md" mih={200}>
            <Text type="h3">🛍️</Text>
            <Text type="body" colorVariant="secondary" ta="center">
              현재 판매 중인 아이템이 없습니다.
            </Text>
          </YStack>
        ) : (
          <ShopItemList
            items={items}
            onPurchaseItem={handlePurchaseItem}
            purchasingItemId={purchasingItemId}
            currentCoinBalance={coinBalance?.currentCoins}
            isLoading={isLoading && items.length === 0}
          />
        )}
      </YStack>
    </ScreenContainer>
  );
}
