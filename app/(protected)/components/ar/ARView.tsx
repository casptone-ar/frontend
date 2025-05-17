import type { PetAnimationType } from "@/domain/pet/types";
import { Button, Paragraph, YStack } from "tamagui";

// 실제 AR 라이브러리(예: react-native-vision-camera + three.js, ViroReact, expo-gl + three.js 등) 임포트 필요
// import { SomeARViewLibrary } from 'some-ar-library';

type ARViewProps = {
  petModelUrl: string; // 렌더링할 애완동물 3D 모델 파일의 경로 또는 URL.
  currentAnimation: PetAnimationType; // 현재 재생 중인 애니메이션 이름 (외부에서 제어).
  scale?: number; // AR 공간에서의 애완동물 크기
  onPetAnchorFound?: () => void; // 애완동물을 배치할 적절한 AR 앵커(평면 등)를 찾았을 때 호출.
  onPetPlaced?: () => void; // 애완동물이 AR 공간에 성공적으로 배치되었을 때 호출.
  onPetTapped?: () => void; // AR 뷰에서 애완동물이 터치되었을 때 호출.
  onError?: (error: Error) => void; // AR 관련 오류 발생 시 호출
};

/**
 * AR 카메라 화면에 3D 애완동물 모델을 렌더링하고 관리하는 컴포넌트입니다.
 * 네이티브 AR 기능을 사용하여 현실 공간에 애완동물을 표시합니다.
 * 실제 구현은 선택한 AR 라이브러리(ARKit/ARCore 또는 추상화 라이브러리)에 따라 크게 달라집니다.
 *
 * @remarks
 * 이 컴포넌트는 현재 실제 AR 렌더링 로직 없이 UI 구조만 정의합니다.
 * 실제 AR 기능 구현 시, props를 통해 모델, 애니메이션 등을 제어하고
 * AR 이벤트(앵커 감지, 모델 배치, 터치 등)를 부모로 전달해야 합니다.
 *
 * @param {ARViewProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
export const ARView = ({
  petModelUrl,
  currentAnimation,
  scale = 1,
  onPetAnchorFound,
  onPetPlaced,
  onPetTapped,
  onError,
}: ARViewProps) => {
  // --- 실제 AR 라이브러리 연동 로직 ---
  // useEffect(() => {
  //   // AR 세션 초기화, 모델 로드, 애니메이션 설정 등
  //   // 예: SomeARViewLibrary.loadModel(petModelUrl);
  //   //     SomeARViewLibrary.setAnimation(currentAnimation);
  //   //     SomeARViewLibrary.setScale(scale);

  //   // 이벤트 리스너 설정
  //   // const anchorListener = SomeARViewLibrary.on('anchorFound', onPetAnchorFound);
  //   // const placedListener = SomeARViewLibrary.on('modelPlaced', onPetPlaced);
  //   // const tapListener = SomeARViewLibrary.on('modelTapped', onPetTapped);
  //   // const errorListener = SomeARViewLibrary.on('error', onError);

  //   // return () => {
  //   //   // AR 세션 정리, 리스너 제거
  //   //   anchorListener.remove();
  //   //   placedListener.remove();
  //   //   tapListener.remove();
  //   //   errorListener.remove();
  //   //   SomeARViewLibrary.dispose();
  //   // };
  // }, [petModelUrl, onPetAnchorFound, onPetPlaced, onPetTapped, onError, scale]);

  // useEffect(() => {
  //   // 애니메이션 변경 시 AR 라이브러리에 반영
  //   // SomeARViewLibrary.setAnimation(currentAnimation);
  // }, [currentAnimation]);
  // --- END 실제 AR 라이브러리 연동 로직 ---

  // 현재는 플레이스홀더 UI를 반환합니다.
  // 실제 AR 라이브러리의 View 컴포넌트가 여기에 위치하게 됩니다.
  return (
    <YStack f={1} bc="$backgroundStrong" jc="center" ai="center" elevation="$1">
      {/* <SomeARViewLibrary.View style={{ flex: 1, width: '100%' }} /> */}
      <Paragraph ta="center" p="$4" color="$color10">
        AR 카메라 뷰 영역입니다.
        {"\n"}
        모델: {petModelUrl}
        {"\n"}
        애니메이션: {currentAnimation}
        {"\n"}
        크기: {scale}
        {"\n"}
        (실제 AR 라이브러리 연동 필요)
      </Paragraph>
      {/* 개발/디버깅용 임시 버튼 */}
      <YStack position="absolute" bottom="$4" left="$4" space>
        {onPetAnchorFound && (
          <Button size="$2" onPress={onPetAnchorFound}>
            (임시) 앵커 찾음
          </Button>
        )}
        {onPetPlaced && (
          <Button size="$2" onPress={onPetPlaced}>
            (임시) 펫 배치됨
          </Button>
        )}
        {onPetTapped && (
          <Button size="$2" onPress={onPetTapped}>
            (임시) 펫 터치
          </Button>
        )}
        {onError && (
          <Button
            size="$2"
            onPress={() => onError(new Error("임의 AR 오류 발생"))}
          >
            (임시) 오류 발생
          </Button>
        )}
      </YStack>
    </YStack>
  );
};
