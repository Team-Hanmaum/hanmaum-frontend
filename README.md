# 한마음 Frontend

React · TypeScript · Vite · Tailwind CSS 기반의 휴대폰 중심 웹앱.

## 실행

Node.js 24.x, pnpm 10.18.2 사용.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

**배포 BE와 로컬에서 연동할 팀원은 최초 1회 [로컬 HTTPS 설정](docs/local-development.md)을 진행한다.** mkcert 설치 후 `pnpm setup:local`을 실행하면 hosts·인증서·개발 환경 파일을 준비한다. 이후 기존 `pnpm dev`로 실행하고 `https://local.hanmaum.site:5173`에 접속한다. BE의 개발 Origin CORS와 로그인 복귀 분기 반영도 필요하다.

- `/`: 랜딩 → 로그인. `/login`은 BE OAuth로 이동한다.
- `/auth/callback`: 내 정보 확인 → 저장된 내부 주소 또는 참여 공간. 공간 한 곳이면 홈, 0곳/여러 곳이면 목록으로 이동한다.
- `/spaces`, `/spaces/new`: 실제 참여 공간 조회·생성. 생성 후 해당 홈으로 이동한다.
- `/spaces/:careSpaceId/home`: 실제 공간 상세·가족·현황판·최근 소식을 조합한다. 없는 데이터는 빈 상태, 실패한 조회는 오류/재시도로 표시한다.
- `/spaces/:careSpaceId/news`, `news/new`, `news/:recordId`: 실제 소식 목록(커서 더 보기)·작성·상세를 조회한다. 작성 요청 ID는 같은 원문의 재시도 동안 유지하고, 상세는 분석 대기·진행 중일 때 상태를 다시 확인하며 최신 실패 실행은 재시도할 수 있다. 분석 후 제안 검토로 이동한다. 원본 삭제 영향 조회·삭제 결과·영향받은 돌봄의 근거 재확인도 실제 API를 사용한다.
- `/spaces/:careSpaceId/proposals`, `news/:recordId/proposals`: 실제 제안 목록·검토·근거·수정 초안·후보 선택. 소유자는 최종 반영/미반영, 구성원은 요청 제출/취소를 진행한다. 가족 요청 탭에서 소유자가 AI 제안 요청을 승인/미반영한다. 기존 항목은 편집 잠금과 버전을 확인하고 응답 유실 시 같은 요청으로 재시도한다.
- `/spaces/:careSpaceId/care`, `care/items/:itemId`: 실제 돌봄 목록·상세·근거·변경 이력을 조회한다. 직접 추가·수정·상태 변경·답변·삭제와 구성원 승인 요청을 처리한다. 반영 후 홈·소식·제안·요청·돌봄 캐시를 갱신한다. 결과 URL은 처리한 제안 ID로 저장된 결정을 재조회한다.
- `/spaces/:careSpaceId/family`: 실제 구성원 목록과 역할을 조회하고 내보내기·소유권 이전·나가기·공간 삭제를 처리한다.
- `/spaces/:careSpaceId/all`, `info`: 전체 메뉴와 공간 정보 수정·구성원 수정 요청·소유자 승인/미적용을 연결한다. `/account`에서는 실제 계정·로그아웃·탈퇴와 탈퇴 전 공간·소식 정리를 진행한다.
- `/spaces/:careSpaceId/invite`, `/invitations/:invitationToken`: 실제 초대 링크 발급(진입 시 1회, 실패 재시도는 같은 요청 ID, 만료 후 새 링크는 새 요청 ID)과 로그인 후 초대 확인·참여. 만료(410)·사용 불가(404·403)·이미 참여 중을 구분하고 참여 성공 시 해당 공간 홈으로 이동한다. 운영 BE는 `https://hanmaum.site/invitations/{token}` 링크를 발급하므로 로컬 검증은 토큰을 로컬 주소에 붙여 확인한다.
- `care/items/:itemId/share`, `/share/:token`: 공유 링크 발급·복사·카카오톡 공유와 로그인·참여 권한 확인 후 실제 항목 조회. 카카오 JavaScript 키 설정은 [배포 문서](docs/deployment.md#카카오톡-돌봄-공유-설정-71)를 따른다.
- `/_dev/components`: 개발 전용 공통 컴포넌트 전시 화면. 제품 흐름과 별도로 공통 UI 상태를 확인한다.

로컬과 배포 모두 업무 화면은 실제 API를 사용한다. Mock 저장소·예시 화면 분기·미연동 배지는 제거했으며, 빈 목록과 오류는 실제 조회 결과대로 표시한다. 랜딩의 사용 예시와 로컬 공통 컴포넌트 전시용 데이터만 유지한다. `VITE_ENABLE_MOCK_PREVIEW` 설정은 제거했으므로 기존 개인 환경 파일이나 Vercel에 남은 값도 사용하지 않는다. `pnpm setup:local` 또는 로컬 BE용 `.env.example`을 참고해 API 주소를 설정한다. 개발 환경 파일은 Production 빌드에 적용되지 않는다.

탭 복귀는 기존 화면과 입력을 유지한다. 60초 이내의 단순 복귀 확인은 생략하며, 미확인 상태의 보호 API 요청은 먼저 계정을 재검증한다. 다른 계정이면 이전 요청·캐시·화면 상태를 정리한다. 일시적 통신 실패는 작은 재시도 안내로 표시한다. 401 만료 시에는 로그인으로 이동하며 저장하지 않은 입력은 다시 입력해야 한다.

React Router의 Data 모드를 사용한다. [라우팅·레이아웃 규격](src/routes/README.md), [API·세션 규격](src/lib/api/README.md), [배포 설정](docs/deployment.md) 참조.

### QA 도구 표시

`VITE_ENABLE_QA_TOOLS=true`인 환경에서 `?qa=1`로 도구를 켜고 같은 탭에서 유지한다. QA 종료 또는 `?qa=0`으로 종료한다. Production은 false가 기본이며 `qa=1`도 무시한다. 실제 응답·권한을 바꾸는 Mock 상태 선택기는 제공하지 않는다. 표현 상태 비교는 로컬 `/_dev/components`에서 확인한다.

## 홈 화면 설치 (PWA)

`public/manifest.webmanifest`와 `index.html`의 매니페스트·Apple 메타 정보를 사용한다. 설치 앱 이름은 **한마음**, 시작 주소와 범위는 `/`, 표시 모드는 `standalone`이다. 온라인 사용을 전제로 하며 서비스 워커·오프라인 데이터 캐시·푸시 알림은 포함하지 않는다. 사용자 데이터는 BE에서 조회하며 오프라인 저장을 제공하지 않는다.

- 모바일의 랜딩·로그인·공간 선택·기본 탭에서 설치 안내를 자동으로 표시한다. 입력 요소에 포커스가 있거나 다른 모달이 열려 있으면 안내를 미룬다. 작성·승인·탈퇴 하위 화면에서는 자동으로 열지 않는다.
- 설치 이벤트를 제공하는 브라우저에서는 **한마음 설치하기**를 누른 뒤 브라우저 설치 창에서 확인한다. 이벤트가 없으면 기기별 브라우저 메뉴 안내를 표시한다. iOS는 Safari의 공유 → 홈 화면에 추가 절차이며, 사이트가 OS 설치 창을 자동으로 띄우는 기능이 아니다.
- 닫기·확인은 같은 탭에서 안내를 숨기고, **다시 보지 않기**는 해당 브라우저에 저장한다. 저장소를 사용할 수 없으면 현재 실행 중에만 숨긴다. **전체 → 한마음 설치**에서 숨김 선택과 무관하게 다시 확인할 수 있다.
- 홈 화면 앱으로 실행 중이거나 현재 실행 중 설치를 완료한 경우 안내와 설치 메뉴를 숨긴다.
- `getInstalledRelatedApps()` 지원 브라우저에서는 한마음 PWA가 설치됐는지 조회한다. 확인되면 기본 진입 화면과 탭의 헤더 아래에 **한마음이 이미 설치되어 있어요** 배너를 표시하고 설치 팝업·메뉴를 숨긴다. 배너를 닫으면 같은 탭의 이동·새로고침에도 숨김을 유지한다. 설치 안내의 **다시 보지 않기**와 별도 저장한다.
- 앱 실행 중에는 배너를 표시하지 않는다. 설치 조회가 미지원·실패·시간 초과인 경우 설치됨으로 단정하지 않고 기존 안내를 유지한다. iOS의 공유 → 홈 화면에 추가 안내도 유지한다. 일반 브라우저 탭으로 돌아오면 설치 여부를 다시 조회한다.
- 매니페스트의 `related_applications`는 현재 서비스 주소 `https://hanmaumcare.vercel.app/`의 앱 ID와 매니페스트를 가리킨다. 데스크톱 조회에는 절대 앱 ID가 필요하므로 서비스 도메인을 변경하면 이 값도 변경한다. 로컬·Preview에서의 실제 설치 감지는 플랫폼별로 다를 수 있으며 배너 동작 검증과 실제 설치 감지를 구분한다. [브라우저 지원 및 매니페스트 설정](https://developer.chrome.com/docs/capabilities/get-installed-related-apps)
- 아이콘은 기존 `public/hanmaum-favicon.svg`에서 생성한 192·512px PNG, 512px 마스커블, 180px Apple 아이콘이다. 일반·Apple 아이콘은 원본 viewBox의 `150 150 700 700` 영역, 마스커블은 원본 전체 여백을 유지하며 모두 흰색 불투명 배경을 사용한다.

설치 검증은 HTTPS 배포 주소 또는 localhost에서 진행한다. 같은 Wi-Fi의 HTTP PC 주소에서는 설치 기능이 제한될 수 있다. Android Chrome·iOS Safari 실제 기기에서 홈 화면 아이콘, 앱 실행, 안전 영역, 외부 링크 복귀를 최종 확인한다. 브라우저 설치 조건에 따라 네이티브 설치 버튼의 노출 시점은 달라질 수 있다.

## 공통 API와 서버 상태

Axios와 TanStack Query 기반을 사용한다. `.env.example`은 로컬 BE 연결 예시이며 `.env.development.local`로 복사한다. 배포 BE 연결은 [로컬 HTTPS 설정](docs/local-development.md)을 따른다. `VITE_API_BASE_URL`에는 서버 주소만 지정하고 `/api`는 도메인 요청 함수에 포함한다. 앱 실행 시 실제 세션을 확인하므로 API 주소 설정이 필요하다.

공통 응답은 최신 BE의 `success/code/message/data/errors/timestamp` 규격을 따른다. 도메인 API 함수는 `features/{domain}/api/`, 조회·변경 훅과 캐시 키는 `model/`에 둔다. 내 정보·로그아웃·세션 가드를 연결했으며 로그인 상태는 `useSession`에서 공통 관리한다. 로그인 성공 복귀 URL은 BE에서도 `/auth/callback`으로 설정해야 한다. [설정·호출 예시·CSRF·오류·캐시 규칙](src/lib/api/README.md) 참조.

도메인 `api/` 안에서는 같은 기능 접두사의 `*Types.ts`(DTO), `*Validators.ts`(응답 검증), `*Api.ts`(요청 함수)로 분리한다. Query 훅·키·화면용 변환은 `model/`에서 관리한다. 신규 연동 시 [API 파일 규칙](AGENTS.md#api-파일-규칙)을 따른다.

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

## 페이지 구성

`src/pages/`는 화면 영역별로 묶고, 관련된 페이지 파일을 같은 폴더에 둔다. 예를 들어 `care/`에는 돌봄 목록·상세·근거·이력 페이지를 두며, 변경 요청과 공유 흐름은 각각 `care/change/`, `care/share/`로 묶는다. `news/`, `proposal/`, `space/`도 각 영역의 페이지를 모은다.

여러 페이지에서 재사용하는 도메인 UI와 상태는 `features/`, 범용 UI는 `components/`에 둔다. 시간 선택 UI는 `features/careitem/ui/CareTimeSelection.tsx`에서 공유하며, 호출 화면이 레이아웃과 이동을 연결한다. `features`와 `components`는 `pages`를 가져오지 않는다.

폴더 경로는 URL을 결정하지 않는다. 기존 주소는 `src/routes/Router.tsx`와 `src/routes/paths.ts`에서 관리한다. 새 페이지를 추가할 때는 [AGENTS.md의 페이지 폴더 규칙](AGENTS.md#페이지-폴더-규칙)을 따른다.

업무 페이지 이름은 `HomePage`, `CarePage`처럼 사용한다. API 연동 구분용 `Connected` 접두사와 페이지별 Mock/실제 `*Routes.tsx` 분기를 제거했으며 라우터에서 실제 페이지를 직접 연결한다. 계정·공간·소식별 상태를 초기화하는 레이아웃과 초대 페이지의 key는 유지한다.

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

[배포 화면 열기](https://hanmaum.site/) — 실제 인증 연결은 BE 성공 복귀 URL과 Vercel 환경 변수 설정을 함께 확인한다.

작업 브랜치는 Vercel Git 연동으로 Preview를 빌드·배포한다. `dev`는 `.github/workflows/deploy.yml`에서 검사와 빌드를 실행한 뒤 Vercel Production으로 배포하며, 빌드·배포 로그는 GitHub Actions에서 확인한다. 이 설정이 `dev`에 반영된 이후부터 적용한다.

`vercel.json`에 빌드·출력 경로와 SPA rewrite, `dev`의 Git 자동 배포 제외 설정을 정의한다. Node.js 24.x와 pnpm 10.18.2를 유지하며, Vercel에는 `ENABLE_EXPERIMENTAL_COREPACK=1` 설정이 필요하다. Actions에는 Vercel Secrets 3개를 등록하고, Discord 알림은 기존 GitHub 저장소 웹훅을 사용한다. [배포 설정과 검증 절차](docs/deployment.md) 참조.
