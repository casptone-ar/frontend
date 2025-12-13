import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { StyleSheet } from "react-native";
import {
  ViroARScene,
  ViroNode,
  Viro3DObject,
  ViroAmbientLight,
  ViroQuad,
  ViroImage,
  ViroText,
  ViroMaterials,
  ViroARPlaneSelector,
} from "@reactvision/react-viro";

// =====================================================
// 자동차 물리 시뮬레이션 설정
// =====================================================
const CAR_CONFIG = {
  SCALE: 0.1,
  MAX_SPEED: 0.019,
  DRIVING_ACCELERATION: 0.008,
  REVERSE_ACCELERATION: 0.017,
  FRICTION: 0.003,
  INTERVAL_TIME: 16,
  DISTANCE_TO_FULL_TURN: 0.04,
  WHEEL_CIRCUMFERENCE: 0.1,
  MAX_LEAN_ROTATION: 10,
};

/**
 * AR 노드(ViroText)로 띄우는 디버그/버튼 UI 표시 여부
 * - 앱 UX는 2D 오버레이(React Native View) 중심으로 가므로 기본은 false
 */
const SHOW_AR_NODE_HUD = false;

// 바퀴 위치
const WHEEL_POSITIONS = {
  FRONT_LEFT: [-0.61, 0.363, -1.336] as [number, number, number],
  FRONT_RIGHT: [0.61, 0.363, -1.336] as [number, number, number],
  REAR_LEFT: [-0.61, 0.363, 1.355] as [number, number, number],
  REAR_RIGHT: [0.61, 0.363, 1.355] as [number, number, number],
};

// =====================================================
// 타입 정의
// =====================================================
interface DrivingCarSceneProps {
  sceneNavigator?: {
    viroAppProps?: {
      direction: number;
      leftRightRatio: number;
      shouldResetCar: boolean;
      isReady: boolean;
      setIsOverPlane: (isOver: boolean) => void;
    };
    pop?: () => void;
  };
}

interface CarState {
  position: [number, number, number];
  rotation: [number, number, number];
  leanRotation: number;
  wheelTurnRotation: number;
  wheelDrivingRotation: number;
}

// =====================================================
// ViroMaterials 설정
// =====================================================

// =====================================================
// 메인 컴포넌트
// =====================================================
export const DrivingCarScene: React.FC<DrivingCarSceneProps> = (props) => {
  const { sceneNavigator } = props;
  const viroAppProps = sceneNavigator?.viroAppProps;

  // useLayoutEffect(() => {
  //   ViroMaterials.createMaterials({
  //     dropShadow: {
  //       diffuseTexture: require("../../../../assets/res/car_shadow.png"),
  //       lightingModel: "Constant",
  //       blendMode: "Subtract",
  //     },
  //   });
  // }, []);

  // =====================================================
  // State
  // =====================================================
  const [planeSelected, setPlaneSelected] = useState(false);
  const [statusText, setStatusText] = useState("바닥을 탭하여 차량 배치");

  // 선택된 평면의 월드 위치 (차량 배치 기준점)
  const [planeWorldPosition, setPlaneWorldPosition] = useState<
    [number, number, number]
  >([0, 0, 0]);

  // 차량 상태 (렌더링용) - planeWorldPosition 기준 상대 위치
  const [carState, setCarState] = useState<CarState>({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    leanRotation: 0,
    wheelTurnRotation: 0,
    wheelDrivingRotation: 0,
  });

  // =====================================================
  // Refs (물리 시뮬레이션용 - 렌더링과 분리)
  // =====================================================
  const physicsRef = useRef({
    acceleration: 0,
    velocity: 0,
    position: [0, 0, 0] as [number, number, number],
    direction: [0, 0, -1] as [number, number, number],
    rotationRad: 0,
    leanRotation: 0,
    wheelTurnRotation: 0,
    wheelDrivingRotation: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const planeSelectedRef = useRef(false);

  // =====================================================
  // 물리 시뮬레이션
  // =====================================================
  const computePhysics = useCallback(() => {
    if (!planeSelectedRef.current) return;

    const direction = viroAppProps?.direction ?? 0;
    const leftRightRatio = viroAppProps?.leftRightRatio ?? 0;
    const physics = physicsRef.current;
    const {
      MAX_SPEED,
      DRIVING_ACCELERATION,
      REVERSE_ACCELERATION,
      FRICTION,
      INTERVAL_TIME,
      DISTANCE_TO_FULL_TURN,
      WHEEL_CIRCUMFERENCE,
      MAX_LEAN_ROTATION,
    } = CAR_CONFIG;

    // 가속도 계산
    if ((direction & 2) > 0) {
      // Forward
      physics.acceleration =
        physics.velocity < 0 ? REVERSE_ACCELERATION : DRIVING_ACCELERATION;
    } else if ((direction & 8) > 0) {
      // Reverse
      physics.acceleration =
        physics.velocity > 0 ? -REVERSE_ACCELERATION : -DRIVING_ACCELERATION;
    } else {
      physics.acceleration =
        physics.velocity > 0 ? -FRICTION : physics.velocity < 0 ? FRICTION : 0;
    }

    // 속도 계산
    const newVelocity =
      physics.velocity + physics.acceleration * (INTERVAL_TIME / 1000);
    if (physics.acceleration === -FRICTION || physics.acceleration === 0) {
      physics.velocity = Math.max(newVelocity, 0);
    } else if (physics.acceleration === FRICTION) {
      physics.velocity = Math.min(newVelocity, 0);
    } else {
      physics.velocity = Math.max(Math.min(newVelocity, MAX_SPEED), -MAX_SPEED);
    }

    // 회전 계산
    let desiredLeanRotation = 0;
    if ((direction & 5) > 0 && physics.velocity !== 0) {
      let additionalRotation = 0;

      if ((direction & 1) > 0) {
        // Left
        additionalRotation =
          -(
            ((physics.velocity * (INTERVAL_TIME / 1000)) /
              DISTANCE_TO_FULL_TURN) *
            leftRightRatio
          ) *
          2 *
          Math.PI;
        physics.wheelTurnRotation = leftRightRatio * 60;
        desiredLeanRotation =
          -MAX_LEAN_ROTATION * Math.abs(physics.velocity / MAX_SPEED);
      } else if ((direction & 4) > 0) {
        // Right
        additionalRotation =
          ((physics.velocity * (INTERVAL_TIME / 1000)) /
            DISTANCE_TO_FULL_TURN) *
          leftRightRatio *
          2 *
          Math.PI;
        physics.wheelTurnRotation = leftRightRatio * -60;
        desiredLeanRotation =
          MAX_LEAN_ROTATION * Math.abs(physics.velocity / MAX_SPEED);
      }

      // 방향 벡터 회전
      physics.direction = [
        Math.cos(additionalRotation) * physics.direction[0] -
          Math.sin(additionalRotation) * physics.direction[2],
        0,
        Math.sin(additionalRotation) * physics.direction[0] +
          Math.cos(additionalRotation) * physics.direction[2],
      ];
      physics.rotationRad -= additionalRotation;
    } else {
      physics.wheelTurnRotation = 0;
    }

    // 기울기 스무딩
    if (physics.leanRotation !== desiredLeanRotation) {
      physics.leanRotation +=
        desiredLeanRotation > physics.leanRotation ? 0.5 : -0.5;
    }

    // 위치 업데이트
    if (physics.velocity !== 0) {
      const dx = physics.direction[0] * physics.velocity;
      const dy = physics.direction[1] * physics.velocity;
      const dz = physics.direction[2] * physics.velocity;

      physics.position = [
        physics.position[0] + dx,
        physics.position[1] + dy,
        physics.position[2] + dz,
      ];

      // 바퀴 회전
      const totalDistance = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
      let driveRotation = (-totalDistance / WHEEL_CIRCUMFERENCE) * 360;
      if (physics.velocity < 0) driveRotation = -driveRotation;
      physics.wheelDrivingRotation =
        (physics.wheelDrivingRotation + driveRotation) % 360;
    }

    // State 업데이트 (렌더링 트리거)
    setCarState({
      position: [...physics.position] as [number, number, number],
      rotation: [0, (physics.rotationRad * 180) / Math.PI, 0],
      leanRotation: physics.leanRotation,
      wheelTurnRotation: physics.wheelTurnRotation,
      wheelDrivingRotation: physics.wheelDrivingRotation,
    });
  }, [viroAppProps?.direction, viroAppProps?.leftRightRatio]);

  // 차량 리셋
  const resetCar = useCallback(() => {
    physicsRef.current = {
      acceleration: 0,
      velocity: 0,
      position: [0, 0, 0],
      direction: [0, 0, -1],
      rotationRad: 0,
      leanRotation: 0,
      wheelTurnRotation: 0,
      wheelDrivingRotation: 0,
    };
    setCarState({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      leanRotation: 0,
      wheelTurnRotation: 0,
      wheelDrivingRotation: 0,
    });
    setStatusText("차량 리셋됨");
  }, []);

  // =====================================================
  // Effects
  // =====================================================

  // 물리 시뮬레이션 타이머
  useEffect(() => {
    if (planeSelected) {
      timerRef.current = setInterval(computePhysics, CAR_CONFIG.INTERVAL_TIME);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [planeSelected, computePhysics]);

  // 리셋 감지
  useEffect(() => {
    if (viroAppProps?.shouldResetCar) {
      resetCar();
    }
  }, [viroAppProps?.shouldResetCar, resetCar]);

  // =====================================================
  // 이벤트 핸들러
  // =====================================================
  const onPlaneSelected = useCallback(
    (anchorMap: any) => {
      console.log("✅ Plane selected:", anchorMap);

      // anchorMap에서 평면의 월드 위치 추출
      // position 또는 center를 사용 (ViroARPlaneSelector에서 제공)
      const planePos = anchorMap?.position || anchorMap?.center || [0, 0, 0];
      console.log("📍 Plane position:", planePos);

      setPlaneWorldPosition(planePos as [number, number, number]);
      setPlaneSelected(true);
      planeSelectedRef.current = true;
      setStatusText("Driving...");
      viroAppProps?.setIsOverPlane?.(true);
    },
    [viroAppProps]
  );

  const goBack = useCallback(() => {
    sceneNavigator?.pop?.();
  }, [sceneNavigator]);

  const handleManualReset = useCallback(() => {
    resetCar();
  }, [resetCar]);

  // =====================================================
  // 렌더링
  // =====================================================
  const scale = CAR_CONFIG.SCALE;

  // 바퀴 컴포넌트
  const renderWheel = (
    position: [number, number, number],
    isLeft: boolean,
    isFront: boolean
  ) => {
    const turnRotation = isFront
      ? [0, carState.wheelTurnRotation, 0]
      : [0, 0, 0];
    const driveRotation = [carState.wheelDrivingRotation, 0, 0];
    const baseRotation = isLeft ? [0, 180, 0] : [0, 0, 0];

    return (
      <ViroNode
        position={position}
        rotation={turnRotation as [number, number, number]}
      >
        <ViroNode rotation={driveRotation as [number, number, number]}>
          <Viro3DObject
            source={require("../../../../assets/res/car_wheels.vrx")}
            type="VRX"
            rotation={baseRotation as [number, number, number]}
            resources={[
              require("../../../../assets/res/wheels_Base_Color.jpg"),
              require("../../../../assets/res/wheels_Metallic.jpg"),
              require("../../../../assets/res/wheels_Roughness.jpg"),
              require("../../../../assets/res/wheels_Normal_OpenGL.jpg"),
            ]}
          />
        </ViroNode>
      </ViroNode>
    );
  };

  // 자동차 모델 - planeWorldPosition을 기준으로 carState.position만큼 이동
  const renderCarModel = () => {
    // 평면 위치 + 차량 상대 위치
    const worldPosition: [number, number, number] = [
      planeWorldPosition[0] + carState.position[0],
      planeWorldPosition[1] + carState.position[1],
      planeWorldPosition[2] + carState.position[2],
    ];

    return (
      <ViroNode position={worldPosition} rotation={carState.rotation}>
        <ViroNode scale={[scale, scale, scale]}>
          {/* 그림자 */}
          <ViroQuad
            width={5.691}
            height={5.691}
            materials={["dropShadow"]}
            rotation={[-90, 0, 0]}
          />

          {/* 차체 (기울기 적용) */}
          <ViroNode rotation={[0, 0, carState.leanRotation]}>
            <Viro3DObject
              source={require("../../../../assets/res/car_body.vrx")}
              type="VRX"
              resources={[
                require("../../../../assets/res/bumblebee_Base_Color.png"),
                require("../../../../assets/res/bumblebee_Metallic.jpg"),
                require("../../../../assets/res/bumblebee_Roughness.jpg"),
                require("../../../../assets/res/bumblebee_Normal_OpenGL.jpg"),
              ]}
            />
          </ViroNode>

          {/* 바퀴들 */}
          {renderWheel(WHEEL_POSITIONS.FRONT_LEFT, true, true)}
          {renderWheel(WHEEL_POSITIONS.FRONT_RIGHT, false, true)}
          {renderWheel(WHEEL_POSITIONS.REAR_LEFT, true, false)}
          {renderWheel(WHEEL_POSITIONS.REAR_RIGHT, false, false)}
        </ViroNode>
      </ViroNode>
    );
  };

  return (
    <ViroARScene>
      <ViroAmbientLight color="#f5f8e0" intensity={200} />

      {/* (권장) AR 노드(ViroText) UI는 UX를 흐려서 기본 비활성화 */}
      {SHOW_AR_NODE_HUD ? (
        <>
          {/* 상단 버튼들 */}
          <ViroText
            text="← Back"
            scale={[0.2, 0.2, 0.2]}
            position={[-0.4, 0.5, -1]}
            style={styles.buttonStyle}
            onClick={goBack}
          />
          <ViroText
            text="Reset"
            scale={[0.2, 0.2, 0.2]}
            position={[0.4, 0.5, -1]}
            style={styles.buttonStyle}
            onClick={handleManualReset}
          />

          {/* 상태 텍스트 */}
          <ViroText
            text={statusText}
            scale={[0.15, 0.15, 0.15]}
            position={[0, 0.35, -1]}
            style={styles.statusStyle}
          />
        </>
      ) : null}

      {/* 평면 선택 전: 안내 + 평면 선택기 */}
      {!planeSelected && (
        <>
          {SHOW_AR_NODE_HUD ? (
            <ViroText
              text="Tap the floor to select a plane"
              scale={[0.3, 0.3, 0.3]}
              position={[0, 0.1, -2]}
              style={styles.textStyle}
            />
          ) : null}
          <ViroARPlaneSelector
            minHeight={0.2}
            minWidth={0.2}
            onPlaneSelected={onPlaneSelected}
          >
            {/* 미리보기 차량 */}
            <ViroNode scale={[scale, scale, scale]} opacity={0.7}>
              <Viro3DObject
                source={require("../../../../assets/res/car_body.vrx")}
                type="VRX"
                resources={[
                  require("../../../../assets/res/bumblebee_Base_Color.png"),
                  require("../../../../assets/res/bumblebee_Metallic.jpg"),
                  require("../../../../assets/res/bumblebee_Roughness.jpg"),
                  require("../../../../assets/res/bumblebee_Normal_OpenGL.jpg"),
                ]}
              />
            </ViroNode>
          </ViroARPlaneSelector>
        </>
      )}

      {/* 평면 선택 후: 운전 가능한 차량 */}
      {planeSelected && renderCarModel()}

      {SHOW_AR_NODE_HUD ? (
        <>
          {/* 디버그 정보 */}
          <ViroText
            text={`Speed: ${(physicsRef.current.velocity * 1000).toFixed(
              1
            )} mm/s`}
            scale={[0.1, 0.1, 0.1]}
            position={[0, -0.1, -1]}
            style={styles.debugStyle}
          />
          <ViroText
            text={`Plane: [${planeWorldPosition
              .map((v) => v.toFixed(2))
              .join(", ")}]`}
            scale={[0.08, 0.08, 0.08]}
            position={[0, -0.18, -1]}
            style={styles.debugStyle}
          />
          <ViroText
            text={`Relative: [${carState.position
              .map((v) => v.toFixed(2))
              .join(", ")}]`}
            scale={[0.08, 0.08, 0.08]}
            position={[0, -0.26, -1]}
            style={styles.debugStyle}
          />
        </>
      ) : null}
    </ViroARScene>
  );
};

// =====================================================
// 스타일
// =====================================================
const styles = StyleSheet.create({
  textStyle: {
    fontFamily: "Arial",
    fontSize: 28,
    color: "#ffffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
  buttonStyle: {
    fontFamily: "Arial",
    fontSize: 22,
    color: "#00ffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
  statusStyle: {
    fontFamily: "Arial",
    fontSize: 18,
    color: "#ffff00",
    textAlignVertical: "center",
    textAlign: "center",
  },
  debugStyle: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#88ff88",
    textAlignVertical: "center",
    textAlign: "center",
  },
});
