# Viro AR 드라이빙 카 데모 - React 19 현대화 가이드

## 개요

이 문서는 6년 전에 작성된 Viro AR 드라이빙 카 데모 코드를 React 19 및 TypeScript 기준으로 현대화하여 해석합니다.

**원본 소스**: [ARDrivingCarScene.js](https://github.com/viromedia/viro/blob/master/code-samples/js/ARDrivingCarDemo/ARDrivingCarScene.js)

**주요 현대화 포인트**:
- Class Component → Function Component + Hooks
- JavaScript → TypeScript
- Lifecycle Methods → useEffect
- Refs → useRef
- State Management → useState
- Timer 관리 → useEffect cleanup

---

## 1. 기본 구조 변경

### 원본 (Class Component)

```javascript
export default class ARDrivingCarScene extends Component {
  constructor() {
    super();
    this.state = {
      text: "Initializing AR...",
      refreshFlag: false,
      // ... more state
    };
    
    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
    // ... more bindings
  }
  
  componentDidMount() {
    // initialization logic
  }
  
  componentWillUnmount() {
    if (this && this.timer) {
      clearInterval(this.timer);
    }
  }
  
  render() {
    // render logic
  }
}
```

### 현대화 (Function Component + TypeScript)

```typescript
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';

interface ARDrivingCarSceneProps {
  // navigator props 타입 정의
  arSceneNavigator: {
    viroAppProps: {
      isReady: boolean;
      shouldResetCar: boolean;
      direction: number;
      leftRightRatio: number;
      setIsOverPlane: (value: boolean) => void;
    };
  };
}

const ARDrivingCarScene: FC<ARDrivingCarSceneProps> = ({ arSceneNavigator }) => {
  // State를 개별 useState로 분리
  const [text, setText] = useState("Initializing AR...");
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [modelWorldRotation, setModelWorldRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [displayHitReticle, setDisplayHitReticle] = useState(false);
  const [foundPlane, setFoundPlane] = useState(false);
  const [planeReticleLocation, setPlaneReticleLocation] = useState<[number, number, number]>([0, 0, 0]);
  const [shouldBillboard, setShouldBillboard] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [lastFoundPlaneLocation, setLastFoundPlaneLocation] = useState<[number, number, number]>([0, 0, 0]);
  const [volumeLevel] = useState(0.3);
  const [showCone, setShowCone] = useState(false);
  
  // Refs로 DOM/Component 참조 관리
  const sceneRef = useRef<any>(null);
  const carRef = useRef<any>(null);
  const ambientLightRef = useRef<any>(null);
  const carRotationNodeRef = useRef<any>(null);
  const frontLeftWheelContainerRef = useRef<any>(null);
  const frontLeftWheelRef = useRef<any>(null);
  const frontRightWheelContainerRef = useRef<any>(null);
  const frontRightWheelRef = useRef<any>(null);
  const rearLeftWheelRef = useRef<any>(null);
  const rearRightWheelRef = useRef<any>(null);
  
  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 이전 값 추적을 위한 ref
  const previousResetValueRef = useRef(false);
  
  // ... rest of the component
};

export default ARDrivingCarScene;
```

**주요 변경사항**:
- `constructor`와 `this.state` → 개별 `useState` 훅
- `this.refs` → `useRef` 훅
- `componentDidMount` → `useEffect(..., [])`
- `componentWillUnmount` → `useEffect`의 cleanup 함수
- `.bind(this)` → `useCallback` 또는 화살표 함수 (자동 바인딩)
- TypeScript 타입 정의 추가

---

## 2. 상태 관리 현대화

### 물리 엔진 변수 관리

원본 코드는 컴포넌트 외부에 전역 변수를 선언했습니다:

```javascript
// 원본 - 컴포넌트 외부 전역 변수
var currentAcceleration = 0;
var currentVelocity = 0;
var currentPosition = [0,0,0];
var currentDirection = [0,0,-1];
var currentRotation = 0;
```

현대화된 접근법은 `useRef`를 사용하여 리렌더링 없이 값을 유지합니다:

```typescript
// 현대화 - useRef로 관리 (리렌더링 트리거 없음)
interface PhysicsState {
  acceleration: number;
  velocity: number;
  position: [number, number, number];
  direction: [number, number, number];
  rotation: number;
  leanRotation: number;
  wheelTurnRotation: number;
  wheelDrivingRotation: number;
}

const physicsRef = useRef<PhysicsState>({
  acceleration: 0,
  velocity: 0,
  position: [0, 0, 0],
  direction: [0, 0, -1],
  rotation: 0,
  leanRotation: 0,
  wheelTurnRotation: 0,
  wheelDrivingRotation: 0,
});

// 물리 상수도 타입 정의와 함께
const PHYSICS_CONSTANTS = {
  CAR_SCALE: 0.1,
  MAX_SPEED: 0.19 * 0.1,
  DRIVING_ACCELERATION: 0.08 * 0.1,
  REVERSE_ACCELERATION: 0.17 * 0.1,
  FRICTION: -0.03 * 0.1,
  INTERVAL_TIME: 16, // ms
  DISTANCE_TO_FULL_TURN: 0.4 * 0.1,
  WHEEL_CIRCUMFERENCE: 1 * 0.1,
  MAX_LEAN_ROTATION: 10,
} as const;
```

**이유**:
- `useRef`는 값이 변경되어도 리렌더링을 트리거하지 않음 (물리 계산에 적합)
- 타입 안정성 확보
- 상수는 `as const`로 불변성 보장

---

## 3. Lifecycle 메서드 현대화

### componentDidMount / componentWillUnmount

```javascript
// 원본
componentDidMount() {
  // 초기화 로직
}

componentWillUnmount() {
  if (this && this.timer) {
    clearInterval(this.timer);
  }
}
```

```typescript
// 현대화
useEffect(() => {
  // Mount 시 실행될 로직
  console.log('Component mounted');
  
  // Cleanup 함수 (unmount 시 실행)
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
}, []); // 빈 배열 = mount/unmount 시에만 실행
```

### 타이머 관리 패턴

```typescript
// 원본 - setState 콜백에서 타이머 시작
this.setState({
  modelWorldRotation: [0, yRotation, 0],
  shouldBillboard: false,
}, () => {
  this.timer = setInterval(() => {
    this._computeNewLocation();
  }, intervalTime)
});
```

```typescript
// 현대화 - useEffect로 상태 변화 감지 후 타이머 시작
useEffect(() => {
  if (!shouldBillboard && isReady) {
    // 기존 타이머가 있으면 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // 새 타이머 시작
    timerRef.current = setInterval(() => {
      computeNewLocation();
    }, PHYSICS_CONSTANTS.INTERVAL_TIME);
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }
}, [shouldBillboard, isReady]);
```

---

## 4. Props 변화 감지 현대화

### render() 내부에서 props 체크

원본 코드는 `render()` 메서드 내에서 props를 직접 체크했습니다:

```javascript
// 원본 - render() 내부 (안티패턴)
render() {
  if (this.props.arSceneNavigator.viroAppProps.isReady && !this.state.isReady) {
    // setState in render - 잠재적 무한 루프
    this.setState({
      isReady: true
    });
    setTimeout(() => { this._setInitialCarDirection() }, 400);
  }
  
  let resetValue = this.props.arSceneNavigator.viroAppProps.shouldResetCar;
  if (resetValue && shouldResetCarValue != resetValue) {
    setTimeout(() => { this._resetCar() }, 50);
  }
  shouldResetCarValue = resetValue;
  
  // ... render JSX
}
```

**문제점**:
- `render()` 내에서 `setState` 호출 → 무한 루프 위험
- 외부 변수로 이전 값 추적 → 메모리 관리 문제

```typescript
// 현대화 - useEffect로 props 변화 감지
useEffect(() => {
  if (arSceneNavigator.viroAppProps.isReady && !isReady) {
    setIsReady(true);
    
    // 초기 방향 설정은 약간의 지연 후
    const timer = setTimeout(() => {
      setInitialCarDirection();
    }, 400);
    
    return () => clearTimeout(timer);
  }
}, [arSceneNavigator.viroAppProps.isReady, isReady]);

// 리셋 처리도 별도 useEffect
useEffect(() => {
  const shouldReset = arSceneNavigator.viroAppProps.shouldResetCar;
  
  if (shouldReset && shouldReset !== previousResetValueRef.current) {
    const timer = setTimeout(() => {
      resetCar();
    }, 50);
    
    previousResetValueRef.current = shouldReset;
    
    return () => clearTimeout(timer);
  }
}, [arSceneNavigator.viroAppProps.shouldResetCar]);
```

**개선점**:
- `useEffect`로 명확한 의존성 추적
- 타이머 cleanup 자동화
- 이전 값 추적을 `useRef`로 안전하게 관리

---

## 5. 콜백 함수 최적화

### 원본 - bind를 통한 this 바인딩

```javascript
constructor() {
  super();
  this._onInitialized = this._onInitialized.bind(this);
  this._getScanningQuads = this._getScanningQuads.bind(this);
  this._setInitialCarDirection = this._setInitialCarDirection.bind(this);
  // ... 많은 바인딩
}

_onInitialized(state, reason) {
  if (state === ViroConstants.TRACKING_NORMAL) {
    this.setState({
      text: "Hello World!"
    });
  }
}
```

### 현대화 - useCallback

```typescript
// 의존성이 없는 간단한 콜백은 컴포넌트 내 화살표 함수로
const onInitialized = (state: number, reason: number) => {
  if (state === ViroConstants.TRACKING_NORMAL) {
    setText("Hello World!");
  }
};

// 의존성이 있고 자식 컴포넌트에 전달되는 콜백은 useCallback으로 메모이제이션
const computeNewLocation = useCallback(() => {
  const pressedDirectionButtons = arSceneNavigator.viroAppProps.direction;
  const physics = physicsRef.current;
  
  // 물리 계산 로직...
  let computedVelocity = physics.velocity + physics.acceleration * (PHYSICS_CONSTANTS.INTERVAL_TIME / 1000);
  
  if (physics.acceleration === PHYSICS_CONSTANTS.FRICTION) {
    physics.velocity = Math.max(computedVelocity, 0);
  } else if (physics.acceleration === -PHYSICS_CONSTANTS.FRICTION) {
    physics.velocity = Math.min(computedVelocity, 0);
  } else {
    physics.velocity = Math.max(
      Math.min(computedVelocity, PHYSICS_CONSTANTS.MAX_SPEED),
      -PHYSICS_CONSTANTS.MAX_SPEED
    );
  }
  
  computeAcceleration();
  
  // ... 나머지 로직
}, [arSceneNavigator.viroAppProps.direction, arSceneNavigator.viroAppProps.leftRightRatio]);

const computeAcceleration = useCallback(() => {
  const pressedDirectionButtons = arSceneNavigator.viroAppProps.direction;
  const physics = physicsRef.current;
  
  if ((pressedDirectionButtons & 2) > 0) {
    physics.acceleration = physics.velocity < 0 
      ? PHYSICS_CONSTANTS.REVERSE_ACCELERATION 
      : PHYSICS_CONSTANTS.DRIVING_ACCELERATION;
  } else if ((pressedDirectionButtons & 8) > 0) {
    physics.acceleration = physics.velocity > 0 
      ? -PHYSICS_CONSTANTS.REVERSE_ACCELERATION 
      : -PHYSICS_CONSTANTS.DRIVING_ACCELERATION;
  } else {
    physics.acceleration = physics.acceleration === PHYSICS_CONSTANTS.DRIVING_ACCELERATION || 
                          physics.acceleration === PHYSICS_CONSTANTS.FRICTION
      ? PHYSICS_CONSTANTS.FRICTION
      : -PHYSICS_CONSTANTS.FRICTION;
  }
}, [arSceneNavigator.viroAppProps.direction]);
```

**최적화 원칙**:
- 단순 이벤트 핸들러: 화살표 함수
- Props로 전달되는 콜백: `useCallback`으로 메모이제이션
- 의존성 배열 명시로 불필요한 재생성 방지

---

## 6. AR Hit Test 현대화

### 원본

```javascript
_onCameraARHitTest(results) {
  // Hit test 로직
  for (var i = 0; i < results.hitTestResults.length; i++) {
    let result = results.hitTestResults[i];
    if (result.type == "ExistingPlaneUsingExtent") {
      // plane 발견 처리
    }
  }
}

render() {
  let onCameraARHitTestCallback = this.state.isReady ? undefined : this._onCameraARHitTest;
  
  return (
    <ViroARScene onCameraARHitTest={onCameraARHitTestCallback} />
  );
}
```

### 현대화

```typescript
// Hit test 결과 타입 정의
interface HitTestResult {
  type: 'ExistingPlaneUsingExtent' | 'FeaturePoint' | string;
  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
}

interface CameraARHitTestResults {
  hitTestResults: HitTestResult[];
  cameraOrientation: {
    position: [number, number, number];
    rotation: [number, number, number];
    forward: [number, number, number];
    up: [number, number, number];
  };
}

const onCameraARHitTest = useCallback((results: CameraARHitTestResults) => {
  // ES6+ 문법 사용
  const planeResult = results.hitTestResults.find(
    result => result.type === "ExistingPlaneUsingExtent"
  );
  
  if (planeResult) {
    const position = planeResult.transform.position;
    
    setPlaneReticleLocation(position);
    setLastFoundPlaneLocation(position);
    setDisplayHitReticle(true);
    setFoundPlane(true);
    arSceneNavigator.viroAppProps.setIsOverPlane(true);
    return;
  }
  
  // Plane이 없으면 카메라 forward 방향으로 위치 계산
  const { cameraOrientation } = results;
  const distance = 1.5;
  
  const newPosition: [number, number, number] = [
    cameraOrientation.position[0] + cameraOrientation.forward[0] * distance,
    cameraOrientation.position[1] + cameraOrientation.forward[1] * distance,
    cameraOrientation.position[2] + cameraOrientation.forward[2] * distance,
  ];
  
  setPlaneReticleLocation(newPosition);
  setDisplayHitReticle(true);
  setFoundPlane(false);
  arSceneNavigator.viroAppProps.setIsOverPlane(false);
}, [arSceneNavigator.viroAppProps]);

// JSX에서 조건부 콜백 전달
return (
  <ViroARScene 
    ref={sceneRef}
    onCameraARHitTest={isReady ? undefined : onCameraARHitTest}
    onTrackingUpdated={onInitialized}
    physicsWorld={{ gravity: [0, -5, 0] }}
  >
    {/* children */}
  </ViroARScene>
);
```

**개선점**:
- TypeScript 타입으로 API 명확화
- `for` 루프 → `Array.find()` (더 선언적)
- 벡터 연산을 명시적 타입으로 관리

---

## 7. 3D Transform 관리 현대화

### 원본 - setNativeProps 사용

```javascript
this.car.setNativeProps({
  position: currentPosition,
  rotation: [0, currentRotation * 180 / Math.PI, 0],
});

this.frontRightWheel.setNativeProps({
  rotation: [wheelDrivingRotation, 0, 0]
});
```

### 현대화 - 타입 안전성 추가

```typescript
// Transform 유틸리티 타입
type Vector3 = [number, number, number];

interface TransformProps {
  position?: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
}

// Transform 업데이트 헬퍼 함수
const updateCarTransform = useCallback((
  position: Vector3,
  rotationRadians: number
) => {
  if (!carRef.current) return;
  
  const rotationDegrees = rotationRadians * 180 / Math.PI;
  
  carRef.current.setNativeProps({
    position,
    rotation: [0, rotationDegrees, 0] as Vector3,
  });
}, []);

const updateWheelRotation = useCallback((
  wheelRef: React.RefObject<any>,
  drivingRotation: number,
  turnRotation: number = 0
) => {
  if (!wheelRef.current) return;
  
  wheelRef.current.setNativeProps({
    rotation: [drivingRotation, turnRotation, 0] as Vector3,
  });
}, []);

// 사용 예시
updateCarTransform(physics.position, physics.rotation);
updateWheelRotation(frontRightWheelRef, wheelDrivingRotation, wheelTurnRotation);
```

---

## 8. Async 작업 현대화

### 원본

```javascript
_setInitialCarDirection() {
  if (this.car) {
    this.car.getTransformAsync().then((retDict) => {
      let rotation = retDict.rotation;
      let yRotation = rotation[1];
      // ... 처리
      
      this.setState({
        modelWorldRotation: [0, yRotation, 0],
        shouldBillboard: false,
      }, () => {
        this.timer = setInterval(() => {
          this._computeNewLocation();
        }, intervalTime)
      });
    });
  }
}
```

### 현대화 - async/await

```typescript
const setInitialCarDirection = useCallback(async () => {
  if (!carRef.current) return;
  
  try {
    const transform = await carRef.current.getTransformAsync();
    const rotation = transform.rotation;
    const absX = Math.abs(rotation[0]);
    const absZ = Math.abs(rotation[2]);
    
    let yRotation = rotation[1];
    
    // Quaternion 보정
    if (absX !== 0 && absZ !== 0) {
      yRotation = 180 - yRotation;
    }
    
    setModelWorldRotation([0, yRotation, 0]);
    setShouldBillboard(false);
    
  } catch (error) {
    console.error('Failed to get car transform:', error);
  }
}, []);

// 리셋 함수도 async/await로
const resetCar = useCallback(async () => {
  if (!sceneRef.current) return;
  
  try {
    const orientation = await sceneRef.current.getCameraOrientationAsync();
    const { position, forward } = orientation;
    
    // 벡터 정규화
    const xzMagnitude = Math.sqrt(forward[0] ** 2 + forward[2] ** 2);
    const distanceFromUser = 1; // meters
    
    const newPosition: Vector3 = [
      position[0] + (forward[0] / xzMagnitude) * distanceFromUser,
      lastFoundPlaneLocation[1],
      position[2] + (forward[2] / xzMagnitude) * distanceFromUser,
    ];
    
    resetCarPhysics();
    setLastFoundPlaneLocation(newPosition);
    
  } catch (error) {
    console.error('Failed to reset car:', error);
  }
}, [lastFoundPlaneLocation]);

const resetCarPhysics = useCallback(() => {
  const physics = physicsRef.current;
  
  physics.acceleration = 0;
  physics.velocity = 0;
  physics.position = [0, 0, 0];
  physics.direction = [0, 0, -1];
  physics.rotation = 0;
  physics.leanRotation = 0;
  physics.wheelTurnRotation = 0;
  physics.wheelDrivingRotation = 0;
  
  if (carRef.current) {
    carRef.current.setNativeProps({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    });
  }
}, []);
```

**개선점**:
- Promise 체이닝 → async/await (가독성 향상)
- try/catch로 에러 처리
- 함수 분리로 책임 명확화

---

## 9. Materials 정의 현대화

### 원본

```javascript
ViroMaterials.createMaterials({
  dropShadow: {
    diffuseTexture: require('./res/car_shadow.png'),
    lightingModel: "Constant",
    blendMode: 'Subtract',
  },
  invisibleMaterial: {
    diffuseColor: '#ffffff00'
  }
});
```

### 현대화 - 타입 정의 및 상수 분리

```typescript
// materials 타입 정의
interface ViroMaterialDefinition {
  diffuseTexture?: any;
  diffuseColor?: string;
  lightingModel?: 'Constant' | 'Blinn' | 'Phong' | 'Lambert';
  blendMode?: 'None' | 'Alpha' | 'Add' | 'Subtract';
  // ... 기타 속성
}

// materials 상수로 정의
const AR_MATERIALS = {
  DROP_SHADOW: 'dropShadow',
  INVISIBLE: 'invisibleMaterial',
} as const;

// 컴포넌트 외부에서 materials 초기화
const initializeMaterials = () => {
  ViroMaterials.createMaterials({
    [AR_MATERIALS.DROP_SHADOW]: {
      diffuseTexture: require('./res/car_shadow.png'),
      lightingModel: 'Constant',
      blendMode: 'Subtract',
    } as ViroMaterialDefinition,
    [AR_MATERIALS.INVISIBLE]: {
      diffuseColor: '#ffffff00',
    } as ViroMaterialDefinition,
  });
};

// 컴포넌트 최상위에서 한 번만 실행
let materialsInitialized = false;

const ARDrivingCarScene: FC<ARDrivingCarSceneProps> = (props) => {
  if (!materialsInitialized) {
    initializeMaterials();
    materialsInitialized = true;
  }
  
  // ... 컴포넌트 로직
  
  return (
    <ViroARScene>
      <ViroQuad 
        width={5.691} 
        height={5.691} 
        materials={[AR_MATERIALS.DROP_SHADOW]} 
        rotation={[-90, 0, 0]}
      />
    </ViroARScene>
  );
};
```

---

## 10. 조건부 렌더링 현대화

### 원본

```javascript
import renderIf from './renderIf';

render() {
  return (
    <ViroARScene>
      {renderIf(this.state.isReady,
        <ViroNode>
          {/* content */}
        </ViroNode>
      )}
    </ViroARScene>
  );
}

_getScanningQuads() {
  if (this.state.isReady) {
    return;
  }
  
  return (
    <ViroNode>
      {/* scanning UI */}
    </ViroNode>
  );
}
```

### 현대화 - 표준 JSX 조건부 렌더링

```typescript
// 별도 헬퍼 함수 필요 없음
const ScanningQuads: FC<{ isReady: boolean; foundPlane: boolean; planeReticleLocation: Vector3 }> = ({
  isReady,
  foundPlane,
  planeReticleLocation
}) => {
  if (isReady) return null;
  
  return (
    <ViroNode
      transformBehaviors="billboardY"
      position={planeReticleLocation}
      scale={[0.5, 0.5, 0.5]}
    >
      <ViroImage
        rotation={[-90, 0, 0]}
        visible={foundPlane}
        source={require('./res/tracking_diffuse_2.png')}
      />
      <ViroImage
        rotation={[-90, 0, 0]}
        visible={!foundPlane}
        source={require('./res/tracking_diffuse.png')}
      />
    </ViroNode>
  );
};

// 메인 컴포넌트에서
return (
  <ViroARScene>
    <ScanningQuads
      isReady={isReady}
      foundPlane={foundPlane}
      planeReticleLocation={planeReticleLocation}
    />
    
    {/* 인라인 조건부 렌더링 */}
    {!isReady && (
      <ViroSound source={require('./res/car_ambient.mp3')} paused loop />
    )}
    
    {/* 삼항 연산자 */}
    {isReady ? <CarModel /> : <LoadingIndicator />}
  </ViroARScene>
);
```

**개선점**:
- 외부 라이브러리 불필요
- 컴포넌트 분리로 가독성 향상
- React의 표준 패턴 사용

---

## 11. 사운드 관리 현대화

### 원본

```javascript
render() {
  let shouldPauseAccelSound = !this.state.isReady || !(this.props.arSceneNavigator.viroAppProps.direction & 10);
  let shouldPauseIdleSound = !this.state.isReady || !shouldPauseAccelSound;
  
  return (
    <ViroARScene>
      <ViroSound source={require('./res/car_ambient.mp3')} paused={!this.state.isReady} loop={true} />
      <ViroSound source={require('./res/car_drive.mp3')} paused={shouldPauseAccelSound} loop={true} />
      <ViroSound source={require('./res/car_idle.mp3')} paused={shouldPauseIdleSound} loop={true} volume={this.state.volumeLevel} />
    </ViroARScene>
  );
}
```

### 현대화 - 명시적 사운드 상태 관리

```typescript
// 사운드 상태를 계산하는 커스텀 훅
const useCarSounds = (
  isReady: boolean,
  direction: number,
  volumeLevel: number
) => {
  // 비트마스크 상수 정의
  const DIRECTION_FLAGS = {
    LEFT: 1,      // 0001
    FORWARD: 2,   // 0010
    RIGHT: 4,     // 0100
    BACKWARD: 8,  // 1000
  } as const;
  
  // 전진 또는 후진 중인지 확인 (비트마스크 10 = 0010 | 1000)
  const isDriving = (direction & (DIRECTION_FLAGS.FORWARD | DIRECTION_FLAGS.BACKWARD)) !== 0;
  
  return {
    ambient: {
      paused: !isReady,
      loop: true,
    },
    driving: {
      paused: !isReady || !isDriving,
      loop: true,
    },
    idle: {
      paused: !isReady || isDriving,
      loop: true,
      volume: volumeLevel,
    },
  };
};

// 컴포넌트에서 사용
const ARDrivingCarScene: FC<ARDrivingCarSceneProps> = ({ arSceneNavigator }) => {
  const [isReady, setIsReady] = useState(false);
  const [volumeLevel] = useState(0.3);
  
  const sounds = useCarSounds(
    isReady,
    arSceneNavigator.viroAppProps.direction,
    volumeLevel
  );
  
  return (
    <ViroARScene>
      <ViroSound
        source={require('./res/car_ambient.mp3')}
        {...sounds.ambient}
      />
      <ViroSound
        source={require('./res/car_drive.mp3')}
        {...sounds.driving}
      />
      <ViroSound
        source={require('./res/car_idle.mp3')}
        {...sounds.idle}
      />
    </ViroARScene>
  );
};
```

**개선점**:
- 복잡한 사운드 로직을 커스텀 훅으로 분리
- 비트마스크 상수를 명명하여 가독성 향상
- 스프레드 연산자로 props 전달 간소화

---

## 12. 전체 구조 비교

### 원본 구조

```
ARDrivingCarScene (Class)
├── constructor()
│   ├── state 초기화
│   └── 메서드 바인딩 (10+ bindings)
├── componentDidMount()
├── componentWillUnmount()
├── render()
│   ├── props 체크 (setState 호출)
│   └── JSX 반환
├── _onInitialized()
├── _getScanningQuads()
├── _getCarModel()
├── _setInitialCarDirection()
├── _onCameraARHitTest()
├── _computeNewLocation()
├── _computeAcceleration()
├── _resetCar()
└── _resetCarValues()
```

### 현대화 구조

```
ARDrivingCarScene (Function Component)
├── Type Definitions
│   ├── ARDrivingCarSceneProps
│   ├── PhysicsState
│   ├── Vector3
│   └── HitTestResult
├── Custom Hooks
│   ├── useCarSounds()
│   └── useCarPhysics()
├── State (useState)
│   ├── isReady
│   ├── foundPlane
│   ├── planeReticleLocation
│   └── ...
├── Refs (useRef)
│   ├── sceneRef
│   ├── carRef
│   ├── physicsRef
│   ├── timerRef
│   └── wheel refs...
├── Effects (useEffect)
│   ├── Props 변화 감지
│   ├── 타이머 관리
│   └── Cleanup
├── Callbacks (useCallback)
│   ├── onInitialized
│   ├── onCameraARHitTest
│   ├── computeNewLocation
│   ├── computeAcceleration
│   ├── setInitialCarDirection
│   ├── resetCar
│   └── resetCarPhysics
├── Sub Components
│   ├── <ScanningQuads />
│   ├── <CarModel />
│   └── <CarSounds />
└── JSX Return
```

---

## 13. 성능 최적화 포인트

### 메모이제이션 전략

```typescript
// 1. 무거운 계산 결과 캐싱
const carModelProps = useMemo(() => ({
  scale: [PHYSICS_CONSTANTS.CAR_SCALE, PHYSICS_CONSTANTS.CAR_SCALE, PHYSICS_CONSTANTS.CAR_SCALE] as Vector3,
  source: require('./res/car_body.vrx'),
  type: 'VRX' as const,
  resources: [
    require('./res/bumblebee_Base_Color.png'),
    require('./res/bumblebee_Metallic.jpg'),
    require('./res/bumblebee_Roughness.jpg'),
    require('./res/bumblebee_Normal_OpenGL.jpg'),
  ],
}), []);

// 2. 변경되지 않는 컴포넌트 메모이제이션
const CarModel = memo<CarModelProps>(({ 
  scale, 
  position, 
  rotation 
}) => {
  return (
    <ViroNode position={position} rotation={rotation}>
      <Viro3DObject
        scale={scale}
        {...carModelProps}
      />
    </ViroNode>
  );
});

// 3. 자식 컴포넌트로 분리하여 불필요한 리렌더링 방지
const CarWheel = memo<CarWheelProps>(({ 
  wheelRef, 
  position, 
  rotationY 
}) => {
  return (
    <ViroNode ref={wheelRef} position={position}>
      <ViroNode>
        <Viro3DObject
          source={require('./res/car_wheels.vrx')}
          type='VRX'
          rotation={[0, rotationY, 0]}
          resources={[/* ... */]}
        />
      </ViroNode>
    </ViroNode>
  );
});
```

### 물리 계산 최적화

```typescript
// RAF (requestAnimationFrame) 기반 애니메이션 (선택적)
const useAnimationFrame = (callback: (deltaTime: number) => void) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback]);
};

// 사용 예시 (setInterval 대신)
useAnimationFrame((deltaTime) => {
  if (isReady && !shouldBillboard) {
    computeNewLocation(deltaTime);
  }
});
```

---

## 14. 디버깅 및 개발자 도구

### 원본 - console.log 산재

```javascript
render() {
  console.log("Current velocity:", currentVelocity);
  // ...
}
```

### 현대화 - 구조화된 디버깅

```typescript
// 개발 전용 디버그 훅
const useARDebug = (enabled: boolean) => {
  const logPhysics = useCallback((physics: PhysicsState) => {
    if (!enabled || !__DEV__) return;
    
    console.group('🚗 Physics State');
    console.log('Velocity:', physics.velocity.toFixed(3));
    console.log('Acceleration:', physics.acceleration.toFixed(3));
    console.log('Position:', physics.position.map(v => v.toFixed(2)));
    console.log('Rotation:', (physics.rotation * 180 / Math.PI).toFixed(1), '°');
    console.groupEnd();
  }, [enabled]);
  
  const logPerformance = useCallback((label: string, fn: () => void) => {
    if (!enabled || !__DEV__) {
      fn();
      return;
    }
    
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  }, [enabled]);
  
  return { logPhysics, logPerformance };
};

// 사용
const debug = useARDebug(__DEV__);

useEffect(() => {
  const interval = setInterval(() => {
    debug.logPerformance('Physics Update', () => {
      computeNewLocation();
    });
    debug.logPhysics(physicsRef.current);
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 15. 완전한 현대화 예시

```typescript
/**
 * AR 드라이빙 카 씬 컴포넌트
 * 
 * @description
 * ViroAR을 사용하여 현실 공간에 3D 자동차를 배치하고,
 * 사용자 입력으로 실시간 물리 엔진 기반 주행을 시뮬레이션합니다.
 * 
 * @features
 * - Plane detection을 통한 자동차 배치
 * - 실시간 물리 계산 (가속, 마찰, 회전)
 * - 바퀴 애니메이션 (회전, 조향)
 * - 3D 사운드 (주행음, 공회전음)
 */

import React, { FC, useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { StyleSheet } from 'react-native';
import {
  ViroARScene,
  ViroText,
  ViroConstants,
  Viro3DObject,
  ViroAmbientLight,
  ViroMaterials,
  ViroNode,
  ViroLightingEnvironment,
  ViroImage,
  ViroSound,
  ViroQuad,
  ViroBox,
} from '@reactvision/react-viro';

// ============================================================================
// Type Definitions
// ============================================================================

type Vector3 = [number, number, number];

interface ARDrivingCarSceneProps {
  arSceneNavigator: {
    viroAppProps: {
      isReady: boolean;
      shouldResetCar: boolean;
      direction: number;
      leftRightRatio: number;
      setIsOverPlane: (value: boolean) => void;
    };
  };
}

interface PhysicsState {
  acceleration: number;
  velocity: number;
  position: Vector3;
  direction: Vector3;
  rotation: number;
  leanRotation: number;
  wheelTurnRotation: number;
  wheelDrivingRotation: number;
}

interface HitTestResult {
  type: string;
  transform: {
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
  };
}

interface CameraARHitTestResults {
  hitTestResults: HitTestResult[];
  cameraOrientation: {
    position: Vector3;
    rotation: Vector3;
    forward: Vector3;
    up: Vector3;
  };
}

// ============================================================================
// Constants
// ============================================================================

const PHYSICS_CONSTANTS = {
  CAR_SCALE: 0.1,
  MAX_SPEED: 0.19 * 0.1,
  DRIVING_ACCELERATION: 0.08 * 0.1,
  REVERSE_ACCELERATION: 0.17 * 0.1,
  FRICTION: -0.03 * 0.1,
  INTERVAL_TIME: 16, // ms
  DISTANCE_TO_FULL_TURN: 0.4 * 0.1,
  WHEEL_CIRCUMFERENCE: 1 * 0.1,
  MAX_LEAN_ROTATION: 10,
} as const;

const DIRECTION_FLAGS = {
  LEFT: 1,      // 0001
  FORWARD: 2,   // 0010
  RIGHT: 4,     // 0100
  BACKWARD: 8,  // 1000
} as const;

const AR_MATERIALS = {
  DROP_SHADOW: 'dropShadow',
  INVISIBLE: 'invisibleMaterial',
} as const;

// ============================================================================
// Materials Initialization
// ============================================================================

let materialsInitialized = false;

const initializeMaterials = () => {
  if (materialsInitialized) return;
  
  ViroMaterials.createMaterials({
    [AR_MATERIALS.DROP_SHADOW]: {
      diffuseTexture: require('./res/car_shadow.png'),
      lightingModel: 'Constant',
      blendMode: 'Subtract',
    },
    [AR_MATERIALS.INVISIBLE]: {
      diffuseColor: '#ffffff00',
    },
  });
  
  materialsInitialized = true;
};

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * 자동차 사운드 상태를 관리하는 커스텀 훅
 */
const useCarSounds = (isReady: boolean, direction: number, volumeLevel: number) => {
  return useMemo(() => {
    const isDriving = (direction & (DIRECTION_FLAGS.FORWARD | DIRECTION_FLAGS.BACKWARD)) !== 0;
    
    return {
      ambient: {
        paused: !isReady,
        loop: true,
      },
      driving: {
        paused: !isReady || !isDriving,
        loop: true,
      },
      idle: {
        paused: !isReady || isDriving,
        loop: true,
        volume: volumeLevel,
      },
    };
  }, [isReady, direction, volumeLevel]);
};

// ============================================================================
// Sub Components
// ============================================================================

interface ScanningQuadsProps {
  isReady: boolean;
  foundPlane: boolean;
  planeReticleLocation: Vector3;
}

const ScanningQuads: FC<ScanningQuadsProps> = memo(({
  isReady,
  foundPlane,
  planeReticleLocation
}) => {
  if (isReady) return null;
  
  return (
    <ViroNode
      transformBehaviors="billboardY"
      position={planeReticleLocation}
      scale={[0.5, 0.5, 0.5]}
    >
      <ViroImage
        rotation={[-90, 0, 0]}
        visible={foundPlane}
        source={require('./res/tracking_diffuse_2.png')}
      />
      <ViroImage
        rotation={[-90, 0, 0]}
        visible={!foundPlane}
        source={require('./res/tracking_diffuse.png')}
      />
    </ViroNode>
  );
});

// ============================================================================
// Main Component
// ============================================================================

const ARDrivingCarScene: FC<ARDrivingCarSceneProps> = ({ arSceneNavigator }) => {
  initializeMaterials();
  
  // State
  const [text, setText] = useState("Initializing AR...");
  const [modelWorldRotation, setModelWorldRotation] = useState<Vector3>([0, 0, 0]);
  const [displayHitReticle, setDisplayHitReticle] = useState(false);
  const [foundPlane, setFoundPlane] = useState(false);
  const [planeReticleLocation, setPlaneReticleLocation] = useState<Vector3>([0, 0, 0]);
  const [shouldBillboard, setShouldBillboard] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [lastFoundPlaneLocation, setLastFoundPlaneLocation] = useState<Vector3>([0, 0, 0]);
  const [volumeLevel] = useState(0.3);
  
  // Refs
  const sceneRef = useRef<any>(null);
  const carRef = useRef<any>(null);
  const carRotationNodeRef = useRef<any>(null);
  const frontLeftWheelContainerRef = useRef<any>(null);
  const frontLeftWheelRef = useRef<any>(null);
  const frontRightWheelContainerRef = useRef<any>(null);
  const frontRightWheelRef = useRef<any>(null);
  const rearLeftWheelRef = useRef<any>(null);
  const rearRightWheelRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousResetValueRef = useRef(false);
  
  const physicsRef = useRef<PhysicsState>({
    acceleration: 0,
    velocity: 0,
    position: [0, 0, 0],
    direction: [0, 0, -1],
    rotation: 0,
    leanRotation: 0,
    wheelTurnRotation: 0,
    wheelDrivingRotation: 0,
  });
  
  // Sounds
  const sounds = useCarSounds(
    isReady,
    arSceneNavigator.viroAppProps.direction,
    volumeLevel
  );
  
  // Callbacks
  const onInitialized = useCallback((state: number, reason: number) => {
    if (state === ViroConstants.TRACKING_NORMAL) {
      setText("Hello World!");
    }
  }, []);
  
  const resetCarPhysics = useCallback(() => {
    const physics = physicsRef.current;
    
    physics.acceleration = 0;
    physics.velocity = 0;
    physics.position = [0, 0, 0];
    physics.direction = [0, 0, -1];
    physics.rotation = 0;
    physics.leanRotation = 0;
    physics.wheelTurnRotation = 0;
    physics.wheelDrivingRotation = 0;
    
    if (carRef.current) {
      carRef.current.setNativeProps({
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      });
    }
  }, []);
  
  const resetCar = useCallback(async () => {
    if (!sceneRef.current) return;
    
    try {
      const orientation = await sceneRef.current.getCameraOrientationAsync();
      const { position, forward } = orientation;
      
      const xzMagnitude = Math.sqrt(forward[0] ** 2 + forward[2] ** 2);
      const distanceFromUser = 1;
      
      const newPosition: Vector3 = [
        position[0] + (forward[0] / xzMagnitude) * distanceFromUser,
        lastFoundPlaneLocation[1],
        position[2] + (forward[2] / xzMagnitude) * distanceFromUser,
      ];
      
      resetCarPhysics();
      setLastFoundPlaneLocation(newPosition);
      
    } catch (error) {
      console.error('Failed to reset car:', error);
    }
  }, [lastFoundPlaneLocation, resetCarPhysics]);
  
  const computeAcceleration = useCallback(() => {
    const pressedDirectionButtons = arSceneNavigator.viroAppProps.direction;
    const physics = physicsRef.current;
    
    if ((pressedDirectionButtons & DIRECTION_FLAGS.FORWARD) > 0) {
      physics.acceleration = physics.velocity < 0
        ? PHYSICS_CONSTANTS.REVERSE_ACCELERATION
        : PHYSICS_CONSTANTS.DRIVING_ACCELERATION;
    } else if ((pressedDirectionButtons & DIRECTION_FLAGS.BACKWARD) > 0) {
      physics.acceleration = physics.velocity > 0
        ? -PHYSICS_CONSTANTS.REVERSE_ACCELERATION
        : -PHYSICS_CONSTANTS.DRIVING_ACCELERATION;
    } else {
      physics.acceleration = 
        physics.acceleration === PHYSICS_CONSTANTS.DRIVING_ACCELERATION ||
        physics.acceleration === PHYSICS_CONSTANTS.FRICTION
          ? PHYSICS_CONSTANTS.FRICTION
          : -PHYSICS_CONSTANTS.FRICTION;
    }
  }, [arSceneNavigator.viroAppProps.direction]);
  
  const computeNewLocation = useCallback(() => {
    // 물리 계산 로직 구현...
    // (원본 코드의 _computeNewLocation 로직을 여기에 구현)
  }, [arSceneNavigator.viroAppProps, computeAcceleration]);
  
  const setInitialCarDirection = useCallback(async () => {
    if (!carRef.current) return;
    
    try {
      const transform = await carRef.current.getTransformAsync();
      const rotation = transform.rotation;
      const absX = Math.abs(rotation[0]);
      const absZ = Math.abs(rotation[2]);
      
      let yRotation = rotation[1];
      
      if (absX !== 0 && absZ !== 0) {
        yRotation = 180 - yRotation;
      }
      
      setModelWorldRotation([0, yRotation, 0]);
      setShouldBillboard(false);
      
    } catch (error) {
      console.error('Failed to get car transform:', error);
    }
  }, []);
  
  const onCameraARHitTest = useCallback((results: CameraARHitTestResults) => {
    const planeResult = results.hitTestResults.find(
      result => result.type === "ExistingPlaneUsingExtent"
    );
    
    if (planeResult) {
      const position = planeResult.transform.position;
      
      setPlaneReticleLocation(position);
      setLastFoundPlaneLocation(position);
      setDisplayHitReticle(true);
      setFoundPlane(true);
      arSceneNavigator.viroAppProps.setIsOverPlane(true);
      return;
    }
    
    const { cameraOrientation } = results;
    const distance = 1.5;
    
    const newPosition: Vector3 = [
      cameraOrientation.position[0] + cameraOrientation.forward[0] * distance,
      cameraOrientation.position[1] + cameraOrientation.forward[1] * distance,
      cameraOrientation.position[2] + cameraOrientation.forward[2] * distance,
    ];
    
    setPlaneReticleLocation(newPosition);
    setDisplayHitReticle(true);
    setFoundPlane(false);
    arSceneNavigator.viroAppProps.setIsOverPlane(false);
  }, [arSceneNavigator.viroAppProps]);
  
  // Effects
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    if (arSceneNavigator.viroAppProps.isReady && !isReady) {
      setIsReady(true);
      
      const timer = setTimeout(() => {
        setInitialCarDirection();
      }, 400);
      
      return () => clearTimeout(timer);
    }
  }, [arSceneNavigator.viroAppProps.isReady, isReady, setInitialCarDirection]);
  
  useEffect(() => {
    const shouldReset = arSceneNavigator.viroAppProps.shouldResetCar;
    
    if (shouldReset && shouldReset !== previousResetValueRef.current) {
      const timer = setTimeout(() => {
        resetCar();
      }, 50);
      
      previousResetValueRef.current = shouldReset;
      
      return () => clearTimeout(timer);
    }
  }, [arSceneNavigator.viroAppProps.shouldResetCar, resetCar]);
  
  useEffect(() => {
    if (!shouldBillboard && isReady) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        computeNewLocation();
      }, PHYSICS_CONSTANTS.INTERVAL_TIME);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [shouldBillboard, isReady, computeNewLocation]);
  
  // Render
  const environmentLightSource = require('./res/learner_park_1k.hdr');
  const carPosition: Vector3 = isReady ? lastFoundPlaneLocation : [0, 20, 0];
  const transformBehaviors = shouldBillboard ? "billboardY" : undefined;
  
  return (
    <ViroARScene
      ref={sceneRef}
      onCameraARHitTest={isReady ? undefined : onCameraARHitTest}
      onTrackingUpdated={onInitialized}
      physicsWorld={{ gravity: [0, -5, 0] }}
    >
      <ViroLightingEnvironment source={environmentLightSource} />
      
      <ScanningQuads
        isReady={isReady}
        foundPlane={foundPlane}
        planeReticleLocation={planeReticleLocation}
      />
      
      <ViroNode 
        position={carPosition} 
        rotation={modelWorldRotation} 
        transformBehaviors={transformBehaviors}
      >
        <ViroNode
          ref={carRef}
          scale={[PHYSICS_CONSTANTS.CAR_SCALE, PHYSICS_CONSTANTS.CAR_SCALE, PHYSICS_CONSTANTS.CAR_SCALE]}
        >
          <ViroAmbientLight color="#f5f8e0" intensity={200} />
          
          <ViroQuad
            width={5.691}
            height={5.691}
            materials={[AR_MATERIALS.DROP_SHADOW]}
            rotation={[-90, 0, 0]}
          />
          
          <Viro3DObject
            ref={carRotationNodeRef}
            position={[0, 0, 0]}
            source={require('./res/car_body.vrx')}
            type="VRX"
            resources={[
              require('./res/bumblebee_Base_Color.png'),
              require('./res/bumblebee_Metallic.jpg'),
              require('./res/bumblebee_Roughness.jpg'),
              require('./res/bumblebee_Normal_OpenGL.jpg'),
            ]}
          />
          
          {/* Wheels implementation... */}
        </ViroNode>
      </ViroNode>
      
      <ViroSound source={require('./res/car_ambient.mp3')} {...sounds.ambient} />
      <ViroSound source={require('./res/car_drive.mp3')} {...sounds.driving} />
      <ViroSound source={require('./res/car_idle.mp3')} {...sounds.idle} />
    </ViroARScene>
  );
};

export default ARDrivingCarScene;
```

---

## 16. 마이그레이션 체크리스트

프로젝트에 적용할 때 다음 순서로 진행하세요:

- [ ] **1단계**: TypeScript 타입 정의
  - [ ] Props 인터페이스
  - [ ] State 타입
  - [ ] Viro 컴포넌트 타입
  
- [ ] **2단계**: Class → Function Component 변환
  - [ ] `constructor` → `useState`
  - [ ] `this.state` → 개별 state
  - [ ] `this.refs` → `useRef`
  
- [ ] **3단계**: Lifecycle 메서드 변환
  - [ ] `componentDidMount` → `useEffect`
  - [ ] `componentWillUnmount` → cleanup 함수
  - [ ] `render()` 내 로직 → `useEffect`
  
- [ ] **4단계**: 메서드 변환
  - [ ] 이벤트 핸들러 → `useCallback`
  - [ ] 헬퍼 함수 → `useCallback`
  - [ ] `.bind(this)` 제거
  
- [ ] **5단계**: 최적화
  - [ ] 무거운 계산 → `useMemo`
  - [ ] 컴포넌트 분리 → `memo()`
  - [ ] 커스텀 훅 추출
  
- [ ] **6단계**: 테스트
  - [ ] AR tracking 동작 확인
  - [ ] 물리 엔진 정확성 검증
  - [ ] 메모리 누수 확인
  - [ ] 성능 프로파일링

---

## 17. 참고 자료

- [React 19 공식 문서](https://react.dev/)
- [React Hooks 가이드](https://react.dev/reference/react)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [@reactvision/react-viro 문서](https://github.com/ViroCommunity/viro)
- [React Native 성능 최적화](https://reactnative.dev/docs/performance)

---

## 결론

이 문서는 6년 전의 Class Component 기반 Viro AR 코드를 React 19의 최신 패턴으로 현대화하는 방법을 다룹니다. 주요 개선사항은:

1. **타입 안정성**: TypeScript로 런타임 에러 사전 방지
2. **가독성**: Hooks로 로직 분리 및 재사용성 향상
3. **성능**: 메모이제이션으로 불필요한 리렌더링 방지
4. **유지보수성**: 선언적 코드로 버그 추적 용이
5. **현대 표준**: React 19 권장 패턴 준수

프로젝트 구조와 요구사항에 맞게 필요한 부분을 선택적으로 적용하세요.

