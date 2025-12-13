import React, { useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Text,
  Platform,
  Dimensions,
} from "react-native";
import { ViroARSceneNavigator } from "@reactvision/react-viro";
import { DrivingCarScene } from "./scenes/DrivingCarScene";

// =====================================================
// 설정
// =====================================================
const JOYSTICK_WIDTH = 200;

const paddingTop = 45;
const paddingBottom = 25;

// =====================================================
// 타입 정의
// =====================================================
interface DrivingCarControllerProps {
  onExit?: () => void;
}

// =====================================================
// 메인 컴포넌트
// =====================================================
export const DrivingCarController: React.FC<DrivingCarControllerProps> = ({
  onExit,
}) => {
  // =====================================================
  // State
  // =====================================================
  const [showInstructions, setShowInstructions] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isOverPlane, setIsOverPlane] = useState(false);
  const [shouldResetCar, setShouldResetCar] = useState(false);

  // 조작 상태
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(false);
  const [up, setUp] = useState(false);
  const [down, setDown] = useState(false);
  const [leftRightRatio, setLeftRightRatio] = useState(0);

  // 애니메이션
  const instructionOpacity = useRef(new Animated.Value(1)).current;
  const carControlsOpacity = useRef(new Animated.Value(0)).current;

  // =====================================================
  // 핸들러
  // =====================================================

  // 평면 위 상태 설정 (AR 씬에서 호출)
  const handleSetIsOverPlane = useCallback(
    (isOver: boolean) => {
      if (isOverPlane !== isOver) {
        setIsOverPlane(isOver);
      }
    },
    [isOverPlane]
  );

  // 준비 완료 (Place 버튼)
  const handleReady = useCallback(() => {
    if (!isOverPlane) return;

    Animated.timing(instructionOpacity, {
      toValue: 0,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      setShowInstructions(false);
      setIsReady(true);
    });

    setTimeout(() => {
      Animated.timing(carControlsOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }, 1000);
  }, [isOverPlane, instructionOpacity, carControlsOpacity]);

  // 차량 리셋
  const handleResetCar = useCallback(() => {
    setShouldResetCar(true);
    setTimeout(() => setShouldResetCar(false), 1000);
  }, []);

  // 페달 버튼 핸들러
  const handlePressDown = useCallback(
    (key: "up" | "down") => () => {
      if (key === "up") setUp(true);
      else setDown(true);
    },
    []
  );

  const handlePressUp = useCallback(
    (key: "up" | "down") => () => {
      if (key === "up") setUp(false);
      else setDown(false);
    },
    []
  );

  // =====================================================
  // 조이스틱 핸들러
  // =====================================================
  const setJoystickProps = useCallback(
    (locationX: number, pageX: number) => {
      let leftValue = false;
      let rightValue = false;
      let ratio = 0;
      const halfWidth = JOYSTICK_WIDTH / 2;

      if (Platform.OS === "android") {
        if (locationX !== pageX) {
          if (locationX <= halfWidth) {
            leftValue = true;
            ratio = (halfWidth - locationX) / halfWidth;
          } else {
            rightValue = true;
            ratio = (halfWidth - JOYSTICK_WIDTH + locationX) / halfWidth;
          }
        } else {
          ratio = 1;
          leftValue = left;
          rightValue = right;
        }
      } else {
        if (locationX <= 0 || locationX >= JOYSTICK_WIDTH) {
          ratio = 1;
          leftValue = left;
          rightValue = right;
        } else {
          if (locationX <= halfWidth) {
            leftValue = true;
            ratio = (halfWidth - locationX) / halfWidth;
          } else {
            rightValue = true;
            ratio = (halfWidth - JOYSTICK_WIDTH + locationX) / halfWidth;
          }
        }
      }

      setLeft(leftValue);
      setRight(rightValue);
      setLeftRightRatio(Math.max(Math.min(ratio, 1), 0));
    },
    [left, right]
  );

  const handleJoystickStart = useCallback(
    (evt: any) => {
      setJoystickProps(evt.nativeEvent.locationX, evt.nativeEvent.pageX);
    },
    [setJoystickProps]
  );

  const handleJoystickMove = useCallback(
    (evt: any) => {
      setJoystickProps(evt.nativeEvent.locationX, evt.nativeEvent.pageX);
    },
    [setJoystickProps]
  );

  const handleJoystickEnd = useCallback(() => {
    setLeft(false);
    setRight(false);
    setLeftRightRatio(0);
  }, []);

  // =====================================================
  // 렌더링
  // =====================================================

  // ViroAR에 전달할 props
  const viroAppProps = {
    direction: (left ? 1 : 0) + (up ? 2 : 0) + (right ? 4 : 0) + (down ? 8 : 0),
    leftRightRatio,
    shouldResetCar,
    isReady,
    setIsOverPlane: handleSetIsOverPlane,
  };

  // 조이스틱 회전
  const rotation = `${left ? "-" : ""}${Math.round(leftRightRatio * 90)}deg`;

  return (
    <View style={styles.container}>
      {/* AR Scene */}
      <ViroARSceneNavigator
        initialScene={{
          scene: DrivingCarScene,
        }}
        viroAppProps={viroAppProps}
        style={styles.arView}
      />

      {/* 조작 컨트롤 */}
      <Animated.View
        style={[styles.controlsContainer, { opacity: carControlsOpacity }]}
      >
        {/* 조이스틱 (스티어링 휠) */}
        <View style={styles.joystickContainer}>
          <Image
            style={[
              styles.joystickImage,
              { transform: [{ rotate: rotation }] },
            ]}
            source={require("../../../assets/res/steering_wheel.png")}
          />
          <View
            style={styles.joystickTouchArea}
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
          />
        </View>

        {/* 페달 */}
        <View style={styles.pedalsContainer}>
          {/* 후진 페달 */}
          <View style={styles.pedalButton}>
            <Image
              style={[styles.pedalImage, { opacity: down ? 0 : 1 }]}
              source={require("../../../assets/res/pedal_reverse.png")}
            />
            <Image
              style={[
                styles.pedalImage,
                styles.pedalImagePressed,
                { opacity: down ? 1 : 0 },
              ]}
              source={require("../../../assets/res/pedal_reverse_press.png")}
            />
            <View
              style={styles.pedalTouchArea}
              onTouchStart={handlePressDown("down")}
              onTouchEnd={handlePressUp("down")}
            />
          </View>

          {/* 가속 페달 */}
          <View style={styles.pedalButton}>
            <Image
              style={[styles.pedalImage, { opacity: up ? 0 : 1 }]}
              source={require("../../../assets/res/pedal_accel.png")}
            />
            <Image
              style={[
                styles.pedalImage,
                styles.pedalImagePressed,
                { opacity: up ? 1 : 0 },
              ]}
              source={require("../../../assets/res/pedal_accel_press.png")}
            />
            <View
              style={styles.pedalTouchArea}
              onTouchStart={handlePressDown("up")}
              onTouchEnd={handlePressUp("up")}
            />
          </View>
        </View>

        {/* 리셋 버튼 */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetCar}
          activeOpacity={0.6}
        >
          <Image
            style={styles.resetImage}
            source={require("../../../assets/res/icon_refresh.png")}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* 안내 UI */}
      {showInstructions && (
        <>
          {/* 상단 안내 */}
          <Animated.View
            style={[styles.instructionHeader, { opacity: instructionOpacity }]}
          >
            <Text style={styles.instructionText}>
              바닥을 스캔하고 Place를 탭하세요
            </Text>
          </Animated.View>

          {/* 하단 Place 버튼 */}
          <Animated.View
            style={[styles.readyContainer, { opacity: instructionOpacity }]}
          >
            <Text style={styles.statusText}>
              {isOverPlane ? " " : "바닥을 찾는 중..."}
            </Text>
            <TouchableOpacity
              style={[styles.placeButton, { opacity: isOverPlane ? 1 : 0.5 }]}
              onPress={handleReady}
              disabled={!isOverPlane}
              activeOpacity={0.6}
            >
              <Text style={styles.placeButtonText}>Place</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

      {/* 나가기 버튼 */}
      {onExit && (
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Image
            style={styles.exitImage}
            source={require("../../../assets/res/mi_app_btn_back.png")}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// =====================================================
// 스타일
// =====================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  controlsContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  // 조이스틱
  joystickContainer: {
    position: "absolute",
    height: 130,
    width: JOYSTICK_WIDTH,
    bottom: 10 + paddingBottom,
    left: 10,
  },
  joystickImage: {
    height: 130,
    width: JOYSTICK_WIDTH,
    resizeMode: "contain",
  },
  joystickTouchArea: {
    position: "absolute",
    height: 130,
    width: JOYSTICK_WIDTH,
    backgroundColor: "transparent",
  },

  // 페달
  pedalsContainer: {
    position: "absolute",
    flexDirection: "row",
    bottom: 25 + paddingBottom,
    right: 10,
    width: 150,
    justifyContent: "space-between",
    alignItems: "center",
  },
  pedalButton: {
    height: 70,
    width: 70,
    margin: 5,
  },
  pedalImage: {
    position: "absolute",
    height: 70,
    width: 70,
  },
  pedalImagePressed: {
    position: "absolute",
  },
  pedalTouchArea: {
    position: "absolute",
    height: 70,
    width: 70,
    backgroundColor: "transparent",
  },

  // 리셋 버튼
  resetButton: {
    position: "absolute",
    width: 30,
    height: 30,
    right: 15,
    top: 24 + paddingTop,
  },
  resetImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  // 안내 UI
  instructionHeader: {
    position: "absolute",
    backgroundColor: "#000000B3",
    width: "100%",
    height: 80 + paddingTop,
    top: 0,
    left: 0,
    paddingTop,
    justifyContent: "center",
  },
  instructionText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  readyContainer: {
    position: "absolute",
    height: 170,
    width: "100%",
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  placeButton: {
    height: 60,
    width: 130,
    backgroundColor: "#292930B3",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  placeButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  // 나가기 버튼
  exitButton: {
    position: "absolute",
    paddingLeft: 15,
    paddingTop: 27 + paddingTop,
  },
  exitImage: {
    height: 21,
    width: 21,
    resizeMode: "stretch",
  },
});
