import { Text } from "@/View/core/Text/Text";
import type { UserCoinBalance } from "@/domain/shop/types";
import { Coins } from "@tamagui/lucide-icons";
import { Spinner, XStack } from "tamagui";

export type CoinBalanceDisplayProps = {
  balance: UserCoinBalance | null;
  isLoading?: boolean;
};

/**
 * 사용자의 현재 코인 잔액을 표시하는 컴포넌트입니다.
 * 로딩 상태에 따라 스피너를 표시할 수 있습니다.
 *
 * @param {CoinBalanceDisplayProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
export const CoinBalanceDisplay = ({
  balance,
  isLoading,
}: CoinBalanceDisplayProps) => {
  if (isLoading) {
    return (
      <XStack ai="center" gap="$sm" p="$md" bg="$background2" br="$md">
        <Spinner size="small" color="$accent1" />
        <Text type="body" colorVariant="secondary">
          코인 정보 로딩 중...
        </Text>
      </XStack>
    );
  }

  if (!balance) {
    return (
      <XStack ai="center" gap="$sm" p="$md" bg="$background2" br="$md">
        <Coins size={20} color="$color8" />
        <Text type="bodyStrong" colorVariant="secondary">
          ---
        </Text>
        <Text type="body" colorVariant="secondary">
          코인
        </Text>
      </XStack>
    );
  }

  return (
    <XStack ai="center" gap="$sm" p="$md" bg="$background2" br="$md">
      <Coins size={24} color="$accent1" />
      <Text type="h3" fontWeight="$bold" color="$accent1">
        {balance.currentCoins.toLocaleString()}
      </Text>
      <Text type="body" colorVariant="secondary" mt="$xxs">
        코인 보유 중
      </Text>
    </XStack>
  );
};
