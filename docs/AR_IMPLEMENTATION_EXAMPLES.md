# AR 펫 시스템 구현 예제

프로젝트의 AR 기능 구현을 위한 실전 예제 코드 모음입니다.

---

## 목차

1. [기본 AR 펫 렌더링](#1-기본-ar-펫-렌더링)
2. [펫 배치 시스템](#2-펫-배치-시스템)
3. [펫 상호작용](#3-펫-상호작용)
4. [펫 애니메이션](#4-펫-애니메이션)
5. [멀티 펫 관리](#5-멀티-펫-관리)
6. [환경 통합](#6-환경-통합)
7. [성능 최적화](#7-성능-최적화)

---

## 1. 기본 AR 펫 렌더링

### 기본 구조

```typescript
// app/(protected)/ar.tsx
import React, { useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import {
  ViroARSceneNavigator,
  ViroARScene,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroMaterials,
  ViroAnimations,
  ViroARPlane,
  ViroNode,
} from '@viro-community/react-viro';

export default function ARPetScreen() {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{
        scene: ARPetScene,
      }}
      style={styles.arView}
    />
  );
}

function ARPetScene() {
  const [petPlaced, setPetPlaced] = useState(false);
  const [petPosition, setPetPosition] = useState<[number, number, number]>([0, 0, -1]);
  
  return (
    <ViroARScene>
      {/* 조명 설정 */}
      <ViroAmbientLight color="#ffffff" intensity={200} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -1]}
        intensity={500}
        castsShadow={true}
      />
      
      {/* 펫이 배치되지 않았을 때 평면 감지 */}
      {!petPlaced && (
        <ViroARPlane
          minHeight={0.2}
          minWidth={0.2}
          alignment="Horizontal"
          onPlaneSelected={(anchorPosition) => {
            setPetPosition([
              anchorPosition[0],
              anchorPosition[1],
              anchorPosition[2],
            ]);
            setPetPlaced(true);
          }}
        />
      )}
      
      {/* 펫 모델 */}
      {petPlaced && (
        <PetModel position={petPosition} />
      )}
    </ViroARScene>
  );
}

interface PetModelProps {
  position: [number, number, number];
}

function PetModel({ position }: PetModelProps) {
  return (
    <ViroNode position={position}>
      <Viro3DObject
        source={require('../../../assets/models/pet.gltf')}
        type="GLTF"
        scale={[0.1, 0.1, 0.1]}
        rotation={[0, 0, 0]}
        materials={['petMaterial']}
        animation={{
          name: 'idle',
          run: true,
          loop: true,
        }}
      />
    </ViroNode>
  );
}

// 머티리얼 정의
ViroMaterials.createMaterials({
  petMaterial: {
    lightingModel: 'PBR',
    diffuseTexture: require('../../../assets/models/pet_albedo.png'),
    normalTexture: require('../../../assets/models/pet_normal.png'),
    metalnessTexture: require('../../../assets/models/pet_metalness.png'),
    roughnessTexture: require('../../../assets/models/pet_roughness.png'),
  },
});

// 애니메이션 정의
ViroAnimations.registerAnimations({
  idle: {
    properties: {
      rotateY: '+=5',
    },
    duration: 3000,
    easing: 'EaseInEaseOut',
  },
});

const styles = StyleSheet.create({
  arView: {
    flex: 1,
  },
});
```

---

## 2. 펫 배치 시스템

### Hit Test 기반 배치

```typescript
// components/ARPetPlacer.tsx
import React, { useState, useRef } from 'react';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroNode,
  Viro3DObject,
  ViroText,
  ViroQuad,
  ViroMaterials,
} from '@viro-community/react-viro';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface PlacedPet {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  petType: 'dog' | 'cat' | 'bird';
}

export default function ARPetPlacer() {
  const [placedPets, setPlacedPets] = useState<PlacedPet[]>([]);
  const [selectedPetType, setSelectedPetType] = useState<'dog' | 'cat' | 'bird'>('dog');
  const arSceneRef = useRef<any>(null);
  
  return (
    <View style={styles.container}>
      {/* AR Scene */}
      <ViroARSceneNavigator
        ref={arSceneRef}
        autofocus={true}
        initialScene={{
          scene: () => (
            <ARPlacementScene
              placedPets={placedPets}
              onPlacePet={(position) => handlePlacePet(position)}
            />
          ),
        }}
        style={styles.arView}
      />
      
      {/* UI 오버레이 */}
      <View style={styles.uiOverlay}>
        {/* 안내 메시지 */}
        {placedPets.length === 0 && (
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              바닥을 터치하여 펫을 배치하세요
            </Text>
          </View>
        )}
        
        {/* 펫 타입 선택 */}
        <View style={styles.petSelector}>
          <PetTypeButton
            type="dog"
            selected={selectedPetType === 'dog'}
            onPress={() => setSelectedPetType('dog')}
          />
          <PetTypeButton
            type="cat"
            selected={selectedPetType === 'cat'}
            onPress={() => setSelectedPetType('cat')}
          />
          <PetTypeButton
            type="bird"
            selected={selectedPetType === 'bird'}
            onPress={() => setSelectedPetType('bird')}
          />
        </View>
      </View>
    </View>
  );
  
  function handlePlacePet(position: [number, number, number]) {
    const newPet: PlacedPet = {
      id: `pet_${Date.now()}`,
      position,
      rotation: [0, Math.random() * 360, 0],
      petType: selectedPetType,
    };
    
    setPlacedPets(prev => [...prev, newPet]);
  }
}

interface ARPlacementSceneProps {
  placedPets: PlacedPet[];
  onPlacePet: (position: [number, number, number]) => void;
}

function ARPlacementScene({ placedPets, onPlacePet }: ARPlacementSceneProps) {
  const [showPlaneIndicator, setShowPlaneIndicator] = useState(true);
  const arSceneRef = useRef<any>(null);
  
  // 터치로 펫 배치
  const handleSceneClick = (position: [number, number], source: any) => {
    arSceneRef.current?.getCameraOrientationAsync().then((orientation: any) => {
      arSceneRef.current?.performARHitTestWithRay(position).then((results: any[]) => {
        if (results.length > 0) {
          const hit = results[0];
          onPlacePet([
            hit.transform.position[0],
            hit.transform.position[1],
            hit.transform.position[2],
          ]);
        }
      });
    });
  };
  
  return (
    <ViroARScene
      ref={arSceneRef}
      onClick={handleSceneClick}
      onTrackingUpdated={(state) => {
        setShowPlaneIndicator(state !== 'TRACKING_NORMAL');
      }}
    >
      {/* 조명 */}
      <ViroAmbientLight color="#ffffff" intensity={200} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -1]}
        intensity={500}
      />
      
      {/* 평면 인디케이터 */}
      {showPlaneIndicator && (
        <ViroARPlane
          minHeight={0.1}
          minWidth={0.1}
          alignment="Horizontal"
        >
          <ViroQuad
            width={1}
            height={1}
            rotation={[-90, 0, 0]}
            materials={['planeIndicator']}
          />
        </ViroARPlane>
      )}
      
      {/* 배치된 펫들 */}
      {placedPets.map(pet => (
        <PetInstance
          key={pet.id}
          pet={pet}
        />
      ))}
    </ViroARScene>
  );
}

// 평면 인디케이터 머티리얼
ViroMaterials.createMaterials({
  planeIndicator: {
    diffuseColor: '#00ff00',
    opacity: 0.3,
    writesToDepthBuffer: false,
  },
});

interface PetTypeButtonProps {
  type: 'dog' | 'cat' | 'bird';
  selected: boolean;
  onPress: () => void;
}

function PetTypeButton({ type, selected, onPress }: PetTypeButtonProps) {
  const labels = {
    dog: '🐕 강아지',
    cat: '🐱 고양이',
    bird: '🐦 새',
  };
  
  return (
    <TouchableOpacity
      style={[styles.petButton, selected && styles.petButtonSelected]}
      onPress={onPress}
    >
      <Text style={styles.petButtonText}>{labels[type]}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  uiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  instructionBox: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  petSelector: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  petButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  petButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## 3. 펫 상호작용

### 터치, 드래그, 먹이 주기

```typescript
// components/InteractivePet.tsx
import React, { useState, useRef } from 'react';
import {
  ViroNode,
  Viro3DObject,
  ViroText,
  ViroParticleEmitter,
  ViroAnimations,
  ViroDraggable,
  ViroSound,
} from '@viro-community/react-viro';
import { Animated } from 'react-native';

interface InteractivePetProps {
  petId: string;
  petType: 'dog' | 'cat' | 'bird';
  position: [number, number, number];
  onFeed?: (petId: string) => void;
  onPet?: (petId: string) => void;
}

export function InteractivePet({
  petId,
  petType,
  position,
  onFeed,
  onPet,
}: InteractivePetProps) {
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [happiness, setHappiness] = useState(100);
  const [showHeart, setShowHeart] = useState(false);
  const [scale, setScale] = useState<[number, number, number]>([0.1, 0.1, 0.1]);
  
  // 펫 클릭 (쓰다듬기)
  const handleClick = () => {
    // 행복도 증가
    setHappiness(prev => Math.min(prev + 10, 100));
    
    // 하트 이펙트
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 2000);
    
    // 기쁨 애니메이션
    setCurrentAnimation('happy');
    setTimeout(() => setCurrentAnimation('idle'), 2000);
    
    // 사운드 재생
    onPet?.(petId);
  };
  
  // 먹이 주기
  const handleFeed = () => {
    setHappiness(prev => Math.min(prev + 20, 100));
    setCurrentAnimation('eat');
    
    setTimeout(() => {
      setCurrentAnimation('idle');
      onFeed?.(petId);
    }, 3000);
  };
  
  // 핀치로 크기 조절
  const handlePinch = (pinchState: number, scaleFactor: number) => {
    if (pinchState === 3) {  // 종료
      const newScale = scale[0] * scaleFactor;
      setScale([newScale, newScale, newScale]);
    }
  };
  
  return (
    <ViroDraggable
      type="FixedToWorld"
      onDrag={(dragToPos) => {
        console.log('Pet dragged to:', dragToPos);
      }}
    >
      <ViroNode
        position={position}
        scale={scale}
        onClick={handleClick}
        onPinch={handlePinch}
      >
        {/* 펫 모델 */}
        <Viro3DObject
          source={getPetModel(petType)}
          type="GLTF"
          animation={{
            name: currentAnimation,
            run: true,
            loop: currentAnimation === 'idle',
          }}
        />
        
        {/* 행복도 표시 */}
        <ViroText
          text={`❤️ ${happiness}%`}
          position={[0, 0.3, 0]}
          scale={[0.5, 0.5, 0.5]}
          style={{
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ff0000',
          }}
        />
        
        {/* 하트 이펙트 */}
        {showHeart && (
          <ViroNode position={[0, 0.2, 0]}>
            <ViroParticleEmitter
              position={[0, 0, 0]}
              duration={2000}
              visible={true}
              run={true}
              image={{
                source: require('../../../assets/heart.png'),
                height: 0.05,
                width: 0.05,
              }}
              spawnBehavior={{
                particleLifetime: [1000, 1500],
                emissionRatePerSecond: [10, 15],
                maxParticles: 20,
              }}
              particlePhysics={{
                velocity: {
                  initial: [[0, 0.2, 0], [0, 0.3, 0]],
                },
              }}
            />
          </ViroNode>
        )}
        
        {/* 사운드 */}
        <ViroSound
          source={getPetSound(petType, currentAnimation)}
          loop={false}
          volume={1.0}
        />
      </ViroNode>
    </ViroDraggable>
  );
}

function getPetModel(petType: 'dog' | 'cat' | 'bird') {
  const models = {
    dog: require('../../../assets/models/dog.gltf'),
    cat: require('../../../assets/models/cat.gltf'),
    bird: require('../../../assets/models/bird.gltf'),
  };
  
  return models[petType];
}

function getPetSound(petType: string, animation: string) {
  // 펫 타입과 애니메이션에 따른 사운드
  return require('../../../assets/sounds/pet_sound.mp3');
}

// 애니메이션 정의
ViroAnimations.registerAnimations({
  idle: {
    properties: {
      rotateY: '+=5',
    },
    duration: 3000,
    easing: 'Linear',
  },
  
  happy: {
    properties: {
      scaleY: [1, 1.2, 1],
      positionY: [0, 0.1, 0],
    },
    duration: 500,
    easing: 'Bounce',
  },
  
  eat: {
    properties: {
      rotateX: [0, -15, 0, -15, 0],
    },
    duration: 3000,
    easing: 'Linear',
  },
});
```

---

## 4. 펫 애니메이션

### GLTF 애니메이션 관리

```typescript
// hooks/usePetAnimation.ts
import { useState, useEffect, useCallback } from 'react';

type AnimationState = 'idle' | 'walk' | 'run' | 'sit' | 'eat' | 'sleep' | 'happy';

interface AnimationConfig {
  name: string;
  loop: boolean;
  duration?: number;
  nextAnimation?: AnimationState;
}

const ANIMATION_CONFIGS: Record<AnimationState, AnimationConfig> = {
  idle: { name: 'idle', loop: true },
  walk: { name: 'walk', loop: true },
  run: { name: 'run', loop: true },
  sit: { name: 'sit', loop: false, nextAnimation: 'idle' },
  eat: { name: 'eat', loop: false, duration: 3000, nextAnimation: 'idle' },
  sleep: { name: 'sleep', loop: true },
  happy: { name: 'happy', loop: false, duration: 2000, nextAnimation: 'idle' },
};

export function usePetAnimation(initialState: AnimationState = 'idle') {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationState>(initialState);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // 애니메이션 전환
  const transitionTo = useCallback((newAnimation: AnimationState) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentAnimation(newAnimation);
    
    const config = ANIMATION_CONFIGS[newAnimation];
    
    if (!config.loop && config.duration) {
      setTimeout(() => {
        setIsTransitioning(false);
        
        if (config.nextAnimation) {
          setCurrentAnimation(config.nextAnimation);
        }
      }, config.duration);
    } else {
      setIsTransitioning(false);
    }
  }, [isTransitioning]);
  
  // 랜덤 idle 동작
  useEffect(() => {
    if (currentAnimation !== 'idle') return;
    
    const interval = setInterval(() => {
      const random = Math.random();
      
      if (random < 0.1) {
        transitionTo('happy');
      } else if (random < 0.2) {
        transitionTo('sit');
      }
    }, 10000);  // 10초마다 체크
    
    return () => clearInterval(interval);
  }, [currentAnimation, transitionTo]);
  
  return {
    currentAnimation,
    transitionTo,
    animationConfig: ANIMATION_CONFIGS[currentAnimation],
  };
}

// 사용 예제
function AnimatedPet() {
  const { currentAnimation, transitionTo, animationConfig } = usePetAnimation();
  
  return (
    <ViroNode>
      <Viro3DObject
        source={require('./pet.gltf')}
        type="GLTF"
        animation={{
          name: animationConfig.name,
          run: true,
          loop: animationConfig.loop,
        }}
      />
      
      {/* 버튼으로 애니메이션 제어 */}
      <ViroButton
        onPress={() => transitionTo('eat')}
        text="먹이 주기"
      />
    </ViroNode>
  );
}
```

### 프로시저럴 애니메이션

```typescript
// components/ProceduralPetAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { ViroNode, Viro3DObject } from '@viro-community/react-viro';

interface ProceduralAnimationProps {
  petPosition: [number, number, number];
}

export function ProceduralPetAnimation({ petPosition }: ProceduralAnimationProps) {
  const [headRotation, setHeadRotation] = useState(0);
  const [tailRotation, setTailRotation] = useState(0);
  const [bodyBounce, setBodyBounce] = useState(0);
  const timeRef = useRef(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      timeRef.current += 0.016;  // 60fps
      
      // 머리 좌우로 흔들기
      setHeadRotation(Math.sin(timeRef.current * 2) * 15);
      
      // 꼬리 흔들기
      setTailRotation(Math.sin(timeRef.current * 5) * 30);
      
      // 몸 통통 튀기
      setBodyBounce(Math.abs(Math.sin(timeRef.current * 3)) * 0.02);
    }, 16);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <ViroNode position={petPosition}>
      {/* 몸통 */}
      <ViroNode position={[0, bodyBounce, 0]}>
        <Viro3DObject
          source={require('./body.obj')}
          type="OBJ"
        />
        
        {/* 머리 */}
        <ViroNode
          position={[0, 0.1, 0.05]}
          rotation={[0, headRotation, 0]}
        >
          <Viro3DObject
            source={require('./head.obj')}
            type="OBJ"
          />
        </ViroNode>
        
        {/* 꼬리 */}
        <ViroNode
          position={[0, 0.05, -0.1]}
          rotation={[0, tailRotation, 0]}
        >
          <Viro3DObject
            source={require('./tail.obj')}
            type="OBJ"
          />
        </ViroNode>
      </ViroNode>
    </ViroNode>
  );
}
```

---

## 5. 멀티 펫 관리

### 펫 매니저 시스템

```typescript
// service/inbound/ARPet/adapter.ts
import { create } from 'zustand';
import type { Pet } from '../../../domain/pet/types';

interface ARPet extends Pet {
  arPosition: [number, number, number];
  arRotation: [number, number, number];
  arScale: [number, number, number];
  isVisible: boolean;
  lastInteraction: number;
}

interface ARPetStore {
  arPets: Map<string, ARPet>;
  activePetId: string | null;
  
  // Actions
  addARPet: (pet: Pet, position: [number, number, number]) => void;
  removeARPet: (petId: string) => void;
  updateARPetPosition: (petId: string, position: [number, number, number]) => void;
  updateARPetRotation: (petId: string, rotation: [number, number, number]) => void;
  setActivePet: (petId: string | null) => void;
  interactWithPet: (petId: string) => void;
  getVisiblePets: () => ARPet[];
}

export const useARPetStore = create<ARPetStore>((set, get) => ({
  arPets: new Map(),
  activePetId: null,
  
  addARPet: (pet, position) => {
    set(state => {
      const newPets = new Map(state.arPets);
      newPets.set(pet.id, {
        ...pet,
        arPosition: position,
        arRotation: [0, 0, 0],
        arScale: [0.1, 0.1, 0.1],
        isVisible: true,
        lastInteraction: Date.now(),
      });
      
      return { arPets: newPets };
    });
  },
  
  removeARPet: (petId) => {
    set(state => {
      const newPets = new Map(state.arPets);
      newPets.delete(petId);
      
      return {
        arPets: newPets,
        activePetId: state.activePetId === petId ? null : state.activePetId,
      };
    });
  },
  
  updateARPetPosition: (petId, position) => {
    set(state => {
      const pet = state.arPets.get(petId);
      if (!pet) return state;
      
      const newPets = new Map(state.arPets);
      newPets.set(petId, { ...pet, arPosition: position });
      
      return { arPets: newPets };
    });
  },
  
  updateARPetRotation: (petId, rotation) => {
    set(state => {
      const pet = state.arPets.get(petId);
      if (!pet) return state;
      
      const newPets = new Map(state.arPets);
      newPets.set(petId, { ...pet, arRotation: rotation });
      
      return { arPets: newPets };
    });
  },
  
  setActivePet: (petId) => {
    set({ activePetId: petId });
  },
  
  interactWithPet: (petId) => {
    set(state => {
      const pet = state.arPets.get(petId);
      if (!pet) return state;
      
      const newPets = new Map(state.arPets);
      newPets.set(petId, { ...pet, lastInteraction: Date.now() });
      
      return { arPets: newPets };
    });
  },
  
  getVisiblePets: () => {
    return Array.from(get().arPets.values()).filter(pet => pet.isVisible);
  },
}));

// 사용 예제
export function ARPetManager() {
  const { arPets, addARPet, removeARPet, getVisiblePets } = useARPetStore();
  const visiblePets = getVisiblePets();
  
  return (
    <ViroARScene>
      {visiblePets.map(pet => (
        <InteractivePet
          key={pet.id}
          petId={pet.id}
          petType={pet.type}
          position={pet.arPosition}
        />
      ))}
    </ViroARScene>
  );
}
```

---

## 6. 환경 통합

### 실시간 조명 추정

```typescript
// components/EnvironmentAwarePet.tsx
import React, { useState, useEffect } from 'react';
import {
  ViroARScene,
  ViroNode,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
} from '@viro-community/react-viro';

export function EnvironmentAwarePet() {
  const [lightIntensity, setLightIntensity] = useState(1000);
  const [lightColor, setLightColor] = useState('#ffffff');
  const [lightDirection, setLightDirection] = useState<[number, number, number]>([0, -1, -1]);
  
  const handleTrackingUpdate = (state: any, reason: any) => {
    // ARKit/ARCore에서 조명 추정
    if (state === 'TRACKING_NORMAL') {
      // 실제 환경의 조명 정보 가져오기
      // (Viro는 자동으로 처리하지만, 필요시 커스텀 가능)
    }
  };
  
  return (
    <ViroARScene
      onTrackingUpdated={handleTrackingUpdate}
      onAmbientLightUpdate={(ambientLightInfo) => {
        // 주변광 정보 업데이트
        setLightIntensity(ambientLightInfo.intensity);
        setLightColor(ambientLightInfo.color);
      }}
    >
      {/* 환경 조명 반영 */}
      <ViroAmbientLight
        color={lightColor}
        intensity={lightIntensity}
      />
      
      <ViroDirectionalLight
        color={lightColor}
        direction={lightDirection}
        intensity={lightIntensity * 0.5}
        castsShadow={true}
      />
      
      {/* PBR 머티리얼로 펫 렌더링 */}
      <Viro3DObject
        source={require('./pet.gltf')}
        type="GLTF"
        materials={['pbrPet']}
        lightReceivingBitMask={1}
        shadowCastingBitMask={2}
      />
    </ViroARScene>
  );
}

// PBR 머티리얼
ViroMaterials.createMaterials({
  pbrPet: {
    lightingModel: 'PBR',
    diffuseTexture: require('./pet_albedo.png'),
    normalTexture: require('./pet_normal.png'),
    metalnessTexture: require('./pet_metalness.png'),
    roughnessTexture: require('./pet_roughness.png'),
  },
});
```

### Occlusion (LiDAR 기기)

```typescript
// components/OccludedPet.tsx
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  ViroARScene,
  ViroNode,
  Viro3DObject,
} from '@viro-community/react-viro';

export function OccludedPet() {
  const [occlusionEnabled, setOcclusionEnabled] = useState(false);
  
  useEffect(() => {
    // LiDAR 지원 확인 (iOS only)
    if (Platform.OS === 'ios') {
      // DeviceInfo나 네이티브 모듈로 LiDAR 지원 확인
      checkLiDARSupport().then(setOcclusionEnabled);
    }
  }, []);
  
  return (
    <ViroARScene>
      {occlusionEnabled && (
        <ViroNode
          // Scene Reconstruction 활성화
          renderingOrder={-1}
        >
          {/* Occlusion Mesh (보이지 않지만 Z-버퍼에 기록) */}
          <ViroMesh
            materials={['occlusionMaterial']}
          />
        </ViroNode>
      )}
      
      {/* 펫 모델 (실제 물체에 가려짐) */}
      <Viro3DObject
        source={require('./pet.gltf')}
        type="GLTF"
        position={[0, 0, -1]}
      />
    </ViroARScene>
  );
}

ViroMaterials.createMaterials({
  occlusionMaterial: {
    // 색상 없음, 깊이만 기록
    writesToDepthBuffer: true,
    colorWrite: false,
  },
});

async function checkLiDARSupport(): Promise<boolean> {
  // 네이티브 모듈로 LiDAR 지원 확인
  return false;  // 구현 필요
}
```

---

## 7. 성능 최적화

### LOD 시스템

```typescript
// components/LODPet.tsx
import React, { useState, useEffect } from 'react';
import {
  ViroNode,
  Viro3DObject,
  ViroARCamera,
} from '@viro-community/react-viro';

interface LODPetProps {
  petId: string;
  position: [number, number, number];
}

type LODLevel = 'high' | 'medium' | 'low';

const LOD_THRESHOLDS = {
  high: 2,    // 2m 이내
  medium: 5,  // 5m 이내
  low: 10,    // 10m 이내
};

const MODEL_SOURCES = {
  high: require('./pet_high.gltf'),    // 50k 폴리곤
  medium: require('./pet_medium.gltf'), // 10k 폴리곤
  low: require('./pet_low.gltf'),       // 2k 폴리곤
};

export function LODPet({ petId, position }: LODPetProps) {
  const [lodLevel, setLodLevel] = useState<LODLevel>('medium');
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 0]);
  
  // 카메라 거리 계산
  useEffect(() => {
    const distance = calculateDistance(cameraPosition, position);
    
    let newLOD: LODLevel;
    if (distance < LOD_THRESHOLDS.high) {
      newLOD = 'high';
    } else if (distance < LOD_THRESHOLDS.medium) {
      newLOD = 'medium';
    } else {
      newLOD = 'low';
    }
    
    if (newLOD !== lodLevel) {
      setLodLevel(newLOD);
    }
  }, [cameraPosition, position]);
  
  return (
    <>
      {/* 카메라 추적 */}
      <ViroARCamera
        onTransformUpdate={(transform) => {
          setCameraPosition([
            transform.position[0],
            transform.position[1],
            transform.position[2],
          ]);
        }}
      />
      
      {/* LOD 모델 */}
      <ViroNode position={position}>
        <Viro3DObject
          source={MODEL_SOURCES[lodLevel]}
          type="GLTF"
          scale={[0.1, 0.1, 0.1]}
        />
      </ViroNode>
    </>
  );
}

function calculateDistance(
  pos1: [number, number, number],
  pos2: [number, number, number]
): number {
  const dx = pos2[0] - pos1[0];
  const dy = pos2[1] - pos1[1];
  const dz = pos2[2] - pos1[2];
  
  return Math.sqrt(dx**2 + dy**2 + dz**2);
}
```

### 객체 풀링

```typescript
// utils/PetObjectPool.ts
class PetObjectPool {
  private pool: Map<string, any[]> = new Map();
  private active: Set<string> = new Set();
  
  constructor(private maxPoolSize: number = 20) {}
  
  acquire(petType: string): any {
    let poolArray = this.pool.get(petType);
    
    if (!poolArray || poolArray.length === 0) {
      // 새 객체 생성
      return this.createPetObject(petType);
    }
    
    const obj = poolArray.pop()!;
    this.active.add(obj.id);
    return obj;
  }
  
  release(obj: any) {
    this.active.delete(obj.id);
    
    const poolArray = this.pool.get(obj.type) || [];
    
    if (poolArray.length < this.maxPoolSize) {
      // 풀에 반환
      poolArray.push(obj);
      this.pool.set(obj.type, poolArray);
    }
  }
  
  private createPetObject(petType: string) {
    return {
      id: `pet_${Date.now()}_${Math.random()}`,
      type: petType,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [0.1, 0.1, 0.1],
    };
  }
  
  getActiveCount(): number {
    return this.active.size;
  }
  
  clear() {
    this.pool.clear();
    this.active.clear();
  }
}

export const petObjectPool = new PetObjectPool();

// 사용 예제
function SpawnPet() {
  const handleSpawn = () => {
    const pet = petObjectPool.acquire('dog');
    pet.position = [0, 0, -1];
    
    // 펫 사용...
    
    // 5초 후 반환
    setTimeout(() => {
      petObjectPool.release(pet);
    }, 5000);
  };
  
  return <TouchableOpacity onPress={handleSpawn} />;
}
```

### 프레임레이트 모니터링

```typescript
// components/PerformanceMonitor.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ViroARScene } from '@viro-community/react-viro';

export function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [renderTime, setRenderTime] = useState(0);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTime;
      
      if (delta >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={styles.monitor}>
      <Text style={styles.text}>FPS: {fps}</Text>
      <Text style={styles.text}>Render: {renderTime.toFixed(2)}ms</Text>
      
      {fps < 30 && (
        <Text style={styles.warning}>⚠️ 낮은 성능</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  monitor: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  warning: {
    color: '#ff0000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
```

---

## 다음 단계

이 예제들을 기반으로 실제 프로젝트에 AR 펫 시스템을 구현할 수 있습니다:

1. **기본 구현**: 예제 1~2를 사용하여 기본 AR 펫 배치
2. **상호작용 추가**: 예제 3을 참고하여 터치, 드래그, 먹이 주기 구현
3. **애니메이션**: 예제 4로 생동감 있는 펫 애니메이션
4. **멀티 펫**: 예제 5로 여러 펫 동시 관리
5. **환경 통합**: 예제 6으로 실제 조명 반영
6. **최적화**: 예제 7로 성능 개선

추가 질문이나 구체적인 구현이 필요하면 언제든 문의하세요!

