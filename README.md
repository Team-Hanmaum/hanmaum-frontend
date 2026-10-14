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
- `/spaces`: 참여 공간 선택 화면. 예시 공간과 현재 실행 중 만든 Mock 공간의 목록·역할·인원 표시.
- `/spaces/:careSpaceId/home`: 일반·빈 홈, 생성·참여 직후, 로딩·오류와 공간 전환 UI. 최근 소식은 소식 목록과 같은 Mock 저장소 사용.
- `/spaces/:careSpaceId/news`: 날짜별 소식 목록과 빈 상태·로딩·전체/추가 조회 오류.
- `/spaces/:careSpaceId/news/new`: 소식 작성·공백 입력 방지·등록 중·등록 실패 예시. 등록 후 해당 소식의 상세 화면으로 이동.
- `/spaces/:careSpaceId/news/:recordId`: 원문·분석 상태와 제안 처리 상태 표시. 제안 검토·요청 상태·처리 결과로 연결하며 원본 삭제는 후속 안내 표시.
- `/spaces/:careSpaceId/proposals`: 검토 대기·승인 요청·반영·미적용 목록. 홈과 소식 목록에서 진입.
- 소식의 `/proposals` 하위 경로에서 제안 개별 선택. 구성원은 반영 요청, 소유자는 반영 전 확인 후 반영·미적용 처리. 실제 API 호출 없이 공간별 메모리 Mock으로 홈 건수·일정·할 일·소식 상태 공유.
- 제안 수정·연결 대상 변경, 전체 돌봄 상세·이력은 후속 범위. 상단 Mock 상태에서 요청 실패와 현재 정보 변경에 따른 전체 미반영 확인. 새로고침 시 Mock 요청·반영 결과 초기화.
- 돌봄·가족·전체 탭의 나머지 화면은 후속 작업 대상.
- `/onboarding/guide`: 기록 전 정보 안내 → `/spaces/new`의 Mock 공간 생성 폼. 실제 동의 기록 없음.
- Mock 미리보기가 켜져 있으면 카카오·Google 버튼 클릭 시 1초 동안 로딩 상태를 표시한 후 안내 화면으로 이동한다. 중복 클릭과 다른 제공사 버튼은 대기 중 차단하며, 화면 이탈 시 타이머를 취소한다.

- `/invitations/:invitationToken`: 초대 안내·Mock 참여·만료·사용 불가. `/invitations/mock-family`로 새 참여 예시 확인.
- `/spaces/:careSpaceId/invite`: Mock 초대 링크 표시·복사·공유·만료·오류.
- 상단 **화면 상태 확인**에서 상태 선택. 직접 생성·참여한 Mock 공간은 메모리에서만 유지하며 새로고침 시 초기화.
- 소식도 공간별 메모리 Mock이며 새로고침 시 초기화. 등록 오류 예시로 전환해도 입력은 유지되고 재등록은 정상 Mock 흐름으로 진행. 분석 재시도는 원문을 재등록하지 않고 기존 소식을 분석 중 표시로 변경. 분석 완료는 자동 발생하지 않으며 상단 상태 선택으로 UI만 확인. 직접 작성한 내용으로 제안을 생성하지 않음.

React Router의 Data 모드를 사용하며 `src/routes/Router.tsx`에서 URL을 등록한다. 잘못된 주소는 404 화면, 라우트 오류는 공통 오류 화면으로 처리한다. 뒤로가기는 앱 안에서 관측한 방문 이력이 있을 때만 이전 항목으로 이동하고, 직접 진입·새로고침 후에는 지정한 대체 경로를 사용한다. [라우팅·레이아웃 규격](src/routes/README.md) 참조.

현재 `.env.production`의 `VITE_ENABLE_MOCK_PREVIEW=true`로 Vercel Preview·Production에서도 로그인 → 시작 전 안내 → 공간 생성·선택 → 홈·초대 흐름을 확인할 수 있다. 로컬 개발 모드는 별도 설정이 없으면 Mock 미리보기가 켜진다. `src/lib/mockPreview.ts`에서 공통 판별하며, 실제 인증 상태·쿠키·토큰을 만들거나 계정·공간·동의 기록을 저장하지 않는다.

실제 인증·업무 데이터 연결 전에는 `VITE_ENABLE_MOCK_PREVIEW=false`로 변경하고 다시 빌드한다. 이 설정은 Mock 로그인 이동·공간 데이터·생성·참여·소식 조회/작성/재시도를 제어하며 실제 인증·접근 권한 검증을 대신하지 않는다. 개발용 컴포넌트 확인 화면의 코드와 경로는 계속 프로덕션 빌드에서 제외한다. [설정 우선순위와 검증 절차](docs/deployment.md) 참조.

## 공통 API와 서버 상태

Axios와 TanStack Query 기반을 사용한다. `.env.example`을 `.env.local`로 복사하면 API 서버 주소의 설정 예시를 확인할 수 있다. `VITE_API_BASE_URL`에는 서버 주소만 지정하고 `/api`는 도메인 요청 함수에 포함한다. 기존 Mock 화면은 API 주소 없이도 실행하며 실제 API 요청을 자동으로 시작하지 않는다.

공통 응답은 최신 BE의 `success/code/message/data/errors/timestamp` 규격을 따른다. 도메인 API 함수는 `features/{domain}/api/`, 조회·변경 훅과 캐시 키는 `model/`에 둔다. 내 정보 조회와 로그아웃의 사용 기반은 준비했으며 실제 로그인 화면·세션 가드는 후속 연결 대상이다. [설정·호출 예시·CSRF·오류·캐시 규칙](src/lib/api/README.md) 참조.

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

## PR 검사

`.github/workflows/ci.yml`은 base 브랜치 제한 없이 일반 PR과 스택 PR을 동일하게 검사한다. PR 생성(`opened`), 작업 브랜치에 새 커밋 push(`synchronize`), 다시 열기(`reopened`) 시 검사한다. 제목·본문 수정이나 라벨·담당자 변경으로는 CI 실행 기록을 생성하지 않는다.

base 브랜치 변경만으로는 CI가 실행되지 않는다. 스택 PR의 base를 변경한 뒤에는 작업 브랜치에 새 커밋을 push하거나 PR을 닫았다 다시 열어 새 base와의 조합을 검사한다. 이전 실행의 재실행은 당시 커밋을 사용하므로 새 base 기준 검사를 대신하지 않는다.

PR이 없는 작업 브랜치의 push나 로컬 커밋만으로는 GitHub CI가 실행되지 않는다. 로컬 Husky·lint-staged는 유지하며, CI에서는 `package.json`의 Node.js·pnpm 버전으로 `pnpm install --frozen-lockfile` → `pnpm check` → `pnpm build`를 실행한다. CI 전용 Secret이나 배포 권한은 사용하지 않는다.

검사 이름은 **Lint and build**다. 같은 PR에 새 CI 실행이 생기면 진행 중인 이전 CI를 취소하고 최신 변경을 검사한다. 서로 다른 PR의 실행은 취소하지 않는다. 기본 checkout으로 PR을 base에 합친 임시 결과를 검사하므로, 스택 PR도 해당 부모 브랜치와의 조합을 검증한다.

CI 실행과 머지 차단은 별도 설정이다. 첫 PR에서 **Lint and build** 실행 결과를 확인한 뒤 GitHub의 **Settings → Rules → Rulesets**에서 `dev`·`main`에 적용되는 규칙의 **Require status checks to pass**에 해당 검사를 추가한다. 기존 리뷰 승인 조건은 유지한다. 다른 작업 브랜치를 base로 하는 스택 PR은 CI가 실행되더라도, 필수 검사 규칙이 없다면 실패 시 머지가 자동으로 차단되지는 않는다.

CI 설정 도입 전에 분기한 스택 브랜치에서도 검사하려면 해당 PR의 코드에 `ci.yml`이 포함되도록 최신 설정을 반영한다. `dev`에 머지된 뒤의 검사·빌드·Production 배포는 기존 `deploy.yml`이 담당한다.

## 배포

[배포 화면 열기](https://hanmaum-frontend.vercel.app/) — 현재는 실제 로그인·API 연결 전의 UI 미리보기.

작업 브랜치는 Vercel Git 연동으로 Preview를 빌드·배포한다. `dev`는 `.github/workflows/deploy.yml`에서 검사와 빌드를 실행한 뒤 Vercel Production으로 배포하며, 빌드·배포 로그는 GitHub Actions에서 확인한다. 이 설정이 `dev`에 반영된 이후부터 적용한다.

`vercel.json`에 빌드·출력 경로와 SPA rewrite, `dev`의 Git 자동 배포 제외 설정을 정의한다. Node.js 24.x와 pnpm 10.18.2를 유지하며, Vercel에는 `ENABLE_EXPERIMENTAL_COREPACK=1` 설정이 필요하다. Actions에는 Vercel Secrets 3개를 등록하고, Discord 알림은 기존 GitHub 저장소 웹훅을 사용한다. [배포 설정과 검증 절차](docs/deployment.md) 참조.
