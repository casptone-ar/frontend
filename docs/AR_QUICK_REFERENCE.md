# AR 개발 퀵 레퍼런스

프로젝트 개발 시 자주 참조하는 핵심 개념과 코드 스니펫 모음입니다.

---

## 목차
1. [핵심 용어 사전](#핵심-용어-사전)
2. [좌표계 변환 치트시트](#좌표계-변환-치트시트)
3. [Viro 컴포넌트 레퍼런스](#viro-컴포넌트-레퍼런스)
4. [일반적인 문제 해결](#일반적인-문제-해결)
5. [성능 최적화 체크리스트](#성능-최적화-체크리스트)

---

## 핵심 용어 사전

### 그래픽

| 용어 | 설명 | 예시 |
|------|------|------|
| **Mesh** | 3D 모델의 형태를 정의하는 정점, 모서리, 면의 집합 | 큐브 = 8개 정점, 12개 모서리, 6개 면 |
| **Vertex** | 3D 공간의 점 (x, y, z) | `[0.5, 1.0, -2.0]` |
| **Normal** | 면의 방향을 나타내는 단위 벡터, 조명 계산에 사용 | `[0, 1, 0]` (위쪽) |
| **UV Mapping** | 3D 모델의 표면을 2D 텍스처에 매핑 | U(가로), V(세로) 0.0~1.0 |
| **PBR** | 물리 기반 렌더링 (Physically Based Rendering) | Metallic, Roughness 속성 |
| **Shader** | GPU에서 실행되는 렌더링 프로그램 | Vertex Shader, Fragment Shader |

### AR

| 용어 | 설명 | 비고 |
|------|------|------|
| **6DoF** | 6자유도 (위치 x,y,z + 회전 pitch,yaw,roll) | ARKit, ARCore 기본 |
| **3DoF** | 3자유도 (회전만) | 간단한 VR |
| **Anchor** | 실세계 3D 공간의 고정점 | 가상 객체 배치 기준 |
| **Plane Detection** | 평면(바닥, 벽 등) 자동 감지 | Horizontal, Vertical |
| **Hit Test** | 화면 터치를 3D 공간 레이로 변환 | 객체 배치에 사용 |
| **SLAM** | 동시적 위치추정 및 지도작성 | AR 추적의 핵심 기술 |
| **IMU** | 관성 측정 장치 (가속도계+자이로스코프) | 센서 퓨전에 사용 |
| **Depth** | 각 픽셀까지의 거리 정보 | LiDAR, Stereo Camera |
| **Occlusion** | 실제 물체가 가상 객체를 가리는 현상 | Depth 정보로 구현 |

### 성능

| 용어 | 설명 | 목표치 |
|------|------|--------|
| **FPS** | 초당 프레임 수 | 60fps (AR 권장) |
| **Draw Call** | 하나의 렌더링 명령 | 낮을수록 좋음 |
| **Polygon Count** | 폴리곤(삼각형) 개수 | 모바일: 1만~5만 |
| **Culling** | 보이지 않는 객체 제거 | Frustum, Occlusion |
| **LOD** | 거리별 디테일 조절 | Level of Detail |
| **Batching** | 여러 객체를 한 번에 렌더링 | Draw Call 감소 |

---

## 좌표계 변환 치트시트

### 변환 순서
```
Local Space → World Space → View Space → Clip Space → Screen Space
   (Model)      (World)       (View)      (Projection)    (Viewport)
```

### 변환 행렬

#### 이동 (Translation)
```
T = [1  0  0  tx]
    [0  1  0  ty]
    [0  0  1  tz]
    [0  0  0  1 ]

적용: P' = T × P
```

#### 회전 (Rotation)
```
X축: Rx = [1   0        0       0]
          [0   cos(θ)  -sin(θ)  0]
          [0   sin(θ)   cos(θ)  0]
          [0   0        0       1]

Y축: Ry = [cos(θ)   0   sin(θ)  0]
          [0        1   0       0]
          [-sin(θ)  0   cos(θ)  0]
          [0        0   0       1]

Z축: Rz = [cos(θ)  -sin(θ)  0  0]
          [sin(θ)   cos(θ)  0  0]
          [0        0       1  0]
          [0        0       0  1]
```

#### 스케일 (Scale)
```
S = [sx  0   0   0]
    [0   sy  0   0]
    [0   0   sz  0]
    [0   0   0   1]
```

#### 복합 변환 (TRS)
```
M = T × R × S  (오른쪽부터 적용)

적용 순서: Scale → Rotate → Translate
```

### MVP 행렬
```typescript
// Model Matrix: Local → World
const modelMatrix = translation * rotation * scale;

// View Matrix: World → Camera
const viewMatrix = inverse(cameraTransform);

// Projection Matrix: Camera → Clip
const projectionMatrix = perspective(fov, aspect, near, far);

// 최종 변환
const mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;
```

### 벡터 연산

```typescript
// 내적 (Dot Product) - 각도 계산
const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
const angle = Math.acos(dot / (length(v1) * length(v2)));

// 외적 (Cross Product) - 수직 벡터
const cross = {
  x: v1.y * v2.z - v1.z * v2.y,
  y: v1.z * v2.x - v1.x * v2.z,
  z: v1.x * v2.y - v1.y * v2.x,
};

// 정규화 (Normalize) - 단위 벡터
const length = Math.sqrt(v.x**2 + v.y**2 + v.z**2);
const normalized = { x: v.x/length, y: v.y/length, z: v.z/length };
```

---

## Viro 컴포넌트 레퍼런스

### 기본 구조

```typescript
import {
  ViroARSceneNavigator,
  ViroARScene,
  ViroNode,
  ViroBox,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroARPlane,
  ViroARImageMarker,
  ViroMaterials,
  ViroAnimations,
} from '@viro-community/react-viro';

export default function App() {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{ scene: ARScene }}
    />
  );
}
```

### 3D 객체

```typescript
// 기본 도형
<ViroBox position={[0, 0, -1]} scale={[0.1, 0.1, 0.1]} />
<ViroSphere position={[0, 0, -1]} radius={0.1} />
<ViroCylinder position={[0, 0, -1]} height={0.2} radius={0.05} />
<ViroPlane position={[0, 0, -1]} width={0.2} height={0.2} />

// 3D 모델
<Viro3DObject
  source={require('./model.gltf')}
  type="GLTF"
  position={[0, 0, -1]}
  scale={[0.1, 0.1, 0.1]}
  rotation={[0, 45, 0]}
  materials={['modelMaterial']}
  animation={{ name: 'idle', run: true, loop: true }}
  onClick={() => console.log('Clicked!')}
/>

// 텍스트
<ViroText
  text="Hello AR"
  position={[0, 1, -2]}
  scale={[0.5, 0.5, 0.5]}
  style={{ fontFamily: 'Arial', fontSize: 30, color: '#ffffff' }}
/>
```

### 조명

```typescript
// 주변광 (Ambient Light) - 전체 밝기
<ViroAmbientLight color="#ffffff" intensity={200} />

// 방향광 (Directional Light) - 태양광
<ViroDirectionalLight
  color="#ffffff"
  direction={[0, -1, -1]}  // 위에서 아래+앞
  intensity={500}
  castsShadow={true}
/>

// 스포트라이트 (Spot Light)
<ViroSpotLight
  position={[0, 2, 0]}
  color="#ffffff"
  direction={[0, -1, 0]}
  intensity={1000}
  innerAngle={5}
  outerAngle={45}
  castsShadow={true}
/>
```

### 머티리얼

```typescript
ViroMaterials.createMaterials({
  // 기본
  simple: {
    diffuseColor: '#ff0000',
  },
  
  // 텍스처
  textured: {
    diffuseTexture: require('./texture.png'),
  },
  
  // PBR
  pbr: {
    lightingModel: 'PBR',
    diffuseTexture: require('./albedo.png'),
    normalTexture: require('./normal.png'),
    metalnessTexture: require('./metalness.png'),
    roughnessTexture: require('./roughness.png'),
  },
  
  // 반투명
  transparent: {
    diffuseColor: '#ffffff',
    opacity: 0.5,
    blendMode: 'Alpha',
    writesToDepthBuffer: false,
  },
  
  // 비디오
  video: {
    diffuseTexture: { source: require('./video.mp4') },
  },
  
  // 크로마키
  chromakey: {
    diffuseTexture: require('./greenscreen.mp4'),
    chromaKeyFilteringColor: '#00ff00',
  },
});
```

### 애니메이션

```typescript
ViroAnimations.registerAnimations({
  rotate: {
    properties: { rotateY: '+=360' },
    duration: 2000,
    easing: 'Linear',
  },
  
  bounce: {
    properties: { positionY: '+=0.2' },
    duration: 500,
    easing: 'Bounce',
  },
  
  scaleUp: {
    properties: { scaleX: 2, scaleY: 2, scaleZ: 2 },
    duration: 1000,
    easing: 'EaseInEaseOut',
  },
  
  fadeIn: {
    properties: { opacity: 1.0 },
    duration: 1000,
  },
  
  // 시퀀스
  sequence: {
    properties: {
      positionY: [
        [0, 0, 0],
        [0.2, 500, 'Bounce'],
        [0, 1000, 'EaseOut'],
      ],
    },
  },
});

// 사용
<ViroBox
  animation={{
    name: 'rotate',
    run: true,
    loop: true,
    onFinish: () => console.log('Animation finished'),
  }}
/>
```

### AR 기능

```typescript
// 평면 감지
<ViroARPlane
  minHeight={0.1}
  minWidth={0.1}
  alignment="Horizontal"  // 'Horizontal' | 'Vertical'
  onPlaneSelected={(anchorPosition) => {
    console.log('Plane detected at:', anchorPosition);
  }}
  pauseUpdates={false}
>
  {/* 평면 위에 배치될 콘텐츠 */}
  <Viro3DObject source={require('./model.gltf')} />
</ViroARPlane>

// 이미지 추적
ViroARTrackingTargets.createTargets({
  poster: {
    source: require('./poster.jpg'),
    orientation: 'Up',
    physicalWidth: 0.3,  // 실제 크기 (m)
  },
});

<ViroARImageMarker target="poster">
  <ViroVideo
    source={require('./video.mp4')}
    width={0.3}
    height={0.2}
    loop={true}
  />
</ViroARImageMarker>
```

### 상호작용

```typescript
// 클릭
<ViroBox
  onClick={(position, source) => {
    console.log('Clicked at:', position);
  }}
/>

// 드래그
<ViroDraggable
  type="FixedToWorld"  // 'FixedToWorld' | 'FixedDistance' | 'FixedToPlane'
  onDrag={(dragToPos, source) => {
    console.log('Dragged to:', dragToPos);
  }}
>
  <ViroBox />
</ViroDraggable>

// 핀치 (확대/축소)
<ViroNode
  onPinch={(pinchState, scaleFactor, source) => {
    if (pinchState === 3) {  // 종료
      setScale(scale * scaleFactor);
    }
  }}
>
  <ViroBox scale={[scale, scale, scale]} />
</ViroNode>

// 회전
<ViroNode
  onRotate={(rotateState, rotationFactor, source) => {
    if (rotateState === 3) {
      setRotation(rotation + rotationFactor);
    }
  }}
>
  <ViroBox rotation={[0, rotation, 0]} />
</ViroNode>
```

### 물리

```typescript
<ViroNode
  physicsBody={{
    type: 'Dynamic',  // 'Dynamic' | 'Static' | 'Kinematic'
    mass: 1,
    shape: {
      type: 'Box',
      params: [0.1, 0.1, 0.1],
    },
    restitution: 0.8,  // 반발 계수 (0~1)
    friction: 0.5,
    useGravity: true,
  }}
  viroTag="ball"
  onCollision={(collidedTag, collidedPoint, collidedNormal) => {
    console.log('Collision with:', collidedTag);
  }}
>
  <ViroSphere radius={0.05} />
</ViroNode>

// 중력 설정
ViroPhysicsWorld.setGravity([0, -9.81, 0]);
```

---

## 일반적인 문제 해결

### 1. 객체가 보이지 않음

**원인**:
- 카메라 앞이 아닌 다른 위치에 배치
- 스케일이 너무 작거나 큼
- 머티리얼 문제 (투명도, 텍스처 로딩 실패)

**해결**:
```typescript
// 카메라 바로 앞 (-Z 방향) 적절한 거리에 배치
<ViroBox position={[0, 0, -1]} scale={[0.1, 0.1, 0.1]} />

// 머티리얼 확인
materials={['testMaterial']}

// 조명 추가
<ViroAmbientLight color="#ffffff" intensity={300} />
```

### 2. 평면이 감지되지 않음

**원인**:
- 조명 부족
- 텍스처가 없는 표면 (흰 벽, 유리)
- 움직임이 너무 빠름

**해결**:
```typescript
// 사용자에게 안내
<ViroText
  text="바닥을 천천히 스캔해주세요"
  position={[0, 0, -1]}
/>

// 평면 시각화로 디버그
<ViroARPlane onAnchorFound={() => console.log('Plane found!')}>
  <ViroQuad
    width={1}
    height={1}
    materials={['debugPlane']}
  />
</ViroARPlane>

ViroMaterials.createMaterials({
  debugPlane: {
    diffuseColor: '#00ff00',
    opacity: 0.3,
  },
});
```

### 3. 앱이 느려짐 (낮은 FPS)

**원인**:
- 폴리곤 수가 너무 많음
- 텍스처 해상도가 너무 높음
- 너무 많은 객체 렌더링
- 복잡한 쉐이더

**해결**:
```typescript
// 폴리곤 감소 (Blender에서 Decimate)
// 목표: 1~5만 폴리곤

// 텍스처 압축 및 크기 조절
// 2048x2048 이하 권장

// LOD 구현
const [cameraDistance, setCameraDistance] = useState(10);

{cameraDistance < 2 ? (
  <Viro3DObject source={require('./highpoly.obj')} />
) : (
  <Viro3DObject source={require('./lowpoly.obj')} />
)}

// 객체 풀링 (재사용)
```

### 4. 이미지 추적이 불안정

**원인**:
- 이미지가 너무 작음
- 특징점이 부족 (단색, 반복 패턴)
- 조명 변화

**해결**:
```typescript
// 고유한 특징이 있는 이미지 사용
// 최소 크기: 15cm 이상
// 고해상도 이미지

ViroARTrackingTargets.createTargets({
  goodMarker: {
    source: require('./complex-pattern.jpg'),  // 복잡한 패턴
    orientation: 'Up',
    physicalWidth: 0.3,  // 충분한 크기
  },
});
```

### 5. 터치 이벤트가 작동하지 않음

**원인**:
- 객체가 카메라로부터 너무 멀거나 가까움
- 다른 객체에 가려짐
- 이벤트 전파 문제

**해결**:
```typescript
// onClick이 아닌 onTouch 사용
<ViroBox
  onTouch={(touchState, touchPos, source) => {
    if (touchState === 1) {  // Touch Down
      console.log('Touched!');
    }
  }}
/>

// Hit Test 직접 구현
<ViroARScene
  onClick={(position) => {
    arSceneRef.current?.performARHitTestWithRay(position);
  }}
/>
```

### 6. Android와 iOS 동작 차이

**원인**:
- ARCore vs ARKit 기능 차이
- 좌표계 차이 (일반적으로 Viro가 추상화)

**해결**:
```typescript
import { Platform } from 'react-native';

// 플랫폼별 설정
const scale = Platform.OS === 'ios' ? [0.1, 0.1, 0.1] : [0.12, 0.12, 0.12];

// 기능 체크
const hasLiDAR = Platform.OS === 'ios' && DeviceInfo.hasLiDAR();

if (hasLiDAR) {
  // iOS LiDAR 전용 기능
}
```

---

## 성능 최적화 체크리스트

### 모델 최적화

- [ ] **폴리곤 수**: 1만~5만 이하
- [ ] **텍스처 크기**: 2048x2048 이하
- [ ] **텍스처 압축**: ASTC/ETC2 (Android), PVRTC (iOS)
- [ ] **Mipmapping**: 자동 LOD를 위해 활성화
- [ ] **불필요한 정점 제거**: Blender에서 Merge by Distance
- [ ] **법선 재계산**: Smooth Shading 적용

### 렌더링 최적화

- [ ] **Draw Call 최소화**: 동일 머티리얼 사용
- [ ] **Batching**: 가능한 객체 합치기
- [ ] **Frustum Culling**: 카메라 밖 객체 비활성화
- [ ] **Occlusion Culling**: 가려진 객체 렌더링 스킵
- [ ] **투명도 최소화**: Alpha 블렌딩은 비용이 큼
- [ ] **그림자 끄기**: 불필요하면 `castsShadow={false}`

### 코드 최적화

```typescript
// ❌ 나쁜 예: 매 프레임 새 객체 생성
<ViroARScene onTrackingUpdated={() => {
  setObjects([...objects, newObject]);  // 렌더링 비용 높음
}}>

// ✅ 좋은 예: 객체 재사용
const [objectPool] = useState(() => createObjectPool(100));

// ❌ 나쁜 예: 불필요한 상태 업데이트
const [rotation, setRotation] = useState(0);
useEffect(() => {
  const interval = setInterval(() => {
    setRotation(r => r + 1);  // 60fps로 상태 업데이트
  }, 16);
}, []);

// ✅ 좋은 예: 애니메이션 사용
<ViroBox animation={{ name: 'rotate', run: true, loop: true }} />

// ❌ 나쁜 예: 복잡한 조건부 렌더링
{objects.map(obj => (
  obj.visible && obj.distance < 10 && obj.active && ...
))}

// ✅ 좋은 예: 사전 필터링
const visibleObjects = useMemo(
  () => objects.filter(obj => obj.visible && obj.distance < 10),
  [objects]
);
```

### 메모리 최적화

- [ ] **텍스처 해제**: 사용하지 않는 텍스처 언로드
- [ ] **객체 풀링**: 재사용 가능한 객체는 풀에서 관리
- [ ] **이미지 압축**: 앱 번들 크기 감소
- [ ] **lazy Loading**: 필요할 때만 3D 모델 로드

```typescript
// 동적 로딩
const [model, setModel] = useState(null);

useEffect(() => {
  if (shouldLoadModel) {
    import('./largeModel.gltf').then(setModel);
  }
}, [shouldLoadModel]);
```

### 배터리 최적화

- [ ] **프레임레이트 제한**: 필요 없으면 30fps로 제한
- [ ] **센서 사용 최소화**: 불필요한 센서 비활성화
- [ ] **조명 수 제한**: 최대 3~4개
- [ ] **물리 시뮬레이션 최소화**: 필요한 객체만

```typescript
// 프레임레이트 제한
<ViroARScene
  physicsWorld={{ gravity: [0, -9.81, 0] }}
  updateInterval={33}  // 30fps
>
```

### 측정 도구

```typescript
// FPS 측정
let frameCount = 0;
let lastTime = Date.now();

<ViroARScene
  onTrackingUpdated={() => {
    frameCount++;
    const now = Date.now();
    
    if (now - lastTime >= 1000) {
      console.log('FPS:', frameCount);
      frameCount = 0;
      lastTime = now;
    }
  }}
>

// 렌더링 시간 측정
const startTime = performance.now();
// ... 렌더링 로직 ...
const endTime = performance.now();
console.log('Render time:', endTime - startTime, 'ms');
```

---

## 디버깅 팁

### AR 세션 상태 확인

```typescript
<ViroARScene
  onTrackingUpdated={(state, reason) => {
    console.log('Tracking State:', state);
    // ViroTrackingStateConstants.TRACKING_NORMAL
    // ViroTrackingStateConstants.TRACKING_LIMITED
    // ViroTrackingStateConstants.TRACKING_UNAVAILABLE
    
    console.log('Reason:', reason);
    // ViroTrackingReason.TRACKING_REASON_NONE
    // ViroTrackingReason.TRACKING_REASON_EXCESSIVE_MOTION
    // ViroTrackingReason.TRACKING_REASON_INSUFFICIENT_FEATURES
  }}
>
```

### 평면 디버그 시각화

```typescript
const [planes, setPlanes] = useState([]);

<ViroARScene>
  <ViroARPlaneSelector
    onPlaneSelected={(anchorMap) => {
      setPlanes(Object.values(anchorMap));
    }}
  >
    {/* 평면 시각화 */}
    {planes.map((plane, index) => (
      <ViroQuad
        key={index}
        position={plane.center}
        rotation={[-90, 0, 0]}
        width={plane.width}
        height={plane.height}
        materials={['debugPlane']}
      />
    ))}
  </ViroARPlaneSelector>
</ViroARScene>
```

### 로그 출력

```typescript
// Viro 이벤트 로깅
const logEvent = (event: string, data: any) => {
  console.log(`[AR Event] ${event}:`, JSON.stringify(data));
};

<ViroBox
  onClick={(pos) => logEvent('Box Click', pos)}
  onDrag={(pos) => logEvent('Box Drag', pos)}
  onCollision={(tag) => logEvent('Box Collision', tag)}
/>
```

---

## 유용한 코드 스니펫

### 거리 계산

```typescript
function distance(pos1: [number, number, number], pos2: [number, number, number]) {
  const dx = pos2[0] - pos1[0];
  const dy = pos2[1] - pos1[1];
  const dz = pos2[2] - pos1[2];
  return Math.sqrt(dx**2 + dy**2 + dz**2);
}
```

### 방향 벡터

```typescript
function getDirectionVector(from: Vector3, to: Vector3): Vector3 {
  const dir = {
    x: to.x - from.x,
    y: to.y - from.y,
    z: to.z - from.z,
  };
  
  const length = Math.sqrt(dir.x**2 + dir.y**2 + dir.z**2);
  
  return {
    x: dir.x / length,
    y: dir.y / length,
    z: dir.z / length,
  };
}
```

### 각도를 쿼터니언으로 변환

```typescript
function eulerToQuaternion(pitch: number, yaw: number, roll: number) {
  const cy = Math.cos(yaw * 0.5);
  const sy = Math.sin(yaw * 0.5);
  const cp = Math.cos(pitch * 0.5);
  const sp = Math.sin(pitch * 0.5);
  const cr = Math.cos(roll * 0.5);
  const sr = Math.sin(roll * 0.5);
  
  return {
    w: cr * cp * cy + sr * sp * sy,
    x: sr * cp * cy - cr * sp * sy,
    y: cr * sp * cy + sr * cp * sy,
    z: cr * cp * sy - sr * sp * cy,
  };
}
```

### 화면 좌표를 월드 좌표로

```typescript
function screenToWorld(
  screenPos: [number, number],
  camera: ARCamera,
  distance: number = 1
): [number, number, number] {
  // NDC 변환
  const ndc = {
    x: (screenPos[0] / screenWidth) * 2 - 1,
    y: -(screenPos[1] / screenHeight) * 2 + 1,
  };
  
  // Unproject
  const ray = camera.unproject(ndc);
  
  // 특정 거리의 점 계산
  return [
    camera.position[0] + ray.direction[0] * distance,
    camera.position[1] + ray.direction[1] * distance,
    camera.position[2] + ray.direction[2] * distance,
  ];
}
```

---

## 참고 링크

- [Viro 공식 문서](https://docs.viromedia.com/)
- [ARKit 문서](https://developer.apple.com/documentation/arkit/)
- [ARCore 문서](https://developers.google.com/ar)
- [Three.js 문서](https://threejs.org/docs/)
- [Blender 튜토리얼](https://www.blender.org/support/tutorials/)

---

**작성일**: 2025-11-08  
**버전**: 1.0

