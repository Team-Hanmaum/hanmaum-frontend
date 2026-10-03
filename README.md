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
- `/spaces`: 공간 선택 임시 화면. 개발 모드에서는 두 Mock 공간으로 탭 전환을 확인한다.
- `/spaces/:careSpaceId/home|care|news|family|all`: 공간 ID를 유지하는 다섯 탭의 임시 화면.
- `/onboarding/guide`: 최신 Figma `HM-ON-A03` 기록 전 정보 안내. 계속 버튼은 후속 공간 생성 화면이 준비 중임을 알리며, 동의를 기록하거나 공간을 생성하지 않는다.
- 개발 모드에서 카카오·Google 버튼 클릭 시 1초 동안 로딩 상태를 표시한 후 안내 화면으로 이동한다. 중복 클릭과 다른 제공사 버튼은 대기 중 차단하며, 화면 이탈 시 타이머를 취소한다.

React Router의 Data 모드를 사용하며 `src/routes/Router.tsx`에서 URL을 등록한다. 잘못된 주소는 404 화면, 라우트 오류는 공통 오류 화면으로 처리한다. 뒤로가기는 앱 안에서 관측한 방문 이력이 있을 때만 이전 항목으로 이동하고, 직접 진입·새로고침 후에는 지정한 대체 경로를 사용한다. [라우팅·레이아웃 규격](src/routes/README.md) 참조.

프로덕션 빌드에서는 개발용 컴포넌트 확인 화면의 코드와 Mock 공간 진입 링크를 제외하고, 소셜 로그인 버튼을 비활성화한다. 현재는 실제 인증이 연결되지 않은 UI 미리보기이며, 개발용 로그인 이동으로 인증 상태·쿠키·토큰을 만들지 않는다.

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

현재 작업: [이슈 #10](https://github.com/Team-Hanmaum/hanmaum-frontend/issues/10). 라우팅 기반 → 공통 레이아웃 → 랜딩 → 온보딩 안내·Mock 이동 순서로 단계별 커밋. [검증 기록과 재확인 절차](docs/verification/issue-10.md) 참조. 로컬 실행 검토를 거쳐 push·PR을 별도로 진행한다.
