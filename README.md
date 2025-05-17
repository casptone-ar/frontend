# Expo 앱 템플릿

이 프로젝트는 Expo와 React Native를 사용한 모바일 앱 개발을 위한 강력한 시작점을 제공합니다. 명확한 계층형 아키텍처, 효율적인 상태 관리, 다양한 핵심 기능 통합을 통해 신속하고 안정적인 앱 개발을 지원합니다.

## 목차

1.  [주요 기능](#주요-기능)
2.  [프로젝트 구조](#프로젝트-구조)
3.  [아키텍처](#아키텍처)
    *   [레이어 개요](#레이어-개요)
    *   [상세 구조](#상세-구조)
    *   [데이터 흐름 및 의존성 규칙](#데이터-흐름-및-의존성-규칙)
4.  [라우팅 구조](#라우팅-구조)
5.  [주요 기술 스택](#주요-기술-스택)
6.  [상태 관리 (Zustand)](#상태-관리-zustand)
7.  [쿼리 관리 (TanStack Query)](#쿼리-관리-tanstack-query)
8.  [컴포넌트](#컴포넌트)
    *   [컴포넌트 구조](#컴포넌트-구조)
    *   [컴포넌트 작성 규칙](#컴포넌트-작성-규칙)
9.  [린트 및 코드 스타일](#린트-및-코드-스타일)
10. [프로젝트 초기화 과정](#프로젝트-초기화-과정)
11. [개발 가이드](#개발-가이드)
    *   [Zustand 스토어 작성](#zustand-스토어-작성-servicelibdomainstorets)
    *   [Service 작성](#service-작성-servicelibdomain)
    *   [Application Hook 작성](#application-hook-작성-applicationdomainactionts)
    *   [API 쿼리 함수 작성](#api-쿼리-함수-작성-serviceinboundquerydomaints)
12. [필수 학습](#필수-학습)
13. [라이선스](#라이선스)


## 프로젝트 구조
    capstone/
    ├── app/ # 라우팅 및 화면 정의 (expo-router)
    │ ├── (auth)/ # 인증 관련 라우트 그룹
    │ ├── (onboarding)/ # 온보딩 프로세스 라우트 그룹
    │ ├── (protected)/ # 인증이 필요한 라우트 그룹
    │ ├── auth/ # (구) 인증 관련 페이지 (현재 (auth) 그룹으로 이전)
    │ ├── permission/ # 권한 요청 페이지
    │ └── webview/ # 웹뷰 페이지
    ├── application/ # 애플리케이션 로직 (Use Cases, Hooks)
    │ ├── auth/ # 인증 관련 액션 훅
    │ ├── permission/ # 권한 요청 관련 액션 훅
    │ └── webview/ # 웹뷰 관련 액션 훅
    ├── assets/ # 정적 에셋 (폰트, 이미지, 언어 파일 등)
    │ ├── fonts/
    │ └── languages/
    ├── domain/ # 도메인 모델, 타입 정의, 핵심 비즈니스 규칙
    │ ├── collection/
    │ ├── mission/
    │ ├── pet/
    │ ├── shop/
    │ └── sharedkernel.d.ts # 전역 공유 타입 (QueryFn 등)
    ├── service/ # 서비스 로직, 외부 연동, 데이터 관리
    │ ├── inbound/ # 도메인 특화 서비스 (API 쿼리 정의 등)
    │ │ └── query/ # API 요청 함수 및 React Query 훅 정의
    │ └── lib/ # 범용 라이브러리성 서비스
    │ ├── Auth/ # 인증 서비스
    │ ├── Http/ # HTTP 클라이언트
    │ ├── Image/ # 이미지 처리 서비스
    │ ├── Loading/ # 전역 로딩 상태 관리
    │ ├── Permission/ # 권한 관리 서비스
    │ ├── Storage/ # AsyncStorage 래퍼
    │ ├── Store/ # Zustand 스토어 생성 및 하이드레이션 관리
    │ └── utils/ # 유틸리티 함수
    ├── tamagui/ # Tamagui 설정 관련 (테마, 토큰 등)
    ├── View/ # UI 컴포넌트, UI 관련 훅, 테마 등
    │ ├── bootstrap/ # 앱 초기 구동 로직 (폰트 로딩, 하이드레이션 훅)
    │ ├── core/ # 재사용 가능한 핵심 UI 컴포넌트
    │ ├── hooks/ # UI 관련 커스텀 훅
    │ └── store/ # UI 상태 관리 스토어 (AppProvider 등)
    ├── .env # 환경 변수 설정 파일
    ├── app.config.ts # Expo 앱 설정
    ├── babel.config.js # Babel 설정
    ├── biome.json # Biome (Linter, Formatter) 설정
    ├── tsconfig.json # TypeScript 설정
    └── package.json # 프로젝트 의존성 및 스크립트

## 아키텍처

본 프로젝트는 명확한 역할 분리와 단방향 데이터 흐름을 지향하는 계층형 아키텍처를 따릅니다. ([rebe-rule](.cursor/rules/rebe-rule.mdc) 참조)

### 레이어 개요

*   **`View`**: UI 렌더링 및 사용자 상호작용 처리. `application` 훅을 호출하거나 `store` 데이터를 구독하여 화면을 구성.
*   **`application`**: 특정 사용자 액션 또는 유스케이스를 처리하는 훅. 여러 `service` 로직이나 `store`를 조합하여 복잡한 흐름 관리.
*   **`service`**: 핵심 비즈니스 로직 및 데이터 관리. 외부 서비스 연동, 데이터 처리를 담당. `lib`(범용)과 `inbound`(도메인 특화)로 구성.
*   **`store`**: `Zustand` 기반의 상태 관리. `persist` 미들웨어를 통해 AsyncStorage에 상태 저장 및 복원(Hydration). `HydrationManager`를 통해 전체 스토어의 하이드레이션 상태 관리.
*   **`domain`**: 애플리케이션의 핵심 비즈니스 로직, 모델, 타입을 정의합니다. 다른 레이어에 의존하지 않는 순수한 영역입니다.

### 상세 구조

#### `app` (라우팅 및 페이지)

*   **역할**: `expo-router`를 사용한 파일 시스템 기반 라우팅 설정 및 페이지 컴포넌트 정의.
*   **구조**:
    *   `_layout.tsx`: 전역 레이아웃 및 공통 Provider (예: `AppProvider`, `Stack`, `Tabs`) 설정.
    *   `index.tsx`: 앱의 초기 진입점 및 리다이렉션 로직.
    *   라우트 그룹: `(auth)`, `(onboarding)`, `(protected)` 등 특정 목적에 따라 라우트를 그룹화.
    *   페이지 컴포넌트: 각 화면을 구성하는 React 컴포넌트. UI 로직은 단순하게 유지하고, 복잡한 로직은 `application` 훅을 사용.
    *   페이지 내 컴포넌트: 특정 페이지에 귀속되지만 분리할 가치가 있는 컴포넌트는 해당 페이지 폴더 내 `components/` 디렉토리에 정의 (예: `app/(protected)/components/home/PetStatusBar.tsx`).

#### `View` (UI 및 프레젠테이션)

*   **역할**: UI 컴포넌트, UI 관련 훅, 테마 등 UI 관련 로직 관리.
*   **구조**:
    *   `bootstrap/`: 앱 초기 구동에 필요한 훅 (예: `useFonts`, `useHydrationStatus`).
    *   `core/`: 재사용 가능한 핵심 UI 컴포넌트 (Button, Card, Input 등).
    *   `hooks/`: UI 동작, 애니메이션, `View/store` 사용 등 UI 관련 커스텀 훅.
    *   `store/`: 순수 UI 상태 관리 (예: `AppProvider` 내 Context, `GlobalLoadingStore`). 전역 비즈니스 상태는 `service`의 스토어 사용.

#### `application` (유스케이스 및 액션)

*   **역할**: 여러 `service` 로직이나 `store`를 조합하여 특정 사용자 액션(예: 로그인, 데이터 요청)이나 복잡한 유스케이스를 처리하는 **훅** 형태로 제공. `View`와 `Service` 레이어 간의 브릿지 역할.
*   **구조**:
    *   도메인별 폴더 (예: `application/auth/`, `application/permission/`)로 관련 액션 훅을 그룹화.
    *   액션 훅 파일 (예: `useAutoSignIn.ts`, `useRequestRequiredPermissions.ts`): 특정 액션을 수행하는 커스텀 훅.
*   **특징**:
    *   훅 형태로 제공되어 `View` 레이어에서 쉽게 사용 가능.
    *   재사용 가능한 액션 단위로 로직 캡슐화.
    *   상세한 주석(기능, 의존성 등) 작성 권장.

#### `service` (비즈니스 로직 및 외부 연동)

*   **역할**: 핵심 비즈니스 로직, 외부 API 연동, 전역 상태 정의 등을 담당. **`View` 레이어에 직접 의존하지 않음.**
*   **구조**:
    *   `lib/`: 도메인과 무관하거나 범용적인 서비스 로직.
        *   각 서비스 모듈 (예: `Auth`, `Http`, `Store`):
            *   `adapter.ts`: 서비스 핵심 기능 제공 (주로 `InitializationSingleTon` 상속 클래스 또는 함수).
            *   `store.ts`: (선택 사항) 해당 서비스의 전역 상태 관리 (`Zustand`). `StoreService.createPersistentStore` 사용.
            *   `consts.ts`, `types.d.ts`: (선택 사항) 서비스 관련 상수 및 타입.
        *   `Store/`: `Zustand` 스토어 생성(`adapter.ts`) 및 하이드레이션 관리(`HydrationManager.ts`) 중앙 처리.
        *   `shared.ts`: 여러 서비스에서 공통으로 사용하는 유틸리티 (`InitializationSingleTon`, `ServiceMediator`).
    *   `inbound/`: 프로젝트 도메인과 관련된 서비스 로직.
        *   `query/`: `service/lib/Http/adapter.ts`를 사용하여 API 요청 함수 및 `TanStack Query` 훅 정의. 도메인별 파일로 구성 (예: `test.ts`).
    *   `initialize.ts`: 앱 시작 시 필요한 서비스 초기화 로직 (`ServiceMediator` 사용).

#### `domain` (핵심 모델 및 규칙)

*   **역할**: 애플리케이션의 핵심 비즈니스 로직, 데이터 모델, 타입, 인터페이스를 정의합니다. 이 레이어는 다른 레이어에 의존하지 않아야 하며, 순수한 TypeScript 코드로 작성됩니다.
*   **구조**:
    *   각 도메인별 폴더 (예: `collection`, `mission`, `pet`, `shop`) 내에 해당 도메인의 타입 정의 파일 (`types.d.ts`) 위치.
    *   `sharedkernel.d.ts`: 프로젝트 전반에서 사용되는 공통 타입 및 유틸리티 타입 정의 (예: `QueryFn`, `Base64`).

### 데이터 흐름 및 의존성 규칙

*   **단방향 의존성**: `View` → `application` → `service`. `domain`은 어디에도 의존하지 않습니다.
*   `View`는 `application` 훅을 호출하거나, `service`의 `store`를 직접 구독할 수 있습니다 (복잡한 로직은 `application` 훅 권장).
*   `application`은 `service`의 `adapter` 함수를 호출하거나 `service`의 `store` 상태를 읽고 쓸 수 있습니다.
*   `service`는 다른 `service`에 의존할 수 있지만, `application`이나 `View`에 의존해서는 안 됩니다.
*   `store` 상태는 `service` 또는 `application`에서 주로 업데이트하며, `View`에서는 주로 읽기용으로 사용합니다.

## 라우팅 구조

`expo-router`를 사용하여 파일 시스템 기반 라우팅을 구현합니다. `app` 디렉토리의 파일 및 폴더 구조가 앱의 라우트 구조를 결정합니다.

*   **레이아웃 라우트 (`_layout.tsx`)**: 특정 세그먼트 또는 그룹에 대한 공통 UI 셸(Shell)을 정의합니다. 예를 들어 `app/(protected)/_layout.tsx`는 인증된 사용자만 접근 가능한 탭 네비게이션을 설정합니다.
*   **페이지 라우트**: 각 파일은 특정 경로의 페이지가 됩니다 (예: `app/(auth)/sign-in.tsx`는 `/sign-in` 경로에 해당).
*   **동적 라우트**: 대괄호(`[]`)를 사용하여 동적 세그먼트를 정의합니다 (예: `app/collection/[petId].tsx`는 `/collection/some-id`와 같은 경로에 매칭).
*   **라우트 그룹**: 괄호(`()`)를 사용하여 URL 경로에 영향을 주지 않고 라우트를 그룹화합니다. 레이아웃 구성에 유용합니다 (예: `(auth)`, `(protected)`).
*   **네비게이션**: `expo-router`의 `Link` 컴포넌트나 `router` 객체 (`useRouter` 훅)를 사용하여 페이지 간 이동을 처리합니다.

## 주요 기술 스택

*   **프레임워크**: React Native, Expo
*   **UI**: Tamagui
*   **라우팅**: Expo Router
*   **상태 관리**: Zustand
*   **데이터 페칭/서버 상태 관리**: TanStack Query (React Query)
*   **HTTP 클라이언트**: Axios
*   **인증**: Firebase Authentication
*   **언어**: TypeScript
*   **린터/포맷터**: Biome
*   **애니메이션**: Reanimated
*   **아이콘**: `@tamagui/lucide-icons`, `@expo/vector-icons`

## 상태 관리 (Zustand)

전역 상태 관리는 `Zustand`를 사용합니다. ([zustand-store-rule](.cursor/rules/zustand-store-rule.mdc) 참조)

*   **목적**: 전역적으로 공유되어야 하는 비즈니스 상태 및 일부 UI 상태 관리.
*   **스토어 정의**:
    *   `service/lib/[Domain]/store.ts`: 각 도메인별 비즈니스 상태 스토어. `StoreService.createPersistentStore`를 사용하여 AsyncStorage 영속성 지원.
    *   `View/store/`: UI 관련 스토어 (예: `GlobalLoadingStore`).
*   **영속성**: `StoreService.createPersistentStore` 사용 시 AsyncStorage에 자동 저장/복원.
*   **하이드레이션**: `service/lib/Store/HydrationManager.ts`가 여러 스토어의 하이드레이션 완료 상태를 추적. `View/bootstrap/useHydrationStatus.ts` 훅을 통해 사용.
*   **사용**:
    *   `application` 훅에서 주로 상태 변경 및 읽기 수행.
    *   `View` 컴포넌트/훅에서 상태 구독 및 읽기.

## 쿼리 관리 (TanStack Query)

서버 상태 관리 및 API 데이터 페칭은 `TanStack Query (React Query)`를 사용합니다. ([query-rule](.cursor/rules/query-rule.mdc) 및 [rebe-rule](.cursor/rules/rebe-rule.mdc)의 `service/inbound/query` 섹션 참조)

*   **쿼리 정의 위치**: `service/inbound/query/[domain].ts` (예: `service/inbound/query/test.ts`)
*   **구조**:
    1.  **Query Keys**: 각 쿼리에 대한 고유 키를 정의하는 객체 (예: `testKeys`).
    2.  **Parameter & Response Types**: API 요청 파라미터 및 응답 데이터의 타입을 명확히 정의.
    3.  **Fetcher Function**: `service/lib/Http/adapter.ts` (`API`)를 사용하여 실제 API를 호출하는 비동기 함수 작성.
    4.  **Custom Query Hook**: `useQuery` (또는 `useInfiniteQuery`, `useSuspenseQuery` 등)를 래핑하는 커스텀 훅 작성. 이 훅은 `QueryFn` (또는 유사 타입, `domain/sharedkernel.d.ts` 정의) 시그니처를 따르며, `queryKey`, `queryFn` 등을 설정.
        *   커스텀 훅에는 `key` (Query Key 생성 함수)와 `fetcher` (Fetcher 함수)를 정적 속성으로 첨부하여 재사용성 및 테스트 용이성을 높입니다.
*   **사용**: `View` 레이어나 `application` 훅에서 커스텀 쿼리 훅을 호출하여 데이터를 가져오고 캐싱, 로딩, 에러 상태 등을 관리합니다.

## 컴포넌트

### 컴포넌트 구조

*   **코어 컴포넌트 (`View/core/`)**: 버튼, 인풋, 카드 등 앱 전체에서 재사용되는 기본적인 UI 블록입니다. Headless, Combined, Non-headless 형태로 구현될 수 있습니다.
    *   예: `Button.tsx`, `Card.tsx`, `Input.tsx`, `ScreenContainer.tsx`, `Text.tsx`
*   **페이지별 컴포넌트 (`app/(group)/components/`)**: 특정 라우트 그룹 또는 페이지 내에서만 사용되는 좀 더 특화된 컴포넌트입니다.
    *   예: `app/(protected)/components/home/PetStatusBar.tsx`, `app/(onboarding)/components/PetSelectionCarousel.tsx`
*   **레이아웃 컴포넌트 (`app/_layout.tsx`, `app/(group)/_layout.tsx`)**: `expo-router`의 레이아웃 라우트로, 페이지들의 공통적인 UI 구조(예: 헤더, 탭 바)를 정의합니다.

### 컴포넌트 작성 규칙

([component-rule](.cursor/rules/component-rule.mdc) 및 [typescrirpt-rule](.cursor/rules/typescrirpt-rule.mdc) 참조)

*   **명명 규칙**:
    *   컴포넌트 파일명 및 함수명: PascalCase (예: `SignInScreen.tsx`, `PetStatusBar`).
    *   Props 타입: `[ComponentName]Props` (예: `PetStatusBarProps`).
*   **Props 타입 정의**: Props는 항상 `type` 별칭을 사용하여 명시적으로 정의합니다. JSDoc을 활용하여 각 prop의 설명을 추가합니다.
*   **재사용성 및 단일 책임 원칙**: 컴포넌트는 가능한 한 작고, 한 가지 역할에 집중하도록 설계합니다.
*   **스타일링**: `Tamagui`의 스타일링 시스템 (인라인 스타일, `styled` 함수, 테마 토큰)을 적극 활용합니다.
*   **상태 관리**: 컴포넌트 로컬 상태는 `useState`를 사용하고, 여러 컴포넌트에 걸쳐 공유되거나 복잡한 상태는 `Zustand` 또는 `application` 훅을 통해 관리합니다.
*   **문서화**: JSDoc을 사용하여 컴포넌트의 목적, props, 사용 예시 등을 명확히 문서화합니다.
*   **분리**: UI와 로직을 적절히 분리합니다. 복잡한 비즈니스 로직은 `application` 훅으로 분리하고, 컴포넌트는 주로 UI 렌더링과 사용자 이벤트 처리에 집중합니다.

## 린트 및 코드 스타일

*   **Biome**: `biome.json` 설정을 기반으로 Biome을 사용하여 코드 린팅 및 포맷팅을 강제합니다. 이를 통해 일관된 코드 스타일을 유지하고 잠재적인 오류를 사전에 방지합니다.
*   **TypeScript 규칙**: [typescrirpt-rule](.cursor/rules/typescrirpt-rule.mdc)에 정의된 명명 규칙, 타입 선언, 모듈화 등의 가이드라인을 따릅니다.
*   **커밋 전 검사**: Husky 등의 도구를 사용하여 커밋 전 자동으로 린팅 및 포맷팅을 실행하도록 설정할 수 있습니다. (현재 설정 확인 필요)

## 프로젝트 초기화 과정

앱이 시작될 때 다음과 같은 과정을 거쳐 초기화됩니다.

1.  **Expo 앱 진입**: `app/_layout.tsx` 또는 `app/index.tsx` 실행.
2.  **전역 레이아웃/Provider**: `app/_layout.tsx`에서 필요한 전역 Provider (`AppProvider`, `Stack` 등) 렌더링.
3.  **서비스 초기화**: `service/initialize.ts`의 `initializeServices()` 함수가 호출되어 `ServiceMediator`에 등록된 모든 서비스들의 `initialize()` 메소드 실행.
4.  **Bootstrap 훅 실행**: `View/bootstrap` 내의 훅들이 실행됩니다.
    *   `useAppFonts`: 앱에서 사용할 폰트 로딩.
    *   `useHydrationStatus`: `service/lib/Store/HydrationManager`를 구독하여 AsyncStorage로부터 모든 `Zustand` 스토어의 상태 복원(Hydration) 완료 여부 추적.
5.  **스토어 하이드레이션**: 각 영속성 스토어(`StoreService.createPersistentStore`로 생성된)가 비동기적으로 AsyncStorage에서 상태를 로드합니다. `HydrationManager`가 모든 스토어의 완료 상태를 관리합니다.
6.  **스플래시 화면 제어**: `app/_layout.tsx`에서 `SplashScreen.preventAutoHideAsync()`로 스플래시 화면을 유지하고, 폰트 로딩, 서비스 초기화, 스토어 하이드레이션이 모두 완료되면 `SplashScreen.hideAsync()`를 호출하여 스플래시 화면을 숨깁니다.
7.  **초기 화면 렌더링**: 하이드레이션 상태 및 로딩된 폰트를 기반으로 앱의 초기 화면(`app/index.tsx` 또는 라우팅된 페이지)이 렌더링됩니다.

## 개발 가이드

### Zustand 스토어 작성 (`service/lib/[Domain]/store.ts`)

([zustand-store-rule](.cursor/rules/zustand-store-rule.mdc) 참조)

*   **목적**: 전역적으로 공유되어야 하는 비즈니스 상태 관리.
*   **영속성 여부 결정**:
    *   **필요**: 앱 재시작 후에도 유지되어야 하는 데이터 (사용자 설정, 인증 상태 등) → `StoreService.createPersistentStore` 사용.
    *   **불필요**: 앱 실행 중에만 필요한 임시 데이터 (로딩 상태, 특정 UI 상태 등) → `createStore` 직접 사용.
*   **구조**:
    *   `State` 및 `Actions` 타입 분리 정의.
    *   `initialState` 객체 정의.
    *   스토어 생성 함수(`createPersistentStore` 또는 `createStore`) 내에서 `initialState`와 액션 구현.
    *   생성된 스토어 인스턴스와 `useStore(MyStore)`를 사용하는 커스텀 훅(`useMyStore`) 함께 export.
*   **사용**:
    *   `application` 훅에서 주로 상태 변경 및 읽기 수행.
    *   `View` 컴포넌트/훅에서 상태 구독 및 읽기 (복잡한 업데이트 로직은 `application` 훅 경유).

### Service 작성 (`service/lib/[Domain]`)

([rebe-rule](.cursor/rules/rebe-rule.mdc) 참조)

*   **목적**: 재사용 가능한 비즈니스 로직 캡슐화, 데이터 처리, 외부 서비스 통신.
*   **위치**: `service/lib` (범용) 또는 `service/inbound` (도메인 특화) 내에 도메인별 폴더 생성.
*   **구조**:
    *   `adapter.ts`: 핵심 기능 제공 (주로 `InitializationSingleTon` 상속받는 싱글톤 클래스 또는 일반 함수).
    *   `store.ts`: (선택) 해당 도메인 관련 전역 상태 (위 스토어 작성 규칙 따름).
    *   `consts.ts`: (선택) 관련 상수 정의.
    *   `types.d.ts`: (선택) 관련 타입 정의.
*   **규칙**:
    *   **`View`/`Application` 의존성 금지**: UI나 특정 유스케이스 흐름에 의존하지 않아야 합니다.
    *   싱글톤 패턴 권장 시 (`shared.ts`의 `InitializationSingleTon` 활용) `ServiceMediator`에 등록하여 중앙 초기화.
    *   필요시 다른 Service에 의존 가능.

### Application Hook 작성 (`application/[Domain]/[Action].ts`)

([rebe-rule](.cursor/rules/rebe-rule.mdc) 참조)

*   **목적**: 특정 사용자 액션이나 유스케이스 처리 흐름 관리. `View`의 복잡성 감소.
*   **형태**: React Custom Hook (예: `useSignIn`, `useFetchUserData`).
*   **구조**:
    *   관련 `service`의 함수 호출.
    *   관련 `store` 상태 읽기/쓰기.
    *   필요시 여러 서비스/스토어 로직 조합.
    *   `View`에서 필요한 상태나 콜백 함수 반환.
*   **규칙**:
    *   훅 형태로 작성하여 `View`에서 쉽게 사용 가능하도록 함.
    *   재사용성을 고려하여 명확한 액션 단위로 분리.
    *   JSDoc 등을 활용하여 기능, 파라미터, 반환값, 의존성 등 상세히 주석 작성.
    *   새로운 훅 작성 전, 유사 기능 훅 존재 여부 확인.

### API 쿼리 함수 작성 (`service/inbound/query/[domain].ts`)

([query-rule](.cursor/rules/query-rule.mdc) 및 [rebe-rule](.cursor/rules/rebe-rule.mdc) 참조)

1.  **파일 생성**: `service/inbound/query/` 디렉토리 하위에 도메인별로 파일을 생성합니다 (예: `auth.ts`, `pet.ts`).
2.  **Query Keys 정의**: `const [domain]Keys = { getAll: (params) => ['domainName', params], getOne: (id) => ['domainName', id] }` 형태로 쿼리 키 팩토리를 정의합니다.
3.  **타입 정의**: 요청 파라미터(`Params`)와 응답 데이터(`Response`) 타입을 명확히 정의합니다.
4.  **Fetcher 함수 작성**:
    *   `service/lib/Http/adapter.ts`의 `API` 객체를 사용하여 `async` 함수로 API 요청 로직을 작성합니다.
    *   예: `export const getPetById = async (params: GetPetByIdParams): Promise<PetResponse> => { return API.get(`/pets/${params.id}`); };`
5.  **TanStack Query 훅 작성**:
    *   `useQuery` (또는 필요에 따라 `useInfiniteQuery`, `useMutation` 등)를 사용하여 커스텀 훅을 만듭니다.
    *   `domain/sharedkernel.d.ts`에 정의된 `QueryFn` (또는 `MutationFn` 등) 타입을 활용합니다.
    *   `queryKey`에는 위에서 정의한 Query Key 팩토리를 사용하고, `queryFn`에는 Fetcher 함수를 연결합니다.
    *   커스텀 훅에 `key` (Query Key 팩토리)와 `fetcher` (Fetcher 함수)를 정적 속성으로 할당합니다.
    *   예시 (`service/inbound/query/test.ts` 참조):
        ```typescript
        // ... imports ...
        const testKeys = {
          getExampleData: (params: ExampleDateParams) => ["exampleData", params.id],
        };

        type ExampleDateParams = { id: string };
        type ExampleDataResponse = { /* ... */ };

        export const getExampleData = async (params: ExampleDateParams) => {
          const res = await API.get<ExampleDataResponse>(`/todos/${params.id}`);
          return res.data; // API.get은 이미 response.data를 반환하므로 .data 제거 가능성 있음 (구현 확인)
        };

        export const useExampleDataQuery: QueryFn<
          ExampleDateParams,
          ExampleDataResponse,
          typeof testKeys.getExampleData, // KeyBinder
          typeof getExampleData          // Fetcher
        > = ({ params, queryOptions }) => {
          return useQuery({
            queryKey: testKeys.getExampleData(params), // 실제 키 생성
            queryFn: () => getExampleData(params),
            ...queryOptions,
          });
        };

        useExampleDataQuery.key = testKeys.getExampleData;
        useExampleDataQuery.fetcher = getExampleData;
        ```

## 필수 학습

-   `domain/sharedkernel.d.ts`: 프로젝트 전반의 핵심 타입, 특히 `QueryFn` 및 관련 타입 이해.
-   `service/initialize.ts`: 서비스 초기화 플로우 이해.
-   `service/lib/shared.ts`: `InitializationSingleTon` 및 `ServiceMediator` 클래스 이해.
-   `service/lib/Store/HydrationManager.ts`: Zustand 스토어 하이드레이션 관리 방식 이해.
-   `service/lib/Store/adapter.ts`: `createPersistentStore` 함수 이해.
-   `service/lib/Http/adapter.ts`: API 클라이언트 사용법 이해.
-   `.cursor/rules/` 디렉토리 내의 규칙 파일들: 프로젝트의 코딩 컨벤션 및 아키텍처 가이드라인 숙지.

## 라이선스

상업적 목적으로 절대 이용하거나 변형하는 작업 등을 진행할 수 없음. (세부 내용은 LICENSE 파일 참조)