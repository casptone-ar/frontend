import { useNestedPagerView } from "@/View/hooks/useNestedPagerView"; // 개선된 훅 사용
import type { PetOption } from "@/domain/pet/types"; // 정의된 펫 옵션 타입
import { ArrowRight } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Dimensions, ScrollView } from "react-native"; // PagerView 사용 시 ScrollView는 페이지 내부에서 사용
import type PagerView from "react-native-pager-view"; // react-native-pager-view 직접 사용
import { Image, View, XStack, YStack, styled } from "tamagui";

// 코어 컴포넌트 임포트
import { Button } from "@/View/core/Button/Button";
import { Card } from "@/View/core/Card/Card";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";

const PAGES_AMOUNT = 2; // 온보딩 페이지 수 (환영 + 펫 선택)
const { width: windowWidth } = Dimensions.get("window");

// --- Mock Data ---
// 초기 PetOption 타입 정의가 id, name, description, image, initialStats를 포함한다고 가정
const MOCK_PET_OPTIONS: PetOption[] = [
  {
    id: "pet1",
    name: "댕댕이",
    description:
      "활기차고 충성스러운 강아지입니다. 함께 산책하는 것을 좋아해요!",
    image: "https://via.placeholder.com/150/FFDDC1/000000?Text=Dog", // Placeholder 이미지
    initialStats: { health: 100, happiness: 80, experience: 0, level: 1 },
  },
  {
    id: "pet2",
    name: "냥냥이",
    description: "도도하지만 애교 많은 고양이입니다. 조용히 쉬는 것을 즐겨요.",
    image: "https://via.placeholder.com/150/D1E8FF/000000?Text=Cat", // Placeholder 이미지
    initialStats: { health: 90, happiness: 90, experience: 0, level: 1 },
  },
  {
    id: "pet3",
    name: "햄찌",
    description: "작고 귀여운 햄스터입니다. 쳇바퀴 돌리는 것을 좋아해요.",
    image: "https://via.placeholder.com/150/E0F8E0/000000?Text=Hamster", // Placeholder 이미지
    initialStats: { health: 70, happiness: 70, experience: 0, level: 1 },
  },
];
// --- End Mock Data ---

// 페이지 인디케이터 스타일
const PageIndicatorDot = styled(View, {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "$color5", // 비활성 색상
  marginHorizontal: 4,
  variants: {
    active: {
      true: {
        backgroundColor: "$accent1", // 활성 색상
        width: 10, // 활성 시 약간 크게
        height: 10,
        borderRadius: 5,
      },
    },
  } as const,
});

/**
 * 온보딩 과정 중 애완동물을 선택하는 화면입니다.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const pagerViewRef = useRef<PagerView>(null);
  const {
    activePage,
    setPage,
    progressValue, // 페이지 기반 진행도 (0-100)
    isLastPage,
    proceedToNext, // 다음 페이지로 이동 함수
    AnimatedPagerView,
    ...rest
    // backToPrev, // 이전 페이지/화면으로 이동 함수 (헤더에서 사용 가능)
  } = useNestedPagerView({ pagesAmount: PAGES_AMOUNT });

  const [selectedPet, setSelectedPet] = useState<PetOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPet = (pet: PetOption) => {
    setSelectedPet(pet);
  };

  const handlePrimaryAction = () => {
    if (isLastPage) {
      // 마지막 페이지 (펫 선택) -> 완료 처리
      if (!selectedPet) {
        console.warn("Please select a pet!");
        // TODO: Alert 코어 컴포넌트 사용
        return;
      }
      setIsLoading(true);
      console.log("Onboarding Complete. Selected Pet:", selectedPet.name);
      setTimeout(() => {
        setIsLoading(false);
        router.replace("/(protected)/home");
      }, 1000);
    } else {
      // 다음 페이지로 이동
      proceedToNext();
    }
  };

  const handleSkip = () => {
    router.replace("/(protected)/home"); // 홈으로 바로 이동
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
          }} // 예시 이미지 URL
          width={windowWidth * 0.8}
          height={windowWidth * 0.8 * 1.2} // 비율 유지
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
            {MOCK_PET_OPTIONS.map((pet) => (
              <Card
                key={pet.id}
                width={200}
                onPress={() => handleSelectPet(pet)}
                pressStyle={{ scale: 0.98, opacity: 0.9 }}
                backgroundColor={
                  selectedPet?.id === pet.id ? "$accent1" : "$background2"
                }
                borderColor={
                  selectedPet?.id === pet.id ? "$accent2" : "$border1"
                }
                borderWidth={selectedPet?.id === pet.id ? 2 : 1}
                animation="medium" // Tamagui 애니메이션 키 사용
              >
                <YStack space="$sm" ai="center">
                  <Image
                    h={"65%"}
                    source={{ uri: pet.image, width: 100, height: 100 }}
                    borderRadius="$md"
                  />
                  <YStack mt={"auto"} gap="$2" ai="flex-start">
                    <Text
                      type="h4"
                      color={selectedPet?.id === pet.id ? "$color1" : "$text1"}
                    >
                      {pet.name}
                    </Text>
                    <Text
                      type="caption"
                      numberOfLines={2}
                      textAlign="left"
                      color={selectedPet?.id === pet.id ? "$color2" : "$text3"}
                    >
                      {pet.description}
                    </Text>
                  </YStack>
                </YStack>
              </Card>
            ))}
          </XStack>
        </ScrollView>

        {selectedPet?.initialStats && (
          <Card variant="outlined" p="$md" size="sm">
            <YStack space="$xs">
              <Text type="bodyLarge" fontWeight="$semibold">
                {selectedPet.name}
              </Text>
              <Text type="bodySmall" colorVariant="tertiary">
                레벨: {selectedPet.initialStats.level}, 체력:{" "}
                {selectedPet.initialStats.health}
              </Text>
            </YStack>
          </Card>
        )}
      </YStack>
    ),
    [selectedPet]
  );

  return (
    <ScreenContainer scrollable={false}>
      <AnimatedPagerView style={{ flex: 1 }} initialPage={0} {...rest}>
        {WelcomePage}
        {PetSelectionPage}
      </AnimatedPagerView>

      {/* 하단 컨트롤 영역 */}
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
          loading={isLoading && isLastPage} // 로딩은 마지막 페이지 완료 시에만
          disabled={(isLastPage && !selectedPet) || (isLoading && isLastPage)}
          iconAfter={!isLastPage ? <ArrowRight /> : undefined}
        >
          {isLastPage ? "Get Started" : "Next"}
        </Button>
        {/* 첫 페이지에서는 Skip 버튼을 하단에도 둘 수 있음 */}
        {activePage === 0 && (
          <Button variant="ghost" size="md" onPress={handleSkip} mt="$xs">
            Skip for now
          </Button>
        )}
      </YStack>
    </ScreenContainer>
  );
}
