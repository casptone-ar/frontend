import React from "react";
import { Alert, Image } from "react-native";
import { Paragraph, Separator, XStack, YStack } from "tamagui";

import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { Button } from "@/View/core/Button/Button";
import { Chip } from "@/View/core/Chip/Chip";

type GifticonCategory = "전체" | "커피" | "편의점" | "디저트" | "상품권";

type GifticonItem = {
  id: string;
  brand: string;
  name: string;
  priceCoin: number;
  category: Exclude<GifticonCategory, "전체">;
  imageUri?: string;
  tags?: string[];
  isSoldOut?: boolean;
};

type CashbackPartner = {
  id: string;
  provider: string;
  title: string;
  summary: string;
  rewardText: string;
  imageUri?: string;
  ctaLabel: string;
  disabled?: boolean;
};

const MOCK_BALANCE_COIN = 170;

const MOCK_GIFTICONS: GifticonItem[] = [
  {
    id: "gift-001",
    brand: "스타벅스",
    name: "아메리카노 Tall",
    priceCoin: 3_900,
    category: "커피",
    tags: ["인기", "즉시교환"],
  },
  {
    id: "gift-002",
    brand: "메가MGC커피",
    name: "아이스 아메리카노",
    priceCoin: 2_400,
    category: "커피",
    tags: ["가성비"],
  },
  {
    id: "gift-003",
    brand: "CU",
    name: "모바일 상품권 5,000원",
    priceCoin: 5_200,
    category: "편의점",
    tags: ["실속"],
  },
  {
    id: "gift-004",
    brand: "GS25",
    name: "모바일 상품권 10,000원",
    priceCoin: 10_500,
    category: "편의점",
    tags: ["베스트"],
  },
  {
    id: "gift-005",
    brand: "배스킨라빈스",
    name: "싱글레귤러",
    priceCoin: 3_800,
    category: "디저트",
    tags: ["한정"],
    isSoldOut: true,
  },
  {
    id: "gift-006",
    brand: "이마트24",
    name: "모바일 상품권 3,000원",
    priceCoin: 3_100,
    category: "편의점",
    tags: ["즉시교환"],
  },
  {
    id: "gift-007",
    brand: "네이버페이",
    name: "포인트 교환권 5,000P",
    priceCoin: 5_700,
    category: "상품권",
    tags: ["현금성"],
  },
  {
    id: "gift-008",
    brand: "신세계 상품권",
    name: "교환권 10,000원",
    priceCoin: 11_200,
    category: "상품권",
    tags: ["프리미엄"],
  },
];

const MOCK_CASHBACK: CashbackPartner[] = [
  {
    id: "cash-001",
    provider: "카카오페이",
    title: "카카오페이 결제 캐시백",
    summary:
      "결제 수단을 연동하고 미션을 달성하면 캐시백이 쌓이는 것처럼 보여요.",
    rewardText: "최대 3% 캐시백",
    ctaLabel: "연동하고 받기",
  },
  {
    id: "cash-002",
    provider: "네이버페이",
    title: "네이버페이 포인트 적립",
    summary:
      "페이 연동 후 일정 조건을 만족하면 포인트를 받는 흐름(모킹)입니다.",
    rewardText: "최대 2% 적립",
    ctaLabel: "신청하기",
  },
  {
    id: "cash-003",
    provider: "토스",
    title: "토스 캐시백 이벤트",
    summary: "연동 후 주간 리워드 정산으로 캐시백을 받는 것처럼 구현합니다.",
    rewardText: "주간 정산",
    ctaLabel: "이벤트 참여",
  },
  {
    id: "cash-004",
    provider: "페이코",
    title: "PAYCO 혜택 받기",
    summary: "연동 및 약관 동의 플로우를 버튼/알림으로만 모킹합니다.",
    rewardText: "최대 5,000원",
    ctaLabel: "혜택 받기",
    disabled: true,
  },
];

type MockImageFrameProps = {
  imageUri?: string;
  label: string;
  width?: number | string;
  height: number;
  borderRadius?: number | string;
};

const MockImageFrame = ({
  imageUri,
  label,
  width = "100%",
  height,
  borderRadius = "$4",
}: MockImageFrameProps) => {
  return (
    <YStack
      w={width}
      h={height}
      br={borderRadius as any}
      overflow="hidden"
      bg="$background2"
      borderWidth={1}
      borderColor="$color3"
      ai="center"
      jc="center"
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <Text type="caption" color="$text3">
          {label}
        </Text>
      )}
    </YStack>
  );
};

type GifticonCardProps = {
  item: GifticonItem;
  onPressExchange: (item: GifticonItem) => void;
};

const GifticonCard = ({ item, onPressExchange }: GifticonCardProps) => {
  const disabled = Boolean(item.isSoldOut);

  return (
    <YStack
      w="48%"
      p="$md"
      bg="$background2"
      borderCurve="continuous"
      borderRadius={"$xl"}
      gap="$3"
      borderColor="$color3"
    >
      <MockImageFrame
        label="상품 이미지"
        imageUri={item.imageUri}
        height={88}
        borderRadius="$lg"
      />

      <YStack space="$1" mt={"$xs"}>
        <Text type="caption" color="$text4" fontSize={"$1"}>
          {item.brand}
        </Text>
        <Text type="bodyLarge" numberOfLines={2}>
          {item.name}
        </Text>
      </YStack>

      <XStack ai="center" jc="space-between" mb={"$2"} ml={1}>
        <Text type="bodyLarge" color={"$accent5"}>
          {item.priceCoin.toLocaleString()} 코인
        </Text>
        {disabled ? (
          <Chip
            text="품절"
            themeColor="gray"
            variantStyle="outlined"
            size="sm"
          />
        ) : null}
      </XStack>

      {item.tags?.length ? (
        <XStack flexWrap="wrap" gap="$2">
          {item.tags.map((tag) => (
            <Chip
              key={`${item.id}-${tag}`}
              text={tag}
              themeColor="gray"
              variantStyle="filled"
              size="sm"
              mb="$1"
            />
          ))}
        </XStack>
      ) : null}

      <Button
        mt="$2"
        size="sm"
        variant={disabled ? "secondary" : "primary"}
        backgroundColor={"$color9"}
        disabled={disabled}
        onPress={() => onPressExchange(item)}
        fontSize={"$3"}
        textProps={{
          fontSize: "$3",
          fontWeight: 800,
        }}
      >
        {disabled ? "품절" : "교환"}
      </Button>
    </YStack>
  );
};

type CashbackCardProps = {
  partner: CashbackPartner;
  onPress: (partner: CashbackPartner) => void;
};

const CashbackCard = ({ partner, onPress }: CashbackCardProps) => {
  const disabled = Boolean(partner.disabled);

  return (
    <YStack
      p="$md"
      bg="$background2"
      bw={1}
      borderCurve="continuous"
      borderRadius={"$xl"}
      gap="$3"
      borderColor="$color3"
    >
      <XStack ai="center" space="$md">
        <MockImageFrame
          label="로고"
          imageUri={partner.imageUri}
          width={48}
          height={48}
          borderRadius={"$circular"}
        />
        <YStack f={1} space="$1">
          <Text type="bodyLarge">{partner.title}</Text>
          <Paragraph color="$text4" fontSize={"$2"} lh={18}>
            {partner.summary}
          </Paragraph>
        </YStack>
      </XStack>

      <XStack ai="center" jc="space-between" my={"$1"}>
        <Chip
          text={partner.provider}
          themeColor="gray"
          variantStyle="filled"
          size="md"
        />
        <Text type="bodySmall" color="$accent1" fos={"$2"}>
          {partner.rewardText}
        </Text>
      </XStack>

      <Button
        width={"50%"}
        alignSelf="flex-end"
        size="md"
        variant={disabled ? "secondary" : "primary"}
        disabled={disabled}
        onPress={() => onPress(partner)}
      >
        {partner.ctaLabel}
      </Button>
    </YStack>
  );
};

export default function ShopScreen() {
  const [category, setCategory] = React.useState<GifticonCategory>("전체");

  const categories: { value: GifticonCategory; label: string }[] = [
    { value: "전체", label: "전체" },
    { value: "커피", label: "커피" },
    { value: "편의점", label: "편의점" },
    { value: "디저트", label: "디저트" },
    { value: "상품권", label: "상품권" },
  ];

  const visibleGifticons = React.useMemo(() => {
    if (category === "전체") return MOCK_GIFTICONS;
    return MOCK_GIFTICONS.filter((item) => item.category === category);
  }, [category]);

  const handleGifticonExchange = (item: GifticonItem) => {
    Alert.alert(
      "기프티콘 교환(모킹)",
      `${item.brand} - ${
        item.name
      }\n필요 코인: ${item.priceCoin.toLocaleString()} 코인\n\n(모킹) 실제 교환/발급은 동작하지 않습니다.`,
      [{ text: "확인" }]
    );
  };

  const handleCashbackApply = (partner: CashbackPartner) => {
    Alert.alert(
      "캐시백 신청(모킹)",
      `${partner.provider}\n${partner.rewardText}\n\n(모킹) 연동/약관 동의/지급 절차는 추후 구현 예정입니다.`,
      [{ text: "확인" }]
    );
  };

  return (
    <ScreenContainer scrollable>
      <XStack
        ai="center"
        jc="space-between"
        py="$6"
        px={"$5"}
        bbw={1}
        boc="$color3"
      >
        <Text type="bodyLarge">보유 코인</Text>
        <Chip
          text={`${MOCK_BALANCE_COIN.toLocaleString()} 코인`}
          themeColor="primary"
          variantStyle="filled"
        />
      </XStack>

      <YStack f={1} p="$md" space="$md" mt={"$4"}>
        <YStack space="$xs">
          <Text type="h2">상점</Text>
          <Paragraph color="$text2">
            리워드(코인)로 기프티콘 교환 / 현금성 캐시백 신청을 할 수 있어요.
          </Paragraph>
        </YStack>

        <Separator my="$md" />

        <YStack>
          <XStack ai="center" jc="space-between">
            <Text type="h3">기프티콘 교환</Text>
          </XStack>

          <XStack flexWrap="wrap" gap="$3" mt={"$4"}>
            {categories.map((c) => {
              const selected = c.value === category;

              return (
                <Button
                  key={c.value}
                  size="sm"
                  height={28}
                  bw={0}
                  variant={selected ? "primary" : "secondary"}
                  backgroundColor={selected ? "$accent1" : "$background1"}
                  circular
                  onPress={() => setCategory(c.value)}
                >
                  <Text
                    type="button"
                    color={selected ? "$color1" : "$text1"}
                    fontSize="$2"
                  >
                    {c.label}
                  </Text>
                </Button>
              );
            })}
          </XStack>

          {visibleGifticons.length === 0 ? (
            <Paragraph color="$text2">
              선택한 카테고리에 판매 항목이 없습니다.
            </Paragraph>
          ) : (
            <XStack
              flexWrap="wrap"
              jc="space-between"
              rowGap="$5"
              columnGap="$3"
              mt={"$8"}
            >
              {visibleGifticons.map((item) => (
                <GifticonCard
                  key={item.id}
                  item={item}
                  onPressExchange={handleGifticonExchange}
                />
              ))}
            </XStack>
          )}
        </YStack>

        <Separator my="$md" />

        <YStack>
          <XStack ai="center" jc="space-between">
            <Text type="h3">현금성 캐시백</Text>
          </XStack>

          <YStack gap="$6" mt={"$8"}>
            {MOCK_CASHBACK.map((partner) => (
              <CashbackCard
                key={partner.id}
                partner={partner}
                onPress={handleCashbackApply}
              />
            ))}
          </YStack>
        </YStack>

        <Separator my="$md" />
      </YStack>
    </ScreenContainer>
  );
}
