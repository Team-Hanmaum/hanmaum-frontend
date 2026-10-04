# 한마음 Frontend

React · TypeScript · Vite · Tailwind CSS 기반의 휴대폰 중심 웹앱.

## 실행

Node.js 24.x, pnpm 10.18.2 사용.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

- `/`: 최신 Figma `HM-ON-A01` 랜딩 화면. 시작하기·이미 계정이 있어요 → `/login`.
- `/login`: 최신 Figma `HM-ON-A02` 로그인 대표 화면. 상단의 Mock 안내는 확인용 UI이며 실제 인증·계정 생성은 발생하지 않는다.
- `/_dev/components`: 개발 모드 전용 공통 컴포넌트 확인 화면. 기존 `/?preview=components` 주소도 이 화면으로 이동한다.
- `/spaces`: 공간 선택 임시 화면. Mock 미리보기가 켜져 있으면 두 예시 공간으로 탭 전환을 확인한다.
- `/spaces/:careSpaceId/home|care|news|family|all`: 공간 ID를 유지하는 다섯 탭의 임시 화면.
- `/onboarding/guide`: 최신 Figma `HM-ON-A03` 기록 전 정보 안내. 계속 버튼은 후속 공간 생성 화면이 준비 중임을 알리며, 동의를 기록하거나 공간을 생성하지 않는다.
- Mock 미리보기가 켜져 있으면 카카오·Google 버튼 클릭 시 1초 동안 로딩 상태를 표시한 후 안내 화면으로 이동한다. 중복 클릭과 다른 제공사 버튼은 대기 중 차단하며, 화면 이탈 시 타이머를 취소한다.

React Router의 Data 모드를 사용하며 `src/routes/Router.tsx`에서 URL을 등록한다. 잘못된 주소는 404 화면, 라우트 오류는 공통 오류 화면으로 처리한다. 뒤로가기는 앱 안에서 관측한 방문 이력이 있을 때만 이전 항목으로 이동하고, 직접 진입·새로고침 후에는 지정한 대체 경로를 사용한다. [라우팅·레이아웃 규격](src/routes/README.md) 참조.

현재 `.env.production`의 `VITE_ENABLE_MOCK_PREVIEW=true`로 Vercel Preview·Production에서도 로그인 → 시작 전 안내 → Mock 공간 둘러보기 → 공간 선택 → 다섯 탭 흐름을 확인할 수 있다. 로컬 개발 모드는 별도 설정이 없으면 Mock 미리보기가 켜진다. `src/lib/mockPreview.ts`에서 공통 판별하며, 실제 인증 상태·쿠키·토큰을 만들거나 계정·공간·동의 기록을 저장하지 않는다.

실제 인증·업무 데이터 연결 전에는 `VITE_ENABLE_MOCK_PREVIEW=false`로 변경하고 다시 빌드한다. 이 설정은 로그인 이동과 Mock 공간 링크만 제어하며 실제 인증·접근 권한 검증을 대신하지 않는다. 개발용 컴포넌트 확인 화면의 코드와 경로는 계속 프로덕션 빌드에서 제외한다. [설정 우선순위와 검증 절차](docs/deployment.md) 참조.

## 파일·폴더 이름

애플리케이션 소스와 직접 관리하는 자산에는 다음 규칙을 적용한다.

| 구분               | 규칙                             | 예시                                        |
| ------------------ | -------------------------------- | ------------------------------------------- |
| 컴포넌트·페이지    | PascalCase, 컴포넌트 이름과 일치 | `Button.tsx`, `LoginPage.tsx`, `Router.tsx` |
| 커스텀 훅          | camelCase, `use` 접두사          | `useSession.ts`, `useCareSpace.ts`          |
| 유틸리티·API 파일  | camelCase                        | `formatDate.ts`, `authApi.ts`               |
| CSS 파일           | kebab-case                       | `button.css`, `social-login-button.css`     |
| 이미지·아이콘      | kebab-case                       | `chevron-left.svg`, `hanmaum-favicon.svg`   |
| 폴더               | 소문자, 여러 단어는 kebab-case   | `auth/`, `component-preview/`               |
| 진입·내보내기 파일 | 고정 이름                        | `main.tsx`, `index.ts`                      |

BE와 맞춘 도메인 이름 `carespace`, `careitem`은 하나의 도메인 식별자로 유지한다. `README.md`, `.gitkeep`, 도구 설정·GitHub 템플릿과 외부 라이선스 문서는 위 소스 이름 규칙으로 일괄 변경하지 않는다.

## 검증 명령

```sh
pnpm check
pnpm build
```

`check`는 ESLint, Prettier, TypeScript를 검증한다. 화면 검증 절차와 컴포넌트 API는 [공통 컴포넌트 규격](src/components/README.md), 토큰·폰트는 [공통 스타일 규격](src/styles/README.md), 벡터 출처는 [자산 목록](src/assets/README.md) 참조.

라우팅·레이아웃의 구현 검증은 [이슈 #10 검증 기록과 재확인 절차](docs/verification/issue-10.md) 참조.

## 배포

[배포 화면 열기](https://hanmaum-frontend.vercel.app/) — 현재는 실제 로그인·API 연결 전의 UI 미리보기.

Vercel에서 Vite 정적 앱으로 빌드한다. `vercel.json`에 빌드·출력 경로와 페이지 직접 진입을 위한 SPA rewrite를 정의한다. Node.js 24.x와 pnpm 10.18.2를 유지하며, Vercel에는 `ENABLE_EXPERIMENTAL_COREPACK=1` 설정이 필요하다. [배포 설정과 검증 절차](docs/deployment.md) 참조.
