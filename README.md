# 한마음 Frontend

React · TypeScript · Vite · Tailwind CSS 기반의 휴대폰 중심 웹앱.

## 실행

Node.js 24.x, pnpm 10.18.2 사용.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

- `/`: 최신 Figma `HM-ON-A02` 로그인 대표 화면. 상단의 Mock 안내는 확인용 UI이며 실제 인증·계정 생성은 발생하지 않는다.
- `/?preview=components`: 개발 모드 전용 공통 컴포넌트 확인 화면. 로고·버튼·입력·헤더의 상태와 동작 확인.
- 로그인 버튼 클릭 시 1초 동안 로딩 상태를 표시한 후 기본 상태로 복귀. 이전 화면 연결 전이므로 뒤로가기 역시 Mock 안내만 표시.

별도의 `dev/` 폴더나 라우터 의존성 없이 개발용 쿼리로 확인 화면을 선택한다. `routes/Router.tsx`와 제품 URL 등록은 후속 라우팅 작업에서 진행한다. 프로덕션 빌드에서는 컴포넌트 확인 화면의 JavaScript와 진입 링크를 제외한다. 현재 로그인은 프로덕션 빌드에서도 Mock이다.

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

현재 작업: [이슈 #8](https://github.com/Team-Hanmaum/hanmaum-frontend/issues/8). 세 단계 로컬 커밋 후 직접 실행 검토를 거쳐 push·PR을 별도로 진행한다.
