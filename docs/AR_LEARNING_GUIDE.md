# 모바일 카메라 기반 AR 구현 완전 학습 가이드

본 문서는 모바일 디바이스 카메라 기반 증강현실(AR) 기능을 구현하기 위한 포괄적인 학습 가이드입니다. 4가지 핵심 관점(그래픽 기초, 코드/API 레벨, 네이티브 플랫폼, Viro 추상화)과 추가 필수 개념을 체계적으로 다룹니다.

---

## 목차

1. [그래픽 기초 개념](#1-그래픽-기초-개념)
2. [코드/API 레벨 구현](#2-코드api-레벨-구현)
3. [네이티브 플랫폼 AR 지식](#3-네이티브-플랫폼-ar-지식)
4. [Viro 라이브러리 구조](#4-viro-라이브러리-구조)
5. [추가 필수 개념](#5-추가-필수-개념)
6. [학습 로드맵](#6-학습-로드맵)

---

## 1. 그래픽 기초 개념

### 1.1 3D 오브젝트 구조

#### 1.1.1 메시(Mesh)
- **정의**: 3D 객체의 표면을 구성하는 정점(Vertex), 모서리(Edge), 면(Face)의 집합
- **구성 요소**:
  - **Vertices (정점)**: 3D 공간상의 점 좌표 (x, y, z)
  - **Edges (모서리)**: 두 정점을 연결하는 선
  - **Faces (면)**: 정점들로 둘러싸인 평면 (주로 삼각형)
  - **Normals (법선)**: 면의 방향을 나타내는 벡터, 조명 계산에 필수
- **응용**: 
  - 폴리곤 수가 많을수록 디테일하지만 성능 저하
  - 모바일 AR에서는 Low-poly 모델 사용 권장 (1만~5만 폴리곤)

#### 1.1.2 텍스처(Texture)
- **정의**: 3D 모델 표면에 입히는 2D 이미지
- **UV 매핑**: 3D 좌표를 2D 텍스처 좌표로 변환
  - U, V는 텍스처 이미지의 가로/세로 좌표 (0.0 ~ 1.0)
- **텍스처 종류**:
  - **Diffuse Map**: 기본 색상 정보
  - **Normal Map**: 표면의 미세한 요철 정보 (조명 반응)
  - **Specular Map**: 반사광 정보
  - **Roughness/Metallic Map**: PBR(물리 기반 렌더링) 재질 속성
- **최적화**:
  - 텍스처 압축 사용 (ETC2, ASTC 등)
  - Mipmapping으로 거리에 따른 텍스처 해상도 조절
  - 텍스처 아틀라스(여러 텍스처를 하나로 합침)

#### 1.1.3 머티리얼(Material)
- **정의**: 표면의 물리적 특성을 정의하는 속성 집합
- **주요 속성**:
  - Albedo/Base Color: 기본 색상
  - Metallic: 금속성 정도 (0=비금속, 1=금속)
  - Roughness: 표면 거칠기 (0=거울, 1=거친 표면)
  - Ambient Occlusion: 주변 음영
  - Emission: 자체 발광

### 1.2 렌더링 파이프라인

#### 1.2.1 렌더링 단계
1. **Application Stage (CPU)**:
   - 씬 그래프 관리
   - 컬링(Culling): 카메라 밖 객체 제거
   - LOD(Level of Detail) 선택
   
2. **Geometry Stage (GPU)**:
   - **Vertex Shader**: 정점 변환 및 처리
     - Model Transform: 로컬 → 월드 좌표
     - View Transform: 월드 → 카메라 좌표
     - Projection Transform: 3D → 2D 투영
   - Vertex Processing, Clipping
   
3. **Rasterization Stage**:
   - 정점을 픽셀로 변환
   - 각 픽셀의 깊이(Depth) 계산
   
4. **Fragment/Pixel Stage**:
   - **Fragment Shader**: 각 픽셀의 색상 계산
     - 텍스처 샘플링
     - 조명 계산
     - 쉐이딩(Shading)
   - Depth Test, Alpha Blending

#### 1.2.2 쉐이더(Shader)
- **정의**: GPU에서 실행되는 프로그래밍 가능한 렌더링 코드
- **주요 쉐이더 언어**:
  - GLSL (OpenGL Shading Language): OpenGL ES
  - HLSL (High Level Shading Language): DirectX
  - Metal Shading Language: iOS Metal
- **Vertex Shader 예시** (GLSL):
  ```glsl
  uniform mat4 u_modelMatrix;
  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;
  
  attribute vec3 a_position;
  attribute vec2 a_texcoord;
  
  varying vec2 v_texcoord;
  
  void main() {
      gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
      v_texcoord = a_texcoord;
  }
  ```

### 1.3 좌표계와 변환

#### 1.3.1 좌표계 종류
1. **Model/Local Space (로컬 좌표계)**:
   - 객체 자체의 좌표계
   - 모델링 도구에서 작업하는 기준
   
2. **World Space (월드 좌표계)**:
   - 씬 전체의 절대 좌표계
   - 모든 객체가 배치되는 기준
   
3. **View/Camera Space (카메라 좌표계)**:
   - 카메라 위치를 원점으로 하는 좌표계
   - 카메라가 바라보는 방향이 -Z 축
   
4. **Clip Space (클립 좌표계)**:
   - 투영 변환 후의 좌표계
   - 정규화된 디바이스 좌표 (-1 ~ 1)
   
5. **Screen Space (스크린 좌표계)**:
   - 최종 화면 픽셀 좌표

#### 1.3.2 변환 행렬(Transformation Matrix)
- **Translation (이동)**:
  ```
  [1  0  0  tx]
  [0  1  0  ty]
  [0  0  1  tz]
  [0  0  0  1 ]
  ```

- **Rotation (회전)** - Z축 기준:
  ```
  [cos(θ)  -sin(θ)  0  0]
  [sin(θ)   cos(θ)  0  0]
  [0        0       1  0]
  [0        0       0  1]
  ```

- **Scale (크기)**:
  ```
  [sx  0   0   0]
  [0   sy  0   0]
  [0   0   sz  0]
  [0   0   0   1]
  ```

- **복합 변환**: MVP Matrix = Projection × View × Model
- **쿼터니언(Quaternion)**: 짐벌 락 문제 해결을 위한 회전 표현 방식

#### 1.3.3 투영(Projection)
1. **Perspective Projection (원근 투영)**:
   - 멀리 있는 물체가 작게 보임
   - AR에서 주로 사용
   - FOV(Field of View), 종횡비, Near/Far Plane 필요
   
2. **Orthographic Projection (직교 투영)**:
   - 거리에 관계없이 크기 일정
   - 2D UI나 미니맵에 사용

### 1.4 조명(Lighting)

#### 1.4.1 조명 모델
1. **Phong Lighting Model**:
   - Ambient: 주변광 (일정한 밝기)
   - Diffuse: 확산광 (표면 방향에 따른 밝기)
   - Specular: 반사광 (하이라이트)
   
2. **PBR (Physically Based Rendering)**:
   - 물리적으로 정확한 빛의 상호작용
   - Metallic-Roughness 워크플로우
   - 현대 AR 엔진의 표준

#### 1.4.2 조명 타입
- **Directional Light**: 태양광처럼 평행한 빛
- **Point Light**: 전구처럼 사방으로 퍼지는 빛
- **Spot Light**: 손전등처럼 특정 방향으로 비추는 빛
- **Area Light**: 넓은 면적의 광원
- **Ambient Light**: 전체 씬의 기본 밝기

#### 1.4.3 그림자(Shadow)
- **Shadow Mapping**: 광원 시점에서 깊이 맵 생성
- **Shadow Volume**: 그림자 영역을 3D로 계산
- **Ray Tracing**: 광선 추적 (고급, 모바일에선 제한적)

### 1.5 성능 최적화 개념

#### 1.5.1 컬링(Culling)
- **Frustum Culling**: 카메라 시야 밖 객체 제거
- **Occlusion Culling**: 가려진 객체 제거
- **Backface Culling**: 뒷면 제거

#### 1.5.2 LOD (Level of Detail)
- 거리에 따라 모델 디테일 조절
- 멀리 있을수록 낮은 폴리곤 모델 사용

#### 1.5.3 Draw Call 최적화
- Batching: 여러 객체를 한 번에 렌더링
- Instancing: 동일 객체 여러 개를 효율적으로 렌더링

---

## 2. 코드/API 레벨 구현

### 2.1 그래픽 API

#### 2.1.1 OpenGL ES (모바일)
- **버전**: ES 2.0 (기본), ES 3.0/3.1 (고급)
- **주요 개념**:
  ```javascript
  // Vertex Buffer Object (VBO) 생성
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  // Shader 컴파일
  const shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  
  // 렌더링
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  ```

#### 2.1.2 Metal (iOS)
- Apple의 고성능 그래픽 API
- 더 낮은 오버헤드, 더 나은 성능
- ARKit과 네이티브 통합

#### 2.1.3 Vulkan (Android)
- 차세대 저수준 그래픽 API
- 멀티스레드 렌더링 지원
- ARCore와 통합 가능

### 2.2 3D 엔진/프레임워크

#### 2.2.1 Three.js (Web 기반)
```javascript
// 씬, 카메라, 렌더러 생성
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// 메시 생성
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 조명 추가
const light = new THREE.DirectionalLight(0xffffff, 1);
scene.add(light);

// 렌더링 루프
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  renderer.render(scene, camera);
}
```

#### 2.2.2 SceneKit (iOS)
```swift
// SCNScene 생성
let scene = SCNScene()

// 노드 생성
let box = SCNBox(width: 0.1, height: 0.1, length: 0.1, chamferRadius: 0)
let boxNode = SCNNode(geometry: box)
boxNode.position = SCNVector3(0, 0, -0.5)
scene.rootNode.addChildNode(boxNode)

// 머티리얼 설정
let material = SCNMaterial()
material.diffuse.contents = UIColor.red
box.materials = [material]
```

#### 2.2.3 Unity (크로스 플랫폼)
```csharp
// C# 스크립트
public class ARObject : MonoBehaviour {
    void Start() {
        // 객체 초기화
        transform.position = new Vector3(0, 0, 1);
    }
    
    void Update() {
        // 매 프레임 업데이트
        transform.Rotate(0, Time.deltaTime * 90, 0);
    }
}
```

### 2.3 AR 프레임워크 API 구조

#### 2.3.1 세션 관리
```typescript
// 공통 패턴
interface ARSession {
  // 세션 시작
  start(config: ARConfiguration): Promise<void>;
  
  // 세션 일시정지
  pause(): void;
  
  // 세션 재개
  resume(): void;
  
  // 현재 프레임 가져오기
  getCurrentFrame(): ARFrame;
  
  // 이벤트 리스너
  on(event: string, callback: Function): void;
}
```

#### 2.3.2 프레임 처리
```typescript
interface ARFrame {
  // 카메라 이미지
  capturedImage: Image;
  
  // 카메라 변환 (위치, 회전)
  camera: ARCamera;
  
  // 감지된 앵커들
  anchors: ARAnchor[];
  
  // 조명 추정
  lightEstimate: ARLightEstimate;
  
  // 타임스탬프
  timestamp: number;
}
```

#### 2.3.3 앵커 시스템
```typescript
interface ARAnchor {
  // 고유 식별자
  identifier: string;
  
  // 월드 좌표계에서의 변환 행렬 (4x4)
  transform: Matrix4;
  
  // 앵커 타입별 속성
  type: 'plane' | 'image' | 'face' | 'object';
}

interface ARPlaneAnchor extends ARAnchor {
  // 평면의 중심점
  center: Vector3;
  
  // 평면의 크기
  extent: { width: number; height: number };
  
  // 평면 방향 (수평/수직)
  alignment: 'horizontal' | 'vertical';
  
  // 평면 경계 정점
  geometry: Vector3[];
}
```

### 2.4 렌더링 통합

#### 2.4.1 카메라 배경 렌더링
```typescript
// AR 카메라 피드를 배경으로 렌더링
class ARBackgroundRenderer {
  setupCameraFeed(texture: Texture) {
    // 전체 화면을 덮는 쿼드(사각형) 생성
    const quad = createFullscreenQuad();
    
    // 카메라 텍스처를 쿼드에 매핑
    quad.material.map = texture;
    quad.material.depthWrite = false;
    
    // Z-버퍼 최하단에 렌더링
    quad.renderOrder = -1;
  }
  
  update(frame: ARFrame) {
    // 매 프레임 카메라 이미지 업데이트
    this.texture.update(frame.capturedImage);
  }
}
```

#### 2.4.2 가상 객체와 실제 환경 정합
```typescript
class ARRenderer {
  render(frame: ARFrame, scene: Scene) {
    // 1. 카메라 배경 렌더링
    this.renderBackground(frame);
    
    // 2. AR 카메라 매트릭스로 가상 카메라 업데이트
    this.updateCamera(frame.camera);
    
    // 3. 가상 객체 렌더링
    this.renderScene(scene);
    
    // 4. 후처리 (옵션)
    this.postProcess();
  }
  
  updateCamera(arCamera: ARCamera) {
    // View Matrix (카메라 위치/방향)
    this.camera.matrixWorldInverse.copy(arCamera.viewMatrix);
    
    // Projection Matrix (투영)
    this.camera.projectionMatrix.copy(arCamera.projectionMatrix);
  }
}
```

### 2.5 이벤트 처리

#### 2.5.1 터치/제스처 처리
```typescript
class ARInteractionHandler {
  handleTap(screenPoint: {x: number, y: number}, frame: ARFrame) {
    // 화면 좌표 → 3D 레이 변환
    const ray = this.screenPointToRay(screenPoint, frame.camera);
    
    // 평면과의 교차점 계산
    const hitResults = frame.hitTest(ray);
    
    if (hitResults.length > 0) {
      const hit = hitResults[0];
      // 앵커 추가
      const anchor = new ARAnchor(hit.worldTransform);
      frame.session.addAnchor(anchor);
      
      // 가상 객체 배치
      this.placeObject(anchor);
    }
  }
  
  screenPointToRay(point: {x: number, y: number}, camera: ARCamera): Ray {
    // NDC 변환 (-1 ~ 1)
    const ndc = {
      x: (point.x / screenWidth) * 2 - 1,
      y: -(point.y / screenHeight) * 2 + 1
    };
    
    // Inverse projection
    const rayOrigin = camera.position;
    const rayDirection = camera.unproject(ndc);
    
    return new Ray(rayOrigin, rayDirection);
  }
}
```

---

## 3. 네이티브 플랫폼 AR 지식

### 3.1 iOS - ARKit

#### 3.1.1 ARKit 아키텍처

**핵심 컴포넌트**:
1. **ARSession**: AR 경험의 중심 관리자
2. **ARConfiguration**: 추적 유형 및 기능 설정
3. **ARFrame**: 각 프레임의 AR 데이터
4. **ARAnchor**: 3D 공간의 실세계 위치/방향

#### 3.1.2 추적 모드 (ARConfiguration 종류)

**1. ARWorldTrackingConfiguration**:
- 6DoF (6자유도) 추적: 위치(x, y, z) + 회전(pitch, yaw, roll)
- 평면 감지: 수평/수직 표면
- 이미지 감지 및 추적
- 오브젝트 감지
- 환경 텍스처링
- Scene depth (LiDAR 지원 기기)

```swift
let configuration = ARWorldTrackingConfiguration()

// 평면 감지 활성화
configuration.planeDetection = [.horizontal, .vertical]

// 이미지 추적
configuration.detectionImages = referenceImages
configuration.maximumNumberOfTrackedImages = 2

// 환경 텍스처링 (PBR 조명 반영)
configuration.environmentTexturing = .automatic

// LiDAR Scene Depth (지원 기기)
if ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) {
    configuration.sceneReconstruction = .mesh
}

// 세션 실행
arSession.run(configuration)
```

**2. ARFaceTrackingConfiguration**:
- 얼굴 추적 (TrueDepth 카메라 필요)
- 52개 얼굴 랜드마크
- 표정 블렌드셰이프 (52가지 표정 값)

```swift
let faceConfig = ARFaceTrackingConfiguration()
faceConfig.maximumNumberOfTrackedFaces = 3  // 최대 3명 동시 추적
arSession.run(faceConfig)

// 얼굴 데이터 접근
if let faceAnchor = frame.anchors.first(where: { $0 is ARFaceAnchor }) as? ARFaceAnchor {
    let blendShapes = faceAnchor.blendShapes
    let eyeBlinkLeft = blendShapes[.eyeBlinkLeft]?.floatValue ?? 0
    let jawOpen = blendShapes[.jawOpen]?.floatValue ?? 0
}
```

**3. ARImageTrackingConfiguration**:
- 이미지 추적에 특화 (최대 100개 동시)
- 6DoF 추적 없음 (이미지 기준만)

**4. ARBodyTrackingConfiguration**:
- 전신 모션 캡처 (A12 Bionic 이상)
- 3D 스켈레톤 추적

**5. ARGeoTrackingConfiguration**:
- GPS + 비전 기반 위치 추적
- 실외 AR 경험

#### 3.1.3 평면 감지(Plane Detection)

```swift
// ARSessionDelegate 구현
func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
    for anchor in anchors {
        if let planeAnchor = anchor as? ARPlaneAnchor {
            // 평면 감지됨
            print("Plane detected: \(planeAnchor.alignment)")
            
            // 평면 시각화
            let planeNode = createPlaneNode(for: planeAnchor)
            sceneView.scene.rootNode.addChildNode(planeNode)
        }
    }
}

// 평면 업데이트 (크기 확장 등)
func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
    for anchor in anchors {
        if let planeAnchor = anchor as? ARPlaneAnchor {
            updatePlaneNode(for: planeAnchor)
        }
    }
}
```

#### 3.1.4 Hit Testing

```swift
// 화면 탭 위치에서 실제 3D 좌표 찾기
@IBAction func handleTap(_ sender: UITapGestureRecognizer) {
    let touchLocation = sender.location(in: sceneView)
    
    // ARKit Hit Test (ARKit 3+에서는 raycast 권장)
    let hitTestResults = sceneView.hitTest(touchLocation, types: [.existingPlaneUsingExtent])
    
    if let hit = hitTestResults.first {
        // 월드 좌표 변환
        let worldTransform = hit.worldTransform
        let position = SCNVector3(
            worldTransform.columns.3.x,
            worldTransform.columns.3.y,
            worldTransform.columns.3.z
        )
        
        // 앵커 추가
        let anchor = ARAnchor(transform: worldTransform)
        sceneView.session.add(anchor: anchor)
    }
}

// Raycasting (ARKit 3.5+, 권장 방식)
func raycast(from point: CGPoint) {
    guard let query = sceneView.raycastQuery(
        from: point,
        allowing: .existingPlaneGeometry,
        alignment: .any
    ) else { return }
    
    let results = sceneView.session.raycast(query)
    if let result = results.first {
        let anchor = ARAnchor(transform: result.worldTransform)
        sceneView.session.add(anchor: anchor)
    }
}
```

#### 3.1.5 조명 추정(Light Estimation)

```swift
func session(_ session: ARSession, didUpdate frame: ARFrame) {
    guard let lightEstimate = frame.lightEstimate else { return }
    
    // 주변 밝기
    let ambientIntensity = lightEstimate.ambientIntensity  // 0-2000 lumen
    let ambientColorTemperature = lightEstimate.ambientColorTemperature  // Kelvin
    
    // SceneKit 조명 업데이트
    lightNode.light?.intensity = ambientIntensity
    lightNode.light?.temperature = ambientColorTemperature
}

// HDR 환경 텍스처 (ARKit 4+)
if let environmentTexture = frame.lightEstimate?.environmentTexture {
    sceneView.scene.lightingEnvironment.contents = environmentTexture
}
```

#### 3.1.6 Scene Reconstruction (LiDAR)

```swift
// ARKit 3.5+ LiDAR 지원 기기
let config = ARWorldTrackingConfiguration()

if ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) {
    config.sceneReconstruction = .mesh
}

// Mesh Anchor 접근
func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
    for anchor in anchors {
        if let meshAnchor = anchor as? ARMeshAnchor {
            // 메시 지오메트리
            let vertices = meshAnchor.geometry.vertices
            let faces = meshAnchor.geometry.faces
            let normals = meshAnchor.geometry.normals
            
            // 충돌 감지, 오클루전 등에 활용
            createOcclusionGeometry(from: meshAnchor)
        }
    }
}
```

#### 3.1.7 ARKit 통합 프레임워크

**RealityKit** (iOS 13+):
- 고수준 렌더링 엔진
- PBR 자동 지원
- 애니메이션, 물리 엔진 내장
- SwiftUI 통합

```swift
import RealityKit

// RealityKit 엔티티
let box = ModelEntity(mesh: .generateBox(size: 0.1))
let material = SimpleMaterial(color: .red, isMetallic: true)
box.model?.materials = [material]

// AnchorEntity로 AR 공간에 배치
let anchor = AnchorEntity(plane: .horizontal)
anchor.addChild(box)

arView.scene.addAnchor(anchor)
```

**SceneKit**:
- 범용 3D 그래픽 프레임워크
- ARKit과 통합 (ARSCNView)

```swift
import ARKit
import SceneKit

let sceneView = ARSCNView()
sceneView.delegate = self

// AR 세션 연결
sceneView.session.run(ARWorldTrackingConfiguration())
```

### 3.2 Android - ARCore

#### 3.2.1 ARCore 아키텍처

**핵심 컴포넌트**:
1. **Session**: AR 시스템 관리
2. **Config**: 추적 기능 설정
3. **Frame**: 매 프레임 AR 데이터
4. **Trackable**: 추적 가능 객체 (Plane, Point, Image 등)
5. **Anchor**: 3D 공간 고정점

#### 3.2.2 모션 추적(Motion Tracking)

```kotlin
// Session 생성
val session = Session(context)

// Config 설정
val config = Config(session).apply {
    // 평면 감지 모드
    planeFindingMode = Config.PlaneFindingMode.HORIZONTAL_AND_VERTICAL
    
    // 조명 추정
    lightEstimationMode = Config.LightEstimationMode.ENVIRONMENTAL_HDR
    
    // Depth 모드 (지원 기기)
    depthMode = Config.DepthMode.AUTOMATIC
    
    // Instant Placement (즉시 배치)
    instantPlacementMode = Config.InstantPlacementMode.LOCAL_Y_UP
}

session.configure(config)

// 프레임 업데이트
fun onDrawFrame() {
    val frame = session.update()
    
    // 카메라 포즈
    val cameraPose = frame.camera.pose
    val cameraPosition = cameraPose.translation
    val cameraRotation = cameraPose.rotationQuaternion
    
    // 추적 상태
    when (frame.camera.trackingState) {
        TrackingState.TRACKING -> {
            // 정상 추적 중
        }
        TrackingState.PAUSED -> {
            // 추적 일시정지 (조명 부족, 움직임 과다 등)
        }
        TrackingState.STOPPED -> {
            // 추적 중단
        }
    }
}
```

#### 3.2.3 환경 이해(Environmental Understanding)

**평면 감지**:
```kotlin
fun detectPlanes(frame: Frame) {
    val planes = session.getAllTrackables(Plane::class.java).filter {
        it.trackingState == TrackingState.TRACKING
    }
    
    planes.forEach { plane ->
        // 평면 타입
        when (plane.type) {
            Plane.Type.HORIZONTAL_UPWARD_FACING -> {
                // 바닥, 테이블
            }
            Plane.Type.HORIZONTAL_DOWNWARD_FACING -> {
                // 천장
            }
            Plane.Type.VERTICAL -> {
                // 벽
            }
        }
        
        // 평면 중심점
        val center = plane.centerPose
        
        // 평면 범위
        val extentX = plane.extentX
        val extentZ = plane.extentZ
        
        // 평면 경계 (2D 폴리곤)
        val polygon = plane.polygon
    }
}
```

**Hit Test**:
```kotlin
fun onTap(motionEvent: MotionEvent) {
    val frame = session.update()
    
    // 화면 좌표로 히트 테스트
    val hits = frame.hitTest(motionEvent.x, motionEvent.y)
    
    for (hit in hits) {
        val trackable = hit.trackable
        
        // 평면과 충돌
        if (trackable is Plane && trackable.isPoseInPolygon(hit.hitPose)) {
            // Anchor 생성 및 객체 배치
            val anchor = trackable.createAnchor(hit.hitPose)
            placeObject(anchor)
            break
        }
    }
}
```

#### 3.2.4 Depth API (깊이 정보)

```kotlin
// Depth 지원 확인
val isDepthSupported = session.isDepthModeSupported(Config.DepthMode.AUTOMATIC)

if (isDepthSupported) {
    config.depthMode = Config.DepthMode.AUTOMATIC
}

// Depth 이미지 가져오기
fun getDepthImage(frame: Frame) {
    try {
        val depthImage = frame.acquireDepthImage16Bits()
        
        // 깊이 값 접근
        val width = depthImage.width
        val height = depthImage.height
        val buffer = depthImage.planes[0].buffer
        
        // 특정 픽셀의 깊이 (mm 단위)
        val depthValue = buffer.getShort(y * width + x).toInt()
        val depthMeters = depthValue / 1000.0f
        
        depthImage.close()
    } catch (e: NotYetAvailableException) {
        // Depth 아직 준비 안됨
    }
}

// Occlusion (가림) - 가상 객체가 실제 물체에 가려짐
// Sceneform이나 Filament로 Depth 텍스처를 쉐이더에 전달하여 구현
```

#### 3.2.5 조명 추정

```kotlin
fun updateLighting(frame: Frame) {
    val lightEstimate = frame.lightEstimate
    
    // 기본 모드
    val pixelIntensity = lightEstimate.pixelIntensity  // 0-1
    
    // Environmental HDR 모드
    if (config.lightEstimationMode == Config.LightEstimationMode.ENVIRONMENTAL_HDR) {
        // 환경 큐브맵
        val environmentalHdrCubeMap = lightEstimate.environmentalHdrCubeMap
        
        // 주광 방향 및 강도
        val mainLightDirection = lightEstimate.environmentalHdrMainLightDirection
        val mainLightIntensity = lightEstimate.environmentalHdrMainLightIntensity
        
        // 구면 조화 함수 (Spherical Harmonics)
        val sphericalHarmonics = lightEstimate.environmentalHdrAmbientSphericalHarmonics
        
        // Filament 엔진에 적용
        updateFilamentLighting(environmentalHdrCubeMap, mainLightDirection, mainLightIntensity)
    }
}
```

#### 3.2.6 Augmented Images (이미지 추적)

```kotlin
// 참조 이미지 데이터베이스 생성
val imageDatabase = AugmentedImageDatabase(session)
imageDatabase.addImage("dog", dogBitmap, 0.1f)  // 실제 크기 0.1m

// Config에 설정
config.augmentedImageDatabase = imageDatabase
session.configure(config)

// 이미지 추적
fun trackImages(frame: Frame) {
    val images = session.getAllTrackables(AugmentedImage::class.java)
    
    images.forEach { image ->
        if (image.trackingState == TrackingState.TRACKING) {
            // 이미지 인덱스 및 이름
            val index = image.index
            val name = image.name
            
            // 이미지 중심 포즈
            val centerPose = image.centerPose
            
            // 이미지 크기
            val extentX = image.extentX
            val extentZ = image.extentZ
            
            // Anchor 생성
            val anchor = image.createAnchor(centerPose)
            placeObjectOnImage(anchor)
        }
    }
}
```

#### 3.2.7 Cloud Anchors (멀티플레이어)

```kotlin
// Local Anchor를 Cloud로 호스팅
fun hostCloudAnchor(localAnchor: Anchor) {
    val cloudAnchor = session.hostCloudAnchorWithTtl(
        localAnchor,
        365  // TTL (days)
    )
    
    // 호스팅 상태 확인
    when (cloudAnchor.cloudAnchorState) {
        Anchor.CloudAnchorState.SUCCESS -> {
            val cloudAnchorId = cloudAnchor.cloudAnchorId
            // ID를 서버에 저장하여 다른 사용자와 공유
            shareCloudAnchorId(cloudAnchorId)
        }
        Anchor.CloudAnchorState.ERROR_HOSTING_SERVICE_UNAVAILABLE -> {
            // 네트워크 오류
        }
    }
}

// Cloud Anchor 해결 (다른 기기에서)
fun resolveCloudAnchor(cloudAnchorId: String) {
    val resolvedAnchor = session.resolveCloudAnchor(cloudAnchorId)
    
    // 해결 상태 확인
    if (resolvedAnchor.cloudAnchorState == Anchor.CloudAnchorState.SUCCESS) {
        // Anchor 사용 가능
        placeObject(resolvedAnchor)
    }
}
```

#### 3.2.8 렌더링 통합

**Sceneform** (deprecated, 참고용):
```kotlin
val sceneView = ArSceneView(context)
sceneView.scene.addOnUpdateListener { frameTime ->
    val frame = sceneView.arFrame ?: return@addOnUpdateListener
    
    // AR 로직
}

// 3D 모델 로드
ModelRenderable.builder()
    .setSource(context, Uri.parse("model.glb"))
    .build()
    .thenAccept { renderable ->
        val node = AnchorNode(anchor)
        node.renderable = renderable
        sceneView.scene.addChild(node)
    }
```

**Filament** (권장):
- Google의 고성능 렌더링 엔진
- PBR 완전 지원
- ARCore와 낮은 수준 통합

### 3.3 visionOS (Apple Vision Pro)

#### 3.3.1 visionOS 아키텍처

**공간 컴퓨팅(Spatial Computing)**:
- 완전한 3D 환경
- 가상과 실제의 경계 없음
- Hand tracking, Eye tracking

#### 3.3.2 RealityKit for visionOS

```swift
import RealityKit
import SwiftUI

struct ImmersiveView: View {
    var body: some View {
        RealityView { content in
            // 3D 엔티티 추가
            let entity = ModelEntity(mesh: .generateSphere(radius: 0.1))
            content.add(entity)
        }
        .immersionStyle(selection: .constant(.full), in: .full)
    }
}
```

#### 3.3.3 Spatial Anchors

```swift
// World Anchor (공간 고정)
let worldAnchor = AnchorEntity(.world(transform: transform))

// Plane Anchor (표면 감지)
let planeAnchor = AnchorEntity(.plane(.horizontal, classification: .table, minimumBounds: [0.2, 0.2]))

// Image Anchor
let imageAnchor = AnchorEntity(.image(group: "AR Resources", name: "marker"))
```

#### 3.3.4 Hand Tracking

```swift
// Hand Tracking 입력
let handTracking = SpatialEventGesture(.hand)

entity.setHandTracking(handTracking)
    .onChanged { value in
        // Hand pose 업데이트
        let handPose = value.inputDevicePose
    }
```

---

## 4. Viro 라이브러리 구조

### 4.1 Viro 개요

**ViroReact**:
- React Native 기반 AR/VR 프레임워크
- ARKit(iOS)와 ARCore(Android)를 통합 추상화
- 선언적(Declarative) 3D 씬 구성

### 4.2 Viro 컴포넌트 계층 구조

```
ViroARScene (루트)
├── ViroAmbientLight
├── ViroDirectionalLight
├── ViroNode (그룹)
│   ├── Viro3DObject (.obj, .gltf, .vrx)
│   ├── ViroBox / ViroSphere / ViroText
│   └── ViroNode (중첩 가능)
├── ViroARPlane (평면 감지)
├── ViroARImageMarker (이미지 추적)
└── ViroARCamera (카메라 컨트롤)
```

### 4.3 기본 AR 씬 구조

```typescript
import { ViroARSceneNavigator } from '@viro-community/react-viro';

export default function App() {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{
        scene: ARScene,
      }}
    />
  );
}

function ARScene() {
  return (
    <ViroARScene>
      {/* 조명 */}
      <ViroAmbientLight color="#ffffff" intensity={200} />
      
      {/* 3D 객체 */}
      <ViroBox
        position={[0, 0, -1]}
        scale={[0.1, 0.1, 0.1]}
        materials={["boxMaterial"]}
        onClick={() => console.log('Box clicked!')}
      />
    </ViroARScene>
  );
}

// 머티리얼 정의
ViroMaterials.createMaterials({
  boxMaterial: {
    diffuseColor: '#ff0000',
    lightingModel: 'PBR',
    metalness: 0.8,
    roughness: 0.2,
  },
});
```

### 4.4 주요 추상화 개념

#### 4.4.1 씬 그래프(Scene Graph)
- **ViroNode**: 변환(위치, 회전, 스케일) 그룹화
- 부모-자식 관계로 상대 좌표계 구성

```typescript
<ViroNode position={[0, 0, -2]} rotation={[0, 45, 0]}>
  {/* 자식 객체들은 부모 기준 상대 좌표 */}
  <ViroBox position={[0.1, 0, 0]} />  // 실제 월드: [0.1, 0, -2]
  <ViroSphere position={[-0.1, 0, 0]} />
</ViroNode>
```

#### 4.4.2 머티리얼 시스템
```typescript
ViroMaterials.createMaterials({
  // PBR 머티리얼
  metalPBR: {
    lightingModel: 'PBR',
    diffuseTexture: require('./texture.png'),
    normalTexture: require('./normal.png'),
    metalnessTexture: require('./metalness.png'),
    roughnessTexture: require('./roughness.png'),
  },
  
  // 비디오 머티리얼
  videoMaterial: {
    diffuseTexture: { source: require('./video.mp4') },
  },
  
  // 반투명
  glassMaterial: {
    diffuseColor: '#ffffff',
    opacity: 0.3,
    blendMode: 'Alpha',
  },
});
```

#### 4.4.3 애니메이션
```typescript
// 선언적 애니메이션
<ViroBox
  animation={{
    name: 'rotate',
    run: true,
    loop: true,
  }}
/>

// 애니메이션 정의
ViroAnimations.registerAnimations({
  rotate: {
    properties: {
      rotateY: '+=360',  // 360도 회전
    },
    duration: 2000,
    easing: 'Linear',
  },
  
  bounce: {
    properties: {
      positionY: '+=0.2',
    },
    duration: 500,
    easing: 'Bounce',
  },
});
```

### 4.5 AR 특화 기능

#### 4.5.1 평면 감지 및 배치

```typescript
function ARScene() {
  const [planeDetected, setPlaneDetected] = useState(false);
  
  return (
    <ViroARScene>
      {/* AR 평면 감지 */}
      <ViroARPlane
        minHeight={0.1}
        minWidth={0.1}
        alignment="Horizontal"
        onPlaneSelected={(anchorPosition) => {
          setPlaneDetected(true);
          console.log('Plane at:', anchorPosition);
        }}
      >
        {/* 평면 위에 배치될 객체 */}
        <Viro3DObject
          source={require('./model.gltf')}
          type="GLTF"
          scale={[0.1, 0.1, 0.1]}
        />
      </ViroARPlane>
    </ViroARScene>
  );
}
```

#### 4.5.2 이미지 추적

```typescript
// 이미지 타겟 등록
ViroARTrackingTargets.createTargets({
  poster: {
    source: require('./poster.jpg'),
    orientation: 'Up',
    physicalWidth: 0.3,  // 실제 크기(m)
  },
});

// 이미지 마커 사용
<ViroARImageMarker target="poster">
  {/* 이미지 위에 배치될 AR 콘텐츠 */}
  <ViroVideo
    source={require('./promo.mp4')}
    loop={true}
    width={0.3}
    height={0.2}
  />
</ViroARImageMarker>
```

#### 4.5.3 Hit Test (표면 탐지)

```typescript
function ARScene() {
  const arSceneRef = useRef<ViroARSceneNavigator>(null);
  const [objectPosition, setObjectPosition] = useState([0, 0, -1]);
  
  const handleARHitTest = (position: [number, number]) => {
    arSceneRef.current?.arSceneNavigator.performARHitTestWithRay(
      position,
      (results) => {
        if (results.length > 0) {
          const hit = results[0];
          setObjectPosition([
            hit.transform.position[0],
            hit.transform.position[1],
            hit.transform.position[2],
          ]);
        }
      }
    );
  };
  
  return (
    <ViroARScene
      ref={arSceneRef}
      onClick={(position) => handleARHitTest(position)}
    >
      <ViroBox position={objectPosition} />
    </ViroARScene>
  );
}
```

#### 4.5.4 Anchor 시스템

```typescript
// AR Anchor 생성
const [anchorId, setAnchorId] = useState<string | null>(null);

<ViroARScene
  onTrackingUpdated={(state) => {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      // Anchor 추가
      ViroARSceneNavigator.findNode(ref => {
        ref.addARImageMarkerWithAnchor(
          { position: [0, 0, -1] },
          (anchorId) => setAnchorId(anchorId)
        );
      });
    }
  }}
>
  {/* Anchor 기반 객체 */}
  {anchorId && (
    <ViroNode key={anchorId}>
      <Viro3DObject source={require('./model.obj')} />
    </ViroNode>
  )}
</ViroARScene>
```

### 4.6 Viro의 네이티브 브릿지

#### 4.6.1 플랫폼별 매핑

| Viro 추상화 | iOS (ARKit) | Android (ARCore) |
|------------|-------------|------------------|
| ViroARPlane | ARPlaneAnchor | Plane (Trackable) |
| ViroARImageMarker | ARImageAnchor | AugmentedImage |
| ViroARCamera | ARCamera | Camera |
| ViroAmbientLight | SCNLight (ambient) | Light (ambient) |
| Hit Test | ARHitTestResult | Frame.hitTest() |

#### 4.6.2 네이티브 모듈 확장

```typescript
// iOS 네이티브 모듈 (Swift)
@objc(ViroARModule)
class ViroARModule: NSObject {
  @objc
  func captureScreenshot(_ resolve: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
    // ARSCNView에서 스크린샷 캡처
    let image = arSceneView.snapshot()
    resolve(image.toBase64())
  }
}

// React Native에서 호출
import { NativeModules } from 'react-native';
const { ViroARModule } = NativeModules;

await ViroARModule.captureScreenshot();
```

### 4.7 성능 최적화

#### 4.7.1 객체 풀링
```typescript
// 객체 재사용 패턴
const [particles, setParticles] = useState([]);

const spawnParticle = () => {
  const newParticle = {
    id: uuid(),
    position: [0, 1, -2],
    active: true,
  };
  
  setParticles(prev => [...prev, newParticle]);
  
  // 2초 후 재활용
  setTimeout(() => {
    setParticles(prev => 
      prev.map(p => p.id === newParticle.id ? { ...p, active: false } : p)
    );
  }, 2000);
};

return (
  <ViroARScene>
    {particles.filter(p => p.active).map(particle => (
      <ViroSphere key={particle.id} position={particle.position} />
    ))}
  </ViroARScene>
);
```

#### 4.7.2 LOD (Level of Detail)
```typescript
// 거리 기반 모델 전환
const [cameraDistance, setCameraDistance] = useState(10);

<ViroNode
  onTransformUpdate={(position) => {
    const distance = Math.sqrt(
      position[0]**2 + position[1]**2 + position[2]**2
    );
    setCameraDistance(distance);
  }}
>
  {cameraDistance < 2 ? (
    <Viro3DObject source={require('./highpoly.obj')} />
  ) : (
    <Viro3DObject source={require('./lowpoly.obj')} />
  )}
</ViroNode>
```

---

## 5. 추가 필수 개념

### 5.1 SLAM (Simultaneous Localization and Mapping)

#### 5.1.1 SLAM 원리
- **Visual SLAM**: 카메라 이미지 기반
- **Visual-Inertial SLAM**: 카메라 + IMU(관성 센서)
- **Process**:
  1. 특징점 추출 (Feature Detection)
  2. 특징점 매칭 (Feature Matching)
  3. 모션 추정 (Motion Estimation)
  4. 지도 구축 (Mapping)
  5. 루프 클로저 (Loop Closure) - 재방문 감지

#### 5.1.2 특징점 추출 알고리즘
- **ORB (Oriented FAST and Rotated BRIEF)**: ARCore, ARKit 기본
- **SIFT/SURF**: 고급 특징점 검출
- **AKAZE**: 빠른 특징점 매칭

#### 5.1.3 포즈 추정(Pose Estimation)
```typescript
// 카메라 포즈 = [R | t] (회전 + 평행이동)
interface CameraPose {
  position: [x: number, y: number, z: number];
  rotation: [pitch: number, yaw: number, roll: number];
  // 또는
  transformMatrix: Matrix4x4;  // 4x4 동차 변환 행렬
}
```

### 5.2 센서 퓨전(Sensor Fusion)

#### 5.2.1 IMU (Inertial Measurement Unit)
- **Accelerometer (가속도계)**: 선형 가속도 측정
- **Gyroscope (자이로스코프)**: 각속도 측정
- **Magnetometer (자기계)**: 방향 측정 (나침반)

#### 5.2.2 칼만 필터(Kalman Filter)
- 노이즈가 있는 센서 데이터를 융합하여 정확한 상태 추정
- ARKit, ARCore 내부적으로 사용

```typescript
// 개념적 칼만 필터 구조
class KalmanFilter {
  predict(controlInput) {
    // 시스템 모델로 다음 상태 예측
    this.state = this.transitionMatrix * this.state + controlInput;
  }
  
  update(measurement) {
    // 측정값으로 상태 보정
    const kalmanGain = this.calculateGain();
    this.state += kalmanGain * (measurement - this.state);
  }
}
```

### 5.3 공간 매핑(Spatial Mapping)

#### 5.3.1 Depth Sensing
- **Stereo Vision**: 두 카메라 시차로 깊이 계산
- **Structured Light**: 패턴 투사 (iPhone Face ID)
- **ToF (Time of Flight)**: 빛의 왕복 시간 측정
- **LiDAR**: 레이저 거리 측정 (iPad Pro, iPhone Pro)

#### 5.3.2 3D 메시 재구성
```typescript
// LiDAR 기반 메시 재구성 (ARKit)
if let meshAnchor = anchor as? ARMeshAnchor {
  let vertices = meshAnchor.geometry.vertices.buffer
  let faces = meshAnchor.geometry.faces.buffer
  
  // 3D 메시 생성
  let geometry = SCNGeometry(
    sources: [vertexSource],
    elements: [faceElement]
  )
}
```

#### 5.3.3 Occlusion (가림)
- 실제 물체가 가상 객체를 가림
- Depth 정보로 Z-버퍼 마스킹

```glsl
// Fragment Shader에서 Occlusion
uniform sampler2D u_depthTexture;

void main() {
  float sceneDepth = texture2D(u_depthTexture, v_texcoord).r;
  float fragmentDepth = gl_FragCoord.z;
  
  if (fragmentDepth > sceneDepth) {
    discard;  // 가려진 픽셀 제거
  }
  
  gl_FragColor = texture2D(u_texture, v_texcoord);
}
```

### 5.4 상호작용(Interaction)

#### 5.4.1 제스처 인식
```typescript
// Pinch to Scale
<ViroDraggable
  onPinch={(pinchState, scaleFactor) => {
    if (pinchState === 3) {  // 종료
      setScale(scale * scaleFactor);
    }
  }}
  type="FixedToWorld"
>
  <ViroBox scale={[scale, scale, scale]} />
</ViroDraggable>

// Drag
<ViroDraggable
  onDrag={(dragToPos, source) => {
    console.log('Dragged to:', dragToPos);
  }}
>
  <Viro3DObject source={require('./model.obj')} />
</ViroDraggable>
```

#### 5.4.2 물리 엔진
```typescript
// Viro Physics
<ViroNode
  physicsBody={{
    type: 'Dynamic',  // 또는 'Static', 'Kinematic'
    mass: 1,
    shape: { type: 'Box', params: [0.1, 0.1, 0.1] },
    restitution: 0.8,  // 반발 계수
    friction: 0.5,
  }}
  onCollision={(collidedTag) => {
    console.log('Collision with:', collidedTag);
  }}
>
  <ViroBox scale={[0.1, 0.1, 0.1]} />
</ViroNode>

// 중력 설정
ViroPhysicsWorld.setGravity([0, -9.81, 0]);
```

### 5.5 네트워킹 및 멀티플레이어

#### 5.5.1 Cloud Anchors
- **ARCore Cloud Anchors**: Google Cloud
- **Azure Spatial Anchors**: Microsoft Azure
- **Immersal**: 크로스 플랫폼 클라우드 매핑

```typescript
// Cloud Anchor 공유 플로우
async function hostCloudAnchor(localAnchor) {
  // 1. 로컬 앵커를 클라우드에 호스팅
  const cloudAnchorId = await ARModule.hostCloudAnchor(localAnchor);
  
  // 2. ID를 서버에 저장
  await fetch('https://api.myapp.com/anchors', {
    method: 'POST',
    body: JSON.stringify({ anchorId: cloudAnchorId, roomId }),
  });
  
  return cloudAnchorId;
}

async function resolveCloudAnchor(cloudAnchorId) {
  // 다른 기기에서 앵커 해결
  const anchor = await ARModule.resolveCloudAnchor(cloudAnchorId);
  return anchor;
}
```

#### 5.5.2 실시간 동기화
```typescript
// WebSocket으로 AR 상태 동기화
const socket = new WebSocket('wss://api.myapp.com/ar');

// 로컬 객체 이동 시 전송
function onObjectMove(objectId, position, rotation) {
  socket.send(JSON.stringify({
    type: 'object_update',
    objectId,
    position,
    rotation,
  }));
}

// 원격 업데이트 수신
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'object_update') {
    updateRemoteObject(data.objectId, data.position, data.rotation);
  }
};
```

### 5.6 성능 및 배터리 최적화

#### 5.6.1 프레임레이트 관리
```typescript
// 프레임레이트 제한
<ViroARScene
  physicsWorld={{ gravity: [0, -9.81, 0] }}
  updateInterval={33}  // 30fps (1000ms / 30)
>
```

#### 5.6.2 텍스처 최적화
- **압축 포맷**: ETC2 (Android), PVRTC (iOS), ASTC (공통)
- **Mipmapping**: 자동 LOD
- **Texture Atlas**: 여러 텍스처 합치기

#### 5.6.3 지오메트리 최적화
- **폴리곤 감소**: Blender에서 Decimate Modifier
- **오클루전 컬링**: 보이지 않는 객체 렌더링 스킵
- **인스턴싱**: 동일 모델 여러 개를 한 번에 렌더링

### 5.7 사용자 경험(UX) 설계

#### 5.7.1 AR UX 원칙
1. **온보딩**: 처음 사용자에게 표면 스캔 가이드
2. **피드백**: 평면 감지 시각화, 터치 반응
3. **안전**: 걸어다니는 사용자 고려, 경고 메시지
4. **컨텍스트**: 실제 환경에 맞는 스케일, 위치

#### 5.7.2 평면 감지 가이드
```typescript
<ViroARScene>
  {!planeDetected && (
    <ViroText
      text="바닥을 천천히 스캔해주세요"
      position={[0, 0, -1]}
      style={{ color: '#ffffff' }}
    />
  )}
  
  <ViroARPlane
    onAnchorFound={() => {
      setPlaneDetected(true);
      // 햅틱 피드백
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }}
  >
    {/* AR 콘텐츠 */}
  </ViroARPlane>
</ViroARScene>
```

### 5.8 디버깅 및 테스팅

#### 5.8.1 AR 디버그 시각화
```typescript
// 평면 시각화
<ViroARPlane>
  <ViroQuad
    width={planeExtent.x}
    height={planeExtent.z}
    rotation={[-90, 0, 0]}
    materials={['planeMaterial']}
  />
</ViroARPlane>

ViroMaterials.createMaterials({
  planeMaterial: {
    diffuseColor: '#ffffff',
    opacity: 0.3,
    writesToDepthBuffer: false,
  },
});
```

#### 5.8.2 성능 프로파일링
```typescript
// FPS 모니터링
let lastFrameTime = Date.now();
let frameCount = 0;

<ViroARScene
  onTrackingUpdated={() => {
    frameCount++;
    const now = Date.now();
    
    if (now - lastFrameTime >= 1000) {
      const fps = frameCount;
      console.log('FPS:', fps);
      frameCount = 0;
      lastFrameTime = now;
    }
  }}
>
```

### 5.9 크로스 플랫폼 고려사항

#### 5.9.1 기능 차이 처리
```typescript
import { Platform } from 'react-native';

const isARKitAvailable = Platform.OS === 'ios' && parseFloat(Platform.Version) >= 11;
const isARCoreAvailable = Platform.OS === 'android';  // 실제로는 ARCore 지원 확인 필요

// LiDAR 기능 (iOS만)
const hasLiDAR = Platform.OS === 'ios' && DeviceInfo.hasLiDAR();

if (hasLiDAR) {
  // Scene Reconstruction 활성화
  ViroARSceneNavigator.setWorldReconstruction(true);
}
```

#### 5.9.2 좌표계 차이
- **ARKit**: Y-up (위쪽), 우측 좌표계
- **ARCore**: Y-up, 우측 좌표계 (동일)
- Viro가 추상화하여 일관성 제공

---

## 6. 학습 로드맵

### Phase 1: 기초 다지기 (2-3주)

#### Week 1: 3D 그래픽 기초
- [ ] 3D 좌표계 및 변환 행렬 이해
- [ ] 메시, 텍스처, 머티리얼 개념 학습
- [ ] 간단한 Three.js 예제 실습
- [ ] 조명 및 쉐이딩 기본 학습

**실습 프로젝트**: Three.js로 회전하는 텍스처 입힌 큐브 만들기

#### Week 2: 렌더링 파이프라인
- [ ] Vertex Shader, Fragment Shader 원리 이해
- [ ] MVP 행렬 변환 과정 학습
- [ ] 간단한 GLSL 쉐이더 작성
- [ ] 조명 모델 (Phong, PBR) 학습

**실습 프로젝트**: 커스텀 쉐이더로 물결 효과 구현

#### Week 3: React Native 환경 설정
- [ ] React Native 프로젝트 셋업
- [ ] Viro 설치 및 기본 설정
- [ ] 첫 AR 씬 만들기 (ViroBox 배치)
- [ ] 머티리얼 및 조명 실험

**실습 프로젝트**: 간단한 AR 객체 배치 앱

### Phase 2: AR 핵심 기능 (3-4주)

#### Week 4: 평면 감지 및 배치
- [ ] ARKit/ARCore 평면 감지 원리 학습
- [ ] ViroARPlane 사용법
- [ ] Hit Test로 사용자 터치 처리
- [ ] Anchor 시스템 이해

**실습 프로젝트**: 탭한 위치에 3D 모델 배치하는 앱

#### Week 5: 이미지 추적
- [ ] 이미지 인식 알고리즘 기초 (특징점 기반)
- [ ] ViroARImageMarker 설정
- [ ] 마커 기반 AR 콘텐츠 배치
- [ ] 마커 추적 상태 관리

**실습 프로젝트**: 명함/포스터 인식 AR 명함 앱

#### Week 6: 조명 및 환경 통합
- [ ] 조명 추정(Light Estimation) 원리
- [ ] 환경 텍스처링 적용
- [ ] PBR 머티리얼로 현실감 개선
- [ ] 그림자 렌더링

**실습 프로젝트**: 실제 조명에 반응하는 AR 가구 배치 앱

#### Week 7: 상호작용
- [ ] 제스처 인식 (탭, 드래그, 핀치)
- [ ] ViroDraggable 사용법
- [ ] 물리 엔진 기초 (충돌, 중력)
- [ ] 애니메이션 제어

**실습 프로젝트**: 드래그 가능하고 물리 반응하는 AR 게임

### Phase 3: 고급 기능 (3-4주)

#### Week 8: Depth 및 Occlusion
- [ ] Depth Sensing 원리 (LiDAR, Stereo)
- [ ] ARCore Depth API 학습
- [ ] Occlusion 쉐이더 작성
- [ ] Scene Reconstruction (iOS)

**실습 프로젝트**: 실제 물체에 가려지는 AR 캐릭터

#### Week 9: 고급 렌더링
- [ ] 커스텀 쉐이더 작성 (Viro 통합)
- [ ] 포스트 프로세싱 효과
- [ ] 파티클 시스템
- [ ] 비디오 텍스처

**실습 프로젝트**: 파티클 효과와 글로우 효과가 있는 AR 마법 앱

#### Week 10: 성능 최적화
- [ ] 프로파일링 도구 사용
- [ ] Draw Call 최적화
- [ ] LOD 구현
- [ ] 텍스처 최적화

**실습 프로젝트**: 100개 이상 객체를 60fps로 렌더링하기

#### Week 11: 멀티플레이어
- [ ] Cloud Anchors 개념
- [ ] ARCore Cloud Anchors 또는 Azure Spatial Anchors
- [ ] 실시간 동기화 (WebSocket)
- [ ] 네트워크 지연 처리

**실습 프로젝트**: 멀티플레이어 AR 보물찾기 게임

### Phase 4: 실전 프로젝트 (4-6주)

#### Week 12-13: 프로젝트 기획 및 설계
- [ ] AR 앱 아이디어 구체화
- [ ] 기술 스택 선정
- [ ] 아키텍처 설계
- [ ] 3D 에셋 준비 (Blender 등)

#### Week 14-16: 개발
- [ ] 핵심 기능 구현
- [ ] UI/UX 디자인 및 구현
- [ ] 테스팅 및 디버깅
- [ ] 성능 최적화

#### Week 17: 배포 및 마무리
- [ ] iOS App Store 제출 준비
- [ ] Google Play Store 제출 준비
- [ ] 문서화
- [ ] 포트폴리오 정리

### 추천 학습 리소스

#### 서적
- **"Real-Time Rendering"** - Tomas Akenine-Möller (3D 그래픽 바이블)
- **"Augmented Reality: Principles and Practice"** - Dieter Schmalstieg

#### 온라인 강의
- **Udemy**: "Unity AR Foundation Masterclass"
- **Coursera**: "Introduction to Augmented Reality and ARCore"
- **YouTube**: Valem Tutorials (AR/VR 개발)

#### 공식 문서
- [ARKit Documentation](https://developer.apple.com/documentation/arkit/)
- [ARCore Documentation](https://developers.google.com/ar)
- [ViroReact Documentation](https://docs.viromedia.com/)
- [Three.js Documentation](https://threejs.org/docs/)

#### 커뮤니티
- **Stack Overflow**: `arkit`, `arcore`, `viro` 태그
- **Reddit**: r/augmentedreality, r/ARKit, r/ARCore
- **Discord**: Viro Community, AR Developers

### 실습용 툴 및 에셋

#### 3D 모델링
- **Blender**: 무료 오픈소스
- **SketchFab**: 무료 3D 모델 다운로드
- **Poly Haven**: 무료 PBR 텍스처

#### 디버깅
- **Xcode Instruments**: iOS 프로파일링
- **Android Studio Profiler**: Android 프로파일링
- **Chrome DevTools**: React Native 디버깅

#### AR 테스팅
- **ARCore Depth Lab**: Depth API 실험
- **ARKit Sample Projects**: Apple 공식 샘플

---

## 결론

모바일 카메라 기반 AR 개발은 **3D 그래픽 기초**, **네이티브 플랫폼 지식**, **프레임워크 활용 능력**이 모두 필요한 종합적인 분야입니다.

### 학습의 핵심 포인트

1. **기초부터 탄탄히**: 3D 좌표계, 변환 행렬 등 수학적 기초 필수
2. **실습 중심**: 이론만으로는 부족, 반드시 직접 구현해보기
3. **플랫폼 이해**: ARKit/ARCore의 차이와 한계 파악
4. **성능 의식**: 모바일 환경의 제약 항상 고려
5. **UX 중시**: 기술보다 사용자 경험이 우선

### 다음 단계

본 학습 가이드를 기반으로 현재 프로젝트의 AR 기능을 구현할 수 있습니다:

1. **펫 AR 렌더링**: 3D 펫 모델을 실제 환경에 배치
2. **상호작용**: 펫을 터치하거나 먹이 주기
3. **환경 통합**: 실제 조명에 반응하는 펫
4. **멀티플레이어**: 친구와 함께 펫 키우기

프로젝트 구현 중 구체적인 질문이나 이슈가 있다면 언제든 문의하세요!

