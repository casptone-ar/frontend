import type { Pet, PetARData, PetAnimationType } from "@/domain/pet/types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button, Paragraph, Spinner, YStack } from "tamagui";
import { ARTouchControls } from "./components/ar/ARTouchControls";
import { ARView } from "./components/ar/ARView";

// --- Mock Data & Service ---
// 실제로는 service/application 레이어에서 현재 활성화된 애완동물 정보를 가져옵니다.
const MOCK_ACTIVE_PET: Pet | null = {
  id: "pet001",
  ownerId: "user123",
  name: "장금이",
  description: "요리를 잘하는 댕댕이",
  modelUrl: "models/dog_chef.glb", // 실제 모델 경로로 대체 필요
  thumbnailUrl: "images/dog_chef_thumb.png",
  level: 5,
  experience: 350,
  currentStats: { health: 80, happiness: 90 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  arData: {
    modelUrl: "models/dog_chef.glb", // 실제 모델 경로로 대체 필요
    availableAnimations: ["idle", "walk", "run", "happy_reaction", "dance"],
    currentAnimation: "idle",
    scale: 0.8,
  },
};

const fetchCurrentPetARData = async (): Promise<PetARData | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_ACTIVE_PET?.arData || null);
    }, 300);
  });
};
// --- End Mock Data & Service ---

/**
 * AR 카메라 뷰를 통해 애완동물을 현실 세계에 렌더링하고 상호작용하는 화면입니다.
 * 사용자는 이 화면에서 애완동물의 움직임을 보고, 간단한 터치로 반응을 유도할 수 있습니다.
 *
 * @remarks
 * - AR 기능은 ARKit(iOS) 또는 ARCore(Android)와 연동됩니다. (구현 시 라이브러리 선택)
 * - 애완동물의 3D 모델과 애니메이션은 외부 에셋에서 로드됩니다.
 * - 현재 애완동물 데이터 및 사용 가능한 애니메이션 목록은 상위 상태 관리(예: zustand store)로부터 주입받습니다.
 */
export default function ARScreen() {
  const router = useRouter();
  // const { petId } = useLocalSearchParams<{ petId: string }>(); // 필요하다면 특정 펫 ID를 받을 수 있음

  const [petARData, setPetARData] = useState<PetARData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isARReady, setIsARReady] = useState(false); // AR 세션 및 모델 로딩 완료 여부

  useEffect(() => {
    const loadPetData = async () => {
      setIsLoading(true);
      try {
        // TODO: 실제 application/pet/useCurrentPet.ts 훅 등을 사용하여 현재 펫의 AR 데이터 가져오기
        const data = await fetchCurrentPetARData();
        if (data) {
          setPetARData(data);
        } else {
          Alert.alert("오류", "애완동물 AR 정보를 불러올 수 없습니다.");
          router.back();
        }
      } catch (error) {
        console.error("Failed to load pet AR data:", error);
        Alert.alert("오류", "AR 데이터를 불러오는 중 문제가 발생했습니다.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    loadPetData();
  }, []);

  const handleAnimationChange = (animation: PetAnimationType) => {
    setPetARData((prevData) =>
      prevData ? { ...prevData, currentAnimation: animation } : null
    );
    console.log(`ARScreen: Animation changed to ${animation}`);
    // TODO: ARView에 애니메이션 변경 명령 전달 (ARView 내부에서 처리할 수도 있음)
  };

  const handlePetTapped = () => {
    Alert.alert(
      "펫 터치!",
      `${MOCK_ACTIVE_PET?.name || "펫"}이(가) 반응합니다.`
    );
    // 예시: 특정 반응 애니메이션 실행
    handleAnimationChange("happy_reaction");
    // 일정 시간 후 다시 idle로 돌릴 수 있음
    setTimeout(() => handleAnimationChange("idle"), 2000);
  };

  const handleARExit = () => {
    Alert.alert("AR 종료", "AR 화면을 나갑니다.");
    // TODO: AR 세션 정리 로직 (필요시)
    router.back(); // 또는 다른 적절한 화면으로 이동
  };

  if (isLoading) {
    return (
      <YStack f={1} jc="center" ai="center" space="$2">
        <Spinner />
        <Paragraph>AR 데이터 로딩 중...</Paragraph>
      </YStack>
    );
  }

  if (!petARData) {
    return (
      <YStack f={1} jc="center" ai="center" space="$2">
        <Paragraph>AR 정보를 표시할 수 없습니다.</Paragraph>
        <Button onPress={() => router.back()}>돌아가기</Button>
      </YStack>
    );
  }

  return (
    <YStack f={1} position="relative">
      <ARView
        petModelUrl={petARData.modelUrl}
        currentAnimation={petARData.currentAnimation}
        scale={petARData.scale}
        onPetAnchorFound={() => console.log("ARScreen: Pet anchor found")}
        onPetPlaced={() => {
          console.log("ARScreen: Pet placed in AR");
          setIsARReady(true); // AR 뷰 준비 완료
        }}
        onPetTapped={handlePetTapped}
        // onError={(error) => Alert.alert("AR 오류", error.message)} // 실제 AR 라이브러리 사용 시 오류 처리
      />

      {/* AR View가 준비된 후에 컨트롤 표시 (선택적) */}
      {isARReady && (
        <ARTouchControls
          availableAnimations={petARData.availableAnimations}
          currentAnimation={petARData.currentAnimation}
          onTriggerAnimation={handleAnimationChange}
          onExitAR={handleARExit}
          onPetInteract={() => {
            Alert.alert("상호작용", "펫과 특별한 상호작용!");
            handleAnimationChange("play"); // 예시: 놀기 애니메이션
          }}
        />
      )}

      {!isARReady && !isLoading && (
        // AR 로딩 중이거나 아직 준비 안됐을 때의 UI (ARView 위에 겹쳐서 표시될 수 있음)
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          jc="center"
          ai="center"
          backgroundColor="$backgroundTransparent" // 반투명 배경
          style={{ pointerEvents: "none" }} // 터치 이벤트가 ARView로 전달되도록
        >
          <Spinner />
          <Paragraph>AR 환경을 준비 중입니다...</Paragraph>
        </YStack>
      )}
    </YStack>
  );
}
