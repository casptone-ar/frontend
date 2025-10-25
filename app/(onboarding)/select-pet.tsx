// app/(onboarding)/select-pet.tsx
import { useNestedPagerView } from "@/View/hooks/useNestedPagerView";
import { ArrowRight } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import type PagerView from "react-native-pager-view";
import { Image, View, XStack, YStack, styled } from "tamagui";
import { useStore } from "zustand";

// 코어 컴포넌트
import { Button } from "@/View/core/Button/Button";
import { Card } from "@/View/core/Card/Card";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { Input } from "@/View/core/Input/Input";

// Stores (vanilla store이므로 selector로 구독)
import { petStore } from "@/View/store/petStore";

// (선택) 공통 토스트 유틸이 있으면 사용하세요.
// import { showToast } from "@/utils/toast";

type PetOption = {
  /** 서버 마스터 ID: createPet(pet_master_id)에 전달 */
  masterId: number;
  id: string; // 카드 key
  name: string;
  description: string;
  image: string;
  initialStats?: {
    health: number;
    happiness: number;
    experience: number;
    level: number;
  };
};

const PAGES_AMOUNT = 2;
const { width: windowWidth } = Dimensions.get("window");

// TODO: API 준비되면 서버에서 가져오도록 교체 (예: GET /pet-masters)
const MOCK_PET_OPTIONS: PetOption[] = [
  {
    masterId: 1,
    id: "pet1",
    name: "댕댕이",
    description:
      "활기차고 충성스러운 강아지입니다. 함께 산책하는 것을 좋아해요!",
    image: "https://via.placeholder.com/150/FFDDC1/000000?Text=Dog",
    initialStats: { health: 100, happiness: 80, experience: 0, level: 1 },
  },
  {
    masterId: 2,
    id: "pet2",
    name: "냥냥이",
    description: "도도하지만 애교 많은 고양이입니다. 조용히 쉬는 것을 즐겨요.",
    image: "https://via.placeholder.com/150/D1E8FF/000000?Text=Cat",
    initialStats: { health: 90, happiness: 90, experience: 0, level: 1 },
  },
  {
    masterId: 3,
    id: "pet3",
    name: "햄찌",
    description: "작고 귀여운 햄스터입니다. 쳇바퀴 돌리는 것을 좋아해요.",
    image: "https://via.placeholder.com/150/E0F8E0/000000?Text=Hamster",
    initialStats: { health: 70, happiness: 70, experience: 0, level: 1 },
  },
];

const PageIndicatorDot = styled(View, {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "$color5",
  marginHorizontal: 4,
  variants: {
    active: {
      true: {
        backgroundColor: "$accent1",
        width: 10,
        height: 10,
        borderRadius: 5,
      },
    },
  } as const,
});

export default function OnboardingScreen() {
  const router = useRouter();
  const pagerViewRef = useRef<PagerView>(null);
  const { activePage, isLastPage, proceedToNext, AnimatedPagerView, ...rest } =
    useNestedPagerView({ pagesAmount: PAGES_AMOUNT });

  // ✅ vanilla store를 selector로 개별 구독
  const createPet = useStore(petStore, (s) => s.createPet);
  const fetchActivePet = useStore(petStore, (s) => s.fetchActivePet);
  const petLoading = useStore(petStore, (s) => s.isLoading);

  const [petOptions, setPetOptions] = useState<PetOption[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetOption | null>(null);
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Mock → 나중에 서버에서 주는 목록으로 교체
  useEffect(() => {
    setPetOptions(MOCK_PET_OPTIONS);
  }, []);

  // 펫 선택 시 기본 닉네임 제안
  useEffect(() => {
    if (selectedPet && !nickname) setNickname(selectedPet.name);
  }, [selectedPet, nickname]);

  const handleSelectPet = (pet: PetOption) => setSelectedPet(pet);

  const handlePrimaryAction = async () => {
    if (!isLastPage) {
      proceedToNext();
      return;
    }

    // 마지막 페이지(펫 선택 완료)
    if (!selectedPet) {
      // showToast?.("펫을 선택해주세요!");
      console.warn("펫을 선택해주세요!");
      return;
    }
    if (!nickname.trim()) {
      // showToast?.("닉네임을 입력해주세요!");
      console.warn("닉네임을 입력해주세요!");
      return;
    }

    try {
      setSubmitting(true);
      await createPet(selectedPet.masterId, nickname.trim()); // POST /pets
      await fetchActivePet(); // GET /pets/me/active
      router.replace("/(protected)/home");
    } catch (e: any) {
      // showToast?.(e?.message ?? "펫 생성 실패");
      console.warn("펫 생성 실패:", e?.message ?? e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.replace("/(protected)/home");
  };

  const WelcomePage = useMemo(
    () => (
      <YStack key={1} flex={1} jc="space-between" p="$lg">
        <YStack space="$3" mt="$8">
          <Text type="h1" fontFamily="$heading" fontWeight="$bold">
            Discover the world
          </Text>
          <Text type="bodyLarge" colorVariant="secondary">
            Remember that happiness is a way of travel, not a destination.
          </Text>
        </YStack>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1531306728353-ba6010f04783?q=80&w=1974&auto=format&fit=crop",
          }}
          width={windowWidth * 0.8}
          height={windowWidth * 0.8 * 1.2}
          alignSelf="center"
          borderRadius="$xl"
          mb="$8"
        />
      </YStack>
    ),
    []
  );

  const PetSelectionPage = useMemo(
    () => (
      <YStack key={2} flex={1} p="$lg" space="$5">
        <YStack space="$3" mt="$8">
          <Text type="h1" fontFamily="$heading" fontWeight="$bold">
            Choose your{"\n"}Pet
          </Text>
          <Text type="bodyLarge" colorVariant="secondary">
            Choose your pet and start your journey.
          </Text>
        </YStack>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack space="$md" p="$xs">
            {petOptions.map((pet) => {
              const active = selectedPet?.id === pet.id;
              return (
                <Card
                  key={pet.id}
                  width={200}
                  onPress={() => handleSelectPet(pet)}
                  pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  backgroundColor={active ? "$accent1" : "$background2"}
                  borderColor={active ? "$accent2" : "$border1"}
                  borderWidth={active ? 2 : 1}
                  animation="medium"
                  accessibilityRole="button"
                  accessibilityLabel={`${pet.name} 선택`}
                >
                  <YStack space="$sm" ai="center">
                    <Image
                      h={"65%"}
                      source={{ uri: pet.image, width: 100, height: 100 }}
                      borderRadius="$md"
                    />
                    <YStack mt={"auto"} gap="$2" ai="flex-start">
                      <Text type="h4" color={active ? "$color1" : "$text1"}>
                        {pet.name}
                      </Text>
                      <Text
                        type="caption"
                        numberOfLines={2}
                        textAlign="left"
                        color={active ? "$color2" : "$text3"}
                      >
                        {pet.description}
                      </Text>
                    </YStack>
                  </YStack>
                </Card>
              );
            })}
          </XStack>
        </ScrollView>

        {/* 선택 요약 + 닉네임 입력 */}
        {selectedPet && (
          <YStack space="$3">
            <Card variant="outlined" p="$md" size="sm">
              <YStack space="$xs">
                <Text type="bodyLarge" fontWeight="$semibold">
                  {selectedPet.name}
                </Text>
                {selectedPet.initialStats && (
                  <Text type="bodySmall" colorVariant="tertiary">
                    레벨: {selectedPet.initialStats.level}, 체력:{" "}
                    {selectedPet.initialStats.health}
                  </Text>
                )}
              </YStack>
            </Card>

            <Input
              label="펫 닉네임"
              placeholder={`${selectedPet.name}의 이름을 지어주세요`}
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
            />
          </YStack>
        )}
      </YStack>
    ),
    [petOptions, selectedPet, nickname]
  );

  const globalLoading = submitting || petLoading;

  return (
    <ScreenContainer scrollable={false}>
      <AnimatedPagerView
        style={{ flex: 1 }}
        initialPage={0}
        {...rest}
        ref={pagerViewRef as any}
      >
        {WelcomePage}
        {PetSelectionPage}
      </AnimatedPagerView>

      {/* 하단 컨트롤 */}
      <YStack p="$lg" borderTopWidth={1} borderTopColor="$border1" space="$md">
        <XStack jc="center" ai="center" mb="$sm">
          {Array.from({ length: PAGES_AMOUNT }).map((_, index) => (
            <PageIndicatorDot
              key={`dot-${index}`}
              active={activePage === index}
            />
          ))}
        </XStack>

        <Button
          variant="primary"
          size="lg"
          onPress={handlePrimaryAction}
          loading={globalLoading && isLastPage}
          disabled={
            (isLastPage && (!selectedPet || !nickname.trim())) ||
            (globalLoading && isLastPage)
          }
          iconAfter={!isLastPage ? <ArrowRight /> : undefined}
        >
          {isLastPage ? "Get Started" : "Next"}
        </Button>

        {activePage === 0 && (
          <Button
            variant="ghost"
            size="md"
            onPress={handleSkip}
            mt="$xs"
            disabled={globalLoading}
          >
            Skip for now
          </Button>
        )}
      </YStack>
    </ScreenContainer>
  );
}
